<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	import authImg from '$lib/assets/auth_image.jpg?enhanced';
</script>

<div class="md:grid md:grid-cols-[1fr,1.6fr] md:gap-10">
	<enhanced:img src={authImg} alt="An alt text" class="hidden md:block" />

	<section>
		<slot />
	</section>
</div>
