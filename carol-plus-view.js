import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

// Fit the real mesh bounds to the available canvas, including the exploded
// endpoints. This works at any aspect ratio without hard-coded mobile zoom.
export function fitCarolCamera(camera,object,direction,padding=1.12){
  object.updateWorldMatrix(true,true);
  const box=new THREE.Box3().setFromObject(object),center=box.getCenter(new THREE.Vector3());
  const axis=direction.clone().normalize();
  camera.position.copy(center).add(axis);camera.lookAt(center);camera.updateMatrixWorld();
  const inverse=camera.quaternion.clone().invert(),tanV=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),tanH=tanV*camera.aspect;
  let distance=0;
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
    const p=new THREE.Vector3(x,y,z).sub(center).applyQuaternion(inverse);
    distance=Math.max(distance,Math.abs(p.x)*padding/tanH+p.z,Math.abs(p.y)*padding/tanV+p.z);
  }
  camera.position.copy(center).addScaledVector(axis,distance);
  camera.lookAt(center);camera.updateMatrixWorld();
}
