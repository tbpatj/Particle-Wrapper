import Particle from "../classes/Particle";
import {
  CanvasPoint,
  ParticleImageInput,
  ParticleInput,
  ParticleTextInput,
} from "../types/types";
import { shuffle } from "../utils/lists";
import { ParticleQueue, updateParticleQueue } from "../utils/particleQueue";
import {
  DEFAULT_MAP_PARTICLES_TO_CLOSEST_POINT,
  DEFAULT_PRTCL_CNT,
  DEFAULT_USE_PARTICLE_QUEUE,
  createParticlesList,
  getCanvasPoints,
  mapParticlesOntoClosestPoint,
  mapParticlesOntoPoints,
  renderImageToCtx,
  renderTextToCtx,
} from "../utils/util";

interface UseInitParticlesProps {
  ctx: CanvasRenderingContext2D | undefined;
  canvasWidth: number;
  canvasHeight: number;
  particles: Particle[];
  particleQueue: React.MutableRefObject<ParticleQueue[]>;
  groups: React.MutableRefObject<{ [group: string]: number }>;
  setParticles: React.Dispatch<React.SetStateAction<Particle[]>>;
  input?: ParticleInput;
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
  particleQueue,
  groups,
  setParticles,
  input,
}) => {
  function initParticles() {
    const ww = canvasWidth || window.innerWidth;
    const wh = canvasHeight || window.innerHeight;
    setParticles(
      createParticlesList(
        input?.options?.prtcleCnt ?? DEFAULT_PRTCL_CNT,
        ww,
        wh
      )
    );
  }

  function initScene() {
    const useParticleQueue =
      input?.options?.useParticleQueue ?? DEFAULT_USE_PARTICLE_QUEUE;
    if (ctx) {
      const ww = canvasWidth ?? 500;
      const wh = canvasHeight ?? 500;
      if (input) {
        ctx.clearRect(0, 0, ww, wh);
        let renderedToCanvas: boolean = false;

        //iterate through all of the inputs passed in and render them to the canvas
        for (let l = 0; l < (input?.inputs?.length ?? 0); l++) {
          const renderTask: any | undefined = input?.inputs?.[l] ?? undefined;
          //if the user wants text to be the thing that particles show then get the positions from text
          if (renderTask?.text) {
            const inputOptions = renderTask as ParticleTextInput;
            renderTextToCtx(inputOptions, ctx, ww, wh);
            renderedToCanvas = true;
          }
          //if the user wants an image to be the thing we render
          if (renderTask?.image) {
            const inputOptions = renderTask as ParticleImageInput;
            renderImageToCtx(inputOptions, ctx, ww, wh);
            renderedToCanvas = true;
          }
        }
        //if we rendered anything the canvas get that and convert it into particle points then assign the particles
        if (renderedToCanvas) {
          //get the raw data of the image array
          const image = ctx.getImageData(0, 0, ww, wh).data;
          ctx.clearRect(0, 0, ww, wh);
          const points = getCanvasPoints(
            image,
            ww,
            wh,
            input.options?.resolutionPercent
          );

          //if we want to shuffle the particles to remove patterns that appear due to the particles being in the same position in the list then do so here
          if (input.options?.shuffleUponRerender)
            particles = shuffle(particles);
          if (!useParticleQueue) {
            //choose which mapping method we want to use and map the particles to the points
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
          } else {
            updateParticleQueue(
              points,
              particleQueue.current,
              groups.current,
              input.options?.prtcleCnt ?? DEFAULT_PRTCL_CNT,
              "test",
              4000
            );
          }
          return;
        }
      }
      //if we aren't mapping particles to points, then just update the destination to undefined so the particles float freely
      for (let i = 0; i < particles.length; i++) {
        particles[i].dest = undefined;
      }
      particleQueue.current = [];
    }
  }

  return { initScene, initParticles };
};

export default useInitParticles;
