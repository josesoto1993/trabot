import populateBuildingCategories from "./buildingCategoryPopulator";
import populateBuildingTypes from "./buildingTypePopulator";
import populateOasisFarms from "./oasisFarmPopulator";
import populatePriorityBuildings from "./priorityBuildingPopulator";
import populateTasks from "./taskPopulator";
import ensureTileCollectionExists from "./tilePopulator";
import ensureTrainCollectionExists from "./trainPopulator";
import populateUnits from "./unitPopulator";
import ensureUpgradeCollectionExists from "./upgradePopulator";

const populate = async (): Promise<void> => {
  console.log("Start population");
  await populateTasks();

  await populateBuildingCategories();
  await populateBuildingTypes();
  await populatePriorityBuildings();

  await populateUnits();
  await ensureTrainCollectionExists();
  await ensureUpgradeCollectionExists();
  await ensureTileCollectionExists();
  await populateOasisFarms();
  console.log("End population");
};

export default populate;
