export const OBJECT_RULES = {
  table: { blocksMovement: true, blocksSight: true },
  plant: { blocksMovement: true, blocksSight: true },
  coffee: { blocksMovement: true, blocksSight: true },
  chair: { blocksMovement: false, blocksSight: false },
  screen: { blocksMovement: false, blocksSight: false },
  whiteboard: { blocksMovement: false, blocksSight: false },
  sideboard: { blocksMovement: true, blocksSight: true },
  printer: { blocksMovement: true, blocksSight: true },
  bin: { blocksMovement: true, blocksSight: false },
};

export function createRoomObjects(rooms) {
  const objects = [];
  const add = (type, x, y, width = 1, height = 1) => {
    objects.push({ type, x, y, width, height, ...OBJECT_RULES[type] });
  };
  for (const room of rooms) {
    if (room.label === "Pausenraum") continue;
    const meeting = room.label.startsWith("Meeting");
    // Kleine Leinwände links an der oberen Wand, neben statt auf den Türfeldern.
    add("screen", room.x, room.y, meeting ? 2 : 3, 1);
    const width = meeting ? 2 : 4;
    const x = room.x + Math.floor((room.width - width) / 2);
    const y = room.y + 2;
    const height = meeting ? 1 : 2;
    add("table", x, y, width, height);
    for (let dx = 0; dx < width; dx += 1) {
      add("chair", x + dx, y - 1);
      add("chair", x + dx, y + height);
    }
    // Ecken abseits der Tür; in kleinen Meeting-Räumen nur eine Pflanze.
    add("plant", room.x, room.y + room.height - 1);
    if (!meeting) {
      add("plant", room.x + room.width - 1, room.y);
      add("whiteboard", room.x + 4, room.y, 3, 1);
      add("sideboard", room.x + room.width - 3, room.y + room.height - 1, 2, 1);
      if (room.label.startsWith("Workplace Device")) {
        add("printer", room.x + 1, room.y + room.height - 1);
      }
    }
  }
  for (const x of [19, 25]) {
    add("table", x, 4, 2, 1);
    for (const dx of [0, 1]) {
      add("chair", x + dx, 3);
      add("chair", x + dx, 5);
    }
  }
  for (const x of [18, 22, 27]) add("coffee", x, 2);
  for (const x of [19, 23, 26]) add("bin", x, 2);
  add("plant", 18, 5);
  add("plant", 27, 5);

  add("screen", 37, 40, 5, 1);
  add("coffee", 29, 43);
  add("bin", 29, 44);
  for (const y of [40, 47, 51]) add("plant", 29, y);
  for (const y of [44, 46, 48, 50]) {
    for (const x of [31, 32, 33, 36, 37, 38, 40, 41]) add("chair", x, y);
  }
  // Randnischen, wo die Aussenwände der Seitenräume den Gang wieder freigeben.
  for (const [x, y] of [[12, 3], [12, 12], [12, 24], [36, 3], [36, 13], [36, 25], [36, 38]]) {
    add("plant", x, y);
  }
  return objects;
}

export function objectAt(objects, x, y, property) {
  return objects.some(object => object[property] && x >= object.x && x < object.x + object.width
    && y >= object.y && y < object.y + object.height);
}
