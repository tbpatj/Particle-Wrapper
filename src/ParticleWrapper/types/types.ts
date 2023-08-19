import ColorRGB from "../classes/ColorRGB";
import Vector2D from "../classes/Vector";

export interface CanvasPoint {
  pos: Vector2D;
  color: ColorRGB;
  assignedPxls: number;
}

interface BasicParticleInput {
  xPos?: number;
  yPos?: number;
  rotDeg?: number;
  scaleX?: number;
  scaleY?: number;
  teleportParticlesToDest?: boolean;
}

export interface ParticleTextInput extends BasicParticleInput {
  text: string;
  fontSize?: string;
  font?: string;
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
  ready: boolean;
}

export const initialParticleController: ParticleController = {
  addParticle: () => {},
  addInputGroup: (inputs: ParticleInput[]) => {},
  ready: false,
};
