import { error } from '@sveltejs/kit';
import { GhostUnavailable } from './client.ts';

/** Blog pages may be cached briefly and served stale while revalidating. */
export const BLOG_CACHE_CONTROL = 'public, max-age=60, stale-while-revalidate=600';

/** Runs a Ghost read for a load function; Ghost unreachable with nothing cached becomes a 503. */
export async function fromGhost<T>(read: () => Promise<T>): Promise<T> {
	try {
		return await read();
	} catch (cause) {
		if (cause instanceof GhostUnavailable) error(503, 'The blog is unavailable right now');
		throw cause;
	}
}

/** Ghost slugs are lowercase letters, digits and hyphens; anything else can't exist. */
export const isSlug = (value: string) => /^[a-z0-9-]+$/.test(value);
