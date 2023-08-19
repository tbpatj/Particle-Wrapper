import ColorRGB from "../classes/ColorRGB";
import Particle from "../classes/Particle";
import { MouseCursor } from "../types/mouse";
import { DefaultedWrapperOptions, WrapperOptions } from "../types/types";
import { ParticleQueue, assignParticleQueue } from "./particleQueue";
var test = 0;
let d = 0;
let pxlN = 0;
const outlineCircleAlgorithm = (
  centerX: number,
  centerY: number,
  radius: number,
  canvasWidth: number,
  rPxl: (n: number) => number,
  rPxlA: (n: number, A: number) => number,
  dPxl: (n: number) => number,
  dPxlA: (n: number, A: number) => number,
  updtPxl: (n: number, R: number, G: number, B: number, A: number) => void,
  c: ColorRGB
) => {
  d = (5 - radius * 4) / 4;
  let x = 0;
  let y = radius;
  pxlN = (~~centerX + ~~centerY * canvasWidth) * 4;
  // pxlN = (~~(x + centerX) + ~~(-y + centerY) * canvasWidth) * 4;
  for (x = 0; x <= y; x++) {
    // updtPxl(pxlN, 0, 0, 0, 255);
    updtPxl(dPxlA(rPxlA(pxlN, x), y), c.R, c.G, c.B, c.A);
    updtPxl(dPxlA(rPxlA(pxlN, x), -y), c.R, c.G, c.B, c.A);
    updtPxl(dPxlA(rPxlA(pxlN, -x), y), c.R, c.G, c.B, c.A);
    updtPxl(dPxlA(rPxlA(pxlN, -x), -y), c.R, c.G, c.B, c.A);
    updtPxl(dPxlA(rPxlA(pxlN, y), x), c.R, c.G, c.B, c.A);
    updtPxl(dPxlA(rPxlA(pxlN, y), -x), c.R, c.G, c.B, c.A);
    updtPxl(dPxlA(rPxlA(pxlN, -y), x), c.R, c.G, c.B, c.A);
    updtPxl(dPxlA(rPxlA(pxlN, -y), -x), c.R, c.G, c.B, c.A);
    if (d <= 0) {
      d += 2 * x + 1;
    } else {
      d += 2 * (x - y) + 1;
      y--;
    }
  }
};

const fillCircleAlgorithm = (
  centerX: number,
  centerY: number,
  radius: number,
  canvasWidth: number,
  rPxl: (n: number) => number,
  rPxlA: (n: number, A: number) => number,
  dPxl: (n: number) => number,
  dPxlA: (n: number, A: number) => number,
  updtPxl: (n: number, R: number, G: number, B: number, A: number) => void,
  c: ColorRGB
) => {
  let x = 0;
  let y = radius;
  let p = (5 - radius * 4) / 4;
  pxlN = (~~centerX + ~~centerY * canvasWidth) * 4;
  while (x < y) {
    for (let j = 0; j <= x; j++) {
      updtPxl(dPxlA(rPxlA(pxlN, j), y), c.R, c.G, c.B, c.A);
      updtPxl(dPxlA(rPxlA(pxlN, j), -y), c.R, c.G, c.B, c.A);
      if (j !== 0) {
        updtPxl(dPxlA(rPxlA(pxlN, -j), y), c.R, c.G, c.B, c.A);
        updtPxl(dPxlA(rPxlA(pxlN, -j), -y), c.R, c.G, c.B, c.A);

        updtPxl(dPxlA(rPxlA(pxlN, y), j), c.R, c.G, c.B, c.A);
        updtPxl(dPxlA(rPxlA(pxlN, -y), -j), c.R, c.G, c.B, c.A);
      }
      updtPxl(dPxlA(rPxlA(pxlN, y), -j), c.R, c.G, c.B, c.A);
      updtPxl(dPxlA(rPxlA(pxlN, -y), j), c.R, c.G, c.B, c.A);
    }
    if (p < 0) {
      p += 2 * x + 1;
    } else {
      p += 2 * (x - y) + 1;
      y--;
    }

    x++;
  }
  // console.log(x);
  for (let t = 0; t < x; t++) {
    for (let j = 0; j < x; j++) {
      updtPxl(dPxlA(rPxlA(pxlN, -t), j), c.R, c.G, c.B, c.A);
      if (j !== 0) updtPxl(dPxlA(rPxlA(pxlN, -t), -j), c.R, c.G, c.B, c.A);
      if (t !== 0) updtPxl(dPxlA(rPxlA(pxlN, t), j), c.R, c.G, c.B, c.A);
      if (j !== 0 && t !== 0) {
        updtPxl(dPxlA(rPxlA(pxlN, t), -j), c.R, c.G, c.B, c.A);
      }
    }
  }
};

//create a image array and then map through the particles and update the array values with the pixels. This is really efficient for small particles. But as soon as the particles get bigger it bogs down due to not utilizing other optimiaztion techniques
export const renderOptimizedParticles = (
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  canvasWidth: number,
  canvasHeight: number,
  mouse: MouseCursor,
  queue: ParticleQueue[],
  groups: { [key: string]: number },
  removeGroups: { [key: string]: string },
  options: DefaultedWrapperOptions
) => {
  let b: Uint8ClampedArray,
    a,
    n,
    n1,
    n2,
    alpha1,
    alpha2 = 0;
  //create the new image array
  b = (a = ctx.createImageData(canvasWidth, canvasHeight)).data;
  const length = (canvasWidth * canvasHeight + canvasWidth) * 4;
  //create a function to update the color channels at a specific N
  const updatePxl = (n: number, R: number, G: number, B: number, A: number) => {
    if (n > 0 && n < length) {
      //blend the previous alpha value with this new alpha value
      const a0 = (255 - b[n + 3]) * (A / 255) + b[n + 3];
      b[n + 3] = a0;
      b[n] = R;
      b[n + 1] = G;
      b[n + 2] = B;
    }
  };
  //pre-calculate the number needed to go to the right that way we don't calculate it in every loop
  const canvasWMul = canvasWidth * 4;
  //get the next pixel to the right
  const rPxl = (n: number) => n + 4;
  const rPxlA = (n: number, A: number) => n + 4 * A;
  //get the next pixel downward
  const dPxl = (n: number) => n + canvasWMul;
  const dPxlA = (n: number, A: number) => n + canvasWMul * A;
  //create a circle filling function, we get an index then fill the indecies around it to create what resembles a circle

  //-------------- iterate through pixels and actually render ----------------
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  //iterate through the particles and display and update each particle
  for (let i = 0; i < particles.length; i++) {
    const p: Particle = particles[i];
    p.updateParticle(mouse, canvasWidth, canvasHeight, options);
    if (p.group && removeGroups[p.group]) {
      p.dest = undefined;
      p.group = undefined;
      p.size = 0.5;
    }
    if (!p.dest && queue.length > 0) {
      // checkParticleAgainstQueue(p, i, queue);
      assignParticleQueue(p, queue);
    }
    if (
      p.pos.x + 5 < canvasWidth &&
      p.pos.y < canvasHeight &&
      p.pos.x - 5 > 0 &&
      p.pos.y > 0
    ) {
      n = (~~p.pos.x + ~~p.pos.y * canvasWidth) * 4;
      n1 = n;
      n2 = n1;
      // updatePxl(n1, p.color.R, p.color.G, p.color.B, p.color.A);
      // if (p.size > 0.9) fillCircle(n, p.size, p.color);
      if (p.size > 0.5)
        fillCircleAlgorithm(
          p.pos.x,
          p.pos.y,
          p.size,
          canvasWidth,
          rPxl,
          rPxlA,
          dPxl,
          dPxlA,
          updatePxl,
          p.color
        );
      else updatePxl(n1, p.color.R, p.color.G, p.color.B, p.color.A);
      // updatePxl(n1, p.color.R, p.color.G, p.color.B, p.color.A);
    }
  }
  ctx.putImageData(a, 0, 0);
  test += 0.08;
};

//run a basic particle loop with the default rendering implemented in the particles class
export const runParticleLoop = (
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  canvasWidth: number,
  canvasHeight: number,
  mouse: MouseCursor,
  options: DefaultedWrapperOptions
) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  //iterate through the particles and display each particle
  for (let i = 0; i < particles.length; i++) {
    const p: Particle = particles[i];
    p.updateParticle(mouse, canvasWidth, canvasHeight, options);
    p.renderParticle(ctx);
  }
};
