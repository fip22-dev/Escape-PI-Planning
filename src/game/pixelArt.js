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

export function drawPixelPerson(scene, x, y, shirt, variant = 0, parent = null, role = "") {
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
  // Small silhouettes supplement the persistent role labels; never rely on colour alone.
  if (role) {
    rect(5, 6, 1, 4, PIXEL_PALETTE.cream);
    rect(6, 6, 1, 4, PIXEL_PALETTE.cream);
    rect(5, 10, 2, 2, PIXEL_PALETTE.paper);
    if (role === "RTE") {
      rect(1, 9, 3, 5, PIXEL_PALETTE.ink);
      rect(2, 10, 2, 3, PIXEL_PALETTE.paper);
    } else if (role === "P&T") {
      rect(8, 9, 3, 4, PIXEL_PALETTE.cream);
      rect(9, 9, 1, 1, PIXEL_PALETTE.hair);
    } else if (role === "BO") {
      rect(3, 4, 6, 1, PIXEL_PALETTE.ink);
      rect(9, 11, 3, 3, PIXEL_PALETTE.hair);
    } else if (role === "PM") {
      rect(8, 9, 4, 4, PIXEL_PALETTE.paper);
      rect(9, 10, 2, 1, PIXEL_PALETTE.blue);
    } else if (role.startsWith("PO")) {
      rect(1, 10, 3, 4, PIXEL_PALETTE.paper);
      rect(2, 11, 2, 1, PIXEL_PALETTE.orange);
      rect(2, 13, 2, 1, PIXEL_PALETTE.green);
    } else if (role === "Scrum Master") {
      rect(1, 10, 3, 3, PIXEL_PALETTE.cream);
      rect(2, 11, 1, 1, PIXEL_PALETTE.ink);
    }
  }
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
        : tile === "door" ? (alternate ? PIXEL_PALETTE.hall : PIXEL_PALETTE.hallAlt)
          : alternate ? PIXEL_PALETTE.floor : PIXEL_PALETTE.floorAlt;
  graphics.fillStyle(base).fillRect(px, py, size, size);
  graphics.fillStyle(0x283936, 0.12).fillRect(px, py + size - 1, size, 1);
  graphics.fillStyle(0xf2e6c8, 0.12).fillRect(px + 1, py + 1, size - 2, 1);
  if ((x * 13 + y * 7) % 5 === 0) {
    graphics.fillStyle(0x675f4b, 0.12).fillRect(px + 4, py + 6, 1, 1);
    graphics.fillStyle(0xf7e8bd, 0.15).fillRect(px + 11, py + 12, 1, 1);
  }
}

export function drawPixelFurniture(scene, objects, tileSize) {
  const g = scene.add.graphics().setDepth(1);
  for (const object of objects) {
    const x = object.x * tileSize;
    const y = object.y * tileSize;
    const w = object.width * tileSize;
    const h = object.height * tileSize;
    // Inset shadows stay within the existing object footprint.
    g.fillStyle(PIXEL_PALETTE.ink, 0.28).fillRect(x + 2, y + h - 3, w - 4, 2);
    if (object.type === "table") {
      g.fillStyle(0x463f32).fillRect(x + 1, y + 3, w - 2, h - 3);
      g.fillStyle(0xb59a6b).fillRect(x + 1, y + 1, w - 2, h - 4);
      g.lineStyle(1, 0xe6ce91).strokeRect(x + 2, y + 2, w - 4, h - 6);
      if (object.surface === "break") {
        // Pausentische erhalten Essen und Kaffeetassen statt Arbeitsmaterial.
        g.fillStyle(0xe9e3cf).fillRect(x + 5, y + 6, 8, 4);
        g.fillStyle(0xb85f45).fillRect(x + 6, y + 5, 3, 3);
        g.fillStyle(0x78904f).fillRect(x + 10, y + 7, 3, 2);
        g.fillStyle(0xf1e9d5).fillRect(x + 20, y + 4, 4, 5);
        g.fillStyle(0x6f8188).fillRect(x + 19, y + 4, 1, 3);
        g.fillStyle(0x6f8188).fillRect(x + 24, y + 5, 2, 2);
        g.fillStyle(0xe9e3cf).fillRect(x + 28, y + 7, 5, 3);
      } else if (object.surface === "pi-snack") {
        // Der kleine PI-Tisch zeigt Obst, Gemüse und Gipfeli.
        g.fillStyle(0xd94f45).fillRect(x + 5, y + 5, 6, 6);
        g.fillStyle(0x9d3f39).fillRect(x + 6, y + 5, 2, 2);
        g.fillStyle(0x78a64b).fillRect(x + 5, y + 21, 6, 6);
        g.fillStyle(0xb2c96b).fillRect(x + 5, y + 21, 2, 2);
        g.fillStyle(0xe3b84f).fillRect(x + 4, y + 38, 8, 4);
        g.fillStyle(0xf5d98b).fillRect(x + 5, y + 39, 5, 1);
      } else {
        // Arbeitsmaterial ist Dekoration ohne eigene Kollisions- oder Sichtfläche.
        g.fillStyle(0x253c4b).fillRect(x + 3, y + 3, 10, 6);
        g.fillStyle(0x85b7c2).fillRect(x + 4, y + 4, 8, 3);
        g.fillStyle(0x6f8188).fillRect(x + 2, y + 9, 12, 2);
        g.fillStyle(0xf1e9d5).fillRect(x + 17, y + 3, 6, 7);
        g.fillStyle(0xaaa591).fillRect(x + 18, y + 5, 4, 1);
        g.fillStyle(0xf7ead1).fillRect(x + w - 7, y + 6, 4, 4);
        g.fillStyle(0x64442f).fillRect(x + w - 6, y + 6, 2, 1);
      }
    } else if (object.type === "chair") {
      g.fillStyle(0x374b56).fillRect(x + 4, y + 4, 8, 9);
      g.fillStyle(0x78978c).fillRect(x + 3, y + 2, 10, 4);
      g.fillStyle(0x56766f).fillRect(x + 4, y + 7, 8, 5);
      g.fillStyle(PIXEL_PALETTE.ink).fillRect(x + 3, y + 13, 2, 2).fillRect(x + 11, y + 13, 2, 2);
    } else if (object.type === "plant") {
      // Separated leaf clusters and a terracotta rim read clearly at 16 × 16.
      g.fillStyle(PIXEL_PALETTE.ink).fillRect(x + 4, y + 10, 9, 5);
      g.fillStyle(0xb76e48).fillRect(x + 5, y + 11, 7, 3);
      g.fillStyle(0xe0a56b).fillRect(x + 4, y + 10, 9, 2);
      g.fillStyle(0x33462c).fillRect(x + 7, y + 3, 2, 7);
      g.fillStyle(0x33462c).fillRect(x + 1, y + 4, 6, 5).fillRect(x + 9, y + 2, 6, 6);
      g.fillStyle(0x6e943c).fillRect(x + 2, y + 5, 4, 3).fillRect(x + 10, y + 3, 4, 4);
      g.fillStyle(0xc4d77a).fillRect(x + 2, y + 5, 3, 1).fillRect(x + 10, y + 3, 2, 2);
      g.fillStyle(0x33462c).fillRect(x + 5, y + 1, 5, 5);
      g.fillStyle(0x97b851).fillRect(x + 6, y + 2, 3, 3);
      g.fillStyle(0xd1e28c).fillRect(x + 6, y + 2, 2, 1);
    } else if (object.type === "coffee") {
      g.fillStyle(0x28343c).fillRect(x + 2, y + 1, 12, 14);
      g.fillStyle(0x82918a).fillRect(x + 3, y + 2, 10, 4);
      g.fillStyle(0xf2e0bc).fillRect(x + 6, y + 9, 5, 4);
      g.fillStyle(0xd5a355).fillRect(x + 11, y + 7, 2, 2);
      g.fillStyle(PIXEL_PALETTE.ink).fillRect(x + 4, y + 6, 7, 2);
      g.fillStyle(PIXEL_PALETTE.greenLight).fillRect(x + 11, y + 3, 1, 1);
    } else if (object.type === "whiteboard") {
      g.fillStyle(0x354a47).fillRect(x, y + 1, w, h - 2);
      g.fillStyle(0xf2e6c8).fillRect(x + 1, y + 2, w - 2, h - 4);
      for (let i = 0; i < 5; i += 1) {
        g.fillStyle(i % 2 ? 0xe6b66c : 0x8bb9ac).fillRect(x + 4 + i * 8, y + 5, 5, 5);
      }
    } else if (object.type === "sideboard") {
      g.fillStyle(0x5c4936).fillRect(x + 1, y + 1, w - 2, h - 2);
      g.fillStyle(0xb59a6b).fillRect(x + 2, y + 2, w - 4, 3);
      g.lineStyle(1, 0xd7c7a1).strokeRect(x + 3, y + 7, w / 2 - 4, 6);
      g.fillStyle(0xd7c7a1).fillRect(x + w - 7, y + 9, 2, 2);
    } else if (object.type === "printer") {
      g.fillStyle(0x3c4a52).fillRect(x + 2, y + 5, 12, 10);
      g.fillStyle(0xbac4af).fillRect(x + 1, y + 4, 14, 6);
      g.fillStyle(0xf3ecd9).fillRect(x + 4, y + 1, 8, 5);
      g.fillStyle(0x72af87).fillRect(x + 11, y + 6, 2, 2);
      g.fillStyle(0x1c2c33).fillRect(x + 4, y + 11, 8, 2);
      g.fillStyle(PIXEL_PALETTE.paper).fillRect(x + 5, y + 13, 6, 1);
    } else if (object.type === "bin") {
      g.fillStyle(0x4c6261).fillRect(x + 4, y + 5, 8, 10);
      g.fillStyle(0x82918a).fillRect(x + 3, y + 3, 10, 3);
      g.fillStyle(0x263c3b).fillRect(x + 5, y + 4, 6, 1);
    } else if (object.type === "screen") {
      g.fillStyle(0x3a4751).fillRect(x, y + 1, w, h - 2);
      g.fillStyle(0xf2e6c8).fillRect(x + 2, y + 3, w - 4, h - 6);
      g.fillStyle(0x90adb1);
      if (h > w) g.fillRect(x + Math.floor(w / 2) - 1, y + 8, 2, h - 16);
      else g.fillRect(x + 8, y + 6, w - 16, 2);
    }
  }
  return g;
}
