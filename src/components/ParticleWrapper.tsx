import { createRef, useCallback, useEffect, useRef, useState } from "react";
import Particle from "../classes/Particle";
import useInitParticles from "../hooks/ParticleWrapper/useInitParticles";
import { ParticleInputObject } from "../types/ParticleWrapper/types";
import Vector2D from "../classes/Vector";
import {
  renderOptimizedParticles,
  runParticleLoop,
} from "../utils/ParticleWrapper/particle";

interface ParticleWrapperProps {
  input?: ParticleInputObject;
}

const useOptimizeSmallParticles = false;

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
      if (useOptimizeSmallParticles) {
        renderOptimizedParticles(ctx, particles, canvasWidth, canvasHeight);
      } else {
        runParticleLoop(ctx, particles, canvasWidth, canvasHeight);
      }
    }
    animationRef.current = requestAnimationFrame(loop);
  }, [ctx, particles]);

  // useEffect(() => {
  //   console.log('changed')
  //   if(input?.options){
  //   const {scaleX=1,scaleY=1,xOffset=0,yOffset=1} = input?.options
  //   for (let i = 0; i < particles.length; i++) {
  //     const p: Particle = particles[i];
  //     if(p.dest && p.origDest){
  //       p.dest.x = (p.origDest.x * scaleX) + xOffset
  //       p.dest.y = (p.origDest.y * scaleY) + yOffset
  //     }
  //     else{
  //       p.dest = p.origDest
  //     }
  //   }
  // }

  // },[input?.options])

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
