import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {roundedSlabGeometry,createCarolMaterials,frame,ribbon,handles,topPattern} from './carol-plus-materials-v3.js';

function helix(){
  const pts=[],turns=5.05,seg=28,r=.034,h=.74;
  for(let i=0;i<=seg;i++){const t=i/seg,a=t*Math.PI*2*turns;pts.push(new THREE.Vector3(Math.cos(a)*r,(t-.5)*h,Math.sin(a)*r));}
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),34,.006,4,false);
}

function springCore(){
  const group=new THREE.Group(),cols=40,rows=40,total=1600;
  const pocketGeo=new THREE.CylinderGeometry(.064,.064,.80,12,1,true),springGeo=helix();
  const rearPocketMat=new THREE.MeshPhysicalMaterial({color:0xf4f1eb,roughness:.98,transparent:true,opacity:.50,side:THREE.DoubleSide,vertexColors:true,depthWrite:false});
  const frontPocketMat=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.97,transparent:true,opacity:.24,side:THREE.DoubleSide,vertexColors:true,depthWrite:false});
  const rearSpringMat=new THREE.MeshPhysicalMaterial({color:0xc9c4bb,metalness:.76,roughness:.23,vertexColors:true});
  const frontSpringMat=rearSpringMat.clone();frontSpringMat.color.set(0xf0ece4);frontSpringMat.emissive.set(0x261c14);frontSpringMat.emissiveIntensity=.22;
  const rearRows=28,rearCount=cols*rearRows,frontCount=total-rearCount;
  const pocketsRear=new THREE.InstancedMesh(pocketGeo,rearPocketMat,rearCount),pocketsFront=new THREE.InstancedMesh(pocketGeo,frontPocketMat,frontCount);
  const springsRear=new THREE.InstancedMesh(springGeo,rearSpringMat,rearCount),springsFront=new THREE.InstancedMesh(springGeo,frontSpringMat,frontCount);
  const dummy=new THREE.Object3D(),xSpan=5.04,zSpan=2.58;let ri=0,fi=0;
  const zoneScale=[.94,.97,1.00,1.08,1.00,.97,.94],palette=[0x857b70,0x978b7b,0xad9b82,0xc6ae85,0xad9b82,0x978b7b,0x857b70];
  for(let z=0;z<rows;z++)for(let x=0;x<cols;x++){
    const px=-xSpan/2+x*xSpan/(cols-1),pz=-zSpan/2+z*zSpan/(rows-1),zone=Math.min(6,Math.floor(x/cols*7));
    dummy.position.set(px,0,pz);dummy.scale.set(1,zoneScale[zone],1);dummy.updateMatrix();
    const c=new THREE.Color(palette[zone]);
    if(z<rearRows){
      pocketsRear.setMatrixAt(ri,dummy.matrix);springsRear.setMatrixAt(ri,dummy.matrix);
      pocketsRear.setColorAt(ri,c.clone().lerp(new THREE.Color(0xffffff),.76));springsRear.setColorAt(ri,c.clone().lerp(new THREE.Color(0xe7e2da),.28));ri++;
    }else{
      pocketsFront.setMatrixAt(fi,dummy.matrix);springsFront.setMatrixAt(fi,dummy.matrix);
      pocketsFront.setColorAt(fi,c.clone().lerp(new THREE.Color(0xffffff),.84));springsFront.setColorAt(fi,c.clone().lerp(new THREE.Color(0xffffff),.40));fi++;
    }
  }
  [pocketsRear,pocketsFront,springsRear,springsFront].forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;group.add(m);});

  const boxMat=new THREE.MeshPhysicalMaterial({color:0xf0ede7,roughness:.83});
  const back=new THREE.Mesh(new THREE.BoxGeometry(5.72,.80,.32),boxMat);back.position.z=-1.48;group.add(back);
  const left=new THREE.Mesh(new THREE.BoxGeometry(.32,.80,2.64),boxMat);left.position.x=-2.70;group.add(left);
  const right=new THREE.Mesh(new THREE.BoxGeometry(.32,.80,2.64),boxMat);right.position.x=2.70;group.add(right);
  const frontL=new THREE.Mesh(new THREE.BoxGeometry(.80,.80,.34),boxMat);frontL.position.set(-2.30,0,1.47);group.add(frontL);
  const frontR=frontL.clone();frontR.position.x=2.30;group.add(frontR);
  group.userData={pocketsRear,pocketsFront,springsRear,springsFront,boxMat,frontL,frontR};
  return group;
}

export function buildCarolPlusModel({mobile=false}={}){
  const mats=createCarolMaterials(),system=new THREE.Group(),pieces=[],W=6,D=3.55;
  const slab=(name,y,h,material,w=W,d=D)=>{const o=new THREE.Mesh(roundedSlabGeometry(w,d,h,.22,Math.min(.03,h*.20)),material);o.position.y=y;system.add(o);pieces.push({name,obj:o,base:y});return o;};

  const bottomCover=slab('bottomCover',-.93,.08,mats.cover,5.92,3.47);
  const liningBottom=slab('liningBottom',-.85,.035,mats.lining,5.86,3.41);
  const polyBottom=slab('polyBottom',-.70,.22,mats.poly,5.80,3.35);
  const feltBottom=slab('feltBottom',-.53,.055,mats.felt,5.82,3.37);

  const core=springCore();core.position.y=-.08;system.add(core);pieces.push({name:'core',obj:core,base:-.08});

  const feltTop=slab('feltTop',.39,.055,mats.felt,5.84,3.39);
  const polyTop=slab('polyTop',.56,.22,mats.poly,5.80,3.35);
  const memory=slab('memory',.86,.34,mats.memory,5.82,3.37);
  const liningTop=slab('liningTop',1.08,.035,mats.lining,5.88,3.43);
  const fiber=slab('fiber',1.17,.11,mats.fiber,5.90,3.45);

  const topCover=new THREE.Group();
  const coverBase=new THREE.Mesh(roundedSlabGeometry(5.96,3.50,.22,.25,.04),mats.cover);topCover.add(coverBase);
  topPattern(topCover,5.82,3.36,.132,mats,mobile);topCover.position.y=1.34;system.add(topCover);pieces.push({name:'topCover',obj:topCover,base:1.34});

  const lowerShell=new THREE.Group();
  const lowerVelvet=frame(W,D,.66,.09,mats.brown);lowerVelvet.position.y=-.52;lowerShell.add(lowerVelvet);
  const bottomPipe=frame(W,D,.045,.055,mats.pipe);bottomPipe.position.y=-.88;lowerShell.add(bottomPipe);
  ribbon(lowerShell,W,D,-.18,mats.tex.ribbon);handles(lowerShell,W,D,-.49);system.add(lowerShell);pieces.push({name:'lowerShell',obj:lowerShell,base:0});

  const upperShell=new THREE.Group();
  const breathable=frame(W,D,.52,.09,mats.beige);breathable.position.y=.92;upperShell.add(breathable);
  const topPipe=frame(W,D,.045,.055,mats.pipe);topPipe.position.y=1.23;upperShell.add(topPipe);system.add(upperShell);pieces.push({name:'upperShell',obj:upperShell,base:0});

  const offsets={topCover:3.05,upperShell:2.72,fiber:2.46,liningTop:2.12,memory:1.82,polyTop:1.34,feltTop:.98,core:.05,feltBottom:-.54,polyBottom:-.84,liningBottom:-1.08,bottomCover:-1.35,lowerShell:-1.10};
  const timings={topCover:[.05,.22],upperShell:[.07,.25],fiber:[.10,.29],liningTop:[.13,.33],memory:[.17,.41],polyTop:[.23,.47],feltTop:[.29,.53],core:[.37,.61],feltBottom:[.49,.69],polyBottom:[.55,.76],liningBottom:[.62,.82],bottomCover:[.68,.88],lowerShell:[.72,.93]};

  return {system,pieces,core,offsets,timings,mats,W,D};
}
