import Particle from "../../classes/Particle";
import Vector2D from "../../classes/Vector";
import {
  CanvasPoint,
  ParticleImageInput,
  ParticleInputObject,
  ParticleTextInput,
} from "../../types/ParticleWrapper/types";
import {
  DEFAULT_MAP_PARTICLES_TO_CLOSEST_POINT,
  DEFAULT_PRTCL_CNT,
  DEFAULT_WRAPPER_OPTIONS,
  createParticlesList,
  getCanvasPoints,
  getImageDataOfImage,
  getImageDataOfText,
  mapParticlesOntoClosestPoint,
  mapParticlesOntoPoints,
} from "../../utils/ParticleWrapper/util";
import { shuffle } from "../../utils/lists";

interface UseInitParticlesProps {
  ctx: CanvasRenderingContext2D | undefined;
  canvasWidth: number;
  canvasHeight: number;
  particles: Particle[];
  setParticles: React.Dispatch<React.SetStateAction<Particle[]>>;
  input?: ParticleInputObject;
}

interface UseInitParticle {
  initScene: () => void;
  initParticles: () => void;
}

const useInitParticles: (props: UseInitParticlesProps) => UseInitParticle = ({
  ctx,
  canvasWidth,
  canvasHeight,
  particles,
  setParticles,
  input,
}) => {
  function initParticles() {
    const ww = canvasWidth || 500;
    const wh = canvasHeight || 500;
    setParticles(
      createParticlesList(
        input?.options?.prtcleCnt ?? DEFAULT_PRTCL_CNT,
        ww,
        wh
      )
    );
  }

  function initScene() {
    if (ctx) {
      const ww = canvasWidth ?? 500;
      const wh = canvasHeight ?? 500;
      if (input) {
        // particles = shuffle(particles);
        let image: Uint8ClampedArray | undefined = undefined;
        //if the user wants text to be the thing that particles show then get the positions from text
        if (input.input?.text) {
          const inputOptions = input.input as ParticleTextInput;
          image = getImageDataOfText(inputOptions, ctx, ww, wh);
        }
        //if the user wants an image to be the thing we render
        if (input?.input?.image) {
          const inputOptions = input.input as ParticleImageInput;
          image = getImageDataOfImage(input.input, ctx, ww, wh);
          // shuffle(particles)
        }
        if (image) {
          const points = getCanvasPoints(
            image,
            ww,
            wh,
            input.options?.resolutionPercent
          );
          if (
            input.options?.mapParticlesToClosestPoint ??
            DEFAULT_MAP_PARTICLES_TO_CLOSEST_POINT
          ) {
            particles = mapParticlesOntoClosestPoint(
              particles,
              points,
              input.options
            );
          } else {
            particles = mapParticlesOntoPoints(
              particles,
              points,
              input.options
            );
          }
          return;
        }
      }
      for (let i = 0; i < particles.length; i++) {
        particles[i].dest = undefined;
      }
    }
  }

  return { initScene, initParticles };
};

export default useInitParticles;
