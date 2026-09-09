import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas=document.querySelector('#carol-webgl');
if(!canvas) throw new Error('Carol Plus V2 canvas not found');
const mobile=matchMedia('(max-width:700px)').matches;
const reducedMotion=matchMedia('(prefers-reduced-motion:reduce)').matches;
const DPR=Math.min(devicePixelRatio||1,mobile?1.15:1.6);
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
const phase=(p,a,b)=>ease((p-a)/(b-a));

function roundedSlabGeometry(w,d,h,r=.18,b=.035){
  const rr=Math.min(r,w/2,d/2),s=new THREE.Shape();
  s.moveTo(-w/2+rr,-d/2);s.lineTo(w/2-rr,-d/2);s.quadraticCurveTo(w/2,-d/2,w/2,-d/2+rr);
  s.lineTo(w/2,d/2-rr);s.quadraticCurveTo(w/2,d/2,w/2-rr,d/2);s.lineTo(-w/2+rr,d/2);
  s.quadraticCurveTo(-w/2,d/2,-w/2,d/2-rr);s.lineTo(-w/2,-d/2+rr);s.quadraticCurveTo(-w/2,-d/2,-w/2+rr,-d/2);
  const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:8});
  g.center();g.rotateX(Math.PI/2);g.computeVertexNormals();return g;
}

function canvasTexture(draw,w=1024,h=512){
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}

const floral=canvasTexture((x,w,h)=>{
  x.fillStyle='#eee8dc';x.fillRect(0,0,w,h);x.strokeStyle='rgba(92,77,61,.26)';x.lineWidth=2;
  for(let gy=0;gy<4;gy++)for(let gx=0;gx<7;gx++){
    const cx=(gx+.5)*w/7+(gy%2?w/15:0),cy=(gy+.5)*h/4;
    x.beginPath();x.roundRect(cx-58,cy-42,116,84,17);x.stroke();
    x.save();x.translate(cx,cy);x.rotate(((gx+gy)%2?1:-1)*.18);
    for(let p=0;p<8;p++){x.save();x.rotate(p*Math.PI/4);x.beginPath();x.ellipse(0,-23,7,24,0,0,Math.PI*2);x.stroke();x.restore();}
    x.beginPath();x.arc(0,0,7,0,Math.PI*2);x.stroke();x.restore();
  }
  x.globalAlpha=.12;x.strokeStyle='#7b6a59';x.lineWidth=1;
  for(let i=0;i<90;i++){const yy=Math.random()*h;x.beginPath();x.moveTo(0,yy);x.lineTo(w,yy+(Math.random()-.5)*16);x.stroke();}
});

const ribbonTex=canvasTexture((x,w,h)=>{
  x.fillStyle='#4b3029';x.fillRect(0,0,w,h);x.font='600 34px Arial';x.textBaseline='middle';
  for(let i=0;i<6;i++){const px=i*w/6+8;x.fillStyle='#eee5d9';x.fillText('Made in Italy',px,h/2);x.fillStyle='#1f8b4c';x.fillRect(px+158,43,16,26);x.fillStyle='#fff';x.fillRect(px+174,43,16,26);x.fillStyle='#c83b38';x.fillRect(px+190,43,16,26);}
},1200,112);ribbonTex.wrapS=THREE.RepeatWrapping;ribbonTex.repeat.x=1.45;

function frame(w,d,h,t,mat){
  const g=new THREE.Group();
  const a=new THREE.Mesh(new THREE.BoxGeometry(w,h,t),mat),b=a.clone();a.position.z=d/2-t/2;b.position.z=-d/2+t/2;
  const c=new THREE.Mesh(new THREE.BoxGeometry(t,h,d-2*t),mat),e=c.clone();c.position.x=w/2-t/2;e.position.x=-w/2+t/2;g.add(a,b,c,e);return g;
}
function ribbon(group,w,d,y){
  const m=new THREE.MeshBasicMaterial({map:ribbonTex,transparent:true,side:THREE.DoubleSide});
  const f=new THREE.Mesh(new THREE.PlaneGeometry(w-.15,.06),m);f.position.set(0,y,d/2+.013);group.add(f);
  const r=new THREE.Mesh(new THREE.PlaneGeometry(d-.15,.06),m);r.position.set(w/2+.013,y,0);r.rotation.y=Math.PI/2;group.add(r);
}
function handles(group,w,d,y){
  const m=new THREE.MeshPhysicalMaterial({color:0x392b27,roughness:.78});
  [-1.55,.2].forEach(px=>{const h=new THREE.Mesh(new THREE.BoxGeometry(.62,.09,.045),m);h.position.set(px,y,d/2+.035);group.add(h)});
  const s=new THREE.Mesh(new THREE.BoxGeometry(.62,.09,.045),m);s.position.set(w/2+.035,y,-.68);s.rotation.y=Math.PI/2;group.add(s);
}
function topPattern(group,w,d,y){
  const m=new THREE.MeshPhysicalMaterial({map:floral,color:0xffffff,roughness:.94,side:THREE.DoubleSide});
  const p=new THREE.Mesh(new THREE.PlaneGeometry(w-.12,d-.12),m);p.rotation.x=-Math.PI/2;p.position.y=y;group.add(p);
}
function helix(){
  const pts=[],turns=4.2,seg=20,r=.032,h=.68;
  for(let i=0;i<=seg;i++){const t=i/seg,a=t*Math.PI*2*turns;pts.push(new THREE.Vector3(Math.cos(a)*r,(t-.5)*h,Math.sin(a)*r));}
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.005,3,false);
}
function springCore(){
  const group=new THREE.Group(),cols=40,rows=40,total=1600;
  const pocketGeo=new THREE.CylinderGeometry(.062,.062,.78,9,1,true),springGeo=helix();
  const pocketMat=new THREE.MeshPhysicalMaterial({color:0xf1eee7,roughness:.92,transparent:true,opacity:.32,side:THREE.DoubleSide,vertexColors:true});
  const springMat=new THREE.MeshPhysicalMaterial({color:0xb8955f,metalness:.9,roughness:.24,vertexColors:true});
  const pockets=new THREE.InstancedMesh(pocketGeo,pocketMat,total),springs=new THREE.InstancedMesh(springGeo,springMat,total),dummy=new THREE.Object3D();
  const xSpan=5.0,zSpan=2.58;let i=0;const palette=[0x82715e,0x9a8465,0xb49a70,0xd0b47b,0xb49a70,0x9a8465,0x82715e];
  for(let z=0;z<rows;z++)for(let x=0;x<cols;x++){
    const px=-xSpan/2+x*xSpan/(cols-1),pz=-zSpan/2+z*zSpan/(rows-1),zone=Math.min(6,Math.floor(x/cols*7));
    dummy.position.set(px,0,pz);dummy.scale.set(1,[.94,.97,1.00,1.08,1.00,.97,.94][zone],1);dummy.updateMatrix();
    pockets.setMatrixAt(i,dummy.matrix);springs.setMatrixAt(i,dummy.matrix);const c=new THREE.Color(palette[zone]);pockets.setColorAt(i,c.clone().lerp(new THREE.Color(0xffffff),.7));springs.setColorAt(i,c);i++;
  }
  pockets.instanceMatrix.needsUpdate=springs.instanceMatrix.needsUpdate=true;if(pockets.instanceColor)pockets.instanceColor.needsUpdate=true;if(springs.instanceColor)springs.instanceColor.needsUpdate=true;
  group.add(pockets,springs);
  const boxMat=new THREE.MeshPhysicalMaterial({color:0xf3efe6,roughness:.84});
  const back=new THREE.Mesh(new THREE.BoxGeometry(5.72,.76,.34),boxMat);back.position.z=-1.48;group.add(back);
  const left=new THREE.Mesh(new THREE.BoxGeometry(.34,.76,2.62),boxMat);left.position.x=-2.69;group.add(left);
  const right=new THREE.Mesh(new THREE.BoxGeometry(.34,.76,2.62),boxMat);right.position.x=2.69;group.add(right);
  const frontLow=new THREE.Mesh(new THREE.BoxGeometry(5.72,.22,.34),boxMat);frontLow.position.set(0,-.27,1.48);group.add(frontLow);
  return group;
}

const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!mobile,powerPreference:'high-performance'});
renderer.setPixelRatio(DPR);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x080808,.029);
const camera=new THREE.PerspectiveCamera(mobile?45:31,1,.1,80);camera.position.set(mobile?5.2:8.7,mobile?4.6:5.8,mobile?10.8:12.6);
scene.add(new THREE.HemisphereLight(0xf3ece2,0x050505,1.7));
const key=new THREE.DirectionalLight(0xfff2dc,6);key.position.set(-5,9,7);scene.add(key);
const warm=new THREE.PointLight(0xc49057,28,20,2);warm.position.set(6,2,4);scene.add(warm);
const cool=new THREE.PointLight(0x7892aa,11,22,2);cool.position.set(-6,4,-5);scene.add(cool);

const system=new THREE.Group();system.position.set(mobile?.45:1.6,mobile?.05:-.1,0);system.rotation.set(-.11,-.40,.01);system.scale.setScalar(mobile?.76:1);scene.add(system);
const W=6,D=3.55;
const mat={
  cover:new THREE.MeshPhysicalMaterial({color:0xeee8dc,roughness:.9}),
  fiber:new THREE.MeshPhysicalMaterial({color:0xf7f5f0,roughness:1,transparent:true,opacity:.95}),
  lining:new THREE.MeshPhysicalMaterial({color:0xded5c9,roughness:.96}),
  felt:new THREE.MeshPhysicalMaterial({color:0x66625d,roughness:1}),
  poly:new THREE.MeshPhysicalMaterial({color:0xefe5d3,roughness:.82}),
  memory:new THREE.MeshPhysicalMaterial({color:0xe0c35d,roughness:.76}),
  brown:new THREE.MeshPhysicalMaterial({color:0x4b3029,roughness:.86}),
  beige:new THREE.MeshPhysicalMaterial({color:0xa58e74,roughness:.76}),
  pipe:new THREE.MeshPhysicalMaterial({color:0xe8dfd2,roughness:.74})
};

const pieces=[];
function slab(name,y,h,material,w=W,d=D){const o=new THREE.Mesh(roundedSlabGeometry(w,d,h,.22,Math.min(.03,h*.20)),material);o.position.y=y;system.add(o);pieces.push({name,obj:o,base:y});return o;}

const bottomCover=slab('bottomCover',-1.00,.07,mat.cover,5.92,3.47);
const liningBottom=slab('liningBottom',-.94,.025,mat.lining,5.86,3.41);
const polyBottom=slab('polyBottom',-.82,.19,mat.poly,5.80,3.35);
const feltBottom=slab('feltBottom',-.69,.045,mat.felt,5.82,3.37);

const core=springCore();core.position.y=-.27;system.add(core);pieces.push({name:'core',obj:core,base:-.27});

const feltTop=slab('feltTop',.14,.045,mat.felt,5.84,3.39);
const polyTop=slab('polyTop',.28,.19,mat.poly,5.80,3.35);
const memory=slab('memory',.56,.32,mat.memory,5.82,3.37);
const liningTop=slab('liningTop',.76,.028,mat.lining,5.88,3.43);
const fiber=slab('fiber',.85,.11,mat.fiber,5.90,3.45);
const topCover=new THREE.Group();
const coverBase=new THREE.Mesh(roundedSlabGeometry(5.96,3.50,.18,.25,.04),mat.cover);topCover.add(coverBase);topPattern(topCover,5.80,3.34,.105);topCover.position.y=1.01;system.add(topCover);pieces.push({name:'topCover',obj:topCover,base:1.01});

const lowerShell=new THREE.Group();const lowerVelvet=frame(W,D,.73,.09,mat.brown);lowerVelvet.position.y=-.54;lowerShell.add(lowerVelvet);const bottomPipe=frame(W,D,.04,.055,mat.pipe);bottomPipe.position.y=-.91;lowerShell.add(bottomPipe);ribbon(lowerShell,W,D,-.17);handles(lowerShell,W,D,-.50);system.add(lowerShell);pieces.push({name:'lowerShell',obj:lowerShell,base:0});
const upperShell=new THREE.Group();const breathable=frame(W,D,.57,.09,mat.beige);breathable.position.y=.70;upperShell.add(breathable);const topPipe=frame(W,D,.04,.055,mat.pipe);topPipe.position.y=1.10;upperShell.add(topPipe);system.add(upperShell);pieces.push({name:'upperShell',obj:upperShell,base:0});

const floor=new THREE.Mesh(new THREE.PlaneGeometry(26,26),new THREE.MeshPhysicalMaterial({color:0x080808,roughness:.92,transparent:true,opacity:.7}));floor.rotation.x=-Math.PI/2;floor.position.y=-4.5;scene.add(floor);
const ring=new THREE.Mesh(new THREE.TorusGeometry(4.85,.018,8,160),new THREE.MeshBasicMaterial({color:0xc8a36a,transparent:true,opacity:.16}));ring.rotation.x=Math.PI/2;ring.position.set(system.position.x,-1.8,0);scene.add(ring);

const offsets={topCover:3.10,upperShell:2.72,fiber:2.45,liningTop:2.10,memory:1.86,polyTop:1.38,feltTop:1.02,core:.08,feltBottom:-.48,polyBottom:-.76,liningBottom:-1.02,bottomCover:-1.28,lowerShell:-1.02};
const timings={topCover:[.06,.24],upperShell:[.08,.27],fiber:[.11,.31],liningTop:[.14,.34],memory:[.18,.43],polyTop:[.24,.49],feltTop:[.30,.55],core:[.38,.62],feltBottom:[.50,.71],polyBottom:[.56,.77],liningBottom:[.62,.82],bottomCover:[.68,.87],lowerShell:[.72,.92]};
let progress=0;window.addEventListener('cf:inside-progress',e=>progress=e.detail.progress);
const callouts=[...document.querySelectorAll('.carol-callout')];
function updateCallouts(p){const stops=[.04,.12,.20,.29,.38,.48,.59,.70,.81,.91];let active=0;for(let i=0;i<stops.length;i++)if(p>=stops[i])active=i;callouts.forEach((el,i)=>{el.classList.toggle('is-active',i===active);el.classList.toggle('is-past',i<active)});}
function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(canvas);resize();
const clock=new THREE.Clock();
function frameLoop(){
  const t=clock.getElapsedTime();
  for(const p of pieces){const [a,b]=timings[p.name]||[0,1],e=phase(progress,a,b),off=offsets[p.name]||0;p.obj.position.y=(p.name==='lowerShell'||p.name==='upperShell'?0:p.base)+off*e;}
  const whole=ease((progress-.02)/.94);core.rotation.y=phase(progress,.36,.64)*.09;core.scale.y=.98+phase(progress,.36,.64)*.05;
  if(!reducedMotion){system.rotation.y=-.40+whole*.52+Math.sin(t*.30)*.015;system.rotation.x=-.11+Math.sin(t*.34)*.01;ring.rotation.z=t*.032;}
  const orbit=whole*Math.PI*.20,r=mobile?10.8:12.6;
  const coreFocus=phase(progress,.34,.66);
  camera.position.x=(mobile?5.2:8.7)*Math.cos(orbit);
  camera.position.z=r-1.25*whole-1.1*coreFocus;
  camera.position.y=(mobile?4.6:5.8)-whole*.55-1.25*coreFocus;
  camera.lookAt(system.position.x,.02-.28*coreFocus,0);
  updateCallouts(progress);renderer.render(scene,camera);requestAnimationFrame(frameLoop);
}
frameLoop();