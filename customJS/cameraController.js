import * as THREE from 'three';

export class SmoothCameraController {
    constructor(camera, domElement, scene) {
        this.camera = camera;
        this.domElement = domElement;
        this.scene = scene;
        
        // Target position and rotation
        this.target = new THREE.Vector3();
        
        // Momentum variables
        this.rotationMomentum = { x: 0, y: 0 };
        this.zoomMomentum = 0;
        this.panMomentum = { x: 0, y: 0 };
        
        // Damping factors
        this.rotationDamping = 0.9;
        this.zoomDamping = 0.9;
        this.panDamping = 0.9;
        
        // Sensitivity
        this.rotationSpeed = 0.005;
        this.zoomSpeed = 0.1;
        this.panSpeed = 0.001;
        
        // Mouse tracking
        this.mouse = { x: 0, y: 0 };
        this.lastMouse = { x: 0, y: 0 };
        this.isMouseDown = false;
        this.mouseButton = null;
        
        // Spherical coordinates for orbit
        this.spherical = new THREE.Spherical();
        this.spherical.setFromVector3(this.camera.position.clone().sub(this.target));
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.domElement.addEventListener('wheel', this.onWheel.bind(this));
        
        // Prevent context menu
        this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    onMouseDown(event) {
        this.isMouseDown = true;
        this.mouseButton = event.button;
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
        this.lastMouse.x = event.clientX;
        this.lastMouse.y = event.clientY;
        
        // Stop momentum when user starts dragging
        this.rotationMomentum.x = 0;
        this.rotationMomentum.y = 0;
        this.panMomentum.x = 0;
        this.panMomentum.y = 0;
    }
    
    onMouseMove(event) {
        if (!this.isMouseDown) return;
        
        const deltaX = event.clientX - this.lastMouse.x;
        const deltaY = event.clientY - this.lastMouse.y;
        
        if (this.mouseButton === 0) { // Left mouse button - rotate
            this.rotationMomentum.x = deltaY * this.rotationSpeed;
            this.rotationMomentum.y = deltaX * this.rotationSpeed;
            
            this.spherical.theta -= this.rotationMomentum.y;
            this.spherical.phi += this.rotationMomentum.x;
            
            // Limit phi to prevent flipping
            this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));
            
        } else if (this.mouseButton === 2) { // Right mouse button - pan
            this.panMomentum.x = deltaX * this.panSpeed;
            this.panMomentum.y = deltaY * this.panSpeed;
            
            const offset = new THREE.Vector3();
            offset.copy(this.camera.position).sub(this.target);
            
            const targetDistance = offset.length();
            const panLeft = new THREE.Vector3();
            const panUp = new THREE.Vector3();
            
            panLeft.setFromMatrixColumn(this.camera.matrix, 0);
            panUp.setFromMatrixColumn(this.camera.matrix, 1);
            
            panLeft.multiplyScalar(-this.panMomentum.x * targetDistance);
            panUp.multiplyScalar(this.panMomentum.y * targetDistance);
            
            this.target.add(panLeft);
            this.target.add(panUp);
        }
        
        this.lastMouse.x = event.clientX;
        this.lastMouse.y = event.clientY;
    }
    
    onMouseUp(event) {
        this.isMouseDown = false;
        this.mouseButton = null;
    }
    
    onWheel(event) {
        const delta = event.deltaY > 0 ? 1 : -1;
        this.zoomMomentum = delta * this.zoomSpeed;
    }
    
    update() {
        // Apply rotation momentum
        if (Math.abs(this.rotationMomentum.x) > 0.001 || Math.abs(this.rotationMomentum.y) > 0.001) {
            this.spherical.theta -= this.rotationMomentum.y;
            this.spherical.phi += this.rotationMomentum.x;
            
            // Limit phi
            this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));
            
            // Apply damping
            this.rotationMomentum.x *= this.rotationDamping;
            this.rotationMomentum.y *= this.rotationDamping;
        }
        
        // Apply zoom momentum
        if (Math.abs(this.zoomMomentum) > 0.001) {
            this.spherical.radius += this.zoomMomentum;
            this.spherical.radius = Math.max(1, Math.min(100, this.spherical.radius)); // Clamp zoom
            
            this.zoomMomentum *= this.zoomDamping;
        }
        
        // Apply pan momentum
        if (Math.abs(this.panMomentum.x) > 0.001 || Math.abs(this.panMomentum.y) > 0.001) {
            const panLeft = new THREE.Vector3();
            const panUp = new THREE.Vector3();
            
            panLeft.setFromMatrixColumn(this.camera.matrix, 0);
            panUp.setFromMatrixColumn(this.camera.matrix, 1);
            
            panLeft.multiplyScalar(-this.panMomentum.x * this.spherical.radius);
            panUp.multiplyScalar(this.panMomentum.y * this.spherical.radius);
            
            this.target.add(panLeft);
            this.target.add(panUp);
            
            this.panMomentum.x *= this.panDamping;
            this.panMomentum.y *= this.panDamping;
        }
        
        // Update camera position from spherical coordinates
        const position = new THREE.Vector3();
        position.setFromSpherical(this.spherical);
        position.add(this.target);
        
        this.camera.position.copy(position);
        this.camera.lookAt(this.target);
    }
    
    // Method to set camera limits
    setLimits(options = {}) {
        this.minRadius = options.minRadius || 1;
        this.maxRadius = options.maxRadius || 100;
        this.minPolarAngle = options.minPolarAngle || 0;
        this.maxPolarAngle = options.maxPolarAngle || Math.PI;
        this.minAzimuthAngle = options.minAzimuthAngle || -Infinity;
        this.maxAzimuthAngle = options.maxAzimuthAngle || Infinity;
    }
}
