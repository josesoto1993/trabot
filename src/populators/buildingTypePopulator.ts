const { upsertBuildingType } = require("../services/buildingTypeService");
const { getBuildingCategory } = require("../services/buildingCategoryService");
const BUILDING_CATEGORIES = require("../constants/buildingCategories");
const BUILDING_NAMES = require("../constants/buildingNames");

const populateBuildingTypes = async () => {
  console.log("start populate building types");

  const buildingTypes = await getBaseBuildingTypes();
  for (const buildingType of buildingTypes) {
    try {
      if (!buildingType.name) {
        console.warn(
          `Skipping building type with missing name: '${JSON.stringify(buildingType, null, 2)}'`
        );
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
  const buildingCategoryOther = await getBuildingCategory(
    BUILDING_CATEGORIES.OTHER
  );
  const buildingCategoryMilitary = await getBuildingCategory(
    BUILDING_CATEGORIES.MILITARY
  );
  const buildingCategoryResources = await getBuildingCategory(
    BUILDING_CATEGORIES.RESOURCES
  );
  const buildingCategoryInfrastructure = await getBuildingCategory(
    BUILDING_CATEGORIES.INFRASTRUCTURE
  );

  const buildingTypes = [
    {
      structureId: 22,
      name: BUILDING_NAMES.ACADEMY,
      category: buildingCategoryMilitary,
    },
    {
      structureId: 9,
      name: BUILDING_NAMES.BAKERY,
      category: buildingCategoryResources,
    },
    {
      structureId: 19,
      name: BUILDING_NAMES.BARRACKS,
      category: buildingCategoryMilitary,
    },
    {
      structureId: 6,
      name: BUILDING_NAMES.BRICKYARD,
      category: buildingCategoryResources,
    },
    {
      structureId: 23,
      name: BUILDING_NAMES.CRANNY,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 18,
      name: BUILDING_NAMES.EMBASSY,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 8,
      name: BUILDING_NAMES.GRAIN_MILL,
      category: buildingCategoryResources,
    },
    {
      structureId: 11,
      name: BUILDING_NAMES.GRANARY,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 37,
      name: BUILDING_NAMES.HEROS_MANSION,
      category: buildingCategoryMilitary,
    },
    {
      structureId: 46,
      name: BUILDING_NAMES.HOSPITAL,
      category: buildingCategoryMilitary,
    },
    {
      structureId: 7,
      name: BUILDING_NAMES.IRON_FOUNDRY,
      category: buildingCategoryResources,
    },
    {
      structureId: 15,
      name: BUILDING_NAMES.MAIN_BUILDING,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 17,
      name: BUILDING_NAMES.MARKETPLACE,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 26,
      name: BUILDING_NAMES.PALACE,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 33,
      name: BUILDING_NAMES.PALISADE,
      category: buildingCategoryOther,
      slot: 40,
    },
    {
      structureId: 16,
      name: BUILDING_NAMES.RALLY_POINT,
      category: buildingCategoryOther,
      slot: 39,
    },
    {
      structureId: 25,
      name: BUILDING_NAMES.RESIDENCE,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 5,
      name: BUILDING_NAMES.SAWMILL,
      category: buildingCategoryResources,
    },
    {
      structureId: 13,
      name: BUILDING_NAMES.SMITHY,
      category: buildingCategoryMilitary,
    },
    {
      structureId: 20,
      name: BUILDING_NAMES.STABLE,
      category: buildingCategoryMilitary,
    },
    {
      structureId: 34,
      name: BUILDING_NAMES.STONEMASONS_LODGE,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 36,
      name: BUILDING_NAMES.TRAPPER,
      category: buildingCategoryMilitary,
    },
    {
      structureId: 14,
      name: BUILDING_NAMES.TOURNAMENT_SQUARE,
      category: buildingCategoryMilitary,
    },
    {
      structureId: 24,
      name: BUILDING_NAMES.TOWN_HALL,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 28,
      name: BUILDING_NAMES.TRADE_OFFICE,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 27,
      name: BUILDING_NAMES.TREASURY,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 10,
      name: BUILDING_NAMES.WAREHOUSE,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 21,
      name: BUILDING_NAMES.WORKSHOP,
      category: buildingCategoryMilitary,
    },
  ];

  return buildingTypes;
};

module.exports = populateBuildingTypes;
