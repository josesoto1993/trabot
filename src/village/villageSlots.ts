import { Page } from "puppeteer";
import Village from "../models/village";

interface VillageSlotInfo {
  actualVillages: number;
  maxVillages: number;
}

const getActualVillagesCount = async (page: Page): Promise<number> => {
  try {
    const slotText = await getVillageSlotsInfo(page);
    const { actualVillages: villages } = parseVillageSlots(slotText);
    return villages;
  } catch (error) {
    console.error("Error getting number of actual villages:", error);
    throw error;
  }
};

const getVillageSlotsInfo = async (page: Page): Promise<string> => {
  try {
    await page.waitForSelector(
      "#sidebarBoxVillagelist div.content div.expansionSlotInfo div.boxTitle span.slots"
    );

    const slotText = await page.$eval(
      "#sidebarBoxVillagelist div.content div.expansionSlotInfo div.boxTitle span.slots",
      (el) => el.textContent?.trim() ?? ""
    );

    return slotText;
  } catch (error) {
    console.error("Error getting village slots info:", error);
    throw error;
  }
};

const parseVillageSlots = (slotText: string): VillageSlotInfo => {
  const cleanedText = slotText.replace(/[^\d/]/g, "");
  const slotPattern = /(\d+)\/(\d+)/;
  const slotMatch = slotPattern.exec(cleanedText);
  if (slotMatch) {
    return {
      actualVillages: parseInt(slotMatch[1], 10),
      maxVillages: parseInt(slotMatch[2], 10),
    };
  } else {
    throw new Error(
      `Slot text "${slotText}" format does not match expected pattern.`
    );
  }
};

export const validateActiveVillages = (villages: Village[]): void => {
  const activeVillages = villages.filter((village) => village.active);
  if (activeVillages.length !== 1) {
    throw new Error("There should be exactly one active village.");
  }
};

export const validateVillagesCount = async (
  page: Page,
  villages: Village[]
): Promise<void> => {
  const expectedVillagesCount = await getActualVillagesCount(page);
  if (villages.length !== expectedVillagesCount) {
    throw new Error("Mismatch in number of villages.");
  }
};
