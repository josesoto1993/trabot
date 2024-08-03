const Village = require("../models/village");

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
  const slotMatch = slotText.match(/(\d+)\s*\/\s*(\d+)/);
  if (slotMatch) {
    return {
      villages: parseInt(slotMatch[1], 10),
      maxVillages: parseInt(slotMatch[2], 10),
    };
  } else {
    throw new Error("Slot text format does not match expected pattern.");
  }
};

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

const getVillagesInfo = async (page) => {
  try {
    await page.waitForSelector(
      "#sidebarBoxVillagelist div.content div.villageList div.villageList div.dropContainer"
    );

    const villages = await page.$$eval(
      "#sidebarBoxVillagelist div.content div.villageList div.villageList div.dropContainer",
      (containers) => {
        return containers.map((container) => {
          const listEntry = container.querySelector("div.listEntry");
          const coordinatesGrid = container.querySelector(
            "span.coordinatesGrid"
          );

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

          return new Village(id, name, coordinateX, coordinateY, active);
        });
      }
    );

    return villages;
  } catch (error) {
    console.error("Error getting villages info:", error);
    throw error;
  }
};

module.exports = {
  getVillages,
  getMaxVillages,
  getVillagesInfo,
};
