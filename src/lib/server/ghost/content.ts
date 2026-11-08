/**
 * Post HTML post-processing, once per cache fill: Ghost's HTML is parsed once,
 * transformed, and serialized again.
 *
 * - Code blocks are highlighted (highlight.ts).
 * - Own images get a responsive srcset; third-party images move to the media cache (media.ts).
 * - Embedded players become click-to-load facades (YouTube on youtube-nocookie.com).
 * - Markup that would need inline script or a <style> element is rewritten: event-handler
 *   attributes are dropped, the file card's SVG loses its <style>, toggle cards become <details>.
 */
import type { Element, ElementContent, Nodes, Properties, Root } from 'hast';
import { fromHtml } from 'hast-util-from-html';
import { toHtml } from 'hast-util-to-html';
import { SKIP, visit } from 'unist-util-visit';
import { SITE_URL } from '#lib/site.js';
import { highlight } from './highlight.ts';
import type { Media } from './media.ts';

/** The widths Ghost generates for content images (`/content/images/size/w<width>/…`). */
const WIDTHS = [600, 1000, 1600, 2400];
/** The post column: 44 rem wide, the full viewport below that. */
export const SIZES = '(min-width: 44rem) 44rem, 100vw';
const YOUTUBE = /^https:\/\/www\.youtube(?:-nocookie)?\.com\/embed\/([\w-]{11})/;

const el = (tagName: string, properties: Properties, children: ElementContent[] = []): Element => ({
	type: 'element',
	tagName,
	properties,
	children
});
const text = (value: string): ElementContent => ({ type: 'text', value });

const classes = (node: Element) => (node.properties.className as string[] | undefined) ?? [];
const hasClass = (node: Element, name: string) => classes(node).includes(name);

function textOf(node: Nodes): string {
	if (node.type === 'text') return node.value;
	return 'children' in node ? node.children.map(textOf).join('') : '';
}

/** Ghost's srcset for one of its own images: the generated widths below `width`, then the original. */
function srcset(url: URL, width: number): string | undefined {
	const path = url.pathname;
	if (!path.startsWith('/content/images/') || path.includes('/size/') || path.endsWith('.svg')) {
		return undefined;
	}
	const sized = WIDTHS.filter((w) => w < width).map(
		(w) => `${url.origin}${path.replace('/content/images/', `/content/images/size/w${w}/`)} ${w}w`
	);
	return [...sized, `${url.href} ${width}w`].join(', ');
}

function image(node: Element, media: Media) {
	const props = node.properties;
	let url: URL;
	try {
		url = new URL(String(props.src));
	} catch {
		return; // relative or missing: nothing to rewrite
	}
	if (url.origin === SITE_URL) {
		const width = Number(props.width);
		if (!props.srcSet && width) props.srcSet = srcset(url, width);
		if (props.srcSet) props.sizes = SIZES;
	} else if (url.protocol === 'https:' || url.protocol === 'http:') {
		props.src = media.register(url.href);
		delete props.srcSet;
		delete props.sizes;
	}
	props.loading = 'lazy';
	props.decoding = 'async';
}

/** A click-to-load stand-in for an embedded player: a link that works without JavaScript too. */
function facade(iframe: Element, media: Media): Element | null {
	const src = String(iframe.properties.src ?? '');
	if (!/^https:\/\//.test(src)) return null;
	const width = parseInt(String(iframe.properties.width), 10);
	const height = parseInt(String(iframe.properties.height), 10);
	const youtube = src.match(YOUTUBE)?.[1];
	const provider = youtube ? 'YouTube' : new URL(src).hostname.replace(/^www\./, '');
	const title = String(iframe.properties.title ?? '');
	// YouTube fills the column at 16:9 (Ghost sizes its iframe 200×113, a placeholder). Other
	// players keep the size Ghost gave them, shrinking to fit.
	const style =
		youtube || !(width > 0 && height > 0)
			? 'aspect-ratio: 16 / 9'
			: `aspect-ratio: ${width} / ${height}; max-width: ${width}px`;

	return el(
		'a',
		{
			className: ['kg-embed-facade'],
			href: youtube ? `https://www.youtube.com/watch?v=${youtube}` : src,
			dataEmbed: youtube ? `https://www.youtube-nocookie.com/embed/${youtube}?autoplay=1` : src,
			dataEmbedTitle: title || provider,
			style
		},
		[
			...(youtube
				? [
						el('img', {
							src: media.register(`https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`),
							alt: '',
							width: 480,
							height: 360,
							loading: 'lazy',
							decoding: 'async'
						})
					]
				: []),
			el('span', { className: ['kg-embed-play'], ariaHidden: 'true' }),
			el('span', { className: ['kg-embed-text'] }, [
				...(title ? [el('span', { className: ['kg-embed-title'] }, [text(title)])] : []),
				el('span', { className: ['kg-embed-provider'] }, [text(provider)])
			])
		]
	);
}

/** Ghost's toggle card (opened by Ghost's own script) as a native disclosure. */
function toggle(card: Element): Element {
	const find = (name: string) =>
		card.children
			.flatMap((child) => (child.type === 'element' ? [child, ...child.children] : []))
			.find((child): child is Element => child.type === 'element' && hasClass(child, name));
	const heading = find('kg-toggle-heading-text');
	const content = find('kg-toggle-content');
	return el('details', { className: ['kg-card', 'kg-toggle-card'] }, [
		el('summary', { className: ['kg-toggle-heading'] }, heading ? [heading] : []),
		...(content ? [content] : [])
	]);
}

/** Ghost's post HTML, ready to render (see the module comment). */
export async function renderContent(html: string, media: Media): Promise<string> {
	const tree: Root = fromHtml(html, { fragment: true });
	const blocks: { pre: Element; code: string; lang: string }[] = [];

	visit(tree, 'element', (node, index, parent) => {
		for (const key of Object.keys(node.properties)) {
			if (/^on[A-Za-z]/.test(key)) delete node.properties[key];
		}
		if (node.tagName === 'style' && parent && index !== undefined) {
			parent.children.splice(index, 1);
			return [SKIP, index];
		}
		if (node.tagName === 'img') image(node, media);
		if (
			node.tagName === 'iframe' &&
			parent?.type === 'element' &&
			hasClass(parent, 'kg-embed-card')
		) {
			const replacement = facade(node, media);
			if (replacement && index !== undefined) parent.children[index] = replacement;
			return SKIP;
		}
		if (
			node.tagName === 'div' &&
			hasClass(node, 'kg-toggle-card') &&
			parent &&
			index !== undefined
		) {
			parent.children[index] = toggle(node);
			return index; // visit the <details> next, so its content is processed too
		}
		if (node.tagName === 'pre') {
			const [code] = node.children.filter((child) => child.type === 'element');
			const lang = code && classes(code).find((name) => name.startsWith('language-'));
			if (code?.tagName === 'code' && lang) {
				blocks.push({ pre: node, code: textOf(code), lang: lang.slice('language-'.length) });
			}
			return SKIP;
		}
	});

	await Promise.all(
		blocks.map(async ({ pre, code, lang }) => {
			const highlighted = await highlight(code, lang);
			if (highlighted) Object.assign(pre, highlighted);
		})
	);
	return toHtml(tree);
}
