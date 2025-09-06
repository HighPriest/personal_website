<script lang="ts">
	import { localizeHref } from "$lib/paraglide/runtime";

	export let name: string, slug: string, feature_image: string, feature_image_alt:string, description: string, count: number, date_latest: string;

  // TODO: Add the rotation animation, to recently updated topics
  //<a class="card" onclick={() => false} data-sveltekit-preload-data="hover" data-umami-event={`Button: Tag (${slug})`} href={localizeHref(`/blog/tag/${slug}`)}>
</script>

<article class="category-card">
	<a class="inner" onclick={() => false} data-sveltekit-preload-data="hover" data-umami-event={`Button: Tag (${slug})`} href={localizeHref(`/blog/tag/${slug}`)}>
		<div class="image-container">
			<img class="image" src={feature_image} alt={feature_image_alt} />
			<div class="shadow-overlay"></div>
		</div>

		<div class="content">
			<div class="top">
				<div class="first-row">
					<span class="category">
						<span class="category-text">{count} posts</span>
					</span>
				</div>

				<div class="text">
					<h3 class="title" title={name}>{name}</h3>
					<p class="summary">{description}</p>
				</div>
			</div>

			<div class="bottom">
				<span class="details">
					<span>by {"HighPriest"}</span>
					<span class="date">{date_latest}</span>
				</span>
			</div>
		</div>
	</a>
</article>

<style lang="scss">
.category-card {
	position: relative;
	display: flex;
	margin: 2rem auto;
	width: 100%;

	// Base card look
	background: var(--maxroll-color-dark-5, #0a0a0a);
	border: 1px solid var(--maxroll-color-grey-1, #333);
	border-radius: 10px;
	overflow: hidden;
	transition: all 0.25s ease;
	box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);

	// Hover animation
	&:hover {
		background: var(--maxroll-color-dark-4, #151515);
		border-color: var(--highlight-color, #057af0);
		transform: translateY(-3px);
		box-shadow: 0 6px 14px rgba(0, 0, 0, 0.6);
	}

	.inner {
		display: flex;
		flex-direction: row;
		gap: 1rem;
		text-decoration: none;
		width: 100%;
		color: inherit;
	}

	.image-container {
		position: relative;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--maxroll-color-dark-6, #111);
		border-radius: 8px;
		overflow: hidden;
		aspect-ratio: 16 / 9;
		width: 100%;
		max-width: 40%;
		transition: transform 0.3s ease;

		// Subtle zoom effect on hover
		.category-card:hover & {
			transform: scale(1.03);
		}
	}

	.image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		aspect-ratio: 16 / 9;
	}

	.shadow-overlay {
		position: absolute;
		inset: 0;
		box-shadow: inset 0 0 20px #000;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 0.5rem;
		margin: 1rem;
	}

	.top {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.first-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 26px;
		gap: 20px;
	}

	.category {
		display: flex;
		align-items: center;
		gap: 12px;
		cursor: pointer;
		height: 16px;
		line-height: 16px;

		.category-text {
			font-size: 12px;
			font-weight: 600;
			text-transform: uppercase;
			white-space: nowrap;
			color: var(--maxroll-color-blue, #3af);
		}
	}

	.text {
		display: flex;
		flex-direction: column;
		gap: 8px;

		.title {
			font-family: var(--maxroll-font-sans, sans-serif);
			font-size: 18px;
			font-weight: 400;
			line-height: 1.25;
			color: var(--maxroll-color-white-1, #fff);
			margin: 0;
			display: -webkit-box;
			overflow: hidden;
			text-overflow: ellipsis;
			-webkit-line-clamp: 4;
			-webkit-box-orient: vertical;
		}

		.summary {
			font-size: 16px;
			line-height: 1.25;
			color: var(--maxroll-color-grey-1, #aaa);
			margin: 0;
		}
	}

	.bottom {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		.details {
			display: flex;
			flex-wrap: wrap;
			column-gap: 4px;
			font-size: 10px;
			font-weight: 600;
			color: var(--maxroll-color-grey-1, #aaa);

			.date {
				opacity: 0.6;
			}
		}
	}
}
</style>

