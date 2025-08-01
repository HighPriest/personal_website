<script lang="ts">
	import {
		type Map,
		type MapContainer,
		type Config,
		type ConfigContainer
	} from './types.ts';

	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { PageProps } from './$types';

	import { handleTranslation } from './translation_script.ts';
	import { detectConfigFiles, parseConfig } from './config_parse_script.ts';

	import * as m from '$lib/paraglide/messages.js';
	import Dropzone from 'svelte-file-dropzone';
	import Modal from '$lib/components/Modal.svelte';

	import { trackPageView, trackEvent } from '@lukulent/svelte-umami';
	import { error } from 'console';
	let { data }: PageProps = $props();

	let modalContents: string | undefined = $state(undefined);

	interface Settings {
		from: {
			name: string;
			config?: Config[];
		};
		to: {
			name: string;
			config?: Config[];
		};
	}

	let settings: Settings = $state({
		from: {
			name: 'Handwerker14'
		},
		to: {
			name: 'FilipekMod'
		}
	});
	type FileState = { accepted: File[]; rejected: File[] };
	let filesPacenotes: FileState = $state({
		accepted: [],
		rejected: []
	});
	let filesConfig: FileState = $state({
		accepted: [],
		rejected: []
	});
	let zipElement: HTMLAnchorElement;

	let configs = $derived({
		from: data.configsParsed.find((element) => element.name == settings.from.name)?.config,
		to: data.configsParsed.find((element) => element.name == settings.to.name)?.config
	});
	let maps: MapContainer[] = $derived(
		data.configsParsed.find((element) => element.name == settings.to.name)?.maps!
	);
	let mapPacenoteNames: { [old_pacenote: string]: string } = {};

	let _currentNote: string[] | undefined;

	onMount(() => {
		trackPageView({url: page.url.pathname });
	})

	$effect(() => {
		if (filesPacenotes.accepted) {
			const formData = new FormData();
			formData.append('state', 'load');
			for (const file of filesPacenotes.accepted) {
				formData.append('pacenotes', file);
			}

			trackEvent('RBR Files Upload', { type: 'Pacenotes'});

			fetch('/tools/pacenotes-translator?/loadPacenotes', {
				method: 'POST',
				body: formData
			})
				.then((response) => response.json())
				.then((data) => {
					$inspect('Pacenotes loaded: ', data);
				})
				.catch((error) => {
					console.error('Error loading pacenotes: ', error);
				});
		}
		if (filesConfig.accepted) {
			// TODO: Leave parsing config for later.
			// It is going to require inclusion of ini parser on client side & some replacement functions. Let's handle it in future stages
			const formData = new FormData();
			formData.append('state', 'load');
			for (const file of filesConfig.accepted) {
				formData.append('config', file);
			}

			trackEvent('RBR Files Upload', { type: 'Config'});

			fetch('/tools/pacenotes-translator?/loadConfig', {
				method: 'POST',
				body: formData
			})
				.then((response) => response.json())
				.then((data) => {
					$inspect('Config loaded: ', data);
				})
				.catch((error) => {
					console.error('Error loading config: ', error);
				});
		}
	});

	function handlePacenoteFilesUpload(event: {
		detail: { acceptedFiles: File[]; fileRejections: File[] };
	}) {
		const { acceptedFiles, fileRejections } = event.detail;

		filesPacenotes.accepted = [...filesPacenotes.accepted, ...acceptedFiles];
		filesPacenotes.rejected = [...filesPacenotes.rejected, ...fileRejections];
	}

	function handleConfigFilesUpload(event: {
		detail: {acceptedFiles: File[]; fileRejections: File[] };
	}) {
		const { acceptedFiles, fileRejections } = event.detail;

		let rootConfig = acceptedFiles.find((file => file.name.toLowerCase() === 'rbr.ini'));

		if (rootConfig) {
			detectConfigFiles(rootConfig, acceptedFiles).then((filesToParse) => {
				let configFile:ConfigContainer = {
					name: "Your config", // This is wrong, this needs to be called "Your Config", or taken from user input
					config: [],
					maps: []
				};
				filesToParse.forEach(fileToParse => {
					filesConfig.accepted = [...filesConfig.accepted, fileToParse]
					parseConfig(fileToParse).then((pacenotes) => {
						configFile.config.push(...pacenotes);
					});
				});
				
				// TODO: Add created config to the list of configs in data.configsParsed 
				data.configsParsed = [...data.configsParsed, configFile];

				// TODO: To each config, add this config as a map in data.mapsParsed
				data.configsParsed.forEach((config) => {
					if (config.name != configFile.name) {
						config.maps = [...config.maps, {name: configFile.name, map: []}]
					}
				})
			});
		// filesConfig.accepted = [...filesConfig.accepted, ...acceptedFiles];
		// TODO: (Unimportant) Move all the not used files from accepted to rejected
		filesConfig.rejected = [...filesConfig.rejected, ...fileRejections];
		} else {
			modalContents = 'No root config found. Please upload RBR.ini';
			console.error('No root config found. Please upload RBR.ini');
		}
	}

	function handleSave() {
		let new_maps: Map[] = [];

		// Update for each value in config from
		configs.from?.forEach((pacenote) => {
			// Check if the id is of a usable thing. Not some pacenote which doesn't have an id
			if (!isNaN(pacenote.id)) {
				let temp = '';
				// If the old_pacenote has a mapping in pacenotenames (they always should)
				if ((temp = mapPacenoteNames[pacenote.slot])) {
					const sourceMap = maps.find((element) => element.name === settings.from.name)!.map; // These values need to exist, because we are accessign them, because we have read them before
					const old_map = sourceMap.find((element) => element.old_pacenote === pacenote.slot); // These values might not exist before in the map

					// Generate a completely new map
					const new_map = {
						old_category: pacenote.category,
						old_id: pacenote.id,
						old_pacenote: pacenote.slot,
						// Take each pacenote, separated by +
						// map all these pacenote texts, to ids from "config.to"
						// filter out undefineds.
						// TODO: Now that I think about it. It shouldn't happen that we don't match some value.
						// Also add try, catch with modal error here, when values are missing in config.to.
						// Just in case the user has put in wrong value & we have not caught it before
						new_category: temp
							.split('+')
							.map((note) => configs.to?.find((value) => value.slot === note)?.category)
							.filter((category) => category !== undefined),
						new_id: temp
							.split('+')
							.map((note) => configs.to?.find((value) => value.slot === note)?.id)
							.filter((id) => id !== undefined),
						new_pacenote: temp
							.split('+')
							.map((note) => configs.to?.find((value) => value.slot === note)?.slot)
							.filter((slot) => slot !== undefined)
					};

					/*if (old_map != undefined) {
              Object.assign(old_map, new_map);
            } else {
              sourceMap.push(new_map);
            }*/
					new_maps.push(new_map);
					// Update current map
				}
			}
		});

		return new_maps;
	}

	async function handleSubmit(event) {
		event.preventDefault();

		// Find a relevant map, from the "from" list
		// When I am going to handle importing configs, the "Personal config" is going to be added to the FROM list. So, this is going to work fine.
		let map = handleSave();

		let missing_map;
		try {
			// Validate file upload, map existence & some selection being made for settings.from & settings to
			if (!filesPacenotes || !map || !settings.from.name || !settings.to.name) {
				throw new Error('Missing required fields');
			}

			// Validate that all pacenotes have valid mappings
			const isValid = configs.from!.every((element) => {
				missing_map = element.slot;
				return (
					configs.to?.some((config) =>
						config.slot.localeCompare(mapPacenoteNames[element.slot].split('+').pop()!, undefined, {
							sensitivity: 'accent'
						})
					) ?? false
					// TODO: Make sure this doesn't error out on split. Instead, throws a valid error on value missing.
				);
			});
			if (!isValid) {
				throw new Error('Invalid or missing pacenote mappings detected');
			}
		} catch (error) {
			// TODO: Add a modal about missing map.
			modalContents = 'Validation failed<br>Check contents of element: ' + missing_map;
			console.error('Last checked element:', missing_map);
			console.error('Validation failed: ', error);
			return;
		}

		await handleTranslation(
			filesPacenotes.accepted,
			map,
			/*mapPacenoteNames,*/ settings.to.name
		).then((blob) => {
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.className = "";
			link.style = "font-size: 2em; font-weight: bold";
			link.download = 'translated_pacenotes.zip';
			link.text = m.codriver_translator_download();
			zipElement.replaceWith(link);
		});
	}

	/*
  Function for filtering unique categories in a category. I have no idea how to separate individual Slots by category. So it stays here for future reference.
  function onlyUnique(config:Config, index:number, array:Config[]):boolean {
    return array.findIndex(c => c.category === config.category) === index;
  } */

	function sortingConfig(a: Config, b: Config) {
		if (a.slot < b.slot) {
			return -1;
		}
		if (a.slot > b.slot) {
			return 1;
		}
		return 0;
	}
</script>

{#if modalContents}
	<Modal message={modalContents} onClose={() => (modalContents = undefined)} />
{/if}

<h1>Virtual CoDriver</h1>

<article>
	<div style="max-width: 25em;">
		<p>{@html m.codriver_translator_subtitle()}</p>
		<form onsubmit={handleSubmit}>
			<!-- TODO: Replace the button with something that makes it clear, that we want a folder -->
			<!-- TODO: Make it also accept individual files -->
			<Dropzone containerClasses="customDropzone" disableDefaultStyles={true} on:drop={handlePacenoteFilesUpload} preventDropOnDocument={true} multiple={true} accept=".ini">
				<div style="pointer-events: none; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
					<svg style="scale: 2.5;" xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-file-analytics"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 17l0 -5" /><path d="M12 17l0 -1" /><path d="M15 17l0 -3" /></svg>
					<p style="font-size: 1.25rem; line-height: 1.5rem; color: rgb(107,114,128);">
						{@html m.codriver_translator_pacenote_upload_box()}
					</p>
					<!--<p style="font-size: 0.75rem; line-height: 1rem; color: rgb(107,114,128);">
						{accept}
						{#if maxSize}
							<span>(Size limit: {formatFileSize(maxSize)})</span>
						{/if}
					</p>-->
				</div>
			</Dropzone>
			<!--<input
				bind:files={filesPacenotes}
				type="file"
				name="pacenotesToTranslate"
				id="pacenotesToTranslate"
				webkitdirectory
				multiple
			/>-->
			<br /><br />
			<!--TODO: Create configuration parsing in JavaScript-->
			<!-- When configuration is uploaded, just create a new translate from map, without anything on output -->
			<button type="submit">{@html m.codriver_translator_translate()}</button>
			<br /><br />
			<!--<Button type={'primary'}>{@html m.codriver_translator_translate()}</Button>-->
			<a aria-label="Download zip output button" href="./pacenotes-translator" bind:this={zipElement}
			></a>
		</form>
		<ul id="uploadedFiles">
			<h3>Uploaded Configs</h3>
			{#each filesConfig.accepted as configFile}
				<li>{configFile.name}</li>
			{/each}
			<h3>Uploaded Pacenotes</h3>
			{#each filesPacenotes.accepted as pacenoteFile}
				<li>{pacenoteFile.name}</li>
			{/each}
		</ul>
	</div>

	<aside id="map-of-values">
		<div>
			<!-- TODO: Add a hover notice, that it might be difficult to map your own config -->
			<!-- TODO: Handle user config parsing later. It is not worth the hustle for now -->
			<div>
				<p>Upload your current, personal config:</p>
				<Dropzone     
					on:dragover={() => {
						const dz = document.querySelector('.customDropzone');
						if (dz) dz.classList.add('dragover');
					}}
					on:dragleave={() => {
						const dz = document.querySelector('.customDropzone');
						if (dz) dz.classList.remove('dragover');
					}}
					on:drop={() => {
						const dz = document.querySelector('.customDropzone');
						if (dz) dz.classList.remove('dragover');
					}}
					containerClasses="customDropzone" disableDefaultStyles={true} on:drop={handleConfigFilesUpload} preventDropOnDocument={true} noClick={true} accept=".ini">
					<div style="pointer-events: none; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
						<svg style="scale: 2.5;" xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-file-analytics"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 17l0 -5" /><path d="M12 17l0 -1" /><path d="M15 17l0 -3" /></svg>
						<p style="font-size: 1.25rem; line-height: 1.5rem; color: rgb(107,114,128);">
							{@html m.codriver_translator_config_upload_box()}
						</p>
					</div>
				</Dropzone>
			</div>
			<br>
			<div class="inline">
				<div>
					<p>{@html m.codriver_translator_translate_from()}</p>
					<select
						name="configInput"
						id="configInput"
						bind:value={settings.from.name}
						class:invalid={!settings.from.name}
					>
						{#each maps as config}
							<option value={config.name}>{config.name}</option>
						{/each}
					</select>
				</div>
				<p style="display:inline;"></p>
				<div>
					<p>{@html m.codriver_translator_translate_to()}</p>
					<select
						name="configOutput"
						id="configOutput"
						bind:value={settings.to.name}
						class:invalid={!settings.to.name}
					>
						{#each data.configsParsed as config}
							<option value={config.name}>{config.name}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="inline">
				<br />
				<h3>{@html m.codriver_translator_map()}</h3>
				<!-- Tworzy linijkę dla każdego translate config.from -->
				<!-- Daje możliwość zmiany wartości Translate to -->
				<!-- Datalist opcji jest brany z Translate to -->
				{#each configs.from! as pacenote}
					{#if !isNaN(pacenote.id)}
						{#if (_currentNote = maps
							.find((element) => element.name == settings.from.name)
							?.map.find((element) => element.old_id == pacenote.id)?.new_pacenote)}
							{void (mapPacenoteNames[pacenote.slot] = _currentNote.join('+'))}
						{/if}
						<div>
							<span> {pacenote.slot} =>
							<input
								type="text"
								list="id_new"
								bind:value={mapPacenoteNames[pacenote.slot]}
								name={pacenote.id.toString()}
								id={pacenote.slot + '_' + pacenote.id}
							/> </span>
							<!-- TODO: Add visual validation, so no row is empty -->
						</div>
						<br />
					{/if}
					{void (_currentNote = undefined)}
				{/each}
				<datalist id="id_new">
					{#each data.configsParsed
						.find((element) => element.name == settings.to.name)
						?.config.sort(sortingConfig) ?? [] as config}
						<option value={config.slot}></option>
						<!-- TODO: As NAME, attach polish translations to new_pacenote, so it is easier for people to find stuff out -->
						<!-- This requires augmenting config files with translations -->
					{/each}
				</datalist>
			</div>
		</div>
	</aside>
</article>

<style lang="scss">
	article {
		width: 100%;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-content: space-between;
		justify-content: center;
	}

	#map-of-values {
		.inline {
			text-align: end;
			div {
				display: inline-block;
				overflow: visible;
    			width: max-content;
			}
		}
	}

	:global(.customDropzone) {
		position: relative;
		display: flex;
		min-height: 200px;
		width: 300px;
		cursor: pointer;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		border-radius: 0.75rem;
		border-width: 2px;
		border-style: dashed;
		border-color: #d1d5db;
		background-color: #f9fafb;
		padding: 1.5rem;
		text-align: center;
		transition: color, background-color, border-color, text-decoration-color, fill, stroke;
		transition-duration: 0.5s;
		border-color: #374151;
		background-color: #1f2937;
		&:hover, &:focus, &.dragover {
			background-color: #f3f4f6;
			svg {
				color: black;
			}
		}
	}
</style>
