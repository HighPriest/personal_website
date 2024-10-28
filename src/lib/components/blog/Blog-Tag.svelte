<script lang="ts">
	export let name: string, slug: string, feature_image: string, description: string, count: number;
</script>

<a class="tag" data-sveltekit-preload-data="hover" data-umami-event={`Button: Tag (${slug}`} href={`/blog/tag/${slug}`}>
	<img loading="lazy" src={feature_image} alt="Hero" />
	<div class="post-text">
		<h2>{name}</h2>
		<p class="post-text-p">{description}</p>
		<div class="info">
			<p style="font-size: 1rem;">Amun Technologies</p>
			<p style="font-size: 1rem;">{count} posts</p>
		</div>
	</div>
</a>

<style lang="scss">
	.tag {
		position: relative;
		flex: 1 1 15rem;
		z-index: 0;
		min-width: 15rem; /* TODO: Give it rem units */
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
		h2 {
			text-align: center;
		}
		.info {
			display: flex;
			justify-content: space-between;
			border-top: 1px solid var(--accent-color);
		}
	}
</style>
