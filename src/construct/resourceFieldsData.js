const FieldType = require("../constants/fieldType");
const ConstructionStatus = require("../constants/constructionStatus");
const { goPage } = require("../browser/browserService");
const { TRAVIAN_RESOURCES_VIEW } = require("../constants/links");

const ResourceField = require("../models/resourceField");

const getResourceFieldsData = async (page, village) => {
  await goVillage(village);
  await page.waitForSelector("#resourceFieldContainer");

  const resourceFields = await page.$$eval(
    `#resourceFieldContainer a`,
    (nodes) => {
      return nodes
        .filter((node) => !node.classList.contains("villageCenter"))
        .map((node) => Array.from(node.classList));
    }
  );

  return resourceFields.map((classes) => {
    const fieldId = getFieldId(classes);
    const fieldLvl = getFieldLevel(classes);
    const constructionStatus = getConstructionStatus(classes);
    const fieldType = getFieldType(classes);

    return new ResourceField(fieldId, fieldLvl, constructionStatus, fieldType);
  });
};

const goVillage = async (village) => {
  const villageUrl = new URL(TRAVIAN_RESOURCES_VIEW);
  villageUrl.searchParams.append("newdid", village.id);

  await goPage(villageUrl.toString());
  console.log(`Navigated to village: ${village.name}`);
};

const getFieldId = (classes) => {
  const buildingSlotClass = classes.find((cls) =>
    cls.startsWith("buildingSlot")
  );
  if (!buildingSlotClass) {
    throw new Error(
      `Field ID not found buildingSlot for classes: ${classes.join(", ")}`
    );
  }

  const id = parseInt(buildingSlotClass.replace("buildingSlot", ""), 10);
  if (isNaN(id)) {
    throw new Error(`Field ID not found for classes: ${classes.join(", ")}`);
  }

  return id;
};

const getFieldLevel = (classes) => {
  const levelClass = classes.find(
    (cls) =>
      cls.startsWith("level") && !isNaN(parseInt(cls.replace("level", ""), 10))
  );

  if (!levelClass) {
    throw new Error(`Field level not found for classes: ${classes.join(", ")}`);
  }

  const level = parseInt(levelClass.replace("level", ""), 10);
  if (isNaN(level)) {
    throw new Error(
      `Field level is not a valid number for classes: ${classes.join(", ")}`
    );
  }

  return level;
};

const getConstructionStatus = (classes) => {
  if (classes.includes(ConstructionStatus.maxLevel)) {
    return ConstructionStatus.maxLevel;
  } else if (classes.includes(ConstructionStatus.notEnoughResources)) {
    return ConstructionStatus.notEnoughResources;
  } else if (classes.includes(ConstructionStatus.readyToUpgrade)) {
    return ConstructionStatus.readyToUpgrade;
  }
  return ConstructionStatus.notEnoughStorage;
};

const getFieldType = (classes) => {
  if (classes.includes(FieldType.crop)) {
    return FieldType.crop;
  } else if (classes.includes(FieldType.clay)) {
    return FieldType.clay;
  } else if (classes.includes(FieldType.iron)) {
    return FieldType.iron;
  } else if (classes.includes(FieldType.wood)) {
    return FieldType.wood;
  }
  throw new Error(`Field type not found for classes: ${classes.join(", ")}`);
};

module.exports = getResourceFieldsData;
