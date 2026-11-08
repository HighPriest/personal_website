/**
 * Syntax highlighting for post code blocks, on the server. Shiki with
 * its JavaScript regex engine (no WebAssembly) and a fixed set of languages. Colours are CSS
 * variables (`--code-*`, defined in theme.scss), so code follows the light and dark schemes.
 */
import type { Element } from 'hast';
import { createCssVariablesTheme, createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

const theme = createCssVariablesTheme({ name: 'amun', variablePrefix: '--code-' });

/** Ghost's language names (any case) that differ from Shiki's. */
const aliases: Record<string, string> = {
	ps1: 'powershell',
	pwsh: 'powershell',
	sh: 'bash',
	shell: 'bash',
	zsh: 'bash',
	js: 'javascript',
	ts: 'typescript',
	yml: 'yaml'
};

let highlighter: Promise<HighlighterCore> | undefined;

function load() {
	highlighter ??= createHighlighterCore({
		themes: [theme],
		langs: [
			import('shiki/langs/bash.mjs'),
			import('shiki/langs/powershell.mjs'),
			import('shiki/langs/yaml.mjs'),
			import('shiki/langs/json.mjs'),
			import('shiki/langs/javascript.mjs'),
			import('shiki/langs/typescript.mjs'),
			import('shiki/langs/ini.mjs'),
			import('shiki/langs/html.mjs'),
			import('shiki/langs/css.mjs'),
			import('shiki/langs/diff.mjs')
		],
		engine: createJavaScriptRegexEngine()
	});
	return highlighter;
}

/**
 * The highlighted `<pre>` for `code` in Ghost's language `name`, or `null` when the language
 * isn't one we highlight (the block then stays as Ghost wrote it).
 */
export async function highlight(code: string, name: string): Promise<Element | null> {
	const shiki = await load();
	const lowered = name.toLowerCase();
	const lang = aliases[lowered] ?? lowered;
	if (!shiki.getLoadedLanguages().includes(lang)) return null;
	const root = shiki.codeToHast(code, { lang, theme: 'amun' });
	const pre = root.children[0];
	return pre?.type === 'element' ? pre : null;
}
