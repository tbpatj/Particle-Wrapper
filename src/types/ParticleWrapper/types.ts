import ColorRGB from "../../classes/ColorRGB";
import Vector2D from "../../classes/Vector";

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
}

export interface ParticleTextInput extends BasicParticleInput {
  text: string;
  fontSize?: string;
  font?: string;
}

export interface ParticleImageInput extends BasicParticleInput {
  image: HTMLImageElement;
}

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
}

export type ParticleInput = ParticleImageInput | ParticleTextInput;

export interface ParticleInputObject {
  /** any parameters in here modify the "stamp" used to obtain particle positions, updating this constantly may slow some processes, as this is a heavier modifier */
  input?: any;
  /** these options modify the particles directly, can be used for quick animations */
  options?: WrapperOptions;
}
