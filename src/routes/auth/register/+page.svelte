<script lang="ts">
	import type { PageData } from './$types';

	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms/client';

	import { route } from '$lib/ROUTES';
	import { MAX_NAME_LENGTH, RegisterUserZodSchema } from '$validations/RegisterUserZodSchema';

	import InputField from '$components/form/InputField.svelte';
	import SubmitButton from '$components/form/SubmitButton.svelte';

	export let data: PageData;

	const { enhance, errors, form, message } = superForm(data.registerUserFormData, {
		resetForm: true,
		taintedMessage: null,
		validators: RegisterUserZodSchema,

		onUpdated: () => {
			if (!$message) return;

			const { alertType, alertText } = $message;

			if (alertType === 'success') {
				toast.success(alertText);
			}

			if (alertType === 'error') {
				toast.error(alertText);
			}
		}
	});
</script>

<div class="space-y-4 sm:grid sm:grid-cols-2 sm:justify-between sm:gap-10">
	<section>
		<h2 class="mb-4 text-2xl font-bold">Register</h2>

		<form method="post" use:enhance class="space-y-4" action={route('registerUser /auth/register')}>
			<InputField
				type="text"
				name="name"
				label="Name"
				bind:value={$form.name}
				errorMessage={$errors.name}
				maxlength={MAX_NAME_LENGTH}
			/>

			<InputField
				type="email"
				name="email"
				label="Email"
				bind:value={$form.email}
				errorMessage={$errors.email}
			/>

			<InputField
				type="password"
				name="password"
				label="Password"
				bind:value={$form.password}
				errorMessage={$errors.password}
			/>

			<SubmitButton />
		</form>
	</section>

	<hr class="sm:hidden" />

	<section>
		<header class="flex flex-wrap justify-between gap-3">
			<h2 class="mb-4 text-2xl font-bold">Registered users</h2>

			<form method="post" action={route('deleteAllUsers /auth/register')}>
				<SubmitButton>Delete all users</SubmitButton>
			</form>
		</header>

		{#if data.allUsers}
			<ul class="mt-4 space-y-4">
				{#each data.allUsers as user}
					<li class="p-2 rounded bg-accent">
						{user.name} - {user.email}
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
