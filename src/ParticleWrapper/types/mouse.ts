export interface MouseCursor {
  x: number;
  y: number;
  dx: number;
  dy: number;
  scrollDX: number;
  scrollDY: number;
  leftMouseDown: boolean;
  rightMouseDown: boolean;
  lastRecordedTime: Date;
}

export const initialMouseCursorObject = {
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
  scrollDX: 0,
  scrollDY: 0,
  leftMouseDown: false,
  rightMouseDown: false,
  lastRecordedTime: new Date(),
};
