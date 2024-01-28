<script lang="ts">
	import { toast } from 'svelte-sonner';

	import Button from '$components/ui/button/button.svelte';
</script>

<h1 class="text-2xl font-bold">Home page</h1>

<Button class="mt-5" on:click={() => toast('Hello world!')}>Show toast</Button>
