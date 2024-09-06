import { Page } from "puppeteer";
import { getVillages } from "../player/playerHandler";
import scanTiles from "./mapScanner";
import { TaskResult } from "..";
import { goVillageResView } from "../village/goVillage";

const TILES_TO_SCAN = 100;
let lastScanTime = 0;

const scannerRunner = async (
  page: Page,
  interval: number
): Promise<TaskResult> => {
  const skip = shouldSkip(interval);
  if (skip) {
    return skip;
  }

  await performScan(page);
  updateLastScanTime();
  return { nextExecutionTime: getNextExecutionTime(interval), skip: false };
};

const shouldSkip = (interval: number): TaskResult | null => {
  const nextExecutionTime = getNextExecutionTime(interval);
  return nextExecutionTime > Date.now()
    ? { nextExecutionTime, skip: true }
    : null;
};

const getNextExecutionTime = (interval: number): number => {
  return lastScanTime + interval;
};

const updateLastScanTime = (): void => {
  lastScanTime = Date.now();
};

const performScan = async (page: Page): Promise<void> => {
  try {
    const villas = getVillages();
    const capitalVilla = villas.find((villa) => villa.capital);
    await goVillageResView(capitalVilla);

    if (!capitalVilla) {
      console.log("Capital villa not found. Unable to start scanning.");
      return;
    }

    const { coordinateX, coordinateY } = capitalVilla;

    await scanTiles(page, coordinateX, coordinateY, TILES_TO_SCAN);
  } catch (error) {
    console.error("Error in scannerRunner:", error);
  }
};

export default scannerRunner;
