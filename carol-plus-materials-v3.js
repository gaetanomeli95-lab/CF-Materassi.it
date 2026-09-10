import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

export function roundedSlabGeometry(w,d,h,r=.18,b=.035){
  const rr=Math.min(r,w/2,d/2),s=new THREE.Shape();
  s.moveTo(-w/2+rr,-d/2);s.lineTo(w/2-rr,-d/2);s.quadraticCurveTo(w/2,-d/2,w/2,-d/2+rr);
  s.lineTo(w/2,d/2-rr);s.quadraticCurveTo(w/2,d/2,w/2-rr,d/2);s.lineTo(-w/2+rr,d/2);
  s.quadraticCurveTo(-w/2,d/2,-w/2,d/2-rr);s.lineTo(-w/2,-d/2+rr);s.quadraticCurveTo(-w/2,-d/2,-w/2+rr,-d/2);
  const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:3,curveSegments:12});
  g.center();g.rotateX(Math.PI/2);g.computeVertexNormals();return g;
}

function canvasTexture(draw,w=1200,h=720){
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
}

function loadRealTexture(url,{repeatX=1,repeatY=1,wrap=true}={}){
  const t=new THREE.TextureLoader().load(url,texture=>{
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=8;
    if(wrap){texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(repeatX,repeatY)}
    window.dispatchEvent(new Event('cf:carol-real-texture-ready'));
  });
  t.colorSpace=THREE.SRGBColorSpace;
  if(wrap){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeatX,repeatY)}
  return t;
}

const REAL_TOP='https://d2ol7oe51mr4n9.cloudfront.net/user_3J5bcdAgqMsyUqzT0zx6yGprNjK/d6ce3960-b6a1-4777-b2aa-a2d7129f5b8b.jpg';
const REAL_BEIGE='https://d2ol7oe51mr4n9.cloudfront.net/user_3J5bcdAgqMsyUqzT0zx6yGprNjK/bfe8b900-1582-44a7-bb54-14122c095506.jpg';
const REAL_RIBBON='https://d2ol7oe51mr4n9.cloudfront.net/user_3J5bcdAgqMsyUqzT0zx6yGprNjK/34015825-1b84-4f7b-9b09-7143459f5f65.jpg';

export function createCarolTextures(){
  const floral=canvasTexture((x,w,h)=>{
    x.fillStyle='#eee8dd';x.fillRect(0,0,w,h);
    const grad=x.createLinearGradient(0,0,w,h);grad.addColorStop(0,'rgba(255,255,255,.30)');grad.addColorStop(1,'rgba(133,112,91,.08)');x.fillStyle=grad;x.fillRect(0,0,w,h);
    x.strokeStyle='rgba(114,94,75,.42)';x.lineWidth=3.2;
    const cw=w/5,ch=h/3;
    for(let yy=0;yy<3;yy++)for(let xx=0;xx<5;xx++){
      const cx=(xx+.5)*cw,cy=(yy+.5)*ch;
      x.beginPath();x.roundRect(cx-cw*.43,cy-ch*.40,cw*.86,ch*.80,28);x.stroke();
      x.beginPath();x.arc(cx,cy,10,0,Math.PI*2);x.stroke();
    }
  });
  const bump=canvasTexture((x,w,h)=>{
    x.fillStyle='#6b6b6b';x.fillRect(0,0,w,h);x.strokeStyle='#eeeeee';x.lineWidth=11;
    const cw=w/5,ch=h/3;
    for(let yy=0;yy<3;yy++)for(let xx=0;xx<5;xx++){
      const cx=(xx+.5)*cw,cy=(yy+.5)*ch;x.beginPath();x.roundRect(cx-cw*.43,cy-ch*.40,cw*.86,ch*.80,28);x.stroke();
      x.fillStyle='#3e3e3e';x.beginPath();x.arc(cx,cy,17,0,Math.PI*2);x.fill();x.fillStyle='#6b6b6b';
    }
  });
  const ribbon=loadRealTexture(REAL_RIBBON,{repeatX:1.55,repeatY:1});
  const breathe=loadRealTexture(REAL_BEIGE,{repeatX:2.1,repeatY:1});
  const realTop=loadRealTexture(REAL_TOP,{repeatX:1.02,repeatY:1.08});
  return {floral,bump,ribbon,breathe,realTop};
}

export function createCarolMaterials(){
  const tex=createCarolTextures();
  return {
    tex,
    cover:new THREE.MeshPhysicalMaterial({color:0xeee7da,roughness:.91,sheen:.35,sheenColor:new THREE.Color(0xffffff)}),
    fiber:new THREE.MeshPhysicalMaterial({color:0xf8f6f2,roughness:1,transparent:true,opacity:.96}),
    lining:new THREE.MeshPhysicalMaterial({color:0xded4c8,roughness:.98}),
    felt:new THREE.MeshPhysicalMaterial({color:0x6e6a64,roughness:1}),
    poly:new THREE.MeshPhysicalMaterial({color:0xeee4d3,roughness:.84}),
    memory:new THREE.MeshPhysicalMaterial({color:0xe1c35b,roughness:.80}),
    brown:new THREE.MeshPhysicalMaterial({color:0x543a30,roughness:.94,sheen:.78,sheenColor:new THREE.Color(0x8a6656),sheenRoughness:.82}),
    beige:new THREE.MeshPhysicalMaterial({map:tex.breathe,color:0xffffff,roughness:.88,bumpMap:tex.breathe,bumpScale:.010}),
    pipe:new THREE.MeshPhysicalMaterial({color:0xe7ddd2,roughness:.78})
  };
}

export function frame(w,d,h,t,mat){
  function outline(width,depth,r){
    const shape=new THREE.Shape(),x=width/2,z=depth/2;
    shape.moveTo(-x+r,-z);shape.lineTo(x-r,-z);shape.quadraticCurveTo(x,-z,x,-z+r);
    shape.lineTo(x,z-r);shape.quadraticCurveTo(x,z,x-r,z);shape.lineTo(-x+r,z);
    shape.quadraticCurveTo(-x,z,-x,z-r);shape.lineTo(-x,-z+r);shape.quadraticCurveTo(-x,-z,-x+r,-z);
    return shape;
  }
  const shape=outline(w,d,.18);
  shape.holes.push(new THREE.Path(outline(w-2*t,d-2*t,.18-t).getPoints(12).reverse()));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,curveSegments:12});
  geometry.center();geometry.rotateX(Math.PI/2);
  return new THREE.Mesh(geometry,mat);
}

export function ribbon(group,w,d,y,texture){
  const m=new THREE.MeshPhysicalMaterial({map:texture,color:0xffffff,roughness:.78,side:THREE.DoubleSide});
  const f=new THREE.Mesh(new THREE.PlaneGeometry(w-.15,.062),m);f.position.set(0,y,d/2+.013);group.add(f);
  const r=new THREE.Mesh(new THREE.PlaneGeometry(d-.15,.062),m);r.position.set(w/2+.013,y,0);r.rotation.y=Math.PI/2;group.add(r);
}

export function handles(group,w,d,y){
  const strapMat=new THREE.MeshPhysicalMaterial({color:0x4f342c,roughness:.96,sheen:.5});
  const stitchMat=new THREE.MeshStandardMaterial({color:0x9e856e,roughness:1});
  for(const side of [-1,1])for(const z of [-d*.25,d*.25]){
    const strap=new THREE.Mesh(new THREE.BoxGeometry(.035,.07,.64),strapMat);
    strap.position.set(side*(w/2+.025),y,z);group.add(strap);
    for(const dz of [-.27,.27]){
      const patch=new THREE.Mesh(new THREE.BoxGeometry(.04,.085,.08),stitchMat);
      patch.position.set(side*(w/2+.026),y,z+dz);group.add(patch);
    }
  }
}

export function topPattern(group,w,d,y,mats,mobile=false){
  const g=new THREE.PlaneGeometry(w-.14,d-.14,mobile?72:128,mobile?86:150);
  const positions=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<positions.count;i++){
    const u=uv.getX(i),v=uv.getY(i);
    // Real Carol Plus quilting: broad padded islands plus smaller tufting relief.
    const quilt=(Math.pow(Math.sin(u*Math.PI*5),2)*Math.pow(Math.sin(v*Math.PI*6),2))*.010;
    const micro=(Math.sin(u*Math.PI*18)*Math.sin(v*Math.PI*20)+1)*.0018;
    const edge=Math.min(1,Math.min(u,1-u,v,1-v)*30);
    positions.setZ(i,(quilt+micro)*edge);
  }
  g.computeVertexNormals();
  const material=new THREE.MeshPhysicalMaterial({
    map:mats.tex.realTop,
    bumpMap:mats.tex.realTop,
    bumpScale:.010,
    color:0xffffff,
    roughness:.92,
    sheen:.30,
    sheenColor:new THREE.Color(0xffffff),
    side:THREE.FrontSide
  });
  const p=new THREE.Mesh(g,material);p.rotation.x=-Math.PI/2;p.position.y=y;group.add(p);return p;
}
