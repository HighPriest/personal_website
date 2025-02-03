<script lang="ts">
	import {
		type Map,
		type MapContainer,
		type Config,
		type ConfigContainer
	} from './+page.server.ts';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();

  import Modal from '$lib/components/Modal.svelte';
  let modalContents: string | undefined = $state(undefined);

	import { handleTranslation } from './translation_script.ts';

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
	let filesPacenotes: FileList | undefined = $state<FileList>();
	let filesConfig: FileList | undefined = $state<FileList>();
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

	$effect(() => {
		if (filesPacenotes) {
			const formData = new FormData();
			formData.append('state', 'load');
			for (const file of filesPacenotes) {
				formData.append('pacenotes', file);
			}

			fetch('/tools/virtual-codriver?/loadPacenotes', {
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
		if (filesConfig) {
			// TODO: Leave parsing config for later.
			// It is going to require inclusion of ini parser on client side & some replacement functions. Let's handle it in future stages
			const formData = new FormData();
			formData.append('state', 'load');
			for (const file of filesConfig) {
				formData.append('config', file);
			}

			fetch('/tools/virtual-codriver?/loadConfig', {
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

  function handleSave() {
    let new_maps: Map[] = [];

      // Update for each value in config from
      configs.from?.forEach((pacenote) => {
        // Check if the id is of a usable thing. Not some pacenote which doesn't have an id
        if (!isNaN(pacenote.id)) {
          let temp = "";
          // If the old_pacenote has a mapping in pacenotenames (they always should)
          if (temp = mapPacenoteNames[pacenote.slot]) {
            const sourceMap = maps.find((element) => element.name === settings.from.name)!.map // These values need to exist, because we are accessign them, because we have read them before  
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
              new_category: temp.split('+').map((note) => configs.to?.find((value) => value.slot === note)?.category).filter(category => category !== undefined),
              new_id: temp.split('+').map((note) => configs.to?.find((value) => value.slot === note)?.id).filter(id => id !== undefined),
              new_pacenote: temp.split('+').map((note) => configs.to?.find((value) => value.slot === note)?.slot).filter(slot => slot !== undefined)
            }

            /*if (old_map != undefined) {
              Object.assign(old_map, new_map);
            } else {
              sourceMap.push(new_map);
            }*/
           new_maps.push(new_map);
            // Update current map
          }
        }
      })

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
					configs.to?.some((config) => config.slot.localeCompare(mapPacenoteNames[element.slot].split('+').pop()!, undefined, { sensitivity: 'accent'})) ?? false
          // TODO: Make sure this doesn't error out on split. Instead, throws a valid error on value missing.
				);
			});
			if (!isValid) {
				throw new Error('Invalid or missing pacenote mappings detected');
			}
		} catch (error) {
      // TODO: Add a modal about missing map.
      modalContents = 'Validation failed<br>Last checked element: ' + missing_map;
      console.error('Last checked element:', missing_map);
			console.error('Validation failed: ', error);
			return;
		}

		await handleTranslation(filesPacenotes, map, /*mapPacenoteNames,*/ settings.to.name).then(
			(blob) => {
				const link = document.createElement('a');
				link.href = URL.createObjectURL(blob);
				link.download = 'translated_pacenotes.zip';
				link.text = 'Download translated pacenotes!';
				zipElement.replaceWith(link);
			}
		);
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
  <Modal message = {modalContents} onClose = {() => modalContents = undefined}/>
{/if}

<h1>Virtual CoDriver</h1>
<p>CoDriver Download & Pacenotes Converter</p>

<article>
	<div>
		<form onsubmit={handleSubmit}>
			<p>Attach your pacenotes directory <br> e.g. <code>RBR\Plugins\NGPCarMenu\MyPacenotes</code></p>
			<input
				bind:files={filesPacenotes}
				type="file"
				name="pacenotesToTranslate"
				id="pacenotesToTranslate"
				webkitdirectory
				multiple
			/>
			<br /><br />
			<!--TODO: Create configuration parsing in JavaScript-->
			<!-- When configuration is uploaded, just create a new translate from map, without anything on output -->
			<!--<button type="submit">Load Config</button>-->
			<button type="submit">Translate</button>
			<a aria-label="Download zip output button" href="./virtual-codriver" bind:this={zipElement}
			></a>
		</form>
		<ul id="pacenotesListing">
			{#each Array.from(filesPacenotes ?? []) as pacenoteFile}
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
			<div>
				<p>Translate from:</p>
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
				<p>Translate to:</p>
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
			<p>Map of Values</p>
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
						<span> {pacenote.slot + ' => '} </span>
						<input
							type="text"
							list="id_new"
							bind:value={mapPacenoteNames[pacenote.slot]}
							name={pacenote.id.toString()}
							id={pacenote.slot + '_' + pacenote.id}
						/>
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
	</aside>
</article>

<style lang="scss">
	article {
		display: flex;
		flex-direction: row;
	}

	#map-of-values {
		div {
			display: inline-block;
		}
	}
</style>
