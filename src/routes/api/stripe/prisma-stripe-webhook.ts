import { json, type RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';
// import { prisma }  from '$lib/database/prisma';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '$env/static/private';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20'
});

export const POST: RequestHandler = async ({ request }) => {
  const sig = request.headers.get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return json({ error: 'Webhook Error: ' + err.message }, { status: 400 });
  }

  if (event.type === 'invoice.payment_succeeded') {
    // const invoice = event.data.object;
    // const subscriptionId = invoice.subscription;
    // const amountPaid = invoice.amount_paid;
    // const currency = invoice.currency;
    // const paymentIntentId = invoice.payment_intent;

  //   // Update the transactions and subscriptions table
  //   await prisma.transaction.create({
  //     data: {
  //       subscriptionId,
  //       amountCents: amountPaid,
  //       currency,
  //       status: 'SUCCEEDED',
  //       stripePaymentIntentId: paymentIntentId,
  //     }
  //   });

  //   await prisma.subscription.update({
  //     where: { id: subscriptionId },
  //     data: { status: 'ACTIVE' },
  //   });
  }

  // if (event.type === 'invoice.payment_failed') {
  //   const invoice = event.data.object;
  //   const subscriptionId = invoice.subscription;

  //   // Update the subscriptions table
  //   await prisma.subscription.update({
  //     where: { id: subscriptionId },
  //     data: { status: 'PAST_DUE' },
  //   });
  // }

  return json({ received: true });
};
