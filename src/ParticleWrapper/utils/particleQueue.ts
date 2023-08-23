import ColorRGB from "../classes/ColorRGB";
import Particle from "../classes/Particle";
import Vector2D from "../classes/Vector";
import {
  AddInputGroupOptions,
  CanvasPoint,
  ParticleGroups,
} from "../types/types";
import { shuffle } from "./lists";

export interface ParticleQueue {
  dest: Vector2D;
  color: ColorRGB;
  group: string;
  teleportParticlesToDest?: boolean;
  lifeSpan?: number;
  size?: number;
  nearestSqrdDis?: number;
  nearestIndex?: number;
  nearestIdentifier?: number;
}

export const updateParticleQueue = (
  points: CanvasPoint[],
  particleQueue: ParticleQueue[],
  groups: ParticleGroups,
  maxParticles: number,
  groupName: string,
  queuedAmt: number,
  options?: AddInputGroupOptions
) => {
  const newQueue: ParticleQueue[] = [];
  let particlesQueued = 0;
  for (const group in groups) {
    if (group !== groupName) particlesQueued += groups[group].particles;
  }
  if (particlesQueued + queuedAmt > maxParticles) {
    queuedAmt = maxParticles - particlesQueued;
  }
  if (queuedAmt > 0) {
    const iAmt = points.length / queuedAmt;
    groups[groupName] = { particles: queuedAmt };
    for (let i = 0; Math.round(i / iAmt) < queuedAmt; i += iAmt) {
      const index = Math.round(i);
      let randomize = Math.round(Math.random() * (iAmt - 1));
      if (index + randomize >= points.length)
        randomize = index + randomize - points.length - 1;
      if (index + randomize < 0) randomize = 0;
      const point = points?.[index + randomize];
      if (point.color.A < 255) point.color.A = 255;
      newQueue.push({
        dest: new Vector2D(
          point.pos.x + Math.random() * 2 - 1,
          point.pos.y + Math.random() * 2 - 1
        ),
        color: point.color,
        group: groupName,
        size: 2,
        teleportParticlesToDest: options?.teleportParticlesToDest,
      });
    }
  }
  return newQueue;
};

export const checkParticleAgainstQueueDis = (
  p: Particle,
  pIndx: number,
  queue: ParticleQueue[]
) => {
  let closestDis = -1;
  let closestIndx = -1;
  for (let i = 0; i < Math.min(20, queue.length); i++) {
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
  if ((queue.length > 0 && !p?.group) || p?.group === queue?.[0]?.group) {
    p.dest = queue[0].dest;
    p.toColor = queue[0].color;
    p.group = queue[0].group;
    p.size = queue[0].size ?? p.size;
    if (queue[0].teleportParticlesToDest) {
      p.pos = new Vector2D(p.dest.x, p.dest.y);
      p.vel = new Vector2D(0, 0);
    }
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
