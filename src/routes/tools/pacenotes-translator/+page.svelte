<script lang="ts">
	import {
		type Map,
		type MapContainer,
		type Config,
		type ConfigContainer
	} from './+page.server.ts';

	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { PageProps } from './$types';

	import { handleTranslation } from './translation_script.ts';

	import * as m from '$lib/paraglide/messages.js';
	import { Button } from 'wx-svelte-core';
	import Dropzone from 'svelte-file-dropzone';
	import Modal from '$lib/components/Modal.svelte';

	import { trackPageView, trackEvent } from '@lukulent/svelte-umami';
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
					console.log('Pacenotes loaded: ', data);
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
					console.log('Config loaded: ', data);
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
			link.className = "wx-button wx-secondary";
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
			<Dropzone on:drop={handlePacenoteFilesUpload} preventDropOnDocument={true} multiple={true} accept=".ini">
				{@html m.codriver_translator_upload_box()}
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
			<!--<button type="submit">Load Config</button>-->
			<Button type={'primary'}>{@html m.codriver_translator_translate()}</Button>
			<a aria-label="Download zip output button" href="./pacenotes-translator" bind:this={zipElement}
			></a>
		</form>
		<ul id="pacenotesListing">
			{#each filesPacenotes.accepted as pacenoteFile}
				<li>{pacenoteFile.name}</li>
			{/each}
		</ul>
	</div>

	<aside id="map-of-values">
		<div>
			<!-- TODO: Add a hover notice, that it might be difficult to map your own config -->
			<!-- TODO: Handle user config parsing later. It is not worth the hustle for now
      <p>Upload your current config:</p>
      <input
        bind:files={filesConfig}
        type="file"
        name="configToParse"
        id="configToParse"
        
        webkitdirectory
        multiple>
    </div>
    <br>-->
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
</style>
