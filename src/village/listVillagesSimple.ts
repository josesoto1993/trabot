import { Page } from "puppeteer";
import Village from "../models/village";
import { validateActiveVillages, validateVillagesCount } from "./villageSlots";
import ICoordinates from "../commonInterfaces/coordinates";

const VILLAGES_SIDEBAR = "div.villageList div.dropContainer";
const CAPITAL_NAME: string = process.env.CAPITAL_NAME || "HDS 01";

interface VillageData {
  id: string;
  name: string | null;
  coordinate: ICoordinates;
  active: boolean;
}

const getVillagesInfo = async (page: Page): Promise<Village[]> => {
  try {
    await waitForVillageList(page);

    const villages = await getVillagesFromPage(page);
    setCapital(villages);

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
          const x = parseInt(coordinatesGrid.getAttribute("data-x"), 10);
          const y = parseInt(coordinatesGrid.getAttribute("data-y"), 10);
          const coordinate = { x, y };
          const active = listEntry.classList.contains("active");

          return { id, name, coordinate, active };
        });
      }
    );

    return villagesData.map(
      (villageData) =>
        new Village(
          villageData.id,
          villageData.name,
          villageData.coordinate,
          villageData.active
        )
    );
  } catch (error) {
    console.error("Error extracting villages from page:", error);
    throw error;
  }
};

const setCapital = (villages: Village[]): void => {
  if (!CAPITAL_NAME) {
    throw new Error("CAPITAL_NAME is not defined in environment variables.");
  }

  const capitalVillage = villages.find(
    (village) => village.name === CAPITAL_NAME
  );
  if (capitalVillage) {
    capitalVillage.capital = true;
  }
};

export default getVillagesInfo;
