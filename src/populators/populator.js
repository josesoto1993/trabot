const populateBuildingCategories = require("./buildingCategoryPopulator");
const populateBuildingTypes = require("./buildingTypePopulator");

const populate = async () => {
  console.log("Start population");
  await populateBuildingCategories();
  await populateBuildingTypes();
  console.log("End population");
};

module.exports = populate;
