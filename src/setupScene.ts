import { BackSide, BoxGeometry, CameraHelper, DirectionalLight, FrontSide, Mesh, MeshBasicMaterial, PerspectiveCamera, Raycaster, Scene, Vector2, WebGLRenderer } from 'three';
import {  OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import GUI from 'lil-gui';

// Create a new scene
export class SetupScene {
  scene:Scene;
  camera:PerspectiveCamera;
  renderer:WebGLRenderer;
  controls:OrbitControls|null=null;

  constructor() {
    this.scene = new Scene();
    this.renderer = this.setupRenderer();
    this.camera = this.setupInitialCamera();
    this.setupEnvironment();
  }

  // Create a new camera
  setupInitialCamera() {
    const camera = new PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(4.5, 2.435859853080808, -3.6145604307786923); 
    camera.updateProjectionMatrix();
    return camera;
  }

  // Create a new renderer
  setupRenderer() {
    const renderer = new WebGLRenderer({antialias:true,logarithmicDepthBuffer:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return renderer;
  }

  setupEnvironment() {
    //add a model 
    this.modelLoader();
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.render();
    });
    window.addEventListener('click', (event) => {
            // calculate mouse position in normalized device coordinates
            const mouse = new Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
            // create a raycaster and check for intersections
            const raycaster = new Raycaster();
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.scene.children, true);
      
            // log the clicked object's information
            if (intersects.length > 0) {
              console.log('Clicked object:', intersects[0].object);
              // console.log('Clicked object name:', intersects[0].object.name);
              // console.log('Clicked object position:', intersects[0].object.position);
              // console.log('Clicked object rotation:', intersects[0].object.rotation);
              // console.log('Clicked object scale:', intersects[0].object.scale);
            }
    });

    //add a light
    this.addDirectionalLight();
    //add debugger  
    const helper =new  CameraHelper( this.camera );
    this.scene.add( helper );
    this.setupDatGui();
    //add orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxPolarAngle = 1.354663921094003 ;
    this.controls.minPolarAngle = 0;
    this.controls.zoomToCursor=true;
    this.controls.update();
  }

  addDirectionalLight() {
    const light = new DirectionalLight(0xffffff, 15);
    light.position.set(0, 1, 1).normalize();
    this.scene.add(light);
    const light2 = new DirectionalLight(0xffffff, 3);
    light.position.set(0, -1, -1).normalize();
    this.scene.add(light2);
  }

  modelLoader() {
    const loader= new GLTFLoader();
    loader.load('../public/media/1103.glb', (glb)=>{
      glb.scene.traverse((child)=> {
        
        if (child instanceof Mesh) {
          child.material.side = FrontSide;
          //checkthis out, to eleminate the meshes above the ground
          if(child.name==='d34ed4d299ea4d2eb441633630e4a4d0_100'){
            child.material.color.set(0x00ff00);
            
          }
          
        }
      });
     

      console.log(glb);
      
      const root= glb.scene;
      root.scale.set(0.1,0.1,0.1);
      root.position.set(0,0,0);
      root.rotation.x = Math.PI;
      this.scene.add(root);
    }, function(xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function(error) {
      console.error(error);
    });
  }


  setupDatGui() {
    const gui = new GUI();
    const cameraFolder = gui.addFolder('Camera Helper');
    // cameraFolder.add(this.camera.position, 'x', -10, 10).step(0.1);
    // cameraFolder.add(this.camera.position, 'y', -10, 10).step(0.1);
    // cameraFolder.add(this.camera.position, 'z', -10, 10).step(0.1);
    // cameraFolder.add(this.camera.rotation, 'x', -Math.PI, Math.PI).step(0.01);
    // cameraFolder.add(this.camera.rotation, 'y', -Math.PI, Math.PI).step(0.01);
    // cameraFolder.add(this.camera.rotation, 'z', -Math.PI, Math.PI).step(0.01);
    // cameraFolder.add(this.camera.scale, 'x', 0, 10).step(0.1);
    // cameraFolder.add(this.camera.scale, 'y', 0, 10).step(0.1);
    // cameraFolder.add(this.camera.scale, 'z', 0, 10).step(0.1);
    // if (this.controls) {
    //   cameraFolder.add(this.controls.target, 'x', -10, 10).step(0.1);
    //   this.controls.update();
    //   cameraFolder.add(this.controls.target, 'y', -10, 10).step(0.1);
    //   this.controls.update();
    //   cameraFolder.add(this.controls.target, 'z', -10, 10).step(0.1);
    //   this.controls.update();
    // }
    }

    
  // Render the scene
  animate() {
    requestAnimationFrame(this.animate.bind(this));
  //  const raycaster = new Raycaster();
  //   // Update the raycaster to start from the camera's position and go in the direction the camera is looking
  //  raycaster.setFromCamera(new Vector2(0, 0), this.camera);

  // Get all objects the ray intersects
  // const intersects = raycaster.intersectObjects(this.scene.children, true);

  // // Loop through all intersected objects
  // for (let i = 0; i < intersects.length; i++) {
  //   // Hide the object
  //   // intersects[i].object.visible = false;
  // }
  // this.controls?.update();

    this.render();
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  //end of class
}

