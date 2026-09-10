import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {roundedSlabGeometry,createCarolMaterials,frame,ribbon,handles,topPattern} from './carol-plus-materials-v3.js?v=carol-refine-1';

// Centimetres converted to scene units. The assembled silhouette follows a
// 160 x 190 cm mattress, approximately H27, rather than the old thick block.
const W=160/30,D=190/30;
function helix(){
  const pts=[],turns=5,segments=80;
  for(let i=0;i<=segments;i++){
    const t=i/segments,a=t*Math.PI*2*turns;
    pts.push(new THREE.Vector3(Math.cos(a)*.035,(t-.5)*.37,Math.sin(a)*.035));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),80,.004,4,false);
}
function springCore(){
  const group=new THREE.Group(),cols=40,rows=40,rearRows=38;
  const radius=.050,xSpan=W-.82,zSpan=D-.82;
  const pocketGeo=new THREE.CylinderGeometry(radius,radius,.40,10,1,false),springGeo=helix();
  const rearPocketMat=new THREE.MeshStandardMaterial({color:0xe9e5dd,roughness:1});
  const frontPocketMat=new THREE.MeshPhysicalMaterial({color:0xf2eee7,roughness:.96,transparent:true,opacity:.76,depthWrite:false});
  const rearSpringMat=new THREE.MeshStandardMaterial({color:0xb9b8b2,metalness:.35,roughness:.6});
  const frontSpringMat=rearSpringMat.clone();
  const rearCount=cols*rearRows,frontCount=cols*(rows-rearRows);
  const pocketsRear=new THREE.InstancedMesh(pocketGeo,rearPocketMat,rearCount);
  const pocketsFront=new THREE.InstancedMesh(pocketGeo,frontPocketMat,frontCount);
  const springsRear=new THREE.InstancedMesh(springGeo,rearSpringMat,rearCount);
  const springsFront=new THREE.InstancedMesh(springGeo,frontSpringMat,frontCount);
  const dummy=new THREE.Object3D();let ri=0,fi=0;
  for(let z=0;z<rows;z++)for(let x=0;x<cols;x++){
    dummy.position.set(-xSpan/2+x*xSpan/(cols-1),0,-zSpan/2+z*zSpan/(rows-1));dummy.updateMatrix();
    const front=z>=rearRows,index=front?fi++:ri++;
    (front?pocketsFront:pocketsRear).setMatrixAt(index,dummy.matrix);
    (front?springsFront:springsRear).setMatrixAt(index,dummy.matrix);
  }
  for(const mesh of [pocketsRear,pocketsFront,springsRear,springsFront]){
    mesh.instanceMatrix.needsUpdate=true;group.add(mesh);
  }
  const boxMat=new THREE.MeshStandardMaterial({color:0xe6dfd0,roughness:1});
  const back=new THREE.Mesh(new THREE.BoxGeometry(W-.20,.40,.24),boxMat);back.position.z=-D/2+.22;
  const left=new THREE.Mesh(new THREE.BoxGeometry(.24,.40,D-.68),boxMat);left.position.x=-W/2+.22;
  const right=left.clone();right.position.x=W/2-.22;
  const frontL=new THREE.Mesh(new THREE.BoxGeometry(.62,.40,.24),boxMat);frontL.position.set(-W/2+.41,0,D/2-.22);
  const frontR=frontL.clone();frontR.position.x=W/2-.41;
  group.add(back,left,right,frontL,frontR);
  group.userData={pocketsRear,pocketsFront,springsRear,springsFront,boxMat,frontL,frontR};
  return group;
}
export function buildCarolPlusModel({mobile=false}={}){
  const mats=createCarolMaterials(),system=new THREE.Group(),pieces=[];
  const slab=(name,y,h,mat,w=W-.16,d=D-.16)=>{
    const obj=new THREE.Mesh(roundedSlabGeometry(w,d,h,.17,Math.min(.008,h*.1)),mat);
    obj.position.y=y;system.add(obj);pieces.push({name,obj,base:y});return obj;
  };
  slab('bottomCover',-.439,.022,mats.cover);
  slab('liningBottom',-.422,.012,mats.lining);
  slab('polyBottom',-.366,.10,mats.poly);
  slab('feltBottom',-.307,.018,mats.felt);
  const core=springCore();core.position.y=-.098;system.add(core);pieces.push({name:'core',obj:core,base:-.098});
  slab('feltTop',.112,.018,mats.felt);
  slab('polyTop',.171,.10,mats.poly);
  slab('memory',.306,.1667,mats.memory);
  slab('liningTop',.398,.012,mats.lining);
  slab('fiber',.413,.018,mats.fiber);
  const topCover=new THREE.Group();
  topCover.add(new THREE.Mesh(roundedSlabGeometry(W-.04,D-.04,.03,.18,.009),mats.cover));
  topPattern(topCover,W-.04,D-.04,.017,mats,mobile);
  topCover.position.y=.425;system.add(topCover);pieces.push({name:'topCover',obj:topCover,base:.425});

  const lowerShell=new THREE.Group();
  const velvet=frame(W,D,.55,.065,mats.brown);velvet.position.y=-.13;lowerShell.add(velvet);
  const bottomPipe=frame(W,D,.023,.035,mats.pipe);bottomPipe.position.y=-.42;lowerShell.add(bottomPipe);
  ribbon(lowerShell,W,D,.13,mats.tex.ribbon);handles(lowerShell,W,D,-.15);
  system.add(lowerShell);pieces.push({name:'lowerShell',obj:lowerShell,base:0});
  const upperShell=new THREE.Group();
  const breathable=frame(W,D,.29,.065,mats.beige);breathable.position.y=.28;upperShell.add(breathable);
  const topPipe=frame(W,D,.023,.035,mats.pipe);topPipe.position.y=.425;upperShell.add(topPipe);
  system.add(upperShell);pieces.push({name:'upperShell',obj:upperShell,base:0});
  const offsets={topCover:2.35,upperShell:2.00,fiber:1.80,liningTop:1.56,memory:1.27,polyTop:.94,feltTop:.62,core:0,feltBottom:-.40,polyBottom:-.67,liningBottom:-.94,bottomCover:-1.18,lowerShell:-1.43};
  const timings={topCover:[.05,.22],upperShell:[.07,.25],fiber:[.10,.29],liningTop:[.13,.33],memory:[.17,.41],polyTop:[.23,.47],feltTop:[.29,.53],core:[.37,.61],feltBottom:[.49,.69],polyBottom:[.55,.76],liningBottom:[.62,.82],bottomCover:[.68,.88],lowerShell:[.72,.93]};
  return {system,pieces,core,offsets,timings,mats,W,D};
}
