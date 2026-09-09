import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = window.matchMedia('(max-width: 700px)').matches;
const DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75);

function roundedSlabGeometry(width, depth, height, radius=.22, bevel=.08){
  const w = width, d = depth, r = Math.min(radius, width/2, depth/2);
  const s = new THREE.Shape();
  s.moveTo(-w/2+r,-d/2);
  s.lineTo(w/2-r,-d/2); s.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r);
  s.lineTo(w/2,d/2-r); s.quadraticCurveTo(w/2,d/2,w/2-r,d/2);
  s.lineTo(-w/2+r,d/2); s.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r);
  s.lineTo(-w/2,-d/2+r); s.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2);
  const g = new THREE.ExtrudeGeometry(s,{depth:height,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:8});
  g.center();
  g.rotateX(Math.PI/2);
  g.computeVertexNormals();
  return g;
}

function makeParticles(count=900, radius=14, color=0xcaa66d){
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count*3);
  const sizes = new Float32Array(count);
  for(let i=0;i<count;i++){
    const a = Math.random()*Math.PI*2;
    const r = Math.pow(Math.random(),.6)*radius;
    positions[i*3] = Math.cos(a)*r + (Math.random()-.5)*2;
    positions[i*3+1] = (Math.random()-.5)*9;
    positions[i*3+2] = -2 - Math.random()*15;
    sizes[i] = .5 + Math.random();
  }
  geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geo.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));
  const mat = new THREE.PointsMaterial({color,size:mobile?.028:.04,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending});
  return new THREE.Points(geo,mat);
}

function addMattressDetails(group, width=5.7, depth=3.25){
  const lineMat = new THREE.LineBasicMaterial({color:0xd9cdbd,transparent:true,opacity:.34});
  const zLines = 7, xLines = 11;
  for(let i=1;i<zLines;i++){
    const z = -depth/2 + (depth/zLines)*i;
    const pts = [new THREE.Vector3(-width/2+.3,.42,z),new THREE.Vector3(width/2-.3,.42,z)];
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    group.add(new THREE.Line(g,lineMat));
  }
  for(let i=1;i<xLines;i++){
    const x = -width/2 + (width/xLines)*i;
    const pts = [new THREE.Vector3(x,.425,-depth/2+.3),new THREE.Vector3(x,.425,depth/2-.3)];
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    group.add(new THREE.Line(g,lineMat));
  }
}

function initHero(){
  const canvas = document.querySelector('#hero-webgl');
  if(!canvas) return;
  const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:!mobile,powerPreference:'high-performance'});
  renderer.setPixelRatio(DPR); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x070707,.055);
  const camera = new THREE.PerspectiveCamera(mobile?46:38,1,.1,50); camera.position.set(mobile?0:1.2,mobile?2.8:2.1,mobile?10.7:9.2);
  const target = new THREE.Vector3(mobile?0:.8,.2,0);

  scene.add(new THREE.HemisphereLight(0xf4eadb,0x080808,1.4));
  const key = new THREE.DirectionalLight(0xfff4df,4.1); key.position.set(-4,7,5); scene.add(key);
  const warm = new THREE.PointLight(0xc08b4e,20,18,2); warm.position.set(5,1,4); scene.add(warm);
  const rim = new THREE.PointLight(0x8aa8c2,12,20,2); rim.position.set(-5,3,-2); scene.add(rim);

  const particles = makeParticles(mobile?420:1100,16); scene.add(particles);
  const portal = new THREE.Group(); portal.position.set(mobile?0:2.1,.5,-1.6); portal.rotation.x = -.14;
  const ringMat = new THREE.MeshPhysicalMaterial({color:0x6b5942,metalness:.92,roughness:.28,clearcoat:.5,transparent:true,opacity:.72});
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.75,.055,16,180),ringMat); portal.add(ring1);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.05,.016,8,180),new THREE.MeshBasicMaterial({color:0xc2a56f,transparent:true,opacity:.42})); ring2.rotation.z=.26; portal.add(ring2);
  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(4.5,.01,8,180),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.12})); ring3.rotation.z=-.35; portal.add(ring3);
  scene.add(portal);

  const mattress = new THREE.Group(); mattress.position.set(mobile?0:2.1,-.35,.25); mattress.rotation.set(-.12,mobile?-.08:-.42,-.02); mattress.scale.setScalar(mobile?.75:1);
  const body = new THREE.Mesh(roundedSlabGeometry(5.8,3.35,.68,.3,.07),new THREE.MeshPhysicalMaterial({color:0xded8ce,roughness:.78,metalness:0,clearcoat:.08})); body.castShadow=true; mattress.add(body);
  const top = new THREE.Mesh(roundedSlabGeometry(5.62,3.18,.12,.28,.035),new THREE.MeshPhysicalMaterial({color:0xf0ede7,roughness:.86})); top.position.y=.38; mattress.add(top);
  const band = new THREE.Mesh(roundedSlabGeometry(5.72,3.28,.22,.28,.05),new THREE.MeshPhysicalMaterial({color:0x403b35,roughness:.52,metalness:.08})); band.position.y=-.27; mattress.add(band);
  addMattressDetails(mattress,5.4,2.95);
  scene.add(mattress);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(22,22),new THREE.MeshPhysicalMaterial({color:0x090909,roughness:.85,metalness:.15,transparent:true,opacity:.72})); floor.rotation.x=-Math.PI/2; floor.position.y=-2.15; scene.add(floor);

  const pointer = {x:0,y:0}, smooth = {x:0,y:0};
  window.addEventListener('pointermove',e=>{ pointer.x=(e.clientX/window.innerWidth-.5)*2; pointer.y=(e.clientY/window.innerHeight-.5)*2; },{passive:true});

  function resize(){ const r=canvas.getBoundingClientRect(); renderer.setSize(r.width,r.height,false); camera.aspect=r.width/r.height; camera.updateProjectionMatrix(); }
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();
  const clock = new THREE.Clock();
  function frame(){
    const t=clock.getElapsedTime(); smooth.x += (pointer.x-smooth.x)*.035; smooth.y += (pointer.y-smooth.y)*.035;
    const scroll = Math.min(1,window.scrollY/Math.max(1,window.innerHeight));
    if(!reducedMotion){
      particles.rotation.y=t*.012; particles.position.z=(t*.12)%2;
      ring1.rotation.z=t*.035; ring2.rotation.z=.26-t*.025; ring3.rotation.z=-.35+t*.018;
      mattress.position.y=-.35+Math.sin(t*.8)*.12-scroll*.35;
      mattress.rotation.y=(mobile?-.08:-.42)+smooth.x*.12+scroll*.18;
      mattress.rotation.x=-.12-smooth.y*.07;
      portal.rotation.y=smooth.x*.04;
      camera.position.x=(mobile?0:1.2)+smooth.x*.18; camera.position.y=(mobile?2.8:2.1)-smooth.y*.12;
    }
    camera.lookAt(target); renderer.render(scene,camera); requestAnimationFrame(frame);
  } frame();
}

function helixGeometry(turns=4.5,r=.16,height=.95,segments=70){
  const pts=[];
  for(let i=0;i<=segments;i++){
    const p=i/segments, a=p*Math.PI*2*turns;
    pts.push(new THREE.Vector3(Math.cos(a)*r,(p-.5)*height,Math.sin(a)*r));
  }
  return new THREE.BufferGeometry().setFromPoints(pts);
}

function smoothstep(v){ return v*v*(3-2*v); }

function initInside(){
  const canvas=document.querySelector('#inside-webgl'); if(!canvas) return;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!mobile,powerPreference:'high-performance'}); renderer.setPixelRatio(DPR); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15;
  const scene=new THREE.Scene(); scene.fog=new THREE.FogExp2(0x080808,.038);
  const camera=new THREE.PerspectiveCamera(mobile?42:34,1,.1,60); camera.position.set(mobile?7.5:9,6.2,mobile?10.5:12.5);
  scene.add(new THREE.HemisphereLight(0xece4d5,0x050505,1.25));
  const key=new THREE.DirectionalLight(0xfff3dc,4.8); key.position.set(-5,8,7); scene.add(key);
  const amber=new THREE.PointLight(0xc98f45,30,18,2); amber.position.set(5,2,4); scene.add(amber);
  const blue=new THREE.PointLight(0x6a89a5,16,20,2); blue.position.set(-7,2,-5); scene.add(blue);
  scene.add(makeParticles(mobile?240:520,12,0xcaa66d));

  const system=new THREE.Group(); system.position.set(mobile?1.2:2.2,-.2,0); system.rotation.y=-.35; scene.add(system);
  const common={roughness:.62,metalness:.03};
  const layers=[];
  const defs=[
    {name:'surface',y:1.15,h:.34,color:0xeee9e0},
    {name:'comfort',y:.58,h:.46,color:0xc7aa78},
    {name:'foam',y:.03,h:.42,color:0xa8a39a},
    {name:'base',y:-1.15,h:.38,color:0x34312e}
  ];
  defs.forEach(d=>{ const m=new THREE.Mesh(roundedSlabGeometry(5.9,3.4,d.h,.28,.055),new THREE.MeshPhysicalMaterial({...common,color:d.color,clearcoat:d.name==='surface'?.12:0})); m.position.y=d.y; system.add(m); layers.push({mesh:m,baseY:d.y,name:d.name}); });
  addMattressDetails(layers[0].mesh,5.35,2.92);

  const springs=new THREE.Group(); springs.position.y=-.52; const springMat=new THREE.LineBasicMaterial({color:0xc19a61,transparent:true,opacity:.72}); const springGeo=helixGeometry();
  const cols=mobile?5:7, rows=mobile?4:5;
  for(let ix=0;ix<cols;ix++) for(let iz=0;iz<rows;iz++){
    const line=new THREE.Line(springGeo,springMat); line.position.set(-2.35+ix*(4.7/(cols-1)),0,-1.25+iz*(2.5/(rows-1))); springs.add(line);
  }
  system.add(springs);
  const portal=new THREE.Mesh(new THREE.TorusGeometry(4.7,.022,10,180),new THREE.MeshBasicMaterial({color:0xc7a468,transparent:true,opacity:.23})); portal.rotation.x=Math.PI/2.2; portal.position.y=-.4; system.add(portal);

  let progress=0;
  window.addEventListener('cf:inside-progress',e=>{progress=e.detail.progress;});
  function resize(){ const r=canvas.getBoundingClientRect(); renderer.setSize(r.width,r.height,false); camera.aspect=r.width/r.height; camera.updateProjectionMatrix(); }
  const ro=new ResizeObserver(resize); ro.observe(canvas); resize();
  const clock=new THREE.Clock();
  function frame(){
    const t=clock.getElapsedTime();
    const explode = progress<.74 ? smoothstep(progress/.74) : 1-smoothstep((progress-.74)/.26);
    const offsets={surface:3.2,comfort:1.65,foam:.6,base:-2.45};
    layers.forEach(l=>{l.mesh.position.y=l.baseY+(offsets[l.name]||0)*explode;});
    springs.position.y=-.52-.65*explode; springs.scale.y=1+explode*.24;
    if(!reducedMotion){ system.rotation.y=-.35+progress*.8+Math.sin(t*.35)*.035; system.rotation.x=-.04+Math.sin(t*.42)*.018; portal.rotation.z=t*.035; }
    const orbit=progress*Math.PI*.36; camera.position.x=(mobile?7.5:9)*Math.cos(orbit*.42); camera.position.z=(mobile?10.5:12.5)-progress*1.6; camera.position.y=6.2-progress*.7; camera.lookAt(system.position.x,0,0);
    renderer.render(scene,camera); requestAnimationFrame(frame);
  } frame();
}

try{ initHero(); initInside(); }
catch(err){ console.error('CF WebGL fallback:',err); document.documentElement.classList.add('no-webgl'); }
