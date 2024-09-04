import {
  IBuildingTypeUpsertData,
  upsertBuildingType,
} from "../services/buildingTypeService";
import { getBuildingCategory } from "../services/buildingCategoryService";
import BuildingCategory from "../constants/buildingCategories";
import BuildingNames from "../constants/buildingNames";

const populateBuildingTypes = async (): Promise<void> => {
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

const getBaseBuildingTypes = async (): Promise<IBuildingTypeUpsertData[]> => {
  const buildingCategoryOther = await getBuildingCategory(
    BuildingCategory.OTHER
  );
  const buildingCategoryMilitary = await getBuildingCategory(
    BuildingCategory.MILITARY
  );
  const buildingCategoryResources = await getBuildingCategory(
    BuildingCategory.RESOURCES
  );
  const buildingCategoryInfrastructure = await getBuildingCategory(
    BuildingCategory.INFRASTRUCTURE
  );

  return [
    {
      structureId: 22,
      name: BuildingNames.ACADEMY,
      category: buildingCategoryMilitary,
    },
    {
      structureId: 9,
      name: BuildingNames.BAKERY,
      category: buildingCategoryResources,
    },
    {
      structureId: 19,
      name: BuildingNames.BARRACKS,
      category: buildingCategoryMilitary,
    },
    {
      structureId: 6,
      name: BuildingNames.BRICKYARD,
      category: buildingCategoryResources,
    },
    {
      structureId: 23,
      name: BuildingNames.CRANNY,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 18,
      name: BuildingNames.EMBASSY,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 8,
      name: BuildingNames.GRAIN_MILL,
      category: buildingCategoryResources,
    },
    {
      structureId: 11,
      name: BuildingNames.GRANARY,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 37,
      name: BuildingNames.HEROS_MANSION,
      category: buildingCategoryMilitary,
    },
    {
      structureId: 46,
      name: BuildingNames.HOSPITAL,
      category: buildingCategoryMilitary,
    },
    {
      structureId: 7,
      name: BuildingNames.IRON_FOUNDRY,
      category: buildingCategoryResources,
    },
    {
      structureId: 15,
      name: BuildingNames.MAIN_BUILDING,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 17,
      name: BuildingNames.MARKETPLACE,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 26,
      name: BuildingNames.PALACE,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 33,
      name: BuildingNames.PALISADE,
      category: buildingCategoryOther,
      slot: 40,
    },
    {
      structureId: 16,
      name: BuildingNames.RALLY_POINT,
      category: buildingCategoryOther,
      slot: 39,
    },
    {
      structureId: 25,
      name: BuildingNames.RESIDENCE,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 5,
      name: BuildingNames.SAWMILL,
      category: buildingCategoryResources,
    },
    {
      structureId: 13,
      name: BuildingNames.SMITHY,
      category: buildingCategoryMilitary,
    },
    {
      structureId: 20,
      name: BuildingNames.STABLE,
      category: buildingCategoryMilitary,
    },
    {
      structureId: 34,
      name: BuildingNames.STONEMASONS_LODGE,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 36,
      name: BuildingNames.TRAPPER,
      category: buildingCategoryMilitary,
    },
    {
      structureId: 14,
      name: BuildingNames.TOURNAMENT_SQUARE,
      category: buildingCategoryMilitary,
    },
    {
      structureId: 24,
      name: BuildingNames.TOWN_HALL,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 28,
      name: BuildingNames.TRADE_OFFICE,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 27,
      name: BuildingNames.TREASURY,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 10,
      name: BuildingNames.WAREHOUSE,
      category: buildingCategoryInfrastructure,
    },
    {
      structureId: 21,
      name: BuildingNames.WORKSHOP,
      category: buildingCategoryMilitary,
    },
  ];
};

export default populateBuildingTypes;
