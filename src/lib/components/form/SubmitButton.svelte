<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils/styleTransitionUtils';

	import Button from '$components/ui/button/button.svelte';

	let className: HTMLButtonAttributes['class'] = undefined;

	export { className as class };
	export let disabled: boolean = false;
	export let showSpinner: boolean | null = null;
</script>

<Button
	{disabled}
	type="submit"
	aria-disabled={disabled}
	class={cn('gap-2 text-xl font-medium', className)}
>
	{#if showSpinner === null ? disabled : showSpinner}
		<iconify-icon icon="eos-icons:bubble-loading"></iconify-icon>
	{/if}

	<span>
		<slot>Submit</slot>
	</span>
</Button>
