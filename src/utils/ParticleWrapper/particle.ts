import ColorRGB from "../../classes/ColorRGB";
import Particle from "../../classes/Particle";
export const renderOptimizedParticles = (
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  canvasWidth: number,
  canvasHeight: number
) => {
  let b: Uint8ClampedArray,
    a,
    n,
    n1,
    n2,
    alpha1,
    alpha2 = 0;

  b = (a = ctx.createImageData(canvasWidth, canvasHeight)).data;
  const length = (canvasWidth * canvasHeight + canvasWidth) * 4;
  const updatePxl = (n: number, R: number, G: number, B: number, A: number) => {
    if (n > 0 && n < length) {
      //blend the previous alpha value to this alpha value
      const a0 = (255 - b[n + 3]) * (A / 255) + b[n + 3];
      b[n + 3] = a0;
      b[n] = R;
      b[n + 1] = G;
      b[n + 2] = B;
    }
  };
  //get the next pixel to the right
  const rPxl = (n: number) => n + canvasWMul;
  //   const lPxl = (n:number) => n - canvasWMul
  //   const uPxl = (n:number) => n + 4
  const dPxl = (n: number) => n - 4;
  const canvasWMul = canvasWidth * 4;
  const fillCircle = (n: number, radius: number, color: ColorRGB) => {
    radius += 0.5;
    const diameter = radius * 2;
    const radSqr = radius * radius;
    n1 = n - canvasWMul * Math.round(radius) + 4 * Math.round(radius);
    n2 = n1;
    for (let i = 0; i <= diameter; i++) {
      n1 = dPxl(n1);
      n2 = n1;
      for (let t = 0; t <= diameter; t++) {
        const x = i - ~~radius;
        const y = t - ~~radius;
        n2 = rPxl(n2);
        const mag = x * x + y * y;
        if (mag < radSqr) {
          // console.log(x)
          updatePxl(
            n2,
            color.R,
            color.G,
            color.B,
            Math.min(color.A * (radSqr / mag), 255)
          );
        }
      }
    }
  };
  // const roundPxl = (func1: (n:number) => number,func2: (n:number) => number, func3: (n: number) => number, n1:number,n2:number,color:ColorRGB) => {
  //     alpha1 = 0
  //     for(let i = 1; i < 3; i ++ ){
  //         n1 = n2 = func1(n1)
  //         alpha1 += 50
  //         updatePxl(n1,color.R,color.G,color.B,color.A - alpha1)
  //         n2 = func2(n2)
  //         updatePxl(n2,color.R,color.G,color.B,color.A - alpha1)
  //         n2 = func3(n1)
  //         updatePxl(n2,color.R,color.G,color.B,color.A - alpha1)
  //     }
  // }
  // const canvasHMul = 0
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  //iterate through the particles and display each particle
  for (let i = 0; i < particles.length; i++) {
    const p: Particle = particles[i];
    p.updateParticle();
    if (
      p.pos.x + 5 < canvasWidth &&
      p.pos.y < canvasHeight &&
      p.pos.x - 5 > 0 &&
      p.pos.y > 0
    ) {
      n = (~~p.pos.x + ~~p.pos.y * canvasWidth) * 4;
      n1 = n;
      n2 = n1;
      updatePxl(n1, p.color.R, p.color.G, p.color.B, p.color.A);
      fillCircle(n, p.size, p.color);
    }
  }

  ctx.putImageData(a, 0, 0);
};

export const runParticleLoop = (
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  canvasWidth: number,
  canvasHeight: number
) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  //iterate through the particles and display each particle
  for (let i = 0; i < particles.length; i++) {
    const p: Particle = particles[i];
    p.updateParticle();
    p.renderParticle(ctx);
  }
};
