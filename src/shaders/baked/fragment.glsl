#include <packing>

varying vec2 vUv;

uniform sampler2D uMap;
uniform sampler2D uDepthMap;
varying vec4 vShadowCoord;

void main()
{
  vec3 shadowCoord = vShadowCoord.xyz / vShadowCoord.w * 0.5 + 0.5;
  float depth_shadowCoord = shadowCoord.z;

  vec2 depthMapUv = shadowCoord.xy;
  float depth_depthMap = unpackRGBAToDepth(texture2D(uDepthMap, depthMapUv));

  // Compare and if the depth value is smaller than the value in the depth map, then there is an occluder and the shadow is drawn.
  float shadowFactor = step(depth_shadowCoord, depth_depthMap);

  vec3 shadow = vec3(shadowFactor);
  vec3 bakedColor = texture2D(uMap, vUv).rgb;
  vec3 finalColor = mix(bakedColor - 0.2, bakedColor ,shadow);
  gl_FragColor = vec4(finalColor, 1.);
}