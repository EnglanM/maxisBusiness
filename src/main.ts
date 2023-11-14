import './style.css'
// import { WebGLRenderer } from 'three'
import WebGL from 'three/addons/capabilities/WebGL.js';
import { SetupScene } from './setupScene.ts'
if(WebGL.isWebGLAvailable()){
  const scene = new SetupScene();
  scene.animate();
}
else{
  const warning = WebGL.getWebGLErrorMessage();
  document.body.appendChild(warning);
}

