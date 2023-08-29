export const vs = `
attribute vec2 t;
attribute vec4 position;
attribute vec2 texcoord;
uniform vec2 u_resolution;
varying vec2 v_texcoord;
varying vec4 v_color;
varying float v_rad;


void main() {
  vec4 newPos = vec4(t.x,t.y,0,0);
  vec2 zeroToOne = vec2(newPos.x / u_resolution.x, newPos.y / u_resolution.y);
  vec2 zeroToTwo = zeroToOne * 4.0;
  vec2 clipSpace = zeroToTwo - 2.0;
  gl_Position = vec4(clipSpace*vec2(1,-1), 0, 1) + position;
  v_texcoord = texcoord;
  v_color = vec4(1,0,0,1);
  v_rad = 1.0;
}`;

export const fs = `
precision mediump float;
varying vec2 v_texcoord;
varying vec4 v_color;
varying float v_rad;
// uniform vec2 u_aspect_ratio;

float circle(in vec2 st, in float radius) {
  vec2 dist = st - vec2(0.5);
  // dist.y = dist.y * u_aspect_ratio.y;
  // dist.x = dist.x * u_aspect_ratio.x;
  return 1.0 - smoothstep(
     radius - (radius * 0.01),
     radius + (radius * 0.01),
     dot(dist, dist) * 4.0);
}

void main() {
  if (circle(v_texcoord, v_rad) < 0.5) {
    discard;
  }
  gl_FragColor = v_color;
}
`;
