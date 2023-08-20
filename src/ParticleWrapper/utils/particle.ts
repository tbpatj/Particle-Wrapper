import Particle from "../classes/Particle";
import { MouseCursor } from "../types/mouse";
import {
  DefaultedWrapperOptions,
  EdgeInteractionMethods,
} from "../types/types";
import {
  getNearestSqrdDistanceToMouse,
  getSqrdDistanceToMouse,
  getValidInteraction,
  particleInteraction,
} from "./mouseInteractions";

export const edgeDetection = (
  p: Particle,
  w: number,
  h: number,
  edgeInteractionType: EdgeInteractionMethods,
  edgeRestitution: number
) => {
  if (edgeInteractionType !== "none" && !p.group) {
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
  const isValidInteraction = getValidInteraction(
    options.mouseInteractionType,
    mouse.mag
  );
  const isValidClickInteraction = getValidInteraction(
    options.mouseClickInteractionType,
    mouse.mag
  );
  if (isValidInteraction || (isValidClickInteraction && mouse.leftMouseDown)) {
    //first step find the nearest point on the velocity vector of the mouse
    //--------- mouse detection ------------
    const colPacket = options.usePreciseMouseDetection
      ? getNearestSqrdDistanceToMouse(p, mouse)
      : getSqrdDistanceToMouse(p, mouse);
    colPacket.velMagSqrd = velMag;
    if (
      isValidInteraction &&
      !(mouse.leftMouseDown && isValidClickInteraction)
    ) {
      particleInteraction(p, mouse, colPacket, {
        fieldDistance: options.mouseInteractionFieldDistance,
        fieldIntensity: options.mouseInteractionFieldIntensity,
        interactionType: options.mouseInteractionType,
      });
    }
    if (mouse.leftMouseDown) {
      particleInteraction(p, mouse, colPacket, {
        fieldDistance: options.mouseClickInteractionFieldDistance,
        fieldIntensity: options.mouseClickInteractionFieldIntensity,
        interactionType: options.mouseClickInteractionType,
      });
    }
  }
};
