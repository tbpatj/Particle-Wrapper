import { MouseCursor } from "../types/mouse";

export type MouseRef = React.MutableRefObject<MouseCursor>;
type CanvasRef = React.RefObject<HTMLCanvasElement>;

export type ReactMouseEvent = React.MouseEvent<HTMLCanvasElement, MouseEvent>;

interface UseMouseCursor {
  handleMouseMove: (e: ReactMouseEvent) => void;
}

const useMouseCursor: (
  ref: MouseRef,
  canvasRef: CanvasRef
) => UseMouseCursor = (ref, canvasRef) => {
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
      ref.current = {
        ...ref.current,
        x: x,
        y,
        dx,
        dy,
        magSqr: dx * dx + dy * dy,
        lastRecordedTime: now,
      } as MouseCursor;
    }
  };
  return { handleMouseMove };
};

export default useMouseCursor;
