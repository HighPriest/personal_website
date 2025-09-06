<script lang="ts">
	export let title: string;
</script>

<footer>
	<div id="background-image"></div>
	<div id="info" style="position: relative; padding-bottom:8rem;">
		<h1>{title}</h1>
		<!--<h5 style="font-family:monospace">And what we are willing to put them through, to achieve our dreams!</h5> -->
		<div id="social-links" style="position: absolute; bottom: 2rem;">
			<a
				href="https://www.youtube.com/@DriftJunkie"
				data-umami-event={`Exit: Youtube`}
				target="_blank"
				aria-label="Youtube"
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="4rem" height="4rem"
					><path
						d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,14.598V9.402c0-0.385,0.417-0.625,0.75-0.433l4.5,2.598c0.333,0.192,0.333,0.674,0,0.866l-4.5,2.598 C10.417,15.224,10,14.983,10,14.598z"
					/></svg
				></a
			>
			<a
				href="https://www.linkedin.com/in/kamil--marek"
				data-umami-event={`Exit: LinkedIn`}
				target="_blank"
				aria-label="LinkedIn"
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="4rem" height="4rem">
					<path
						d="M19,3H5C3.895,3,3,3.895,3,5v14c0,1.105,0.895,2,2,2h14c1.105,0,2-0.895,2-2V5C21,3.895,20.105,3,19,3z M7.738,17L7.738,17 c-0.697,0-1.262-0.565-1.262-1.262v-4.477C6.477,10.565,7.042,10,7.738,10h0C8.435,10,9,10.565,9,11.262v4.477 C9,16.435,8.435,17,7.738,17z M7.694,8.717c-0.771,0-1.286-0.514-1.286-1.2s0.514-1.2,1.371-1.2c0.771,0,1.286,0.514,1.286,1.2 S8.551,8.717,7.694,8.717z M16.779,17L16.779,17c-0.674,0-1.221-0.547-1.221-1.221v-2.605c0-1.058-0.651-1.174-0.895-1.174 s-1.058,0.035-1.058,1.174v2.605c0,0.674-0.547,1.221-1.221,1.221h-0.081c-0.674,0-1.221-0.547-1.221-1.221v-4.517 c0-0.697,0.565-1.262,1.262-1.262h0c0.697,0,1.262,0.565,1.262,1.262c0,0,0.282-1.262,2.198-1.262C17.023,10,18,10.977,18,13.174 v2.605C18,16.453,17.453,17,16.779,17z"
					/></svg
				></a
			>
			<a href="https://github.com/HighPriest" data-umami-event={`Exit: GitHub`} target="_blank"
				aria-label="GitHub"
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="4rem" height="4rem">
					<path
						d="M10.9,2.1c-4.6,0.5-8.3,4.2-8.8,8.7c-0.5,4.7,2.2,8.9,6.3,10.5C8.7,21.4,9,21.2,9,20.8v-1.6c0,0-0.4,0.1-0.9,0.1 c-1.4,0-2-1.2-2.1-1.9c-0.1-0.4-0.3-0.7-0.6-1C5.1,16.3,5,16.3,5,16.2C5,16,5.3,16,5.4,16c0.6,0,1.1,0.7,1.3,1c0.5,0.8,1.1,1,1.4,1 c0.4,0,0.7-0.1,0.9-0.2c0.1-0.7,0.4-1.4,1-1.8c-2.3-0.5-4-1.8-4-4c0-1.1,0.5-2.2,1.2-3C7.1,8.8,7,8.3,7,7.6c0-0.4,0-0.9,0.2-1.3 C7.2,6.1,7.4,6,7.5,6c0,0,0.1,0,0.1,0C8.1,6.1,9.1,6.4,10,7.3C10.6,7.1,11.3,7,12,7s1.4,0.1,2,0.3c0.9-0.9,2-1.2,2.5-1.3 c0,0,0.1,0,0.1,0c0.2,0,0.3,0.1,0.4,0.3C17,6.7,17,7.2,17,7.6c0,0.8-0.1,1.2-0.2,1.4c0.7,0.8,1.2,1.8,1.2,3c0,2.2-1.7,3.5-4,4 c0.6,0.5,1,1.4,1,2.3v2.6c0,0.3,0.3,0.6,0.7,0.5c3.7-1.5,6.3-5.1,6.3-9.3C22,6.1,16.9,1.4,10.9,2.1z"
					/></svg
				></a
			>
		</div>
	</div>
	<div id="image-trim"><img src="/barbie_left.webp" alt="" /></div>
</footer>

<style lang="scss">
	@media (pointer: coarse) {
		// This makes the header work on landscape mobile
		footer {
			padding: 6rem 0;
		}
	}

	@media (orientation: portrait) {
		#info, #info > h1 {
			padding: unset !important;
		}
		#info > h1{
			margin-bottom: 2em;	
		}
		#image-trim {
			display: none;
		}
	}

	footer {
		position: relative;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		/*width: 100%; breaks out of containers width :( */
		max-height: 22rem;
	}
	#info {
		padding: 4rem 2rem;
		width: 100%;
		h1 {
			text-align: center;
			font-weight: bold;
			font-style: oblique;
			-webkit-text-stroke: 1px var(--heading-color);
			font-size: 4em;
			height: 100%;
			align-content: center;
			padding: 0 1em;
			background: linear-gradient(to bottom,var(--heading-color) 0em,var(--color-accent) 1.8em,var(--text-color) 2.8em);
			background-clip: text;
		}
		svg {
			fill: var(--color-accent);
			opacity: 0.4;
			-webkit-transition: 0.4s ease-in-out;
			transition: 0.4s ease-in-out;
			filter: drop-shadow(3px 3px 2px rgba(0, 0, 0, 0.7));
			&:hover {
				-webkit-transition: 0.4s ease-in-out;
				transition: 0.4s ease-in-out;
				opacity: 1;
				filter: drop-shadow(3px 3px 2px rgba(0, 0, 0, 0.7));
			}
		}
	}
	#background-image {
		border: 0.1em solid var(--color-accent);
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		//background-image: url("/face-bg.webp");
		background-image: url('/media/cyberpunk.jpg');
		background-position: center;
		background-size: cover;
	}

	#background-image::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 0;
		background-image: linear-gradient(
			139deg,
			var(--tertiary-color) 0%,
			rgba(var(--rgba-tertiary-color), 0.2) 30%,
			rgba(var(--rgba-primary-color), 0.8) 70%,
			var(--fourth-color) 100%
		);
	}
	#image-trim {
		margin-top: -12rem;
		overflow: hidden;
		z-index: 1;
		img {
			height: 50rem;
			margin-bottom: -10rem;
		}
	}
</style>
