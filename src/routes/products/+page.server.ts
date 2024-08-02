export async function load() {
    // Fetch your product data from your backend or Stripe API
    const products = [
        { id: 'prod_free', name: 'Free', price: '0' },
        { id: 'prod_basic', name: 'Basic', price: '10' },
        { id: 'prod_pro', name: 'Pro', price: '20' }
    ];
    return { props: { products } };
}
