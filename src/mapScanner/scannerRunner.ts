import { Page } from "puppeteer";
import { getVillages } from "../player/playerHandler";
import scanTiles from "./mapScanner";
import { TaskResult } from "..";

const SCAN_INTERVAL = 5 * 60 * 1000;
const TILES_TO_SCAN = 20;

const scannerRunner = async (page: Page): Promise<TaskResult> => {
  await performScan(page);
  return { nextExecutionTime: SCAN_INTERVAL, skip: false };
};

const performScan = async (page: Page): Promise<void> => {
  try {
    const villas = getVillages();
    const capitalVilla = villas.find((villa) => villa.capital);

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
