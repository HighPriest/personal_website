import { describe, expect, it } from 'vitest';
import { renderContent, SIZES } from './content.ts';
import { createMedia } from './media.ts';

// Markup as Ghost renders it (taken from the live posts, 2026-11-07).
const render = (html: string) =>
	renderContent(html, createMedia({ fetch: async () => new Response() }));

describe('code blocks', () => {
	it('highlights a known language, whatever its case', async () => {
		const html = await render(
			'<pre><code class="language-Powershell">cargo install deno --locked</code></pre>'
		);
		expect(html).toMatch(/^<pre class="shiki amun"[^>]*tabindex="0"/);
		expect(html).toContain('var(--code-token-');
		expect(html).toContain('deno');
	});

	it('leaves an unknown language and a block without one as Ghost wrote them', async () => {
		// The serializer writes character references in hex (&#x3C; for &lt;); the text is the same.
		expect(
			await render('<pre><code class="language-brainfuck">a &lt; b &amp;&amp; c</code></pre>')
		).toBe('<pre><code class="language-brainfuck">a &#x3C; b &#x26;&#x26; c</code></pre>');
		expect(await render('<pre><code>x &lt;= 1</code></pre>')).toBe(
			'<pre><code>x &#x3C;= 1</code></pre>'
		);
	});

	it('keeps the code card around a highlighted block', async () => {
		const html = await render(
			'<figure class="kg-card kg-code-card"><pre><code class="language-bash">ls</code></pre><figcaption>List</figcaption></figure>'
		);
		expect(html).toMatch(/^<figure class="kg-card kg-code-card"><pre class="shiki amun"/);
		expect(html).toContain('<figcaption>List</figcaption>');
	});
});

describe('images', () => {
	it('gives an own image without srcset one from the widths below its own', async () => {
		const html = await render(
			'<img src="https://amun.pl/content/images/2025/08/image-1.png" class="kg-image" alt="" loading="lazy" width="1200" height="34">'
		);
		expect(html).toContain(
			'srcset="https://amun.pl/content/images/size/w600/2025/08/image-1.png 600w, https://amun.pl/content/images/size/w1000/2025/08/image-1.png 1000w, https://amun.pl/content/images/2025/08/image-1.png 1200w"'
		);
		expect(html).toContain(`sizes="${SIZES}"`);
		expect(html).toContain('decoding="async"');
	});

	it("keeps Ghost's own srcset and replaces its sizes", async () => {
		const html = await render(
			'<img src="https://amun.pl/content/images/2025/04/image-7.png" class="kg-image" alt="" loading="lazy" width="983" height="305" srcset="https://amun.pl/content/images/size/w600/2025/04/image-7.png 600w, https://amun.pl/content/images/2025/04/image-7.png 983w" sizes="(min-width: 720px) 720px">'
		);
		expect(html).toContain(
			'/size/w600/2025/04/image-7.png 600w, https://amun.pl/content/images/2025/04/image-7.png 983w"'
		);
		expect(html).toContain(`sizes="${SIZES}"`);
	});

	it('moves third-party images to the media cache and drops inline handlers', async () => {
		const html = await render(
			'<figure class="kg-card kg-bookmark-card"><a class="kg-bookmark-container" href="https://github.com/glzr-io/glazewm"><div class="kg-bookmark-thumbnail"><img src="https://opengraph.githubassets.com/9dfb/glzr-io/glazewm" alt="" onerror="this.style.display = \'none\'"></div></a></figure>'
		);
		expect(html).toMatch(
			/<img src="\/blog\/media\/[0-9a-f]{24}" alt="" loading="lazy" decoding="async">/
		);
		expect(html).not.toContain('onerror');
		expect(html).not.toContain('githubassets');
	});
});

describe('embeds', () => {
	it('turns a YouTube player into a facade with the nocookie player and a cached poster', async () => {
		const html = await render(
			'<figure class="kg-card kg-embed-card"><iframe width="200" height="113" src="https://www.youtube.com/embed/fZ3FEQRCJog?feature=oembed" frameborder="0" allowfullscreen="" title="Kamil Filipek &amp; @M4TUSZ  PS Valstagna World Record Tie!"></iframe></figure>'
		);
		expect(html).not.toContain('<iframe');
		expect(html).toContain('href="https://www.youtube.com/watch?v=fZ3FEQRCJog"');
		expect(html).toContain(
			'data-embed="https://www.youtube-nocookie.com/embed/fZ3FEQRCJog?autoplay=1"'
		);
		expect(html).toMatch(/<img src="\/blog\/media\/[0-9a-f]{24}" alt="" width="480" height="360"/);
		expect(html).toContain(
			'<span class="kg-embed-title">Kamil Filipek &#x26; @M4TUSZ  PS Valstagna World Record Tie!</span>'
		);
		expect(html).toContain('<span class="kg-embed-provider">YouTube</span>');
	});

	it('turns another player into a facade without a poster, keeping its size', async () => {
		const html = await render(
			'<figure class="kg-card kg-embed-card"><iframe src="https://www.desmos.com/calculator/lngfi3k4fs?embed" width="500px" height="500px" style="border: 1px solid #ccc" frameborder="0"></iframe></figure>'
		);
		expect(html).toContain('data-embed="https://www.desmos.com/calculator/lngfi3k4fs?embed"');
		expect(html).toContain('style="aspect-ratio: 500 / 500; max-width: 500px"');
		expect(html).toContain(
			'<span class="kg-embed-text"><span class="kg-embed-provider">desmos.com</span></span>'
		);
		expect(html).not.toContain('<img');
	});
});

describe('cards that needed Ghost CSS or JS', () => {
	it("removes the <style> inside the file card's icon", async () => {
		const html = await render(
			'<div class="kg-card kg-file-card"><a class="kg-file-card-container" href="https://amun.pl/content/files/x.reg"><div class="kg-file-card-icon"><svg viewBox="0 0 24 24"><defs><style>.a{fill:none;}</style></defs><circle class="a" cx="12" cy="12" r="11.25"></circle></svg></div></a></div>'
		);
		expect(html).not.toContain('<style');
		expect(html).toContain('<circle class="a"');
	});

	it('turns a toggle card into a <details>, processing its content', async () => {
		const html = await render(
			'<div class="kg-card kg-toggle-card" data-kg-toggle-state="close"><div class="kg-toggle-heading"><h4 class="kg-toggle-heading-text"><span>Why?</span></h4><button class="kg-toggle-card-icon" aria-label="Expand toggle to read content"><svg></svg></button></div><div class="kg-toggle-content"><p><img src="https://example.com/a.png" alt=""></p></div></div>'
		);
		expect(html).toMatch(
			/^<details class="kg-card kg-toggle-card"><summary class="kg-toggle-heading"><h4 class="kg-toggle-heading-text"><span>Why\?<\/span><\/h4><\/summary><div class="kg-toggle-content"><p><img src="\/blog\/media\//
		);
		expect(html).not.toContain('<button');
	});
});
