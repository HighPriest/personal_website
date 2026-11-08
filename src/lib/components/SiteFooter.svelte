<!--
	@component
	The site footer: copyright, the contact address and the social links, Telegram
	among them. The front page has no footer.
-->
<script lang="ts">
	import * as m from '#lib/paraglide/messages.js';
	import { telegram } from '#lib/contact.js';

	const year = new Date().getFullYear();

	const socials = [
		{
			name: 'YouTube',
			href: 'https://www.youtube.com/@DriftJunkie',
			icon: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.7 2 12 2 12s0 3.3.4 4.8a2.5 2.5 0 0 0 1.8 1.8c1.5.4 7.8.4 7.8.4s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.5.4-4.8.4-4.8s0-3.3-.4-4.8Z M10 15V9l5.2 3Z'
		},
		{
			name: 'LinkedIn',
			href: 'https://www.linkedin.com/in/kamil--marek',
			icon: 'M4 4h16v16H4Z M8 10.5V16 M8 7.8v.1 M11.5 16v-5.5 M11.5 13c0-1.6 1-2.6 2.3-2.6s2.2.9 2.2 2.6V16'
		},
		{
			name: 'GitHub',
			href: 'https://github.com/HighPriest',
			icon: 'M9 19c-4.3 1.4-4.3-2.5-6-3 M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21'
		},
		telegram
	];
</script>

<footer>
	<hr />
	<div class="row">
		<p>
			© {year} Amun · Kamil Filipek ·
			<a href="mailto:contact@amun.pl">contact@amun.pl</a>
		</p>
		<ul aria-label={m.footer_social()}>
			{#each socials as social (social.name)}
				<li>
					<!-- Umami records the click: Telegram as a contact, the rest as outbound links. -->
					<a
						href={social.href}
						target="_blank"
						rel="noopener"
						aria-label={social.name}
						data-umami-event={social === telegram ? 'contact' : 'outbound'}
						data-umami-event-channel={social === telegram ? 'telegram' : undefined}
						data-umami-event-place={social === telegram ? 'footer' : undefined}
						data-umami-event-target={social === telegram ? undefined : social.name.toLowerCase()}
					>
						<svg viewBox="0 0 24 24" aria-hidden="true"><path d={social.icon} /></svg>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</footer>

<style>
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem 1.5rem;
	}
	p {
		margin: 0;
		font-family: var(--f-mono);
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--c-muted);
	}
	ul {
		display: flex;
		gap: 0.25rem;
		margin: 0;
		padding: 0;
	}
	li {
		list-style: none;
		margin: 0;
	}
	/* 2.75 rem targets: comfortable for touch, well above the 24 px minimum. */
	ul a {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		color: var(--c-muted);
	}
	ul a:is(:hover, :focus-visible) {
		color: var(--c-link-hover);
	}
	svg {
		width: 1.25rem;
		height: 1.25rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.6;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
</style>
