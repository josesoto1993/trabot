const BuildingCategoryModel = require("../schemas/buildingCategorySchema");

let cachedCategories = null;

const loadBuildingCategories = async () => {
  if (!cachedCategories) {
    const categories = await BuildingCategoryModel.find();
    cachedCategories = {};
    categories.forEach((category) => {
      cachedCategories[category.name] = category;
    });
  }
  return cachedCategories;
};

const getBuildingCategory = async (name) => {
  const categories = await loadBuildingCategories();
  return categories[name];
};

const upsertBuildingCategory = async (category) => {
  const filter = { name: category.name };
  const update = { value: category.value };
  const options = { new: true, upsert: true, setDefaultsOnInsert: true };

  const result = await BuildingCategoryModel.findOneAndUpdate(
    filter,
    update,
    options
  );

  cleanCache();

  return result;
};

const cleanCache = () => {
  cachedBuildingTypes = null;
};

module.exports = { getBuildingCategory, upsertBuildingCategory };
