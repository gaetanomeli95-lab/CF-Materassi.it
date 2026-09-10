import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {buildCarolPlusModel} from './carol-plus-model-v3.js?v=carol-refine-1';
import {fitCarolCamera} from './carol-plus-view.js?v=carol-refine-1';

const hero=document.querySelector('.hero');
let canvas=document.querySelector('#hero-carol-webgl');

// Legacy V7 code removes the hero canvas before this module executes.
// Recreate it here so the 3D hero is always available on the redesign branch.
if(!canvas && hero){
  canvas=document.createElement('canvas');
  canvas.id='hero-carol-webgl';
  canvas.className='hero-carol-webgl';
  canvas.setAttribute('role','img');
  canvas.setAttribute('aria-label','Modello 3D Carol Plus');
  const vignette=hero.querySelector('.hero-vignette');
  if(vignette) hero.insertBefore(canvas,vignette);
  else hero.prepend(canvas);
}

if(canvas){
  // photo-direction-v5.css contains a legacy display:none!important rule.
  // Inline !important deliberately wins so the WebGL canvas stays visible.
  canvas.style.setProperty('display','block','important');

  const reducedMotion=matchMedia('(prefers-reduced-motion:reduce)');
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1;

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(35,1,.1,100);

  scene.add(new THREE.HemisphereLight(0xfff7ed,0x39322a,1.3));
  const key=new THREE.DirectionalLight(0xfff6e9,2.7);key.position.set(-4,7,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0xe6edf6,.8);fill.position.set(5,2,4);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xe4c9a1,1.3);rim.position.set(2,5,-6);scene.add(rim);

  const {system}=buildCarolPlusModel({mobile:matchMedia('(max-width:700px)').matches});
  scene.add(system);

  const pointer={x:0,y:0},smooth={x:0,y:0};
  let visible=true,frameId=0;
  const direction=new THREE.Vector3(7,5,9);

  function render(){
    frameId=0;
    if(!visible||document.hidden)return;
    if(!reducedMotion.matches){
      smooth.x+=(pointer.x-smooth.x)*.045;
      smooth.y+=(pointer.y-smooth.y)*.045;
      system.rotation.y=smooth.x*.10;
      system.rotation.x=-smooth.y*.025;
    }else{
      system.rotation.set(0,0,0);
    }
    fitCarolCamera(camera,system,direction,1.10);
    renderer.render(scene,camera);
    if(!reducedMotion.matches)frameId=requestAnimationFrame(render);
  }

  function requestRender(){
    if(!frameId)frameId=requestAnimationFrame(render);
  }

  canvas.addEventListener('pointermove',e=>{
    const rect=canvas.getBoundingClientRect();
    pointer.x=(e.clientX-rect.left)/rect.width-.5;
    pointer.y=(e.clientY-rect.top)/rect.height-.5;
    requestRender();
  },{passive:true});

  canvas.addEventListener('pointerleave',()=>{
    pointer.x=0;
    pointer.y=0;
    requestRender();
  });

  function resize(){
    const rect=canvas.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    renderer.setSize(rect.width,rect.height,false);
    camera.aspect=rect.width/rect.height;
    camera.updateProjectionMatrix();
    requestRender();
  }

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    requestRender();
  }).observe(canvas);

  document.addEventListener('visibilitychange',requestRender);
  reducedMotion.addEventListener('change',requestRender);
  window.addEventListener('cf:carol-texture-ready',requestRender);
  window.addEventListener('cf:carol-real-texture-ready',requestRender);
  resize();
}
