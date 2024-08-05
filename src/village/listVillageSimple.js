const Village = require("../models/village");
const { getActualVillages } = require("./villageSlots");

const VILLAGES_SIDEBAR = "div.villageList div.dropContainer";

const getVillagesInfo = async (page) => {
  try {
    await waitForVillageList(page);

    const villages = await getVillagesFromPage(page);

    validateActiveVillages(villages);
    await validateVillagesCount(page, villages);

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
  const expectedVillagesCount = await getActualVillages(page);
  if (villages.length !== expectedVillagesCount) {
    throw new Error("Mismatch in number of villages.");
  }
};

module.exports = getVillagesInfo;
