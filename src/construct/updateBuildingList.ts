const { upgradeExistingBuilding } = require("./upgradeExistingBuilding");
import { ConstructionStatus } from "../constants/constructionStatus";
const { getBuildingType } = require("../services/buildingTypeService");

const updateBuildingList = async (
  page,
  village,
  buildingsToUpgrade,
  priority
) => {
  const buildingsToUpgradeInVillage = filterBuildingsToUpgrade(
    village,
    buildingsToUpgrade
  );
  const building = getFirstBuildingToUpgrade(buildingsToUpgradeInVillage);

  if (building) {
    return await upgradeBuilding(page, village, building);
  }

  console.log(
    `No priority ${priority} buildings to upgrade in village ${village.name}`
  );
  return null;
};

const filterBuildingsToUpgrade = (village, buildingsToUpgrade) => {
  const filteredBuildings = [];

  for (const buildingToUpgrade of buildingsToUpgrade) {
    const matchingVillageBuildings = village.buildings.filter(
      (villageBuilding) =>
        villageBuilding.name === buildingToUpgrade.building.name &&
        villageBuilding.level < buildingToUpgrade.targetLevel &&
        villageBuilding.constructionStatus ===
          ConstructionStatus.READY_TO_UPGRADE
    );

    filteredBuildings.push(...matchingVillageBuildings);
  }

  return filteredBuildings;
};

const getFirstBuildingToUpgrade = (buildingsToUpgradeInVillage) => {
  if (buildingsToUpgradeInVillage.length > 0) {
    return buildingsToUpgradeInVillage[0];
  }
  return null;
};

const upgradeBuilding = async (page, village, building) => {
  console.log(
    `Upgrading building ${building.name} in village ${village.name} from level ${building.level}`
  );

  const buildingType = await getBuildingType(building.name);
  const upgradeTime = await upgradeExistingBuilding(
    page,
    village.id,
    building.slotId,
    buildingType
  );

  return upgradeTime;
};

module.exports = updateBuildingList;
