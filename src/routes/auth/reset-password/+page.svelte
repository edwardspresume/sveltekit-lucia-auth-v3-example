<script lang="ts">
	import type { PageData } from './$types';

	import { route } from '$lib/ROUTES';

	import PasswordResetForm from '$components/form/PasswordResetForm.svelte';
	import Button from '$components/ui/button/button.svelte';

	export let data: PageData;
</script>

{#if data.passwordResetTokenStatus.isValid === false}
	<h1 class="mb-5 text-2xl font-bold text-red-600">
		{data.passwordResetTokenStatus.message}
	</h1>

	<Button href={route('/auth/login')}>Return to Login Page to Request a New Code</Button>
{:else}
	<h1 class="mb-6 text-2xl font-bold leading-none">Reset Password</h1>

	<PasswordResetForm
		formData={data.passwordResetFormData}
		formAction={route('resetPassword /auth/reset-password')}
		isPasswordResetTokenRequired={true}
	/>
{/if}
