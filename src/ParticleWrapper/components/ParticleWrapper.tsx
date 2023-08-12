import { createRef, useCallback, useEffect, useRef, useState } from "react";
import useInitParticles from "../hooks/useInitParticles";
import { ParticleInputObject } from "../types/types";
import { renderOptimizedParticles, runParticleLoop } from "../utils/rendering";
import {
  DEFAULT_USE_OPTIMIZED_SMALL_PARTICLES,
  getOptionsWDefaults,
} from "../utils/util";
import Particle from "../classes/Particle";
import { MouseCursor, initialMouseCursorObject } from "../types/mouse";
import useMouseCursor from "../hooks/useMouseCursor";
import { excludeOldMouseEntries } from "../utils/mouse";
import useFPS from "../hooks/useFPS";

interface ParticleWrapperProps {
  input?: ParticleInputObject;
}

const ParticleWrapper: React.FC<ParticleWrapperProps> = ({ input }) => {
  const canvasRef = createRef<HTMLCanvasElement>();
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const animationRef = useRef(-1);
  const mouseRef = useRef<MouseCursor>(initialMouseCursorObject);
  const [particles, setParticles] = useState<Particle[]>([]);
  const { fpsRef, updateFPS } = useFPS();

  const { handleMouseMove } = useMouseCursor(mouseRef, canvasRef);

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
    excludeOldMouseEntries(mouseRef);
    //if we have a canvas element then we can start rendering things
    if (ctx) {
      //if the custom option was set to use the optimized small particles use those particles instead.
      if (
        input?.options?.useOptimizedSmallParticles ??
        DEFAULT_USE_OPTIMIZED_SMALL_PARTICLES
      ) {
        renderOptimizedParticles(
          ctx,
          particles,
          canvasWidth,
          canvasHeight,
          mouseRef.current,
          getOptionsWDefaults(input?.options)
        );
      } else {
        runParticleLoop(
          ctx,
          particles,
          canvasWidth,
          canvasHeight,
          mouseRef.current,
          getOptionsWDefaults(input?.options)
        );
      }
    }
    updateFPS();
    if (ctx) {
      ctx.font = "bold " + 16 + "px sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = "black";
      //stamp the text onto the canvas
      ctx.fillText(`${fpsRef.current.fps} FPS`, 10, 30);
    }
    animationRef.current = requestAnimationFrame(loop);
  }, [ctx, particles]);

  useEffect(() => {
    initScene();
  }, [ctx, input]);

  //if elements in the animation are updated just reset the animation frame so it loads up the new variables
  useEffect(() => {
    cancelAnimationFrame(animationRef.current);
    loop();
  }, [particles, ctx]);

  //when the component first loads up initialize all the dedicated particles
  useEffect(() => {
    initParticles();
  }, []);

  //when the canvas ref updates, update the canvas width and height and also get the ctx reference so we can render to the canvas
  useEffect(() => {
    const ctxRef = canvasRef.current?.getContext("2d", {
      willReadFrequently: true,
    });
    if (ctxRef && !ctx) {
      setCtx(ctxRef);
      setCanvasWidth(canvasRef.current?.offsetWidth ?? 0);
      setCanvasHeight(canvasRef.current?.offsetHeight ?? 0);
    }
  }, [canvasRef]);

  return (
    <canvas
      onMouseMove={handleMouseMove}
      ref={canvasRef}
      style={{ width: "100%", height: "100%" }}
      width={canvasWidth + "px"}
      height={canvasHeight + "px"}
    />
  );
};

export default ParticleWrapper;
