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
<a onclick={() => false} class="post" data-sveltekit-preload-data="hover" data-umami-event={`Button: Tag (${slug})`} href={localizeHref(`/blog/post/${slug}`)}>
	<!--<img loading="lazy" src={feature_image} alt={feature_image_alt} />-->
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
</a>

<style lang="scss">
	.title {
	}
	.post {
		display: block;
		position: relative;
		flex: 1 1 20rem;
		z-index: 0;
		min-width: 18rem; /* TODO: Give it rem units */
		max-width: auto;
		padding: 2rem;
		margin: 2rem;
		border-radius: 10%;
		//-webkit-box-shadow: 0 1em 1em 0 rgba(15, 15, 20, 0.2);
		//box-shadow: 0 1em 1em 0 rgba(15, 15, 20, 0.2);
		-webkit-transition: var(--transition-time) ease-in-out;
		transition: var(--transition-time) ease-in-out;
		&:hover {
			-webkit-transform: translate(5px, 1px);
			transform: translate(5px, 1px);

			&::after {
				box-shadow:
				8px 6px 2px rgba(0,0,0, 0.8) inset;
			}
			&::before {
				margin: 0.6rem;
			}

			.info * {
				color: var(--color-accent);
			}
		}

		&::before {
			content: '';
			position: absolute;
			margin: 1.2rem;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			border-radius: 1em;
			z-index:-1;
			background: gold;
			opacity: 0.8;
			filter: blur(6px);
			transition: linear var(--transition-time);
		}

		&::after {
			content: '';
			position: absolute;
			margin: 10px;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			border-radius: 1em;
			background-color: #111;
			box-shadow:
				3px 4px 2px rgba(150,150,150, 0.2) inset;
			//background-image: linear-gradient(159deg,var(--tertiary-color) 0%,rgba(var(--rgba-tertiary-color),.9) 50%,rgba(var(--rgba-tertiary-color),.6) 90%,var(--fourth-color) 100%);
			transition: ease-out var(--transition-time);
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

		p {
			color: var(--pure-white);
		}

		.info {
			display: flex;
			justify-content: space-between;
			border-bottom: 1px solid var(--color-accent);
			margin-bottom: 0.5em;
		}
	}
</style>
