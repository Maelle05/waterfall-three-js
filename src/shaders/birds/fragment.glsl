#include <packing>

uniform bool uShadowRender;

varying vec2 vUv;

void main()
{
  if(uShadowRender) {
    gl_FragColor = packDepthToRGBA(gl_FragCoord.z);
  } else {
    gl_FragColor = vec4(vec3(0., 0., 0.), 1.);
  }
}