import { createRef, useCallback, useEffect, useRef, useState } from "react";
import Particle from "../classes/Particle";
import useInitParticles from "../hooks/ParticleWrapper/useInitParticles";
import { ParticleInputObject } from "../types/ParticleWrapper/types";

interface ParticleWrapperProps {
  input?: ParticleInputObject;
}

const ParticleWrapper: React.FC<ParticleWrapperProps> = ({ input }) => {
  const canvasRef = createRef<HTMLCanvasElement>();
  const divRef = createRef<HTMLDivElement>();
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const animationRef = useRef(-1);
  const [particles, setParticles] = useState<Particle[]>([]);

  const { initScene, initParticles } = useInitParticles({ ctx, canvasWidth, canvasHeight, particles, setParticles, input });

  //particle updating methods
  const loop = useCallback(() => {
    //if we have a canvas element then we can start rendering things
    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      //iterate through the particles and display each particle
      for (let i = 0; i < particles.length; i++) {
        const p: Particle = particles[i];
        p.updateParticle();
        p.renderParticle(ctx);
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
      setCanvasWidth(canvasRef.current?.offsetWidth ?? 0);
      setCanvasHeight(canvasRef.current?.offsetHeight ?? 0);
    }
  }, [canvasRef]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} width={canvasWidth + "px"} height={canvasHeight + "px"} />;
};

export default ParticleWrapper;
