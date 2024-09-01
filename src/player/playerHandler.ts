import _ from "lodash";
import { Page } from "puppeteer";
import Player from "../models/player";
import Building from "../models/building";
import getVillagesOverviewInfo from "../village/listVillagesOverview";
import getBuildingData from "../village/buildingsData";
import getResourceFieldsData from "../village/resourceFieldsData";
import ConstructionStatus from "../constants/constructionStatus";
import { formatTimeMillis } from "../utils/timePrint";
import Village from "../models/village";
import { IBuildingType } from "../services/buildingTypeService";

let player = new Player([]);

export const updateVillages = async (page: Page): Promise<void> => {
  await updateVillagesOverviewInfo(page);

  for (const village of getVillages()) {
    await updateVillageResources(page, village.id);
    await updateVillageBuildings(page, village.id);
  }
};

export const updateVillageResources = async (
  page: Page,
  villageId: string
): Promise<void> => {
  const village = getVillages().find((v: Village) => v.id === villageId);

  if (!village) {
    throw new Error(`There is no village with id: ${villageId}`);
  }

  village.resourceFields = await getResourceFieldsData(page, village);
};

export const updateVillageBuildings = async (
  page: Page,
  villageId: string
): Promise<void> => {
  const village = getVillages().find((v: Village) => v.id === villageId);

  if (!village) {
    throw new Error(`There is no village with id: ${villageId}`);
  }

  village.buildings = await getBuildingData(page, village);
};

export const updateVillagesOverviewInfo = async (page: Page): Promise<void> => {
  const villages = await getVillagesOverviewInfo(page);

  for (const village of villages) {
    const playerVillage = getVillages().find((v) => v.id === village.id);

    if (playerVillage) {
      _.merge(playerVillage, village);
    } else {
      console.log("Add village to list:", village.name);
      getVillages().push(village);
    }
  }
};

export const getPlayer = (): Player => {
  return player;
};

export const getVillages = (): Village[] => {
  return player.villages;
};

export const updatePlayerBuilding = (
  villageId: string,
  slotId: number,
  buildingType: IBuildingType,
  level: number
): void => {
  const village = getVillages().find((village) => village.id === villageId);
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

export const updatePlayerField = (
  villageId: string,
  slotId: number,
  level: number
): void => {
  const village = getVillages().find((village) => village.id === villageId);
  if (!village) {
    throw new Error(`Village with ID ${villageId} not found`);
  }

  const fieldIndex = village.resourceFields.findIndex(
    (field) => field.slotId === slotId
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
    `Updated field at slot ${slotId} in village ${villageId} to level ${level}`
  );
};

export const updatePlayerVillageBuildFinishAt = (
  villageId: string,
  durationInSeconds: number
): void => {
  const village = getVillages().find((village) => village.id === villageId);

  if (!village) {
    console.log(`Village with ID ${villageId} not found. Updating villages...`);
    return;
  }

  const actualFinishAt = Math.max(Date.now(), village.buildFinishTime || 0);
  village.buildFinishTime = actualFinishAt + durationInSeconds * 1000;
  const remainingTime = village.buildFinishTime - Date.now();

  console.log(
    `Village ${village.name} busy with building for the next ${formatTimeMillis(remainingTime)}`
  );
};
