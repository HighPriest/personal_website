<script lang="ts">
	import { localizeHref } from "$lib/paraglide/runtime";
	
	let { posts = [] } = $props();

	type Featured = {
		title: string;
		slug: string;
		feature_image: string;
		feature_image_alt: string;
		updated_at: string;
		tags: (string | undefined)[];
		authors: (string | undefined)[];
		excerpt: string;
	};

	// Number of posts we expect (1 featured + 4 grid)
	const placeholders: Featured[] = [
		{
			title: 'Loading...',
			slug: './',
			feature_image: '',
			feature_image_alt: '',
			updated_at: '---',
			tags: ['...'],
			authors: ['...'],
			excerpt: ''
		},
		{
			title: 'Loading...',
			slug: './',
			feature_image: '',
			feature_image_alt: '',
			updated_at: '---',
			tags: ['...'],
			authors: ['...'],
			excerpt: ''
		},
		{
			title: 'Loading...',
			slug: './',
			feature_image: '',
			feature_image_alt: '',
			updated_at: '---',
			tags: ['...'],
			authors: ['...'],
			excerpt: ''
		},
		{
			title: 'Loading...',
			slug: './',
			feature_image: '',
			feature_image_alt: '',
			updated_at: '---',
			tags: ['...'],
			authors: ['...'],
			excerpt: ''
		},
		{
			title: 'Loading...',
			slug: './',
			feature_image: '',
			feature_image_alt: '',
			updated_at: '---',
			tags: ['...'],
			authors: ['...'],
			excerpt: ''
		}
	];
	let featured: Featured = {
		title: 'Loading...',
		slug: './',
		feature_image: '',
		feature_image_alt: '',
		updated_at: '',
		tags: [],
		authors: [],
		excerpt: ''
	};
</script>

<div class="blog-highlights">
	<div class="header">
		<div class="title-wrapper">
			<span class="accent"></span>
			<h2>Gaming</h2>
		</div>
		<div class="pager">
			<span class="icon left"></span>
			<span class="icon right"></span>
		</div>
	</div>

	<div class="content">
		<!-- Left featured -->
		{#key (featured = posts[0] ?? placeholders[0])}
			<article class="post featured {featured.feature_image ? '' : 'placeholder'}">
				<div
					class="image"
					style={featured.feature_image
						? `background-image:linear-gradient(180deg,transparent 50%,black 90%), url('${featured.feature_image}')`
						: ''}
				></div>
				<a onclick={() => false} data-sveltekit-preload-data="hover" data-umami-event={`Button: Post (${featured.slug})`} href={localizeHref(`/blog/post/${featured.slug}`)} class="overlay">
					<div class="meta">
						<h3>{featured.title}</h3>
						<span class="details">
							<span>by {featured.authors[0]}</span>
							<span class="date">{featured.updated_at}</span>
						</span>
					</div>
				</a>
			</article>
		{/key}

		<!-- Right grid -->
		<div class="grid">
			{#each posts.length ? posts.slice(1, 5) : placeholders.slice(1, 5) as post}
				<!-- post is now typed as Featured -->
				<article class="post {post.feature_image ? '' : 'placeholder'}">
					<div
						class="image"
						style={post.feature_image
							? `background-image:linear-gradient(180deg,transparent 50%,black 90%), url('${post.feature_image}')`
							: ''}
					></div>
					<a onclick={() => false} data-sveltekit-preload-data="hover" data-umami-event={`Button: Post (${post.slug})`} href={localizeHref(`/blog/post/${post.slug}`)} class="overlay">
						<div class="meta">
							<h3>{post.title}</h3>
							<span class="details">
								<span>by {post.authors[0]}</span>
								<span class="date">{post.updated_at}</span>
							</span>
						</div>
					</a>
				</article>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	.blog-highlights {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		width: 100%;

		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.title-wrapper {
				display: flex;
				align-items: center;
				gap: 0.5rem;

				.accent {
					width: 6px;
					height: 100%;
					background-color: #057af0;
				}

				h2 {
					font-size: 1.25rem;
					font-weight: bold;
				}
			}

			.pager {
				display: flex;
				gap: 0.5rem;

				.icon {
					width: 10px;
					height: 10px;
					background-color: #057af0;
					mask-size: cover;
					-webkit-mask-size: cover;

					&.left {
						mask-image: url('https://assets-ng.maxroll.gg/images/blue-arrow-left.svg?scope=mask');
						-webkit-mask-image: url('https://assets-ng.maxroll.gg/images/blue-arrow-left.svg?scope=mask');
					}
					&.right {
						mask-image: url('https://assets-ng.maxroll.gg/images/blue-arrow-right.svg?scope=mask');
						-webkit-mask-image: url('https://assets-ng.maxroll.gg/images/blue-arrow-right.svg?scope=mask');
					}
				}
			}
		}

		.content {
			display: flex;
			flex-direction: column;
			gap: 1rem;

			@media (min-width: 768px) {
				flex-direction: row;
				gap: 1rem;
			}

			.featured {
				flex: 1 1 56%;
			}

			.grid {
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 1rem;
				flex: 1 1 44%;
			}

			.post {
				position: relative;
				overflow: hidden;
				border-radius: 0.25rem;
				width: 100%;
    			height: 100%;

				.image {
					width: 100%;
					padding-top: 56%;
					background-size: cover;
					background-position: center;
					background-color: #222;
				}

				.overlay {
					position: absolute;
					inset: 0;
					display: flex;
					flex-direction: column;
					justify-content: flex-end;
					padding: 1rem;
					background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent 50%);
					color: white;
					text-decoration: none;

					.meta {
						h3 {
							font-size: 1rem;
							font-weight: bold;
							margin-bottom: 0.25rem;
						}

						.details {
							display: flex;
							justify-content: space-between;
							font-size: 0.875rem;
							opacity: 0.85;

							.date {
								margin-left: 0.5rem;
							}
						}
					}
				}

				&.placeholder {
					.image {
						background: linear-gradient(90deg, #333 25%, #444 37%, #333 63%);
						background-size: 400% 100%;
						animation: shimmer 1.4s ease infinite;
					}

					.meta h3,
					.details {
						background: #444;
						color: transparent;
						border-radius: 4px;
					}
				}
			}
		}
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}
</style>
