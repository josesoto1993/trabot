const getResourceFieldsData = require("../village/resourceFieldsData");
const { upgradeExistingField } = require("./upgradeExistingBuilding");

const ConstructionStatus = require("../constants/constructionStatus");
const FieldTypePriority = require("../constants/fieldTypePriority");
const CAPITAL_FIELDS_ENABLE = process.env.CAPITAL_FIELDS_ENABLE === "true";

const BUILD_RESOURCES_INTERVAL = 15 * 60;
const RESOURCE_MAX_LEVEL = 10;

const upgradeResources = async (page, village) => {
  const resourceToUpgrade = await getResourceToUpgrade(page, village);

  if (!resourceToUpgrade) {
    return BUILD_RESOURCES_INTERVAL;
  }

  return await upgradeExistingField(page, village.id, resourceToUpgrade.id);
};

const getResourceToUpgrade = async (page, village) => {
  const allFieldsAreMaxLevel = village.resourceFields.every(
    (field) => field.level >= RESOURCE_MAX_LEVEL
  );

  if (allFieldsAreMaxLevel && !village.capital) {
    return null;
  }

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
      (field.level < 10 || CAPITAL_FIELDS_ENABLE)
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

module.exports = upgradeResources;
