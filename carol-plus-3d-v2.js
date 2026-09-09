import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {buildCarolPlusModel} from './carol-plus-model-v3.js';

const canvas=document.querySelector('#carol-webgl');
if(!canvas) throw new Error('Carol Plus canvas not found');
const mobile=matchMedia('(max-width:700px)').matches;
const reducedMotion=matchMedia('(prefers-reduced-motion:reduce)').matches;
const DPR=Math.min(devicePixelRatio||1,mobile?1.15:1.6);
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
const phase=(p,a,b)=>ease((p-a)/(b-a));

const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!mobile,powerPreference:'high-performance'});
renderer.setPixelRatio(DPR);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x060606,.021);
const camera=new THREE.PerspectiveCamera(mobile?45:31,1,.1,80);camera.position.set(mobile?5.1:8.4,mobile?4.6:5.6,mobile?10.6:12.4);

scene.add(new THREE.HemisphereLight(0xf7f4ee,0x101010,1.85));
const key=new THREE.DirectionalLight(0xfff4e8,6.6);key.position.set(-5,9,7);scene.add(key);
const rim=new THREE.DirectionalLight(0xd7b88c,3.4);rim.position.set(5,4,-5);scene.add(rim);

// Dedicated interior lights: the microcoils must read as light pocketed springs, never as a black mass.
const coreLight=new THREE.PointLight(0xffffff,34,13,1.7);coreLight.position.set(.4,.05,4.2);scene.add(coreLight);
const coreFillL=new THREE.PointLight(0xf8f4ec,18,9,1.9);coreFillL.position.set(-4,.1,2.2);scene.add(coreFillL);
const coreFillR=new THREE.PointLight(0xf0f2f4,16,9,1.9);coreFillR.position.set(4,.05,1.2);scene.add(coreFillR);

const model=buildCarolPlusModel({mobile});
const {system,pieces,core,offsets,timings}=model;
system.position.set(mobile?.42:1.55,mobile?.04:-.06,0);system.rotation.set(-.08,-.42,.005);system.scale.setScalar(mobile?.75:1);scene.add(system);

const floor=new THREE.Mesh(new THREE.PlaneGeometry(26,26),new THREE.MeshPhysicalMaterial({color:0x070707,roughness:.94,transparent:true,opacity:.76}));
floor.rotation.x=-Math.PI/2;floor.position.y=-4.7;scene.add(floor);
const ring1=new THREE.Mesh(new THREE.TorusGeometry(4.75,.017,8,170),new THREE.MeshBasicMaterial({color:0xc7a16b,transparent:true,opacity:.18}));ring1.rotation.x=Math.PI/2;ring1.position.set(system.position.x,-1.9,0);scene.add(ring1);
const ring2=ring1.clone();ring2.scale.setScalar(1.38);ring2.material=ring1.material.clone();ring2.material.opacity=.08;scene.add(ring2);

let progress=0;window.addEventListener('cf:inside-progress',e=>progress=e.detail.progress);
const callouts=[...document.querySelectorAll('.carol-callout')];
function updateCallouts(p){
  const stops=[.04,.12,.20,.29,.38,.48,.59,.70,.81,.91];let active=0;
  for(let i=0;i<stops.length;i++)if(p>=stops[i])active=i;
  callouts.forEach((el,i)=>{el.classList.toggle('is-active',i===active);el.classList.toggle('is-past',i<active)});
}
function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(canvas);resize();

const clock=new THREE.Clock();
function frameLoop(){
  const t=clock.getElapsedTime();
  for(const p of pieces){
    const [a,b]=timings[p.name]||[0,1],e=phase(progress,a,b),off=offsets[p.name]||0;
    p.obj.position.y=(p.name==='lowerShell'||p.name==='upperShell'?0:p.base)+off*e;
  }
  const whole=ease((progress-.02)/.94),coreFocus=phase(progress,.34,.66);
  core.rotation.y=coreFocus*.06;core.scale.y=.98+coreFocus*.075;

  // Reveal the front pockets, but keep enough fabric opacity to read that every spring is individually pocketed.
  core.userData.pocketsRear.material.opacity=.70-.10*coreFocus;
  core.userData.pocketsFront.material.opacity=.78-.08*coreFocus;
  core.userData.pocketsFront.position.z=.14*coreFocus;
  core.userData.springsFront.position.z=.20*coreFocus;
  core.userData.springsFront.material.emissiveIntensity=.58+.42*coreFocus;
  core.userData.springsRear.material.emissiveIntensity=.26+.22*coreFocus;
  core.userData.frontL.position.x=-2.30-.18*coreFocus;
  core.userData.frontR.position.x=2.30+.18*coreFocus;

  if(!reducedMotion){
    system.rotation.y=-.42+whole*.49+Math.sin(t*.28)*.012;
    system.rotation.x=-.08+Math.sin(t*.34)*.008;
    ring1.rotation.z=t*.030;ring2.rotation.z=-t*.018;
  }

  const orbit=whole*Math.PI*.18,r=mobile?10.6:12.4;
  camera.position.x=(mobile?5.1:8.4)*Math.cos(orbit);
  camera.position.z=r-1.15*whole-1.95*coreFocus;
  camera.position.y=(mobile?4.6:5.6)-whole*.48-1.52*coreFocus;
  camera.lookAt(system.position.x,-.03-.30*coreFocus,0);

  coreLight.intensity=34+38*coreFocus;
  coreFillL.intensity=18+18*coreFocus;
  coreFillR.intensity=16+16*coreFocus;

  updateCallouts(progress);renderer.render(scene,camera);requestAnimationFrame(frameLoop);
}
frameLoop();
