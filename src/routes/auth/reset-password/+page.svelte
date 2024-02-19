<script lang="ts">
	import type { PageData } from './$types';

	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms/client';

	import { route } from '$lib/ROUTES';
	import { MAX_PASSWORD_LENGTH, PasswordResetZodSchema } from '$validations/AuthZodSchemas';

	import InputField from '$components/form/InputField.svelte';
	import SubmitButton from '$components/form/SubmitButton.svelte';

	export let data: PageData;

	const { enhance, form, errors, message } = superForm(data.passwordResetFormData, {
		resetForm: true,
		taintedMessage: null,
		validators: PasswordResetZodSchema,

		onUpdated: () => {
			if (!$message) return;

			const { alertType, alertText } = $message;

			if (alertType === 'error') {
				toast.error(alertText);
			}
		}
	});
</script>

<h1 class="mb-6 text-2xl font-bold leading-none">Reset Password</h1>

<form
	use:enhance
	method="post"
	class="space-y-4"
	action={route('resetPassword /auth/reset-password')}
>
	<InputField
		type="password"
		name="password"
		label="Password"
		bind:value={$form.password}
		errorMessage={$errors.password}
		maxlength={MAX_PASSWORD_LENGTH}
	/>

	<InputField
		type="password"
		name="confirmPassword"
		label="Confirm Password"
		bind:value={$form.confirmPassword}
		errorMessage={$errors.confirmPassword}
		maxlength={MAX_PASSWORD_LENGTH}
	/>

	<SubmitButton />
</form>
