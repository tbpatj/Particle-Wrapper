import ColorRGB from "../classes/ColorRGB";
import Particle from "../classes/Particle";
import { MouseCursor } from "../types/mouse";
import { DefaultedWrapperOptions, WrapperOptions } from "../types/types";

//create a image array and then map through the particles and update the array values with the pixels. This is really efficient for small particles. But as soon as the particles get bigger it bogs down due to not utilizing other optimiaztion techniques
export const renderOptimizedParticles = (
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  canvasWidth: number,
  canvasHeight: number,
  mouse: MouseCursor,
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
  const rPxl = (n: number) => n + canvasWMul;
  //get the next pixel downward
  const dPxl = (n: number) => n - 4;
  //create a circle filling function, we get an index then fill the indecies around it to create what resembles a circle
  const fillCircle = (n: number, radius: number, color: ColorRGB) => {
    //the circles look better when at iteratives .5 than at whole numbers
    radius += 0.5;
    //pre calculate values
    const diameter = radius * 2;
    const radSqr = radius * radius;
    //find a pixel in the corner and we will iterate through a square bound of pixels back to create the circle
    n1 = n - canvasWMul * Math.round(radius) + 4 * Math.round(radius);
    n2 = n1;
    //iterate through one axis
    for (let i = 0; i <= diameter; i++) {
      n1 = dPxl(n1);
      n2 = n1;
      //iterate through perpendicular axis
      for (let t = 0; t <= diameter; t++) {
        const x = i - ~~radius;
        const y = t - ~~radius;
        n2 = rPxl(n2);
        //calculate the pixels squared distance to the center of the circle
        const mag = x * x + y * y;
        //if the squared distance is less than the squared radius then its in the circle
        if (mag < radSqr) {
          updatePxl(
            n2,
            color.R,
            color.G,
            color.B,
            //create a sort of anitaliasing so the circle doesn't look so harsh or like squares for some.
            Math.min(color.A * (radSqr / mag), 255)
          );
        }
      }
    }
  };

  //-------------- iterate through pixels and actually render ----------------
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  //iterate through the particles and display and update each particle
  for (let i = 0; i < particles.length; i++) {
    const p: Particle = particles[i];
    p.updateParticle(mouse, options);
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
      fillCircle(n, p.size, p.color);
    }
  }
  ctx.putImageData(a, 0, 0);
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
    p.updateParticle(mouse, options);
    p.renderParticle(ctx);
  }
};
