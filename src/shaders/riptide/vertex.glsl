attribute float aScale;

uniform float uPixelRatio;
uniform float uTime;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.y += sin(uTime * 5. + modelPosition.x * 10.0) * aScale * 0.2 - modelPosition.x - 3.1;
    modelPosition.x += clamp(sin(uTime * 2. + modelPosition.y + aScale * 10.), 0., 1.) * 0.4;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    gl_PointSize = 100. * aScale * uPixelRatio;
    gl_PointSize *= (1.0 / - viewPosition.z);
}