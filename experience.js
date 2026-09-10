import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = window.matchMedia('(max-width: 700px)').matches;
const DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.2 : 1.65);

function clamp(v,min=0,max=1){ return Math.min(max,Math.max(min,v)); }
function lerp(a,b,t){ return a+(b-a)*t; }
function smoothstep(v){ v=clamp(v); return v*v*(3-2*v); }

function roundedSlabGeometry(width, depth, height, radius=.22, bevel=.08){
  const w=width,d=depth,r=Math.min(radius,width/2,depth/2);
  const s=new THREE.Shape();
  s.moveTo(-w/2+r,-d/2);
  s.lineTo(w/2-r,-d/2); s.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r);
  s.lineTo(w/2,d/2-r); s.quadraticCurveTo(w/2,d/2,w/2-r,d/2);
  s.lineTo(-w/2+r,d/2); s.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r);
  s.lineTo(-w/2,-d/2+r); s.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2);
  const g=new THREE.ExtrudeGeometry(s,{depth:height,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:8});
  g.center(); g.rotateX(Math.PI/2); g.computeVertexNormals();
  return g;
}

function makeParticles(count=900,radius=14,color=0xcaa66d){
  const geo=new THREE.BufferGeometry();
  const positions=new Float32Array(count*3);
  for(let i=0;i<count;i++){
    const a=Math.random()*Math.PI*2;
    const r=Math.pow(Math.random(),.6)*radius;
    positions[i*3]=Math.cos(a)*r+(Math.random()-.5)*2;
    positions[i*3+1]=(Math.random()-.5)*9;
    positions[i*3+2]=-2-Math.random()*15;
  }
  geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const mat=new THREE.PointsMaterial({color,size:mobile?.026:.038,transparent:true,opacity:.65,depthWrite:false,blending:THREE.AdditiveBlending});
  return new THREE.Points(geo,mat);
}

function addQuiltWaves(group,width=5.3,depth=2.85,y=.36,color=0xd7d2c8){
  const mat=new THREE.MeshPhysicalMaterial({color,roughness:.9,metalness:0,transparent:true,opacity:.72});
  const rows=6;
  for(let i=0;i<rows;i++){
    const z=-depth/2+.35+i*((depth-.7)/(rows-1));
    const pts=[];
    for(let j=0;j<=22;j++){
      const p=j/22;
      const x=-width/2+.35+p*(width-.7);
      const wave=Math.sin(p*Math.PI*2+i*.72)*.12;
      pts.push(new THREE.Vector3(x,y,z+wave));
    }
    const curve=new THREE.CatmullRomCurve3(pts);
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,36,.026,5,false),mat);
    group.add(mesh);
  }
}

function setOpacity(object,opacity){
  object.traverse?.(child=>{
    if(child.material){
      const materials=Array.isArray(child.material)?child.material:[child.material];
      materials.forEach(m=>{ m.transparent=true; m.opacity=opacity; m.depthWrite=opacity>.45; });
    }
  });
}

function initHero(){
  const canvas=document.querySelector('#hero-webgl');
  if(!canvas) return;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!mobile,powerPreference:'high-performance'});
  renderer.setPixelRatio(DPR); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.08;
  const scene=new THREE.Scene(); scene.fog=new THREE.FogExp2(0x070707,.055);
  const camera=new THREE.PerspectiveCamera(mobile?46:38,1,.1,50); camera.position.set(mobile?0:1.2,mobile?2.8:2.1,mobile?10.7:9.2);
  const target=new THREE.Vector3(mobile?0:.8,.2,0);

  scene.add(new THREE.HemisphereLight(0xf4eadb,0x080808,1.35));
  const key=new THREE.DirectionalLight(0xfff4df,4.0); key.position.set(-4,7,5); scene.add(key);
  const warm=new THREE.PointLight(0xc08b4e,19,18,2); warm.position.set(5,1,4); scene.add(warm);
  const rim=new THREE.PointLight(0x8aa8c2,11,20,2); rim.position.set(-5,3,-2); scene.add(rim);

  const particles=makeParticles(mobile?360:950,16); scene.add(particles);
  const portal=new THREE.Group(); portal.position.set(mobile?0:2.1,.5,-1.6); portal.rotation.x=-.14;
  const ringMat=new THREE.MeshPhysicalMaterial({color:0x6b5942,metalness:.92,roughness:.28,clearcoat:.5,transparent:true,opacity:.72});
  const ring1=new THREE.Mesh(new THREE.TorusGeometry(3.75,.055,16,180),ringMat); portal.add(ring1);
  const ring2=new THREE.Mesh(new THREE.TorusGeometry(3.05,.016,8,180),new THREE.MeshBasicMaterial({color:0xc2a56f,transparent:true,opacity:.42})); ring2.rotation.z=.26; portal.add(ring2);
  const ring3=new THREE.Mesh(new THREE.TorusGeometry(4.5,.01,8,180),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.12})); ring3.rotation.z=-.35; portal.add(ring3);
  scene.add(portal);

  const mattress=new THREE.Group(); mattress.position.set(mobile?0:2.1,-.35,.25); mattress.rotation.set(-.12,mobile?-.08:-.42,-.02); mattress.scale.setScalar(mobile?.75:1);
  const body=new THREE.Mesh(roundedSlabGeometry(5.8,3.35,.68,.3,.07),new THREE.MeshPhysicalMaterial({color:0xded8ce,roughness:.78,metalness:0,clearcoat:.08})); mattress.add(body);
  const top=new THREE.Mesh(roundedSlabGeometry(5.62,3.18,.12,.28,.035),new THREE.MeshPhysicalMaterial({color:0xf0ede7,roughness:.86})); top.position.y=.38; mattress.add(top);
  const band=new THREE.Mesh(roundedSlabGeometry(5.72,3.28,.2,.28,.045),new THREE.MeshPhysicalMaterial({color:0x403b35,roughness:.55,metalness:.05})); band.position.y=-.27; mattress.add(band);
  addQuiltWaves(mattress,5.2,2.8,.465,0xd8d3ca);
  scene.add(mattress);

  const floor=new THREE.Mesh(new THREE.PlaneGeometry(22,22),new THREE.MeshPhysicalMaterial({color:0x090909,roughness:.85,metalness:.15,transparent:true,opacity:.72})); floor.rotation.x=-Math.PI/2; floor.position.y=-2.15; scene.add(floor);

  const pointer={x:0,y:0},smooth={x:0,y:0};
  window.addEventListener('pointermove',e=>{pointer.x=(e.clientX/window.innerWidth-.5)*2;pointer.y=(e.clientY/window.innerHeight-.5)*2;},{passive:true});
  function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
  new ResizeObserver(resize).observe(canvas); resize();
  const clock=new THREE.Clock();
  function frame(){
    const t=clock.getElapsedTime(); smooth.x+=(pointer.x-smooth.x)*.035; smooth.y+=(pointer.y-smooth.y)*.035;
    const scroll=Math.min(1,window.scrollY/Math.max(1,window.innerHeight));
    if(!reducedMotion){
      particles.rotation.y=t*.012; ring1.rotation.z=t*.035; ring2.rotation.z=.26-t*.025; ring3.rotation.z=-.35+t*.018;
      mattress.position.y=-.35+Math.sin(t*.8)*.12-scroll*.35;
      mattress.rotation.y=(mobile?-.08:-.42)+smooth.x*.12+scroll*.18; mattress.rotation.x=-.12-smooth.y*.07;
      portal.rotation.y=smooth.x*.04; camera.position.x=(mobile?0:1.2)+smooth.x*.18; camera.position.y=(mobile?2.8:2.1)-smooth.y*.12;
    }
    camera.lookAt(target); renderer.render(scene,camera); requestAnimationFrame(frame);
  }
  frame();
}

function createHelixGeometry(){
  const pts=[];
  const turns=4.25,segments=24,r=.035,h=.5;
  for(let i=0;i<=segments;i++){
    const p=i/segments,a=p*Math.PI*2*turns;
    pts.push(new THREE.Vector3(Math.cos(a)*r,(p-.5)*h,Math.sin(a)*r));
  }
  const curve=new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve,30,.006,3,false);
}

function createMicroSpringCore(){
  const group=new THREE.Group();
  const cols=40,rows=40,total=cols*rows;
  const pocketGeo=new THREE.CylinderGeometry(.048,.048,.56,8,1,true);
  const springGeo=createHelixGeometry();
  const pocketMat=new THREE.MeshPhysicalMaterial({color:0xf0eee9,roughness:.86,transparent:true,opacity:.16,side:THREE.DoubleSide,depthWrite:false});
  const springMat=new THREE.MeshPhysicalMaterial({color:0xc4a064,metalness:.82,roughness:.32});
  const pockets=new THREE.InstancedMesh(pocketGeo,pocketMat,total);
  const coils=new THREE.InstancedMesh(springGeo,springMat,total);
  pockets.instanceMatrix.setUsage(THREE.StaticDrawUsage); coils.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  const dummy=new THREE.Object3D();
  const xSpan=5.08,zSpan=2.62;
  let idx=0;
  for(let z=0;z<rows;z++){
    for(let x=0;x<cols;x++){
      const px=-xSpan/2+x*(xSpan/(cols-1));
      const pz=-zSpan/2+z*(zSpan/(rows-1));
      dummy.position.set(px,0,pz); dummy.rotation.set(0,0,0); dummy.scale.set(1,1,1); dummy.updateMatrix();
      pockets.setMatrixAt(idx,dummy.matrix); coils.setMatrixAt(idx,dummy.matrix); idx++;
    }
  }
  pockets.computeBoundingSphere(); coils.computeBoundingSphere();
  group.add(pockets,coils);
  group.userData.total=total;
  return group;
}

function initInside(){
  const canvas=document.querySelector('#inside-webgl');
  if(!canvas) return;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!mobile,powerPreference:'high-performance'});
  renderer.setPixelRatio(DPR); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12;
  const scene=new THREE.Scene(); scene.fog=new THREE.FogExp2(0x080808,.038);
  const camera=new THREE.PerspectiveCamera(mobile?44:34,1,.1,70); camera.position.set(mobile?7.7:9.4,5.7,mobile?11.1:12.8);
  scene.add(new THREE.HemisphereLight(0xf2eee6,0x050505,1.35));
  const key=new THREE.DirectionalLight(0xfff3dc,5.2); key.position.set(-5,8,7); scene.add(key);
  const amber=new THREE.PointLight(0xc98f45,28,18,2); amber.position.set(5,2,4); scene.add(amber);
  const blue=new THREE.PointLight(0x6a89a5,13,20,2); blue.position.set(-7,2,-5); scene.add(blue);
  const particles=makeParticles(mobile?180:380,12,0xcaa66d); particles.material.opacity=.35; scene.add(particles);

  const system=new THREE.Group(); system.position.set(mobile?1.25:2.35,-.25,0); system.rotation.set(-.06,-.34,0); scene.add(system);

  // Verified Carol Plus architecture: removable cover + memory + 1600 pocketed microsprings.
  // No undocumented layer thicknesses are presented as real measurements.
  const shellMat=new THREE.MeshPhysicalMaterial({color:0xeeeae3,roughness:.84,clearcoat:.08,transparent:true,opacity:.06});
  const memoryMat=new THREE.MeshPhysicalMaterial({color:0xd7c39e,roughness:.78,transparent:true,opacity:.06});
  const lowerMat=new THREE.MeshPhysicalMaterial({color:0xb8b4ac,roughness:.82,transparent:true,opacity:.06});

  const lowerShell=new THREE.Mesh(roundedSlabGeometry(5.9,3.4,.34,.3,.055),lowerMat); lowerShell.position.y=-1.02; system.add(lowerShell);
  const core=createMicroSpringCore(); core.position.y=-.45; core.scale.set(1,.94,1); system.add(core);
  const memory=new THREE.Mesh(roundedSlabGeometry(5.72,3.22,.28,.28,.045),memoryMat); memory.position.y=.12; system.add(memory);
  const topShell=new THREE.Group();
  const topBase=new THREE.Mesh(roundedSlabGeometry(5.9,3.4,.28,.3,.055),shellMat); topShell.add(topBase);
  addQuiltWaves(topShell,5.35,2.88,.19,0xd5d0c7); topShell.position.y=.72; system.add(topShell);

  const outline=new THREE.Mesh(roundedSlabGeometry(6.02,3.52,.09,.31,.025),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.1,wireframe:true})); outline.position.y=-.62; system.add(outline);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(4.7,.018,8,160),new THREE.MeshBasicMaterial({color:0xc7a468,transparent:true,opacity:.18})); ring.rotation.x=Math.PI/2.2; ring.position.y=-.45; system.add(ring);

  // Actual product image from the repository: visible before the technical twin takes over.
  const photoMat=new THREE.SpriteMaterial({transparent:true,opacity:1,depthTest:false,depthWrite:false});
  const photo=new THREE.Sprite(photoMat); photo.position.set(mobile?.6:1.7,.15,1.0); photo.scale.set(mobile?6.3:7.7,mobile?4.25:5.15,1); scene.add(photo);
  new THREE.TextureLoader().load('/catalogo-carol-plus.jpg',tex=>{tex.colorSpace=THREE.SRGBColorSpace;photoMat.map=tex;photoMat.needsUpdate=true;});

  let progress=0;
  window.addEventListener('cf:inside-progress',e=>{progress=e.detail.progress;});

  function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
  new ResizeObserver(resize).observe(canvas); resize();
  const clock=new THREE.Clock();

  function frame(){
    const t=clock.getElapsedTime();

    // 0–20%: real photo -> assembled digital twin.
    const twinIn=smoothstep((progress-.05)/.16);
    photoMat.opacity=1-smoothstep(progress/.2);
    setOpacity(topShell,.06+.94*twinIn); shellMat.opacity=.06+.94*twinIn; memoryMat.opacity=.06+.94*twinIn; lowerMat.opacity=.06+.94*twinIn;

    // 22–72%: controlled exploded view. 72–100%: reassembly.
    let explode;
    if(progress<.22) explode=0;
    else if(progress<.72) explode=smoothstep((progress-.22)/.5);
    else explode=1-smoothstep((progress-.72)/.28);

    topShell.position.y=.72+3.0*explode;
    memory.position.y=.12+1.45*explode;
    core.position.y=-.45-.25*explode;
    lowerShell.position.y=-1.02-1.6*explode;
    outline.position.y=-.62-.75*explode;

    const springFocus=clamp((progress-.46)/.18);
    core.scale.y=.94+springFocus*.24;
    core.traverse(child=>{
      if(child.material){
        if(child.material.metalness!==undefined) child.material.emissive?.setHex?.(springFocus>.15?0x2a1705:0x000000);
        if(child.material.opacity!==undefined && child.material.transparent) child.material.opacity=.13+.16*springFocus;
      }
    });

    if(!reducedMotion){
      system.rotation.y=-.34+progress*.75+Math.sin(t*.32)*.028;
      system.rotation.x=-.06+Math.sin(t*.4)*.012;
      ring.rotation.z=t*.028;
      particles.rotation.y=t*.01;
    }

    const orbit=progress*Math.PI*.34;
    camera.position.x=(mobile?7.7:9.4)*Math.cos(orbit*.44);
    camera.position.z=(mobile?11.1:12.8)-progress*1.5;
    camera.position.y=5.7-progress*.55;
    camera.lookAt(system.position.x,.15,0);
    renderer.render(scene,camera);
    requestAnimationFrame(frame);
  }
  frame();
}

try{initHero();initInside();}
catch(err){console.error('CF WebGL fallback:',err);document.documentElement.classList.add('no-webgl');}
