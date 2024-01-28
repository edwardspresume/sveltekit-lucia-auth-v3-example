<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	import type { EnterKeyHintType } from '$lib/types';
	import { cn } from '$lib/utils/styleTransitionUtils';

	let className: HTMLInputAttributes['class'] = undefined;
	export { className as class };
	export let type: HTMLInputAttributes['type'];
	export let value: string | null | undefined = '';
	export let name: string = '';
	export let label: string = '';
	export let placeholder: string = '';
	export let spellcheck: boolean = true;
	export let autocomplete: string = 'on';
	export let enterkeyhint: EnterKeyHintType = 'next';
	export let maxlength: number | undefined = undefined;
	export let errorMessage: object | undefined = undefined;

	$: valueLength = value?.length;
</script>

<label
	class="grid gap-1 text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
>
	<div>
		<span>{label}</span>

		{#if maxlength}
			<span class="text-xs text-muted-foreground">
				{valueLength}/{maxlength}
			</span>
		{/if}
	</div>

	{#if errorMessage}
		<p class="text-red-500">{errorMessage}</p>
	{/if}

	<input
		{name}
		{...{ type }}
		dir="auto"
		bind:value
		{maxlength}
		{spellcheck}
		{placeholder}
		{autocomplete}
		{enterkeyhint}
		aria-label={label}
		class={cn('rounded border bg-transparent px-3 py-2', className)}
		aria-invalid={errorMessage ? 'true' : undefined}
		{...$$restProps}
	/>
</label>
