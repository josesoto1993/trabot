import { PriorityLevels } from "../constants/priorityLevels";
const { upsert } = require("../services/PriorityBuildingService");
const { getBuildingType } = require("../services/buildingTypeService");
import { BuildingNames } from "../constants/buildingNames";

const populatePriorityBuildings = async () => {
  try {
    console.log("start populate priority building");

    const fundamentalBuildings = await getFundamentalBuildings();
    const highPriorityBuildings = await getHighPriorityBuildings();
    const midPriorityBuildings = await getMidPriorityBuildings();
    const lowPriorityBuildings = await getLowPriorityBuildings();

    for (const { building, targetLevel } of fundamentalBuildings) {
      await upsert(PriorityLevels.FUNDAMENTAL, building, targetLevel);
    }

    for (const { building, targetLevel } of highPriorityBuildings) {
      await upsert(PriorityLevels.HIGH, building, targetLevel);
    }

    for (const { building, targetLevel } of midPriorityBuildings) {
      await upsert(PriorityLevels.MID, building, targetLevel);
    }

    for (const { building, targetLevel } of lowPriorityBuildings) {
      await upsert(PriorityLevels.LOW, building, targetLevel);
    }

    console.log("finish populate priority buildings");
  } catch (error) {
    console.error("Error populating priority buildings:", error);
  }
};

const getFundamentalBuildings = async () => {
  return [
    await getBuildingType(BuildingNames.MAIN_BUILDING),
    await getBuildingType(BuildingNames.RALLY_POINT),
    await getBuildingType(BuildingNames.PALISADE),
    await getBuildingType(BuildingNames.WAREHOUSE),
    await getBuildingType(BuildingNames.GRANARY),
    await getBuildingType(BuildingNames.MARKETPLACE),
    await getBuildingType(BuildingNames.RESIDENCE),
    await getBuildingType(BuildingNames.GRAIN_MILL),
    await getBuildingType(BuildingNames.BRICKYARD),
    await getBuildingType(BuildingNames.SAWMILL),
    await getBuildingType(BuildingNames.IRON_FOUNDRY),
    await getBuildingType(BuildingNames.ACADEMY),
    await getBuildingType(BuildingNames.TOWN_HALL),
    await getBuildingType(BuildingNames.BAKERY),
  ].map((building) => ({ building, targetLevel: 1 }));
};

const getHighPriorityBuildings = async () => {
  return [
    {
      building: await getBuildingType(BuildingNames.RESIDENCE),
      targetLevel: 10,
    },
    {
      building: await getBuildingType(BuildingNames.MAIN_BUILDING),
      targetLevel: 20,
    },
    {
      building: await getBuildingType(BuildingNames.GRAIN_MILL),
      targetLevel: 5,
    },
    {
      building: await getBuildingType(BuildingNames.BRICKYARD),
      targetLevel: 5,
    },
    { building: await getBuildingType(BuildingNames.SAWMILL), targetLevel: 5 },
    {
      building: await getBuildingType(BuildingNames.IRON_FOUNDRY),
      targetLevel: 5,
    },
    { building: await getBuildingType(BuildingNames.BAKERY), targetLevel: 5 },
    {
      building: await getBuildingType(BuildingNames.WAREHOUSE),
      targetLevel: 9,
    },
    { building: await getBuildingType(BuildingNames.GRANARY), targetLevel: 8 },
    {
      building: await getBuildingType(BuildingNames.MARKETPLACE),
      targetLevel: 3,
    },
  ];
};

const getMidPriorityBuildings = async () => {
  return [
    {
      building: await getBuildingType(BuildingNames.BARRACKS),
      targetLevel: 3,
    },
    {
      building: await getBuildingType(BuildingNames.TOWN_HALL),
      targetLevel: 10,
    },
    {
      building: await getBuildingType(BuildingNames.MARKETPLACE),
      targetLevel: 10,
    },
    {
      building: await getBuildingType(BuildingNames.ACADEMY),
      targetLevel: 10,
    },
  ];
};

const getLowPriorityBuildings = async () => {
  return [
    {
      building: await getBuildingType(BuildingNames.WAREHOUSE),
      targetLevel: 20,
    },
    {
      building: await getBuildingType(BuildingNames.GRANARY),
      targetLevel: 20,
    },
    {
      building: await getBuildingType(BuildingNames.MARKETPLACE),
      targetLevel: 20,
    },
    {
      building: await getBuildingType(BuildingNames.STONEMASONS_LODGE),
      targetLevel: 20,
    },
    { building: await getBuildingType(BuildingNames.PALACE), targetLevel: 20 },
    {
      building: await getBuildingType(BuildingNames.RALLY_POINT),
      targetLevel: 10,
    },
    {
      building: await getBuildingType(BuildingNames.PALISADE),
      targetLevel: 10,
    },
    {
      building: await getBuildingType(BuildingNames.TRADE_OFFICE),
      targetLevel: 10,
    },
    {
      building: await getBuildingType(BuildingNames.ACADEMY),
      targetLevel: 20,
    },
    {
      building: await getBuildingType(BuildingNames.EMBASSY),
      targetLevel: 20,
    },
  ];
};

module.exports = populatePriorityBuildings;
