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
    brown:new THREE.MeshPhysicalMaterial({color:0x4a3029,roughness:.91,sheen:1,sheenColor:new THREE.Color(0x8a6656),sheenRoughness:.78}),
    beige:new THREE.MeshPhysicalMaterial({map:tex.breathe,color:0xb19c83,roughness:.83,bumpMap:tex.breathe,bumpScale:.04}),
    pipe:new THREE.MeshPhysicalMaterial({color:0xe5d8c8,roughness:.75})
  };
}

export function frame(w,d,h,t,mat){
  const g=new THREE.Group();
  const a=new THREE.Mesh(new THREE.BoxGeometry(w,h,t),mat),b=a.clone();a.position.z=d/2-t/2;b.position.z=-d/2+t/2;
  const c=new THREE.Mesh(new THREE.BoxGeometry(t,h,d-2*t),mat),e=c.clone();c.position.x=w/2-t/2;e.position.x=-w/2+t/2;g.add(a,b,c,e);return g;
}
export function ribbon(group,w,d,y,texture){
  const m=new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide});
  const f=new THREE.Mesh(new THREE.PlaneGeometry(w-.15,.062),m);f.position.set(0,y,d/2+.013);group.add(f);
  const r=new THREE.Mesh(new THREE.PlaneGeometry(d-.15,.062),m);r.position.set(w/2+.013,y,0);r.rotation.y=Math.PI/2;group.add(r);
}
export function handles(group,w,d,y){
  const strapMat=new THREE.MeshPhysicalMaterial({color:0x382924,roughness:.90,sheen:1,sheenColor:new THREE.Color(0x816054)});
  const patchMat=new THREE.MeshBasicMaterial({color:0x6b4c42});
  const add=(x,z,rot=0)=>{const h=new THREE.Mesh(new THREE.BoxGeometry(.70,.09,.052),strapMat);h.position.set(x,y,z);h.rotation.y=rot;group.add(h);[-.23,.23].forEach(o=>{const p=new THREE.Mesh(new THREE.BoxGeometry(.12,.094,.056),patchMat);p.position.copy(h.position);if(rot===0)p.position.x+=o;else p.position.z+=o;p.rotation.y=rot;group.add(p);});};
  add(-1.55,d/2+.035);add(.25,d/2+.035);add(w/2+.035,-.68,Math.PI/2);
}
export function topPattern(group,w,d,y,mats,mobile=false){
  const g=new THREE.PlaneGeometry(w-.14,d-.14,mobile?52:104,mobile?32:64);
  const m=new THREE.MeshPhysicalMaterial({map:mats.tex.floral,bumpMap:mats.tex.bump,bumpScale:.12,displacementMap:mats.tex.bump,displacementScale:.065,color:0xfaf7f0,roughness:.91,sheen:.45,sheenColor:new THREE.Color(0xffffff),side:THREE.DoubleSide});
  const p=new THREE.Mesh(g,m);p.rotation.x=-Math.PI/2;p.position.y=y;group.add(p);return p;
}
