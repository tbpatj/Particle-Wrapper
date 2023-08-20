import ColorRGB from "../classes/ColorRGB";
import Vector2D from "../classes/Vector";

export interface CanvasPoint {
  pos: Vector2D;
  color: ColorRGB;
  assignedPxls: number;
}

interface BasicParticleInput {
  xPos?: string;
  yPos?: string;
  rotDeg?: number;
  scaleX?: number;
  scaleY?: number;
  color?: ParticleWrapperGradient | ParticleWrapperColorPattern | string;
  filter?: string;
}

/**This method adds a color stop with the given color to the gradient at the given offset. Here 0.0 is the offset at one end of the gradient, 1.0 is the offset at the other end. */
export interface ParticleWrapperGradientColorStop {
  offset: number;
  color: string;
}

export interface ParticleWrapperColorPattern {
  image:
    | HTMLImageElement
    | SVGImageElement
    | HTMLVideoElement
    | HTMLCanvasElement
    | ImageBitmap
    | OffscreenCanvas;
  repetition: "repeat" | "repeat-x" | "repeat-y" | "no-repeat";
}

export interface ParticleWrapperLinearGradient {
  /**The x-axis coordinate of the start point. */
  x0: number;
  /** The y-axis coordinate of the start point.*/
  y0: number;
  /** The x-axis coordinate of the end point. */
  x1: number;
  /** The y-axis coordinate of the end point. */
  y1: number;
  stops: ParticleWrapperGradientColorStop[];
}

export interface ParticleWrapperConicGradient {
  /** The angle at which to begin the gradient, in radians. The angle starts from a line going horizontally right from the center, and proceeds clockwise. */
  startAngle: number;
  /** The x-axis coordinate of the center of the gradient. */
  x: number;
  /** The y-axis coordinate of the center of the gradient. */
  y: number;
  stops: ParticleWrapperGradientColorStop[];
}

export interface ParticleWrapperRadialGradient {
  /**The x-axis coordinate of the start point. */
  x0: number;
  /** The y-axis coordinate of the start point.*/
  y0: number;
  /** The radius of the start circle. Must be non-negative and finite. */
  r0: number;
  /** The x-axis coordinate of the end point. */
  x1: number;
  /** The y-axis coordinate of the end point. */
  y1: number;
  /** The radius of the end circle. Must be non-negative and finite. */
  r1: number;
  stops: ParticleWrapperGradientColorStop[];
}

export type ParticleWrapperGradient =
  | ParticleWrapperLinearGradient
  | ParticleWrapperRadialGradient
  | ParticleWrapperConicGradient;

export interface ParticleTextInput extends BasicParticleInput {
  text: string;
  fontSize?: string;
  font?: string;
  fontWeight?: string;
  align?: "left" | "center" | "right" | "start" | "end";
}

export interface ParticleImageInput extends BasicParticleInput {
  image: HTMLImageElement;
  width?: number;
  height?: number;
}

export type EdgeInteractionMethods = "bounce" | "teleport" | "none";

export type MouseInteractionTypes =
  | "none"
  | "drag"
  | "orbit"
  | "explode"
  | "push";

export interface WrapperOptions {
  /** what percent the wrapper scans an "image" and returns back to be processed to assign particles to */
  resolutionPercent?: number;
  /** when a new "image" is allocated, the particles will choose for the most part to go to the closest destination. */
  mapParticlesToClosestPoint?: boolean;
  /** enables a way to render the particles that's more effecient, but only when the particle sizes are really small */
  useOptimizedSmallParticles?: boolean;
  /** amount of particles */
  prtcleCnt?: number;
  /** creates an offset from the original pxl point that a particle is destined to go to*/
  prtclDstRng?: number;
  /** shuffles the particles when we render a new image, it just creates a different kind of display really, removes patterns found in the particle movement */
  shuffleUponRerender?: boolean;
  /** use a more precise method of calculating which particles the mouse has touched, can be slightly more intensive so turn off if optimizing */
  usePreciseMouseDetection?: boolean;
  /** the distance from the cursor with which things interact */
  mouseInteractionFieldDistance?: number;
  /** the intensity of the interaction with the mouse cursor */
  mouseInteractionFieldIntensity?: number;
  mouseInteractionType?: MouseInteractionTypes;
  /** the distance from the cursor with which things interact when clicked */
  mouseClickInteractionFieldDistance?: number;
  /** the intensity of the interaction with the mouse cursor when clicked */
  mouseClickInteractionFieldIntensity?: number;
  mouseClickInteractionType?: MouseInteractionTypes;
  /** determines how the particles interact when they reach the edge  */
  edgeInteractionType?: EdgeInteractionMethods;
  /** how bouncy the edge is if bounce is enabled */
  edgeRestitution?: number;
  /** use particle queue */
  useParticleQueue?: boolean;
}

export interface DefaultedWrapperOptions {
  resolutionPercent: number;
  mapParticlesToClosestPoint: boolean;
  useOptimizedSmallParticles: boolean;
  prtcleCnt: number;
  prtclDstRng: number;
  shuffleUponRerender: boolean;
  usePreciseMouseDetection: boolean;
  mouseInteractionFieldDistance: number;
  mouseInteractionFieldIntensity: number;
  mouseInteractionType: MouseInteractionTypes;
  mouseClickInteractionFieldDistance: number;
  mouseClickInteractionFieldIntensity: number;
  mouseClickInteractionType: MouseInteractionTypes;
  edgeInteractionType: EdgeInteractionMethods;
  edgeRestitution: number;
  useParticleQueue: boolean;
}

export type ParticleInput = ParticleImageInput | ParticleTextInput;

export interface AddInputGroupOptions {
  teleportParticlesToDest?: boolean;
}

export type AddInputGroupFunc = (
  inputs: ParticleInput[],
  group: string,
  prtclCount: number,
  inputOptions?: AddInputGroupOptions
) => void;

export interface ParticleController {
  addParticle: () => void;
  addInputGroup: AddInputGroupFunc;
  createGroupAction: (group: string, action: GroupAction) => void;
  ready: boolean;
}

export const initialParticleController: ParticleController = {
  addParticle: () => {},
  addInputGroup: (inputs: ParticleInput[]) => {},
  createGroupAction: (group: string, action: GroupAction) => {},
  ready: false,
};

export interface GroupProperties {
  speed?: number;
  maxSpeed?: number;
}

export interface GroupMoveAction {
  type: "teleport" | "move" | "teleportWDest";
  xShift?: number;
  yShift?: number;
  xScale?: number;
  yScale?: number;
  centerX?: number;
  centerY?: number;
  rotDeg?: number;
}

export interface GroupAction {
  action: GroupMoveAction;
  properties?: GroupProperties;
}
