import * as THREE from 'three';
import { OrbitControls } from 'three-ext/OrbitControls.js';
import { camDis, carportPos, getCSize, groundDis, modelInfo } from './value.js';
import { getMainModel, loadCarModel, loadLoungerModel, loadFBXModel } from './loadModel.js';
import { updateModel } from './updateModel.js';
import { updateCarModel, updateLoungerModel } from './updateSubmodel.js';

const container = document.getElementById('container');
let camera, scene, renderer, controls;
let lightMain, lightSub, lightAmbient;
let totalGroup, model, mainModel, houseModel, pergolaFloor;

init();
animate();
loadFBXModel("/model/filter-2-cartain.FBX", totalGroup);
loadCarModel("/model/car-export.FBX", totalGroup);
loadLoungerModel("/model/lounger-export.FBX", totalGroup);

function init() {
	const cSize = getCSize();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	// renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( cSize.width, cSize.height );
	renderer.setAnimationLoop( animate );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setClearColor(0x002244, 0.1);
	renderer.sortObjects = true;

	container.appendChild( renderer.domElement );

	camera = new THREE.PerspectiveCamera( 60, cSize.width / cSize.height, 0.1, groundDis);
	camera.position.set(0, camDis/1.5, camDis*2);

	scene = new THREE.Scene();
	totalGroup = new THREE.Group();
	totalGroup.position.y = camDis / -5;
	totalGroup.scale.set(0.5, 0.5, 0.5);

	scene.add(totalGroup);

	controls = new OrbitControls( camera, renderer.domElement );
	controls.maxDistance = camDis * 4;
	controls.minDistance = camDis * 1;
	controls.maxPolarAngle = Math.PI/2;
	controls.minAzimuthAngle = -Math.PI / 2 + 0.2;
	controls.maxAzimuthAngle = Math.PI / 2 - 0.2;
	controls.enablePan = false;

	// Enable smooth damping
	controls.enableDamping = true;
	controls.dampingFactor = 0.08; // Adjust this value: lower = smoother stop
	// controls.rotateSpeed = 1.0;
	// controls.zoomSpeed = 1.2;
	// controls.panSpeed = 0.8;

	lightAmbient = new THREE.AmbientLight( 0xFFFFFF, 0.8 );
	lightMain = new THREE.DirectionalLight( 0xffffff, 2.0 );
	lightSub = new THREE.DirectionalLight( 0xffffff, 2.0 );
	// lightMain.castShadow = true;
	lightMain.position.set(1, 1, 1);
	lightSub.position.set(-1, 1, 1);
	scene.add( lightAmbient, lightMain, lightSub );

	window.addEventListener( 'resize', onWindowResize );
	mainModel = getMainModel();
	totalGroup.add(mainModel);
}

function setOrbitLimit(limit, opDir = 1) {
	setGSAPAnimate(camera, "position", 1, { x: 0, y: camDis / 1.5, z: camDis * 2 * opDir });
	setTimeout(() => {
		controls.minAzimuthAngle = limit ? -Math.PI / 2 + 0.2 : -Infinity;
		controls.maxAzimuthAngle = limit ? Math.PI / 2 - 0.2 : Infinity;
	}, 1000);
}

export function changeModel(model) {
	houseModel = getHouseModel(houseModel, totalGroup);
	setOrbitLimit(model==="car" || model==="patio");
	if (houseModel) {
		var targetX = model === "car" ? carportPos.x : -1.5,
			targetZ = model === "car" ? carportPos.z : 0.1,
			targetRot = model === "car" ? carportPos.rot : 0;
		if (model === "pergola") targetZ = 50;
		// if (model === "patio") targetX = -1.5;
		setGSAPAnimate(houseModel, "position", 1, { x: targetX, y: 0, z: targetZ });
		setGSAPAnimate(houseModel, "rotation", 1, { x: 0, y: targetRot * Math.PI, z: 0 });
	}
	setTimeout(() => {
		if (houseModel) {
			houseModel.children.forEach(child => {
				if (child.name === "pool-frame" || child.name === "pergola-floor") {
					child.visible = model === "pergola";
				} else if (child.name === "house") {
					child.visible = model !== "pergola";
				} else if (child.name.includes("concrete")) {
					child.visible = model !== "pergola";
				}
			});
		}
	}, model==="pergola"?0:1000);
	modelInfo.type = model;
	if (modelInfo.type == "Pergola" && modelInfo.install == "attached") {
		changeInstall("free");
	} else if (modelInfo.type === "patio") {
		modelInfo.back = "none";
	}
	const roofShelter = document.getElementById("roofShelter");
	modelInfo.roofShelter = false;
	roofShelter.checked = false;
	roofShelter.disabled = model==="car";
	changeRoofShelter("", false);

	updateCarModel(totalGroup, modelInfo);
	const loungerArr = totalGroup.children.filter(child => child.name.includes("loungerModel"));
	updateLoungerModel(loungerArr, modelInfo);
	if (model === "car") {
		modelInfo.install = "attached";
		modelInfo.left = "none";
		modelInfo.back = "none";
		modelInfo.width = 250;
		modelInfo.length = 150;
		const inputWidthEl = document.getElementById("inputWidth");
		const inputDepthEl = document.getElementById("inputDepth");
		const valueWidthEl = document.getElementById("valueWidth");
		const valueDepthEl = document.getElementById("valueDepth");
		if (inputWidthEl) inputWidthEl.value = 250;
		if (inputDepthEl) inputDepthEl.value = 150;
		if (valueWidthEl) valueWidthEl.innerText = 250;
		if (valueDepthEl) valueDepthEl.innerText = 150;
	}
	updateModel(mainModel, houseModel, modelInfo);
}

export function changeInstall(install) {
	modelInfo.install = install;
	houseModel = getHouseModel(houseModel, totalGroup);
	if (modelInfo.type === "patio") {
		setGSAPAnimate(houseModel, "position", 1, { x: 0, y: 0, z: install==="free"?-0.3:0.1 });
	} else if (modelInfo.type === 'car') {
		const rot = install==="free"?0:carportPos.rot * Math.PI;
		const posX = install==="attached"?carportPos.x:-32;
		const posZ = install==="attached"?carportPos.z:7.2;
		const posY = install==="attached"?0:0.4;
		modelInfo.length = install==="free"?177:150;
		modelInfo.left = install === "attached"?"none":modelInfo.right;
		setGSAPAnimate(houseModel, "position", 1, { x:posX, y: posY, z: posZ });
		setGSAPAnimate(houseModel, "rotation", 1, { x:0, y: rot, z: 0 });
		setOrbitLimit(install!=="free", install==="free"?-1:1);
	}
	
	// setGSAPAnimate(camera, "position", 1, { x: 0, y: camDis / 1.5, z: camDis * 2 });
	// setTimeout(() => {
		// const controlDir = (install==="free")?0.5:-1;
		// controls.minAzimuthAngle = -Math.PI / 2 - 0.2 * controlDir;
		// controls.maxAzimuthAngle = Math.PI / 2 + 0.2 * controlDir;
	// }, 1000);
	updateModel(mainModel, houseModel, modelInfo);
	updateCarModel(totalGroup, modelInfo);
}

export function changeDimension(key, value) {
	houseModel = getHouseModel(houseModel, totalGroup);
	modelInfo[key] = value;
	if (modelInfo.type === "pergola") {
		const loungerArr = totalGroup.children.filter(child => child.name.includes("loungerModel"));
		updateLoungerModel(loungerArr, modelInfo);
	}
	updateModel(mainModel, houseModel, modelInfo);
	updateCarModel(totalGroup, modelInfo);
}

export function changeColor(colorHex) {
	houseModel = getHouseModel(houseModel, totalGroup);
	modelInfo.colorHex = colorHex;
	updateModel(mainModel, houseModel, modelInfo);
}

export function changeRoofPanel(thickness, material) {
	houseModel = getHouseModel(houseModel, totalGroup);
	modelInfo.roofThick = thickness;
	modelInfo.roofMat = material;
	updateModel(mainModel, houseModel, modelInfo);
}

export function changeRoofShelter(type, isChecked) {
	const shelter = mainModel.children.find(child => child.objType === "shelter");
	if (shelter) {
		shelter.visible = isChecked;
	}
}

export function changeWedge(type, isChecked) {
	houseModel = getHouseModel(houseModel, totalGroup);
	modelInfo.wedge = isChecked;
	updateModel(mainModel, houseModel, modelInfo);
}

export function changeSidePanel(side, matStr) {
	houseModel = getHouseModel(houseModel, totalGroup);
	if (modelInfo.type==="car" && modelInfo.install === "free" && side === 'right') {
		modelInfo.left = matStr;
		modelInfo.right = matStr;
	} else {
		modelInfo[side] = matStr;
	}
	updateModel(mainModel, houseModel, modelInfo);
}

function onWindowResize() {
	const cSize = getCSize(0);
	containerWrapper.style.left = cSize.left + "px";
	containerWrapper.style.top = cSize.top + "px";

	camera.aspect = cSize.width / cSize.height;
	camera.updateProjectionMatrix();

	renderer.setSize( cSize.width, cSize.height );
}

function animate() {
	controls.update();
	
	renderer.render( scene, camera );
	if (model) model.rotation.y += 0.001;
}

function getHouseModel(houseModel, totalGroup) {
	if (!houseModel) {
		houseModel = totalGroup.children.find(child => child.name === "houseModel");
	}
	return houseModel;
}

export function animateModelEntrance() {
	houseModel = getHouseModel(houseModel, totalGroup);
	pergolaFloor = houseModel.children.find(child => child.name === "pergola-floor");
	updateModel(mainModel, houseModel, modelInfo);
	setGSAPAnimate(totalGroup, "scale", 1.5, { x: 1, y: 1, z: 1 });
	console.log(houseModel);
}

// Function to animate model color changes
export function animateColorChange(model, newColor) {
	if (!model) return;
	
	model.traverse((child) => {
		if (child.isMesh && child.material) {
			const currentColor = child.material.color;
			const targetColor = new THREE.Color(newColor);
			
			gsap.to(currentColor, {
				duration: 1,
				r: targetColor.r,
				g: targetColor.g,
				b: targetColor.b,
				ease: "power2.inOut"
			});
		}
	});
}

function setGSAPAnimate(object, type, duration, target) {
	var targetObject;
	if (type === "position") targetObject = object.position;
	else if (type === "rotation") targetObject = object.rotation;
	else if (type === "scale") targetObject = object.scale;
	gsap.to(targetObject, {
		duration: duration,
		x: target.x,
		y: target.y,
		z: target.z,
		ease: "power2.inOut"
	});
}

