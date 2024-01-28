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

<h1 class="mb-6 text-2xl font-bold leading-none">Register</h1>

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
