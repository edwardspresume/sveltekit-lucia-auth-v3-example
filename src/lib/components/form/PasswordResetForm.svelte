<script lang="ts">
	import { page } from '$app/stores';

	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms/client';

	import { MAX_PASSWORD_LENGTH, PasswordResetZodSchema } from '$validations/AuthZodSchemas';

	import InputField from './InputField.svelte';
	import SubmitButton from './SubmitButton.svelte';

	export let formData: SuperValidated<typeof PasswordResetZodSchema>;
	export let formAction: string;
	export let isPasswordResetTokenRequired: boolean = false;

	const { enhance, form, errors, message, delayed } = superForm(formData, {
		resetForm: true,
		taintedMessage: null,
		validators: PasswordResetZodSchema,

		onUpdated: () => {
			if (!$message) return;

			const { alertType, alertText } = $message;

			if (alertType === 'error') {
				toast.error(alertText);
			}

			if (alertType === 'success') {
				toast.success(alertText);
			}
		}
	});
</script>

<form use:enhance method="post" class="space-y-4" action={formAction}>
	<InputField
		type="password"
		name="newPassword"
		label="New Password"
		bind:value={$form.newPassword}
		errorMessage={$errors.newPassword}
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

	{#if isPasswordResetTokenRequired}
		<InputField
			type="hidden"
			name="passwordResetToken"
			value={$page.url.searchParams.get('token')}
		/>
	{/if}

	<SubmitButton disabled={$delayed} />
</form>
