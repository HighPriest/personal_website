<script lang="ts">
	import { localizeHref } from "$lib/paraglide/runtime";

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

<!--TODO: THESE SHOULDN'T BE LINKS. Because they don't allow selecting contents. -->
<!--TODO: Find a way to make them something else, which contents can be selectable, but on hover they are still going to prefetch data -->
<!--<a onclick={() => false} class="post" data-sveltekit-preload-data="hover" data-umami-event={`Button: Post (${slug})`} href={localizeHref(`/blog/post/${slug}`)}>
	<!--<img loading="lazy" src={feature_image} alt={feature_image_alt} />
	<div class="post-text">
		<div class="info">
			<p style="font-size: 1rem;">{time}</p>
			{#each authors as author}
				<p style="font-size: 1rem;">{author}</p>
			{/each}
		</div>
		<div class="title">
			<h1>{title}</h1>
		</div>
		<p class="excerpt">{@html excerpt}</p>
	</div>
	<div>Read more</div>
</a>-->

<a
	class="post-card"
	onclick={() => false}
	data-sveltekit-preload-data="hover"
	data-umami-event={`Button: Post (${slug})`}
	href={localizeHref(`/blog/post/${slug}`)}
>
	<figure>
		<picture>
			<img src={feature_image} alt={feature_image_alt} />
		</picture>

		<figcaption>
			<img src={feature_image} alt="" aria-hidden="true" />
			<section class="adaptive-glass">
				<h3>{title}</h3>
				<span>
					<date>{time}</date>
					<author>{authors[0]}</author>
				</span>
			</section>
		</figcaption>

		<!-- Overlay excerpt -->
		<div class="excerpt-overlay">
			<p>{excerpt}</p>
		</div>
	</figure>
</a>

<style lang="scss">
.post-card {
	display: block;
	width: 100%;
	max-width: 22rem;
	margin: 1rem;
	text-decoration: none;
	color: inherit;

	border: 1px solid var(--maxroll-color-grey-1, #333);
	border-radius: 12px;
	overflow: hidden;
	background: var(--maxroll-color-dark-5, #0a0a0a);
	transition: all 0.25s ease;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
	position: relative;

	&:hover {
		transform: translateY(-4px);
		border-color: var(--highlight-color, #057af0);
		box-shadow: 0 8px 18px rgba(0, 0, 0, 0.6);
		background: var(--maxroll-color-dark-4, #151515);

		// reveal excerpt
		.excerpt-overlay {
			opacity: 1;
			visibility: visible;
		}
	}
}

figure {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	margin: 0;

	aspect-ratio: 4 / 5;

  picture {
    min-height: 33%;
  }

	& img {
		display: block;
		width: 100%;
		max-height: 10em;
		object-fit: cover;
	}
}

figcaption {
	display: grid;
	grid: [stack] 1fr / [stack] 1fr;
	position: relative;
	flex: 1;

	& > * {
		grid-area: stack;
	}

	& > img {
		position: absolute;
		inset: 0;
		transform: scaleY(-1);
		object-fit: cover;
		width: 100%;
		height: 100%;
		opacity: 0.3;
	}

	& > section {
		z-index: 1;
		padding: 1.25rem;
		display: grid;
		gap: 0.75rem;
		color: var(--on-glass-primary, #111);

		@media (prefers-color-scheme: dark) {
			text-shadow: 0 1px 0 hsl(0 0% 0% / 20%);
		}
	}

	h3 {
		font-size: clamp(1.25rem, calc(1rem + 1vw), 1.75rem);
		margin: 0;
		color: var(--maxroll-color-white-1, #fff);
	}

	date {
		color: var(--on-glass-secondary, #555);
		font-size: 0.9rem;
	}

	author {
		position: relative;
		left: 1rem;
		font-size: 0.9rem;
		color: var(--on-glass-secondary, #555);
	}
}

.adaptive-glass {
	--glass-lightness: 100%;
	--glass-alpha: 50%;
	font-size: 1rem;

	background: hsl(0 0% var(--glass-lightness) / var(--glass-alpha));
	backdrop-filter: blur(40px);

	@media (prefers-color-scheme: dark) {
		--glass-lightness: 0%;
	}

	@media (prefers-reduced-transparency: reduce) {
		--glass-alpha: 85%;
	}

	@supports not (backdrop-filter: blur(1px)) {
		background: hsl(0 0% var(--glass-lightness) / 90%);
	}
}

// Excerpt overlay
.excerpt-overlay {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
	padding: 1.5rem;
	color: var(--maxroll-color-white-1, #fff);
	font-size: 1rem;
	line-height: 1.4;

	background: rgba(0, 0, 0, 0.7);
	backdrop-filter: blur(20px);

	opacity: 0;
	visibility: hidden;
	transition: opacity 0.3s ease, visibility 0.3s ease;

  z-index: 1;

	p {
		margin: 0;
		max-height: 80%;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 6;
		-webkit-box-orient: vertical;
	}
}
</style>

