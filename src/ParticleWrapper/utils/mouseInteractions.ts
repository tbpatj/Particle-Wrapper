import Particle from "../classes/Particle";
import Vector2D from "../classes/Vector";
import { MouseCursor } from "../types/mouse";
import { DefaultedWrapperOptions, MouseInteractionTypes } from "../types/types";

export interface CollisionPacket {
  point: Vector2D;
  posToPoint: Vector2D;
  magSqrd: number;
  velMagSqrd: number;
}

export interface MouseInteractionOptions {
  fieldDistance: number;
  fieldIntensity: number;
  interactionType: MouseInteractionTypes;
}

export const getNearestSqrdDistanceToMouse = (
  p: Particle,
  mouse: MouseCursor
) => {
  const v2 = new Vector2D(p.pos.x - mouse.lastX, p.pos.y - mouse.lastY);
  //make sure the projection length is within the bounds of the vectors length not exceeding the magnitude and not below 0
  //   const mouseMag = Math.min(mouse.mag || 1;
  //   console.log(mouse.mag);
  let projMag = Math.min(
    Math.max(
      mouse.mag !== 0 ? (mouse.dx * v2.x + mouse.dy * v2.y) / mouse.mag : 0,
      0
    ),
    mouse.mag
  );

  //get the nearest point on the line between the last mouse position and the current mouse position
  const projPoint = new Vector2D(
    mouse.nDx * projMag + mouse.lastX,
    mouse.nDy * projMag + mouse.lastY
  );
  //   console.log(projPoint);
  const posToPoint = new Vector2D(p.pos.x - projPoint.x, p.pos.y - projPoint.y);
  const magSqrd = posToPoint.x * posToPoint.x + posToPoint.y * posToPoint.y;
  //   console.log(projMag, projPoint, posToPoint, magSqrd);
  return {
    point: projPoint,
    posToPoint,
    magSqrd,
    velMagSqrd: 0,
  } as CollisionPacket;
};

export const getSqrdDistanceToMouse = (p: Particle, mouse: MouseCursor) => {
  const posToPoint = new Vector2D(p.pos.x - mouse.lastX, p.pos.y - mouse.lastY);
  const magSqrd = posToPoint.x * posToPoint.x + posToPoint.y * posToPoint.y;
  return {
    point: new Vector2D(mouse.lastX, mouse.lastY),
    posToPoint,
    magSqrd,
    velMagSqrd: 0,
  } as CollisionPacket;
};

export const dragParticle = (
  colPacket: CollisionPacket,
  p: Particle,
  mouse: MouseCursor,
  options: MouseInteractionOptions
) => {
  let { magSqrd, velMagSqrd } = colPacket;
  //check if the particles are in a reasonable distance to even calculate their new velocites
  if (magSqrd < options.fieldDistance) {
    /** -------------- collision response -------------- */
    const vDotM = (p.vel.x * mouse.dx + p.vel.y * mouse.dy) / magSqrd;
    if (magSqrd < 1000) magSqrd = 1000;
    if (velMagSqrd < mouse.magSqr || (vDotM < 0.01 && mouse.magSqr > 10)) {
      const dx = mouse.dx - p.vel.x;
      const dy = mouse.dy - p.vel.y;
      p.vel.x += dx / (magSqrd / options.fieldIntensity);
      p.vel.y += dy / (magSqrd / options.fieldIntensity);
    }
  }
};

export const getValidInteraction = (
  type: MouseInteractionTypes,
  mouseMag: number
) => {
  return (
    (type !== "none" &&
      type !== "explode" &&
      type === "drag" &&
      mouseMag > 0.2) ||
    type === "orbit" ||
    type === "push"
  );
};

interface OrbitParticlePacket {
  point?: Vector2D;
  vector?: Vector2D;
  disSqrd?: number;
}

export const orbitParticleAround = (
  p: Particle,
  fieldDistanceSqrd: number = 1000,
  intensity: number = 100,
  packet: OrbitParticlePacket
) => {
  const vel = new Vector2D(
    packet?.vector?.x ?? (packet?.point?.x ?? p.pos.x) - p.pos.x,
    packet?.vector?.y ?? (packet?.point?.y ?? p.pos.y) - p.pos.y
  );
  let disSqrd = packet?.disSqrd ?? vel.x * vel.x + vel.y * vel.y;
  if (disSqrd < fieldDistanceSqrd) {
    p.vel.x -= vel.x * (1 - disSqrd / fieldDistanceSqrd) * intensity;
    p.vel.y -= vel.y * (1 - disSqrd / fieldDistanceSqrd) * intensity;
  }
};

export const pushParticlesAround = (
  p: Particle,
  fieldDistanceSqrd: number = 1000,
  intensity: number = 100,
  packet: OrbitParticlePacket
) => {
  const vel = new Vector2D(
    packet?.vector?.x ?? (packet?.point?.x ?? p.pos.x) - p.pos.x,
    packet?.vector?.y ?? (packet?.point?.y ?? p.pos.y) - p.pos.y
  );
  let disSqrd = packet?.disSqrd ?? vel.x * vel.x + vel.y * vel.y;
  if (disSqrd < fieldDistanceSqrd) {
    p.vel.x += vel.x * (1 - disSqrd / fieldDistanceSqrd) * intensity;
    p.vel.y += vel.y * (1 - disSqrd / fieldDistanceSqrd) * intensity;
  }
};

export const particleInteraction = (
  p: Particle,
  mouse: MouseCursor,
  colPacket: CollisionPacket,
  options: MouseInteractionOptions
) => {
  if (options.interactionType === "drag")
    dragParticle(colPacket, p, mouse, options);
  if (options.interactionType === "orbit")
    orbitParticleAround(p, options.fieldDistance, options.fieldIntensity, {
      vector: colPacket.posToPoint,
      disSqrd: colPacket.magSqrd,
    });
  if (options.interactionType === "push")
    pushParticlesAround(p, options.fieldDistance, options.fieldIntensity, {
      vector: colPacket.posToPoint,
      disSqrd: colPacket.magSqrd,
    });
};
