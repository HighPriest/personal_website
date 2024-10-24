<script lang="ts">
	export let title: string,
		slug: string,
		feature_image: string,
		feature_image_alt: string,
		updated_at: string,
		tags: (string | undefined)[],
		authors: (string | undefined)[],
		excerpt: string;

	const date = new Date(updated_at);
	const time = date.toLocaleTimeString('pl-PL', {
		day: 'numeric',
		month: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
</script>

<a class="post" data-sveltekit-preload-data="hover" href={`/blog/post/${slug}`}>
	<img loading="lazy" src={feature_image} alt={feature_image_alt} />
	<div class="post-text">
		<h1>{title}</h1>
		<p class="post-text-p">{@html excerpt}</p>
		<div class="info">
			{#each authors as author}
				<p style="font-size: 1rem;">{author}</p>
			{/each}
			<p style="font-size: 1rem;">{time}</p>
		</div>
	</div>
</a>

<style lang="scss">
	.post {
		position: relative;
		flex: 1 1 20rem;
		z-index: 0;
		min-width: 18rem; /* TODO: Give it rem units */
		max-width: 40rem;
		padding: 2rem;
		margin: 2rem;
		background-color: var(--tertiary-color);
		-webkit-box-shadow: 0 1em 1em 0 rgba(15, 15, 20, 0.2);
		box-shadow: 0 1em 1em 0 rgba(15, 15, 20, 0.2);
		-webkit-transition: 0.4s ease-in-out;
		transition: 0.4s ease-in-out;
		&:hover {
			-webkit-transform: translate(5px, 1px);
			transform: translate(5px, 1px);

			.info {
				color: var(--accent-color);
			}
		}

		&::after {
			content: '';
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			background-image: linear-gradient(
				159deg,
				var(--tertiary-color) 0%,
				var(--tertiary-color) 30%,
				rgba(var(--rgba-tertiary-color), 0.6) 50%,
				var(--fourth-color) 80%
			);
			z-index: -1;
		}

		img {
			position: absolute;
			z-index: -2;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
			object-fit: cover;
		}

		.info {
			display: flex;
			justify-content: space-between;
			border-top: 1px solid var(--accent-color);
		}
	}
</style>
