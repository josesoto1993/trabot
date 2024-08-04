const Village = require("../models/village");

const VILLAGES_SIDEBAR = "div.villageList div.dropContainer";

const getVillages = async (page) => {
  try {
    const slotText = await getVillageSlotsInfo(page);
    const { villages } = parseVillageSlots(slotText);
    return villages;
  } catch (error) {
    console.error("Error getting number of villages:", error);
    throw error;
  }
};

const getMaxVillages = async (page) => {
  try {
    const slotText = await getVillageSlotsInfo(page);
    const { maxVillages } = parseVillageSlots(slotText);
    return maxVillages;
  } catch (error) {
    console.error("Error getting maximum number of villages:", error);
    throw error;
  }
};

const getVillageSlotsInfo = async (page) => {
  try {
    await page.waitForSelector(
      "#sidebarBoxVillagelist div.content div.expansionSlotInfo div.boxTitle span.slots"
    );

    const slotText = await page.$eval(
      "#sidebarBoxVillagelist div.content div.expansionSlotInfo div.boxTitle span.slots",
      (el) => el.textContent.trim()
    );

    return slotText;
  } catch (error) {
    console.error("Error getting village slots info:", error);
    throw error;
  }
};

const parseVillageSlots = (slotText) => {
  const cleanedText = slotText.replace(/[^\d\/]/g, "");

  const slotMatch = cleanedText.match(/(\d+)\/(\d+)/);
  if (slotMatch) {
    return {
      villages: parseInt(slotMatch[1], 10),
      maxVillages: parseInt(slotMatch[2], 10),
    };
  } else {
    throw new Error(
      `Slot text "${slotText}" format does not match expected pattern.`
    );
  }
};

const getVillagesInfo = async (page) => {
  try {
    await waitForVillageList(page);

    const villages = await getVillagesFromPage(page);

    validateActiveVillages(villages);
    await validateVillagesCount(page, villages);

    console.log(`Get valid villages = ${villages}`);
    return villages;
  } catch (error) {
    console.error("Error getting villages info:", error);
    throw error;
  }
};
const waitForVillageList = async (page) => {
  try {
    await page.waitForSelector(VILLAGES_SIDEBAR);
  } catch (error) {
    console.error("Error waiting for village list:", error);
    throw error;
  }
};

const getVillagesFromPage = async (page) => {
  try {
    const villagesData = await page.$$eval(VILLAGES_SIDEBAR, (nodes) => {
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
    });

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

const validateActiveVillages = (villages) => {
  const activeVillages = villages.filter((village) => village.active);
  if (activeVillages.length !== 1) {
    throw new Error("There should be exactly one active village.");
  }
};

const validateVillagesCount = async (page, villages) => {
  const expectedVillagesCount = await getVillages(page);
  if (villages.length !== expectedVillagesCount) {
    throw new Error("Mismatch in number of villages.");
  }
};

module.exports = {
  getVillages,
  getMaxVillages,
  getVillagesInfo,
};
