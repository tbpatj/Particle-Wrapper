import ColorRGB from "../../classes/ColorRGB";
import Vector2D from "../../classes/Vector";

export interface CanvasPoint {
  pos: Vector2D;
  color: ColorRGB;
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

export interface ParticleOptions {
  rotDeg?: number;
  xOffset?: number;
  yOffset?: number;
  scaleX?: number;
  scaleY?: number;
  /** create a groupname for the particles that are dedicated to this "image" */
  group?: string;
  /** amount of particles dedicated to this "image" */
  prtcleCnt?: number;
}

export type ParticleInput = ParticleImageInput | ParticleTextInput;

export interface ParticleInputObject {
  /** any parameters in here modify the "stamp" used to obtain particle positions, updating this constantly may slow some processes, as this is a heavier modifier */
  input?: any;
  /** these options modify the particles directly, can be used for quick animations */
  options?: ParticleOptions;
}
