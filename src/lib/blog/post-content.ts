/**
 * Behaviour for a post's Ghost HTML (rendered with {@html}), attached to its <article>:
 *
 * - Embed facades (#lib/server/ghost/content.ts) load their player on click. The player's
 *   iframe replaces the facade and takes focus. A modified or middle click keeps the link's own
 *   behaviour (open the video in a new tab).
 * - A third-party image that fails to load is hidden, as Ghost's inline `onerror` did.
 */
import type { Attachment } from 'svelte/attachments';

function play(event: MouseEvent) {
	if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
		return;
	}
	const facade = (event.target as Element).closest<HTMLAnchorElement>('a[data-embed]');
	if (!facade) return;
	event.preventDefault();

	const player = document.createElement('iframe');
	player.src = facade.dataset.embed!;
	player.title = facade.dataset.embedTitle ?? '';
	player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
	player.allowFullscreen = true;
	player.referrerPolicy = 'strict-origin-when-cross-origin';
	player.className = 'kg-embed-player';
	player.style.aspectRatio = facade.style.aspectRatio;
	player.style.maxWidth = facade.style.maxWidth;
	facade.replaceWith(player);
	player.focus();
}

function hideBroken(event: Event) {
	const target = event.target;
	if (target instanceof HTMLImageElement && target.closest('.kg-bookmark-card')) {
		target.hidden = true;
	}
}

export const postContent: Attachment<HTMLElement> = (article) => {
	article.addEventListener('click', play);
	// Load errors don't bubble; a capturing listener still sees them. Images that failed before
	// hydration are already complete with no size.
	article.addEventListener('error', hideBroken, true);
	for (const image of article.querySelectorAll<HTMLImageElement>('.kg-bookmark-card img')) {
		if (image.complete && image.naturalWidth === 0) image.hidden = true;
	}
	return () => {
		article.removeEventListener('click', play);
		article.removeEventListener('error', hideBroken, true);
	};
};
