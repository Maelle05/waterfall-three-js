attribute vec3 instancePosition;
attribute float aGap;

uniform float uTime;

varying vec2 vUv;

void main()
{
    vUv = uv;
    
    vec3 pos = position;
    pos += instancePosition;
    pos += sin(uTime + aGap) * 0.7;

    if(uv.x == 0. && uv.y == 0.) pos.y += sin(uTime * 5. + aGap) * 0.1;
    if(uv.x > .9 && uv.y > .9) pos.y += sin(uTime * 5. + aGap) * 0.1;

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
}