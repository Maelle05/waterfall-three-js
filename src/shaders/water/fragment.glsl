#include <packing>

uniform float uTime;
uniform vec3 uRiverBaseColor;
uniform vec3 uRiverLightColor;
uniform sampler2D uNoiseWater;
uniform sampler2D uDepthMap;

varying vec4 vShadowCoord;
varying vec2 vUv;

void main()
{

  // Mix strength - color
  // vec3 color = mix(uRiverBaseColor, uRiverLightColor, strength);

  // FALL part
  vec2 noiseUV = vUv;
  noiseUV.y *= 2.;
  noiseUV.x -= uTime * 0.15;
  vec4 noise = texture2D(uNoiseWater, noiseUV);
  vec3 fallColor = mix(uRiverLightColor, uRiverBaseColor, noise.rgb);

  // MAIN part
  vec2 noiseUVMain = vUv;
  noiseUVMain.x -= uTime * 0.07;
  vec4 noiseMain = texture2D(uNoiseWater, noiseUVMain);
  vec3 mainColor = mix(uRiverLightColor, uRiverBaseColor, noiseMain.rgb);

  // Cut river part
  float topRiver = smoothstep(0.17, 0.07, vUv.x);
  float fallRiver = smoothstep(0.07, 0.12, vUv.x) * smoothstep(0.23, 0.18, vUv.x);
  float mainRiver = smoothstep(0.27, 0.32, vUv.x) * smoothstep(0.99, 0.93, vUv.x);
  float deepFallRiver = smoothstep(0.90, 0.98, vUv.x);

  // Mix
  vec3 fallColorMix =  mix(mix(vec3(.96, 0.96, 1.), fallColor, deepFallRiver), fallColor, fallRiver);
  vec3 finalColor = mix(mix(fallColorMix, mainColor, topRiver), mainColor, mainRiver);

  // Shadow
  vec3 shadowCoord = vShadowCoord.xyz / vShadowCoord.w * 0.5 + 0.5;
  float depth_shadowCoord = shadowCoord.z;

  vec2 depthMapUv = shadowCoord.xy;
  float depth_depthMap = unpackRGBAToDepth(texture2D(uDepthMap, depthMapUv));

  // Compare and if the depth value is smaller than the value in the depth map, then there is an occluder and the shadow is drawn.
  float shadowFactor = step(depth_shadowCoord, depth_depthMap);

  vec3 shadow = vec3(shadowFactor);
  
  vec3 finalShadowColor = mix(finalColor - 0.2, finalColor ,shadow);
  gl_FragColor = vec4(finalShadowColor, 0.97);
}