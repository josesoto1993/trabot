const BUILDING_CATEGORIES = require("../constants/BuildingCategories");
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
    { name: BUILDING_CATEGORIES.INFRASTRUCTURE, value: 1 },
    { name: BUILDING_CATEGORIES.MILITARY, value: 2 },
    { name: BUILDING_CATEGORIES.RESOURCES, value: 3 },
    { name: BUILDING_CATEGORIES.OTHER, value: 4 },
    { name: BUILDING_CATEGORIES.UNDEFINED, value: -1 },
  ];
};

module.exports = populateBuildingCategories;
