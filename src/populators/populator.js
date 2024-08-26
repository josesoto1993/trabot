const populateBuildingCategories = require("./buildingCategoryPopulator");
const populateBuildingTypes = require("./buildingTypePopulator");
const populateUnits = require("./unitPopulator");

const populate = async () => {
  console.log("Start population");
  await populateBuildingCategories();
  await populateBuildingTypes();
  await populateUnits();
  console.log("End population");
};

module.exports = populate;
