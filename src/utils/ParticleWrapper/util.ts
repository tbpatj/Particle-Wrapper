import ColorRGB from "../../classes/ColorRGB";
import Particle from "../../classes/Particle";
import Vector2D from "../../classes/Vector";
import { CanvasPoint } from "../../types/ParticleWrapper/types";

export const createParticlesList = (particleAmount: number, ww: number, wh: number) => {
  const particles = [];
  for (let i = 0; i < particleAmount; i++) {
    const randX = Math.random() * ww;
    const randY = Math.random() * wh;
    const randVelX = Math.random() * 1 - 0.5;
    const randVelY = Math.random() * 1 - 0.5;
    const size = Math.random() * 2 + 1;
    particles.push(new Particle({ x: randX, y: randY, xVel: randVelX, yVel: randVelY, size }));
  }
  return particles;
};

export const getHex = (val: number) => {
  return val.toString(16);
};

export const convertRGBAToHex = (R: number, G: number, B: number, A: number) => {
  return `#${getHex(R)}${getHex(G)}${getHex(B)}${getHex(A)}`;
};
export const convertRGBToHex = (R: number, G: number, B: number) => {
  return `#${getHex(R)}${getHex(G)}${getHex(B)}`;
};

export const getCanvasPoints = (data: Uint8ClampedArray, ww: number, wh: number) => {
  //iterate through the canvas and find what parts of the canvas need particles
  const foundPoints: CanvasPoint[] = [];
  for (var i = 0; i < ww; i += Math.round(ww / 150)) {
    for (var j = 0; j < wh; j += Math.round(ww / 150)) {
      //this is probably a color channel
      if (data[(i + j * ww) * 4 + 3] > 150) {
        const R = data[(i + j * ww) * 4];
        const G = data[(i + j * ww) * 4 + 1];
        const B = data[(i + j * ww) * 4 + 2];
        const A = data[(i + j * ww) * 4 + 3];
        // if (R < 100 && G < 100 && B < 100 && A > 100) {
        foundPoints.push({ pos: new Vector2D(i, j), color: new ColorRGB({ R, G, B, A }) });
      }
    }
  }
  return foundPoints;
};
export const getImageDataOfImage = (image: HTMLImageElement, ctx: CanvasRenderingContext2D, ww: number, wh: number) => {
  ctx.clearRect(0, 0, ww, wh);
  ctx.drawImage(image, ww / 2 - image.width / 2, wh / 2 - image.height / 2, image.width, image.height);
  const data = ctx.getImageData(0, 0, ww, wh).data;
  ctx.clearRect(0, 0, ww, wh);
  return data;
};
export const getImageDataOfText = (text: string, ctx: CanvasRenderingContext2D, ww: number, wh: number) => {
  ctx.clearRect(0, 0, ww, wh);

  ctx.font = "bold " + 70 + "px sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = `rgba(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.random() * 0.25 + 0.75})`;
  ctx.fillText(text, ww / 2, wh / 2);

  const data = ctx.getImageData(0, 0, ww, wh).data;
  ctx.clearRect(0, 0, ww, wh);
  return data;
};

export const mapParticlesOntoPoints = (particles: Particle[], points: CanvasPoint[], maxParticles: number) => {
  const iterationAmount = points.length / maxParticles;
  let particleBaseSize = 1;
  particleBaseSize = iterationAmount * 1.5;
  if (particles.length === maxParticles) {
    for (let i = 0; Math.round(i / iterationAmount) < particles.length; i += iterationAmount) {
      //get a sightly random index for a painted point, that way we don't see the patterns of us iterating linearly through the pixels
      const index = Math.round(i);
      let randomize = Math.round(Math.random() * (iterationAmount - 1));
      if (index + randomize >= points.length) randomize = index + randomize - points.length - 1;
      if (index + randomize < 0) randomize = 0;
      const point = points?.[index + randomize];
      //use i instead of index so we get an accurate particle index and are able to use every particle not every other
      const pI = Math.round(i / iterationAmount);
      if (point !== undefined) {
        //update the particle with the new points data
        const randVelX = Math.random() * 2 - 1;
        const randVelY = Math.random() * 2 - 1;
        particles[pI].dest = new Vector2D(point.pos.x + Math.random() * 2 - 1, point.pos.y + Math.random() * 2 - 1);
        particles[pI].toColor = new ColorRGB(point.color.toObject());
        particles[pI].size = particleBaseSize + Math.random() * 3;
      } else {
        particles[pI].dest = undefined;
      }
    }
  }
  return particles;
};
