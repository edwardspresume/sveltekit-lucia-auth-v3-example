<script lang="ts">
	import authImg from '$lib/assets/auth_image.jpg?enhanced';
</script>

<div class="md:grid md:grid-cols-[1fr,1.6fr] md:gap-8">
	<enhanced:img src={authImg} alt="An alt text" class="hidden rounded shadow-md md:block" />

	<section>
		<slot />
	</section>
</div>
