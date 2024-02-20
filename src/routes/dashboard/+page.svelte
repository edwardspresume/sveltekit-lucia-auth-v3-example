<script lang="ts">
	import type { PageData } from './$types';

	import { route } from '$lib/ROUTES';

	import PasswordResetForm from '$components/form/PasswordResetForm.svelte';
	import SubmitButton from '$components/form/SubmitButton.svelte';
	import { buttonVariants } from '$components/ui/button';
	import * as Dialog from '$components/ui/dialog';

	export let data: PageData;
</script>

<div>
	<section>
		<h1 class="mb-5 text-2xl">
			Hello <span class="font-bold">{data.loggedInUserName}</span>
		</h1>

		<div class="flex gap-2">
			<form method="post" action={route('logout /dashboard')}>
				<SubmitButton>Logout</SubmitButton>
			</form>

			<Dialog.Root>
				<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>
					Reset Password
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Password Reset</Dialog.Title>
						<Dialog.Description>Please enter your new password.</Dialog.Description>
					</Dialog.Header>

					<PasswordResetForm
						formData={data.passwordResetFormData}
						formAction={route('resetPassword /dashboard')}
					/>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	</section>

	<hr class="my-8" />

	<section class="mt-4 max-w-md">
		<header class="mb-9 flex flex-wrap items-center justify-between gap-3">
			<h2 class="text-xl font-bold leading-none">List of all register users</h2>

			<form method="post" action={route('deleteAllUsers /dashboard')}>
				<SubmitButton>Delete all users</SubmitButton>
			</form>
		</header>

		<ul class="space-y-4">
			{#each data.allUsers as user}
				<li class="rounded bg-accent p-2">
					{user.name} - {user.email}
				</li>
			{/each}
		</ul>
	</section>
</div>
