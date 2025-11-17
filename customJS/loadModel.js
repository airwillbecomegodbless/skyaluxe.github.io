import * as THREE from 'three';
import { FBXLoader } from 'three-ext/FBXLoader.js';
import { camDis, modelInfo, shelterDis, shelterThick } from './value.js';
import { animateModelEntrance } from './main.js';

const loader = new THREE.CubeTextureLoader();
loader.setPath( './image/' );

export const envMap = loader.load( [
	'../images/configurator/posx.jpg', '../images/configurator/negx.jpg',
	'../images/configurator/posy.jpg', '../images/configurator/negy.jpg',
	'../images/configurator/posz.jpg', '../images/configurator/negz.jpg'
] );
export const envMap0 = loader.load( [
	'../images/configurator/posx-re.jpg', '../images/configurator/negx-re.jpg',
	'../images/configurator/posy-re.jpg', '../images/configurator/negy-re.jpg',
	'../images/configurator/posz-re.jpg', '../images/configurator/negz-re.jpg'
] );

export function loadFBXModel(url, totalGroup) { // , onLoad
	const fbxLoader = new FBXLoader();
	fbxLoader.load( url, function (object) {
		var vBox = new THREE.Box3().setFromObject(object);
		var vSize = vBox.getSize(new THREE.Vector3());
		object.traverse(child => {
			if (child instanceof THREE.Mesh) {
				child.material.side = 2;
				if (child.name.includes("wall-front")) {
					child.receiveShadow = true;
				} else if (child.name.includes("window-glass")) {
					child.receiveShadow = true;
					child.material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.5, roughness:0, metalness:1, envMap: envMap });
				} else if (child.name.includes("wall-change")) {
					// child.visible = false;
				} else if (child.name === "water") {
					child.material = new THREE.MeshStandardMaterial({ color: 0x33BFFF, transparent: true, opacity: 0.5, roughness:0.3, metalness:0.7, envMap: envMap });
				}
			}
			if (child.name === "pool-frame") {
				child.children.forEach(subChild => {
					subChild.material.color.setHex(0xDDDDDD);
				});
				child.visible = false;
			}
		});

		var scl = (camDis * 3) / vSize.y;
		object.scale.setScalar(scl); 
		object.name = "houseModel";
		const oldHouse = totalGroup.children.find(child => child.name === "houseModel");
		if (oldHouse) {
			totalGroup.remove(oldHouse);
		}
		totalGroup.add(object);
		// object.rotation.y = Math.PI;
		object.position.set(-1.5, 0, 0.1);
		
		animateModelEntrance();
		loadEnvironment(totalGroup);
	}, xhr => { 
		if (xhr.total > 0) { console.log('Loading progress:', (xhr.loaded / xhr.total * 100) + '%');  }
	}, error => { console.error(error); });
}

export function loadEnvironment(totalGroup) {
	const skyMap = new THREE.TextureLoader().load('./images/configurator/pano-sky.jpg'),
		skyMat = new THREE.MeshBasicMaterial({ map: skyMap, side:2 }),
		skyGeo = new THREE.SphereGeometry(camDis * 15, 60, 40),
		skyMesh = new THREE.Mesh(skyGeo, skyMat);
	// const groundMap = new THREE.TextureLoader().load('./images/configurator/ground.JPG');
	// groundMap.wrapS = groundMap.wrapT = THREE.RepeatWrapping;
	// groundMap.repeat.set(500, 500);
	// const grandGeo = new THREE.PlaneGeometry(camDis * 100, camDis * 100),
	// 	grandMat = new THREE.MeshStandardMaterial({ color: 0xB8B8B8, side:2, map: groundMap }), // concrete-like gray
	// 	grandMesh = new THREE.Mesh(grandGeo, grandMat);
	// grandMesh.rotation.x = Math.PI / 2;
	totalGroup.add(skyMesh); // , grandMesh
}

function getCubeMesh(type) {
	var roughness  = 0.5, metalness = 0.5, transparent = false, opacity = 1, color = 0x332200, envMapTexture = envMap0;
	if (type == "plane") {
		roughness = 0.1;
		metalness = 0.9;
		transparent = true;
		opacity = 0.5;
		color = 0xFFFFFF;
	} else if (type == "pillar" || type == "frame" || type == "inter" || type == "beam") {
		roughness = 0.1;
		metalness = 0.9;
		// envMapTexture = envMap0;
	}

	const geometry = new THREE.BoxGeometry(1, 1, 1);
	const material = new THREE.MeshStandardMaterial({ color, roughness, metalness, transparent, opacity, envMap: envMapTexture });
	return new THREE.Mesh(geometry, material);
}

function getShapeMesh(type, gap, thick) {
	var roughness  = 0.5, metalness = 0.5, transparent = false, opacity = 1, color=0x332200, envMapTexture = envMap0;
	var depth = gap;
	if (type == "plane") {
		roughness = 0.1;
		metalness = 0.9;
		transparent = true;
		opacity = 0.5;
		color = 0xFFFFFF;
	} else if (type == "pillar" || type == "frame" || type == "inter") {
		roughness = 0.1;
		metalness = 0.9;
		// envMapTexture = envMap0;
		depth = thick;
	}
	const shape = new THREE.Shape();

	const extrudeSettings = { steps: 1, depth: depth, bevelEnabled: false };
	const shapeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
	const shapeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness, metalness, transparent, opacity, envMap: envMapTexture });
	const shapeMesh = new THREE.Mesh(shapeGeo, shapeMat);
	shapeMesh.rotation.y = Math.PI / -2;
	return shapeMesh;
}

export function loadCarModel(url, totalGroup) {
	const fbxLoader = new FBXLoader();
	fbxLoader.load( url, function (object) {
		var vBox = new THREE.Box3().setFromObject(object);
		var vSize = vBox.getSize(new THREE.Vector3());
		// console.log(object);
		object.traverse(child => {
			if (child instanceof THREE.Mesh) {
				child.material.side = 2;
				if (child.name.includes("body")) {
					child.material = new THREE.MeshStandardMaterial({ color: 0x88AAFF, roughness: 0.1, metalness: 0.9 });
				} else if (child.name.includes("glass")) {
					child.material = new THREE.MeshStandardMaterial({ color: 0x336688, roughness: 0.1, metalness: 0.9, transparent:true, opacity:0.8 });
				} else if (child.name.includes("other")) {
					child.material = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, roughness: 0.5, metalness: 0.5 });
				}
			}
		});

		const scl = 4 / vSize.y;
		object.scale.setScalar(scl);

		object.name = "carModel";
		object.visible = false;
		totalGroup.add(object);
		object.rotation.y = Math.PI/2;
		object.position.set(0, 0, 4.8);
		for (let i = 0; i < 2; i++) {
			const cloneCar = object.clone();
			cloneCar.name = "cloneCarModel_"+i;
			cloneCar.rotation.y = Math.PI;
			cloneCar.position.set(i===0?4.2:-4.2, 0, 5.5);
			cloneCar.visible = false;
			totalGroup.add(cloneCar);
			console.log(cloneCar);
		}

	}, xhr => { 
		if (xhr.total > 0) {   }
	}, error => { console.error(error); });
}

export function loadLoungerModel(url, totalGroup) {
	const fbxLoader = new FBXLoader();
	fbxLoader.load( url, function (object) {
		var vBox = new THREE.Box3().setFromObject(object);
		var vSize = vBox.getSize(new THREE.Vector3());
		object.traverse(child => {
			if (child instanceof THREE.Mesh) {
				child.material.side = 2;
				if (child.name.includes("main")) {
					child.material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.9, metalness: 0.1 });
				} else if (child.name.includes("frame")) {
					child.material = new THREE.MeshStandardMaterial({ color: 0x336688, roughness: 0.1, metalness: 0.9 });
				} else if (child.name.includes("other")) {
					child.material = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, roughness: 0.5, metalness: 0.5 });
				}
			}
		});

		const scl = 4 / vSize.y;
		object.name = "loungerModel";
		const oldLounger = totalGroup.children.find(child => child.name === "loungerModel");
		if (oldLounger) { totalGroup.remove(oldLounger); }
		for (let i = 0; i < 4; i++) {
			const cloneObj = object.clone();
			cloneObj.scale.set(scl, scl, scl); 
			cloneObj.name = "loungerModel_"+i;
			cloneObj.visible = false;
			totalGroup.add(cloneObj);
		}
		// object.position.set(0, 0, 3.5);

	}, xhr => { 
		if (xhr.total > 0) {   }
	}, error => { console.error(error); });
}

export function getMainModel() {
	const mainGroup = new THREE.Group();
	const {gap, thick} = modelInfo;
	const railRatio = 0.35, centerWR = 1 - railRatio*2, centerH = thick*0.8;

	[-1, 1].forEach(zDir => {
		[-1, 1].forEach(xDir => {
			const pillarMesh = getCubeMesh('pillar');
			pillarMesh.xDir = xDir;
			pillarMesh.zDir = zDir;
			pillarMesh.objType = "pillar";
			mainGroup.add(pillarMesh);
		});
		['x', 'y', 'z'].forEach(axis => {
			if (axis === "y" && zDir === "-1") return;
			var planeMesh;
			if (axis === "x") {
				planeMesh = getShapeMesh('plane', gap, thick);
				planeMesh.material = new THREE.MeshStandardMaterial({color:0xFFFFFF, transparent:true, opacity:0.9, roughness:0, metalness:0});
			} else {
				planeMesh = getCubeMesh('plane');
			}
			planeMesh.objType = "plane";
			planeMesh.dir = zDir;
			planeMesh.axis = axis;
			mainGroup.add(planeMesh);
		});

		['x', 'z'].forEach(axis => {
			var frameMesh;
			if (axis === "x") {
				frameMesh = getShapeMesh('frame', gap, thick);
			} else {
				frameMesh = getCubeMesh('pillar');
			}
			frameMesh.objType = "frame";
			frameMesh.dir = zDir;
			frameMesh.axis = axis;
			mainGroup.add(frameMesh);
		});

		const sideMesh = getCubeMesh('plane');
		sideMesh.objType = "side";
		sideMesh.dir = zDir;
		mainGroup.add(sideMesh);

		const screenBeam = getCubeMesh('beam');
		screenBeam.objType = "screenBeam";
		screenBeam.dir = zDir;
		mainGroup.add(screenBeam);

		const beamMesh = getCubeMesh('beam');
		beamMesh.objType = "beam";
		beamMesh.dir = zDir;
		mainGroup.add(beamMesh);

		const subBeamMesh = getCubeMesh('beam');
		subBeamMesh.objType = "subBeam";
		subBeamMesh.dir = zDir;
		subBeamMesh.visible = false;
		mainGroup.add(subBeamMesh);

		const sideRailGroup = getRailGroup(zDir, "side");
		mainGroup.add(sideRailGroup);

		const frontRailGroup = getRailGroup(zDir, "front");
		mainGroup.add(frontRailGroup);
	});

	function getRailGroup(mainDir, type) {
		const railGroup = new THREE.Group();
		railGroup.objType = type+"_rail";
		railGroup.dir = mainDir;
		[-1, 1].forEach(subDir => {
			const railGeo = new THREE.BoxGeometry(thick*railRatio, thick, 1),
				railMat = new THREE.MeshStandardMaterial({color:0xAAAAAA, envMap: envMap0, roughness:0.1, metalness:0.9}),
				railMesh = new THREE.Mesh(railGeo, railMat);
			railMesh.position.set(subDir * (centerWR + railRatio)/2 * thick, thick / 2, 0);
			railMesh.objType = "pillar";
			railGroup.add(railMesh);
		});
		const centerGeo = new THREE.BoxGeometry(thick* centerWR, centerH, 1),
			centerMat = new THREE.MeshBasicMaterial({color:0xCCCCCC}),
			centerMesh = new THREE.Mesh(centerGeo, centerMat);
		centerMesh.position.set(0, centerH / 2, 0);
		railGroup.add(centerMesh);
		return railGroup;		
	}
	["top", "front", "back", "left", "right"].forEach(dir => {
		for (let i = 0; i <= 10; i++) {
			const branchMesh = dir==="top"? getShapeMesh('pillar') : getCubeMesh('pillar');
			branchMesh.objType = "inter";
			branchMesh.objDir = dir;
			branchMesh.order = i;
			mainGroup.add(branchMesh);
		}
	});

	const shelterGroup = new THREE.Group(),
		shelterMat = new THREE.MeshStandardMaterial({color: 0xFFFFFF, roughness: 0.1, metalness: 0.9, envMap:envMap0});
	shelterGroup.objType = "shelter";
	[-1, 1].forEach(dir => {
		const shelterSideGroup = new THREE.Group();
		shelterSideGroup.name = "shelterSide";
		shelterSideGroup.dir = dir;
		const pillarGeo = new THREE.BoxGeometry(modelInfo.thick, shelterThick, 1),
			pillarMesh = new THREE.Mesh(pillarGeo, shelterMat);
		pillarMesh.name = "shelterPillar";
		shelterSideGroup.add(pillarMesh);

		const cylinderGeo = new THREE.CylinderGeometry(shelterThick/2, shelterThick/2, modelInfo.thick, 8),
			cylinderMesh = new THREE.Mesh(cylinderGeo, shelterMat);
		cylinderMesh.rotation.z = Math.PI / 2;
		cylinderMesh.name = "shelterCircleBottom";
		shelterSideGroup.add(cylinderMesh);

		shelterGroup.add(shelterSideGroup);
	});
	const cylinderGeo = new THREE.CylinderGeometry(shelterThick/2, shelterThick/2, 1, 8),
		cylinderMesh = new THREE.Mesh(cylinderGeo, shelterMat);
	cylinderMesh.rotation.z = Math.PI / 2;
	cylinderMesh.name = "shelterCircleTop";
	shelterGroup.add(cylinderMesh);

	const shelterCoverMesh = getCubeMesh("pillar");
	shelterCoverMesh.name = "shelterCover";
	shelterGroup.add(shelterCoverMesh);

	const shelterMap = new THREE.TextureLoader().load("../model/shelter-plane.jpg"),
		shelterPlaneGeo = new THREE.BoxGeometry(1, shelterThick/4, 1),
		shelterPlaneMat = new THREE.MeshStandardMaterial({color:0xFFFFFF, roughness:0.7, metalness:0.3, map:shelterMap}),
		shelterPlaneMesh = new THREE.Mesh(shelterPlaneGeo, shelterPlaneMat);
		shelterPlaneMesh.name = "shelterPlane";
	shelterGroup.add(shelterPlaneMesh);
	shelterGroup.visible = false;
	mainGroup.add(shelterGroup);
	return mainGroup;
}
