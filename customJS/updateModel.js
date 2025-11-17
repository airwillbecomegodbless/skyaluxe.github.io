import * as THREE from 'three';
import { aluminiumHR, disMainBeam, interFrontMax, interSideMax, interTopMax, screenHR, shelterCoverW, shelterDis, shelterPlaneWR, shelterThick } from './value.js';
import { envMap, envMap0 } from './loadModel.js';

const houseScl = 0.07;

const aluminumMap = new THREE.TextureLoader().load('./model/aluminium.jpg');
aluminumMap.wrapS = aluminumMap.wrapT = THREE.RepeatWrapping;
aluminumMap.repeat.set(1, 1);

export function updateModel(mainModel, houseModel, modelInfo) {
	const { width, length, slope, type, install, thick, gap, colorHex, roofThick, roofMat, left, right, front, back, wedge } = modelInfo; // , height
	const interTopCount = Math.round(width / interTopMax), interTopWidth = width / interTopCount;
	const interSideCount = Math.round(length / interSideMax), interSideWidth = length / interSideCount;
	mainModel.scale.set(houseScl, houseScl, houseScl);
	mainModel.position.z = length / 2 * houseScl;
	const slopeAng = slope * Math.PI / 180;

	const modelHeight = modelInfo.height;

	const slopeLengthRatio = 1/ Math.cos(slopeAng);
	const slopeHeightRatio = Math.tan(slopeAng);
	const slopeDeltaH = length * slopeHeightRatio;
	const height = modelHeight - slopeDeltaH;
	const slopeHeight = height + slopeDeltaH;
	const slopeLength = length * slopeLengthRatio;
	const slopeMiddleH = height + slopeDeltaH / 2;
	const beamH = height - disMainBeam;
	const subBeamH = height - thick/2;
	const screenH = beamH * screenHR;
	const aluminiumH = beamH * aluminiumHR;
	const screenPosY = beamH - screenH/ 2;

	mainModel.children.forEach(child => {
		if (child.objType === "pillar") {
			const {xDir, zDir} = child;
			child.scale.set(thick, height + thick/2, thick);
			child.position.set(xDir * (width) / 2, (height + thick/2) / 2, zDir * (length) / 2);
			setPillerMat(child, colorHex);
			if (zDir == -1) {
				child.visible = (install === "free")?true:false;
				if (xDir === -1 && left !== "none") {
					child.visible = true;
				} else if (xDir === 1 && right !== "none") {
					child.visible = true;
				}
				child.scale.y = slopeHeight + thick/2;
				child.position.y = (slopeHeight + thick/2) / 2;
			}
		} else if (child.objType === "plane") {
			const {dir, axis} = child;
			if (axis === "z") {
				child.scale.set(width, height, gap);
				child.position.set(0, height / 2, dir * length/2);
				if (dir == -1) {
					if (install === "attached") {
						child.visible = false;
					} else {
						child.visible = true;
						child.scale.y = slopeHeight;
						child.position.y = (slopeHeight) / 2;
					}
					child.material = getRoofMat(back, length);
					setSidePanel(child, back, screenH, screenPosY + thick, aluminiumH);
				} else {
					child.material = getRoofMat(front, length);
					setSidePanel(child, front, screenH, screenPosY + thick, aluminiumH);
				}
			} else if (axis === "x") {
				child.visible = wedge;
				child.geometry.dispose();
				child.geometry = getShapePlaneGeo(length, height, slopeHeight, gap);
				child.position.set(dir*width/2, 0, length/-2);
			} else if (axis === "y") {
				child.scale.set(width, roofThick, slopeLength);
				child.position.set(0, slopeMiddleH, 0);
				child.rotation.x = slopeAng;
				child.material = getRoofMat(roofMat, width, "roof");
			}
		} else if (child.objType === "frame") {
			const {dir, axis} = child;
			if (axis === "z") {
				child.scale.set(width + thick, thick, thick);
				child.position.set(0, height, dir * length/2);
				if (dir == -1) {
					// child.visible = (install === "attached")?false:true;
					if (install==="attached") {
						child.position.z = dir * length/2 + thick;
					}
					
					child.position.y = slopeHeight;
				}
			} else if (axis === "x") {
				child.geometry.dispose();
				child.geometry = getShapeFrameGeo(length, slopeDeltaH, thick, install);
				child.rotation.y = Math.PI / 2;
				child.position.set(dir*width/2 - thick/2, height - thick/2, length/2);
			}
			setPillerMat(child, colorHex);
		} else if (child.objType === "inter") {
			child.visible = false;
			setPillerMat(child, colorHex);
		} else if (child.objType === "screenBeam") {
            child.scale.set(gap * 2, thick/2, length);
            child.position.set(width/2 * child.dir, beamH - screenH, 0);
            setPillerMat(child, colorHex);
            if (child.dir === -1) {
            	child.visible = left === "screen";
            } else if (child.dir === 1) {
            	child.visible = right === "screen";
            }
		} else if (child.objType === "beam") {
            child.scale.set(thick, thick, length);
            child.position.set(width/2 * child.dir, beamH, 0);
			if (child.dir === -1) {
				child.visible = (left !== "none" || wedge);
			} else if (child.dir === 1) {
				child.visible = (right !== "none" || wedge);
			}
            setPillerMat(child, colorHex);
        } else if (child.objType === "subBeam") {
			child.visible = false;
            child.scale.set(thick, thick/2, length);
            child.position.set(width/2 * child.dir, subBeamH, 0);
            setPillerMat(child, colorHex);
        } else if (child.objType === "side") {
            child.scale.set(gap, beamH, length);
            child.position.set(width/2 * child.dir, beamH/2, 0);
            if (child.dir === -1) {
            	child.material = getRoofMat(left, length);
				setSidePanel(child, left, screenH, screenPosY, aluminiumH);
            } else if (child.dir === 1) {
            	child.material = getRoofMat(right, length);
				setSidePanel(child, right, screenH, screenPosY, aluminiumH);
            }
        } else if (child.objType === "side_rail") {
            child.scale.z = length;
            child.position.x = width/2 * child.dir;
            child.children.forEach(subChild => {
                if (subChild.objType === "pillar") {
                    setPillerMat(subChild, colorHex);
                }
            });
            if (child.dir === -1) {
            	child.visible = !(left === "none" || left === "screen");
            } else if (child.dir === 1) {
            	child.visible = !(right === "none" || right === "screen");
            }
        } else if (child.objType === "front_rail") {
            child.scale.z = width;
            child.position.z = length/2 * child.dir;
            child.children.forEach(subChild => {
                if (subChild.objType === "pillar") {
                    setPillerMat(subChild, colorHex);
                }
            });
            if (child.dir === 1) {
            	child.visible = !(front === "none" || front === "screen");
            } else if (child.dir === -1) {
            	child.visible = !(back === "none" || back === "screen" || install === "attached");
            }
			child.rotation.y = Math.PI/2;
		} else if (child.objType === "shelter") {
			child.position.y = slopeMiddleH + shelterDis + shelterThick/2;
			child.rotation.x = slopeAng;
			child.children.forEach(shelterChild => {
				if (shelterChild.name === "shelterPlane") {
					const shelterPlaneW = shelterPlaneWR * slopeLength
					shelterChild.scale.set(width, 1, shelterPlaneW);
					shelterChild.position.z = (slopeLength - shelterPlaneW)/-2;
				} else if (shelterChild.name === 'shelterCircleTop') {
					shelterChild.scale.y = width + thick;
					shelterChild.position.z = slopeLength/-2;
					setPillerMat(shelterChild, colorHex);
				} else if (shelterChild.name === "shelterCover") {
					shelterChild.scale.set(width, shelterThick, shelterCoverW);
					shelterChild.position.z = (slopeLength - shelterCoverW)/-2;
					setPillerMat(shelterChild, colorHex);
				} else {
					shelterChild.position.x = width/2*shelterChild.dir;
					shelterChild.children.forEach(subChild => {
						if (subChild.name === "shelterPillar") {
							subChild.scale.z = slopeLength;
						} else {
							subChild.position.z = slopeLength/2;
						}
                        setPillerMat(subChild, colorHex);
					});
				}
			});
		}
	});
	for (let i = width / -2 + interTopWidth, order = 0; i < width / 2 - interTopMax / 2; i += interTopWidth, order++) {
		const interTopMesh = mainModel.children.find(child => child.objType === "inter" && child.order === order && child.objDir === "top");
		if (interTopMesh) {
			interTopMesh.visible = true;
			interTopMesh.geometry.dispose();
			interTopMesh.geometry = getShapeFrameGeo(length, slopeDeltaH, thick, install);
			interTopMesh.rotation.y = Math.PI / 2;
			interTopMesh.position.set(i - thick, height - thick/2, length/2); // /2
		}
	}
	// ["front"].forEach(dir => { // , "back"
	// 	for (let i = width / -2 + interFrontWidth, order = 0; i < width / 2 - interFrontMax / 2; i += interFrontWidth, order++) {
	// 		const interFrontMesh = mainModel.children.find(child => child.objType === "inter" && child.order === order && child.objDir === dir);
	// 		if (interFrontMesh) {
	// 			interFrontMesh.visible = true;
	// 			interFrontMesh.scale.set(thick, height, thick);
	// 			interFrontMesh.position.set(i - thick/2, height/2, dir === "front" ? length/2 : -length/2);
	// 		}
	// 	}
	// });

	setFrontInterPillar(mainModel, front, "front", width, length, height, thick);
	setFrontInterPillar(mainModel, back, "back", width, length, slopeHeight, thick, type, install);

	setSideInterPillar(mainModel, left, "left", interSideWidth, width, length, thick, beamH);
	setSideInterPillar(mainModel, right, "right", interSideWidth, width, length, thick, beamH);
}

const middleKeyArr = ["slidingClearGlass", "slidingFrostGlass", "wood", "screen", "aluminum", "none"]
function setFrontInterPillar(mainModel, frontKey, dir, width, length, height, thick, type, install) {
	const slidingFlag = frontKey.includes("Glass") || frontKey.includes("Polycarbonate");
	const middleFlag = middleKeyArr.includes(frontKey);
	var interFrontCount = width >= interFrontMax ? 2:1;
	const slidingBeamCount = Math.round(width / interTopMax);
	const slidingBeamWidth = width / slidingBeamCount;
	if (slidingFlag) {
		interFrontCount = Math.round(width / interTopMax); // interSideMax
	}
	const interMax = slidingFlag?interSideMax:interFrontMax;

	const interFrontWidth = width / interFrontCount;
	if (dir==="back" && type==="patio" && install === "attached") return;

	if (slidingFlag) {
		for (let i = width / -2 + slidingBeamWidth, order = 0; i < width / 2 - interMax / 2; i += slidingBeamWidth, order++) {
			const interFrontMesh = mainModel.children.find(child => child.objType === "inter" && child.order === order && child.objDir === dir);
			if (interFrontMesh) {
				interFrontMesh.visible = true;

				if (frontKey.includes("sliding") && frontKey.includes("Glass")) {
					interFrontMesh.scale.set(thick/12, height, thick/8);
					interFrontMesh.material.color.setHex(0xBBBBBB);
				} else {
					interFrontMesh.scale.set(thick, height, thick);
				}
				interFrontMesh.position.set(i - thick/2, height/2, dir === "front" ? length/2 : -length/2);
			}
		}
	}

	if (middleFlag) {
		const interBeamLast = mainModel.children.find(child => child.objType === "inter" && child.order === 10 && child.objDir === dir);
		interBeamLast.visible = true;
		interBeamLast.scale.set(thick, height, thick);
		interBeamLast.position.set( - thick/2, height/2, dir === "front" ? length/2 : -length/2);
	}
}

function setSideInterPillar(mainModel, sideKey, dir, interSideWidth, width, length, thick, beamH) {
	if (sideKey.includes("Glass") || sideKey.includes("Polycarbonate")) {
		for (let i = length / -2 + interSideWidth, order = 0; i < length / 2 - interSideMax / 2; i += interSideWidth, order++) {
			const interSideMesh = mainModel.children.find(child => child.objType === "inter" && child.order === order && child.objDir === dir);
			if (interSideMesh) {
				interSideMesh.visible = true;
				
				if (sideKey.includes("sliding") && sideKey.includes("Glass")) {
					interSideMesh.scale.set(thick/8, beamH, thick/12);
					interSideMesh.material.color.setHex(0xBBBBBB);
				} else {
					interSideMesh.scale.set(thick, beamH, thick);
				}
				interSideMesh.position.set(dir === "left" ? width/-2 : width/2, beamH/2, i - thick/2);
			}
		}
	}
}

function setSidePanel(child, sideKey, screenH, screenPosY, aluminiumH) {
	if (sideKey === "screen") {
		child.scale.y = screenH;
		child.position.y = screenPosY;
	} else if (sideKey === "aluminum") {
		child.scale.y = aluminiumH;
		child.position.y = aluminiumH / 2;
	}
}

function setPillerMat(child, color) {
	child.material.color.set(color);
	if (color === 0xF6F6F6) {
		child.material.roughness = 0.3;
		child.material.metalness = 0.7;
		child.material.color.set(0xFFFFFF);
	} else {
		child.material.roughness = 0.1;
		child.material.metalness = 0.9;
	}
}

function getShapePlaneGeo(length, height, slopeHeight, gap) {

    const baseH = height - disMainBeam;

	const newShape = new THREE.Shape();
	// newShape.moveTo(0, 0);
	// newShape.lineTo(length, 0);
	// newShape.lineTo(length, height);
	// newShape.lineTo(0, slopeHeight);
	// newShape.lineTo(0, 0);

	newShape.moveTo(0, baseH);
	newShape.lineTo(length, baseH);
	newShape.lineTo(length, height);
	newShape.lineTo(0, slopeHeight);
	newShape.lineTo(0, baseH);

    const extrudeSettings = { steps: 1, depth: gap, bevelEnabled: false };

	return new THREE.ExtrudeGeometry(newShape, extrudeSettings);
}

function getShapeFrameGeo(length, height, thick, install) {
	const shape = new THREE.Shape();
	const deltaX = install === "attached" ? thick : 0;
	shape.moveTo(thick/2, 					0);
	shape.lineTo(length - thick/2 - deltaX,	height);
	shape.lineTo(length - thick/2 - deltaX, height + thick);
	shape.lineTo(thick/2, 					thick);
	shape.lineTo(thick/2, 					0);

	const extrudeSettings = { steps: 1, depth: thick, bevelEnabled: false };
	return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

function getRoofMat(matKey, width, side) {
	var roughness  = 0.1, metalness = 0.9, transparent = true, opacity = 0.5, color=0xFFFFFF, envMapTexture = envMap0;
	if (matKey === "clearGlass") {
	} else if (matKey === "frostGlass") {
		opacity = 0.8;
	} else if (matKey === "clearPolycarbonate") {
		opacity = 0.75;
		roughness = 0.5;
		metalness = 0.5;
	} else if (matKey === "opalPolycarbonate") {
		color = 0xEEEEEE;
		opacity = 0.9;
		roughness = 0.5;
		metalness = 0.5;
	}
	// return new THREE.MeshStandardMaterial({ color, roughness, metalness, transparent, opacity, envMap: envMapTexture });
	// var mapPoly3Roof = new THREE.TextureLoader().load( "../model/side-poly-3.png" );
	// mapPoly3Roof.wrapS = mapPoly3Roof.wrapT = THREE.RepeatWrapping;
	// if (side === "roof") {	}

	var	mapPoly3Roof = new THREE.TextureLoader().load( "../model/roof-poly-3.png" );
		mapPoly3Roof.wrapS = mapPoly3Roof.wrapT = THREE.RepeatWrapping;
		mapPoly3Roof.repeat.set(width/1, 1);

    // var mapPoly6Roof = new THREE.TextureLoader().load( "../model/side-poly-6.png" );
	// mapPoly6Roof.wrapS = mapPoly6Roof.wrapT = THREE.RepeatWrapping;
	// if (side === "roof") { }
	var	mapPoly6Roof = new THREE.TextureLoader().load( "../model/roof-poly-6.png" );
		mapPoly6Roof.wrapS = mapPoly6Roof.wrapT = THREE.RepeatWrapping;
	
    mapPoly6Roof.repeat.set(width/1, 1);

	const mapWoodSide = new THREE.TextureLoader().load( "../model/wood-trans.png" );
	mapWoodSide.wrapS = mapWoodSide.wrapT = THREE.RepeatWrapping;
	// mapWoodSide.repeat.set(1, 1/width * 0.5);
	mapWoodSide.repeat.set(1, 30);

	if (matKey === "none") {
		return new THREE.MeshStandardMaterial({visible:false});
	} else if (matKey.toLowerCase().includes("clearglass")) {
		return new THREE.MeshPhysicalMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.6,
			roughness: 0.05,
			metalness: 0,
			transmission: 1.0,      // Enables glass-like refraction
			ior: 1.52,              // Index of refraction for glass
			thickness: 0.0095,      // 3/8" in meters ≈ 9.5 mm
			clearcoat: 1.0,
			clearcoatRoughness: 0.05,
			envMap: envMapTexture,
			depthWrite: false,
			reflectivity: 0.9
		});
	} else if (matKey.toLowerCase().includes("frostglass")) {
		return new THREE.MeshPhysicalMaterial({
			color: 0xEEEEEE,
			transparent: true,
			opacity: 0.9,
			roughness: 0.1,
			metalness: 0,
			transmission: 0.7,
			ior: 1.52,
			thickness: 0.0095,
			clearcoat: 0.8,
			envMap: envMapTexture,
			// depthWrite: false,
			reflectivity:0.9,
			clearcoatRoughness: 0.3
		});
	} else if (matKey === "clearPolycarbonate") {
		// return new THREE.MeshStandardMaterial({
		// 	transparent:true,
		// 	opacity:0.3,
		// 	color:0xAAAAAA,
		// 	metalness:0,
		// 	// map: mapPoly3Roof,
		// 	envMap: envMapTexture,
		// 	// depthWrite: false,
		// 	roughness:1
		// })
		return new THREE.MeshPhysicalMaterial({
			color: 0xAAAAAA,
			transparent: true,
			opacity: 0.5, // 0.75,
			roughness: 0.7, // 0.1,
			metalness: 0,
			transmission: 0.3, // 0.9,
			ior: 1.47,
			thickness: 0.0159,
			clearcoat: 0.4, // 0.6,
			map:mapPoly6Roof, // mapPoly3Roof,
			envMap: envMapTexture,
			// depthWrite: false,
			clearcoatRoughness: 0.4, // 0.1
		});
	} else if (matKey === "opalPolycarbonate") {
		return new THREE.MeshPhysicalMaterial({
			color: 0xBBBBBB,
			transparent: true,
			opacity: 0.95,
			roughness: 0.7,
			metalness: 0,
			transmission: 0.3,
			ior: 1.47,
			thickness: 0.0159,
			clearcoat: 0.4,
			map: mapPoly6Roof,
			envMap: envMapTexture,
			// depthWrite: false,
			clearcoatRoughness: 0.4
		});
	} else if (matKey === "wood") {
		return new THREE.MeshStandardMaterial({
			// color: 0xFFFFFF,        // Warm brown tone
			roughness: 0.5,            // Not glossy
			metalness: 0.5,            // Non-metal
			map: mapWoodSide,
			reflectivity: 0.5,
			depthWrite: false,
            transparent:true,
		});
	} else if (matKey === "screen") {
		return new THREE.MeshStandardMaterial({
			color: 0xFFFFFF,
			roughness: 0.2,
			metalness: 0.8,
			envMap: envMapTexture,
			reflectivity: 0.9
		});
	} else if (matKey === "aluminum") {
		return new THREE.MeshStandardMaterial({

			// color: 0x223355,
			// color: 0x2E2E2E,
			// color: 0x223355,
			// color: 0x383E42,
			color: 0x282E32,
			roughness: 0.2,
			metalness: 0.8,
			envMap: envMapTexture,
			map: aluminumMap,
			// clearcoat: 0.8,
			// clearcoatRoughness: 0.2,
			reflectivity: 0.9
		});
	} else {
		return new THREE.MeshStandardMaterial({ color, roughness, metalness, transparent, opacity, envMap: envMapTexture });
	}
}