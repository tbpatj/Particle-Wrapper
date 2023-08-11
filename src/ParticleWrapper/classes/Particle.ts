import { MouseCursor } from "../types/mouse";
import { DefaultedWrapperOptions } from "../types/types";
import { edgeDetection } from "../utils/particle";
import ColorRGB from "./ColorRGB";
import Vector2D from "./Vector";

interface ParticleConstructor {
  x: number;
  y: number;
  destX?: number;
  destY?: number;
  speed?: number;
  xVel?: number;
  yVel?: number;
  resistence?: number;
  color?: ColorRGB;
  toColor?: ColorRGB;
  size?: number;
  renderCallback?: ParticleRenderCallback;
}

let dx = 0;
let dy = 0;

type ParticleRenderCallback = (
  ctx: CanvasRenderingContext2D,
  pos: Vector2D,
  color: ColorRGB,
  size: number
) => void;

class Particle {
  pos: Vector2D;
  origDest: Vector2D | undefined;
  dest: Vector2D | undefined;
  vel: Vector2D;
  color: ColorRGB;
  toColor: ColorRGB | undefined;
  size: number;
  speed: number;
  resistence: number;
  renderCallback: ParticleRenderCallback | undefined;
  constructor({
    x,
    y,
    destX,
    destY,
    xVel = 0,
    yVel = 0,
    color = new ColorRGB({}),
    renderCallback,
    size = 5,
    resistence = 0.87,
    speed = 0.01,
  }: ParticleConstructor) {
    this.pos = new Vector2D(x, y);
    this.vel = new Vector2D(xVel, yVel);
    if (destX && destY) this.dest = new Vector2D(destX, destY);
    else this.dest = undefined;
    this.toColor = undefined;
    this.color = color;
    this.speed = speed;
    this.size = size;
    this.resistence = resistence;
    //perhaps this isn't the most efficient way to store this data
    this.renderCallback = renderCallback;
  }

  renderParticle = (ctx: CanvasRenderingContext2D) => {
    if (this.renderCallback)
      this.renderCallback(ctx, this.pos, this.color, this.size);
    else this.defaultRender(ctx);
  };

  updateParticle = (
    mouse: MouseCursor,
    canvasWidth: number,
    canvasHeight: number,
    options: DefaultedWrapperOptions
  ) => {
    this.pos.selfAdd(this.vel);
    const velMag = this.vel.x * this.vel.x + this.vel.y * this.vel.y;
    if (options.useMouseInteraction && (mouse.dx !== 0 || mouse.dy !== 0)) {
      //mouse effect, if the mouse is nearby we will move the particles accordingly with how the mouse is moving
      let v = {
        x: this.pos.x - mouse.x,
        y: this.pos.y - mouse.y - mouse.scrollDY,
      };
      let mag = v.x * v.x + v.y * v.y;
      //check if the particles are in a reasonable distance to even calculate their new velocites
      if (mag < 10000) {
        const vDotM = (this.vel.x * mouse.dx + this.vel.y * mouse.dy) / mag;
        // console.log(vDotM);
        if (mag < 1000) mag = 1000;
        if (velMag < mouse.magSqr || (vDotM < 0.01 && mouse.magSqr > 10)) {
          const dx = mouse.dx - this.vel.x;
          const dy = mouse.dy - this.vel.y;
          this.vel.x += dx / (mag / 100);
          this.vel.y += dy / (mag / 100);
        }
      }
    }
    edgeDetection(
      this,
      canvasWidth,
      canvasHeight,
      options.edgeInteractionType,
      options.edgeRestitution
    );
    if (velMag > 0.3) {
      this.vel.x *= 0.995;
      this.vel.y *= 0.995;
    }
    if (this.dest) {
      dx = this.dest.x - this.pos.x;
      dy = this.dest.y - this.pos.y;

      this.vel.x = (this.vel.x + dx * this.speed) * this.resistence;
      this.vel.y = (this.vel.y + dy * this.speed) * this.resistence;

      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;
    }
    if (this.toColor) {
      this.color.interpolate(this.toColor, 0.9);
    }
  };

  defaultRender = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.fillStyle = this.color.toString();
    ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  };
}

export default Particle;
