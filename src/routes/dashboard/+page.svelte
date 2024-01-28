<script lang="ts">
	import type { PageData } from './$types';

	import { route } from '$lib/ROUTES';

	import SubmitButton from '$components/form/SubmitButton.svelte';

	export let data: PageData;
</script>

<div>
	<section>
		<h1 class="mb-5 text-2xl">
			Hello <span class="font-bold">{data.loggedInUserName}</span>
		</h1>

		<form method="post" action={route('logout /dashboard')}>
			<SubmitButton>Logout</SubmitButton>
		</form>
	</section>

	<hr class="my-8" />

	<section class="max-w-md mt-4">
		<header class="flex flex-wrap items-center justify-between gap-3 mb-9">
			<h2 class="text-xl font-bold leading-none">List of all register users</h2>

			<form method="post" action={route('deleteAllUsers /dashboard')}>
				<SubmitButton>Delete all users</SubmitButton>
			</form>
		</header>

		<ul class="space-y-4">
			{#each data.allUsers as user}
				<li class="p-2 rounded bg-accent">
					{user.name} - {user.email}
				</li>
			{/each}
		</ul>
	</section>
</div>
