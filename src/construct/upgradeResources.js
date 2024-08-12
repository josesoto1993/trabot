const { upgradeExistingField } = require("./upgradeExistingBuilding");

const ConstructionStatus = require("../constants/constructionStatus");
const FieldTypePriority = require("../constants/fieldTypePriority");
const CAPITAL_FIELDS_ENABLE = process.env.CAPITAL_FIELDS_ENABLE === "true";

const RESOURCE_MAX_LEVEL = 10;

const upgradeResources = async (page, village) => {
  const resourceToUpgrade = getResourceToUpgrade(village);

  if (!resourceToUpgrade) {
    return null;
  }

  return await upgradeExistingField(page, village.id, resourceToUpgrade.id);
};

const getResourceToUpgrade = (village) => {
  const possibleResourcesToUpgrade = getPossibleResourcesToUpgrade(village);

  if (possibleResourcesToUpgrade.length === 0) {
    console.log(
      "No resource fields ready for upgrade found in village:",
      village.name
    );
    return null;
  }

  return possibleResourcesToUpgrade[0];
};

const getPossibleResourcesToUpgrade = (village) => {
  const resourceFields = village.resourceFields;

  const possibleResourcesToUpgrade = resourceFields.filter(
    (field) =>
      field.constructionStatus === ConstructionStatus.readyToUpgrade &&
      (field.level < RESOURCE_MAX_LEVEL || CAPITAL_FIELDS_ENABLE)
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
