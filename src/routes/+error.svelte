<script lang="ts">
	import { page } from '$app/state';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import * as m from '#lib/paraglide/messages.js';
	import Kicker from '#lib/components/Kicker.svelte';
</script>

<svelte:head>
	<title>{page.status} · Amun</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section>
	<Kicker>{m.error_kicker()}</Kicker>
	<h1>{page.status}</h1>
	<p>
		{page.status === 404
			? m.error_not_found()
			: page.status === 503
				? m.error_unavailable()
				: m.error_generic()}
	</p>
	<p><a href={localizeHref('/')}>{m.error_home()} →</a></p>
</section>

<style>
	section {
		padding-top: 1rem;
	}
	h1 {
		font-size: clamp(3rem, 12vw, 6rem);
		line-height: 1;
	}
	p {
		font-size: 1.15rem;
	}
</style>
