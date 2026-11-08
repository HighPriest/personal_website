/**
 * Development-only debug logger.
 *
 * `debug` is `undefined` outside development, so call it as `debug?.(scope, message, details)`.
 * An optional call skips evaluating its arguments, and because `import.meta.env.DEV` is a
 * compile-time constant, production builds (prerendering included) drop the calls entirely.
 *
 * Keep messages short: what happened, plus the few values that explain it (keys, counts,
 * durations). Never log whole objects, post HTML or file contents.
 */
export type DebugDetails = Record<string, unknown>;

export const debug: ((scope: string, message: string, details?: DebugDetails) => void) | undefined =
	import.meta.env.DEV
		? (scope, message, details) => {
				// eslint-disable-next-line no-console -- this helper is the one sanctioned debug sink
				console.debug(`[${scope}] ${message}`, ...(details ? [details] : []));
			}
		: undefined;

/** Milliseconds elapsed since `start` (a `performance.now()` value), rounded. */
export const elapsed = (start: number): number => Math.round(performance.now() - start);
