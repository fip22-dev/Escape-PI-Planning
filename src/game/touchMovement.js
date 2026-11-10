// A held perpendicular request wins at the first traversable tile. Until
// then continue the previous heading; reverse requests never fall back.
export function chooseTouchStep(requested, heading, canMove) {
  if (!requested) return null;
  if (canMove(requested)) return requested;
  if (heading && requested.x * heading.x + requested.y * heading.y === 0 && canMove(heading)) return heading;
  return null;
}
