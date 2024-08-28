const PRIORITY_LEVELS = require("../constants/priorityLevels");
const { upsert } = require("../services/PriorityBuildingService");
const { getBuildingType } = require("../services/buildingTypeService");

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
    await getBuildingType("Main Building"),
    await getBuildingType("Rally Point"),
    await getBuildingType("Palisade"),
    await getBuildingType("Warehouse"),
    await getBuildingType("Granary"),
    await getBuildingType("Marketplace"),
    await getBuildingType("Residence"),
    await getBuildingType("Grain Mill"),
    await getBuildingType("Brickyard"),
    await getBuildingType("Sawmill"),
    await getBuildingType("Iron Foundry"),
    await getBuildingType("Academy"),
    await getBuildingType("Town Hall"),
    await getBuildingType("Bakery"),
  ].map((building) => ({ building, targetLevel: 1 }));
};

const getHighPriorityBuildings = async () => {
  return [
    { building: await getBuildingType("Residence"), targetLevel: 10 },
    { building: await getBuildingType("Main Building"), targetLevel: 20 },
    { building: await getBuildingType("Grain Mill"), targetLevel: 5 },
    { building: await getBuildingType("Brickyard"), targetLevel: 5 },
    { building: await getBuildingType("Sawmill"), targetLevel: 5 },
    { building: await getBuildingType("Iron Foundry"), targetLevel: 5 },
    { building: await getBuildingType("Bakery"), targetLevel: 5 },
    { building: await getBuildingType("Warehouse"), targetLevel: 9 },
    { building: await getBuildingType("Granary"), targetLevel: 8 },
    { building: await getBuildingType("Marketplace"), targetLevel: 3 },
  ];
};

const getMidPriorityBuildings = async () => {
  return [
    { building: await getBuildingType("Barracks"), targetLevel: 3 },
    { building: await getBuildingType("Town Hall"), targetLevel: 10 },
    { building: await getBuildingType("Marketplace"), targetLevel: 10 },
    { building: await getBuildingType("Academy"), targetLevel: 20 },
  ];
};

const getLowPriorityBuildings = async () => {
  return [
    { building: await getBuildingType("Warehouse"), targetLevel: 20 },
    { building: await getBuildingType("Granary"), targetLevel: 20 },
    { building: await getBuildingType("Marketplace"), targetLevel: 20 },
    { building: await getBuildingType("Stonemason's Lodge"), targetLevel: 20 },
    { building: await getBuildingType("Palace"), targetLevel: 20 },
    { building: await getBuildingType("Rally Point"), targetLevel: 10 },
    { building: await getBuildingType("Palisade"), targetLevel: 10 },
    { building: await getBuildingType("Trade Office"), targetLevel: 10 },
    { building: await getBuildingType("Embassy"), targetLevel: 20 },
  ];
};

module.exports = populatePriorityBuildings;
