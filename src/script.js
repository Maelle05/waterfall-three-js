import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// Shaders
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'
import riptideVertexShader from './shaders/riptide/vertex.glsl'
import riptideFragmentShader from './shaders/riptide/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({
    width: 200
})
const debugObject = {
  clearColor: '#f0C5b2',
  riverBaseColor: '#b9eadd',
  riverLightColor: '#b6dee4',
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const bakedTexture = textureLoader.load('baking maeelllle 8.2.png')
bakedTexture.flipY = false
bakedTexture.colorSpace = THREE.SRGBColorSpace
const noiseWaterTexture = textureLoader.load('textureWater.jpg')
noiseWaterTexture.wrapS = THREE.RepeatWrapping;
noiseWaterTexture.wrapT = THREE.RepeatWrapping;

/**
 * Materials
 */
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms:
  {
      uTime: { value: 0 },
      uRiverBaseColor: { value: new THREE.Color(debugObject.riverBaseColor) },
      uRiverLightColor: { value: new THREE.Color(debugObject.riverLightColor) },
      uNoiseWater: { value: noiseWaterTexture }
  },
})
const riptideMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms:
  {
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
  },
  vertexShader: riptideVertexShader,
  fragmentShader: riptideFragmentShader
})

/**
 * Objects
 */
let kayak = null 

/**
 * Model
 */
gltfLoader.load(
  'waterfallV1.3.glb',
  (gltf) =>
  {
    gltf.scene.traverse((child) =>
    {
        if (child.name === 'River') {
          child.material = waterMaterial
          initRiver()
        } else {
          child.material = bakedMaterial
        }

        if (child.name === 'Kayak') {
          kayak = child
          initKayak()
        }
        
    })
    scene.add(gltf.scene)
  }
)

/**
 * River
 */
const initRiver = () => {
  const riverGui = gui.addFolder('River')
  riverGui.addColor(debugObject, 'riverBaseColor').onChange(()=>{
    waterMaterial.uniforms.uRiverBaseColor.value = new THREE.Color(debugObject.riverBaseColor)
  })
  riverGui.addColor(debugObject, 'riverLightColor').onChange(()=>{
    waterMaterial.uniforms.uRiverLightColor.value = new THREE.Color(debugObject.riverLightColor)
  })
}

/**
 * Riptide
 */
// Geometry
const riptideGeometry = new THREE.BufferGeometry()
const riptideCount = 2000
const positionArray = new Float32Array(riptideCount * 3)
const scaleArray = new Float32Array(riptideCount)

for(let i = 0; i < riptideCount; i++)
{
  positionArray[i * 3 + 0] = (Math.random() - 0.5) * 0.7 - 3.25
  positionArray[i * 3 + 1] = Math.random() * 0.7 + 0.3
  positionArray[i * 3 + 2] = (Math.random() - 0.5) * 3
  scaleArray[i] = Math.random()
}

riptideGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
riptideGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))
const riptide = new THREE.Points(riptideGeometry, riptideMaterial)
scene.add(riptide)


/**
 * Kayak
 */
const initKayak = () => {
  // Debug
  const kayakGui = gui.addFolder('Kayak')
  kayakGui.add(kayak.position, 'x', -5, 8)
  kayakGui.add(kayak.position, 'y', 0, 10)
  kayakGui.add(kayak.position, 'z', 0, 10)

  // Set pos
  kayak.position.x = -0.75
  kayak.position.y = 0.65

  // Set rotation
  kayak.rotation.y = 60
}


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Update uniforms
    riptideMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 7
camera.position.y = 6
camera.position.z = 9
scene.add(camera)
const camGui = gui.addFolder('Camera')
camGui.add(camera.position, 'x', 0, 10)
camGui.add(camera.position, 'y', 0, 10)
camGui.add(camera.position, 'z', 0, 10)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(debugObject.clearColor)
const rendGui = gui.addFolder('Render')
rendGui.addColor(debugObject, 'clearColor')
       .onChange(() => {  renderer.setClearColor(debugObject.clearColor) })

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Update materials
    waterMaterial.uniforms.uTime.value = elapsedTime
    if(riptideMaterial) riptideMaterial.uniforms.uTime.value = elapsedTime

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()