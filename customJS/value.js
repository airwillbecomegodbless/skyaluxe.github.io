
export const camDis = 10, groundDis = camDis * 20;
export const canvasTop = 170, canvasLeft = 320;

export const interTopMax = 50, interSideMax = 40, interFrontMax = 170;

export const shelterThick = 2, shelterDis = 4, shelterCoverW = 12, shelterPlaneWR = 0.7;

export const screenHR = 0.6, aluminiumHR = 0.5;

export const carportPos = {rot:-1, x:-5, z:-20.7};

export const colorArr = [
	{ name: "Traffic White", code: "#F6F6F6", hex:0xF6F6F6 },
	{ name: "White aluminum", code: "#A5A5A5", hex:0xA5A5A5 },
	{ name: "Anthracite Grey", code: "#383E42", hex:0x383E42 }
];
export const modelInfo = { type:"patio", install:"attached", width: 140, height: 102, length:84, thick:4, gap:0.4, colorHex: colorArr[1].hex, slope:10, roofThick:0.375, roofMat:'clearGlass', left:'none', right:'none', front:'none', back:'none', wedge:false, roofShelter:false };

export const disMainBeam = modelInfo.thick;

export function getCSize() {
	const {innerWidth, innerHeight} = window;
	return {width: innerWidth - canvasLeft, height:innerHeight - canvasTop};
}

export const accessoriesLabelArr = {
	"none":"None",
	"clearGlass":"Fixed Clear Glass",
	"frostGlass":"Fixed Frosted Glass",
	"slidingClearGlass":"Sliding Clear Glass",
	"slidingFrostGlass":"Sliding Frosted Glass",
	"clearPolycarbonate":"Clear Polycarbonate",
	"opalPolycarbonate":"Opal Polycarbonate",
	"wood":"Wood",
	"screen":"Screen",
	"aluminum":"Aluminum"
}

export const accessoriesInfo = {
	car: {
		// left: [
		// 	"none",
		// 	"clearPolycarbonate",
		// 	"opalPolycarbonate",
		// 	"wood",
		// 	"aluminum"
		// ],
		right: [
			"none",
			"clearPolycarbonate",
			"opalPolycarbonate",
			"wood",
			"aluminum"
		],
		front: [
			"none",
			"clearPolycarbonate",
			"opalPolycarbonate",
			"wood",
			"aluminum"
		]
	},
	patio : {
		left: [
			"none",
			// "Wedge: Clear, Opal",
			"clearGlass",
			"frostGlass",
			"slidingClearGlass",
			"slidingFrostGlass",
			"clearPolycarbonate",
			"opalPolycarbonate",
			"wood",
			"screen",
			"aluminum"
		],
		right: [
			"none",
			// "Wedge: Clear, Opal",
			"clearGlass",
			"frostGlass",
			"slidingClearGlass",
			"slidingFrostGlass",
			"clearPolycarbonate",
			"opalPolycarbonate",
			"wood",
			"screen",
			"aluminum"
		],
		front: [
			"none",
			"clearGlass",
			"frostGlass",
			"slidingClearGlass",
			"slidingFrostGlass",
			"clearPolycarbonate",
			"opalPolycarbonate",
			"wood",
			"screen",
			"aluminum"
		]
	},
	pergola : {
		left: [
			"none",
			// "Wedge: Clear, Opal",
			"clearGlass",
			"frostGlass",
			"slidingClearGlass",
			"slidingFrostGlass",
			"clearPolycarbonate",
			"opalPolycarbonate",
			"wood",
			"screen",
			"aluminum"
		],
		right: [
			"none",
			// "Wedge: Clear, Opal",
			"clearGlass",
			"frostGlass",
			"slidingClearGlass",
			"slidingFrostGlass",
			"clearPolycarbonate",
			"opalPolycarbonate",
			"wood",
			"screen",
			"aluminum"
		],
		front: [
			"none",
			"clearGlass",
			"frostGlass",
			"slidingClearGlass",
			"slidingFrostGlass",
			"clearPolycarbonate",
			"opalPolycarbonate",
			"wood",
			"screen",
			"aluminum"
		],
		back: [
			"none",
			"clearGlass",
			"frostGlass",
			"slidingClearGlass",
			"slidingFrostGlass",
			"clearPolycarbonate",
			"opalPolycarbonate",
			"wood",
			"screen",
			"aluminum"
		]
	}
}
