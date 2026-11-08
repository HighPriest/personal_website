/**
 * The Ghost module's cache: one bounded LRU keyed by query, fresh for 60 s,
 * served stale for up to 24 h while Ghost fails, and single-flight (concurrent misses for a key
 * share one request). It's the documented exception to "no shared state" [ARC-2]: it holds
 * public data only, the same for every visitor.
 */

type Entry = { value: unknown; storedAt: number };

export type CacheEvent =
	{ kind: 'hit' | 'stale'; key: string; ageMs: number } | { kind: 'miss'; key: string };

export type CacheOptions = {
	max?: number;
	ttlMs?: number;
	staleMs?: number;
	now?: () => number;
	onEvent?: (event: CacheEvent) => void;
};

export class Cache {
	readonly #entries = new Map<string, Entry>();
	readonly #inFlight = new Map<string, Promise<unknown>>();
	readonly #max: number;
	readonly #ttlMs: number;
	readonly #staleMs: number;
	readonly #now: () => number;
	readonly #onEvent: (event: CacheEvent) => void;

	constructor({
		max = 200,
		ttlMs = 60_000,
		staleMs = 24 * 60 * 60_000,
		now = Date.now,
		onEvent = () => {}
	}: CacheOptions = {}) {
		this.#max = max;
		this.#ttlMs = ttlMs;
		this.#staleMs = staleMs;
		this.#now = now;
		this.#onEvent = onEvent;
	}

	get size() {
		return this.#entries.size;
	}

	/** The cached value for `key`, or the result of `load` (which then gets cached). */
	async get<T>(key: string, load: () => Promise<T>): Promise<T> {
		const entry = this.#entries.get(key);
		const age = entry ? this.#now() - entry.storedAt : Infinity;
		if (entry && age < this.#ttlMs) {
			this.#touch(key, entry);
			this.#onEvent({ kind: 'hit', key, ageMs: age });
			return entry.value as T;
		}

		const pending = this.#inFlight.get(key);
		if (pending) return pending as Promise<T>;

		this.#onEvent({ kind: 'miss', key });
		const request = load()
			.then((value) => {
				this.#store(key, value);
				return value;
			})
			.catch((error: unknown) => {
				const current = this.#entries.get(key);
				const currentAge = current ? this.#now() - current.storedAt : Infinity;
				if (current && currentAge < this.#ttlMs + this.#staleMs) {
					this.#onEvent({ kind: 'stale', key, ageMs: currentAge });
					return current.value as T;
				}
				throw error;
			})
			.finally(() => this.#inFlight.delete(key));
		this.#inFlight.set(key, request);
		return request;
	}

	#touch(key: string, entry: Entry) {
		this.#entries.delete(key);
		this.#entries.set(key, entry);
	}

	#store(key: string, value: unknown) {
		this.#entries.delete(key);
		this.#entries.set(key, { value, storedAt: this.#now() });
		// Maps keep insertion order, so the first key is the least recently used.
		while (this.#entries.size > this.#max) {
			this.#entries.delete(this.#entries.keys().next().value!);
		}
	}
}
