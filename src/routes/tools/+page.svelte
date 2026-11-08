<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import * as m from '#lib/paraglide/messages.js';
	import Kicker from '#lib/components/Kicker.svelte';
	import ToolCard from '#lib/components/tools/ToolCard.svelte';
</script>

<Seo title="{m.tools_title()} · Amun" description={m.tools_lead()} />

<header>
	<Kicker>{m.tools_kicker()}</Kicker>
	<h1>{m.tools_title()}</h1>
	<p class="lead">{m.tools_lead()}</p>
</header>

<div class="tools">
	<ToolCard
		tags={['RBR · NGPCarMenu', m.tools_runs_in_browser()]}
		title={m.tool_translator_title()}
		text={m.tool_translator_text()}
	>
		{#snippet callout()}
			<b>6 R</b> → <b>six right</b> · <b>4 L tightens</b> → <b>four left, tightens</b>
		{/snippet}
		{#snippet actions()}
			<a role="button" href={localizeHref('/tools/pacenotes-translator')}>
				{m.tool_translator_open()}
			</a>
		{/snippet}
	</ToolCard>
	<ToolCard
		tags={['RBR · Plugin', 'Windows']}
		title={m.tool_installer_title()}
		text={m.tool_installer_text()}
	>
		{#snippet callout()}
			{m.tool_installer_needs()} <b>RBR + NGPCarMenu</b> · {m.tool_installer_voices()}
		{/snippet}
		{#snippet actions()}
			<a href={localizeHref('/tools/virtual-codriver-installer')}>{m.tool_installer_open()} →</a>
		{/snippet}
	</ToolCard>
</div>

<style>
	header {
		padding-top: 1rem;
	}
	.lead {
		font-size: clamp(1.1rem, 2.6vw, 1.45rem);
		max-width: 40ch;
	}
	.tools {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
		gap: 1.25rem;
	}
</style>
