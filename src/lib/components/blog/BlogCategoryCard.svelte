<script lang="ts">
	export let name: string, slug: string, feature_image: string, description: string, count: number, date_latest: string;

  // TODO: Add the rotation animation, to recently updated topics
</script>

<!-- From Uiverse.io by ElSombrero2 --> 
<div class="card">
  <a data-sveltekit-preload-data="hover" data-umami-event={`Button: Tag (${slug})`} href={`/blog/tag/${slug}`}>
	<div class="content">
	  <div class="front">
		<div class="front-content">
		  <svg stroke="#ffffff" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" height="50px" width="50px" fill="#ffffff">
  
		  <g stroke-width="0" id="SVGRepo_bgCarrier"></g>
  
		  <g stroke-linejoin="round" stroke-linecap="round" id="SVGRepo_tracerCarrier"></g>
  
		  <g id="SVGRepo_iconCarrier">
  
		  <!--{icon_svg}-->
  
		  </g>
  
		  </svg>
		  <strong>{name}</strong>
		</div>
	  </div>
	  <div class="extra">
		
		<div class="img" >
		<img loading="lazy" src={feature_image} alt="Post" />
		  <div class="circle">
		  </div>
		  <div class="circle" id="right">
		  </div>
		  <div class="circle" id="bottom">
		  </div>
		  
		</div>
  
		<div class="extra-content">
		  <small class="badge">{name}</small>
		  <div class="description">
			<div class="title">
			  <!--<p class="title">
				<strong>{name}</strong>
			  </p>-->
        <p class="description">{description}</p>
			  <svg fill-rule="nonzero" height="15px" width="15px" viewBox="0,0,256,256" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><g style="mix-blend-mode: normal" text-anchor="none" font-size="none" font-weight="none" font-family="none" stroke-dashoffset="0" stroke-dasharray="" stroke-miterlimit="10" stroke-linejoin="miter" stroke-linecap="butt" stroke-width="1" stroke="none" fill-rule="nonzero" fill="#20c997"><g transform="scale(8,8)"><path d="M25,27l-9,-6.75l-9,6.75v-23h18z"></path></g></g></svg>
			</div>
			<p class="card-footer">
			  {count} posts &nbsp; | &nbsp; {date_latest}
			</p>
		  </div>
		</div>
	  </div>
	</div>
</a>
</div>

<style lang="scss">
/* From Uiverse.io by ElSombrero2 */ 
.card {
  overflow: visible;
  width: 19em;
  height: 30em;
  margin: 2em;

  &:nth-child(1) .front::before {
    animation: rotation_481 5000ms infinite linear;
  }
}

.content {
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: max-height var(--transition-time);
  box-shadow: 0px 0px 10px 1px #000000ee;
  border-radius: 5px;
}

.extra, .front {
  background-color: #151515;
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  transition: max-height var(--transition-time);
  -webkit-backface-visibility: hidden;
  border-radius: 5px;
  overflow: hidden;
}

.front {
  width: 100%;
  height: 100%;
  justify-content: center;

  display: flex;
  align-items: center;
  overflow: hidden;
}

.front::before {
  position: absolute;
  content: ' ';
  display: block;
  width: 160px;
  height: 160%;
  transform: rotateZ(30deg);
  background: linear-gradient(90deg, transparent, var(--color-accent), var(--color-accent), var(--color-accent), var(--color-accent), transparent);
}

.front-content {
  position: absolute;
  width: 99%;
  height: 99%;
  background-color: #151515;
  border-radius: 5px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
}

.card:hover .extra {
  max-height: 100%;
}

@keyframes rotation_481 {
  0% {
    transform: rotateZ(30deg);
  }

  0% {
    transform: rotateZ(390deg);
  }
}

.extra {
  height: 100%;
  max-height: 0;
}

.extra .extra-content {
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.extra-content .badge {
  background-color: #00000055;
  padding: 2px 10px;
  border-radius: 10px;
  backdrop-filter: blur(2px);
  width: fit-content;
}

.description {
  box-shadow: 0px 0px 10px 5px #00000088;
  width: 100%;
  padding: 10px;
  background-color: #00000099;
  backdrop-filter: blur(5px);
  border-radius: 5px;
}

.title {
  font-size: 11px;
  max-width: 100%;
  display: flex;
  justify-content: space-between;

  /*p {
    width: 50%;
  }*/
}

.card-footer {
  color: #ffffff88;
  margin-top: 5px;
  font-size: 8px;
}

.extra .img {
  position: absolute;
  filter: blur(2px);
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  
  img {
    position: absolute;
    opacity: 80%;
    height: 30em;
    transform: translateX(-30%);
  }
}

.circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background-color: #ffffff73;
  position: relative;
  filter: blur(15px);
  animation: floating 2600ms infinite ease-out;
}

#bottom {
  background-color: #6363639f;
  left: 50px;
  top: 0px;
  width: 150px;
  height: 150px;
  animation-delay: -800ms;
}

#right {
  background-color: #ffffffd2;
  left: 160px;
  top: -80px;
  width: 30px;
  height: 30px;
  animation-delay: -1800ms;
}

@keyframes floating {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(10px);
  }

  100% {
    transform: translateY(0px);
  }
}
</style>
