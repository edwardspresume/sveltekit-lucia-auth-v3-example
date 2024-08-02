import { json, type RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_SECRET_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20'
});

const supabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY);

export const POST: RequestHandler = async ({ request }) => {
  const sig = request.headers.get('stripe-signature')!

  let event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return json({ error: 'Webhook Error: ' + err.message }, { status: 400 });
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    const amountPaid = invoice.amount_paid;
    const currency = invoice.currency;
    const paymentIntentId = invoice.payment_intent;

    // Update the transactions and subscriptions table
    await supabase.from('transactions').insert([
      {
        subscription_id: subscriptionId,
        amount_cents: amountPaid,
        currency: currency,
        status: 'succeeded',
        stripe_payment_intent_id: paymentIntentId
      }
    ]);

    await supabase.from('subscriptions')
      .update({ status: 'active' })
      .eq('id', subscriptionId);
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;

    // Update the subscriptions table
    await supabase.from('subscriptions')
      .update({ status: 'past_due' })
      .eq('id', subscriptionId);
  }

  return json({ received: true });
};
