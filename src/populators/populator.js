const populateBuildingCategories = require("./buildingCategoryPopulator");
const populateBuildingTypes = require("./buildingTypePopulator");
const ensureTrainCollectionExists = require("./trainPopulator");
const populateUnits = require("./unitPopulator");

const populate = async () => {
  console.log("Start population");
  await populateBuildingCategories();
  await populateBuildingTypes();
  await populateUnits();
  await ensureTrainCollectionExists();
  console.log("End population");
};

module.exports = populate;
