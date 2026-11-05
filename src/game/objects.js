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
  const add = (type, x, y, width = 1, height = 1, extra = {}) => {
    objects.push({ type, x, y, width, height, ...OBJECT_RULES[type], ...extra });
  };
  for (const room of rooms) {
    if (room.label === "Pausenraum") continue;
    const meeting = room.label.startsWith("Meeting");
    const m365 = room.label.startsWith("M365");
    const mac = room.label.startsWith("Mac Workplace");
    const windowsClient = room.label.startsWith("Windows\nClient");
    const workplaceDevice = room.label.startsWith("Workplace Device");
    const leftWallScreen = !meeting && room.x < 30;
    const screenHeight = room.label === "Meeting 1" ? 3 : meeting ? 2 : 3;
    const screenX = leftWallScreen ? room.x : room.x + room.width - 1;
    add("screen", screenX, room.y + 1, 1, screenHeight);
    const width = meeting ? 2 : 4;
    const x = room.x + Math.floor((room.width - width) / 2);
    const y = room.y + (room.label.startsWith("Workplace Device") ? 3 : 2);
    const height = meeting ? 1 : 2;
    add("table", x, y, width, height);
    for (let dx = 0; dx < width; dx += 1) {
      add("chair", x + dx, y - 1);
      add("chair", x + dx, y + height);
    }
    // Ecken abseits der Tür; in kleinen Meeting-Räumen nur eine Pflanze.
    if (!meeting) {
      const swappedFurniture = m365 || mac || windowsClient || workplaceDevice;
      add("plant", swappedFurniture ? room.x + room.width - 1 : room.x,
        room.y + room.height - 1);
      add("plant", swappedFurniture ? room.x : room.x + room.width - 1,
        swappedFurniture ? room.y : room.x >= 30 ? room.y + room.height - 1 : room.y);
      add("whiteboard", room.x + 4, room.y, 3, 1);
      add("sideboard", swappedFurniture ? room.x : room.x + room.width - 3,
        room.y + room.height - 1, 2, 1);
      if (workplaceDevice) {
        add("printer", room.x + (swappedFurniture ? 2 : 1), room.y + room.height - 1);
      }
    } else {
      add("plant", room.x, room.y + room.height - 1);
    }
  }
  for (const x of [19, 25]) {
    add("table", x, 4, 2, 1, { surface: "break" });
    for (const dx of [0, 1]) {
      add("chair", x + dx, 3);
      add("chair", x + dx, 5);
    }
  }
  for (const x of [18, 22, 27]) add("coffee", x, 1);
  for (const x of [19, 23, 26]) add("bin", x, 1);
  add("plant", 18, 5);
  add("plant", 27, 5);
  add("printer", 16, 2);

  add("screen", 37, 40, 5, 1);
  add("coffee", 29, 43);
  add("table", 29, 44, 1, 3, { surface: "pi-snack" });
  add("bin", 29, 47);
  for (const y of [40, 48, 51]) add("plant", 29, y);
  // Fünf Reihen mit einer Leerreihe dazwischen; zwei zusätzliche Plätze links.
  // Die rechte Wand hat eine freie Kachel, die Laufspur links bleibt offen.
  for (let y = 42; y <= 50; y += 2) {
    for (let x = 36; x <= 41; x += 1) add("chair", x, y);
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
