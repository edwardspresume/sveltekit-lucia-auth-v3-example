import Stripe from 'stripe';
import { STRIPE_SECRET_KEY_LIVE, STRIPE_SECRET_KEY } from '$env/static/private';

export const stripe = new Stripe(STRIPE_SECRET_KEY_LIVE ?? STRIPE_SECRET_KEY ?? '', {
	// https://github.com/stripe/stripe-node#configuration
	apiVersion: '2024-06-20'
	// Register this as an official Stripe plugin.
	// https://stripe.com/docs/building-plugins#setappinfo
	// appInfo: {
	// 	name: 'SvelteKit Subscription Starter',
	// 	version: '0.0.1'
	// }
});
