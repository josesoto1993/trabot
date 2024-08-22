const { upsertBuildingType } = require("../services/buildingTypeService"); // Import the upsert function
const { getBuildingCategory } = require("../services/buildingCategoryService");

const populateBuildingTypes = async () => {
  console.log("start populate building types");

  const buildingTypes = await getBaseBuildingTypes();
  for (const buildingType of buildingTypes) {
    try {
      if (!buildingType.name) {
        console.warn(`Skipping building type with missing name`);
        continue;
      }

      await upsertBuildingType(buildingType);
    } catch (error) {
      console.error(
        `Error processing building type "${buildingType.name}":`,
        error
      );
    }
  }

  console.log("finish populate building types");
};

const getBaseBuildingTypes = async () => {
  const buildingCategoryOther = await getBuildingCategory("other");
  const buildingCategoryMilitary = await getBuildingCategory("military");
  const buildingCategoryResources = await getBuildingCategory("resources");
  const buildingCategoryInfrastructure =
    await getBuildingCategory("infrastructure");

  const buildingTypes = [
    { structureId: 22, name: "Academy", category: buildingCategoryMilitary },
    { structureId: 9, name: "Bakery", category: buildingCategoryResources },
    { structureId: 19, name: "Barracks", category: buildingCategoryMilitary },
    { structureId: 6, name: "Brickyard", category: buildingCategoryResources },
    {
      structureId: 23,
      name: "Cranny",
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 18,
      name: "Embassy",
      category: buildingCategoryInfrastructure,
    },
    { structureId: 8, name: "Grain Mill", category: buildingCategoryResources },
    {
      structureId: 11,
      name: "Granary",
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 37,
      name: "Hero's Mansion",
      category: buildingCategoryMilitary,
    },
    { structureId: 46, name: "Hospital", category: buildingCategoryMilitary },
    {
      structureId: 7,
      name: "Iron Foundry",
      category: buildingCategoryResources,
    },
    {
      structureId: 15,
      name: "Main Building",
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 17,
      name: "Marketplace",
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 26,
      name: "Palace",
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 33,
      name: "Palisade",
      category: buildingCategoryOther,
      slot: 40,
    },
    {
      structureId: 16,
      name: "Rally Point",
      category: buildingCategoryOther,
      slot: 39,
    },
    {
      structureId: 25,
      name: "Residence",
      category: buildingCategoryInfrastructure,
    },
    { structureId: 5, name: "Sawmill", category: buildingCategoryResources },
    { structureId: 13, name: "Smithy", category: buildingCategoryMilitary },
    { structureId: 20, name: "Stable", category: buildingCategoryMilitary },
    {
      structureId: 34,
      name: "Stonemason's Lodge",
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 14,
      name: "Tournament Square",
      category: buildingCategoryMilitary,
    },
    {
      structureId: 24,
      name: "Town Hall",
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 28,
      name: "Trade Office",
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 27,
      name: "Treasury",
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 10,
      name: "Warehouse",
      category: buildingCategoryInfrastructure,
    },
    { structureId: 21, name: "Workshop", category: buildingCategoryMilitary },
  ];
  return buildingTypes;
};

module.exports = populateBuildingTypes;
