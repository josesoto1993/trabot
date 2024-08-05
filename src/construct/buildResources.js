const { getVillagesInfo } = require("../village/listVillageIdsService");
const ConstructionStatus = require("../constants/constructionStatus");
const getResourceFieldsData = require("./resourceFieldsData");
const upgradeBuilding = require("./upgradeBuilding");
const FieldTypePriority = require("../constants/fieldTypePriority");

let upgradeResourceCount = 0;
const BUILD_RESOURCES_INTERVAL = 15 * 60;

const buildResources = async (page) => {
  try {
    const villages = await getVillagesInfo(page);

    let upgradedThisRun = 0;
    let minUpgradeTime = BUILD_RESOURCES_INTERVAL;

    for (const village of villages) {
      const resourceToUpgrade = await getResourceToUpgrade(page, village);

      if (!resourceToUpgrade) {
        continue;
      }

      const upgradeTime = await upgradeBuilding(
        page,
        village,
        resourceToUpgrade.id
      );

      minUpgradeTime = Math.min(minUpgradeTime, upgradeTime);
      upgradedThisRun += 1;
      upgradeResourceCount += 1;
    }

    if (upgradedThisRun > 0) {
      console.log(`Upgrades done this time: ${upgradedThisRun}`);
      console.log(`Total upgrades done: ${upgradeResourceCount}`);
    } else {
      console.log("Nothing to update");
    }

    return minUpgradeTime;
  } catch (error) {
    console.error("Error in buildResources:", error);
    return BUILD_RESOURCES_INTERVAL;
  }
};

const getResourceToUpgrade = async (page, village) => {
  const possibleResourcesToUpgrade = await getPossibleResourcesToUpgrade(
    page,
    village
  );

  if (possibleResourcesToUpgrade.length === 0) {
    console.log(
      "No resource fields ready for upgrade found in village:",
      village.name
    );
    return null;
  }

  return possibleResourcesToUpgrade[0];
};

const getPossibleResourcesToUpgrade = async (page, village) => {
  const resourceFields = await getResourceFieldsData(page, village);

  const possibleResourcesToUpgrade = resourceFields.filter(
    (field) =>
      field.constructionStatus === ConstructionStatus.readyToUpgrade &&
      field.level < 10
  );

  possibleResourcesToUpgrade.sort(sortResources);

  return possibleResourcesToUpgrade;
};

const sortResources = (a, b) => {
  // Low level priority: Fields with level <= 3
  const aLowLevel = a.level <= 3;
  const bLowLevel = b.level <= 3;

  if (aLowLevel && !bLowLevel) return -1;
  if (!aLowLevel && bLowLevel) return 1;

  // Higher level priority: Fields with levels > 3
  if (b.level !== a.level) {
    return b.level - a.level;
  }

  // Field type priority
  return FieldTypePriority[a.fieldType] - FieldTypePriority[b.fieldType];
};

module.exports = buildResources;
