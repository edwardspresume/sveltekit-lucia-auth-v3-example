<script lang="ts">
	import { loadStripe } from '@stripe/stripe-js';
	import { onMount } from 'svelte';
	import { VITE_STRIPE_PUBLIC_KEY } from '$env/static/private';

	type Product = {
		id: string;
		name: string;
		price: number;
	};

	let stripe: any;
	let products: Product[];
	let selectedProduct: Product;
	let email: string;

	onMount(async () => {
		stripe = await loadStripe(VITE_STRIPE_PUBLIC_KEY);
	});

	async function subscribe() {
		const { error, paymentMethod } = await stripe.createPaymentMethod({
			type: 'card',
			card: {
				number: '4242424242424242',
				exp_month: 12,
				exp_year: 2024,
				cvc: '123'
			}
		});

		if (error) {
			console.error(error);
			return;
		}

		const response = await fetch('/api/create-subscription', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email,
				paymentMethodId: paymentMethod.id,
				priceId: selectedProduct.id
			})
		});

		const subscription = await response.json();
		console.log(subscription);
	}
</script>

<main>
	<h1>Subscribe to a Plan</h1>
	<div>
		{#each products as product}
			<label>
				<input type="radio" name="product" value={product.id} bind:group={selectedProduct} />
				{product.name} - ${product.price}/month
			</label>
		{/each}
	</div>
	<div>
		<input type="email" placeholder="Email" bind:value={email} />
	</div>
	<button on:click={subscribe}>Subscribe</button>
</main>
