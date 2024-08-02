import { json, type RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY_LIVE, STRIPE_SECRET_KEY } from '$env/static/private';

const stripe = new Stripe(STRIPE_SECRET_KEY_LIVE ?? STRIPE_SECRET_KEY);

interface SubscriptionRequest {
    email: string;
    paymentMethodId: string;
    priceId: string;
  }

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json() as SubscriptionRequest;
  const { email, paymentMethodId, priceId } = body;

  // Create a customer
  const customer = await stripe.customers.create({
    email,
    payment_method: paymentMethodId,
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  // Create a subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    expand: ['latest_invoice.payment_intent'],
  });

  return json(subscription);
}