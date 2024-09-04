import populateBuildingCategories from "./buildingCategoryPopulator";
import populateBuildingTypes from "./buildingTypePopulator";
import populatePriorityBuildings from "./PriorityBuildingPopulator";
import populateTasks from "./taskPopulator";
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
  console.log("End population");
};

export default populate;
