import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas=document.querySelector('#carol-webgl');
if(!canvas) throw new Error('Carol Plus canvas not found');
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
  const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:3,curveSegments:10});
  g.center();g.rotateX(Math.PI/2);g.computeVertexNormals();return g;
}

function canvasTexture(draw,w=1024,h=512){
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
}

function drawCarolPattern(x,w,h,mono=false){
  x.fillStyle=mono?'#777':'#eee8dc';x.fillRect(0,0,w,h);
  const line=mono?'rgba(235,235,235,.95)':'rgba(115,97,78,.35)';
  const soft=mono?'rgba(205,205,205,.85)':'rgba(150,128,104,.18)';
  x.lineWidth=mono?7:2.2;x.strokeStyle=line;
  const cols=5,rows=3;
  for(let gy=0;gy<rows;gy++)for(let gx=0;gx<cols;gx++){
    const cx=(gx+.5)*w/cols+(gy%2?w/12:0),cy=(gy+.5)*h/rows;
    x.save();x.translate(cx,cy);
    x.beginPath();x.roundRect(-78,-58,156,116,24);x.stroke();
    for(let p=0;p<8;p++){
      x.save();x.rotate(p*Math.PI/4);x.beginPath();x.ellipse(0,-31,11,31,0,0,Math.PI*2);x.stroke();x.restore();
    }
    x.beginPath();x.arc(0,0,10,0,Math.PI*2);x.stroke();
    x.restore();
  }
  x.strokeStyle=soft;x.lineWidth=mono?5:1.5;
  for(let i=0;i<8;i++){
    const yy=(i+.5)*h/8;
    x.beginPath();x.moveTo(0,yy);x.bezierCurveTo(w*.28,yy-18,w*.72,yy+18,w,yy);x.stroke();
  }
}

const floral=canvasTexture((x,w,h)=>drawCarolPattern(x,w,h,false),1200,720);
const floralHeight=canvasTexture((x,w,h)=>drawCarolPattern(x,w,h,true),1200,720);
floral.wrapS=floral.wrapT=THREE.ClampToEdgeWrapping;
floralHeight.wrapS=floralHeight.wrapT=THREE.ClampToEdgeWrapping;

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
  const g=new THREE.PlaneGeometry(w-.14,d-.14,90,54);
  const m=new THREE.MeshPhysicalMaterial({map:floral,bumpMap:floralHeight,bumpScale:.065,displacementMap:floralHeight,displacementScale:.045,color:0xffffff,roughness:.92,side:THREE.DoubleSide});
  const p=new THREE.Mesh(g,m);p.rotation.x=-Math.PI/2;p.position.y=y;group.add(p);
}
function helix(){
  const pts=[],turns=5.2,seg=28,r=.034,h=.74;
  for(let i=0;i<=seg;i++){const t=i/seg,a=t*Math.PI*2*turns;pts.push(new THREE.Vector3(Math.cos(a)*r,(t-.5)*h,Math.sin(a)*r));}
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),34,.006,4,false);
}

function springCore(){
  const group=new THREE.Group(),cols=40,rows=40,total=1600;
  const pocketGeo=new THREE.CylinderGeometry(.064,.064,.80,12,1,true),springGeo=helix();
  const pocketMat=new THREE.MeshPhysicalMaterial({color:0xf5f3ed,roughness:.96,transparent:true,opacity:.16,side:THREE.DoubleSide,vertexColors:true,depthWrite:false});
  const springMat=new THREE.MeshPhysicalMaterial({color:0xc7c2b6,metalness:.85,roughness:.20,vertexColors:true});
  const pockets=new THREE.InstancedMesh(pocketGeo,pocketMat,total),springs=new THREE.InstancedMesh(springGeo,springMat,total),dummy=new THREE.Object3D();
  const xSpan=5.02,zSpan=2.60;let i=0;const palette=[0x8b8174,0x9d907c,0xb09d82,0xc7af87,0xb09d82,0x9d907c,0x8b8174];
  const frontRows=[];
  for(let z=0;z<rows;z++)for(let x=0;x<cols;x++){
    const px=-xSpan/2+x*xSpan/(cols-1),pz=-zSpan/2+z*zSpan/(rows-1),zone=Math.min(6,Math.floor(x/cols*7));
    dummy.position.set(px,0,pz);dummy.scale.set(1,[.94,.97,1.00,1.08,1.00,.97,.94][zone],1);dummy.updateMatrix();
    pockets.setMatrixAt(i,dummy.matrix);springs.setMatrixAt(i,dummy.matrix);
    const c=new THREE.Color(palette[zone]);pockets.setColorAt(i,c.clone().lerp(new THREE.Color(0xffffff),.76));springs.setColorAt(i,c.clone().lerp(new THREE.Color(0xe7e3dc),.34));
    if(z>31) frontRows.push({i,px,pz,zone});
    i++;
  }
  pockets.instanceMatrix.needsUpdate=springs.instanceMatrix.needsUpdate=true;if(pockets.instanceColor)pockets.instanceColor.needsUpdate=true;if(springs.instanceColor)springs.instanceColor.needsUpdate=true;
  group.add(pockets,springs);

  const boxMat=new THREE.MeshPhysicalMaterial({color:0xf2eee6,roughness:.82,transparent:true,opacity:.94});
  const back=new THREE.Mesh(new THREE.BoxGeometry(5.72,.78,.34),boxMat);back.position.z=-1.48;group.add(back);
  const left=new THREE.Mesh(new THREE.BoxGeometry(.34,.78,2.62),boxMat);left.position.x=-2.69;group.add(left);
  const right=new THREE.Mesh(new THREE.BoxGeometry(.34,.78,2.62),boxMat);right.position.x=2.69;group.add(right);
  const frontLow=new THREE.Mesh(new THREE.BoxGeometry(5.72,.16,.34),boxMat);frontLow.position.set(0,-.31,1.48);group.add(frontLow);
  group.userData={pockets,springs,boxMat,frontLow,frontRows};
  return group;
}

const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!mobile,powerPreference:'high-performance'});
renderer.setPixelRatio(DPR);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x080808,.027);
const camera=new THREE.PerspectiveCamera(mobile?45:31,1,.1,80);camera.position.set(mobile?5.2:8.7,mobile?4.6:5.8,mobile?10.8:12.6);
scene.add(new THREE.HemisphereLight(0xf3ece2,0x050505,1.7));
const key=new THREE.DirectionalLight(0xfff2dc,6);key.position.set(-5,9,7);scene.add(key);
const warm=new THREE.PointLight(0xc49057,28,20,2);warm.position.set(6,2,4);scene.add(warm);
const coreLight=new THREE.PointLight(0xffffff,18,10,2);coreLight.position.set(1,-.25,4);scene.add(coreLight);

const system=new THREE.Group();system.position.set(mobile?.45:1.6,mobile?.05:-.1,0);system.rotation.set(-.11,-.40,.01);system.scale.setScalar(mobile?.76:1);scene.add(system);
const W=6,D=3.55;
const mat={
  cover:new THREE.MeshPhysicalMaterial({color:0xeee8dc,roughness:.9}),fiber:new THREE.MeshPhysicalMaterial({color:0xf7f5f0,roughness:1,transparent:true,opacity:.95}),
  lining:new THREE.MeshPhysicalMaterial({color:0xded5c9,roughness:.96}),felt:new THREE.MeshPhysicalMaterial({color:0x66625d,roughness:1}),
  poly:new THREE.MeshPhysicalMaterial({color:0xefe5d3,roughness:.82}),memory:new THREE.MeshPhysicalMaterial({color:0xe0c35d,roughness:.76}),
  brown:new THREE.MeshPhysicalMaterial({color:0x4b3029,roughness:.86}),beige:new THREE.MeshPhysicalMaterial({color:0xa58e74,roughness:.76}),pipe:new THREE.MeshPhysicalMaterial({color:0xe8dfd2,roughness:.74})
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
const coverBase=new THREE.Mesh(roundedSlabGeometry(5.96,3.50,.18,.25,.04),mat.cover);topCover.add(coverBase);topPattern(topCover,5.80,3.34,.108);topCover.position.y=1.01;system.add(topCover);pieces.push({name:'topCover',obj:topCover,base:1.01});
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
  const whole=ease((progress-.02)/.94),coreFocus=phase(progress,.33,.67);
  core.rotation.y=coreFocus*.08;core.scale.y=.98+coreFocus*.06;
  core.userData.boxMat.opacity=.94-.56*coreFocus;
  core.userData.frontLow.position.y=-.31-.20*coreFocus;
  core.userData.pockets.material.opacity=.16+.10*coreFocus;
  core.userData.springs.material.emissive=new THREE.Color(0x0f0d0a);core.userData.springs.material.emissiveIntensity=.14*coreFocus;
  if(!reducedMotion){system.rotation.y=-.40+whole*.52+Math.sin(t*.30)*.015;system.rotation.x=-.11+Math.sin(t*.34)*.01;ring.rotation.z=t*.032;}
  const orbit=whole*Math.PI*.20,r=mobile?10.8:12.6;
  camera.position.x=(mobile?5.2:8.7)*Math.cos(orbit);
  camera.position.z=r-1.25*whole-1.55*coreFocus;
  camera.position.y=(mobile?4.6:5.8)-whole*.55-1.55*coreFocus;
  camera.lookAt(system.position.x,-.02-.34*coreFocus,0);
  coreLight.intensity=18+26*coreFocus;
  updateCallouts(progress);renderer.render(scene,camera);requestAnimationFrame(frameLoop);
}
frameLoop();