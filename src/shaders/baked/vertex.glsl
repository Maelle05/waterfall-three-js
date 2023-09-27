uniform mat4 uShadowCameraP;
uniform mat4 uShadowCameraV;

varying vec4 vShadowCoord;
varying vec2 vUv;

void main()
{
  vUv = uv;
  vec3 pos = position;

  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;
  vShadowCoord = uShadowCameraP * uShadowCameraV * modelMatrix * vec4(pos, 1.0);
}