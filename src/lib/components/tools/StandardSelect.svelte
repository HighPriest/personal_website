<!--
	@component
	A labelled select of pacenote standards (the translator's "from" and "to").
-->
<script lang="ts">
	let {
		id,
		label,
		options,
		value = $bindable()
	}: { id: string; label: string; options: readonly string[]; value: string } = $props();
</script>

<div>
	<label for={id}>{label}</label>
	<select {id} bind:value>
		{#each options as option (option)}
			<option value={option}>{option}</option>
		{/each}
	</select>
</div>
