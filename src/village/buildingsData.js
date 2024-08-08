const ConstructionStatus = require("../constants/constructionStatus");
const { goVillageBuildingView } = require("./goVillage");
const Building = require("../models/building");

const getBuildingData = async (page, village) => {
  await goVillageBuildingView(village);
  await page.waitForSelector("#villageContent");

  const buildings = await getBuildingRawData(page);

  return buildingsRawToObject(buildings);
};

const getBuildingRawData = async (page) => {
  return await page.$$eval("#villageContent .buildingSlot", (nodes) => {
    return nodes.map((node) => ({
      aid: node.getAttribute("data-aid"),
      gid: node.getAttribute("data-gid"),
      name: node.getAttribute("data-name"),
      anchorClasses: Array.from(node.querySelector("a.level").classList),
      level: node.querySelector("a.level").getAttribute("data-level"),
    }));
  });
};

const buildingsRawToObject = (raw) => {
  return raw.map((data) => {
    const citySlotId = parseInt(data.aid, 10);
    const id = parseInt(data.gid, 10);
    const name = data.name;
    const level = parseInt(data.level, 10);
    const constructionStatus = getConstructionStatus(data.anchorClasses);

    return new Building(id, citySlotId, name, level, constructionStatus);
  });
};

const getConstructionStatus = (classes) => {
  if (classes.includes(ConstructionStatus.maxLevel)) {
    return ConstructionStatus.maxLevel;
  } else if (classes.includes(ConstructionStatus.notEnoughResources)) {
    return ConstructionStatus.notEnoughResources;
  } else if (classes.includes(ConstructionStatus.readyToUpgrade)) {
    return ConstructionStatus.readyToUpgrade;
  }
  return ConstructionStatus.notEnoughStorage;
};

module.exports = getBuildingData;
