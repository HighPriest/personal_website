export const prerender = true;
import type { LayoutLoad } from "./$types";
import { TSGhostContentAPI, type Tag } from "@ts-ghost/content-api";

import { tagStore } from "$lib";
import { get } from 'svelte/store';

const GHOST_URL = 'https://ghost.amun.pl';
const GHOST_KEY = 'e701b4bd9cb5352d3dc49c381b';
const GHOST_VERSION = 'v5.0';

const api = new TSGhostContentAPI(GHOST_URL, GHOST_KEY, GHOST_VERSION);

export const load = (async () => {
	const tagStore_ = get(tagStore);
	if (Object.keys(tagStore_).length !== 0) {
		console.log("No fetch tags");
		return {
			tagCards:
				tagStore_.map((tag: Tag) => ({
					name: tag.name ? tag.name : 'No title',
					slug: tag.slug!,
					feature_image: tag.feature_image ? tag.feature_image : 'https://amun.pl/eye-of-ra.webp',
					description: tag.description ? tag.description : '',
					count: tag.count?.posts || 0
			}))
		};
	} else {
		console.log("Fetch tags");
		let result = await api.tags
			.browse({
				order: "count.posts DESC"
			}).include({ "count.posts": true })
			.fetch();

		if (result.success) {
			tagStore.set(
				result.data.map((tag: Tag) => ({
					...tag,
					posts: []
				}))
			);
			return {
				tagCards:
					result.data.map((tag: Tag) => ({
					name: tag.name ? tag.name : 'No title',
					slug: tag.slug!,
					feature_image: tag.feature_image ? tag.feature_image : 'https://amun.pl/eye-of-ra.webp',
					description: tag.description ? tag.description : '',
					count: tag.count?.posts || 0
				}))
			}
		} else {
			// errors array of objects
			console.log(result.errors.map((e) => e.message).join("\n"));
		}
	}
}) satisfies LayoutLoad;
