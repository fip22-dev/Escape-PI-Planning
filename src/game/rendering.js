// Game rules and layout use 320 × 240 logical units. Render four samples per
// unit so text retains its curves instead of enlarging a 6–9 px raster.
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
}

export function routeRenderLayers(scene) {
  if (!scene.uiCamera) return;
  const fixed = scene.children.list.filter(object => object.scrollFactorX === 0 && object.scrollFactorY === 0);
  const world = scene.children.list.filter(object => !fixed.includes(object));
  scene.cameras.main.ignore(fixed);
  scene.uiCamera.ignore(world);
}
