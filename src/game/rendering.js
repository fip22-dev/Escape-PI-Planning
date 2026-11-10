// UI uses a 320 × 240 reference layout; mobile expanded view widens the camera.
// Render four samples per unit so text stays sharp without stretching.
export const RENDER_SCALE = 4;
export const VIEW_WIDTH = 320;
export const VIEW_HEIGHT = 240;

export function configureRendering(scene, world = false) {
  scene.cameras.main.setZoom(RENDER_SCALE);
  scene.cameras.main.roundPixels = true;
  if (world) {
    // A separate fixed camera keeps HUD/dialog coordinates independent of the
    // world camera's zoom and follow position, including pointer hit testing.
    scene.uiCamera = scene.cameras.add(0, 0, VIEW_WIDTH * RENDER_SCALE, VIEW_HEIGHT * RENDER_SCALE);
    scene.uiCamera.setName("interface").setOrigin(0, 0).setZoom(RENDER_SCALE);
  } else {
    scene.cameras.main.setOrigin(0, 0).setScroll(0, 0);
  }
  const layout = () => {
    const width = scene.scale.width;
    const height = scene.scale.height;
    const extra = width / RENDER_SCALE - VIEW_WIDTH;
    scene.cameras.main.setSize(width, height);
    if (!world) {
      scene.cameras.main.setScroll(-extra / 2, 0);
      scene.drawWideBackdrop?.();
    } else {
      scene.uiCamera.setViewport(0, 0, width, height);
      const anchored = new Set([scene.hudPanel, scene.hudLabel, scene.timerText,
        ...(scene.speechBubbles ?? []).flatMap(bubble => [bubble.shape, bubble.tail, bubble.text])]);
      for (const object of scene.children.list) {
        if (object.scrollFactorX !== 0 || anchored.has(object)) continue;
        object.uiBaseX ??= object.x;
        object.x = object.uiBaseX + extra / 2;
      }
    }
  };
  scene.applyViewportLayout = layout;
  scene.scale.on("resize", layout);
  scene.events.once("shutdown", () => { scene.scale.off("resize", layout); scene.applyViewportLayout = null; });
  layout();
}

export function routeRenderLayers(scene) {
  if (!scene.uiCamera) return;
  const fixed = scene.children.list.filter(object => object.scrollFactorX === 0 && object.scrollFactorY === 0);
  const world = scene.children.list.filter(object => !fixed.includes(object));
  scene.cameras.main.ignore(fixed);
  scene.uiCamera.ignore(world);
  scene.applyViewportLayout?.();
}
