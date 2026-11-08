import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import JSZip from 'jszip';
import { expectNoNewA11yViolations } from './a11y.ts';

// The translator: its data (#lib/pacenotes/data.ts, hashed CSV assets fetched only for the
// chosen pair) and the whole flow, from choosing files to downloading the zip. The data is
// private and absent from the public repository.
test.skip(!existsSync('src/lib/pacenotes/data'), 'no mapping data in this checkout');

const STAGES = 'src/lib/pacenotes/fixtures/stages';

/** The CSV file names the page fetches from now on. */
function csvRequests(page: Page) {
	const names: string[] = [];
	page.on('request', (request) => {
		const path = new URL(request.url()).pathname;
		if (path.endsWith('.csv')) names.push(basename(path).replace(/\.[\w-]+\.csv$/, ''));
	});
	return names;
}

/** The call map's fields (a combobox each, with the target calls as suggestions). */
const calls = (page: Page) => page.locator('input[aria-label^="FilipekMod call for "]');
const save = (page: Page) => page.getByRole('button', { name: 'Save translated pacenotes' });

/** The translator, with its call map loaded and the page hydrated. */
async function open(page: Page) {
	await page.goto('/tools/pacenotes-translator');
	await expect(calls(page).first()).toBeAttached();
	await page.waitForLoadState('networkidle');
}

/** The golden output (src/lib/pacenotes/golden.test.ts) for a map: each file's text by name. */
function golden(map: string) {
	const text = readFileSync(`src/lib/pacenotes/data/golden/${map}.txt`, 'utf8').replaceAll(
		'\\r',
		'\r'
	);
	const sections = text.split(/^=== (.+)\n/m).slice(1);
	const byName = new Map<string, string>();
	// Sections are joined with \n: each but the last carries one more than its file's text.
	for (let i = 0; i < sections.length; i += 2) {
		const last = i + 2 >= sections.length;
		byName.set(basename(sections[i]), last ? sections[i + 1] : sections[i + 1].replace(/\n$/, ''));
	}
	return byName;
}

/** Saves, downloads the result from the dialog, and reads the zip: each file's text by path. */
async function saveAndDownload(page: Page) {
	await save(page).click();
	const dialog = page.getByRole('dialog', { name: 'Translation ready' });
	await expect(dialog).toBeVisible();
	const [download] = await Promise.all([
		page.waitForEvent('download'),
		dialog.getByRole('button', { name: 'Download the translated pacenotes' }).click()
	]);
	expect(download.suggestedFilename()).toBe('translated_pacenotes.zip');
	const zip = await JSZip.loadAsync(readFileSync(await download.path()));
	const files = new Map<string, string>();
	for (const entry of Object.values(zip.files).filter((entry) => !entry.dir)) {
		files.set(entry.name, await entry.async('string'));
	}
	return { dialog, files };
}

test('the translator fetches only the chosen pair, and again only what a new choice needs', async ({
	page
}) => {
	const fetched = csvRequests(page);
	await page.goto('/tools/pacenotes-translator');
	await expect(calls(page).first()).toBeAttached();
	expect(fetched.sort()).toEqual(['Handwerker14ToFilipek', 'config', 'config']);
	expect(await calls(page).count()).toBeGreaterThan(100);

	fetched.length = 0;
	await page.getByLabel('Translate from').selectOption('Original');
	await expect.poll(() => fetched.length).toBe(2);
	expect(fetched.sort()).toEqual(['OriginalToFilipek', 'config']);
});

test('opening the translator asks the server for no page data', async ({ page }) => {
	await page.goto('/tools');
	await page.waitForLoadState('networkidle');
	const dataRequests: string[] = [];
	page.on('request', (request) => {
		if (request.url().includes('__data.json')) dataRequests.push(request.url());
	});
	await page.getByRole('button', { name: 'Open the translator' }).click();
	await page.waitForURL((url) => url.pathname === '/tools/pacenotes-translator');
	await expect(calls(page).first()).toBeAttached();
	expect(dataRequests).toEqual([]);
});

test('a chosen folder is translated and downloaded, matching the golden output', async ({
	page
}) => {
	await open(page);
	await page.getByLabel('Choose folder').setInputFiles(STAGES);
	await expect(page.getByRole('status')).toContainText('Files 2');

	const { dialog, files } = await saveAndDownload(page);
	await expect(dialog).toContainText('Files translated: 2 (Handwerker14 → FilipekMod)');
	expect([...files.keys()].sort()).toEqual([
		'stages/stage-a_FilipekMod.ini',
		'stages/stage-b_FilipekMod.ini'
	]);
	const expected = golden('Handwerker14');
	for (const [path, text] of files) expect(text, path).toBe(expected.get(basename(path)));
});

test('single files are translated without a folder', async ({ page }) => {
	await open(page);
	await page.getByLabel('Choose files').setInputFiles(`${STAGES}/stage-b.ini`);
	const { files } = await saveAndDownload(page);
	expect([...files.keys()]).toEqual(['stage-b_FilipekMod.ini']);
});

test('dropped files are taken, and files other than .ini are skipped and named', async ({
	page
}) => {
	await open(page);
	const dataTransfer = await page.evaluateHandle(() => {
		const transfer = new DataTransfer();
		transfer.items.add(new File(['[PACENOTES]\ncount=0\n'], 'dropped.ini'));
		transfer.items.add(new File(['notes'], 'readme.txt'));
		return transfer;
	});
	// Files dragged anywhere over the page light the zone up, and a drop anywhere counts.
	const picker = page.getByRole('group', { name: 'Pacenote files' });
	const heading = page.getByRole('heading', { level: 1 });
	await heading.dispatchEvent('dragover', { dataTransfer });
	await expect(picker).toHaveClass(/dragging/);
	await heading.dispatchEvent('drop', { dataTransfer });
	await expect(picker).not.toHaveClass(/dragging/);
	await expect(picker).toContainText('Ready to translate: 1');
	await expect(page.getByRole('status')).toContainText('Files 1');
	await expect(page.getByRole('status')).toContainText('Skipped, not .ini (1): readme.txt');
});

test('a call map edit naming a call the target lacks stops the save and is marked', async ({
	page
}) => {
	await open(page);
	await page.getByLabel('Choose files').setInputFiles(`${STAGES}/stage-a.ini`);
	await page.getByRole('button', { name: 'Edit map' }).click();
	const field = calls(page).first();
	await field.fill('NO_SUCH_CALL');
	await save(page).click();
	const dialog = page.getByRole('dialog', { name: "Can't translate yet" });
	await expect(dialog).toContainText("name a FilipekMod call that doesn't exist");
	await expect(field).toHaveAttribute('aria-invalid', 'true');
});

test('the translator works by keyboard alone, the dialog included', async ({ page }) => {
	await open(page);
	/** The accessible name of the focused control, roughly: its label, or its own text. */
	const focused = () =>
		page.evaluate(() => {
			const active = document.activeElement as HTMLInputElement | null;
			const label = active?.getAttribute('aria-label') ?? active?.labels?.[0]?.textContent;
			return (label ?? active?.textContent ?? '').trim();
		});
	const reached: string[] = [];
	for (let i = 0; i < 30 && !reached.includes('Edit map'); i++) {
		await page.keyboard.press('Tab');
		reached.push(await focused());
	}
	for (const control of [
		'Choose folder',
		'Choose files',
		'Translate from',
		'Translate to',
		'Save translated pacenotes',
		'Reset',
		'Edit map'
	]) {
		expect(reached, control).toContain(control);
	}

	// No files yet: Enter on Save opens the error dialog; Escape closes it and focus returns.
	await save(page).focus();
	await page.keyboard.press('Enter');
	const dialog = page.getByRole('dialog', { name: "Can't translate yet" });
	await expect(dialog).toBeVisible();
	await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
	await expect(save(page)).toBeFocused();
});

test('axe passes on the translator and on its result dialog', async ({ page }) => {
	await open(page);
	await expectNoNewA11yViolations(page, 'translator');
	await page.getByLabel('Choose folder').setInputFiles(STAGES);
	await save(page).click();
	await expect(page.getByRole('dialog', { name: 'Translation ready' })).toBeVisible();
	await expectNoNewA11yViolations(page, 'translator-dialog');
});

test('the zip library loads only when translating', async ({ page }) => {
	const chunk = readdirSync('build/client/_app/immutable', { recursive: true, encoding: 'utf8' })
		.filter((file) => file.endsWith('.js'))
		.find((file) =>
			readFileSync(`build/client/_app/immutable/${file}`, 'utf8').includes('generateAsync')
		);
	expect(chunk, 'a client chunk with jszip').toBeTruthy();
	const name = basename(chunk!);
	const requested: string[] = [];
	page.on('request', (request) => requested.push(basename(new URL(request.url()).pathname)));

	await open(page);
	expect(requested).not.toContain(name);
	await page.getByLabel('Choose files').setInputFiles(`${STAGES}/stage-b.ini`);
	await save(page).click();
	await expect(page.getByRole('dialog', { name: 'Translation ready' })).toBeVisible();
	expect(requested).toContain(name);
});
