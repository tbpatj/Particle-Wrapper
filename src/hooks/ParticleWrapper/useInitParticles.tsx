import Particle from "../../classes/Particle";
import Vector2D from "../../classes/Vector";
import { CanvasPoint } from "../../types/ParticleWrapper/types";
import { createParticlesList, getCanvasPoints, getImageDataOfImage, getImageDataOfText, mapParticlesOntoPoints } from "../../utils/ParticleWrapper/util";
import { shuffle } from "../../utils/lists";

interface UseInitParticlesProps {
  ctx: CanvasRenderingContext2D | undefined;
  canvasWidth: number;
  canvasHeight: number;
  particles: Particle[];
  setParticles: React.Dispatch<React.SetStateAction<Particle[]>>;
  maxParticles?: number;
  input?: any;
}

interface UseInitParticle {
  initScene: () => void;
  initParticles: () => void;
}

const useInitParticles: (props: UseInitParticlesProps) => UseInitParticle = ({ ctx, canvasWidth, canvasHeight, particles, setParticles, maxParticles = 2000, input }) => {
  function initParticles() {
    const ww = canvasWidth || 500;
    const wh = canvasHeight || 500;
    setParticles(createParticlesList(maxParticles, ww, wh));
  }

  function initScene() {
    if (ctx) {
      const ww = canvasWidth ?? 500;
      const wh = canvasHeight ?? 500;
      if (input) {
        // particles = shuffle(particles);
        let image: Uint8ClampedArray | undefined = undefined;
        //if the user wants text to be the thing that particles show then get the positions from text
        console.log(typeof input);
        if (typeof input === "string") {
          image = getImageDataOfText(input as string, ctx, ww, wh);
        }
        //if the user wants an image to be the thing we render
        if (input?.src) {
          image = getImageDataOfImage(input, ctx, ww, wh);
        }
        if (image) {
          const points = getCanvasPoints(image, ww, wh);
          particles = mapParticlesOntoPoints(particles, points, maxParticles);
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
