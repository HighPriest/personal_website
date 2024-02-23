<div id="logo">
    <div id="logo-flip">
        <div id="logo-flip-front">
            <img src="eye-of-ra.png" alt="" />
            <div class="text">
                <h2>Amun</h2>
                <p>Tech & Software Development</p>
            </div>
        </div>
        <div id="logo-flip-back">
            <div class="text">
                <h1>contactⓐⓣamun.pl</h1>
                <p>Or, even better,<br> use the chat box<br> bottom right</p>
                <!--<p>AMUN Technologie
                <br>895 224 10 28</p> -->
            </div>
        </div>
    </div>
</div>

<style>
#logo {
    width: 436px;
    height: 550px;
    margin: auto;
    border: 10px black;
    perspective: 1000px;
}

#logo-flip {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 1s;
    transform-style: preserve-3d;
}

#logo:hover #logo-flip {
    transform: rotateY(180deg);
}

#logo-flip-front, #logo-flip-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
}

#logo-flip-front {}

#logo-flip-back {
    color: white;
    transform: rotateY(180deg);
}

img {
    display: block;
    margin: auto;
}

.text {
    text-align: center;
    font-family: 'Oswald', sans-serif;
    color: white;
}

h2 {
    background: linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.15) 100%), radial-gradient(at top center, rgba(255,255,255,0.40) 0%, rgba(0,0,0,0.40) 120%) #989898;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 5em;
    letter-spacing: 7px;
    margin: 0;
    line-height: 1em;
}
</style>