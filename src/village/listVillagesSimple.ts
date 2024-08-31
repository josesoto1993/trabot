import { Page } from "puppeteer";
import Village from "../models/village";
import { validateActiveVillages, validateVillagesCount } from "./villageSlots";

const VILLAGES_SIDEBAR = "div.villageList div.dropContainer";

interface VillageData {
  id: string;
  name: string | null;
  coordinateX: number;
  coordinateY: number;
  active: boolean;
}

export const getVillagesInfo = async (page: Page): Promise<Village[]> => {
  try {
    await waitForVillageList(page);

    const villages = await getVillagesFromPage(page);
    if (villages.length > 0) {
      villages[0].capital = true;
    }

    validateActiveVillages(villages);
    await validateVillagesCount(page, villages);

    return villages;
  } catch (error) {
    console.error("Error getting villages info:", error);
    throw error;
  }
};

const waitForVillageList = async (page: Page): Promise<void> => {
  try {
    await page.waitForSelector(VILLAGES_SIDEBAR);
  } catch (error) {
    console.error("Error waiting for village list:", error);
    throw error;
  }
};

const getVillagesFromPage = async (page: Page): Promise<Village[]> => {
  try {
    const villagesData: VillageData[] = await page.$$eval(
      VILLAGES_SIDEBAR,
      (nodes) => {
        return nodes.map((node) => {
          const listEntry = node.querySelector("div.listEntry");
          const coordinatesGrid = node.querySelector("span.coordinatesGrid");

          if (!listEntry || !coordinatesGrid) {
            throw new Error("Required elements not found.");
          }

          const id = coordinatesGrid.getAttribute("data-did");
          const name = coordinatesGrid.getAttribute("data-villagename");
          const coordinateX = parseInt(
            coordinatesGrid.getAttribute("data-x"),
            10
          );
          const coordinateY = parseInt(
            coordinatesGrid.getAttribute("data-y"),
            10
          );
          const active = listEntry.classList.contains("active");

          return { id, name, coordinateX, coordinateY, active };
        });
      }
    );

    return villagesData.map(
      (villageData) =>
        new Village(
          villageData.id,
          villageData.name,
          villageData.coordinateX,
          villageData.coordinateY,
          villageData.active
        )
    );
  } catch (error) {
    console.error("Error extracting villages from page:", error);
    throw error;
  }
};
