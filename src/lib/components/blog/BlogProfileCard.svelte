<script lang="ts">
	export let postCount: number, categoryCount: number, tagCount: number;

	export let avatar: string,
		author: string,
		authorTitle: string,
		location: string,
		rssButton: string,
		socialLinks: string[];

    interface Options { avatarRounded?: boolean }

	export let options: Options = {
		avatarRounded: false
	};


</script>

<div class="card widget" data-type="profile">
	<div class="card-content">
		<nav class="level">
			<div class="level-item has-text-centered flex-shrink-1">
				<div>
					<figure class="image is-128x128 mx-auto mb-2">
						<img
							class={'avatar' + (options.avatarRounded ? ' is-rounded' : '')}
							src={avatar}
							alt={author}
						/>
					</figure>
					{#if author}
						<p class="title is-size-4 is-block" style="line-height: inherit">
							{author}
						</p>
					{/if}
					{#if authorTitle}
						<p class="is-size-6 is-block">{authorTitle}</p>
					{/if}
					{#if location}
						<p class="is-size-6 is-flex justify-content-center">
							<i class="fas fa-map-marker-alt mr-1"></i>
							<span>{location}</span>
						</p>
					{/if}
				</div>
			</div>
		</nav>
		<!--
		<nav class="level is-mobile">
			<div class="level-item has-text-centered is-marginless">
				<div>
					<p class="heading">{counter.post.title}</p>
					<a href={counter.post.url}>
						<p class="title">{counter.post.count}</p>
					</a>
				</div>
			</div>
			<div class="level-item has-text-centered is-marginless">
				<div>
					<p class="heading">{counter.category.title}</p>
					<a href={counter.category.url}>
						<p class="title">{counter.category.count}</p>
					</a>
				</div>
			</div>
			<div class="level-item has-text-centered is-marginless">
				<div>
					<p class="heading">{counter.tag.title}</p>
					<a href={counter.tag.url}>
						<p class="title">{counter.tag.count}</p>
					</a>
				</div>
			</div>
		</nav>
        -->
		{#if rssButton}
			<div class="level">
				<a
					class="level-item button is-primary is-rounded"
					href={rssButton}
					target="_blank"
					rel="me noopener"
				>
					Subscribe to an RSS feed
				</a>
			</div>
		{/if}
		{#if socialLinks}
			this.renderSocialLinks(socialLinks)
		{/if}
	</div>
</div>

<style lang="scss">
.card {
	overflow: visible;
	//border-radius: $card-radius;
	.card-image {
		overflow: hidden;
		//border-top-left-radius: $card-radius;
		//border-top-right-radius: $card-radius;
	}
	.media {
		& + .media {
			border: none;
			margin-top: 0;
		}
	}
}
.card + .card,
.card + .column-right-shadow {
	margin-top: 1.5rem;
    color: gold;
}




.widget {
	.menu-list {
		li {
			ul {
				margin-right: 0;
			}
		}
		.level {
			margin-bottom: 0;
		}
		.tag {
			background: var(--tertiary-color);
			color: var(--text-color);
		}
	}
	.tags {
		.tag {
			&:first-child {
				background: var(--color-primary);
				color: var(--text-color);
			}
			&:last-child {
				background: var(--tertiary-color);
				color: var(--text-color);
			}
		}
	}
}
.widget .menu-list .level .level-left,
.widget .menu-list .level .level-right,
.widget .menu-list .level .level-item {
	flex-shrink: 1;
}
.widget .menu-list .level .level-left,
.widget .menu-list .level .level-right {
	align-items: flex-start;
}
.level {
	&.is-multiline {
		flex-wrap: wrap;
	}
}

</style>
