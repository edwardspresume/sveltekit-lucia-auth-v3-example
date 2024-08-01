<script>
	import Button from '$components/ui/button/button.svelte';
</script>

<div class="flex items-center">
	<h1 class="text-lg font-semibold md:text-2xl">Inventory</h1>
</div>
<div class="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
	<div class="flex flex-col items-center gap-1 text-center">
		<h3 class="text-2xl font-bold tracking-tight">You have no projects</h3>
		<p class="text-sm text-muted-foreground">You can start selling as soon as you add a project.</p>
		<Button class="mt-4">Add Project</Button>
	</div>
</div>
