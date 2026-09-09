import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas = document.querySelector('#carol-webgl');
if (!canvas) throw new Error('Carol Plus canvas not found');

const mobile = matchMedia('(max-width:700px)').matches;
const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;
const DPR = Math.min(devicePixelRatio || 1, mobile ? 1.15 : 1.6);
const clamp = (v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease = v => { v=clamp(v); return v*v*(3-2*v); };
const phase = (p,a,b)=>ease((p-a)/(b-a));

function roundedSlabGeometry(width,depth,height,radius=.18,bevel=.035){
  const r=Math.min(radius,width/2,depth/2),s=new THREE.Shape();
  s.moveTo(-width/2+r,-depth/2);
  s.lineTo(width/2-r,-depth/2);s.quadraticCurveTo(width/2,-depth/2,width/2,-depth/2+r);
  s.lineTo(width/2,depth/2-r);s.quadraticCurveTo(width/2,depth/2,width/2-r,depth/2);
  s.lineTo(-width/2+r,depth/2);s.quadraticCurveTo(-width/2,depth/2,-width/2,depth/2-r);
  s.lineTo(-width/2,-depth/2+r);s.quadraticCurveTo(-width/2,-depth/2,-width/2+r,-depth/2);
  const g=new THREE.ExtrudeGeometry(s,{depth:height,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2,curveSegments:8});
  g.center();g.rotateX(Math.PI/2);g.computeVertexNormals();return g;
}

function canvasTexture(draw,w=1024,h=512){
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}

const topTexture=canvasTexture((x,w,h)=>{
  x.fillStyle='#eeeae0';x.fillRect(0,0,w,h);
  x.strokeStyle='rgba(83,72,61,.19)';x.lineWidth=2;
  for(let gy=0;gy<4;gy++) for(let gx=0;gx<7;gx++){
    const cx=(gx+.5)*w/7+(gy%2?w/14:0),cy=(gy+.5)*h/4;
    x.beginPath();x.roundRect(cx-58,cy-43,116,86,19);x.stroke();
    x.save();x.translate(cx,cy);x.rotate((gx+gy)%2?.28:-.18);
    for(let p=0;p<8;p++){
      x.save();x.rotate(p*Math.PI/4);x.beginPath();x.ellipse(0,-24,8,25,0,0,Math.PI*2);x.stroke();x.restore();
    }
    x.beginPath();x.arc(0,0,8,0,Math.PI*2);x.stroke();x.restore();
  }
  x.globalAlpha=.14;x.strokeStyle='#7b6c5c';x.lineWidth=1;
  for(let i=0;i<70;i++){x.beginPath();x.moveTo(Math.random()*w,0);x.lineTo(Math.random()*w,h);x.stroke();}
});

topTexture.wrapS=topTexture.wrapT=THREE.RepeatWrapping;topTexture.repeat.set(1,1);

const ribbonTexture=canvasTexture((x,w,h)=>{
  x.fillStyle='#50352d';x.fillRect(0,0,w,h);
  x.font='600 34px Arial';x.textBaseline='middle';x.fillStyle='#e7dfd1';
  for(let i=0;i<6;i++){
    const px=i*w/6+10;x.fillText('Made in Italy',px,h/2);
    x.fillStyle='#1f8b4c';x.fillRect(px+160,43,16,26);x.fillStyle='#fff';x.fillRect(px+176,43,16,26);x.fillStyle='#c83b38';x.fillRect(px+192,43,16,26);x.fillStyle='#e7dfd1';
  }
},1200,112);
ribbonTexture.wrapS=THREE.RepeatWrapping;ribbonTexture.repeat.x=1.4;

function perimeterFrame(width,depth,height,thickness,material){
  const g=new THREE.Group();
  const long=new THREE.BoxGeometry(width,height,thickness),short=new THREE.BoxGeometry(thickness,height,depth-thickness*2);
  const a=new THREE.Mesh(long,material),b=a.clone();a.position.z=depth/2-thickness/2;b.position.z=-depth/2+thickness/2;
  const c=new THREE.Mesh(short,material),d=c.clone();c.position.x=width/2-thickness/2;d.position.x=-width/2+thickness/2;
  g.add(a,b,c,d);return g;
}

function addRibbon(group,width,depth,y){
  const mat=new THREE.MeshBasicMaterial({map:ribbonTexture,transparent:true,side:THREE.DoubleSide});
  const front=new THREE.Mesh(new THREE.PlaneGeometry(width-.14,.055),mat);front.position.set(0,y,depth/2+.013);group.add(front);
  const right=new THREE.Mesh(new THREE.PlaneGeometry(depth-.14,.055),mat);right.position.set(width/2+.013,y,0);right.rotation.y=Math.PI/2;group.add(right);
}

function addHandles(group,width,depth,y){
  const mat=new THREE.MeshPhysicalMaterial({color:0x3e302b,roughness:.72,metalness:.02});
  const hg=new THREE.BoxGeometry(.62,.085,.045);
  [-1.55,.25].forEach(x=>{const h=new THREE.Mesh(hg,mat);h.position.set(x,y,depth/2+.038);group.add(h);});
  const hs=new THREE.Mesh(new THREE.BoxGeometry(.62,.085,.045),mat);hs.position.set(width/2+.038,y,-.62);hs.rotation.y=Math.PI/2;group.add(hs);
}

function addTopPattern(group,width,depth,y){
  const mat=new THREE.MeshPhysicalMaterial({map:topTexture,color:0xffffff,roughness:.92,transparent:true,opacity:.96,side:THREE.DoubleSide});
  const p=new THREE.Mesh(new THREE.PlaneGeometry(width-.16,depth-.16,1,1),mat);p.rotation.x=-Math.PI/2;p.position.y=y;group.add(p);
}

function coilGeometry(){
  const pts=[],turns=3.8,seg=18,r=.033,h=.42;
  for(let i=0;i<=seg;i++){const t=i/seg,a=t*Math.PI*2*turns;pts.push(new THREE.Vector3(Math.cos(a)*r,(t-.5)*h,Math.sin(a)*r));}
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),22,.005,3,false);
}

function createMicrocoilCore(){
  const group=new THREE.Group(),cols=40,rows=40,total=1600;
  const pocketGeo=new THREE.CylinderGeometry(.052,.052,.46,7,1,true);
  const springGeo=coilGeometry();
  const pocketMat=new THREE.MeshPhysicalMaterial({color:0xe9e6df,roughness:.9,transparent:true,opacity:.42,side:THREE.DoubleSide,vertexColors:true});
  const springMat=new THREE.MeshPhysicalMaterial({color:0x9d815b,metalness:.7,roughness:.34,vertexColors:true});
  const pockets=new THREE.InstancedMesh(pocketGeo,pocketMat,total),springs=new THREE.InstancedMesh(springGeo,springMat,total);
  const dummy=new THREE.Object3D();
  const xSpan=5.16,zSpan=2.76;
  const zonePalette=[0x8d765a,0xa28661,0xb09567,0xc3a46f,0xb09567,0xa28661,0x8d765a];
  let i=0;
  for(let z=0;z<rows;z++)for(let x=0;x<cols;x++){
    const px=-xSpan/2+x*xSpan/(cols-1),pz=-zSpan/2+z*zSpan/(rows-1);
    const zone=Math.min(6,Math.floor(x/cols*7));
    const firmness=[.95,.98,1.01,1.045,1.01,.98,.95][zone];
    dummy.position.set(px,0,pz);dummy.scale.set(1,firmness,1);dummy.updateMatrix();pockets.setMatrixAt(i,dummy.matrix);springs.setMatrixAt(i,dummy.matrix);
    const c=new THREE.Color(zonePalette[zone]);pockets.setColorAt(i,c.clone().lerp(new THREE.Color(0xffffff),.55));springs.setColorAt(i,c);i++;
  }
  pockets.instanceMatrix.needsUpdate=springs.instanceMatrix.needsUpdate=true;
  if(pockets.instanceColor)pockets.instanceColor.needsUpdate=true;if(springs.instanceColor)springs.instanceColor.needsUpdate=true;
  group.add(pockets,springs);

  const foam=new THREE.MeshPhysicalMaterial({color:0xe2d8c5,roughness:.8});
  const box=perimeterFrame(5.72,3.28,.48,.28,foam);group.add(box);
  return group;
}

const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!mobile,powerPreference:'high-performance'});
renderer.setPixelRatio(DPR);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x070707,.032);
const camera=new THREE.PerspectiveCamera(mobile?46:32,1,.1,80);camera.position.set(mobile?5.5:8.8,mobile?4.4:5.3,mobile?10.6:12.2);
scene.add(new THREE.HemisphereLight(0xf4eee4,0x050505,1.55));
const key=new THREE.DirectionalLight(0xfff3df,5.8);key.position.set(-4,8,7);scene.add(key);
const rim=new THREE.PointLight(0xb98552,24,18,2);rim.position.set(6,2,3);scene.add(rim);
const cool=new THREE.PointLight(0x7994ad,12,20,2);cool.position.set(-6,3,-4);scene.add(cool);

const system=new THREE.Group();system.position.set(mobile?.55:1.65,mobile?.45:.1,0);system.rotation.set(-.1,-.38,.01);system.scale.setScalar(mobile?.77:1);scene.add(system);

const W=6,D=3.55;
const white=new THREE.MeshPhysicalMaterial({color:0xf0ede6,roughness:.9});
const liningMat=new THREE.MeshPhysicalMaterial({color:0xe6e0d6,roughness:.96});
const feltMat=new THREE.MeshPhysicalMaterial({color:0x77736d,roughness:1});
const polyMat=new THREE.MeshPhysicalMaterial({color:0xe9d59a,roughness:.78});
const memoryMat=new THREE.MeshPhysicalMaterial({color:0xcaa464,roughness:.72});
const brown=new THREE.MeshPhysicalMaterial({color:0x4b332b,roughness:.82});
const beige=new THREE.MeshPhysicalMaterial({color:0x98826b,roughness:.72});
const piping=new THREE.MeshPhysicalMaterial({color:0xe7dfd2,roughness:.7});

const layers=[];
function slab(name,y,h,mat,w=W,d=D){const m=new THREE.Mesh(roundedSlabGeometry(w,d,h,.22,Math.min(.03,h*.22)),mat);m.position.y=y;system.add(m);layers.push({name,obj:m,base:y});return m;}

// Proportions follow the declared H27 construction: 5 cm memory, 3 cm polyurethane per side,
// pocket-microcoil core inside 9x14 perimeter buffers, plus cover/lining/felt packages.
const bottomCover=slab('bottomCover',-.505,.055,white,5.92,3.47);
const liningBottom=slab('liningBottom',-.465,.018,liningMat,5.86,3.41);
const feltBottom=slab('feltBottom',-.43,.03,feltMat,5.82,3.37);
const polyBottom=slab('polyBottom',-.35,.115,polyMat,5.78,3.33);
const core=createMicrocoilCore();core.position.y=-.03;system.add(core);layers.push({name:'core',obj:core,base:-.03});
const polyTop=slab('polyTop',.30,.115,polyMat,5.78,3.33);
const memory=slab('memory',.46,.195,memoryMat,5.80,3.35);
const feltTop=slab('feltTop',.59,.03,feltMat,5.84,3.39);
const liningTop=slab('liningTop',.625,.018,liningMat,5.88,3.43);
const topCover=slab('topCover',.67,.065,white,5.94,3.49);addTopPattern(system,5.78,3.33,.708);

const shell=new THREE.Group();
const lowerVelvet=perimeterFrame(W,D,.39,.08,brown);lowerVelvet.position.y=-.305;shell.add(lowerVelvet);
const upper3d=perimeterFrame(W,D,.23,.08,beige);upper3d.position.y=.05;shell.add(upper3d);
const topPipe=perimeterFrame(W,D,.035,.055,piping);topPipe.position.y=.704;shell.add(topPipe);
const bottomPipe=perimeterFrame(W,D,.035,.055,piping);bottomPipe.position.y=-.55;shell.add(bottomPipe);
addRibbon(shell,W,D,-.095);addHandles(shell,W,D,-.25);
system.add(shell);layers.push({name:'shell',obj:shell,base:0});

const floor=new THREE.Mesh(new THREE.PlaneGeometry(25,25),new THREE.MeshPhysicalMaterial({color:0x080808,roughness:.9,transparent:true,opacity:.72}));floor.rotation.x=-Math.PI/2;floor.position.y=-4.2;scene.add(floor);
const ring=new THREE.Mesh(new THREE.TorusGeometry(4.8,.018,8,160),new THREE.MeshBasicMaterial({color:0xc39a5b,transparent:true,opacity:.15}));ring.rotation.x=Math.PI/2;ring.position.set(system.position.x,-1.5,0);scene.add(ring);

const targetOffsets={
  topCover:3.25,liningTop:2.74,feltTop:2.25,memory:1.72,polyTop:1.15,core:.15,
  polyBottom:-.95,feltBottom:-1.45,liningBottom:-1.93,bottomCover:-2.38,shell:-3.0
};
const timings={
  topCover:[.08,.29],liningTop:[.12,.33],feltTop:[.16,.37],memory:[.20,.45],polyTop:[.27,.51],core:[.34,.58],
  polyBottom:[.43,.66],feltBottom:[.50,.72],liningBottom:[.56,.78],bottomCover:[.62,.84],shell:[.68,.91]
};

const callouts=[...document.querySelectorAll('.carol-callout')];
let progress=0;
window.addEventListener('cf:inside-progress',e=>{progress=e.detail.progress;});

function updateCallouts(p){
  const stops=[.06,.14,.22,.30,.39,.50,.62,.73,.84,.92];
  let active=0;for(let i=0;i<stops.length;i++)if(p>=stops[i])active=i;
  callouts.forEach((el,i)=>{el.classList.toggle('is-active',i===active);el.classList.toggle('is-past',i<active);});
}

function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(canvas);resize();
const clock=new THREE.Clock();

function frame(){
  const t=clock.getElapsedTime();
  for(const l of layers){
    const [a,b]=timings[l.name]||[0,1],e=phase(progress,a,b),target=targetOffsets[l.name]||0;
    l.obj.position.y=(l.name==='shell'?0:l.base)+target*e;
  }

  const revealCore=phase(progress,.30,.58);
  core.rotation.y=revealCore*.08;
  core.scale.y=.96+revealCore*.08;
  const whole=ease((progress-.03)/.92);
  if(!reducedMotion){system.rotation.y=-.38+whole*.55+Math.sin(t*.28)*.018;system.rotation.x=-.10+Math.sin(t*.35)*.012;ring.rotation.z=t*.035;}

  const orbit=whole*Math.PI*.22;
  const radius=mobile?10.6:12.2;
  camera.position.x=(mobile?5.5:8.8)*Math.cos(orbit);
  camera.position.z=radius-1.5*whole;
  camera.position.y=(mobile?4.4:5.3)-whole*.65;
  camera.lookAt(system.position.x,mobile?.15:.05,0);
  updateCallouts(progress);
  renderer.render(scene,camera);requestAnimationFrame(frame);
}
frame();
