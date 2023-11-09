import './style.css'
import { WebGLRenderer } from 'three'
import { SetupScene } from './setupScene.ts'

const scene = new SetupScene();
scene.animate();
