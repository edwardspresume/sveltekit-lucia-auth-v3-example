import { stripe } from '$lib/stripe'
import { env } from '$env/dynamic/private'

export async function load({ url, cookies }) {
  // pull customerId from cookie
  const customerId = cookies.get('customerId')!
  // pull priceId from URL
  const priceId = url.searchParams.get('priceId')!

  // create the subscription
  // status is `incomplete` until payment succeeds
    // Create a subscription
    try {
    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
  
      // Ensure latest_invoice and payment_intent are properly expanded
      if (
        typeof subscription.latest_invoice !== 'string' &&
        subscription.latest_invoice &&
        subscription.latest_invoice.payment_intent &&
        typeof subscription.latest_invoice.payment_intent !== 'string'
      ) {
        return {
          clientSecret: subscription.latest_invoice.payment_intent.client_secret,
          returnUrl: new URL('/checkout/complete', env.DOMAIN).toString(),
        };
      } else {
        throw new Error('Payment intent not found');
      }
    } catch (error: any) {
      return { error: error.message };
    }
}