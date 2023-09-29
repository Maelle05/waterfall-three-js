#include <packing>

uniform bool uShadowRender;
uniform vec3 uBirdsColor;

varying vec2 vUv;

void main()
{
  if(uShadowRender) {
    gl_FragColor = packDepthToRGBA(gl_FragCoord.z);
  } else {
    gl_FragColor = vec4(uBirdsColor, 1.);
  }
}