// Particles attributes
attribute vec3 instancePosition;
attribute float aSize, aSpeed;

uniform float uTime;

varying vec2 vUv;
varying float vElevation;

void main()
{
    vUv = uv;
    float globalSpeed = 2.;
    float globalElevation = 7.;
    float globalRadius = 0.5;
    
    vec3 pos = position;
    pos += instancePosition;

    // Update size
    float life = fract(-uTime * aSpeed * globalSpeed);
    float size = smoothstep(.0, .7, life) * smoothstep(1., .9, life) * aSize * 1.2;
    pos *= size;

    // Update pos
    float radus = globalRadius - (pos.y * aSpeed * 800. * aSize);
    pos.y += fract(uTime * aSpeed * globalSpeed) * globalElevation;
    vElevation = pos.y;

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
}