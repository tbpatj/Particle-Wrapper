import { useRef } from "react";

export interface FPSRef {
  calculatingFPS: number;
  fps: number;
  lastFrameTime: number;
  frames: number;
}

const useFPS = () => {
  const fpsRef = useRef<FPSRef>({
    fps: 0,
    lastFrameTime: new Date().getTime(),
    calculatingFPS: 0,
    frames: 0,
  });

  const updateFPS = () => {
    if (fpsRef.current.lastFrameTime !== 0) {
      const frameTime = performance.now();
      let fps = 1 / ((frameTime - fpsRef.current.lastFrameTime) / 1000);
      fpsRef.current.calculatingFPS = fpsRef.current.calculatingFPS + fps;
    }
    fpsRef.current.lastFrameTime = performance.now();
    fpsRef.current.frames++;
    if (fpsRef.current.frames > 60) {
      fpsRef.current.fps = Math.round(
        fpsRef.current.calculatingFPS / fpsRef.current.frames
      );
      fpsRef.current.calculatingFPS = fpsRef.current.fps;
      fpsRef.current.frames = 0;
    }
  };
  return { updateFPS, fpsRef };
};

export default useFPS;
