<script>
	import { route } from '$lib/ROUTES';

	import Button from '$components/ui/button/button.svelte';
	import SiteMainNav from './SiteMainNav.svelte';
	import SiteMainNavMenuToggleBtn from './SiteMainNavMenuToggleBtn.svelte';
	import ThemeToggler from './ThemeToggler.svelte';
</script>

<header class="relative mb-10 border-b">
	<div class="container flex items-center justify-between p-2">
		<Button href={route('/')} variant="link" class="p-0 text-2xl font-bold">Logo</Button>

		<div class="flex gap-2">
			<SiteMainNav />
			<ThemeToggler />
			<SiteMainNavMenuToggleBtn />
		</div>
	</div>
</header>
