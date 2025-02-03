<script lang="ts">
	let { message, onClose } = $props();
</script>

<div class="modal">
	<div class="modal-content">
		<h2>Error</h2>
		<p>{@html message}</p>
		<button onclick={onClose}>Close</button>
	</div>
</div>

<style>
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.modal-content {
		background: white;
		padding: 20px;
		border-radius: 5px;
		box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
		max-width: 400px;
		width: 100%;
	}

	button {
		margin-top: 20px;
	}
</style>
