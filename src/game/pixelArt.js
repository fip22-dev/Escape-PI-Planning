export const PIXEL_PALETTE = {
  ink: 0x243333,
  inkLight: 0x354a47,
  cream: 0xf2e6c8,
  paper: 0xd7c7a1,
  floor: 0xc8b994,
  floorAlt: 0xbba985,
  hall: 0x82918a,
  hallAlt: 0x74847e,
  wall: 0x4a5550,
  wallLight: 0x687169,
  green: 0x78934f,
  greenLight: 0xa7b866,
  blue: 0x5793a0,
  orange: 0xe18455,
  red: 0xc95d4c,
  skin: 0xe9bd91,
  hair: 0x463b33,
  trousers: 0x374b56,
};

export function drawPixelPerson(scene, x, y, shirt, variant = 0, parent = null) {
  const g = scene.add.graphics();
  const pixel = 1;
  const px = -6;
  const py = -8;
  const rect = (cx, cy, width, height, color) => {
    g.fillStyle(color, 1).fillRect(px + cx * pixel, py + cy * pixel, width * pixel, height * pixel);
  };
  const skin = variant % 3 === 0 ? 0xe9bd91 : variant % 3 === 1 ? 0xc98f6b : 0xf0c99c;

  rect(4, 0, 4, 1, 0x463b33);
  rect(3, 1, 6, 2, 0x463b33);
  rect(4, 3, 4, 3, skin);
  rect(7, 4, 1, 1, 0x463b33);
  rect(3, 6, 6, 1, 0x243333);
  rect(2, 7, 8, 3, shirt);
  rect(1, 7, 2, 3, shirt);
  rect(9, 7, 2, 3, shirt);
  rect(3, 10, 6, 2, 0x374b56);
  rect(3, 12, 2, 3, 0x374b56);
  rect(7, 12, 2, 3, 0x374b56);
  rect(2, 15, 3, 1, 0x243333);
  rect(7, 15, 3, 1, 0x243333);
  rect(3, 7, 1, 1, 0xf2e6c8);
  rect(8, 7, 1, 1, 0xf2e6c8);
  if (parent) parent.add(g);
  else g.setPosition(x, y).setDepth(3);
  return g;
}

export function drawPixelTile(graphics, tile, px, py, size, x, y) {
  const alternate = (x + y) % 2 === 0;
  if (tile === "wall") {
    graphics.fillStyle(PIXEL_PALETTE.wall).fillRect(px, py, size, size);
    graphics.fillStyle(PIXEL_PALETTE.wallLight).fillRect(px + 1, py + 1, size - 2, 2);
    graphics.fillStyle(PIXEL_PALETTE.inkLight).fillRect(px + 1, py + 7, size - 2, 1);
    graphics.fillStyle(PIXEL_PALETTE.wallLight).fillRect(px + (alternate ? 4 : 10), py + 3, 1, 4);
    graphics.fillStyle(PIXEL_PALETTE.inkLight).fillRect(px + (alternate ? 11 : 5), py + 9, 1, 5);
    return;
  }
  const base = tile === "hall" ? (alternate ? PIXEL_PALETTE.hall : PIXEL_PALETTE.hallAlt)
    : tile === "start" ? (alternate ? 0x819579 : 0x778b71)
      : tile === "exit" ? 0x90a96d
        : tile === "door" ? 0xd4b979
          : alternate ? PIXEL_PALETTE.floor : PIXEL_PALETTE.floorAlt;
  graphics.fillStyle(base).fillRect(px, py, size, size);
  graphics.fillStyle(0x283936, 0.12).fillRect(px, py + size - 1, size, 1);
  graphics.fillStyle(0xf2e6c8, 0.12).fillRect(px + 1, py + 1, size - 2, 1);
  if ((x * 13 + y * 7) % 5 === 0) {
    graphics.fillStyle(0x675f4b, 0.12).fillRect(px + 4, py + 6, 1, 1);
    graphics.fillStyle(0xf7e8bd, 0.15).fillRect(px + 11, py + 12, 1, 1);
  }
}
