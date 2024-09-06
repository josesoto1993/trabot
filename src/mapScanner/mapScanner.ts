import { Page } from "puppeteer";
import { getAllTiles, upsertTile } from "../services/tileService";
import { ITileSchema } from "../schemas/tileSchema";
import getTileData from "./tileData";

const MIN_COORD = -200;
const MAX_COORD = 200;
const MAP_SIZE = MAX_COORD - MIN_COORD + 1;

interface ICoordinate {
  coordinateX: number;
  coordinateY: number;
}

const scanTiles = async (
  page: Page,
  centerX: number,
  centerY: number,
  tilesToScan: number
): Promise<void> => {
  try {
    const remainingToScan = await getNotScannedTiles();

    const tilesToProcess = remainingToScan
      .toSorted(tileSorter(centerX, centerY))
      .slice(0, tilesToScan);

    if (tilesToProcess.length === 0) {
      console.log("All tiles have been scanned. No more tiles to process.");
      return;
    }

    for (const tile of tilesToProcess) {
      await scanTile(tile, page);
    }
  } catch (error) {
    console.error("Error scanning tiles:", error);
  }
};

const scanTile = async (tile: ICoordinate, page: Page): Promise<void> => {
  const { coordinateX, coordinateY } = tile;

  console.log(`Scanning tile at (${coordinateX}, ${coordinateY})...`);

  const tileData = await getTileData(page, coordinateX, coordinateY);

  await upsertTile(tileData);
};

const getNotScannedTiles = async (): Promise<ICoordinate[]> => {
  const alreadyScannedTiles = await getAllTiles();
  const allMapTiles = generateAllMapTiles();
  return allMapTiles.filter((tile) => {
    return !alreadyScannedTiles.some(
      (scannedTile) =>
        scannedTile.coordinateX === tile.coordinateX &&
        scannedTile.coordinateY === tile.coordinateY
    );
  });
};

const generateAllMapTiles = (): ICoordinate[] => {
  const allTiles = [];
  for (let x = MIN_COORD; x <= MAX_COORD; x++) {
    for (let y = MIN_COORD; y <= MAX_COORD; y++) {
      allTiles.push({ coordinateX: x, coordinateY: y });
    }
  }
  return allTiles;
};

const tileSorter = (
  centerX: number,
  centerY: number
): ((tile: ITileSchema, otherTile: ITileSchema) => number) => {
  return (tile, otherTile) => {
    const distanceA = calculateWrappedDistance(
      centerX,
      centerY,
      tile.coordinateX,
      tile.coordinateY
    );
    const distanceB = calculateWrappedDistance(
      centerX,
      centerY,
      otherTile.coordinateX,
      otherTile.coordinateY
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
