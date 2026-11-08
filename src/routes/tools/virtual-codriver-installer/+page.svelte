<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import * as m from '#lib/paraglide/messages.js';
	import Kicker from '#lib/components/Kicker.svelte';
	import VideoFacade from '#lib/components/VideoFacade.svelte';
	import CodriverRadio from '#lib/components/tools/CodriverRadio.svelte';

	const DOWNLOAD = 'https://github.com/HighPriest/RBR_copilot_installer/releases/latest';
	const SOURCE = 'https://github.com/HighPriest/RBR_copilot_installer';
	const KOFI = 'https://ko-fi.com/c/34010be854';

	/**
	 * The installer's screens, in order. To add a screenshot: put it in static/tools/install/ and
	 * set `image` (e.g. '/tools/install/1.png') and `alt` (what the screen shows). A step without
	 * an image shows its text only.
	 */
	type Step = { title: () => string; text: () => string; image?: string; alt?: () => string };
	const steps: Step[] = [
		{ title: m.installer_step1_title, text: m.installer_step1_text },
		{ title: m.installer_step2_title, text: m.installer_step2_text },
		{ title: m.installer_step3_title, text: m.installer_step3_text },
		{ title: m.installer_step4_title, text: m.installer_step4_text },
		{ title: m.installer_step5_title, text: m.installer_step5_text },
		{ title: m.installer_step6_title, text: m.installer_step6_text }
	];

	const rules = [
		m.installer_rule_numbers,
		m.installer_rule_hak,
		m.installer_rule_nawrot,
		m.installer_rule_szpila
	];
</script>

<Seo title="{m.tool_installer_title()} · Amun" description={m.installer_lead()} />

<!-- The co-driver at work, faint, behind the whole page. -->
<div class="backdrop">
	<CodriverRadio backdrop />
</div>

<!-- The first view: what it is, the download, and the video; the translator advert right below. -->
<section class="hero">
	<div class="pitch">
		<Kicker>
			<a href={localizeHref('/tools')}>{m.nav_simracing()}</a> / {m.tool_installer_title()}
		</Kicker>
		<h1>{m.tool_installer_title()}</h1>
		<p class="tagline">{m.installer_tagline()}</p>
		<p>{m.installer_intro()}</p>
		<p class="download">
			<a
				role="button"
				href={DOWNLOAD}
				rel="noopener"
				data-umami-event="outbound"
				data-umami-event-target="installer-download">{m.installer_download()}</a
			>
		</p>
		<p class="meta">
			{m.installer_meta()} · <a href={SOURCE} rel="noopener">{m.installer_source()}</a>
		</p>
	</div>
	<figure class="showcase">
		<VideoFacade
			id="fZ3FEQRCJog"
			title="Kamil Filipek & M4TUSZ · PS Valstagna"
			poster="/tools/virtual-codriver-demo.jpg"
			playLabel={m.installer_video_play()}
		/>
		<figcaption>{m.installer_video_text()}</figcaption>
	</figure>
</section>

<aside class="upgrade" aria-labelledby="upgrade-title">
	<!-- A pacenote rewritten for the new co-driver, faint behind the text. -->
	<svg class="art" viewBox="0 0 320 120" aria-hidden="true">
		<g class="note">
			<rect x="6" y="20" width="110" height="80" />
			<text x="20" y="52">6 R</text>
			<text x="20" y="80">100</text>
		</g>
		<path class="arrow" d="M132 60 h48 m-12 -12 l12 12 l-12 12" />
		<g class="note">
			<rect x="196" y="20" width="118" height="80" />
			<text x="210" y="52">6 PRAWY</text>
			<text x="210" y="80">100</text>
		</g>
	</svg>
	<div>
		<h2 id="upgrade-title">{m.installer_upgrade_title()}</h2>
		<p>{m.installer_upgrade_text()}</p>
	</div>
	<a role="button" href={localizeHref('/tools/pacenotes-translator')}>
		{m.tool_translator_open()}
	</a>
</aside>

<section aria-labelledby="features-title">
	<h2 id="features-title">{m.installer_features_title()}</h2>
	<!-- Each tile has a faint drawing of what it describes in its corner. -->
	<div class="features">
		<article>
			<svg class="art bars" viewBox="0 0 120 80" aria-hidden="true">
				{#each [18, 34, 52, 30, 64, 40, 22, 48, 58, 26, 38, 16] as height, i (i)}
					<rect x={4 + i * 10} y={40 - height / 2} width="6" {height} rx="2" />
				{/each}
			</svg>
			<h3>{m.installer_voices_title()}</h3>
			<p>{m.installer_voices_text()}</p>
		</article>
		<article>
			<svg class="art" viewBox="0 0 120 80" aria-hidden="true">
				<path d="M6 72 C 30 72, 30 20, 60 20 S 90 60, 114 8" />
				<circle cx="34" cy="50" r="4" />
				<circle cx="60" cy="20" r="4" />
				<circle cx="90" cy="44" r="4" />
				<text x="40" y="58">4</text>
				<text x="66" y="16">6</text>
				<text x="96" y="52">3</text>
			</svg>
			<h3>{m.installer_calls_title()}</h3>
			<ul>
				{#each rules as rule, i (i)}
					<li>{rule()}</li>
				{/each}
			</ul>
		</article>
		<article>
			<svg class="art" viewBox="0 0 120 80" aria-hidden="true">
				<rect x="24" y="22" width="72" height="50" rx="3" />
				<path d="M18 22 h84 v-12 h-84 z M50 36 h20" />
				<path d="M60 44 v18 m-8 -8 l8 8 l8 -8" />
			</svg>
			<h3>{m.installer_safe_title()}</h3>
			<p>{m.installer_safe_text()}</p>
		</article>
	</div>
</section>

<!-- A co-driver made from your own voice: its own panel, below the tiles. -->
<section class="own" aria-labelledby="own-title">
	<div>
		<Kicker>Ko-fi</Kicker>
		<h2 id="own-title">{m.installer_own_title()}</h2>
		<p class="lead">{m.installer_own_text()}</p>
		<p>{m.installer_own_practice()}</p>
		<p class="download">
			<a
				role="button"
				href={KOFI}
				rel="noopener"
				data-umami-event="outbound"
				data-umami-event-target="ko-fi">{m.installer_own_link()}</a
			>
		</p>
	</div>
	<!-- A microphone and the voice it records. -->
	<svg class="mic" viewBox="0 0 200 200" aria-hidden="true">
		<rect x="78" y="30" width="44" height="84" rx="22" />
		<path d="M62 92 a38 38 0 0 0 76 0 M100 130 v28 m-24 0 h48" />
		{#each [26, 44, 62, 34, 70, 48, 30] as height, i (i)}
			<rect x={18 + i * 4} y={100 - height / 2} width="2" {height} rx="1" class="bar" />
			<rect x={168 + i * 4 - 24} y={100 - height / 2} width="2" {height} rx="1" class="bar" />
		{/each}
	</svg>
</section>

<section aria-labelledby="steps-title">
	<h2 id="steps-title">{m.installer_steps_title()}</h2>
	<p>{m.installer_steps_lead()}</p>
	<ol class="steps">
		{#each steps as step, i (i)}
			<li>
				<h3>{step.title()}</h3>
				<p>{step.text()}</p>
				{#if step.image}
					<img src={step.image} alt={step.alt?.() ?? ''} loading="lazy" decoding="async" />
				{/if}
			</li>
		{/each}
	</ol>
	<p class="backup">{m.installer_backup()}</p>
</section>

<section class="end" aria-labelledby="end-title">
	<h2 id="end-title">{m.installer_end_title()}</h2>
	<p class="download">
		<a
			role="button"
			href={DOWNLOAD}
			rel="noopener"
			data-umami-event="outbound"
			data-umami-event-target="installer-download">{m.installer_download()}</a
		>
		<a href={localizeHref('/tools/pacenotes-translator')}>{m.tool_translator_open()} →</a>
	</p>
</section>

<style>
	/* Panel backgrounds the page's co-driver background shows through, faintly. */
	.upgrade,
	.features article,
	.own {
		--glass: color-mix(in srgb, var(--c-bg2) 82%, transparent);
	}
	section {
		margin-top: clamp(2.5rem, 6vw, 4rem);
	}
	/* The first view: the pitch beside the artwork on wide screens, above it on narrow ones. */
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: center;
		gap: 1.5rem 3rem;
		margin-top: 0;
		padding-top: 1rem;
	}
	.tagline {
		font-size: clamp(1.15rem, 2.4vw, 1.45rem);
		color: var(--c-text);
	}
	.download {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem 1.5rem;
		margin: 1.5rem 0 0.75rem;
	}
	.download [role='button'] {
		margin: 0;
		padding-inline: 1.75rem;
		font-size: 1.05rem;
	}
	.meta {
		color: var(--c-muted);
		font-size: 0.875rem;
	}
	@media (min-width: 960px) {
		.hero {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
		}
	}

	/* The translator advert: a framed band in the neon gradient. */
	.upgrade {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem 2rem;
		margin-top: 2rem;
		padding: 1.25rem 1.5rem;
		border: 1px solid;
		border-image: var(--fx-h) 1;
		background: var(--glass);
		backdrop-filter: blur(3px);
		clip-path: polygon(
			0 0,
			100% 0,
			100% calc(100% - var(--cut)),
			calc(100% - var(--cut)) 100%,
			0 100%
		);
	}
	.upgrade h2 {
		margin: 0 0 0.35rem;
		font-size: clamp(1.15rem, 2.4vw, 1.5rem);
	}
	.upgrade h2::after {
		display: none;
	}
	.upgrade p {
		margin: 0;
		color: var(--c-muted);
	}
	.upgrade [role='button'] {
		position: relative;
		margin: 0;
	}

	/* Faint drawings behind tile and band text: line art in the neon gradient, never in the way. */
	.art {
		position: absolute;
		pointer-events: none;
		fill: none;
		stroke: var(--c-neon-b);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.18;
	}
	.art text {
		fill: var(--c-neon-y);
		stroke: none;
		font-family: var(--f-mono);
		font-size: 20px;
		font-weight: 700;
	}
	.upgrade {
		position: relative;
		overflow: hidden;
	}
	.upgrade > div {
		position: relative;
	}
	/* Between the text and the button on wide screens; on narrow ones, no room: no drawing. */
	.upgrade .art {
		display: none;
		top: 50%;
		right: 13rem;
		width: 16rem;
		translate: 0 -50%;
	}
	@media (min-width: 960px) {
		.upgrade > div {
			max-width: calc(100% - 31rem);
		}
		.upgrade .art {
			display: block;
		}
	}
	.upgrade .arrow {
		stroke: var(--c-neon-y);
		stroke-width: 3;
	}

	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
		gap: 1.25rem;
	}
	.features article {
		position: relative;
		overflow: hidden;
		margin: 0;
		background: var(--glass);
		backdrop-filter: blur(3px);
	}
	.features .art {
		right: 0.75rem;
		bottom: 0.75rem;
		width: 7.5rem;
	}
	.features .bars rect {
		fill: var(--c-neon-b);
		stroke: none;
	}
	.features .art text {
		font-size: 14px;
	}
	.features h3 {
		position: relative;
		font-size: 1.15rem;
	}
	.features ul {
		margin: 0;
		padding-left: 1.1rem;
		font-size: 0.95rem;
	}

	/* Your own voice: a panel of its own, the pitch beside a microphone. */
	.own {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: center;
		gap: 1rem 3rem;
		padding: clamp(1.5rem, 4vw, 2.5rem);
		border: 1px solid;
		border-image: var(--fx-h) 1;
		background:
			radial-gradient(
					circle at 85% 50%,
					color-mix(in srgb, var(--c-neon-y) 12%, transparent),
					transparent 55%
				)
				padding-box,
			var(--glass);
		backdrop-filter: blur(3px);
		clip-path: polygon(
			0 0,
			100% 0,
			100% calc(100% - var(--cut)),
			calc(100% - var(--cut)) 100%,
			0 100%
		);
	}
	.own .lead {
		font-size: clamp(1.1rem, 2.2vw, 1.35rem);
		color: var(--c-text);
	}
	.own .download {
		margin-bottom: 0;
	}
	.mic {
		justify-self: center;
		width: min(14rem, 60%);
		fill: none;
		stroke: var(--c-neon-y);
		stroke-width: 4;
		stroke-linecap: round;
		filter: drop-shadow(0 0 0.6rem color-mix(in srgb, var(--c-neon-y) 50%, transparent));
	}
	.mic .bar {
		fill: var(--c-neon-b);
		stroke: none;
	}
	@media (min-width: 960px) {
		.own {
			grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
		}
	}

	/* The co-driver animation behind the whole page, under the content and the dock. The panels
	   over it are a little see-through (--glass), so it shows through them too. */
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
	}
	.showcase {
		margin: 0;
	}
	.showcase figcaption {
		margin-top: 0.5rem;
		color: var(--c-muted);
		font-size: 0.875rem;
	}

	/* The steps: numbered in the HUD style, each with an optional screenshot. */
	.steps {
		display: grid;
		gap: 1.5rem;
		padding: 0;
		counter-reset: step;
		list-style: none;
	}
	.steps li {
		position: relative;
		padding-left: 3.25rem;
		counter-increment: step;
	}
	.steps li::before {
		content: counter(step, decimal-leading-zero);
		position: absolute;
		top: 0;
		left: 0;
		font-family: var(--f-mono);
		font-size: 1.35rem;
		font-weight: 700;
		line-height: 1.2;
		color: var(--c-link);
	}
	.steps h3 {
		margin: 0 0 0.25rem;
		font-size: 1.1rem;
	}
	.steps p {
		margin: 0;
	}
	.steps img {
		display: block;
		max-width: 100%;
		height: auto;
		margin-top: 0.75rem;
		border: 1px solid var(--c-line);
	}
	.backup {
		padding: 0.75rem 1rem;
		border: 1px dashed var(--c-line);
		border-left: 2px solid var(--c-neon-y);
		color: var(--c-text);
	}

	.end {
		text-align: center;
	}
	.end .download {
		justify-content: center;
	}
</style>
