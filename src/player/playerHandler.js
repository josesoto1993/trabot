const Player = require("../models/player");
const Building = require("../models/building");
const getVillagesOverviewInfo = require("../village/listVillagesOverview");
const getBuildingData = require("../village/buildingsData");
const getResourceFieldsData = require("../village/resourceFieldsData");
const ConstructionStatus = require("../constants/constructionStatus");
const { formatTimeMillis } = require("../utils/timePrint");

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

const getVillages = () => {
  return player.villages;
};

const updatePlayerBuilding = (villageId, slotId, buildingType, level) => {
  const village = player.villages.find((village) => village.id === villageId);
  if (!village) {
    throw new Error(`Village with ID ${villageId} not found`);
  }

  const buildingIndex = village.buildings.findIndex(
    (building) => building.slotId === slotId
  );
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
    `Updated building at slot ${slotId} in village ${villageId} to ${buildingType.name} level ${level}`
  );
};

const updatePlayerField = (villageId, slotId, level) => {
  const village = player.villages.find((village) => village.id === villageId);
  if (!village) {
    throw new Error(`Village with ID ${villageId} not found`);
  }

  const fieldIndex = village.resourceFields.findIndex(
    (field) => field.id === slotId
  );
  if (fieldIndex === -1) {
    throw new Error(
      `Field with Slot ID ${slotId} not found in village ${villageId}`
    );
  }

  let field = village.resourceFields[fieldIndex];
  field.level = level;
  village.resourceFields[fieldIndex] = field;

  console.log(
    `Updated building at slot ${slotId} in village ${villageId} to level ${level}`
  );
};

const updatePlayerVillageBuildFinishAt = async (
  page,
  villageId,
  durationInSeconds
) => {
  let village = player.villages.find((village) => village.id === villageId);

  if (!village) {
    console.log(`Village with ID ${villageId} not found. Updating villages...`);
    await updateVillages(page);
    village = player.villages.find((village) => village.id === villageId);

    if (!village) {
      throw new Error(
        `Village with ID ${villageId} still not found after update.`
      );
    }
  }

  const actualFinishAt = Math.max(Date.now(), village.buildFinishAt);
  village.buildFinishAt = actualFinishAt + durationInSeconds * 1000;
  const remainingTime = village.buildFinishAt - Date.now();

  console.log(
    `Village ${village.name} busy with building for the next ${formatTimeMillis(remainingTime)}`
  );
};

const getNextBuildFinishAt = () => {
  const currentTime = Date.now();

  const minBuildFinishAt = Math.min(
    ...player.villages.map((village) => village.buildFinishAt)
  );

  return (minBuildFinishAt - currentTime) / 1000;
};

module.exports = {
  updateVillages,
  getPlayer,
  getVillages,
  updatePlayerBuilding,
  updatePlayerField,
  updatePlayerVillageBuildFinishAt,
  getNextBuildFinishAt,
};
