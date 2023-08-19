import { useEffect } from "react";
import { MouseCursor } from "../types/mouse";

export type MouseRef = React.MutableRefObject<MouseCursor>;
type CanvasRef = React.RefObject<HTMLCanvasElement | undefined>;

export type ReactMouseEvent = React.MouseEvent<HTMLCanvasElement, MouseEvent>;

interface UseMouseCursor {
  handleMouseMove: (e: ReactMouseEvent) => void;
  handleMouseDown: (e: ReactMouseEvent) => void;
  handleMouseUp: (e: ReactMouseEvent) => void;
}

const useMouseCursor: (
  ref: MouseRef,
  canvasRef: CanvasRef
) => UseMouseCursor = (ref, canvasRef) => {
  const handleMouseUp = (e: ReactMouseEvent) => {
    if (e.button === 0) {
      ref.current = { ...ref.current, leftMouseDown: false };
    } else if (e.button === 2) {
      ref.current = { ...ref.current, rightMouseDown: false };
    }
  };
  const handleMouseDown = (e: ReactMouseEvent) => {
    if (e.button === 0) {
      ref.current = { ...ref.current, leftMouseDown: true, leftClick: true };
    } else if (e.button === 2)
      ref.current = { ...ref.current, rightMouseDown: true, rightClick: true };
  };
  const handleMouseMove = (e: ReactMouseEvent) => {
    if (canvasRef.current) {
      const now = new Date();
      let rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      let dx = 0;
      let dy = 0;
      //make sure we aren't recording the user moving the cursor out of the canvas and then to another position on the other side of the canvas making things flip out
      if (now.getTime() - ref.current.lastRecordedTime.getTime() < 100) {
        dx = x - ref.current.x;
        dy = y - ref.current.y;
      }
      const lastX = ref.current.x;
      const lastY = ref.current.y;
      //get the velocity vector properties
      const magSqr = dx * dx + dy * dy;
      const mag = Math.sqrt(magSqr);
      const nDx = mag === 0 ? mag : dx / mag;
      const nDy = mag === 0 ? mag : dy / mag;
      ref.current = {
        ...ref.current,
        x,
        y,
        lastX,
        lastY,
        dx,
        dy,
        magSqr: magSqr,
        mag: mag,
        nDx,
        nDy,
        lastRecordedTime: now,
      } as MouseCursor;
    }
  };
  useEffect(() => {
    if (ref.current.leftClick === true)
      ref.current = { ...ref.current, leftClick: false };
    if (ref.current.rightClick === true)
      ref.current = { ...ref.current, rightClick: false };
  }, [ref.current.rightClick, ref.current.leftClick]);

  return { handleMouseMove, handleMouseDown, handleMouseUp };
};

export default useMouseCursor;
