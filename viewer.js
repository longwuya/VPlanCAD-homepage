// Interactive 3D inspection for the result comparisons.
//
// Every tile shows a still until the pointer touches it; there is no button. The
// first pointer contact moves the single shared WebGL canvas into that tile and
// hands over orbit controls, so the model can be dragged immediately. Geometry is
// parsed up front (OBJLoader.parse needs no GPU), which keeps activation
// synchronous enough for the first touch drag to work. Double-click returns to the
// default view.
//
// One WebGL context exists for the whole page: raising a context per tile hits the
// browser's context budget and drops the oldest ones.
//
// Framing comes from the model's bounding sphere and the smaller of the two view
// angles, so the model stays inside the canvas at every rotation angle. A failure
// keeps the still visible and reports through a status line.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const SURFACE = 0xeef0f4;
const DIRECTION = new THREE.Vector3(0.6, 0.5, 0.75).normalize();
const MARGIN = 1.03;

const loader = new OBJLoader();
const parsed = new Map();

let stage = null;
let active = null;
let token = 0;

function createStage() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(SURFACE, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 200);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x6f7787, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.3);
  key.position.set(5, 8, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.85);
  fill.position.set(-6, 3, -5);
  scene.add(fill);

  const material = new THREE.MeshStandardMaterial({
    color: 0xb2bac6,
    metalness: 0.06,
    roughness: 0.55
  });

  const canvas = renderer.domElement;
  canvas.className = 'viewer-canvas';

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = false;
  controls.rotateSpeed = 0.9;
  controls.addEventListener('change', () => {
    if (active) draw();
  });

  stage = { renderer, canvas, scene, camera, controls, material, model: null, radius: 1, observer: null };
  return stage;
}

// Distance at which a sphere of `radius` fits inside both view angles.
function fit() {
  if (!stage || !active) return;
  const { camera, radius } = stage;
  const width = active.clientWidth;
  const height = active.clientHeight;
  if (!width || !height) return;

  const aspect = width / height;
  const vFov = (camera.fov * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const distance = (radius / Math.sin(Math.min(vFov, hFov) / 2)) * MARGIN;

  camera.aspect = aspect;
  camera.position.copy(DIRECTION).multiplyScalar(distance);
  camera.near = Math.max(distance - radius * 1.8, radius * 0.02);
  camera.far = distance + radius * 4;
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();

  stage.controls.target.set(0, 0, 0);
  stage.controls.update();
}

function draw() {
  if (!stage || !active) return;
  const { renderer, scene, camera } = stage;
  const width = active.clientWidth;
  const height = active.clientHeight;
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  renderer.render(scene, camera);
}

function setStatus(tile, text) {
  let node = tile.querySelector('.viewer-status');
  if (!text) {
    if (node) node.remove();
    return;
  }
  if (!node) {
    node = document.createElement('p');
    node.className = 'viewer-status';
    node.setAttribute('role', 'status');
    node.setAttribute('aria-live', 'polite');
    tile.appendChild(node);
  }
  node.textContent = text;
}

function deactivate({ keep = false } = {}) {
  if (!stage || !active) {
    active = null;
    return;
  }
  const tile = active;
  if (stage.model) {
    stage.scene.remove(stage.model);
    stage.model = null;
  }
  if (stage.observer) {
    stage.observer.disconnect();
    stage.observer = null;
  }
  if (!keep) {
    stage.canvas.remove();
    tile.querySelector('.viewer-hint')?.remove();
    setStatus(tile, '');
    tile.classList.remove('is-live');
    active = null;
  }
}

function parseModel(url) {
  if (!parsed.has(url)) {
    const promise = fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        return response.text();
      })
      .then(text => {
        const object = loader.parse(text);
        object.traverse(child => {
          if (child.isMesh) child.material = stage.material;
        });
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);
        return { object, radius: size.length() / 2 || 1 };
      });
    // A failed request must not be cached, otherwise retrying is hopeless.
    promise.catch(() => parsed.delete(url));
    parsed.set(url, promise);
  }
  return parsed.get(url);
}

function forwardPointerDown(tile, event) {
  // A touch drag presses on the still before the canvas exists, so replay that
  // press on the canvas: OrbitControls then follows the rest of the gesture.
  if (event.pointerType === 'mouse' || !stage) return;
  try {
    stage.canvas.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      isPrimary: event.isPrimary,
      clientX: event.clientX,
      clientY: event.clientY,
      button: 0,
      buttons: 1
    }));
  } catch (error) {
    // A browser that refuses the synthetic press simply needs a second drag.
  }
}

async function activate(tile, event) {
  const url = tile.dataset.obj;
  if (!url || active === tile) return;

  if (active) deactivate();
  const mine = ++token;

  if (!stage) {
    try {
      createStage();
    } catch (error) {
      setStatus(tile, '3D preview is not available in this browser; the still image stays.');
      return;
    }
  }

  active = tile;
  tile.classList.add('is-live');
  tile.appendChild(stage.canvas);

  if (!tile.querySelector('.viewer-hint')) {
    const hint = document.createElement('span');
    hint.className = 'viewer-hint';
    hint.textContent = 'Drag to rotate · double-click to reset';
    tile.appendChild(hint);
  }

  if (event) forwardPointerDown(tile, event);

  let model;
  try {
    model = await parseModel(url);
  } catch (error) {
    if (active !== tile || mine !== token) return;
    deactivate();
    setStatus(tile, 'This model could not be loaded. Move the pointer away and back to retry.');
    return;
  }
  if (active !== tile || mine !== token) return;

  stage.scene.add(model.object);
  stage.model = model.object;
  stage.radius = model.radius;
  setStatus(tile, '');
  fit();
  draw();

  if ('ResizeObserver' in window) {
    stage.observer = new ResizeObserver(() => {
      if (active !== tile) return;
      fit();
      draw();
    });
    stage.observer.observe(tile);
  }
}

const tiles = [...document.querySelectorAll('.obj-viewer')];

tiles.forEach(tile => {
  tile.addEventListener('pointerenter', event => {
    tile.classList.add('is-hovered');
    if (event.pointerType === 'mouse') activate(tile, event);
  });
  tile.addEventListener('pointerleave', () => {
    tile.classList.remove('is-hovered');
  });
  tile.addEventListener('pointerdown', event => activate(tile, event));
  tile.addEventListener('dblclick', event => {
    if (active !== tile) return;
    event.preventDefault();
    fit();
    draw();
  });
});

// Parse the meshes in the background so the first touch does not wait on the network.
const warm = () => {
  const idle = window.requestIdleCallback ?? (fn => setTimeout(fn, 800));
  idle(() => tiles.forEach(tile => {
    if (tile.dataset.obj) parseModel(tile.dataset.obj).catch(() => {});
  }));
};
warm();
