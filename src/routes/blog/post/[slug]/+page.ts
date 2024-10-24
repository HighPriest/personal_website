export const prerender = true;
import { TSGhostContentAPI, type Post } from "@ts-ghost/content-api";

export async function load({ params }) {
	const GHOST_URL = 'https://ghost.amun.pl';
	const GHOST_KEY = 'e701b4bd9cb5352d3dc49c381b';
	const GHOST_VERSION = 'v5.0';

	const api = new TSGhostContentAPI(GHOST_URL, GHOST_KEY, GHOST_VERSION);

	let result = await api.posts.read({
		slug: params.slug,
		//order: 'updated_at DESC'
	}).include({
		authors: true,
		tags: true
	}).fetch();

	if (result.success) {
		return {
			post:
			{
				title: result.data.title || 'No title',
				slug: result.data.slug,
				feature_image: result.data.feature_image
					? result.data.feature_image
					: 'https://amun.pl/eye-of-ra.webp',
				feature_image_alt: result.data.feature_image_alt ? result.data.feature_image_alt : '',
				updated_at: result.data.updated_at,
				tags: result.data.tags!.map((tag) => tag.name),
				authors: result.data.authors!.map((author) => author.name),
				excerpt: result.data.excerpt ? result.data.excerpt : '',
				html: result.data.html ? result.data.html : ''
			}
		};
	} else {
		// errors array of objects
		console.log(result.errors.map((e) => e.message).join("\n"));
	}
}
