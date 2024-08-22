const BuildingCategoryModel = require("../schemas/buildingCategorySchema");

const populateBuildingCategories = async () => {
  const categories = [
    { name: "infrastructure", value: 1 },
    { name: "military", value: 2 },
    { name: "resources", value: 3 },
    { name: "other", value: 4 },
  ];

  for (const category of categories) {
    const existingCategory = await BuildingCategoryModel.findOne({
      name: category.name,
    });
    if (!existingCategory) {
      await BuildingCategoryModel.create(category);
    } else if (existingCategory.value !== category.value) {
      console.warn(
        `Warning: BuildingCategory "${category.name}" has a different value in the database. Expected: ${category.value}, Found: ${existingCategory.value}`
      );
    }
  }
};

module.exports = populateBuildingCategories;
