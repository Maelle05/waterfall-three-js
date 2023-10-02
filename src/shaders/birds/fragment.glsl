#include <packing>

uniform bool uShadowRender;
uniform vec3 uBirdsColor;
uniform sampler2D uBirdTex;

varying vec2 vUv;

void main()
{
  if(uShadowRender) {
    gl_FragColor = packDepthToRGBA(gl_FragCoord.z);
  } else {
    // vec4 mask = texture2D(uBirdTex, vUv);
    // vec4 final = mix(vec4(uBirdsColor, 1.), vec4(uBirdsColor, 0.), mask.r);

    gl_FragColor = vec4(uBirdsColor, 1.);
  }
}