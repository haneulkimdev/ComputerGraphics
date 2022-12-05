import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const render_w = 640;
const render_h = 480;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(render_w, render_h);
renderer.setViewport(0, 0, render_w, render_h);

const container = document.getElementById("myContainer");

container.appendChild(renderer.domElement);

// camera setting
const camera = new THREE.PerspectiveCamera(45, render_w / render_h, 1, 500);
camera.position.set(0, 0, -100);
camera.up.set(0, 1, 0);
camera.lookAt(0, 0, 50);

const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

// geometry setting
const points = [];
const points2 = [];

points.push(10, 10, 0);
points.push(-10, 10, 0);
points.push(-10, -10, 0);
points.push(10, -10, 0);

points2.push(0, 0, 0);
points2.push(10, 0, 0);
points2.push(0, 10, 0);
points2.push(0, 0, 10);

const pointsArray = new Float32Array(points2);

let planeGeometry = new THREE.BufferGeometry();
// const geometry = new THREE.BufferGeometry().setFromPoints(points);
planeGeometry.setAttribute("position", new THREE.BufferAttribute(pointsArray, 3));

const tris = [];
const tris2 = [];

tris.push(0, 1, 3);
tris.push(1, 2, 3);

tris2.push(3, 0, 1);
tris2.push(2, 0, 3);
tris2.push(2, 1, 0);
tris2.push(2, 3, 1);

planeGeometry.setIndex(tris2);

// material setting
const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide, wireframe: true });

// mesh model
const myModel = new THREE.Mesh(planeGeometry, material);

// create my world (scene)
const myScene = new THREE.Scene();

myScene.add(myModel);

////////////////////
const childMesh = new THREE.Mesh(
  new THREE.SphereGeometry(5, 16, 8),
  new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
);
myScene.add(childMesh);
myModel.add(childMesh);
myScene.add(childMesh);

// renderer.render(myScene, camera);
animate();
function animate() {
  requestAnimationFrame(animate);
  renderer.render(myScene, camera);
}

// register event-callback functions into renderer's dom
renderer.domElement.style = "touch-action:none";
renderer.domElement.onpointerdown = mouseDownHandler;
renderer.domElement.onpointermove = mouseMoveHandler;
renderer.domElement.onpointerup = mouseUpHandler;
renderer.domElement.onpointercancel = mouseUpHandler;
renderer.domElement.onpointerout = mouseUpHandler;
renderer.domElement.onpointerleave = mouseUpHandler;

function compute_pos_ss2ws(x_ss, y_ss) {
  return new THREE.Vector3((x_ss / render_w) * 2 - 1, (-y_ss / render_h) * 2 + 1, -1).unproject(camera);
}

let mouse_btn_flag = false;
function mouseDownHandler(e) {
  // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
  if (e.pointerType == "mouse") {
    mouse_btn_flag = true;

    // to do //
    myModel.position.set(10, 0, 0);
    myModel.scale.set(2, 2, 2);
    // myModel.quaternion;
    // myModel.setRotationFromQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4));
    myModel.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);

    const matLocal = new THREE.Matrix4();
    const matT = new THREE.Matrix4().makeTranslation(10, 0, 0);
    const matS = new THREE.Matrix4().makeScale(2, 2, 2);
    const matR = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), Math.PI / 4);
    matLocal.premultiply(matT);
    matLocal.premultiply(matS);
    // matLocal.premultiply(matR);
    myModel.matrix = matLocal.clone();
    myModel.matrixAutoUpdate = false;

    mouseMoveHandler(e);
  } else if (e.pointerType == "touch") {
    evCache.push(e);
    console.log("pointerDown", e);
  }
}

var evCache = new Array();
var prevDiff = -1;
function remove_event(ev) {
  // Remove this event from the target's cache
  for (var i = 0; i < evCache.length; i++) {
    if (evCache[i].pointerId == ev.pointerId) {
      evCache.splice(i, 1);
      break;
    }
  }
}

function mouseUpHandler(e) {
  mouse_btn_flag = false;
  console.log("Mouse Up");
  if (e.pointerType != "touch") return;
  // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttonlog(ev.type, ev);
  // Remove this pointer from the cache and reset the target's
  // background and border
  remove_event(e);
  // If the number of pointers down is less than two then reset diff tracker
  if (evCache.length < 2) {
    prevDiff = -1;
  }
}

let x_prev = render_w / 2;
let y_prev = render_h / 2;
function mouseMoveHandler(e) {
  if (e.pointerType == "mouse") {
    if (mouse_btn_flag) {
      let posNp = compute_pos_ss2ws(e.clientX, e.clientY);
      // to do //
      console.log("Mouse Pos:", e.clientX, e.clientY);
      console.log("Mouse Pos:", posNp);

      x_prev = e.clientX;
      y_prev = e.clientY;
    }
  } else if (e.pointerType == "touch") {
    console.log("pointerMove", e);
    // e.target.style.border = "dashed";

    // Find this event in the cache and update its record with this event
    for (var i = 0; i < evCache.length; i++) {
      if (e.pointerId == evCache[i].pointerId) {
        evCache[i] = e;
        break;
      }
    }

    if (evCache.length == 1) {
      // to do //
      let posNp = compute_pos_ss2ws(e.clientX, e.clientY);
      console.log("Mouse Pos:", posNp);

      x_prev = e.clientX;
      y_prev = e.clientY;
    }
    // If two pointers are down, check for pinch gestures
    else if (evCache.length == 2) {
      console.log("Pinch moving");
      // Calculate the distance between the two pointers
      var curDiff = Math.abs(evCache[0].clientX - evCache[1].clientX);

      if (prevDiff > 0) {
        if (curDiff > prevDiff) {
          // The distance between the two pointers has increased
          console.log("Pinch moving OUT -> Zoom in", e);
          camera.near += 2.0;
          camera.near = Math.min(camera_ar.near, camera_ar.far);
          camera.updateProjectionMatrix();
        }
        if (curDiff < prevDiff) {
          // The distance between the two pointers has decreased
          console.log("Pinch moving IN -> Zoom out", e);
          camera.near -= 2.0;
          camera.near = Math.max(camera_ar.near, 1.0);
          camera.updateProjectionMatrix();
        }
      }

      // Cache the distance for the next move event
      prevDiff = curDiff;
    }
    e.preventDefault();
  }
}
