<script lang="ts">
  import { type Map, type MapContainer, type Config, type ConfigContainer } from './+page.server.ts';
  import type { PageProps } from "./$types";
  let { data }: PageProps = $props();

  import { handleTranslation } from './translation_script.ts';

  interface Settings {
    from: {
      name: string;
      config?: Config[]
    };
    to: {
      name: string;
      config?: Config[]
    }
  }

  let settings:Settings = $state({
    from: {
      name: "Original",
    },
    to: {
      name: "FilipekMod",
    },
  });
  let filesPacenotes:FileList | undefined = $state<FileList>();
  let filesConfig:FileList | undefined = $state<FileList>();
  let zipElement: HTMLAnchorElement;

  let configs = $derived({
    from: data.configsParsed.find((element) => element.name == settings.from.name)?.config,
    to: data.configsParsed.find((element) => element.name == settings.to.name)?.config
  })
  let maps:MapContainer[] = $derived(data.configsParsed.find((element) => element.name == settings.to.name)?.maps!);
  let mapPacenoteNames: { [old_pacenote: string]: string} = {};

  let _currentNote:string | undefined;

  $effect(() => {
    if(filesPacenotes) {
      const formData = new FormData();
      formData.append('state', 'load');
      for (const file of filesPacenotes) {
        formData.append('pacenotes', file);
      }

      fetch('/api/virtual-codriver', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        console.log('Pacenotes loaded: ', data);
      })
      .catch(error => {
        console.error('Error loading pacenotes: ', error);
      });
    }
    if(filesConfig) {
      // TODO: Leave parsing config for later.
          // It is going to require inclusion of ini parser on client side & some replacement functions. Let's handle it in future stages
      const formData = new FormData();
      formData.append('state', 'load');
      for (const file of filesConfig) {
        formData.append('config', file);
      }

      fetch('/api/virtual-codriver', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        console.log('Config loaded: ', data);
      })
      .catch(error => {
        console.error('Error loading config: ', error);
      });
    }
  })

  async function handleSubmit(event) {
    event.preventDefault();
    let map_id = maps.find((element) => element.name == settings.from.name)?.map

    try {
      // Validate file upload, map existence & some selection being made for settings.from & settings to
      if(!filesPacenotes || !map_id || !settings.from.name || !settings.to.name) {
        throw new Error('Missing required fields');
      };

      // Validate that all pacenotes have valid mappings
      const isValid = configs.from!.every(element => {
          return configs.to?.some(config => 
              config.slot === mapPacenoteNames[element.slot]
          ) ?? false;
      });
      if (!isValid) {
          throw new Error('Invalid or missing pacenote mappings detected');
      }
    } catch (error) {
      console.error('Validation failed:', error);
      return;
    }

    await handleTranslation(filesPacenotes, map_id, mapPacenoteNames, settings.to.name)
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "translated_pacenotes.zip";
        link.text = "Download translated pacenotes!";
        zipElement.replaceWith(link);
      });

    // Proceed with form submission
    // console.log('Form submitted:', { selectedIdMap, newValue, oldValue });
    // Add your server-side submission logic here
  }

  /*
  Function for filtering unique categories in a category. I have no idea how to separate individual Slots by category. So it stays here for future reference.
  function onlyUnique(config:Config, index:number, array:Config[]):boolean {
    return array.findIndex(c => c.category === config.category) === index;
  } */

  function sortingConfig (a:Config, b:Config) {
    if (a.slot < b.slot) {
      return -1;
    }
    if (a.slot > b.slot) {
      return 1;
    }
    return 0;
  }
</script>

<h1>Virtual CoDriver</h1>
<p>CoDriver Download & Pacenotes Converter</p>

<article>
  <div>
    <form onsubmit={handleSubmit}>
      <p>Attach your pacenotes directory</p>
      <p>The translation process is handled locally<br>None of your files are saved on any server</p>
      <input
        bind:files={filesPacenotes}
        type="file"
        name="pacenotesToTranslate"
        id="pacenotesToTranslate"
        webkitdirectory
        multiple>
      <br><br>
      <!--TODO: Create configuration parsing in JavaScript-->
      <!--<button type="submit">Load Config</button>-->
      <button type="submit">Translate</button>
      <a aria-label="Download zip output button" href="./virtual-codriver" bind:this={zipElement}></a>
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
      <select name="configInput" id="configInput"
              bind:value={settings.from.name} class:invalid={!settings.from.name}>
            {#each maps as config}
              <option value="{config.name}">{config.name}</option>
            {/each}
      </select>
    </div>
    <div>
      <p>Translate to:</p>
      <select name="configOutput" id="configOutput"
              bind:value={settings.to.name} class:invalid={!settings.to.name}>
            {#each data.configsParsed as config}
              <option value="{config.name}">{config.name}</option>
            {/each}
      </select>
    </div>
    <p>Map of Values</p>
    <!-- Stwórz linijkę dla każdego translate from -->
    <!-- Daj możliwość zmiany Translate to -->
    <!-- List opcji ma być dla Translate to -->
    {#each configs.from! as pacenote}
    {#if !isNaN(pacenote.id)}
    {#if _currentNote = maps.find((element) => element.name == settings.from.name)?.map.find((element) => element.old_pacenote == pacenote.slot)?.new_pacenote}
      {(void (mapPacenoteNames[pacenote.slot] = _currentNote))}
    {/if}
    <div>
      <!-- TODO: As NAME, attach polish translations to old_pacenote, so it is easier for people to find stuff out -->
      <!-- TODO: Maybe also attach translation to new_pacenote & display it -->
      <span> {pacenote.slot + " => "} </span>
      <input
      type="text"
      list="id_new"
      bind:value={mapPacenoteNames[pacenote.slot]}
      name={pacenote.id}
      id={pacenote.slot + "_" + pacenote.id}
      /> 
      <!-- TODO: Write validation, so no row is empty -->
    </div>
    <br>
    {/if}
    {(void (_currentNote = undefined))}
    {/each}
    <datalist id="id_new">
      {#each data.configsParsed.find((element) => element.name == settings.to.name)?.config.sort(sortingConfig) ?? [] as config}
        <option value={config.slot}></option>
      {/each}
    </datalist>
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
