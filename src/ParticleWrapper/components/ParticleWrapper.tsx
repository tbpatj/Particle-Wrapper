import { createRef, useCallback, useEffect, useRef, useState } from "react";
import useInitParticles from "../hooks/useInitParticles";
import { ParticleInputObject } from "../types/types";
import { renderOptimizedParticles, runParticleLoop } from "../utils/particle";
import { DEFAULT_USE_OPTIMIZED_SMALL_PARTICLES } from "../utils/util";
import Particle from "../classes/Particle";

interface ParticleWrapperProps {
  input?: ParticleInputObject;
}

const ParticleWrapper: React.FC<ParticleWrapperProps> = ({ input }) => {
  const canvasRef = createRef<HTMLCanvasElement>();
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const animationRef = useRef(-1);
  const [particles, setParticles] = useState<Particle[]>([]);

  const { initScene, initParticles } = useInitParticles({
    ctx,
    canvasWidth,
    canvasHeight,
    particles,
    setParticles,
    input,
  });

  //particle updating methods
  const loop = useCallback(() => {
    //if we have a canvas element then we can start rendering things
    if (ctx) {
      if (
        input?.options?.useOptimizedSmallParticles ??
        DEFAULT_USE_OPTIMIZED_SMALL_PARTICLES
      ) {
        renderOptimizedParticles(ctx, particles, canvasWidth, canvasHeight);
      } else {
        runParticleLoop(ctx, particles, canvasWidth, canvasHeight);
      }
    }
    animationRef.current = requestAnimationFrame(loop);
  }, [ctx, particles]);

  useEffect(() => {
    initScene();
  }, [ctx, input]);

  //if elements in the animation are updated just redo the animation frame so it loads up the new variables
  useEffect(() => {
    cancelAnimationFrame(animationRef.current);
    loop();
  }, [particles, ctx]);

  useEffect(() => {
    initParticles();
  }, []);

  useEffect(() => {
    const ctxRef = canvasRef.current?.getContext("2d");
    if (ctxRef && !ctx) {
      setCtx(ctxRef);
      // setCanvasWidth(300)
      // setCanvasHeight(500)
      setCanvasWidth(canvasRef.current?.offsetWidth ?? 0);
      setCanvasHeight(canvasRef.current?.offsetHeight ?? 0);
    }
  }, [canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", aspectRatio: "1/1" }}
      width={canvasWidth + "px"}
      height={canvasHeight + "px"}
    />
  );
};

export default ParticleWrapper;
