import ColorRGB from "../classes/ColorRGB";
import Particle from "../classes/Particle";
import Vector2D from "../classes/Vector";
import { CanvasPoint } from "../types/types";
import { shuffle } from "./lists";

export enum QueueSteps {
  CheckDis = 0,
  CheckForFurthest = 1,
  Reset = 2,
}

export interface ParticleQueue {
  dest: Vector2D;
  color: ColorRGB;
  group: string;
  step: QueueSteps;
  lifeSpan?: number;
  size?: number;
  nearestSqrdDis?: number;
  nearestIndex?: number;
  nearestIdentifier?: number;
}

export const updateParticleQueue = (
  points: CanvasPoint[],
  particleQueue: ParticleQueue[],
  groups: { [group: string]: number },
  maxParticles: number,
  groupName: string,
  queuedAmt: number
) => {
  let particlesQueued = 0;
  for (const group in groups) {
    particlesQueued += groups[group];
  }
  if (particlesQueued + queuedAmt > maxParticles) {
    queuedAmt = maxParticles - particlesQueued;
  }
  if (queuedAmt > 300) {
    const iAmt = points.length / queuedAmt;
    groups[groupName] = queuedAmt;
    for (let i = 0; Math.round(i / iAmt) < queuedAmt; i += iAmt) {
      const index = Math.round(i);
      let randomize = Math.round(Math.random() * (iAmt - 1));
      if (index + randomize >= points.length)
        randomize = index + randomize - points.length - 1;
      if (index + randomize < 0) randomize = 0;
      const point = points?.[index + randomize];
      particleQueue.push({
        dest: point.pos,
        color: point.color,
        group: groupName,
        step: QueueSteps.CheckDis,
      });
    }
    shuffle(particleQueue);
  }
};

export const checkParticleAgainstQueueDis = (
  p: Particle,
  pIndx: number,
  queue: ParticleQueue[]
) => {
  let closestDis = -1;
  let closestIndx = -1;
  for (let i = 0; i < Math.min(20, queue.length); i++) {
    // const queueItem = queue[i];
    const v1 = new Vector2D(
      p.pos.x - queue[i].dest.x,
      p.pos.y - queue[i].dest.y
    );
    const dis = v1.x * v1.x + v1.y * v1.y;
    const isAvaiableParticle =
      queue[i].nearestSqrdDis === undefined ||
      (queue[i].nearestSqrdDis !== undefined &&
        dis < (queue[i].nearestSqrdDis as number));
    if ((isAvaiableParticle && dis < closestDis) || closestDis === -1) {
      closestDis = dis;
      closestIndx = i;
    }
  }
  if (closestIndx !== -1 && closestIndx !== undefined) {
    queue[closestIndx]["nearestIndex"] = pIndx;
    queue[closestIndx].nearestSqrdDis = closestDis;
  }
};

export const assignParticleQueue = (p: Particle, queue: ParticleQueue[]) => {
  if (queue.length > 0) {
    p.dest = queue[0].dest;
    p.toColor = queue[0].color;
    queue.splice(0, 1);
  }
};

export const checkQueueEndOfLoop = (
  particles: Particle[],
  queue: ParticleQueue[]
) => {
  const remove: number[] = [];
  for (let i = 0; i < Math.min(20, queue.length); i++) {
    if (queue[i].nearestIndex !== undefined && queue[i].nearestIndex !== -1) {
      const p = particles[queue[i].nearestIndex as number];
      p.toColor = queue[i].color;
      p.dest = queue[i].dest;
      remove.push(i);
    }
  }
  for (let i = 0; i < remove.length; i++) {
    queue.splice(remove[i] - i, 1);
  }
};

// export const checkParticleAgainstQueue = (
//   p: Particle,
//   pIndx: number,
//   queue: ParticleQueue[]
// ) => {
//   let furthestQueueDistance = -1;
//   let furthestQueueIndx = -1;
//   for (let i = 0; i < Math.min(10, queue.length); i++) {
//     const queueItem = queue[i];
//     if (queueItem.step === QueueSteps.CheckDis) {
//       queuedParticleCheckDis(p, pIndx, queueItem);
//       //   console.log(queueItem);
//     } else if (queueItem.step === QueueSteps.CheckForFurthest) {
//       if (
//         queueItem.nearestSqrdDis &&
//         queueItem.nearestIndex === pIndx &&
//         furthestQueueDistance < queueItem.nearestSqrdDis
//       ) {
//         furthestQueueDistance = queueItem.nearestSqrdDis;
//         furthestQueueIndx = i;
//       } else if (queueItem.nearestIndex === pIndx && queueItem.nearestSqrdDis) {
//         queueItem.step = QueueSteps.CheckDis;
//         queueItem.nearestIndex = undefined;
//         queueItem.nearestSqrdDis = undefined;
//       }
//     }
//   }
//   const furthestQueue = queue?.[furthestQueueIndx];
//   if (furthestQueue) {
//     console.log("assignment", furthestQueueIndx);
//     p.dest = furthestQueue.dest;
//     p.toColor = furthestQueue.color;
//     queue.splice(furthestQueueIndx, 1);
//   }
// };

///find the closest particles to the points, and then assign the particle that is the cloesest, but with the greatest distance.
