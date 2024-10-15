<!--Thanks to Josetxu https://codepen.io/collection/gYYajP-->
<div class="pyramid-container">
    <div class="pyramid">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
    </div>
    <div id="card">
        <div id="card-flip">
            <div id="card-flip-front">
                <img src="eye-of-ra.webp" alt="" />
                <div class="text dynamic-text">
                    <h2>Amun</h2>
                    <p>Tech & Software Development</p>
                </div>
            </div>
            <div id="card-flip-back">
                <div class="text dynamic-text">
                    <h1>contactⓐⓣamun.pl</h1>
                    <p>Or, even better,<br> use the chat box<br> bottom right</p>
                    <a href="/blog"><button>Secret Button</button></a>
                    <!--<p>AMUN Technologie
                    <br>895 224 10 28</p> -->
                </div>
            </div>
        </div>
    </div>
</div>

<style lang="scss">
$color: #ddca7e;

#card {
    position: absolute;
    width: 100%;
    height: 16rem;
    margin: auto;
    transform: translateY(-10rem);
    border: 10px black;
    perspective: 1000px;
    transition: transform 2s, opacity 4s;
    opacity: 2%;
}

#card-flip {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 2s 3s;
    transform: rotateY(0deg);
    transform-style: preserve-3d;
}

#card:hover #card-flip {
    transform: rotateY(-180deg);
}
#card:hover {
    opacity: 95%;
    transform: scale(110%);
}

#card-flip-front, #card-flip-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
}

#card-flip-front {}

#card-flip-back {
    color: white;
    transform: rotateY(180deg);
}

img {
    display: block;
    height: 50%;
    width: auto;
}

.text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: 'Poppins', sans-serif;
    color: $color;
    text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.8), 0 0 10px rgba(255, 255, 255, 0.5);
    font-size: 0.8em;
    padding: 1em; // Optional padding for better spacing
}

.dynamic-text {
    background: linear-gradient(45deg, #7700ff, #FF005F, #FF5E00, #FFFF00); // Gradient colors
    background-size: 300% 300%; // Size for animation
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradientAnimation 4s ease infinite; // Animation
}

@keyframes gradientAnimation {
    0% {
        background-position: 0% 50%;
    }
    25% {
        background-position: 50% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    75% {
        background-position: 100% 0%;
    }
    100% {
        background-position: 0% 50%;
    }
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


.pyramid-container {
	margin: 0;
	padding: 0;
	overflow: hidden;
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	perspective: 50vmin;
}

.pyramid {
	background: #d8d8d8;
	width: 30vmin;
	height: 30vmin;
	transform: rotateX(34deg) rotateZ(-73deg);
	transform-style: preserve-3d;
	animation: spin 8s linear 0s infinite;
}

.pyramid:before {
	content: "";
	background: black;
	width: 100%;
	height: 100%;
	position: absolute;
	transform: translateZ(-10vmin);
	box-shadow: 0 0 2vmin 2vmin #000000;
	opacity: 0.15;
}

.pyramid span {
	width: 100%;
	height: 100%;
	position: absolute;
	box-sizing: border-box;
	background-color: #efefef;
    //background-image: url(eye-of-ra.webpp);
	background-image: linear-gradient(335deg, #ffffff 6px, transparent 6px),
		linear-gradient(155deg, #ffffff 6px, transparent 6px),
		linear-gradient(335deg, #ffffff 6px, transparent 6px),
		linear-gradient(155deg, #ffffff 6px, transparent 6px);
	background-size: 15px 15px;
	background-position: 0px 0px, 1px 8px, 7px 7px, 8px 1px;
    opacity: 80%;
	clip-path: polygon(0% 100%, 50% 0%, 100% 100%);
}

.pyramid span:nth-child(1) {
	transform: rotateX(-53deg);
	transform-origin: center bottom;
	height: 25vmin;
	bottom: 0;
	filter: brightness(0.875);
}

.pyramid span:nth-child(2) {
	transform: rotateY(53deg) rotateZ(-90deg)
		translate3d(12.5vmin, -12.5vmin, 0vmin);
	transform-origin: right center;
	height: 25vmin;
	right: 0;
}

.pyramid span:nth-child(3) {
	transform: rotateX(53deg) rotateZ(180deg) translate3d(0vmin, -25vmin, 0vmin);
	transform-origin: center top;
	height: 25vmin;
	top: 0;
	filter: brightness(0.875);
}

.pyramid span:nth-child(4) {
	transform: rotateY(-53deg) rotateZ(90deg)
		translate3d(-12.5vmin, -12.5vmin, 0vmin);
	transform-origin: left center;
	height: 25vmin;
	left: 0;
}

@keyframes spin {
	0% {
		transform: rotateX(65deg) rotateZ(0deg);
	}
	100% {
		transform: rotateX(65deg) rotateZ(360deg);
	}
}

.pyramid span:before {
	content: "";
	background: #ffd400;
	width: 100%;
	height: 1.75vmin;
	position: absolute;
}
</style>