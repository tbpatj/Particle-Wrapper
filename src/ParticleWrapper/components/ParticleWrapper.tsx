import { useCallback, useEffect, useRef, useState } from "react";
import useInitParticles from "../hooks/useInitParticles";
import {
  DefaultedWrapperOptions,
  GroupAction,
  ParticleController,
  WrapperOptions,
} from "../types/types";
import { renderOptimizedParticles, runParticleLoop } from "../utils/rendering";
import { DEFAULT_WRAPPER_OPTIONS } from "../utils/util";
import Particle from "../classes/Particle";
import { MouseCursor, initialMouseCursorObject } from "../types/mouse";
import useMouseCursor from "../hooks/useMouseCursor";
import { excludeOldMouseEntries } from "../utils/mouse";
import useFPS from "../hooks/useFPS";
import { ParticleQueue } from "../utils/particleQueue";

interface ParticleWrapperProps {
  controllerRef?: React.MutableRefObject<ParticleController>;
  onInitalized?: () => void;
  options?: WrapperOptions;
  // initParticlePointsFunc: (width: number, height: number) => Particle;
}

const ParticleWrapper: React.FC<ParticleWrapperProps> = ({
  options,
  controllerRef,
  onInitalized,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const animationRef = useRef(-1);
  const mouseRef = useRef<MouseCursor>(initialMouseCursorObject);
  const particleQueue = useRef<ParticleQueue[]>([]);
  const groups = useRef<{ [group: string]: number }>({});
  const removeGroups = useRef<{ [group: string]: string }>({});
  const groupActions = useRef<{ [group: string]: GroupAction }>({});
  const particles = useRef<Particle[]>([]);
  const { updateFPS, renderFPSOnCanvas } = useFPS();
  const settings: DefaultedWrapperOptions = {
    ...DEFAULT_WRAPPER_OPTIONS,
    ...options,
  };

  const { handleMouseMove, handleMouseDown, handleMouseUp } = useMouseCursor(
    mouseRef,
    canvasRef
  );
  const { addParticleInputs, initParticles } = useInitParticles({
    ctx,
    ww: canvasWidth,
    wh: canvasHeight,
    particles,
    particleQueue,
    groups,
    removeGroups,
    options: settings,
  });

  const createGroupAction = (group: string, action: GroupAction) => {
    groupActions.current[group] = action;
  };

  useEffect(() => {
    const test: boolean = controllerRef !== undefined && ctx !== undefined;
    if (ctx !== undefined && controllerRef) {
      controllerRef.current.addInputGroup = addParticleInputs;
      controllerRef.current.createGroupAction = createGroupAction;
      if (!controllerRef.current.ready) {
        controllerRef.current.ready = true;
        onInitalized?.();
      }
    }
  }, [addParticleInputs, ctx]);

  //particle updating methods
  const loop = useCallback(() => {
    excludeOldMouseEntries(mouseRef);
    //if we have a canvas element then we can start rendering things
    if (ctx) {
      //if the custom option was set to use the optimized small particles use those particles instead.
      if (settings.useOptimizedSmallParticles) {
        renderOptimizedParticles(
          ctx,
          particles.current,
          canvasWidth,
          canvasHeight,
          mouseRef.current,
          particleQueue.current,
          groups.current,
          removeGroups.current,
          groupActions.current,
          settings
        );
      } else {
        runParticleLoop(
          ctx,
          particles.current,
          canvasWidth,
          canvasHeight,
          mouseRef.current,
          settings
        );
      }
      // checkQueueEndOfLoop(particles, particleQueue.current);
      renderFPSOnCanvas(ctx);
      removeGroups.current = {};
      groupActions.current = {};
    }
    updateFPS();
    animationRef.current = requestAnimationFrame(loop);
  }, [ctx, particles]);
  //if elements in the animation are updated just reset the animation frame so it loads up the new variables
  useEffect(() => {
    cancelAnimationFrame(animationRef.current);
    loop();
  }, [particles, ctx]);

  //when the component first loads up initialize all the dedicated particles
  useEffect(() => {
    if (particles.current.length === 0 && canvasWidth) {
      initParticles();
    }
  }, [canvasWidth]);

  //when the canvas ref updates, update the canvas width and height and also get the ctx reference so we can render to the canvas

  const adjustSize = () => {
    if (canvasRef.current) {
      setCanvasWidth(canvasRef.current?.offsetWidth ?? 0);
      setCanvasHeight(canvasRef.current?.offsetHeight ?? 0);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", adjustSize);
    return () => window.removeEventListener("resize", adjustSize);
  }, [canvasRef]);

  return (
    <canvas
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      ref={(ref) => {
        if (ref) {
          setCanvasWidth(ref.offsetWidth ?? 0);
          setCanvasHeight(ref.offsetHeight ?? 0);
          const refCtx = ref.getContext("2d", { willReadFrequently: true });
          canvasRef.current = ref;
          if (refCtx) setCtx(refCtx);
        }
      }}
      style={{ width: "100%", height: "100%" }}
      width={canvasWidth + "px"}
      height={canvasHeight + "px"}
    />
  );
};

export default ParticleWrapper;
