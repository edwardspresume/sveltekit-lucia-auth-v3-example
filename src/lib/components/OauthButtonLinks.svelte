<script>
	import { route } from '$lib/ROUTES';

	import Button from './ui/button/button.svelte';
</script>

<div class="flex flex-wrap gap-4">
	<Button class="flex-grow gap-2 font-bold " href={route('GET /auth/oauth/google')}>
		<iconify-icon icon="mdi:google" width="25"></iconify-icon>
		<span>Google</span>
	</Button>

	<Button class="flex-grow gap-2 font-bold " href={route('GET /auth/oauth/github')}>
		<iconify-icon icon="mdi:github" width="25"></iconify-icon>
		<span>Github</span>
	</Button>
</div>
