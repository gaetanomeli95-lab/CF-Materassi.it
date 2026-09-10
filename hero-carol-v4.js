import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { buildCarolPlusModel } from './carol-plus-model-v3.js';

const canvas = document.querySelector('#hero-carol-webgl');
if (canvas) {
  const mobile = matchMedia('(max-width:700px)').matches;
  const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const DPR = Math.min(devicePixelRatio || 1, mobile ? 1.15 : 1.55);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !mobile,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(DPR);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070707, .032);

  const camera = new THREE.PerspectiveCamera(mobile ? 47 : 33, 1, .1, 60);
  camera.position.set(mobile ? 5.3 : 8.2, mobile ? 4.3 : 4.9, mobile ? 11.8 : 12.6);

  // Warm studio lighting so the cream top, beige breathable band and brown velvet
  // read as materials instead of a white silhouette.
  scene.add(new THREE.HemisphereLight(0xfff6e9, 0x11100f, 2.05));
  const key = new THREE.DirectionalLight(0xfff1db, 7.2);
  key.position.set(-5.5, 9.5, 7.5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd3b58c, 4.1);
  fill.position.set(7, 3.5, 5);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 2.8);
  rim.position.set(-4, 4, -6);
  scene.add(rim);
  const sideWarm = new THREE.PointLight(0xb57c49, 22, 13, 2);
  sideWarm.position.set(5.5, -.4, 4.8);
  scene.add(sideWarm);

  const { system } = buildCarolPlusModel({ mobile });
  system.position.set(mobile ? .55 : 2.25, mobile ? -.45 : -.55, 0);
  system.rotation.set(-.11, mobile ? -.28 : -.48, -.015);
  system.scale.setScalar(mobile ? .73 : 1.04);
  scene.add(system);

  // Subtle premium scene framing. No photo layer behind the product.
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xc4a36e, transparent: true, opacity: .15 });
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(4.5, .018, 8, 180), ringMat);
  ringA.rotation.x = Math.PI / 2.25;
  ringA.position.set(system.position.x, -1.35, -.3);
  scene.add(ringA);
  const ringB = ringA.clone();
  ringB.material = ringMat.clone();
  ringB.material.opacity = .07;
  ringB.scale.setScalar(1.4);
  scene.add(ringB);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.MeshPhysicalMaterial({ color: 0x070707, roughness: .96, transparent: true, opacity: .62 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.25;
  scene.add(floor);

  const pointer = { x: 0, y: 0 };
  const smooth = { x: 0, y: 0 };
  addEventListener('pointermove', e => {
    pointer.x = (e.clientX / innerWidth - .5) * 2;
    pointer.y = (e.clientY / innerHeight - .5) * 2;
  }, { passive: true });

  function resize() {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const clock = new THREE.Clock();
  function frame() {
    const t = clock.getElapsedTime();
    smooth.x += (pointer.x - smooth.x) * .035;
    smooth.y += (pointer.y - smooth.y) * .035;
    const scroll = Math.min(1, scrollY / Math.max(1, innerHeight));

    if (!reducedMotion) {
      system.position.y = (mobile ? -.45 : -.55) + Math.sin(t * .75) * .055 - scroll * .16;
      system.rotation.y = (mobile ? -.28 : -.48) + smooth.x * .055 + scroll * .10;
      system.rotation.x = -.11 - smooth.y * .025;
      ringA.rotation.z = t * .018;
      ringB.rotation.z = -t * .010;
    }

    camera.position.x = (mobile ? 5.3 : 8.2) + smooth.x * .11;
    camera.position.y = (mobile ? 4.3 : 4.9) - smooth.y * .08;
    camera.lookAt(system.position.x, -.12, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  frame();
}
