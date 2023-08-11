export interface MouseCursor {
  x: number;
  y: number;
  lastX: number;
  lastY: number;
  dx: number;
  dy: number;
  magSqr: number;
  scrollDX: number;
  scrollDY: number;
  leftMouseDown: boolean;
  rightMouseDown: boolean;
  lastRecordedTime: Date;
}

export const initialMouseCursorObject = {
  x: 0,
  y: 0,
  lastX: 0,
  lastY: 0,
  dx: 0,
  dy: 0,
  magSqr: 0,
  scrollDX: 0,
  scrollDY: 0,
  leftMouseDown: false,
  rightMouseDown: false,
  lastRecordedTime: new Date(),
};
