const { upgradeExistingBuilding } = require("./upgradeExistingBuilding");
const BuildingTypes = require("../constants/buildingTypes");
const ConstructionStatus = require("../constants/constructionStatus");

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
  return village.buildings.filter((villageBuilding) => {
    const buildingToUpgrade = buildingsToUpgrade.find(
      (btu) => btu.type.name === villageBuilding.name
    );
    return (
      buildingToUpgrade &&
      villageBuilding.level < buildingToUpgrade.level &&
      villageBuilding.constructionStatus === ConstructionStatus.readyToUpgrade
    );
  });
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

  const buildingType = BuildingTypes[building.name];
  const upgradeTime = await upgradeExistingBuilding(
    page,
    village.id,
    building.slotId,
    buildingType
  );

  return upgradeTime;
};

module.exports = updateBuildingList;
