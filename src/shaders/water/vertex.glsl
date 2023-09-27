varying vec2 vUv;
uniform float uTime;

uniform mat4 uShadowCameraP;
uniform mat4 uShadowCameraV;

varying vec4 vShadowCoord;

float rand(float n){return fract(sin(n) * 43758.5453123);}

//	<https://www.shadertoy.com/view/4dS3Wd>
//	By Morgan McGuire @morgan3d, http://graphicscodex.com
float hash(float n) { return fract(sin(n) * 1e4); }

float noise(float x) {
	float i = floor(x);
	float f = fract(x);
	float u = f * f * (3.0 - 2.0 * f);
	return mix(hash(i), hash(i + 1.0), u);
}

void main()
{
    vUv = uv;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float endFallRiver = smoothstep(0.16, 0.18, vUv.x) * smoothstep(0.32, 0.25, vUv.x);
    float endFallRiverY = smoothstep(0.09, 0.12, vUv.y) * smoothstep(0.91, 0.87, vUv.y);
    modelPosition.y += noise(uTime * 6. + modelPosition.z * 0.4 + modelPosition.x + rand(modelPosition.x)) * endFallRiver * 0.3 * endFallRiverY;
    modelPosition.y -= (1. - endFallRiverY) * 0.05;

    float mainRiver = smoothstep(0.27, 0.32, vUv.x) * smoothstep(0.99, 0.93, vUv.x);
    modelPosition.y += noise(uTime * 2. - noise(modelPosition.x)) * mainRiver * 0.1;

    float deepFallRiver = smoothstep(0.90, 1., vUv.x);
    modelPosition.x += noise(uTime * 2. + modelPosition.y) * deepFallRiver * 0.2;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;

    vShadowCoord = uShadowCameraP * uShadowCameraV * modelMatrix * vec4(position, 1.0);
}