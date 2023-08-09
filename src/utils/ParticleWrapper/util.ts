import { randomBytes } from "crypto";
import ColorRGB from "../../classes/ColorRGB";
import Particle from "../../classes/Particle";
import Vector2D from "../../classes/Vector";
import {
  CanvasPoint,
  ParticleImageInput,
  ParticleTextInput,
  WrapperOptions,
} from "../../types/ParticleWrapper/types";

export const DEFAULT_PRTCL_CNT = 1000;
export const DEFAULT_PRTCL_DST_RNG = 5;
export const DEFAULT_USE_OPTIMIZED_SMALL_PARTICLES = false;
export const DEFAULT_MAP_PARTICLES_TO_CLOSEST_POINT = false;
export const DEFAULT_WRAPPER_OPTIONS: WrapperOptions = {
  prtcleCnt: DEFAULT_PRTCL_CNT,
  useOptimizedSmallParticles: DEFAULT_USE_OPTIMIZED_SMALL_PARTICLES,
  mapParticlesToClosestPoint: DEFAULT_MAP_PARTICLES_TO_CLOSEST_POINT,
  prtclDstRng: DEFAULT_PRTCL_DST_RNG,
};

export const createParticlesList = (
  particleAmount: number = DEFAULT_PRTCL_CNT,
  ww: number,
  wh: number
) => {
  const particles = [];
  for (let i = 0; i < particleAmount; i++) {
    const randX = Math.random() * ww;
    const randY = Math.random() * wh;
    const randVelX = Math.random() * 1 - 0.5;
    const randVelY = Math.random() * 1 - 0.5;
    const size = Math.random() * 2 + 1;
    particles.push(
      new Particle({ x: randX, y: randY, xVel: randVelX, yVel: randVelY, size })
    );
  }
  return particles;
};

export const getHex = (val: number) => {
  return val.toString(16);
};

export const convertRGBAToHex = (
  R: number,
  G: number,
  B: number,
  A: number
) => {
  return `#${getHex(R)}${getHex(G)}${getHex(B)}${getHex(A)}`;
};
export const convertRGBToHex = (R: number, G: number, B: number) => {
  return `#${getHex(R)}${getHex(G)}${getHex(B)}`;
};

export const getCanvasPoints = (
  data: Uint8ClampedArray,
  ww: number,
  wh: number,
  resolutionPercent: number = 50
) => {
  //TODO create a version of this but instead it's a quad tree that finds points and groups them into quadrents, with a bound, that way we can just update the pxls in the algorithm to a bound, upon finding a bound make sure to calculate the area so we can figure out the pxl per area calculation
  //iterate through the canvas and find what parts of the canvas need particles
  const foundPoints: CanvasPoint[] = [];
  for (
    var i = 0;
    i < ww;
    i += Math.round(ww / (ww * (resolutionPercent / 100)))
  ) {
    for (
      var j = 0;
      j < wh;
      j += Math.round(wh / (wh * (resolutionPercent / 100)))
    ) {
      //this is probably a color channel
      const n = (i + j * ww) * 4;
      if (data[n + 3] > 150) {
        const R = data[n];
        const G = data[n + 1];
        const B = data[n + 2];
        const A = data[n + 3];
        // if (R < 100 && G < 100 && B < 100 && A > 100) {
        foundPoints.push({
          pos: new Vector2D(i, j),
          color: new ColorRGB({ R, G, B, A }),
          assignedPxls: 0,
        });
      }
    }
  }
  return foundPoints;
};
export const getImageDataOfImage = (
  input: ParticleImageInput,
  ctx: CanvasRenderingContext2D,
  ww: number,
  wh: number
) => {
  const { image, xPos, yPos, scaleX, scaleY } = input;
  ctx.clearRect(0, 0, ww, wh);
  const iw = image.width * (scaleX ?? 1);
  const ih = image.height * (scaleY ?? 1);
  const ihw = iw / 2;
  const ihh = ih / 2;
  const xOffset = ww / 2 - ihw + (xPos ?? 0);
  const yOffset = wh / 2 - ihh + (yPos ?? 0);
  ctx.drawImage(image, xOffset, yOffset, iw, ih);
  const data = ctx.getImageData(0, 0, ww, wh).data;
  ctx.clearRect(0, 0, ww, wh);
  return data;
};
export const getImageDataOfText = (
  input: ParticleTextInput,
  ctx: CanvasRenderingContext2D,
  ww: number,
  wh: number
) => {
  ctx.clearRect(0, 0, ww, wh);
  ctx.font = "bold " + (input.fontSize ?? 70) + "px sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = `rgba(${Math.round(Math.random() * 255)},${Math.round(
    Math.random() * 255
  )},${Math.round(Math.random() * 255)},${Math.random() * 0.25 + 0.75})`;
  ctx.fillText(
    input.text,
    ww / 2 + (input?.xPos ?? 0),
    wh / 2 + (input?.yPos ?? 0)
  );

  const data = ctx.getImageData(0, 0, ww, wh).data;
  ctx.clearRect(0, 0, ww, wh);
  return data;
};

export const mapParticlesOntoClosestPoint = (
  particles: Particle[],
  points: CanvasPoint[],
  options?: WrapperOptions
) => {
  const {
    prtcleCnt = DEFAULT_PRTCL_CNT,
    useOptimizedSmallParticles,
    prtclDstRng = DEFAULT_PRTCL_DST_RNG,
  } = { ...DEFAULT_WRAPPER_OPTIONS, ...options };
  const destRangeHalf = prtclDstRng / 2;
  //iteratino amount is also how many particles can be assigned a pxl
  const iterationAmount = points.length / prtcleCnt;
  const maxPtPxl = Math.max(Math.round(prtcleCnt / points.length), 1);
  let pxlsLeft = points.length / Math.max(iterationAmount, 1);
  console.log(
    "maxPtPxl",
    maxPtPxl,
    "pxls",
    points.length,
    "pxlsLeft",
    pxlsLeft,
    "particles",
    prtcleCnt,
    "iterationAmount:",
    iterationAmount
  );
  // console.log(pxls)
  let particleBaseSize = 1;
  particleBaseSize = iterationAmount * 1.5;
  if (particles.length === prtcleCnt) {
    for (let i = 0; i < particles.length; i++) {
      let closestIndx = -1;
      let closestDis = -1;
      const particlePos = particles[i].pos;
      for (let j = 0; Math.round(j) < points.length; j += iterationAmount) {
        const point = points[Math.round(j)];
        if (point.assignedPxls < 1 || pxlsLeft <= 0) {
          const dis =
            (point.pos.x - particlePos.x) * (point.pos.x - particlePos.x) +
            (point.pos.y - particlePos.y) * (point.pos.y - particlePos.y);
          if (dis < closestDis || closestDis === -1) {
            closestIndx = Math.round(j);
            closestDis = dis;
          }
        }
      }

      let randomize = Math.round(Math.random() * (iterationAmount - 1));
      if (closestIndx + randomize >= points.length)
        randomize = closestIndx + randomize - points.length - 1;
      if (closestIndx + randomize < 0) randomize = 0;
      const point = points[closestIndx + randomize];

      if (point !== undefined) {
        points[closestIndx].assignedPxls += 1;

        // if (randomize !== 0) points[closestIndx + randomize].assignedPxls += 1;
        pxlsLeft--;

        //update the particle with the new points data
        const randVelX = Math.random() * 2 - 1;
        const randVelY = Math.random() * 2 - 1;
        particles[i].dest = new Vector2D(
          point.pos.x + Math.random() * prtclDstRng - destRangeHalf,
          point.pos.y + Math.random() * prtclDstRng - destRangeHalf
        );
        particles[i].origDest = new Vector2D(
          (particles[i].dest as Vector2D).x as number,
          (particles[i].dest as Vector2D).y
        );
        particles[i].toColor = new ColorRGB(point.color.toObject());
        if (!useOptimizedSmallParticles) {
          particles[i].size = Math.random() * 4 + iterationAmount / 5;
        }
      } else {
        particles[i].dest = undefined;
        particles[i].origDest = undefined;
      }
    }
  }
  for (let i = 0; i < points.length; i++) {}
  return particles;
};

export const mapParticlesOntoPoints = (
  particles: Particle[],
  points: CanvasPoint[],
  options?: WrapperOptions
) => {
  //custom options
  const {
    prtcleCnt = DEFAULT_PRTCL_CNT,
    useOptimizedSmallParticles = false,
    prtclDstRng = DEFAULT_PRTCL_DST_RNG,
  } = { ...DEFAULT_WRAPPER_OPTIONS, ...options };
  const destRangeHalf = prtclDstRng / 2;

  const iterationAmount = points.length / prtcleCnt;
  let particleBaseSize = 1;
  particleBaseSize = iterationAmount * 1.5;
  if (particles.length === prtcleCnt) {
    for (
      let i = 0;
      Math.round(i / iterationAmount) < particles.length;
      i += iterationAmount
    ) {
      //get a sightly random index for a painted point, that way we don't see the patterns of us iterating linearly through the pixels
      const index = Math.round(i);
      let randomize = Math.round(Math.random() * (iterationAmount - 1));
      if (index + randomize >= points.length)
        randomize = index + randomize - points.length - 1;
      if (index + randomize < 0) randomize = 0;
      const point = points?.[index + randomize];
      //use i instead of index so we get an accurate particle index and are able to use every particle not every other
      const pI = Math.round(i / iterationAmount);
      if (point !== undefined) {
        //update the particle with the new points data
        const randVelX = Math.random() * 2 - 1;
        const randVelY = Math.random() * 2 - 1;
        particles[pI].dest = new Vector2D(
          point.pos.x + Math.random() * prtclDstRng - destRangeHalf,
          point.pos.y + Math.random() * prtclDstRng - destRangeHalf
        );
        //  particles[pI].origDest = new Vector2D((particles[pI].dest as Vector2D).x as number, (particles[pI].dest as Vector2D).y)
        particles[pI].toColor = new ColorRGB(point.color.toObject());
        if (!useOptimizedSmallParticles)
          particles[pI].size = Math.random() * 4 + iterationAmount / 5;
      } else {
        particles[pI].dest = undefined;
        particles[pI].origDest = undefined;
      }
    }
  }
  return particles;
};
