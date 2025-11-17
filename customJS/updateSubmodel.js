import { interFrontMax } from "./value.js";


export function updateLoungerModel(loungerArr, modelInfo) {
    if (!loungerArr && !loungerArr.length) return;
    const { width, length, type} = modelInfo;

    const posZ = 0.03 * length;
    if (type !== "pergola") {
        loungerArr.forEach(lounger => {
            lounger.visible = false;
        });
        return;
    } else if (length < 140) {
        loungerArr.forEach((lounger, idx) => {
            if (idx === 0) {
                lounger.rotation.y = 0;
                lounger.position.set(0, 0, posZ);
                lounger.visible = true;
            } else {
                lounger.visible = false;
            }
        });
    } else {
        const countNum = Math.floor(width/80) || 1;
        const margin = (width - countNum * 80) / 2;
        loungerArr.forEach((lounger, idx) => {
            lounger.rotation.y = Math.PI/2;
            lounger.visible = idx < countNum;
            lounger.position.set((margin + idx * 80 + 40 - width/2) * 0.06, 0, posZ);
        });
    }
}

export function updateCarModel(totalGroup, modelInfo) {
    const carModel = totalGroup.children.find(child => child.name === "carModel");
    const cloneCarArr = totalGroup.children.filter(child => child.name.includes("cloneCarModel_"));
    if (!carModel || !cloneCarArr.length) return;
    const {type, install, width} = modelInfo;
    carModel.visible = false;
    cloneCarArr.forEach(cloneCar => {
        cloneCar.visible = false;
    });
    if (type !== "car") return;
    if (install === "free") {
        const carCount = width < interFrontMax ? 1: 2;
        cloneCarArr.forEach((cloneCar, idx) => {
            cloneCar.visible = idx < carCount;
            if (carCount === 1) cloneCar.position.x = 0;
            else {
                const dir = idx === 0?-1:1;
                cloneCar.position.x = (width/2 - 40) * dir * 0.05;
            }
        });
    } else {
        carModel.visible = true;
    }
}