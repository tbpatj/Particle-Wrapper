import ColorRGB from "../classes/ColorRGB";
import Particle from "../classes/Particle";
import Vector2D from "../classes/Vector";
import {
  CanvasPoint,
  ParticleImageInput,
  ParticleTextInput,
  WrapperOptions,
} from "../types/types";

//default values for settings
export const DEFAULT_PRTCL_CNT = 1000;
export const DEFAULT_PRTCL_DST_RNG = 2;
export const DEFAULT_USE_OPTIMIZED_SMALL_PARTICLES = false;
export const DEFAULT_MAP_PARTICLES_TO_CLOSEST_POINT = false;
export const DEFAULT_WRAPPER_OPTIONS: WrapperOptions = {
  prtcleCnt: DEFAULT_PRTCL_CNT,
  useOptimizedSmallParticles: DEFAULT_USE_OPTIMIZED_SMALL_PARTICLES,
  mapParticlesToClosestPoint: DEFAULT_MAP_PARTICLES_TO_CLOSEST_POINT,
  prtclDstRng: DEFAULT_PRTCL_DST_RNG,
};

//upon initialization prepopulate the particle list using this function
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

/** iterate through the current canvas pixels and find the pixels with an alpha value above 150, if found add it to a list so we can add it to the particle calculations */
export const getCanvasPoints = (
  data: Uint8ClampedArray,
  ww: number,
  wh: number,
  resolutionPercent: number = 50
) => {
  //TODO create a version of this but instead it's a quad tree that finds points and groups them into quadrents, with a bound, that way we can just update the pxls in the algorithm to a bound, upon finding a bound make sure to calculate the area so we can figure out the pxl per area calculation
  //iterate through the canvas and find what parts of the canvas need particles
  const foundPoints: CanvasPoint[] = [];
  //iterate through the x coordinates of the canvas
  for (
    var i = 0;
    i < ww;
    //iterate through the coordinates skipping some based on the resolution percent, if 100 percent then we will go through all the points
    i += Math.round(ww / (ww * (resolutionPercent / 100)))
  ) {
    for (
      var j = 0;
      j < wh;
      j += Math.round(wh / (wh * (resolutionPercent / 100)))
    ) {
      //find the current index based off of the x y coordinates (i and j being x and y), mul by 4 to get around all the color channels
      const n = (i + j * ww) * 4;
      if (data[n + 3] > 150) {
        const R = data[n];
        const G = data[n + 1];
        const B = data[n + 2];
        const A = data[n + 3];
        //add the particles to the found points list
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

//stamp an image on the canvas then get the image data so we can afterward iterate through the pixls and find the image
export const getImageDataOfImage = (
  input: ParticleImageInput,
  ctx: CanvasRenderingContext2D,
  ww: number,
  wh: number
) => {
  //prep up the stamp with data we passed through, scaling, positioning, rotation.
  const { image, xPos, yPos, scaleX, scaleY } = input;
  ctx.clearRect(0, 0, ww, wh);
  const iw = image.width * (scaleX ?? 1);
  const ih = image.height * (scaleY ?? 1);
  const ihw = iw / 2;
  const ihh = ih / 2;
  const xOffset = ww / 2 - ihw + (xPos ?? 0);
  const yOffset = wh / 2 - ihh + (yPos ?? 0);
  //stamp the image onto the canvas
  ctx.drawImage(image, xOffset, yOffset, iw, ih);
  //get the raw list of pixels
  const data = ctx.getImageData(0, 0, ww, wh).data;
  //clear off the stamp
  ctx.clearRect(0, 0, ww, wh);
  return data;
};

//stamp some text on the canvas then get the image data so we can afterward iterate through the pixels and find the image
export const getImageDataOfText = (
  input: ParticleTextInput,
  ctx: CanvasRenderingContext2D,
  ww: number,
  wh: number
) => {
  ctx.clearRect(0, 0, ww, wh);
  //apply the font and style of text we want
  ctx.font = "bold " + (input.fontSize ?? 70) + "px sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = `rgba(${Math.round(Math.random() * 255)},${Math.round(
    Math.random() * 255
  )},${Math.round(Math.random() * 255)},${Math.random() * 0.25 + 0.75})`;
  //stamp the text onto the canvas
  ctx.fillText(
    input.text,
    ww / 2 + (input?.xPos ?? 0),
    wh / 2 + (input?.yPos ?? 0)
  );
  //get the raw data of the image array
  const data = ctx.getImageData(0, 0, ww, wh).data;
  ctx.clearRect(0, 0, ww, wh);
  return data;
};

//after we have gathered the points in which we should put particles we need to tell the particles to go to those points here is where we do that
export const mapParticlesOntoClosestPoint = (
  particles: Particle[],
  points: CanvasPoint[],
  options?: WrapperOptions
) => {
  //get the default or custom settings
  const {
    prtcleCnt = DEFAULT_PRTCL_CNT,
    useOptimizedSmallParticles,
    prtclDstRng = DEFAULT_PRTCL_DST_RNG,
  } = { ...DEFAULT_WRAPPER_OPTIONS, ...options };
  const destRangeHalf = prtclDstRng / 2;
  //iteration amount is also how many pixels to particles there are
  const iterationAmount = points.length / prtcleCnt;
  const maxPtPxl = Math.max(Math.round(prtcleCnt / points.length), 1);
  //how many pixels are left to be assigned to
  let pxlsLeft = points.length / Math.max(iterationAmount, 1);
  //check to make sure the particles have been initialized
  if (particles.length === prtcleCnt) {
    //iterate through all of the particles
    for (let i = 0; i < particles.length; i++) {
      //find the closest pixel point that hasn't already been assigned a particle
      let closestIndx = -1;
      let closestDis = -1;
      const particlePos = particles[i].pos;
      for (let j = 0; Math.round(j) < points.length; j += iterationAmount) {
        const point = points[Math.round(j)];
        //if the pixel hasn't been assigned we can assign a particle, if there aren't any pixels left to be assigned, just assign to any close pixel
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
      //get a slightly randomized pixel, it should still be close to the current point.
      let randomize = Math.round(Math.random() * (iterationAmount - 1));
      if (closestIndx + randomize >= points.length)
        randomize = closestIndx + randomize - points.length - 1;
      if (closestIndx + randomize < 0) randomize = 0;
      const point = points[closestIndx + randomize];
      //if the pixel that we have obtained exists then modify the particle
      if (point !== undefined) {
        //update the pixel assignment variables
        points[closestIndx].assignedPxls += 1;
        pxlsLeft--;

        //update the particle with the new data
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
        //update color
        particles[i].toColor = new ColorRGB(point.color.toObject());
        if (!useOptimizedSmallParticles) {
          particles[i].size = Math.random() * 4 + iterationAmount / 5;
        }
      } else {
        //if there wasn't a pixel associated with the found index, just unset a destination for this particle
        particles[i].dest = undefined;
        particles[i].origDest = undefined;
      }
    }
  }
  return particles;
};

//map particles onto the pixel points in the correct ratio so we use all the particles and try to not miss any important pixels
export const mapParticlesOntoPoints = (
  particles: Particle[],
  points: CanvasPoint[],
  options?: WrapperOptions
) => {
  //get the default or custom settings
  const {
    prtcleCnt = DEFAULT_PRTCL_CNT,
    useOptimizedSmallParticles = false,
    prtclDstRng = DEFAULT_PRTCL_DST_RNG,
  } = { ...DEFAULT_WRAPPER_OPTIONS, ...options };
  const destRangeHalf = prtclDstRng / 2;
  //iteration amount is also how many pixels to particles there are
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
        particles[pI].toColor = new ColorRGB(point.color.toObject());
        //if we aren't using the optimized small particles then change the particle size to fit a lot of the open spacing.
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