#include <packing>

uniform bool uShadowRender;

varying vec2 vUv;
varying float vElevation;

void main()
{
  if(uShadowRender) {
    gl_FragColor = packDepthToRGBA(gl_FragCoord.z);
  } else {
    gl_FragColor = vec4(vec3(1. - vElevation * 0.08,0.549 - vElevation * 0.09,0.18), 1.);
  }
}