<script lang="ts">
	import { resetMode, setMode } from 'mode-watcher';

	import Button from '$components/ui/button/button.svelte';
	import * as DropdownMenu from '$components/ui/dropdown-menu';
</script>

<DropdownMenu.Root positioning={{ placement: 'bottom-end' }}>
	<DropdownMenu.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" size="icon" class="text-2xl">
			<iconify-icon icon="line-md:sun-rising-loop" class="dark:hidden"></iconify-icon>
			<iconify-icon icon="line-md:moon-rising-loop" class="hidden dark:block"></iconify-icon>

			<span class="sr-only">Toggle theme</span>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Item on:click={() => setMode('light')}>Light</DropdownMenu.Item>
		<DropdownMenu.Item on:click={() => setMode('dark')}>Dark</DropdownMenu.Item>
		<DropdownMenu.Item on:click={() => resetMode()}>System</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
