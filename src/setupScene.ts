import { AmbientLight, BoxGeometry, CameraHelper, CircleGeometry, DirectionalLight, FrontSide, Mesh, PerspectiveCamera, Raycaster, RingGeometry, Scene, Vector2, Vector3, WebGLRenderer } from 'three';
import {  OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import GUI from 'lil-gui';
import gsap from 'gsap';



// Create a new scene
export class SetupScene {
  scene:Scene;
  private camera1:PerspectiveCamera;
  private camera2:PerspectiveCamera;
  activeCamera:PerspectiveCamera;
  renderer:WebGLRenderer;
  controls:OrbitControls|null=null;
  pointsOfInterest:Vector3[]=[];
  private isInside=false;
  private goingInside=false;
  private goingOutside=false;
  private clickedTheSamePoint: boolean=true; 

  constructor() {
    this.scene = new Scene();
    this.renderer = this.setupRenderer();
    this.camera1 = this.setupInitialCamera1()
    this.camera2 = this.setupInitialCamera2()
    this.activeCamera = this.camera1;
    this.setupEnvironment();
  }


   //add points of interest into an array
   addPointsOfInterest() {
    this.pointsOfInterest.push(new Vector3(0.2711780047965805,0,-0.83912124));
    this.pointsOfInterest.push(new Vector3(0.750271064479500,0, -0.73082347791832));
    this.pointsOfInterest.push(new Vector3(1.108568400698858,0, -0.131983317977806));
    this.pointsOfInterest.push(new Vector3(-0.00020868769107504904,0,-0.0748681163292408));
  }


  // Create a new camera
  setupInitialCamera1() {
    const camera = new PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(20,10, -3);
    camera.updateProjectionMatrix();
    camera.name="camera1";
    this.addControls(camera);
    return camera;
  }

  setupInitialCamera2() {
    const camera = new PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0.2711780047965805,0.2,-0.83912124);
    camera.name="camera2";
    camera.rotation.x=-Math.PI;
    camera.rotation.z=-Math.PI;
    camera.updateProjectionMatrix();
    return camera;
  }

  //create camera outside the model
  firstCameraTransition() {
    this.activeCamera.lookAt(0,0,0);
    gsap.to(this.activeCamera.position, {
      x: 4.5,
      y: 2.435859853080808,
      z: -3.6145604307786923,
      duration: 5,
      onUpdate: () => {
        this.activeCamera.updateProjectionMatrix();
      },
    });

  }

  //create camera inside the model
   putCamerasInPlace() {
    this.camera1.position.set(4.5,2.435859853080808,-3.6145604307786923,);
    this.camera1.lookAt(0,0,0);
    this.camera2.position.set(0.2711780047965805,0.2,-0.83912124);
    this.camera2.lookAt(0,0,0);
    this.camera2.rotation.x=-Math.PI;
    this.camera2.rotation.z=-Math.PI;
  }
    

  // Create a new renderer
  setupRenderer() {
    const renderer = new WebGLRenderer({antialias:true,logarithmicDepthBuffer:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return renderer;
  }
 
 async setupEnvironment() {
    //add a model 
    await this.modelLoader();
    this.firstCameraTransition();
    
    window.addEventListener('resize', () => {
      this.activeCamera.aspect = window.innerWidth / window.innerHeight;
      this.activeCamera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.render();
    });
    this.addPointsOfInterest();
    if(!this.goingInside && !this.goingOutside){
      this.putCamerasInPlace();
    }
  
    const button= document.getElementById("inside");
    //we will use this to check if the click is meant for the button or for the position of the camera
    let buttonIsClicked=false;
    //event listener to get inside and outside the model using the button
    if(button){
      button.addEventListener('click', async() => {
        buttonIsClicked=true;
        if(!this.isInside)
        {
          this.isInside=true;
          this.goingInside=true;
          button.innerHTML="Go Outside!";
          button.setAttribute('disabled', 'true');
        }
        else{
          this.isInside=false;
          this.goingOutside=true;
          button.innerHTML="Go Inside!";
          button.setAttribute('disabled', 'true');
        }
      });
    }
     //event listener to move around when we are inside the model
     const raycaster = new Raycaster();
     const pointer = new Vector2();

    window.addEventListener('click', (event) => {
      if(this.clickedTheSamePoint && buttonIsClicked===false){
        
        pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        raycaster.setFromCamera( pointer, this.activeCamera );
   
       // calculate objects intersecting the picking ray
       const intersects = raycaster.intersectObjects( this.scene.children );
       let currentPoint= intersects[0].point;

       if(!this.isInside){
        this.isInside=true;
        this.goingInside=true;
        this.goingOutside=false;
        // this.setupInsideCamera();
        // this.moveCameraToPointOfInterest(currentPoint);
       }
       else if(this.isInside){
        const nextPoint= this.decideWheretoMove(currentPoint);
        this.moveCameraToPointOfInterest(nextPoint);
        currentPoint=nextPoint;
       }
      }
      else if(buttonIsClicked===true){
        buttonIsClicked=false;
      }
    });

    //event listener to move the camera when we are inside the model
    const mouse = new Vector2();
    let isMouseDown = false;
    let click= new Vector2;

    //event listeners to rotate the camera
    document.addEventListener('mousemove',(event)=>{
      if (isMouseDown) {
          const deltaX = (event.clientX - mouse.x) * 0.0008;  
          this.activeCamera.rotation.y += deltaX;
      }
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      
  });

    document.addEventListener('mousedown', (event) => {
      if(isMouseDown==false){
        click.x = event.clientX;
        click.y = event.clientY;
        isMouseDown = true;
      }
    });

    document.addEventListener('mouseup', (event) => {
     isMouseDown = false;
     if(click.x!=event.clientX || click.y!=event.clientY){
      this.clickedTheSamePoint=false;
     }
     else{
      this.clickedTheSamePoint=true;
     }
    });
    //event listeners to zoom in and out of the activeCamera
    window.addEventListener('wheel', (event) => {
      const zoomFactor = 1 + event.deltaY * 0.0005;
      this.activeCamera.fov /= zoomFactor;
      this.activeCamera.fov = Math.max(30, Math.min(100, this.activeCamera.fov));
      this.activeCamera.updateProjectionMatrix();
    });

    //add a light
    this.addDirectionalLight();
    //setup dat.gui
    // this.setupDatGui();

  }


  //add orbit controls to the camera
  addControls(camera:PerspectiveCamera) {
    this.controls = new OrbitControls(camera, this.renderer.domElement);
    this.controls.maxPolarAngle = 1.354663921094003 ;
    this.controls.minPolarAngle = 0;
    this.controls.zoomToCursor=true;
    this.controls.update();
  }
  private switchTo(camera:PerspectiveCamera){
      this.activeCamera=camera;
  }

  //move the camera to the point of interest
  moveCameraToPointOfInterest(position:Vector3) {
      gsap.to(this.activeCamera.position, {
        x: position.x,
        y: position.y+0.2,
        z: position.z,
        duration: 5,
        onUpdate: () => {
          this.activeCamera.updateProjectionMatrix();
        },
      })
  }

  
  decideWheretoMove(position:Vector3){
    let min =99999;
    let index=0;
    this.pointsOfInterest.forEach((point) =>{
      if(point!=position){
        const distance=position.distanceTo(point);
        if(distance<min){
          min= distance;
          index=this.pointsOfInterest.indexOf(point);
        }
      }

    })
    return this.pointsOfInterest[index];
  }

  addDirectionalLight() {
    // Add ambient light
    const ambientLight = new AmbientLight(0xffffff, 3);
    this.scene.add(ambientLight);

    // Add directional light
    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 0);
    this.scene.add(directionalLight);
  }

  async modelLoader() { 
    
    const loader= new GLTFLoader();
    loader.load('../public/media/1103.glb', (glb)=>{
      let nr=-1;
      glb.scene.traverse((child)=> {
        if (child instanceof Mesh) {
          nr+=1;
          child.material.side = FrontSide;
          // console.log(child.material.name);

          // if(nr >= 20 && nr <= 40 ) { (0x00ff00); 
          // }
          if(nr >=100 && nr != 108 && nr != 109 && nr != 110 && nr != 111 && nr != 112 && nr != 113 && nr != 114 && nr != 115 && nr != 122 && nr != 123 && nr != 124 && nr != 125 && nr != 126 && nr != 127 && nr != 128 && nr != 129 && nr != 130 && nr != 131 && nr != 132 && nr != 133  && nr != 134 && nr != 135  
            && nr != 136 && nr != 137 && nr != 157 && nr != 158 && nr != 159 && nr != 164 && nr != 173 && nr != 174 && nr != 175 && nr != 176) {
            if(child.material.name==`d34ed4d299ea4d2eb441633630e4a4d0_${nr}.jpg`){
              // console.log('found');
              child.visible=false;
              child.material.color.set(0x00ff00);
              
            }
          }
          
        }
      });
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
    cameraFolder.add(this.camera2.position, 'x', -10, 10).step(0.1);
    cameraFolder.add(this.camera2.position, 'y', -10, 10).step(0.1);
    cameraFolder.add(this.camera2.position, 'z', -10, 10).step(0.1);
    cameraFolder.add(this.camera2.rotation, 'x', -Math.PI, Math.PI).step(0.01);
    cameraFolder.add(this.camera2.rotation, 'y', -Math.PI, Math.PI).step(0.01);
    cameraFolder.add(this.camera2.rotation, 'z', -Math.PI, Math.PI).step(0.01);
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
    this.controls?.update();
    //managing the camera
    //when going inside
    if(this.goingInside && !this.goingOutside){
      // console.log("going inside: "+this.goingInside+this.goingOutside+" active camera position: "+this.activeCamera.position.x+" "+this.activeCamera.position.y+" "+this.activeCamera.position.z)
      if(this.activeCamera.position.distanceTo(this.camera2.position)>0.1){
        const t=0.01;
        this.activeCamera.position.lerp(this.camera2.position,t);
      }
      if(this.activeCamera.position.distanceTo(this.camera2.position)<0.1){
        this.switchTo(this.camera2);
        this.goingInside=false;
        this.putCamerasInPlace();
        document.getElementById("inside")?.removeAttribute('disabled');
        // console.log("switching to camera 2: ");
        // console.log(this.activeCamera);
      }
    }//when going outside
    else if(!this.goingInside && this.goingOutside){
      // console.log("going outside: "+this.goingInside+this.goingOutside+" active camera position: "+this.activeCamera.position.x+" "+this.activeCamera.position.y+" "+this.activeCamera.position.z)

      if(this.activeCamera.position.distanceTo(this.camera1.position)>0.1){
        this.activeCamera.lookAt(0,0,0);
        const t=0.01;
        this.activeCamera.position.lerp(this.camera1.position,t);
      }
      if(this.activeCamera.position.distanceTo(this.camera1.position)<0.1){
        this.switchTo(this.camera1);
        this.goingOutside=false;
        this.putCamerasInPlace();
        document.getElementById("inside")?.removeAttribute('disabled');
        // console.log("switching to camera 1: ");
        // console.log(this.activeCamera);
      }
    }


    this.render();
  }

  private render() {
    this.renderer.render(this.scene, this.activeCamera);
  }

  //end of class
}

