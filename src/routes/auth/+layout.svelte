<script lang="ts">
	import { page } from '$app/stores';
	import { route } from '$lib/ROUTES';

	import login_page from '$lib/assets/login_page.jpg?enhanced';
	import register_page from '$lib/assets/register_page.jpg?enhanced';

	const images = {
		[route('/auth/register')]: register_page,
		[route('/auth/login')]: login_page
	};

	$: currentPageImage = images[$page.url.pathname];
</script>

<div class="md:grid md:grid-cols-[1fr,1.6fr] md:gap-8">
	<enhanced:img
		alt="An alt text"
		src={currentPageImage}
		class="hidden rounded shadow-md md:block"
	/>

	<section class="md:max-w-xl">
		<slot />
	</section>
</div>
