const Player = require("../models/player");
const Building = require("../models/building");
const getVillagesOverviewInfo = require("../village/listVillagesOverview");
const getBuildingData = require("../village/buildingsData");
const getResourceFieldsData = require("../village/resourceFieldsData");
import { ConstructionStatus } from "../constants/constructionStatus";
import { formatTimeMillis } from "../utils/timePrint";

let player = new Player([]);

const updateVillages = async (page) => {
  await updateVillagesOverviewInfo(page);

  for (const village of player.villages) {
    await updateVillageResources(page, village.id);
    await updateVillageBuildings(page, village.id);
  }
};

const updateVillageResources = async (page, villageId) => {
  const village = player.villages.find((v) => v.id === villageId);

  if (!village) {
    throw new Error("There is no village with id:", villageId);
  }

  village.resourceFields = await getResourceFieldsData(page, village);
};

const updateVillageBuildings = async (page, villageId) => {
  const village = player.villages.find((v) => v.id === villageId);

  if (!village) {
    throw new Error("There is no village with id:", villageId);
  }

  village.buildings = await getBuildingData(page, village);
};

const updateVillagesOverviewInfo = async (page) => {
  const villages = await getVillagesOverviewInfo(page);

  for (const village of villages) {
    const playerVillage = player.villages.find((v) => v.id === village.id);

    if (playerVillage) {
      for (const key in village) {
        const value = village[key];

        if (
          value === null ||
          value === undefined ||
          (Array.isArray(value) && value.length === 0)
        ) {
          continue;
        }

        if (Array.isArray(value)) {
          playerVillage[key] = [...value];
        } else if (typeof value === "object") {
          playerVillage[key] = { ...playerVillage[key], ...value };
        } else {
          playerVillage[key] = value;
        }
      }
    } else {
      console.log("Add village to list:", village.name);
      player.villages.push(village);
    }
  }
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
    buildingType.structureId,
    slotId,
    buildingType.name,
    level,
    ConstructionStatus.NOT_ENOUGH_RESOURCES
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

const updatePlayerVillageBuildFinishAt = (villageId, durationInSeconds) => {
  const village = player.villages.find((village) => village.id === villageId);

  if (!village) {
    console.log(`Village with ID ${villageId} not found. Updating villages...`);
    return;
  }

  const actualFinishAt = Math.max(Date.now(), village.buildFinishAt || 0);
  village.buildFinishAt = actualFinishAt + durationInSeconds * 1000;
  const remainingTime = village.buildFinishAt - Date.now();

  console.log(
    `Village ${village.name} busy with building for the next ${formatTimeMillis(remainingTime)}`
  );
};

module.exports = {
  updateVillages,
  updateVillageResources,
  updateVillageBuildings,
  updateVillagesOverviewInfo,
  getPlayer,
  getVillages,
  updatePlayerBuilding,
  updatePlayerField,
  updatePlayerVillageBuildFinishAt,
};
