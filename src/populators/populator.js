const populateBuildingCategories = require("./buildingCategoryPopulator");
const populateBuildingTypes = require("./buildingTypePopulator");
const populatePriorityBuildings = require("./PriorityBuildingPopulator");
const populateTasks = require("./taskPopulator");
const ensureTrainCollectionExists = require("./trainPopulator");
const populateUnits = require("./unitPopulator");
const ensureUpgradeCollectionExists = require("./upgradePopulator");

const populate = async () => {
  console.log("Start population");
  await populateTasks();

  await populateBuildingCategories();
  await populateBuildingTypes();
  await populatePriorityBuildings();

  await populateUnits();
  await ensureTrainCollectionExists();
  await ensureUpgradeCollectionExists();
  console.log("End population");
};

module.exports = populate;
