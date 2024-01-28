<script lang="ts">
	import type { PageData } from './$types';

	import { route } from '$lib/ROUTES';

	import SubmitButton from '$components/form/SubmitButton.svelte';

	export let data: PageData;
</script>

<h1 class="mb-5 text-2xl">
	Hello <span class="font-bold">{data.loggedOnUserName}</span>
</h1>

<form method="post" action={route('logout /dashboard')}>
	<SubmitButton>Logout</SubmitButton>
</form>
