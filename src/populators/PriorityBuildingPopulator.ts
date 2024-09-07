import PriorityLevels from "../constants/priorityLevels";
import {
  IPriorityBuildingUpsertData,
  upsertPriorityBuilding,
} from "../services/PriorityBuildingService";
import { getBuildingType } from "../services/buildingTypeService";
import BuildingNames from "../constants/buildingNames";

const populatePriorityBuildings = async (): Promise<void> => {
  try {
    console.log("start populate priority buildings");

    const priorityBuildings = [
      ...(await getFundamentalBuildings()),
      ...(await getHighPriorityBuildings()),
      ...(await getMidPriorityBuildings()),
      ...(await getLowPriorityBuildings()),
    ];

    for (const priorityBuilding of priorityBuildings) {
      await upsertPriorityBuilding(priorityBuilding);
    }

    console.log("finish populate priority buildings");
  } catch (error) {
    console.error("Error populating priority buildings:", error);
  }
};

const getFundamentalBuildings = async (): Promise<
  IPriorityBuildingUpsertData[]
> => {
  const buildingNames = [
    BuildingNames.MAIN_BUILDING,
    BuildingNames.RALLY_POINT,
    BuildingNames.PALISADE,
    BuildingNames.WAREHOUSE,
    BuildingNames.GRANARY,
    BuildingNames.MARKETPLACE,
    BuildingNames.RESIDENCE,
    BuildingNames.GRAIN_MILL,
    BuildingNames.BRICKYARD,
    BuildingNames.SAWMILL,
    BuildingNames.IRON_FOUNDRY,
    BuildingNames.ACADEMY,
    BuildingNames.TOWN_HALL,
    BuildingNames.BAKERY,
  ];

  return Promise.all(
    buildingNames.map(async (name) => ({
      priority: PriorityLevels.FUNDAMENTAL,
      building: await getBuildingType(name),
      targetLevel: 1,
    }))
  );
};

const getHighPriorityBuildings = async (): Promise<
  IPriorityBuildingUpsertData[]
> => {
  const buildingNames = [
    { name: BuildingNames.RESIDENCE, level: 10 },
    { name: BuildingNames.HEROS_MANSION, level: 10 },
    { name: BuildingNames.MAIN_BUILDING, level: 20 },
    { name: BuildingNames.GRAIN_MILL, level: 5 },
    { name: BuildingNames.BRICKYARD, level: 5 },
    { name: BuildingNames.SAWMILL, level: 5 },
    { name: BuildingNames.IRON_FOUNDRY, level: 5 },
    { name: BuildingNames.BAKERY, level: 5 },
    { name: BuildingNames.WAREHOUSE, level: 9 },
    { name: BuildingNames.GRANARY, level: 8 },
    { name: BuildingNames.MARKETPLACE, level: 3 },
  ];

  return Promise.all(
    buildingNames.map(async ({ name, level }) => ({
      priority: PriorityLevels.HIGH,
      building: await getBuildingType(name),
      targetLevel: level,
    }))
  );
};

const getMidPriorityBuildings = async (): Promise<
  IPriorityBuildingUpsertData[]
> => {
  const buildingNames = [
    { name: BuildingNames.BARRACKS, level: 3 },
    { name: BuildingNames.TOWN_HALL, level: 10 },
    { name: BuildingNames.MARKETPLACE, level: 10 },
    { name: BuildingNames.ACADEMY, level: 10 },
  ];

  return Promise.all(
    buildingNames.map(async ({ name, level }) => ({
      priority: PriorityLevels.MID,
      building: await getBuildingType(name),
      targetLevel: level,
    }))
  );
};

const getLowPriorityBuildings = async (): Promise<
  IPriorityBuildingUpsertData[]
> => {
  const buildingNames = [
    { name: BuildingNames.WAREHOUSE, level: 20 },
    { name: BuildingNames.GRANARY, level: 20 },
    { name: BuildingNames.MARKETPLACE, level: 20 },
    { name: BuildingNames.STONEMASONS_LODGE, level: 20 },
    { name: BuildingNames.PALACE, level: 20 },
    { name: BuildingNames.RALLY_POINT, level: 10 },
    { name: BuildingNames.PALISADE, level: 10 },
    { name: BuildingNames.STABLE, level: 10 },
    { name: BuildingNames.TRADE_OFFICE, level: 10 },
    { name: BuildingNames.ACADEMY, level: 20 },
    { name: BuildingNames.EMBASSY, level: 20 },
  ];

  return Promise.all(
    buildingNames.map(async ({ name, level }) => ({
      priority: PriorityLevels.LOW,
      building: await getBuildingType(name),
      targetLevel: level,
    }))
  );
};

export default populatePriorityBuildings;
