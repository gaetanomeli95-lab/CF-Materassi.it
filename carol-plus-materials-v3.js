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

function petal(x,cx,cy,ang,len,wid){
  x.save();x.translate(cx,cy);x.rotate(ang);x.beginPath();x.moveTo(0,0);
  x.bezierCurveTo(-wid,-len*.32,-wid*.75,-len*.82,0,-len);
  x.bezierCurveTo(wid*.75,-len*.82,wid,-len*.32,0,0);x.stroke();x.restore();
}
function curl(x,cx,cy,r,ang){
  x.save();x.translate(cx,cy);x.rotate(ang);x.beginPath();
  x.moveTo(0,0);x.bezierCurveTo(r*.9,-r*.25,r*.9,-r*.95,r*.18,-r);
  x.bezierCurveTo(-r*.42,-r,-r*.42,-r*.36,-r*.05,-r*.33);x.stroke();x.restore();
}
function flower(x,cx,cy,s,rot=0){
  x.save();x.translate(cx,cy);x.rotate(rot);x.translate(-cx,-cy);
  for(let i=0;i<8;i++) petal(x,cx,cy,i*Math.PI/4,s*.31,s*.10);
  x.beginPath();x.arc(cx,cy,s*.055,0,Math.PI*2);x.stroke();
  for(let i=0;i<6;i++) curl(x,cx,cy,s*.19,i*Math.PI/3+Math.PI/6);
  x.restore();
}

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
    x.strokeStyle='rgba(108,88,70,.58)';x.lineWidth=5;
    flower(x,w*.18,h*.25,170,-.10);flower(x,w*.50,h*.18,155,.16);flower(x,w*.79,h*.27,175,-.18);
    flower(x,w*.34,h*.66,180,.13);flower(x,w*.68,h*.70,170,-.08);
    x.strokeStyle='rgba(139,118,96,.16)';x.lineWidth=2;
    for(let i=0;i<9;i++){const yy=(i+.5)*h/9;x.beginPath();x.moveTo(0,yy);x.bezierCurveTo(w*.25,yy-18,w*.72,yy+18,w,yy);x.stroke();}
  });
  const bump=canvasTexture((x,w,h)=>{
    x.fillStyle='#6b6b6b';x.fillRect(0,0,w,h);x.strokeStyle='#eeeeee';x.lineWidth=11;
    const cw=w/5,ch=h/3;
    for(let yy=0;yy<3;yy++)for(let xx=0;xx<5;xx++){
      const cx=(xx+.5)*cw,cy=(yy+.5)*ch;x.beginPath();x.roundRect(cx-cw*.43,cy-ch*.40,cw*.86,ch*.80,28);x.stroke();
      x.fillStyle='#3e3e3e';x.beginPath();x.arc(cx,cy,17,0,Math.PI*2);x.fill();x.fillStyle='#6b6b6b';
    }
    x.strokeStyle='rgba(220,220,220,.72)';x.lineWidth=6;
    for(let i=0;i<8;i++){const yy=(i+.5)*h/8;x.beginPath();x.moveTo(0,yy);x.bezierCurveTo(w*.28,yy-15,w*.70,yy+15,w,yy);x.stroke();}
  });
  const ribbon=canvasTexture((x,w,h)=>{
    x.fillStyle='#4b3029';x.fillRect(0,0,w,h);x.font='600 34px Arial';x.textBaseline='middle';
    for(let i=0;i<6;i++){const px=i*w/6+8;x.fillStyle='#eee5d9';x.fillText('Made in Italy',px,h/2);x.fillStyle='#1f8b4c';x.fillRect(px+158,43,16,26);x.fillStyle='#fff';x.fillRect(px+174,43,16,26);x.fillStyle='#c83b38';x.fillRect(px+190,43,16,26);}
  },1200,112);ribbon.wrapS=THREE.RepeatWrapping;ribbon.repeat.x=1.45;
  const breathe=canvasTexture((x,w,h)=>{
    x.fillStyle='#a59077';x.fillRect(0,0,w,h);x.fillStyle='rgba(58,42,30,.28)';
    for(let yy=9;yy<h;yy+=15)for(let xx=8+(Math.floor(yy/15)%2?7:0);xx<w;xx+=15){x.beginPath();x.arc(xx,yy,2.5,0,Math.PI*2);x.fill();}
  },700,240);breathe.wrapS=breathe.wrapT=THREE.RepeatWrapping;breathe.repeat.set(2.5,1.1);
  return {floral,bump,ribbon,breathe};
}

export function createCarolMaterials(){
  const tex=createCarolTextures();
  return {
    tex,
    cover:new THREE.MeshPhysicalMaterial({color:0xeee7da,roughness:.91,sheen:.35,sheenColor:new THREE.Color(0xffffff)}),
    fiber:new THREE.MeshPhysicalMaterial({color:0xf8f6f2,roughness:1,transparent:true,opacity:.96}),
    lining:new THREE.MeshPhysicalMaterial({color:0xded4c8,roughness:.98}),
    felt:new THREE.MeshPhysicalMaterial({color:0x5f5c58,roughness:1}),
    poly:new THREE.MeshPhysicalMaterial({color:0xeee4d3,roughness:.84}),
    memory:new THREE.MeshPhysicalMaterial({color:0xd9b84b,roughness:.77}),
    brown:new THREE.MeshPhysicalMaterial({color:0x60483b,roughness:.91,sheen:1,sheenColor:new THREE.Color(0x8a6656),sheenRoughness:.78}),
    beige:new THREE.MeshPhysicalMaterial({map:tex.breathe,color:0xe0cfb6,roughness:.83,bumpMap:tex.breathe,bumpScale:.012}),
    pipe:new THREE.MeshPhysicalMaterial({color:0xe5d8c8,roughness:.75})
  };
}

export function frame(w,d,h,t,mat){
  // A closed, rounded textile shell, not four intersecting rectangular bars.
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
  const m=new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide});
  const f=new THREE.Mesh(new THREE.PlaneGeometry(w-.15,.062),m);f.position.set(0,y,d/2+.013);group.add(f);
  const r=new THREE.Mesh(new THREE.PlaneGeometry(d-.15,.062),m);r.position.set(w/2+.013,y,0);r.rotation.y=Math.PI/2;group.add(r);
}
export function handles(group,w,d,y){
  const strapMat=new THREE.MeshPhysicalMaterial({color:0x60483b,roughness:.95,sheen:.6});
  const stitchMat=new THREE.MeshStandardMaterial({color:0x9e856e,roughness:1});
  // Four handles, two on each long side, as specified in the Carol Plus sheet.
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
  const g=new THREE.PlaneGeometry(w-.14,d-.14,mobile?64:112,mobile?76:132);
  const positions=g.attributes.position,uv=g.attributes.uv;
  // Project only the textile surface from the actual catalog photograph onto
  // the mesh. No photograph plane or background is added to the scene.
  // Corners in catalogo-carol-plus.jpg (1312 x 1869): front-left, front-right,
  // back-right, back-left. Projective UVs remove the photograph's perspective.
  const q=[[104/1312,481/1869],[745/1312,691/1869],[1192/1312,528/1869],[531/1312,389/1869]];
  const [a,b,c,e]=q,dx1=b[0]-c[0],dx2=e[0]-c[0],dx3=a[0]-b[0]+c[0]-e[0];
  const dy1=b[1]-c[1],dy2=e[1]-c[1],dy3=a[1]-b[1]+c[1]-e[1],det=dx1*dy2-dx2*dy1;
  const gx=(dx3*dy2-dx2*dy3)/det,gy=(dx1*dy3-dx3*dy1)/det;
  for(let i=0;i<positions.count;i++){
    const u=uv.getX(i),v=uv.getY(i),den=gx*u+gy*v+1;
    const photoX=((b[0]-a[0]+gx*b[0])*u+(e[0]-a[0]+gy*e[0])*v+a[0])/den;
    const photoY=((b[1]-a[1]+gx*b[1])*u+(e[1]-a[1]+gy*e[1])*v+a[1])/den;
    uv.setXY(i,photoX,1-photoY);
    // Small physical loft; the floral motif is the photographed fabric itself.
    const loft=Math.pow(Math.sin(u*Math.PI*6)*Math.sin(v*Math.PI*8),2)*.008;
    const edge=Math.min(1,Math.min(u,1-u,v,1-v)*35);
    positions.setZ(i,loft*edge);
  }
  g.computeVertexNormals();uv.needsUpdate=true;
  const material=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.94,sheen:.22,side:THREE.FrontSide});
  const photo=new THREE.TextureLoader().load('./catalogo-carol-plus.jpg',texture=>{
    texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;
    material.map=texture;material.needsUpdate=true;
    window.dispatchEvent(new Event('cf:carol-texture-ready'));
  },undefined,()=>console.warn('Carol Plus textile reference could not be loaded'));
  photo.colorSpace=THREE.SRGBColorSpace;
  const p=new THREE.Mesh(g,material);p.rotation.x=-Math.PI/2;p.position.y=y;group.add(p);return p;
}
