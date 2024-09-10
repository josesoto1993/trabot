import { Page } from "puppeteer";
import { getAllTiles, upsertTile } from "../services/tileService";
import getTileData from "./tileData";
import { upsertTask } from "../services/taskService";
import TaskNames from "../constants/taskNames";
import ICoordinates from "../commonInterfaces/coordinates";

const MIN_COORD = -200;
const MAX_COORD = 200;
const MAP_SIZE = MAX_COORD - MIN_COORD + 1;

const scanTiles = async (
  page: Page,
  center: ICoordinates,
  tilesToScan: number
): Promise<void> => {
  try {
    const remainingToScan = await getNotScannedTiles();

    const tilesToProcess = remainingToScan
      .toSorted(tileSorter(center))
      .slice(0, tilesToScan);

    if (tilesToProcess.length === 0) {
      console.log("All tiles have been scanned. No more tiles to process.");
      const stopMapScanner = { taskName: TaskNames.MAP_SCANNER, status: false };
      await upsertTask(stopMapScanner);
      return;
    }

    for (const tile of tilesToProcess) {
      await scanTile(tile, page);
    }
  } catch (error) {
    console.error("Error scanning tiles:", error);
  }
};

const scanTile = async (
  coordinates: ICoordinates,
  page: Page
): Promise<void> => {
  console.log(`Scanning tile at (${coordinates.x}, ${coordinates.y})...`);
  const tileData = await getTileData(page, coordinates);

  await upsertTile(tileData);
};

const getNotScannedTiles = async (): Promise<ICoordinates[]> => {
  const alreadyScannedTiles = await getAllTiles();
  const scannedTileSet = new Set(
    alreadyScannedTiles.map(
      (tile) => `${tile.coordinates.x},${tile.coordinates.y}`
    )
  );
  const allMapTiles = generateAllMapTiles();

  return allMapTiles.filter(
    (tile) => !scannedTileSet.delete(`${tile.x},${tile.y}`)
  );
};

const generateAllMapTiles = (): ICoordinates[] => {
  const allTiles = [];
  for (let x = MIN_COORD; x <= MAX_COORD; x++) {
    for (let y = MIN_COORD; y <= MAX_COORD; y++) {
      allTiles.push({ x, y } as ICoordinates);
    }
  }
  return allTiles;
};

const tileSorter = (
  center: ICoordinates
): ((tile: ICoordinates, otherTile: ICoordinates) => number) => {
  return (tile, otherTile) => {
    const distanceA = calculateWrappedDistance(
      center.x,
      center.y,
      tile.x,
      tile.y
    );
    const distanceB = calculateWrappedDistance(
      center.x,
      center.y,
      otherTile.x,
      otherTile.y
    );
    return distanceA - distanceB;
  };
};

const calculateWrappedDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const xDistance = calculateWrappedDistance1D(x1, x2);
  const yDistance = calculateWrappedDistance1D(y1, y2);

  return xDistance * xDistance + yDistance * yDistance;
};

const calculateWrappedDistance1D = (c1: number, c2: number): number => {
  const dx = Math.abs(c1 - c2);
  const wrappedDx = MAP_SIZE - dx;

  const xDistance = Math.min(dx, wrappedDx);

  return xDistance;
};

export default scanTiles;
