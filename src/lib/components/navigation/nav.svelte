<script lang="ts">
    import { localizeHref } from "$lib/paraglide/runtime";
</script>

<!-- START: Controls for slideouts -->
<!--
<input type="checkbox" id="aside-menu-checkbox" style="display:none;"/>
<label id='aside-button' for='aside-menu-checkbox'>
    <div id='arrow'></div>
</label>
<input type="checkbox" id="nav-menu-checkbox" style="display:none;"/>
<label id='nav-button' for='nav-menu-checkbox'>
    <div id='burger'></div>
</label>
-->
<!-- END: Controls for slideouts -->

<nav>
	<!-- TODO: Make this content dynamic-->
	<ul>
		<li>
			<a href={localizeHref("/")}
                data-umami-event={`Button: Home`}
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/></svg>
				<p>Home</p></a
			>
		</li>
		<li>
			<a href={localizeHref("/blog")}
                data-umami-event={`Button: Blog`}
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M249.6 471.5c10.8 3.8 22.4-4.1 22.4-15.5V78.6c0-4.2-1.6-8.4-5-11C247.4 52 202.4 32 144 32C93.5 32 46.3 45.3 18.1 56.1C6.8 60.5 0 71.7 0 83.8V454.1c0 11.9 12.8 20.2 24.1 16.5C55.6 460.1 105.5 448 144 448c33.9 0 79 14 105.6 23.5zm76.8 0C353 462 398.1 448 432 448c38.5 0 88.4 12.1 119.9 22.6c11.3 3.8 24.1-4.6 24.1-16.5V83.8c0-12.1-6.8-23.3-18.1-27.6C529.7 45.3 482.5 32 432 32c-58.4 0-103.4 20-123 35.6c-3.3 2.6-5 6.8-5 11V456c0 11.4 11.7 19.3 22.4 15.5z"/></svg>
				<p>Blog</p></a
			>
		</li>
		<li>
			<a href={localizeHref("/tools")}
                data-umami-event={`Button: Tools`}
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M78.6 5C69.1-2.4 55.6-1.5 47 7L7 47c-8.5 8.5-9.4 22-2.1 31.6l80 104c4.5 5.9 11.6 9.4 19 9.4h54.1l109 109c-14.7 29-10 65.4 14.3 89.6l112 112c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-112-112c-24.2-24.2-60.6-29-89.6-14.3l-109-109V104c0-7.5-3.5-14.5-9.4-19L78.6 5zM19.9 396.1C7.2 408.8 0 426.1 0 444.1C0 481.6 30.4 512 67.9 512c18 0 35.3-7.2 48-19.9L233.7 374.3c-7.8-20.9-9-43.6-3.6-65.1l-61.7-61.7L19.9 396.1zM512 144c0-10.5-1.1-20.7-3.2-30.5c-2.4-11.2-16.1-14.1-24.2-6l-63.9 63.9c-3 3-7.1 4.7-11.3 4.7H352c-8.8 0-16-7.2-16-16V102.6c0-4.2 1.7-8.3 4.7-11.3l63.9-63.9c8.1-8.1 5.2-21.8-6-24.2C388.7 1.1 378.5 0 368 0C288.5 0 224 64.5 224 144l0 .8 85.3 85.3c36-9.1 75.8 .5 104 28.7L429 274.5c49-23 83-72.8 83-130.5zM56 432a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z"/></svg>
				<p style="font-size: 1.2rem;">Tools</p></a
			>
		</li>
	</ul>
</nav>

<style lang="scss">
    nav {
	    position: fixed;
        top: 0;
        right: 1rem;
        padding: 2rem 0;
        display: flex;
        align-items: end;
        height: 100vh;
        margin-right:-1rem;
        &:hover {
            ul {
                margin: 0;
                -webkit-transition: .4s ease-in-out;
				transition: .4s ease-in-out;
            }
        }
        ul {
            display: flex;
            flex-direction: column;
            justify-content: center;
            list-style-type: none;
            padding: 1rem;
            margin: -1rem;
            width: 6rem;
            //background-color: var(--wx-background-alt);
            border-radius: 5rem 0rem 0rem 5rem;
            border: 0.2em solid var(--color-accent);
            -webkit-transition: .4s ease-in-out;
            transition: .4s ease-in-out;
            box-shadow: 0em 0em 3em -1em var(--color-accent);
            li {
                cursor: pointer;
                padding: 0.8rem 0;
                opacity: 1;
                &:hover ~ li{
                    opacity: 0.2;
                }
                &:hover *{
                    fill: var(--color-primary);
                    color: var(--color-accent);
                }
                svg {
                    fill: var(--color-contrast-high);
                    height: 50%;
                }
                p {
                    font-size: 1.2rem;
                    margin: 0;
                    text-align: center;
                }
            }
        }
    }

	@media (orientation: portrait) {
		nav {
			position: fixed;
            display: block;
            top: unset;
			bottom: 1rem;
			left: 24px;
            padding: 0;
            margin-right: unset;
			width: calc(100vw - 48px);
            height: auto;
            ul {
                background-color: #00000038;
                display: flex;
                flex-direction: row;
                justify-content: space-evenly;
                list-style-type: none;
                padding: 0;
                margin: 0;
                height: 6rem;
                width: auto;
                border: 0.2em solid var(--color-accent);
                border-radius: 24px;
                backdrop-filter: blur(5px) opacity(90%);
                box-shadow:none;
                li {
                    text-align: center;
                    &:hover ~ li{
                        opacity: 1;
                    }
                    p {
                        font-size: unset !important;
                        margin: -0.4rem 0;
                    }
                }
            }
        }
	}
</style>
