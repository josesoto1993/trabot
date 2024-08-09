const Player = require("../models/player");
const Building = require("../models/building");
const getVillagesOverviewInfo = require("../village/listVillagesOverview");
const getBuildingData = require("../village/buildingsData");
const getResourceFieldsData = require("../village/resourceFieldsData");
const ConstructionStatus = require("../constants/constructionStatus");

let player = new Player([]);

const updateVillages = async (page) => {
  const villages = await getVillagesOverviewInfo(page);

  for (const village of villages) {
    village.resourceFields = await getResourceFieldsData(page, village);
    village.buildings = await getBuildingData(page, village);
  }

  player.villages = villages;

  return player;
};

const getPlayer = () => {
  return player;
};

const updatePlayerBuilding = (villageId, slotId, buildingType, level) => {
  const village = player.villages.find((village) => village.id === villageId);
  if (!village) {
    throw new Error(`Village with ID ${villageId} not found`);
  }

  const buildingIndex = village.buildings.findIndex((b) => b.slotId === slotId);
  if (buildingIndex === -1) {
    throw new Error(
      `Building with Slot ID ${slotId} not found in village ${villageId}`
    );
  }

  const newBuilding = new Building(
    buildingType.id,
    slotId,
    buildingType.name,
    level,
    ConstructionStatus.notEnoughResources
  );

  village.buildings[buildingIndex] = newBuilding;

  console.log(
    `Updated building at slot ${slotId} in village ${villageId} to ${buildingType.name}`
  );
};

module.exports = {
  updateVillages,
  getPlayer,
  updatePlayerBuilding,
};
