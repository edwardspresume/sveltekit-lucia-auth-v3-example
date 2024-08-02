import Stripe from 'stripe';
import { STRIPE_SECRET } from '$env/static/private';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE ?? STRIPE_SECRET ?? '', {
	// https://github.com/stripe/stripe-node#configuration
	apiVersion: '2022-11-15'
	// Register this as an official Stripe plugin.
	// https://stripe.com/docs/building-plugins#setappinfo
	// appInfo: {
	// 	name: 'SvelteKit Subscription Starter',
	// 	version: '0.0.1'
	// }
});
