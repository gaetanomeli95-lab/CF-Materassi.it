import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

export function roundedSlabGeometry(w,d,h,r=.20,b=.025){
  const rr=Math.min(r,w/2,d/2),s=new THREE.Shape();
  s.moveTo(-w/2+rr,-d/2);s.lineTo(w/2-rr,-d/2);s.quadraticCurveTo(w/2,-d/2,w/2,-d/2+rr);
  s.lineTo(w/2,d/2-rr);s.quadraticCurveTo(w/2,d/2,w/2-rr,d/2);s.lineTo(-w/2+rr,d/2);
  s.quadraticCurveTo(-w/2,d/2,-w/2,d/2-rr);s.lineTo(-w/2,-d/2+rr);s.quadraticCurveTo(-w/2,-d/2,-w/2+rr,-d/2);
  const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:4,curveSegments:16});
  g.center();g.rotateX(Math.PI/2);g.computeVertexNormals();return g;
}

function canvasTexture(draw,w=1200,h=400){
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
}

export function createCarolTextures(){
  // Breathable beige 3D band: small regular perforation, deliberately subtle.
  const breathe=canvasTexture((x,w,h)=>{
    x.fillStyle='#aa967d';x.fillRect(0,0,w,h);
    const grad=x.createLinearGradient(0,0,0,h);grad.addColorStop(0,'rgba(255,255,255,.15)');grad.addColorStop(1,'rgba(60,40,28,.08)');x.fillStyle=grad;x.fillRect(0,0,w,h);
    x.fillStyle='rgba(60,43,30,.26)';
    for(let yy=8;yy<h;yy+=13) for(let xx=8+((yy/13|0)%2?6:0);xx<w;xx+=13){x.beginPath();x.arc(xx,yy,2.0,0,Math.PI*2);x.fill();}
  },900,260);breathe.wrapS=breathe.wrapT=THREE.RepeatWrapping;breathe.repeat.set(2.4,1);

  // Carol Plus has the Made in Italy ribbon exactly between the beige and velvet bands.
  const ribbon=canvasTexture((x,w,h)=>{
    x.fillStyle='#4b3029';x.fillRect(0,0,w,h);
    x.font='600 31px Arial';x.textBaseline='middle';
    for(let i=0;i<6;i++){
      const px=i*w/6+10;x.fillStyle='#efe7dc';x.fillText('Made in Italy',px,h/2);
      const fx=px+154;x.fillStyle='#16834a';x.fillRect(fx,35,13,22);x.fillStyle='#f4f4f1';x.fillRect(fx+13,35,13,22);x.fillStyle='#c83b38';x.fillRect(fx+26,35,13,22);
    }
  },1200,92);ribbon.wrapS=THREE.RepeatWrapping;ribbon.repeat.x=1.55;

  // Dark/cream rope-like piping visible on the real mattress.
  const piping=canvasTexture((x,w,h)=>{
    x.fillStyle='#e8dfd3';x.fillRect(0,0,w,h);
    x.strokeStyle='#5a4338';x.lineWidth=7;
    for(let i=-h;i<w+h;i+=22){x.beginPath();x.moveTo(i,h);x.lineTo(i+h,0);x.stroke();}
  },900,72);piping.wrapS=THREE.RepeatWrapping;piping.repeat.set(3.2,1);

  return {breathe,ribbon,piping};
}

export function createCarolMaterials(){
  const tex=createCarolTextures();
  return {
    tex,
    cover:new THREE.MeshPhysicalMaterial({color:0xeee8dc,roughness:.93,sheen:.32,sheenColor:new THREE.Color(0xffffff),sheenRoughness:.78}),
    topSide:new THREE.MeshPhysicalMaterial({color:0xe9e1d4,roughness:.91,sheen:.28,sheenColor:new THREE.Color(0xffffff)}),
    fiber:new THREE.MeshPhysicalMaterial({color:0xf6f2eb,roughness:1}),
    lining:new THREE.MeshPhysicalMaterial({color:0xe2d9cc,roughness:.98}),
    felt:new THREE.MeshPhysicalMaterial({color:0x73706b,roughness:1}),
    poly:new THREE.MeshPhysicalMaterial({color:0xeee5d5,roughness:.88}),
    memory:new THREE.MeshPhysicalMaterial({color:0xe2cf7a,roughness:.83}),
    brown:new THREE.MeshPhysicalMaterial({color:0x4c342d,roughness:.93,sheen:.85,sheenColor:new THREE.Color(0x806253),sheenRoughness:.80}),
    beige:new THREE.MeshPhysicalMaterial({map:tex.breathe,color:0xffffff,roughness:.89,bumpMap:tex.breathe,bumpScale:.009}),
    pipe:new THREE.MeshPhysicalMaterial({map:tex.piping,color:0xffffff,roughness:.82}),
    metal:new THREE.MeshStandardMaterial({color:0xcac9c5,metalness:.78,roughness:.31})
  };
}

export function frame(w,d,h,t,mat,r=.20){
  function outline(width,depth,rad){
    const shape=new THREE.Shape(),x=width/2,z=depth/2,rr=Math.max(.025,Math.min(rad,width/2,depth/2));
    shape.moveTo(-x+rr,-z);shape.lineTo(x-rr,-z);shape.quadraticCurveTo(x,-z,x,-z+rr);
    shape.lineTo(x,z-rr);shape.quadraticCurveTo(x,z,x-rr,z);shape.lineTo(-x+rr,z);
    shape.quadraticCurveTo(-x,z,-x,z-rr);shape.lineTo(-x,-z+rr);shape.quadraticCurveTo(-x,-z,-x+rr,-z);
    return shape;
  }
  const shape=outline(w,d,r);
  const inner=outline(w-2*t,d-2*t,Math.max(.03,r-t));
  shape.holes.push(new THREE.Path(inner.getPoints(16).reverse()));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,curveSegments:16});
  geometry.center();geometry.rotateX(Math.PI/2);geometry.computeVertexNormals();
  return new THREE.Mesh(geometry,mat);
}

export function ribbon(group,w,d,y,texture){
  const m=new THREE.MeshPhysicalMaterial({map:texture,color:0xffffff,roughness:.80,side:THREE.DoubleSide});
  const front=new THREE.Mesh(new THREE.PlaneGeometry(w-.18,.070),m);front.position.set(0,y,d/2+.018);group.add(front);
  const back=front.clone();back.position.z=-d/2-.018;back.rotation.y=Math.PI;group.add(back);
  const right=new THREE.Mesh(new THREE.PlaneGeometry(d-.18,.070),m);right.position.set(w/2+.018,y,0);right.rotation.y=Math.PI/2;group.add(right);
  const left=right.clone();left.position.x=-w/2-.018;left.rotation.y=-Math.PI/2;group.add(left);
}

export function handles(group,w,d,y){
  const strapMat=new THREE.MeshPhysicalMaterial({color:0x4b342d,roughness:.95,sheen:.42});
  const edgeMat=new THREE.MeshStandardMaterial({color:0x8b7263,roughness:1});
  for(const side of [-1,1]) for(const z of [-d*.24,d*.24]){
    const strap=new THREE.Mesh(new THREE.BoxGeometry(.035,.075,.62),strapMat);strap.position.set(side*(w/2+.026),y,z);group.add(strap);
    for(const dz of [-.27,.27]){const patch=new THREE.Mesh(new THREE.BoxGeometry(.041,.088,.085),edgeMat);patch.position.set(side*(w/2+.027),y,z+dz);group.add(patch);}
  }
}

export function zipper(group,w,d,y){
  const zipMat=new THREE.MeshStandardMaterial({color:0xbcbcbc,metalness:.82,roughness:.28});
  const body=new THREE.Mesh(new THREE.BoxGeometry(.055,.075,.12),zipMat);body.position.set(.62,y,d/2+.034);group.add(body);
  const tab=new THREE.Mesh(new THREE.BoxGeometry(.025,.12,.035),zipMat);tab.position.set(.62,y-.075,d/2+.045);tab.rotation.z=.20;group.add(tab);
}

export function topPattern(group,w,d,y,mats,mobile=false){
  // The catalog photograph is used only as verified textile reference mapped on the mesh.
  // The product geometry itself is procedural and remains genuinely 3D.
  const segX=mobile?70:130,segY=mobile?84:154;
  const g=new THREE.PlaneGeometry(w,d,segX,segY),pos=g.attributes.position,uv=g.attributes.uv;

  // Projective crop of the actual Carol Plus top surface from catalogo-carol-plus.jpg.
  const q=[[104/1312,481/1869],[745/1312,691/1869],[1192/1312,528/1869],[531/1312,389/1869]];
  const [a,b,c,e]=q,dx1=b[0]-c[0],dx2=e[0]-c[0],dx3=a[0]-b[0]+c[0]-e[0],dy1=b[1]-c[1],dy2=e[1]-c[1],dy3=a[1]-b[1]+c[1]-e[1],det=dx1*dy2-dx2*dy1;
  const gx=(dx3*dy2-dx2*dy3)/det,gy=(dx1*dy3-dx3*dy1)/det;

  const cols=4,rows=5;
  for(let i=0;i<pos.count;i++){
    const u=uv.getX(i),v=uv.getY(i),den=gx*u+gy*v+1;
    const photoX=((b[0]-a[0]+gx*b[0])*u+(e[0]-a[0]+gy*e[0])*v+a[0])/den;
    const photoY=((b[1]-a[1]+gx*b[1])*u+(e[1]-a[1]+gy*e[1])*v+a[1])/den;
    uv.setXY(i,photoX,1-photoY);

    // Carol Plus: large quilted rectangular cushions with soft stitched channels,
    // not the previous wave/sinusoid mattress surface.
    const fu=(u*cols)%1,fv=(v*rows)%1;
    const cell=Math.pow(Math.sin(Math.PI*fu),.72)*Math.pow(Math.sin(Math.PI*fv),.72);
    const edge=Math.min(1,Math.min(u,1-u,v,1-v)*28);
    const cx=Math.abs(fu-.5),cy=Math.abs(fv-.5);
    const tuft=Math.exp(-((cx*cx+cy*cy)/.020));
    const subtle=Math.sin(u*Math.PI*16)*Math.sin(v*Math.PI*18)*.0014;
    pos.setZ(i,((cell*.030)-(tuft*.010)+subtle)*edge);
  }
  uv.needsUpdate=true;g.computeVertexNormals();

  const material=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.94,sheen:.30,sheenColor:new THREE.Color(0xffffff),side:THREE.FrontSide});
  const photo=new THREE.TextureLoader().load('./catalogo-carol-plus.jpg',texture=>{
    texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;
    material.map=texture;material.needsUpdate=true;window.dispatchEvent(new Event('cf:carol-texture-ready'));
  });
  photo.colorSpace=THREE.SRGBColorSpace;
  const p=new THREE.Mesh(g,material);p.rotation.x=-Math.PI/2;p.position.y=y;group.add(p);return p;
}
