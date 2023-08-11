export interface MouseCursor {
  x: number;
  y: number;
  lastX: number;
  lastY: number;
  //velocity vector ie change in x and change in y
  dx: number;
  dy: number;
  //the magnitude of the velocity vector squared
  magSqr: number;
  //the actual maginitude of the velocity vector
  mag: number;
  //normalized velocity vector
  nDx: number;
  nDy: number;
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
  mag: 0,
  nDx: 0,
  nDy: 0,
  scrollDX: 0,
  scrollDY: 0,
  leftMouseDown: false,
  rightMouseDown: false,
  lastRecordedTime: new Date(),
};
