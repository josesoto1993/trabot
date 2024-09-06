import { Page } from "puppeteer";
import { goPage } from "../browser/browserService";
import Links from "../constants/links";
import TileTypes from "../constants/tileTypes";
import UnitNames, { getUnitName } from "../constants/unitsNames";
import calculateUnitsData, {
  ITroopData,
  ITroopInputData,
} from "../troops/statsCalculator";

export interface ITileTitleData {
  tileName: string;
  coordinateX: number;
  coordinateY: number;
  tileType: TileTypes;
  villaData: string;
  troopData: ITroopData;
}
interface IAnimalRawData {
  unitAltText: string;
  quantity: number;
}

const getTileData = async (
  page: Page,
  coordinateX: number,
  coordinateY: number
): Promise<ITileTitleData> => {
  await selectTile(coordinateX, coordinateY);

  const tileName = await getTileName(page);
  const tileType = getTileType(tileName);
  const villaData = await getVillaData(page, tileType);
  const animals = await getAnimals(page, tileType);
  const animalsStat = await calculateUnitsData(animals);

  return {
    tileName: tileName,
    coordinateX: coordinateX,
    coordinateY: coordinateY,
    tileType: tileType,
    villaData: villaData,
    troopData: animalsStat,
  };
};

const selectTile = async (
  coordinateX: number,
  coordinateY: number
): Promise<void> => {
  const slotUrl = new URL(Links.TRAVIAN_BUILD_VIEW);
  slotUrl.searchParams.append("x", coordinateX.toString());
  slotUrl.searchParams.append("y", coordinateY.toString());
  await goPage(slotUrl);

  console.log(`selectSlot: ${coordinateX} / ${coordinateY}`);
};

const getTileName = async (page: Page): Promise<string> => {
  const titleSelector = "div#tileDetails h1.titleInHeader";

  const tileTitleData = await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (!element) {
      return null;
    }

    const textContent = element.textContent || "";

    const coordRegex = /\(\s*(\d+)\s*\|\s*(\d+)\s*\)/;
    const match = coordRegex.exec(textContent);
    if (match) {
      return textContent.replace(coordRegex, "").trim();
    }

    return textContent.trim();
  }, titleSelector);

  if (!tileTitleData) {
    throw new Error("Unable to extract tile title data.");
  }

  return tileTitleData;
};

const getTileType = (tileName: string): TileTypes => {
  const tileType = Object.values(TileTypes).find((type) =>
    tileName.includes(type)
  );
  return tileType || TileTypes.OCCUPIED_VILLA;
};

const getVillaData = async (
  page: Page,
  tileType: TileTypes
): Promise<string> => {
  if (tileType !== TileTypes.EMPTY && tileType !== TileTypes.OCCUPIED_VILLA) {
    return "";
  }

  const resourceSelector = "#map_details table#distribution tbody tr td";

  try {
    await page.waitForSelector(resourceSelector, { timeout: 3000 });

    const resourceValues = await page.evaluate(() => {
      const wood =
        document.querySelector("i.r1")?.nextSibling?.textContent?.trim() || "0";
      const clay =
        document.querySelector("i.r2")?.nextSibling?.textContent?.trim() || "0";
      const iron =
        document.querySelector("i.r3")?.nextSibling?.textContent?.trim() || "0";
      const crop =
        document.querySelector("i.r4")?.nextSibling?.textContent?.trim() || "0";
      return { wood, clay, iron, crop };
    });

    return `${resourceValues.wood}${resourceValues.clay}${resourceValues.iron}${resourceValues.crop}`;
  } catch (error) {
    console.log("Failed to find resource distribution.");
    return "";
  }
};

const getAnimals = async (
  page: Page,
  tileType: TileTypes
): Promise<ITroopInputData[]> => {
  if (tileType !== TileTypes.UNOCUPPIED_OASIS) {
    return [];
  }

  const troopSelector = "#map_details table#troop_info tbody tr";

  try {
    await page.waitForSelector(troopSelector, { timeout: 3000 });

    const animals = await getRawAnimals(page);
    return rawAnimalsToObject(animals);
  } catch (error) {
    console.log(
      "Failed to find troop information, possibly not an unoccupied oasis."
    );
    return [];
  }
};

const getRawAnimals = async (page: Page): Promise<IAnimalRawData[]> => {
  return await page.evaluate(() => {
    const rows = Array.from(
      document.querySelectorAll("#map_details table#troop_info tbody tr")
    );
    return rows.map((row) => {
      const unitAltText = row.querySelector("img")?.getAttribute("alt") || "";
      const quantityText = row.querySelector(".val")?.textContent || "0";
      const quantity = parseInt(quantityText.trim(), 10);
      return { unitAltText, quantity };
    });
  });
};

const rawAnimalsToObject = (animals: IAnimalRawData[]): ITroopInputData[] => {
  const mappedAnimals = animals
    .map((animal: { unitAltText: string; quantity: number }) => {
      const unitName = getUnitName(animal.unitAltText);
      if (unitName) {
        return { unitName, quantity: animal.quantity };
      }
      return null;
    })
    .filter((animal) => animal !== null);

  return mappedAnimals as { unitName: UnitNames; quantity: number }[];
};

export default getTileData;
