<script lang="ts">
	import { page } from '$app/stores';
	import { route } from '$lib/ROUTES';

	import loginPageImgSrc from '$assets/login_page.jpg?enhanced';
	import registerPageImgSrc from '$assets/register_page.jpg?enhanced';

	const images = {
		[route('/auth/login')]: {
			src: loginPageImgSrc,
			alt: 'A login page image'
		},

		[route('/auth/register')]: {
			src: registerPageImgSrc,
			alt: 'A register page image'
		}
	};

	$: currentPageImage = images[$page.url.pathname];
</script>

<div class="md:grid md:grid-cols-[1fr,1.6fr] md:gap-8">
	<enhanced:img
		src={currentPageImage?.src}
		alt={currentPageImage?.alt}
		class="hidden rounded shadow-md md:block"
	/>

	<section class="md:max-w-xl">
		<slot />
	</section>
</div>
