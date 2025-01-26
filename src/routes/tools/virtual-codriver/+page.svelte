<script lang="ts">
  import { type Map, type MapParsed, type Config, type ConfigParsed } from './+page.server.ts';
  import type { PageProps } from "./$types";
  let { data }: PageProps = $props();

  let configInput:string = $state("Original");
  let configOutput:string = $state("FilipekMod");
  let configs:MapParsed[] = $derived(data.configsParsed.find((element) => element.name == configOutput)?.maps!);

  let files:FileList | undefined = $state<FileList>();

  $effect(() => {
    if(files) {
      for (const file of files) {
        // TODO: When user presses translate, run translation on files uploaded to user_id
      }
    }
  })

  //$: isValid = selectedIdMap !== '' && new_id !== '' && old_id !== '';
  function handleSubmit(event) {
    // TODO: Instead of handleSubmit, we are going to need to use bind on the submit button
    event.preventDefault();
    //if (!isValid) return;
    return;

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
        bind:files
        type="file"
        name="pacenotesToTranslate"
        id="pacenotesToTranslate"
        webkitdirectory
        multiple>
      <br><br>
      <!--TODO: Create configuration parsing in JavaScript-->
      <!--<button type="submit">Load Config</button>-->
      <button type="submit">Translate</button>
    </form>
    <ul id="pacenotesListing">
      {#each Array.from(files ?? []) as pacenoteFile}
        <li>{pacenoteFile.name}</li>
      {/each}
    </ul>
  </div>

	<aside id="map-of-values">
		<form action="" method="post">
      <div>
        <p>Translate from:</p>
        <select name="configInput" id="configInput"
                bind:value={configInput} class:invalid={!configInput}>
              {#each configs as config}
                <option value="{config.name}">{config.name}</option>
              {/each}
        </select>
      </div>
      <div>
        <p>Translate to:</p>
        <select name="configOutput" id="configOutput"
                bind:value={configOutput} class:invalid={!configOutput}>
              {#each data.configsParsed as config}
                <option value="{config.name}">{config.name}</option>
              {/each}
        </select>
      </div>
			<p>Map of Values</p>
      {#each data.configsParsed.find((element) => element.name == configOutput)?.maps.find((element) => element.name == configInput)?.map ?? [] as map}
      <div>
        <!-- TODO: As NAME, attach polish translations to old_pacenote, so it is easier for people to find stuff out -->
        <!-- TODO: Maybe also attach translation to new_pacenote & display it -->
        <input
            type="text"
            list="id_new" 
            name={map.old_pacenote}
            id=""
            value={map.old_pacenote}/>
            <!-- TODO: Write validation, so no row is empty -->
        => {map.new_pacenote}
      </div>
      <br>
      {/each}
			<datalist id="id_new">
        {#each data.configsParsed.find((element) => element.name == configInput)?.config.sort(sortingConfig) ?? [] as config}
				  <option value={config.slot}></option>
        {/each}
			</datalist>
		</form>
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
