void main()
{
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
  float mask = step(0.5, distanceToCenter);
  gl_FragColor = vec4(vec3(.99, 0.99, 1.), 1. - mask);
}