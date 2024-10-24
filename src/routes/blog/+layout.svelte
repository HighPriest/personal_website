<script lang="ts">
    import Nav from '$lib/components/navigation/nav.svelte';
    import ProgressBars from '$lib/components/blog/ProgressBars.svelte';
    //import YoutubeFeed from '$lib/components/youtube-feed/YoutubeFeed.svelte';
</script>

<aside>
    <section id="header">
        <a href="/blog"><img src="/eye-of-ra.webp" alt=""></a>
        <h3>Kamil 'HighPriest'</h3>
        <p>Software Developer</p>
        <p>Electronics Engineer</p>
    </section>
    <section id="personal">
        <p>Residence: <span>Wrocław, Poland</span></p>
        <p>Age: <span>26</span></p>
    </section>
    <section id="languages">aa</section>
    <section id="goals">
        <h2>Goals</h2>
        <div>
            <h3>Degrees</h3>
            <ProgressBars>
                <label for="progress-bar-1">Micro-Electronics</label>
                <progress id="progress-bar-1" value="100" max="100">100 %</progress>
                <output id="progress-output-1">100%</output>
                <label for="progress-bar-2">Computer Science</label>
                <progress id="progress-bar-2" value="100" max="100">100 %</progress>
                <output id="progress-output-2">100%</output>
            </ProgressBars>
        </div>
        <br>
        <div>
            <h3>Certification</h3>
            <ProgressBars>
                <label for="progress-bar-3">Rust senior</label>
                <progress id="progress-bar-3" value="30" max="100">30 %</progress>
                <output id="progress-output-3">30%</output>
                <label for="progress-bar-4">Azure DevOps</label>
                <progress id="progress-bar-4" value="10" max="100">10 %</progress>
                <output id="progress-output-4">10%</output>
            </ProgressBars>
        </div>
        <br>
        <div>
            <h3>Generic</h3>
            <ProgressBars>
                <label for="progress-bar-4">World Domination</label>
                <progress id="progress-bar-4" value="2" max="100">2 %</progress>
                <output id="progress-output-4">2%</output>
            </ProgressBars>
        </div>
    </section>
    <section id="feed">
    </section>
</aside>
<main>
    <slot/>
</main>
<Nav />

<style lang="scss">
h1, h2, h3, h4, h5, h6, p {
    width: 100%;
    display: flex;
    justify-content: center;
    margin: 0;
}

h1 > span, h2 > span, h3 > span, h4 > span, h5 > span, h6 > span, p > span { 
    flex-grow: 1;
    text-align: right;
}

aside {
    display: flex;
    flex-direction: column;
    text-align: center;
    min-width: 20rem;
    max-width: 25rem;
    z-index: 1;
    padding: 3.2rem 2rem;
    margin: 1rem;
    height: -webkit-fill-available;
    background: var(--secondary-color);

    > section {
        width: 100%;
        justify-content: center;
    }

    section::after {
        display: block;
        content:"";
        background: #8c8c8e;
        width: 100%;
        height: 1px;
        opacity: .3;
        margin: 10px 0;
    }

    #header img {
        width: 100px;
        height: 100px;
        border-radius: 50%;
    }

    p {
        font-size: 14px;
    }

    h3 {
        font-size: 18px;
        margin-top: 0;
    }
}

main {
    display: grid;
    grid-auto-rows: max-content;
    overflow: auto;
    padding: 6rem 2rem;
    margin-right: 2rem;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}

#goals div {
    width: 90%;
    margin: auto;
}

@media (pointer: coarse) {
    main {
        padding: 6rem auto;
        margin: 0 auto;
    }
}

@media (orientation: portrait) {
    :global(#image-trim) {
        display: none;
    }
    aside {
        position:absolute;
        visibility: hidden;
    }
    main {
        padding: unset;
        margin: unset;
        width: 100%;
    }
    :global(.tag, .post) {
        padding: 1rem !important;
        margin: 1rem !important;
        min-width: 15rem !important; /* TODO: Give it rem units */
        flex: 1 1 15rem !important;
    }
}

</style>

