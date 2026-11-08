/**
 * Geometry for the front page's artwork (the doors' log stream, rally stage and antenna wave),
 * drawn by a seeded generator. Pure and seeded, so the server and the browser draw
 * exactly the same picture.
 */

type Point = { x: number; y: number };

/** A small seeded random number generator (mulberry32). */
export function seeded(seed: number) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export type LogBar = { x: number; y: number; w: number; tone: 'yellow' | 'blue' | 'muted' };

/** Rows of text-like bars for the blog door's log screen (one block; the view loops two). */
export function logBars(rows = 21, seed = 7): LogBar[] {
	const random = seeded(seed);
	const bars: LogBar[] = [];
	for (let row = 0; row < rows; row++) {
		let x = 40;
		const parts = 1 + Math.floor(random() * 3);
		for (let part = 0; part < parts && x < 190; part++) {
			const w = Math.min(14 + random() * 60, 200 - x);
			const r = random();
			bars.push({ x, y: 44 + row * 16, w, tone: r > 0.9 ? 'yellow' : r > 0.55 ? 'blue' : 'muted' });
			x += w + 6;
		}
	}
	return bars;
}

/** A winding rally stage through random waypoints, as a smooth path with length lookup. */
export function rallyStage(seed = 11) {
	const random = seeded(seed);
	const waypoints: Point[] = [{ x: 150, y: 388 }];
	for (let i = 1; i <= 9; i++) waypoints.push({ x: 45 + random() * 210, y: 388 - i * 40 });
	waypoints.push({ x: 150, y: 14 });

	// Catmull-Rom through the waypoints, as cubic Bézier segments.
	const segments: [Point, Point, Point, Point][] = [];
	for (let i = 0; i < waypoints.length - 1; i++) {
		const p0 = waypoints[i - 1] ?? waypoints[i];
		const [p1, p2] = [waypoints[i], waypoints[i + 1]];
		const p3 = waypoints[i + 2] ?? p2;
		segments.push([
			p1,
			{ x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
			{ x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
			p2
		]);
	}
	const f = (n: number) => n.toFixed(1);
	const d =
		`M${f(waypoints[0].x)} ${f(waypoints[0].y)}` +
		segments
			.map(
				([, c1, c2, end]) => ` C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(end.x)} ${f(end.y)}`
			)
			.join('');

	// Sample the curve densely and keep the running length, for points at a share of the length.
	const samples: Point[] = [];
	for (const [a, b, c, e] of segments) {
		for (let step = samples.length ? 1 : 0; step <= 24; step++) {
			const t = step / 24;
			const u = 1 - t;
			samples.push({
				x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * e.x,
				y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * e.y
			});
		}
	}
	const lengths = [0];
	for (let i = 1; i < samples.length; i++) {
		lengths.push(
			lengths[i - 1] + Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y)
		);
	}
	const total = lengths[lengths.length - 1];

	/** The point at `share` (0 to 1) of the stage's length. */
	function pointAt(share: number): Point {
		const target = Math.min(Math.max(share, 0), 1) * total;
		const i = lengths.findIndex((length) => length >= target);
		if (i <= 0) return samples[0];
		const k = (target - lengths[i - 1]) / (lengths[i] - lengths[i - 1] || 1);
		return {
			x: samples[i - 1].x + (samples[i].x - samples[i - 1].x) * k,
			y: samples[i - 1].y + (samples[i].y - samples[i - 1].y) * k
		};
	}

	return { d, pointAt };
}

/** The antenna's carrier wave along the bottom of its artwork. */
export function carrierWave(): string {
	const points: string[] = [];
	for (let x = 10; x <= 290; x += 3) {
		points.push(`${x},${(246 + 7 * Math.sin(x / 6) * Math.sin(x / 41)).toFixed(1)}`);
	}
	return `M${points.join(' L')}`;
}
