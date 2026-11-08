import type { RequestHandler } from './$types';

// Liveness probe for the container healthcheck: no dependencies, never cached.
export const prerender = false;

export const GET: RequestHandler = () =>
	new Response('ok', {
		headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }
	});
