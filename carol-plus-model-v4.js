import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {roundedSlabGeometry,createCarolMaterials,frame,ribbon,handles,zipper,topPattern} from './carol-plus-materials-v4.js?v=1';

// Product proportions based on the real Carol Plus: 160 x 190 cm, H27.
const W=160/30,D=190/30,H=27/30;

function helix(height=.46){
  const pts=[],turns=5.3,segments=92;
  for(let i=0;i<=segments;i++){
    const t=i/segments,a=t*Math.PI*2*turns,r=.0345+Math.sin(t*Math.PI)*.0025;
    pts.push(new THREE.Vector3(Math.cos(a)*r,(t-.5)*height,Math.sin(a)*r));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),92,.0042,5,false);
}

function springCore(){
  const group=new THREE.Group(),cols=40,rows=40,frontRows=6,rearRows=rows-frontRows;
  const coreH=14/30,radius=.050,xSpan=W-.92,zSpan=D-.92;
  const pocketGeo=new THREE.CylinderGeometry(radius,radius,coreH,12,1,false),springGeo=helix(coreH*.88);
  const rearPocketMat=new THREE.MeshPhysicalMaterial({color:0xf0ede7,roughness:.99,sheen:.08});
  const frontPocketMat=new THREE.MeshPhysicalMaterial({color:0xf7f4ee,roughness:.96,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide});
  const rearSpringMat=new THREE.MeshStandardMaterial({color:0xc4c4c0,metalness:.48,roughness:.48});
  const frontSpringMat=new THREE.MeshStandardMaterial({color:0xd9d8d4,metalness:.76,roughness:.28});
  const rearCount=cols*rearRows,frontCount=cols*frontRows;
  const pocketsRear=new THREE.InstancedMesh(pocketGeo,rearPocketMat,rearCount),pocketsFront=new THREE.InstancedMesh(pocketGeo,frontPocketMat,frontCount);
  const springsRear=new THREE.InstancedMesh(springGeo,rearSpringMat,rearCount),springsFront=new THREE.InstancedMesh(springGeo,frontSpringMat,frontCount);
  const dummy=new THREE.Object3D();let ri=0,fi=0;
  for(let z=0;z<rows;z++) for(let x=0;x<cols;x++){
    const zone=Math.floor((x/(cols-1))*7),zoneScale=[.98,1.015,.99,1.025,.99,1.015,.98][zone];
    dummy.position.set(-xSpan/2+x*xSpan/(cols-1),0,-zSpan/2+z*zSpan/(rows-1));
    dummy.scale.set(1,zoneScale,1);dummy.updateMatrix();
    const front=z>=rearRows,index=front?fi++:ri++;
    (front?pocketsFront:pocketsRear).setMatrixAt(index,dummy.matrix);(front?springsFront:springsRear).setMatrixAt(index,dummy.matrix);
  }
  for(const mesh of [pocketsRear,pocketsFront,springsRear,springsFront]){mesh.instanceMatrix.needsUpdate=true;group.add(mesh);}

  // 9 x 14 cm anti-sag perimeter pads. Front is opened as a cutaway only in the technical view.
  const boxMat=new THREE.MeshPhysicalMaterial({color:0xe8e0d3,roughness:.95});
  const t=9/30;
  const back=new THREE.Mesh(new THREE.BoxGeometry(W-.18,coreH,t),boxMat);back.position.z=-D/2+t/2+.05;
  const left=new THREE.Mesh(new THREE.BoxGeometry(t,coreH,D-.58),boxMat);left.position.x=-W/2+t/2+.05;
  const right=left.clone();right.position.x=W/2-t/2-.05;
  const frontL=new THREE.Mesh(new THREE.BoxGeometry(.70,coreH,t),boxMat);frontL.position.set(-W/2+.41,0,D/2-t/2-.05);
  const frontR=frontL.clone();frontR.position.x=W/2-.41;
  group.add(back,left,right,frontL,frontR);
  group.userData={pocketsRear,pocketsFront,springsRear,springsFront,boxMat,frontL,frontR};
  return group;
}

export function buildCarolPlusModel({mobile=false}={}){
  const mats=createCarolMaterials(),system=new THREE.Group(),pieces=[];
  const slab=(name,y,h,mat,w=W-.18,d=D-.18,r=.18)=>{
    const obj=new THREE.Mesh(roundedSlabGeometry(w,d,h,r,Math.min(.010,h*.08)),mat);obj.position.y=y;system.add(obj);pieces.push({name,obj,base:y});return obj;
  };

  // Verified technical stack, fitted inside the H27 outer envelope.
  slab('bottomCover',-.430,.026,mats.cover);
  slab('liningBottom',-.410,.012,mats.lining);
  slab('polyBottom',-.350,.100,mats.poly);
  slab('feltBottom',-.291,.018,mats.felt);
  const core=springCore();core.position.y=-.049;system.add(core);pieces.push({name:'core',obj:core,base:-.049});
  slab('feltTop',.193,.018,mats.felt);
  slab('polyTop',.252,.100,mats.poly);
  slab('memory',.386,.167,mats.memory);
  slab('liningTop',.475,.012,mats.lining);
  slab('fiber',.492,.020,mats.fiber);

  // Actual Carol Plus exterior: chocolate velvet lower band, beige breathable 3D band,
  // then a thick cream pillow-top with striped piping and rectangular floral quilting.
  const lowerShell=new THREE.Group();
  const velvet=frame(W,D,.405,.070,mats.brown,.22);velvet.position.y=-.235;lowerShell.add(velvet);
  const bottomPipe=frame(W,D,.026,.040,mats.pipe,.22);bottomPipe.position.y=-.445;lowerShell.add(bottomPipe);
  ribbon(lowerShell,W,D,-.020,mats.tex.ribbon);handles(lowerShell,W,D,-.245);zipper(lowerShell,W,D,-.020);
  system.add(lowerShell);pieces.push({name:'lowerShell',obj:lowerShell,base:0});

  const upperShell=new THREE.Group();
  const breathable=frame(W,D,.315,.070,mats.beige,.22);breathable.position.y=.137;upperShell.add(breathable);
  system.add(upperShell);pieces.push({name:'upperShell',obj:upperShell,base:0});

  const topCover=new THREE.Group();
  // Pillow-top side wall + padded border + quilted field.
  const pillowSide=frame(W-.035,D-.035,.145,.105,mats.topSide,.24);pillowSide.position.y=.355;topCover.add(pillowSide);
  const bolster=frame(W-.060,D-.060,.070,.180,mats.cover,.24);bolster.position.y=.423;topCover.add(bolster);
  const topPipe=frame(W-.025,D-.025,.030,.040,mats.pipe,.24);topPipe.position.y=.452;topCover.add(topPipe);
  topPattern(topCover,W-.43,D-.43,.463,mats,mobile);
  topCover.position.y=0;system.add(topCover);pieces.push({name:'topCover',obj:topCover,base:0});

  const offsets={topCover:2.22,upperShell:1.91,fiber:1.68,liningTop:1.48,memory:1.17,polyTop:.84,feltTop:.55,core:0,feltBottom:-.42,polyBottom:-.70,liningBottom:-.96,bottomCover:-1.18,lowerShell:-1.41};
  const timings={topCover:[.04,.21],upperShell:[.07,.25],fiber:[.10,.29],liningTop:[.13,.33],memory:[.17,.41],polyTop:[.23,.47],feltTop:[.29,.53],core:[.37,.61],feltBottom:[.49,.69],polyBottom:[.55,.76],liningBottom:[.62,.82],bottomCover:[.68,.88],lowerShell:[.72,.93]};
  return {system,pieces,core,offsets,timings,mats,W,D,H};
}
