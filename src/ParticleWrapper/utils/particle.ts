import Particle from "../classes/Particle";
import { MouseCursor } from "../types/mouse";
import {
  DefaultedWrapperOptions,
  EdgeInteractionMethods,
} from "../types/types";

export const edgeDetection = (
  p: Particle,
  w: number,
  h: number,
  edgeInteractionType: EdgeInteractionMethods,
  edgeRestitution: number
) => {
  if (edgeInteractionType !== "none") {
    const isPastRightEdge = p.pos.x > w;
    const isPastLeftEdge = p.pos.x < 0;
    const isPastUpperEdge = p.pos.y > h;
    const isPastLowerEdge = p.pos.y < 0;
    if (edgeInteractionType === "teleport") {
      if (isPastRightEdge) p.pos.x = 0 + p.pos.x - w;

      if (isPastLeftEdge) p.pos.x = w + p.pos.x;

      if (isPastUpperEdge) p.pos.y = 0 + p.pos.y - h;

      if (isPastLowerEdge) p.pos.y = h + p.pos.y;
    } else {
      if (isPastRightEdge) {
        p.pos.x = w - (p.pos.x - w);
        p.vel.x *= -edgeRestitution;
      }
      if (isPastLeftEdge) {
        p.pos.x = 0 - p.pos.x;
        p.vel.x *= -edgeRestitution;
      }
      if (isPastUpperEdge) {
        p.pos.y = h - (p.pos.y - h);
        p.vel.y *= -edgeRestitution;
      }
      if (isPastLowerEdge) {
        p.pos.y = 0 - p.pos.y;
        p.vel.y *= -edgeRestitution;
      }
    }
  }
};

export const mouseCollision = (
  p: Particle,
  velMag: number,
  mouse: MouseCursor,
  options: DefaultedWrapperOptions
) => {
  if (options.useMouseInteraction && mouse.mag > 0.2) {
    //first step find the nearest point on the velocity vector of the mouse
    //--------- mouse detection ------------
    const v2 = {
      x: p.pos.x - mouse.lastX,
      y: p.pos.y - mouse.lastY,
    };
    let magSqrd = 0;
    //use vectors to find the closest point on the velocity vector of the mouse, this allows us to more precisely get all the particles that may have been touched by the mouse's movement
    if (options.usePreciseMouseDetection) {
      let projMag = Math.min(
        Math.max((mouse.dx * v2.x + mouse.dy * v2.y) / mouse.mag, 0),
        mouse.mag
      );
      //get the nearest point on the line between the last mouse position and the current mouse position
      const projPoint = {
        x: mouse.nDx * projMag + mouse.lastX,
        y: mouse.nDy * projMag + mouse.lastY,
      };
      const v3 = {
        x: p.pos.x - projPoint.x,
        y: p.pos.y - projPoint.y,
      };
      magSqrd = v3.x * v3.x + v3.y * v3.y;
    } else {
      magSqrd = v2.x * v2.x + v2.y * v2.y;
    }

    //check if the particles are in a reasonable distance to even calculate their new velocites
    if (magSqrd < options.mouseInteractionFieldDistance) {
      /** -------------- collision response -------------- */
      const vDotM = (p.vel.x * mouse.dx + p.vel.y * mouse.dy) / magSqrd;
      if (magSqrd < 1000) magSqrd = 1000;
      if (velMag < mouse.magSqr || (vDotM < 0.01 && mouse.magSqr > 10)) {
        const dx = mouse.dx - p.vel.x;
        const dy = mouse.dy - p.vel.y;
        p.vel.x += dx / (magSqrd / options.mouseInteractionFieldIntensity);
        p.vel.y += dy / (magSqrd / options.mouseInteractionFieldIntensity);
      }
    }
  }
};
