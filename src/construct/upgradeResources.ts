import { Page } from "puppeteer";
import { upgradeExistingField } from "./upgradeExistingBuilding";
import ConstructionStatus from "../constants/constructionStatus";
import FieldTypePriority from "../constants/fieldTypePriority";
import Village from "../models/village";
import ResourceField from "../models/resourceField";

const CAPITAL_FIELDS_ENABLE = process.env.CAPITAL_FIELDS_ENABLE === "true";

const RESOURCE_MAX_LEVEL = 10;

const upgradeResources = async (
  page: Page,
  village: Village
): Promise<number | null> => {
  const resourceToUpgrade = getResourceToUpgrade(village);

  if (!resourceToUpgrade) {
    return null;
  }

  return await upgradeExistingField(page, village.id, resourceToUpgrade.slotId);
};

const getResourceToUpgrade = (village: Village): ResourceField | null => {
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

const getPossibleResourcesToUpgrade = (village: Village): ResourceField[] => {
  const resourceFields = village.resourceFields;

  const possibleResourcesToUpgrade = resourceFields.filter(
    (field) =>
      field.constructionStatus === ConstructionStatus.READY_TO_UPGRADE &&
      (field.level < RESOURCE_MAX_LEVEL ||
        (village.capital && CAPITAL_FIELDS_ENABLE))
  );

  possibleResourcesToUpgrade.sort(sortResources);

  return possibleResourcesToUpgrade;
};

const sortResources = (a: ResourceField, b: ResourceField): number => {
  const priorityDifference =
    FieldTypePriority[a.fieldType] - FieldTypePriority[b.fieldType];
  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  return a.level - b.level;
};

export default upgradeResources;
