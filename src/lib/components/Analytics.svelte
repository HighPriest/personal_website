<!--
	@component
	Umami analytics: cookieless, aggregated page views and a few click events.
	Umami's own page-view tracking is off: it hooks the browser history in a way that turned
	SvelteKit's client-side navigation into full reloads. Instead, a page view is recorded after
	every navigation (afterNavigate), the first one included. Click events need no code: Umami
	records clicks on elements with `data-umami-event` (and `data-umami-event-*` properties).
	`data-domains` keeps the script quiet anywhere but amun.pl (dev, previews, tests). Umami is
	served from the site's own address, where ad blockers don't look for analytics hosts; outside
	production nothing answers /s/, so the script simply doesn't load. The script's id must not
	be "umami": the browser would expose the element as window.umami, and the tracker would then
	never install itself there.
-->
<script lang="ts">
	import { afterNavigate } from '$app/navigation';

	// Served by the site itself: the reverse proxy in front of it passes /s/script.js and
	// /s/api/send to Umami, and the tracker sends its reports next to the script, to /s/api/send.
	const SCRIPT = '/s/script.js';
	const WEBSITE = 'e1237ef3-a2b6-4163-9057-fbde1c4faef4';

	type Payload = Record<string, unknown>;
	type Umami = { track: (event: (payload: Payload) => Payload) => void };
	const umami = () => (window as unknown as { umami?: Umami }).umami;

	/** A page view for the page shown now: sent at once, or when the deferred script arrives. */
	function pageView() {
		const url = location.pathname + location.search;
		const title = document.title;
		const send = (tracker: Umami) => tracker.track((payload) => ({ ...payload, url, title }));
		const tracker = umami();
		if (tracker) return send(tracker);
		document.getElementById('umami-script')?.addEventListener(
			'load',
			() => {
				const loaded = umami();
				if (loaded) send(loaded);
			},
			{ once: true }
		);
	}

	afterNavigate(pageView);
</script>

<svelte:head>
	<script
		id="umami-script"
		defer
		src={SCRIPT}
		data-website-id={WEBSITE}
		data-auto-pageview="false"
		data-domains="amun.pl"
	></script>
</svelte:head>
