import { Page } from "puppeteer";
import { goPage } from "../browser/browserService";
import Links from "../constants/links";
import TileTypes from "../constants/tileTypes";

export interface ITileTitleData {
  tileName: string;
  tileType: TileTypes;
}

const getTileTitle = async (
  page: Page,
  coordinateX: number,
  coordinateY: number
): Promise<ITileTitleData> => {
  await selectTile(coordinateX, coordinateY);
  const tileName = await getTileName(page);
  const tileType = getTileType(tileName);
  const tileData: ITileTitleData = {
    tileName: tileName,
    tileType: tileType,
  };
  console.log("get data:", JSON.stringify(tileData, null, 2));
  return tileData;
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
  for (const type of Object.values(TileTypes)) {
    if (tileName.includes(type)) {
      return type;
    }
  }
  return TileTypes.OCCUPIED_VILLA;
};

export default getTileTitle;
