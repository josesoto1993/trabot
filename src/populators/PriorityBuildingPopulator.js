const PRIORITY_LEVELS = require("../constants/priorityLevels");
const { upsert } = require("../services/PriorityBuildingService");
const { getBuildingType } = require("../services/buildingTypeService");
const BUILDING_NAMES = require("../constants/buildingNames");

const populatePriorityBuildings = async () => {
  try {
    console.log("start populate priority building");

    const fundamentalBuildings = await getFundamentalBuildings();
    const highPriorityBuildings = await getHighPriorityBuildings();
    const midPriorityBuildings = await getMidPriorityBuildings();
    const lowPriorityBuildings = await getLowPriorityBuildings();

    for (const { building, targetLevel } of fundamentalBuildings) {
      await upsert(PRIORITY_LEVELS.FUNDAMENTAL, building, targetLevel);
    }

    for (const { building, targetLevel } of highPriorityBuildings) {
      await upsert(PRIORITY_LEVELS.HIGH, building, targetLevel);
    }

    for (const { building, targetLevel } of midPriorityBuildings) {
      await upsert(PRIORITY_LEVELS.MID, building, targetLevel);
    }

    for (const { building, targetLevel } of lowPriorityBuildings) {
      await upsert(PRIORITY_LEVELS.LOW, building, targetLevel);
    }

    console.log("finish populate priority buildings");
  } catch (error) {
    console.error("Error populating priority buildings:", error);
  }
};

const getFundamentalBuildings = async () => {
  return [
    await getBuildingType(BUILDING_NAMES.MAIN_BUILDING),
    await getBuildingType(BUILDING_NAMES.RALLY_POINT),
    await getBuildingType(BUILDING_NAMES.PALISADE),
    await getBuildingType(BUILDING_NAMES.WAREHOUSE),
    await getBuildingType(BUILDING_NAMES.GRANARY),
    await getBuildingType(BUILDING_NAMES.MARKETPLACE),
    await getBuildingType(BUILDING_NAMES.RESIDENCE),
    await getBuildingType(BUILDING_NAMES.GRAIN_MILL),
    await getBuildingType(BUILDING_NAMES.BRICKYARD),
    await getBuildingType(BUILDING_NAMES.SAWMILL),
    await getBuildingType(BUILDING_NAMES.IRON_FOUNDRY),
    await getBuildingType(BUILDING_NAMES.ACADEMY),
    await getBuildingType(BUILDING_NAMES.TOWN_HALL),
    await getBuildingType(BUILDING_NAMES.BAKERY),
  ].map((building) => ({ building, targetLevel: 1 }));
};

const getHighPriorityBuildings = async () => {
  return [
    {
      building: await getBuildingType(BUILDING_NAMES.RESIDENCE),
      targetLevel: 10,
    },
    {
      building: await getBuildingType(BUILDING_NAMES.MAIN_BUILDING),
      targetLevel: 20,
    },
    {
      building: await getBuildingType(BUILDING_NAMES.GRAIN_MILL),
      targetLevel: 5,
    },
    {
      building: await getBuildingType(BUILDING_NAMES.BRICKYARD),
      targetLevel: 5,
    },
    { building: await getBuildingType(BUILDING_NAMES.SAWMILL), targetLevel: 5 },
    {
      building: await getBuildingType(BUILDING_NAMES.IRON_FOUNDRY),
      targetLevel: 5,
    },
    { building: await getBuildingType(BUILDING_NAMES.BAKERY), targetLevel: 5 },
    {
      building: await getBuildingType(BUILDING_NAMES.WAREHOUSE),
      targetLevel: 9,
    },
    { building: await getBuildingType(BUILDING_NAMES.GRANARY), targetLevel: 8 },
    {
      building: await getBuildingType(BUILDING_NAMES.MARKETPLACE),
      targetLevel: 3,
    },
  ];
};

const getMidPriorityBuildings = async () => {
  return [
    {
      building: await getBuildingType(BUILDING_NAMES.BARRACKS),
      targetLevel: 3,
    },
    {
      building: await getBuildingType(BUILDING_NAMES.TOWN_HALL),
      targetLevel: 10,
    },
    {
      building: await getBuildingType(BUILDING_NAMES.MARKETPLACE),
      targetLevel: 10,
    },
    {
      building: await getBuildingType(BUILDING_NAMES.ACADEMY),
      targetLevel: 10,
    },
  ];
};

const getLowPriorityBuildings = async () => {
  return [
    {
      building: await getBuildingType(BUILDING_NAMES.WAREHOUSE),
      targetLevel: 20,
    },
    {
      building: await getBuildingType(BUILDING_NAMES.GRANARY),
      targetLevel: 20,
    },
    {
      building: await getBuildingType(BUILDING_NAMES.MARKETPLACE),
      targetLevel: 20,
    },
    {
      building: await getBuildingType(BUILDING_NAMES.STONEMASONS_LODGE),
      targetLevel: 20,
    },
    { building: await getBuildingType(BUILDING_NAMES.PALACE), targetLevel: 20 },
    {
      building: await getBuildingType(BUILDING_NAMES.RALLY_POINT),
      targetLevel: 10,
    },
    {
      building: await getBuildingType(BUILDING_NAMES.PALISADE),
      targetLevel: 10,
    },
    {
      building: await getBuildingType(BUILDING_NAMES.TRADE_OFFICE),
      targetLevel: 10,
    },
    {
      building: await getBuildingType(BUILDING_NAMES.ACADEMY),
      targetLevel: 20,
    },
    {
      building: await getBuildingType(BUILDING_NAMES.EMBASSY),
      targetLevel: 20,
    },
  ];
};

module.exports = populatePriorityBuildings;
