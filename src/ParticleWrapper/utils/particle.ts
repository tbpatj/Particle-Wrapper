import Particle from "../classes/Particle";
import { EdgeInteractionMethods } from "../types/types";

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
