// A clockwise CSS rotation swaps the canvas axes. Phaser's FIT scale and input
// normally assume an unrotated DOM rectangle, so adapt both at the boundary.
export function bindRotatedLayout(game, target) {
  const scale = game.scale;
  const input = game.input;
  const getParentBounds = scale.getParentBounds;
  const updateCenter = scale.updateCenter;
  const transformPointer = input.transformPointer;
  const rotated = () => target.classList.contains("is-rotated");

  scale.getParentBounds = function () {
    if (!rotated()) return getParentBounds.call(this);
    const width = this.parent.clientWidth;
    const height = this.parent.clientHeight;
    const changed = width !== this.parentSize.width || height !== this.parentSize.height;
    this.parentSize.setSize(width, height);
    return changed;
  };

  scale.updateCenter = function () {
    if (!rotated()) return updateCenter.call(this);
    // Center in the stage's local coordinates, before the CSS transform.
    this.canvas.style.marginLeft = `${(this.parentSize.width - this.canvas.clientWidth) / 2}px`;
    this.canvas.style.marginTop = `${(this.parentSize.height - this.canvas.clientHeight) / 2}px`;
  };

  input.transformPointer = function (pointer, pageX, pageY, wasMove) {
    if (!rotated()) return transformPointer.call(this, pointer, pageX, pageY, wasMove);
    const rect = game.canvas.getBoundingClientRect();
    const x = (pageY - window.scrollY - rect.top) / rect.height * scale.baseSize.width;
    const y = (rect.right - (pageX - window.scrollX)) / rect.width * scale.baseSize.height;
    // Feed the inverse-rotated point through Phaser to retain its smoothing,
    // previous-position tracking, camera hit testing and drag handling.
    return transformPointer.call(this, pointer,
      scale.canvasBounds.left + x / scale.displayScale.x,
      scale.canvasBounds.top + y / scale.displayScale.y, wasMove);
  };

  return { destroy() {
    scale.getParentBounds = getParentBounds;
    scale.updateCenter = updateCenter;
    input.transformPointer = transformPointer;
  } };
}
