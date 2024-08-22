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
    { name: "infrastructure", value: 1 },
    { name: "military", value: 2 },
    { name: "resources", value: 3 },
    { name: "other", value: 4 },
    { name: "TBD", value: -1 },
  ];
};

module.exports = populateBuildingCategories;
