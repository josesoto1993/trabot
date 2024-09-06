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
  const slotUrl = new URL(Links.TRAVIAN_MAP);
  slotUrl.searchParams.append("x", coordinateX.toString());
  slotUrl.searchParams.append("y", coordinateY.toString());
  await goPage(slotUrl);

  console.log(`selectSlot in map: ${coordinateX} / ${coordinateY}`);
};

const getTileName = async (page: Page): Promise<string> => {
  const titleSelector = "div#tileDetails h1.titleInHeader";

  await page.waitForSelector(titleSelector);
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
  const isOccupiedVilla = tileType === TileTypes.OCCUPIED_VILLA;
  const isEmptyVilla = tileType === TileTypes.EMPTY;

  if (isOccupiedVilla || isEmptyVilla) {
    return await getVillaDataForVilla(page, isOccupiedVilla);
  }

  return "";
};

const getVillaDataForVilla = async (
  page: Page,
  isOccupiedVilla: boolean
): Promise<string> => {
  const resourceSelector = "#map_details table#distribution tbody tr td";
  try {
    await page.waitForSelector(resourceSelector, { timeout: 3000 });

    const resourceValues = await page.evaluate(
      (resourceSelector: string, isOccupiedVilla: boolean) => {
        const getValue = (className: string): string => {
          const element = document.querySelector(
            `${resourceSelector} i.${className}`
          );
          if (isOccupiedVilla) {
            return element?.nextSibling?.textContent?.trim() || "0";
          }
          return (
            element
              ?.closest("tr")
              ?.querySelector("td.val")
              ?.textContent?.trim() || "0"
          );
        };

        const wood = getValue("r1");
        const clay = getValue("r2");
        const iron = getValue("r3");
        const crop = getValue("r4");

        return { wood, clay, iron, crop };
      },
      resourceSelector,
      isOccupiedVilla
    );

    return formatResourceData(resourceValues);
  } catch (error) {
    console.log(
      `Failed to find resource distribution in ${isOccupiedVilla ? "occupied" : "empty"} villa.`
    );
    return "";
  }
};

const formatResourceData = (resourceValues: {
  wood: string;
  clay: string;
  iron: string;
  crop: string;
}): string => {
  if (resourceValues.crop === "15") {
    return "15c";
  }
  if (resourceValues.crop === "9") {
    return "9c";
  }
  return `${resourceValues.wood}${resourceValues.clay}${resourceValues.iron}${resourceValues.crop}`;
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
