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
import birdsVertexShader from './shaders/birds/vertex.glsl'
import birdsFragmentShader from './shaders/birds/fragment.glsl'
import bakedVertexShader from './shaders/baked/vertex.glsl'
import bakedFragmentShader from './shaders/baked/fragment.glsl'
import flamesVertexShader from './shaders/flames/vertex.glsl'
import flamesFragmentShader from './shaders/flames/fragment.glsl'
import { seededRandom } from 'three/src/math/MathUtils'

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
  birdsColor: '#594040'
}
gui.close()

// Utils
function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// Dom loader
const loader = document.querySelector('.loader')
const progress = document.querySelector('.loader > .progressContainer > span')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
const manager = new THREE.LoadingManager();
// Texture loader
const textureLoader = new THREE.TextureLoader(manager)

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(manager)
gltfLoader.setDRACOLoader(dracoLoader)

manager.onProgress = ( url, itemsLoaded, itemsTotal) => {
  console.log(itemsTotal, itemsLoaded);
  progress.style.width = (itemsLoaded * 100 / itemsTotal) + '%'
}
manager.onLoad = () => {
  loader.style.opacity = 0
}

/**
 * Textures
 */
const bakedTexture = textureLoader.load('baking maeelllle 11.4.png',
  () => {
    console.log('Texture load ✨')
  }
)
bakedTexture.flipY = false
const noiseWaterTexture = textureLoader.load('textureWater.jpg')
noiseWaterTexture.wrapS = THREE.RepeatWrapping;
noiseWaterTexture.wrapT = THREE.RepeatWrapping;

/**
 * Light
 */
const light = new THREE.DirectionalLight( 0xffffff, 1.0 );
//　The light is directed from the light's position to the origin of the world coordinates.
light.position.set(3.36008, 4.6119, -3.38262);
light.lookAt( 0, 0, 0)
const frustumSize = 10;
light.shadow.camera = new THREE.OrthographicCamera( -frustumSize / 2, frustumSize / 2, frustumSize / 2, -frustumSize / 2, 1, 12 );
light.shadow.camera.position.copy(light.position);
light.shadow.camera.lookAt(scene.position);
// scene.add(light.shadow.camera);
// const helper = new THREE.CameraHelper( light.shadow.camera, 5 );
// scene.add( helper );
light.shadow.mapSize.x = 2048;
light.shadow.mapSize.y = 2048;
const pars = { 
  minFilter: THREE.NearestFilter,
  magFilter: THREE.NearestFilter, 
  format: THREE.RGBAFormat
};
light.shadow.map = new THREE.WebGLRenderTarget( light.shadow.mapSize.x, light.shadow.mapSize.y, pars );


/**
 * Materials
 */
const shadowUniforms = {
  uDepthMap: {
      value: light.shadow.map.texture
  },
  uShadowCameraP: {
      value: light.shadow.camera.projectionMatrix
  },
  uShadowCameraV: {
      value: light.shadow.camera.matrixWorldInverse
  }
}
const bakedMaterial = new THREE.ShaderMaterial({ 
  uniforms: {...shadowUniforms, uMap: { value: bakedTexture}},
  vertexShader: bakedVertexShader,
  fragmentShader: bakedFragmentShader,
})
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms:
  {
    ...shadowUniforms,
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

const birdsMaterial = new THREE.ShaderMaterial({
  uniforms:
  {
    uTime: { value: 0 },
    uShadowRender: { value: false },
    uBirdsColor: { value: new THREE.Color(debugObject.birdsColor) }
  },
  vertexShader: birdsVertexShader,
  fragmentShader: birdsFragmentShader,
  side: THREE.DoubleSide,
})

const flamesMaterial = new THREE.ShaderMaterial({
  uniforms:
  {
    uShadowRender: { value: false },
    uTime: { value: 0 },
  },
  vertexShader: flamesVertexShader,
  fragmentShader: flamesFragmentShader,
})

/**
 * Objects
 */
let kayak = null
let bird = null
let flame = null

/**
 * Model
 */
gltfLoader.load(
  'waterfallV4.5.glb',
  (gltf) =>
  {
    gltf.scene.traverse((child) => {
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

      if (child.name === 'Bird') {
        bird = child
        initBirds()
      }

      if(child.name === 'Fire') {
        flame = child
        initFlame()
      }
    })
    bird.removeFromParent()
    flame.removeFromParent()
    scene.add(gltf.scene)
    console.log('Gltf load ✨')
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
 * Birds
 */
let birdGeometry = null
const birdsCount = 10
const birdsPositionArray = new Float32Array(birdsCount * 3)
const birdsGapArray = new Float32Array(birdsCount)
let birds = null

let birdsMoveStep = 0
let birdsPoss = null
let birdsTargetPos = null
const initBirds = () => {
  /* Ici il fallait recréer un géométrie instanciée, et lui
  passer les index et attributs de la géométrie chargée
  et définier le nombre d'instance sur la géométrie */
  birdGeometry = new THREE.InstancedBufferGeometry();
  birdGeometry.index = bird.geometry.index;
  birdGeometry.attributes = bird.geometry.attributes;
  birdGeometry.instanceCount = birdsCount;
  
  for(let i = 0; i < birdsCount; i++)
  {
    birdsPositionArray[i * 3 + 0] = (Math.random() - 0.5)
    birdsPositionArray[i * 3 + 1] = Math.random()
    birdsPositionArray[i * 3 + 2] = (Math.random() - 0.5)
    const gap = Math.random()
    birdsGapArray[i] = gap
  }

  /* Ici il fallait remplacer le BufferAttribute par un 
  InstanceBufferAttribute, sinon les attributs que tu définies
  ils seront pour chaque point, et pas pour tous les points
  qui composent une seule instance */
  birdGeometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(birdsPositionArray, 3))
  birdGeometry.setAttribute('aGap', new THREE.InstancedBufferAttribute(birdsGapArray, 1))

  var center = new THREE.Vector3();
  birdGeometry.computeBoundingBox();
  birdGeometry.boundingBox.getCenter(center);
  birdGeometry.center();
  
  birds = new THREE.Mesh(birdGeometry, birdsMaterial)
  birds.position.copy(center);
  birds.scale.x = 0.7
  birds.scale.y = 0.7
  birds.scale.z = 0.7

  scene.add(birds)

  const birdsGui = gui.addFolder('Birds')
  birdsGui.addColor(debugObject, 'birdsColor').onChange(()=>{
    birdsMaterial.uniforms.uBirdsColor.value = new THREE.Color(debugObject.birdsColor)
  })
}
// Create random Spline for birds annim
const initialPoints = []
const nbPointsCurve = 8
for (let i = 0; i < nbPointsCurve; i++) {
  initialPoints.push({
    x: (seededRandom(3 + i) - 0.5) * 5 + 1.5,
    y: seededRandom(100 + i) * 1.5 + 1.3,
    z: (seededRandom(4 + i) - 0.5) * 4 
  })
}

// create cube for each point of the curve
const boxGeometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 )
const boxMaterial = new THREE.MeshBasicMaterial({ color: 'red'})
const curveHandles = []
for ( const handlePos of initialPoints ) {
  const handle = new THREE.Mesh( boxGeometry, boxMaterial )
  handle.position.copy( handlePos )
  curveHandles.push( handle )
}
// Calculate Smooth curve
const curve = new THREE.CatmullRomCurve3(
  curveHandles.map( ( handle ) => handle.position )
)
curve.curveType = 'catmullrom'
curve.closed = true
curve.tension = 1.5
const points = curve.getPoints( 80 )
const line = new THREE.LineLoop(
  new THREE.BufferGeometry().setFromPoints( points ),
  new THREE.LineBasicMaterial( { color: 0xff0000 } )
)
// scene.add(line)


/**
 * Flame
 */
let flameGeometry = null
const flamesCount = 50
const flamesPositionArray = new Float32Array(flamesCount * 3)
const flamesSizeArray = new Float32Array(flamesCount)
const flamesSpeedArray = new Float32Array(flamesCount)
let flames = null

const initFlame = () => {
  flameGeometry = new THREE.InstancedBufferGeometry();
  flameGeometry.index = flame.geometry.index;
  flameGeometry.attributes = flame.geometry.attributes;
  flameGeometry.instanceCount = flamesCount;
  
  for(let i = 0; i < flamesCount; i++)
  {
    flamesPositionArray[i * 3 + 0] = (Math.random() - 0.5) * 2.7
    flamesPositionArray[i * 3 + 1] = -0.2
    flamesPositionArray[i * 3 + 2] = (Math.random() - 0.5) * 2.7
    flamesSizeArray[i] = randFloat(0.5, 1.0)
    flamesSpeedArray[i] = randFloat(0.5, 1.0)
  }

  flameGeometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(flamesPositionArray, 3))
  flameGeometry.setAttribute('aSize', new THREE.InstancedBufferAttribute(flamesSizeArray, 1))
  flameGeometry.setAttribute('aSpeed', new THREE.InstancedBufferAttribute(flamesSpeedArray, 1))

  var center = new THREE.Vector3();
  flameGeometry.computeBoundingBox();
  flameGeometry.boundingBox.getCenter(center);
  flameGeometry.center();
  
  flames = new THREE.Mesh(flameGeometry, flamesMaterial)
  flames.position.copy(center);
  flames.position.z += 2.88
  flames.position.y += 0.2
  flames.position.x -= 0.68
  flames.scale.x = 0.06
  flames.scale.y = 0.06
  flames.scale.z = 0.06

  scene.add(flames)
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
camera.position.x = 7.10
camera.position.y = 4
camera.position.z = 9
camera.lookAt(new THREE.Vector3(-0.5, 0.7, 0));
scene.add(camera)
const camGui = gui.addFolder('Camera')
camGui.add(camera.position, 'x', 0, 10)
camGui.add(camera.position, 'y', 0, 10)
camGui.add(camera.position, 'z', 0, 20)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set( -0.5, 0, -0.5 );
controls.maxPolarAngle = Math.PI / 2.3
controls.minPolarAngle = Math.PI / 4
controls.minAzimuthAngle = - Math.PI / 17;
controls.maxAzimuthAngle = Math.PI;
controls.enableDamping = true
// controls.enableZoom = false

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
    birdsMaterial.uniforms.uTime.value = elapsedTime
    flamesMaterial.uniforms.uTime.value = elapsedTime

    // Update kayak
    if (kayak) {
      kayak.position.z = Math.sin(elapsedTime) * 0.4
      kayak.position.y = Math.sin(elapsedTime * 1.3 - 1.6) * 0.05 + 0.64
      kayak.position.x = Math.sin(elapsedTime * 0.5) + 0.7

      kayak.rotation.y = 59.6 + Math.sin(elapsedTime) * 0.3
    }
    // Update birds
    if (birds) {
      birdsPoss = curve.getPointAt(birdsMoveStep)
      const birdsNextPos = (birdsMoveStep + 0.0004) % 1
      birdsTargetPos = curve.getPointAt(birdsNextPos)
      birdsMoveStep = birdsNextPos
      birds.position.copy(birdsPoss)
      birds.lookAt(birdsTargetPos)
    }

    // Render
    if(light) {
      birdsMaterial.uniforms.uShadowRender.value = false
      flamesMaterial.uniforms.uShadowRender.value = false
      renderer.render(scene, camera) 
      birdsMaterial.uniforms.uShadowRender.value = true
      flamesMaterial.uniforms.uShadowRender.value = true
      renderer.setRenderTarget(light.shadow.map);
      renderer.render(scene, light.shadow.camera);
      renderer.setRenderTarget(null);
    }

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()