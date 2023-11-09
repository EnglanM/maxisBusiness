import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

// Create a new scene
export class SetupScene {
  scene:Scene;
  camera:PerspectiveCamera;
  renderer:WebGLRenderer;

  constructor() {
    this.scene = new Scene();
    this.renderer = this.setupRenderer();
    this.camera = this.setupInitialCamera();
    this.setupEnvironment();
  }

  // Create a new camera
  setupInitialCamera() {
    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const controls = new OrbitControls(camera, this.renderer.domElement);
    controls.update();
    return camera;
  }

  
  // Create a new renderer
  setupRenderer() {
    const renderer = new WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return renderer;
  }

  setupEnvironment() {
    // Create a new cube
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new Mesh(geometry, material);
    this.scene.add(cube);
    
    // Position the camera
    this.camera.position.z = 5;
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.render();
    });
  

  }
  
  // Render the scene
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  //end of class
}

