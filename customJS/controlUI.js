
import { changeInstall, changeDimension, changeModel, changeColor, changeRoofPanel, changeSidePanel, changeRoofShelter, changeWedge } from './main.js';
import { accessoriesInfo, accessoriesLabelArr, colorArr, modelInfo } from './value.js';

document.addEventListener('DOMContentLoaded', function() {

	const colorOptionWrapper = document.getElementById('colorOptionWrapper');
	colorArr.forEach(color => {
		const colorSwatch = document.createElement('div');
		colorSwatch.classList.add('color-swatch');
		colorSwatch.style.background = color.code;
		colorSwatch.title = color.name;
		colorSwatch.dataset.color = color.hex;
		colorOptionWrapper.appendChild(colorSwatch);
	});

	const selectModel = document.getElementById('selectModel');
	const inputWidth = document.getElementById('inputWidth');
	const inputHeight = document.getElementById('inputHeight');
	const inputDepth = document.getElementById('inputDepth');
	const inputSlope = document.getElementById('inputSlope');
	const valueWidth = document.getElementById('valueWidth');
	const valueHeight = document.getElementById('valueHeight');
	const valueDepth = document.getElementById('valueDepth');
	const valueSlope = document.getElementById('valueSlope');

	selectModel.value = modelInfo.type;
	inputWidth.value = modelInfo.width;
	inputHeight.value = modelInfo.height;
	inputDepth.value = modelInfo.length;
	inputSlope.value = modelInfo.slope;
	valueWidth.innerHTML = modelInfo.width;
	valueHeight.innerHTML = modelInfo.height;
	valueDepth.innerHTML = modelInfo.length;
	valueSlope.innerHTML = modelInfo.slope;

	changeModel(modelInfo.type);
	changeAccessoriesContent(modelInfo.type);
});

document.getElementById('selectModel').addEventListener('change', function() {
	const installValue = document.querySelector('input[type="radio"][name="install"]:checked')?.value;
	if (this.value === "pergola") {
		if (installValue === "attached") {
			modelInfo.install = "free";
			document.querySelector('input[name="install"][value="free"]').checked = true;
		}
		$("#setInstallAttached").hide();
	} else {
		modelInfo.install = "attached";
		document.querySelector('input[name="install"][value="attached"]').checked = true;
		$("#setInstallAttached").show();
	}
	modelInfo.front = "none";
	modelInfo.back = "none";
	modelInfo.left = "none";
	modelInfo.right = "none";
	if (this.value === "car") {
		modelInfo.front = "none";
		modelInfo.back = "none";
	}
	changeModel(this.value);
	changeAccessoriesContent(this.value);
});

// ...existing code...
function changeAccessoriesContent(value) {
    const accessoriesWrapper = document.getElementById('accessoriesWrapper');
    const selAccessories = accessoriesInfo[value];
    accessoriesWrapper.innerHTML = ''; // Clear previous content
    Object.keys(selAccessories).forEach(side => {
        const inputRowEle = document.createElement('div');
        inputRowEle.classList.add('input-row');
        accessoriesWrapper.appendChild(inputRowEle);

        const label = document.createElement('label');
        label.style.width = '80px';
        label.textContent = `${side.charAt(0).toUpperCase() + side.slice(1)} Side`;
        inputRowEle.appendChild(label);

        const select = document.createElement('select');
        select.id = `${side}SideSelect`;

        // Preserve current selection from modelInfo if available
        const current = modelInfo[side] || selAccessories[side][0];
        selAccessories[side].forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = accessoriesLabelArr[optionValue] || optionValue;
            if (optionValue === current) option.selected = true;
            select.appendChild(option);
        });

        inputRowEle.appendChild(select);
    });
}

// Attach a single change listener to the wrapper (event delegation)
// Place this inside DOMContentLoaded (or after the wrapper exists)
const accessoriesWrapper = document.getElementById('accessoriesWrapper');
if (accessoriesWrapper) {
    accessoriesWrapper.addEventListener('change', function(e) {
        const el = e.target;
        if (el && el.tagName === 'SELECT' && el.id.endsWith('SideSelect')) {
            const side = el.id.replace('SideSelect','');
            const value = el.value;
            // update modelInfo and call handler
            modelInfo[side] = value;
            if (typeof changeSidePanel === 'function') changeSidePanel(side, value);
        }
    });
}

document.querySelectorAll('input[type="radio"][name="install"]').forEach(radio => {
	radio.addEventListener('change', function() {
		if (modelInfo.type === "car") {
			const accessoriesWrapper = document.getElementById("accessoriesWrapper");
			const labels = accessoriesWrapper.querySelectorAll('.input-row label');
			if (labels.length > 1) labels[1].innerHTML = this.value === "attached" ? 'Front Side' : 'Back Side';
		}
		changeInstall(this.value);
	});
});

document.querySelectorAll('.input-dimension').forEach(input => {
	input.addEventListener('input', function() {
		const typeLabel = input.id.substring(5);
		var key = typeLabel.toLowerCase();
		if (key == "depth") key = "length";
		const value = parseInt(input.value);
		const valueEle = document.getElementById('value' + typeLabel);
		valueEle.innerHTML = value;
		changeDimension(key, value);
	});
});

document.getElementById('colorOptionWrapper').addEventListener('click', function(e) {
	if (e.target.classList.contains('color-swatch')) {
		const hexColor = parseInt(e.target.dataset.color);
		changeColor(hexColor);
	}
});

document.getElementById('roofPanelSelect').addEventListener('change', function() {
	const valueStr = this.value;
	const parts = valueStr.split("-");
	const thick = parts[0] === "5" ? 0.625 : 0.375;
	const mat = parts[1];
	changeRoofPanel(thick, mat);
});

document.getElementById("roofShelter").addEventListener('change', function() {
	changeRoofShelter("shelter", this.checked);
});

document.getElementById("wedgeSwitch").addEventListener('change', function() {
	changeWedge("wedge", this.checked);
});
