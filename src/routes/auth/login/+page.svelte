<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms/client';

	import { UserLoginZodSchema } from '$validations/UserLoginZodSchema';

	import InputField from '$components/form/InputField.svelte';
	import SubmitButton from '$components/form/SubmitButton.svelte';

	import { route } from '$lib/ROUTES';
	import type { PageData } from './$types';

	export let data: PageData;

	const { enhance, form, errors, message } = superForm(data.userLoginFormData, {
		resetForm: true,
		taintedMessage: null,
		validators: UserLoginZodSchema,

		onUpdated: () => {
			if (!$message) return;

			const { alertType, alertText } = $message;

			if (alertType === 'error') {
				toast.error(alertText);
			}
		}
	});
</script>

<h1 class="mb-6 text-2xl font-bold leading-none">Login</h1>

<form method="post" use:enhance action={route('logInUser /auth/login')} class="space-y-4">
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
