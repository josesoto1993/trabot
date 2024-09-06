import { Page } from "puppeteer";
import { getVillages } from "../player/playerHandler";
import scanTiles from "./mapScanner";
import { TaskResult } from "..";
import { goVillageResView } from "../village/goVillage";

const SCAN_INTERVAL = 15 * 60 * 1000;
const TILES_TO_SCAN = 100;
let lastScanTime = 0;

const scannerRunner = async (page: Page): Promise<TaskResult> => {
  const skip = shouldSkip();
  if (skip) {
    return skip;
  }

  await performScan(page);
  updateLastScanTime();
  return { nextExecutionTime: getNextExecutionTime(), skip: false };
};

const shouldSkip = (): TaskResult | null => {
  const nextExecutionTime = getNextExecutionTime();
  return nextExecutionTime > Date.now()
    ? { nextExecutionTime, skip: true }
    : null;
};

const getNextExecutionTime = (): number => {
  return lastScanTime + SCAN_INTERVAL;
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
