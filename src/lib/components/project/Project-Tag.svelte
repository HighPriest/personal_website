<script lang="ts">
	export let name: string, slug: string, feature_image: string, description: string, count: number;
</script>

<a class="tag" data-sveltekit-preload-data="hover" data-umami-event={`Button: Tool (${slug})`} href={`/tools/${slug}`}>
	<img loading="lazy" src={feature_image} alt="Hero" />
	<div class="posts-highlights">
		<img loading="lazy" src={feature_image} alt="Post" />
		<img loading="lazy" src={feature_image} alt="Post" />
		<img loading="lazy" src={feature_image} alt="Post" />
	</div>
	<div class="tag-text">
		<h2>{name}</h2>
		<p class="tag-text-p">{description}</p>
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
		
		display: grid;
		grid-template-columns: auto auto 1fr;
		justify-items: stretch;
		grid-auto-flow: column;
		justify-content: left;

		z-index: 0;
		width: auto;
		padding: 1rem;
		margin: 2rem;
		background-color: var(--primary-color);
		-webkit-box-shadow: 0 1em 1em 0 rgba(15, 15, 20, 0.3);
		box-shadow: 0 1em 1em 0 rgba(15, 15, 20, 0.3);
		-webkit-transition: 0.4s ease-in-out;
		transition: 0.4s ease-in-out;
		&:hover {
			-webkit-transform: translate(5px, 1px);
			transform: translate(5px, 1px);
			.info {
				color: var(--accent-color);
			}
		}

		.posts-highlights {
			display: grid;
			grid-auto-flow: row;
			margin: -1rem 0;
			padding: 0.5rem 0.666rem;
			img {
				padding: 0.666rem;
				height: 7rem;
				width: 12rem;
			}
		}

		.tag-text {
			position: relative;
		}

		img {
			height: 24rem;
			width: 36rem;
			object-fit: cover;
		}
		h2 {
			//text-align: center;
		}
		.info {
			position: absolute;
			bottom: 0;
			width: 100%;
			display: flex;
			justify-content: space-between;
			align-self:flex-end;
			border-top: 1px solid var(--accent-color);
		}
	}
</style>
