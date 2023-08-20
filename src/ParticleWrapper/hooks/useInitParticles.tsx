import Particle from "../classes/Particle";
import {
  AddInputGroupFunc,
  AddInputGroupOptions,
  DefaultedWrapperOptions,
  ParticleImageInput,
  ParticleInput,
  ParticleTextInput,
} from "../types/types";
import { shuffle } from "../utils/lists";
import { ParticleQueue, updateParticleQueue } from "../utils/particleQueue";
import {
  createParticlesList,
  getCanvasPoints,
  mapParticlesOntoClosestPoint,
  mapParticlesOntoPoints,
  renderImageToCtx,
  renderTextToCtx,
} from "../utils/util";

interface UseInitParticlesProps {
  ctx: CanvasRenderingContext2D | undefined;
  ww: number;
  wh: number;
  particles: React.MutableRefObject<Particle[]>;
  particleQueue: React.MutableRefObject<ParticleQueue[]>;
  groups: React.MutableRefObject<{ [group: string]: number }>;
  removeGroups: React.MutableRefObject<{ [group: string]: string }>;
  options: DefaultedWrapperOptions;
}

interface UseInitParticle {
  addParticleInputs: AddInputGroupFunc;
  initParticles: () => void;
}

const useInitParticles: (props: UseInitParticlesProps) => UseInitParticle = ({
  ctx,
  ww,
  wh,
  particles,
  particleQueue,
  groups,
  removeGroups,
  options,
}) => {
  function initParticles() {
    particles.current = createParticlesList(options.prtcleCnt, ww, wh);
  }

  const updateCTXForProcessing = (inputs: ParticleInput[]) => {
    let renderedToCanvas = false;
    if (ctx) {
      ctx.clearRect(0, 0, ww, wh);
      for (let l = 0; l < inputs.length; l++) {
        const renderTask: any = inputs[l];
        //if the user wants text to be the thing that particles show then get the positions from text
        if (renderTask?.text) {
          const input = renderTask as ParticleTextInput;
          renderTextToCtx(input, ctx, ww, wh);
          renderedToCanvas = true;
          //if the user wants an image to be the thing we render
        } else if (renderTask?.image) {
          const input = renderTask as ParticleImageInput;
          renderImageToCtx(input, ctx, ww, wh);
          renderedToCanvas = true;
        }
      }
    }
    return renderedToCanvas;
  };

  const addParticleInputs = (
    inputs: ParticleInput[],
    group: string,
    prtclCount: number,
    inputOptions?: AddInputGroupOptions
  ) => {
    if (ctx) {
      if (inputs.length > 0) {
        //iterate through all of the inputs passed in and render them to the canvas
        const renderedToCanvas = updateCTXForProcessing(inputs);
        if (renderedToCanvas) {
          const image = ctx.getImageData(0, 0, ww, wh).data;
          ctx.clearRect(0, 0, ww, wh);
          const points = getCanvasPoints(
            image,
            ww,
            wh,
            options.resolutionPercent
          );

          // if (options.shuffleUponRerender)
          //   particles.current = shuffle(particles.current);
          if (!options.useParticleQueue) {
            //choose which mapping method we want to use and map the particles to the points
            if (options.mapParticlesToClosestPoint) {
              particles.current = mapParticlesOntoClosestPoint(
                particles.current,
                points,
                options
              );
            } else {
              particles.current = mapParticlesOntoPoints(
                particles.current,
                points,
                options
              );
            }
          } else {
            if (groups.current[group]) {
              removeGroups.current[group] = "reset";
            }
            const newQueue = updateParticleQueue(
              points,
              particleQueue.current,
              groups.current,
              options.prtcleCnt,
              group,
              prtclCount,
              inputOptions
            );
            if (options.shuffleUponRerender) shuffle(newQueue);
            particleQueue.current = particleQueue.current.concat(newQueue);
            // console.log("new queue", particleQueue.current);
          }
        }
      }
    }
  };

  return { addParticleInputs, initParticles };
};

export default useInitParticles;
