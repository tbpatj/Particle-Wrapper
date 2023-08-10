import { MouseRef } from "../hooks/useMouseCursor";

export const excludeOldMouseEntries = (mouseRef: MouseRef) => {
  if (new Date().getTime() - mouseRef.current.lastRecordedTime.getTime() > 100)
    mouseRef.current = { ...mouseRef.current, dx: 0, dy: 0 };
};
