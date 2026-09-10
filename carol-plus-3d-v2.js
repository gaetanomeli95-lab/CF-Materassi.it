import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {buildCarolPlusModel} from './carol-plus-model-v3.js?v=carol-refine-1';

import {fitCarolCamera} from './carol-plus-view.js?v=carol-refine-1';

const canvas=document.querySelector('#carol-webgl');
if(!canvas) throw new Error('Carol Plus canvas not found');
const mobile=matchMedia('(max-width:700px)').matches;
const reducedMotion=matchMedia('(prefers-reduced-motion:reduce)').matches;
const DPR=Math.min(devicePixelRatio||1,mobile?1.15:1.6);
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
const phase=(p,a,b)=>ease((p-a)/(b-a));

const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!mobile,powerPreference:'high-performance'});
renderer.setPixelRatio(DPR);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x060606,.021);
const camera=new THREE.PerspectiveCamera(mobile?45:31,1,.1,80);camera.position.set(mobile?5.1:8.4,mobile?4.6:5.6,mobile?10.6:12.4);

scene.add(new THREE.HemisphereLight(0xf7f4ee,0x302b25,1.4));
const key=new THREE.DirectionalLight(0xfff4e8,2.8);key.position.set(-5,9,7);scene.add(key);
const rim=new THREE.DirectionalLight(0xd7b88c,1.3);rim.position.set(5,4,-5);scene.add(rim);

// Dedicated interior lights: the microcoils must read as light pocketed springs, never as a black mass.
const coreLight=new THREE.PointLight(0xffffff,34,13,1.7);coreLight.position.set(.4,.05,4.2);scene.add(coreLight);
const coreFillL=new THREE.PointLight(0xf8f4ec,18,9,1.9);coreFillL.position.set(-4,.1,2.2);scene.add(coreFillL);
const coreFillR=new THREE.PointLight(0xf0f2f4,16,9,1.9);coreFillR.position.set(4,.05,1.2);scene.add(coreFillR);

const model=buildCarolPlusModel({mobile});
const {system,pieces,core,offsets,timings}=model;
system.position.set(mobile?.42:1.55,mobile?.04:-.06,0);system.rotation.set(-.08,-.42,.005);system.scale.setScalar(1);scene.add(system);

const floor=new THREE.Mesh(new THREE.PlaneGeometry(26,26),new THREE.MeshPhysicalMaterial({color:0x070707,roughness:.94,transparent:true,opacity:.76}));
floor.rotation.x=-Math.PI/2;floor.position.y=-4.7;scene.add(floor);
const ring1=new THREE.Mesh(new THREE.TorusGeometry(4.75,.017,8,170),new THREE.MeshBasicMaterial({color:0xc7a16b,transparent:true,opacity:.18}));ring1.rotation.x=Math.PI/2;ring1.position.set(system.position.x,-1.9,0);scene.add(ring1);
const ring2=ring1.clone();ring2.scale.setScalar(1.38);ring2.material=ring1.material.clone();ring2.material.opacity=.08;scene.add(ring2);

const section=canvas.closest('[data-inside-section]');
let progress=clamp(-section.getBoundingClientRect().top/Math.max(1,section.offsetHeight-window.innerHeight));
window.addEventListener('cf:inside-progress',e=>{progress=e.detail.progress;requestFrame();});
let visible=true,frameId=0;
function requestFrame(){if(!frameId)frameId=requestAnimationFrame(frameLoop);}
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;requestFrame();}).observe(canvas);
document.addEventListener('visibilitychange',requestFrame);
window.addEventListener('cf:carol-texture-ready',requestFrame);

const callouts=[...document.querySelectorAll('.carol-callout')];
function updateCallouts(p){
  const stops=[.04,.12,.20,.29,.38,.48,.59,.70,.81,.91];let active=0;
  for(let i=0;i<stops.length;i++)if(p>=stops[i])active=i;
  callouts.forEach((el,i)=>{el.classList.toggle('is-active',i===active);el.classList.toggle('is-past',i<active)});
}
function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();requestFrame();}
new ResizeObserver(resize).observe(canvas);resize();

const clock=new THREE.Clock();
function frameLoop(){
  frameId=0;
  if(!visible||document.hidden)return;
  const t=clock.getElapsedTime();
  for(const p of pieces){
    const [a,b]=timings[p.name]||[0,1],e=phase(progress,a,b),off=offsets[p.name]||0;
    p.obj.position.y=(p.name==='lowerShell'||p.name==='upperShell'?0:p.base)+off*e;
  }
  const whole=ease((progress-.02)/.94),coreFocus=phase(progress,.34,.66);
  // Pockets and coils share identical transforms: a spring never exits its bag.
  core.userData.pocketsFront.material.opacity=.76-.28*coreFocus;
  core.userData.pocketsRear.material.opacity=1;

  if(!reducedMotion){
    system.rotation.y=-.42+whole*.49+Math.sin(t*.28)*.012;
    system.rotation.x=-.08+Math.sin(t*.34)*.008;
    ring1.rotation.z=t*.030;ring2.rotation.z=-t*.018;
  }

  fitCarolCamera(camera,system,new THREE.Vector3(7,5.4-1.2*coreFocus,10),1.10);
  coreLight.intensity=10+8*coreFocus;
  coreFillL.intensity=5+3*coreFocus;
  coreFillR.intensity=5+3*coreFocus;

  updateCallouts(progress);renderer.render(scene,camera);if(!reducedMotion)frameId=requestAnimationFrame(frameLoop);
}
requestFrame();
