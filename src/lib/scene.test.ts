import { describe, expect, it } from 'vitest';
import { carrierWave, logBars, rallyStage, seeded } from './scene.ts';

describe('front page artwork', () => {
	it('is the same on every run, so server and browser draw the same picture', () => {
		expect(logBars()).toEqual(logBars());
		expect(rallyStage().d).toBe(rallyStage().d);
		expect(carrierWave()).toBe(carrierWave());
		const a = seeded(3);
		const b = seeded(3);
		expect([a(), a(), a()]).toEqual([b(), b(), b()]);
	});

	it('keeps the log bars inside the screen', () => {
		for (const bar of logBars()) {
			expect(bar.x).toBeGreaterThanOrEqual(40);
			expect(bar.x + bar.w).toBeLessThanOrEqual(200);
		}
	});

	it('runs the stage from the start at the bottom to the finish at the top', () => {
		const stage = rallyStage();
		expect(stage.pointAt(0)).toEqual({ x: 150, y: 388 });
		const finish = stage.pointAt(1);
		expect(finish.x).toBeCloseTo(150, 0);
		expect(finish.y).toBeCloseTo(14, 0);
		// Points move steadily up the stage as the share grows.
		expect(stage.pointAt(0.25).y).toBeGreaterThan(stage.pointAt(0.75).y);
	});
});
