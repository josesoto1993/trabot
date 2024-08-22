const BuildingCategoryModel = require("../schemas/buildingCategorySchema");

let BuildingCategory = {};

const loadBuildingCategories = async () => {
  const categories = await BuildingCategoryModel.find();
  categories.forEach((category) => {
    BuildingCategory[category.name] = category.value;
  });
};

module.exports = { BuildingCategory, loadBuildingCategories };
