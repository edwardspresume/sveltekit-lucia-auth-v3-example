import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

// initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY);

// handle POST /create-payment-intent
export async function POST() {
	// create the payment intent
	const paymentIntent = await stripe.paymentIntents.create({
		amount: 2000,
		// note, for some EU-only payment methods it must be EUR
		currency: 'usd',
		// specify what payment methods are allowed
		// can be card, sepa_debit, ideal, etc...
		payment_method_types: ['card']
	});

	// return the clientSecret to the client
	return {
		body: {
			clientSecret: paymentIntent.client_secret
		}
	};
}
