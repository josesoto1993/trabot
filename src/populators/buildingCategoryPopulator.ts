import BuildingCategory from "../constants/buildingCategories";
import {
  IBuildingCategoryUpsertData,
  upsertBuildingCategory,
} from "../services/buildingCategoryService";

const populateBuildingCategories = async (): Promise<void> => {
  console.log("start populate building categories");

  const categories = getBaseBuildingCategories();
  for (const category of categories) {
    try {
      await upsertBuildingCategory(category);
    } catch (error) {
      console.error(`Error upserting category "${category.name}":`, error);
    }
  }

  console.log("finish populate building categories");
};

const getBaseBuildingCategories = (): IBuildingCategoryUpsertData[] => {
  return [
    { name: BuildingCategory.INFRASTRUCTURE, value: 1 },
    { name: BuildingCategory.MILITARY, value: 2 },
    { name: BuildingCategory.RESOURCES, value: 3 },
    { name: BuildingCategory.OTHER, value: 4 },
    { name: BuildingCategory.UNDEFINED, value: -1 },
  ];
};

export default populateBuildingCategories;
