export const TILE_SIZE = 16;
export const MAP_WIDTH = 60;
export const MAP_HEIGHT = 52;

const WALL = "#";
const FLOOR = "r";
const HALL = "h";
const START = "s";
const EXIT = "e";
const DOOR = "d";

export function createFloorPlan() {
  const grid = Array.from({ length: MAP_HEIGHT }, () =>
    Array(MAP_WIDTH).fill(WALL),
  );

  const paint = (x, y, width, height, tile) => {
    for (let row = y; row < y + height; row += 1) {
      for (let column = x; column < x + width; column += 1) {
        if (grid[row] && column >= 0 && column < MAP_WIDTH) {
          grid[row][column] = tile;
        }
      }
    }
  };

  // Zwei parallele Gänge und drei verbindende Quergänge.
  paint(12, 2, 5, 38, HALL);
  paint(32, 2, 5, 38, HALL);
  for (const y of [8, 20, 32]) paint(16, y - 2, 18, 5, HALL);

  // Teamzimmer und optionale Nebenräume liegen seitlich an den Gängen.
  const rooms = [
    { label: "Windows\nClient Team", x: 2, y: 5, width: 10, height: 6, doorX: 11, doorY: 8 },
    { label: "Workplace Device\n& Print Solutions\nTeam", x: 2, y: 14, width: 10, height: 8, doorX: 11, doorY: 18 },
    { label: "Mac Workplace\nTeam", x: 2, y: 26, width: 10, height: 6, doorX: 11, doorY: 29 },
    { label: "M365 Tenant &\nCollaboration Team", x: 2, y: 34, width: 10, height: 6, doorX: 11, doorY: 37 },
    { label: "Windows Software\nTeam", x: 37, y: 5, width: 10, height: 7, doorX: 37, doorY: 8 },
    { label: "Enterprise Mobile\nServices Team", x: 37, y: 17, width: 10, height: 7, doorX: 37, doorY: 20 },
    { label: "Communication &\nMeetingroom\nSolutions Team", x: 37, y: 29, width: 10, height: 7, doorX: 37, doorY: 32 },
    { label: "Pausenraum", x: 18, y: 2, width: 10, height: 4, doorX: 23, doorY: 5 },
    { label: "Meeting 1", x: 18, y: 13, width: 8, height: 5, doorX: 21, doorY: 17 },
    { label: "Meeting 2", x: 17, y: 23, width: 6, height: 5, doorX: 20, doorY: 23 },
    { label: "Meeting 3", x: 25, y: 23, width: 7, height: 5, doorX: 28, doorY: 23 },
    { label: "Meeting 4", x: 17, y: 35, width: 6, height: 4, doorX: 20, doorY: 35 },
    { label: "Meeting 5", x: 24, y: 35, width: 6, height: 4, doorX: 27, doorY: 35 },
  ];

  for (const room of rooms) {
    paint(room.x, room.y, room.width, room.height, FLOOR);
    grid[room.doorY][room.doorX] = DOOR;
  }

  // Der PI-Einführungsraum ist vertikal und über die ganze Höhe gleichmässig breit.
  paint(29, 40, 14, 12, START);
  grid[39][34] = DOOR;

  // Der Ausgang liegt am nördlichen Ende des Hauptgangs.
  grid[2][34] = EXIT;

  return { grid, rooms, start: { x: 34, y: 47 } };
}

export const TILE_TYPES = { WALL, FLOOR, HALL, START, EXIT, DOOR };
