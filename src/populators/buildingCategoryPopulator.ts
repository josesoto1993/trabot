import { BuildingCategory } from "../constants/buildingCategories";
const {
  upsertBuildingCategory,
} = require("../services/buildingCategoryService");

const populateBuildingCategories = async () => {
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

const getBaseBuildingCategories = () => {
  return [
    { name: BuildingCategory.INFRASTRUCTURE, value: 1 },
    { name: BuildingCategory.MILITARY, value: 2 },
    { name: BuildingCategory.RESOURCES, value: 3 },
    { name: BuildingCategory.OTHER, value: 4 },
    { name: BuildingCategory.UNDEFINED, value: -1 },
  ];
};

module.exports = populateBuildingCategories;
