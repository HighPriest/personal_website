/**
 * A minimal Ghost Content API client on plain fetch. Only reads; the server
 * talks to Ghost on its internal URL. 404 becomes `null`; anything else that isn't a success
 * (unreachable, timed out, an error status, or a redirect) becomes `GhostUnavailable`.
 */

/** Ghost couldn't answer; with nothing stale in the cache, the page becomes a 503. */
export class GhostUnavailable extends Error {
	override name = 'GhostUnavailable';
}

export type GhostClientOptions = {
	url: string;
	key: string;
	fetch?: typeof fetch;
	timeoutMs?: number;
};

export type GhostClient = <T>(path: string, params?: Record<string, string>) => Promise<T | null>;

export function createGhostClient({
	url,
	key,
	fetch: fetchImpl = fetch,
	timeoutMs = 5000
}: GhostClientOptions): GhostClient {
	return async <T>(path: string, params: Record<string, string> = {}) => {
		const target = new URL(`ghost/api/content/${path}`, url.endsWith('/') ? url : `${url}/`);
		target.searchParams.set('key', key);
		for (const [name, value] of Object.entries(params)) target.searchParams.set(name, value);

		let response: Response;
		try {
			response = await fetchImpl(target, {
				headers: {
					'Accept-Version': 'v5.0',
					// On its internal URL Ghost sees plain HTTP and would redirect to its https URL;
					// this tells it the original request was already https.
					'X-Forwarded-Proto': 'https'
				},
				redirect: 'manual',
				signal: AbortSignal.timeout(timeoutMs)
			});
		} catch (error) {
			throw new GhostUnavailable(`Ghost unreachable (${(error as Error).message})`, {
				cause: error
			});
		}
		if (response.status === 404) return null;
		if (response.status >= 300 && response.status < 400) {
			throw new GhostUnavailable(
				`Ghost redirected (${response.status}) to ${response.headers.get('location')}; check GHOST_URL`
			);
		}
		if (!response.ok) throw new GhostUnavailable(`Ghost answered ${response.status}`);
		return (await response.json()) as T;
	};
}
