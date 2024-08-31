import { Page } from "puppeteer";
import { FieldType } from "../constants/fieldType";
import { ConstructionStatus } from "../constants/constructionStatus";
import { goVillageResView } from "./goVillage";
import ResourceField from "../models/resourceField";
import Village from "../models/village";

export const getResourceFieldsData = async (
  page: Page,
  village: Village
): Promise<ResourceField[]> => {
  await goVillageResView(village);

  const resourceFields = await getResourceFieldsRawData(page);
  return resourceFieldsRawToObject(resourceFields);
};

const getResourceFieldsRawData = async (page: Page): Promise<string[][]> => {
  await page.waitForSelector("#resourceFieldContainer");
  return await page.$$eval(`#resourceFieldContainer a`, (nodes) => {
    return nodes
      .filter((node) => !node.classList.contains("villageCenter"))
      .map((node) => Array.from(node.classList));
  });
};

const resourceFieldsRawToObject = (rows: string[][]): ResourceField[] => {
  return rows.map((classes) => {
    const fieldId = getFieldId(classes);
    const fieldLvl = getFieldLevel(classes);
    const constructionStatus = getConstructionStatus(classes);
    const fieldType = getFieldType(classes);

    return new ResourceField(fieldId, fieldLvl, constructionStatus, fieldType);
  });
};

const getFieldId = (classes: string[]): number => {
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

const getFieldLevel = (classes: string[]): number => {
  const levelClass = classes.find(
    (cls) =>
      cls.startsWith("level") && !isNaN(parseInt(cls.replace("level", ""), 10))
  );

  if (!levelClass) {
    throw new Error(`Field level not found for classes: ${classes.join(", ")}`);
  }

  let level = parseInt(levelClass.replace("level", ""), 10);
  if (isNaN(level)) {
    throw new Error(
      `Field level is not a valid number for classes: ${classes.join(", ")}`
    );
  }

  if (classes.includes("underConstruction")) {
    level += 1;
  }

  return level;
};

const getConstructionStatus = (classes: string[]): ConstructionStatus => {
  if (classes.includes(ConstructionStatus.MAX_LEVEL)) {
    return ConstructionStatus.MAX_LEVEL;
  } else if (classes.includes(ConstructionStatus.NOT_ENOUGH_RESOURCES)) {
    return ConstructionStatus.NOT_ENOUGH_RESOURCES;
  } else if (classes.includes(ConstructionStatus.READY_TO_UPGRADE)) {
    return ConstructionStatus.READY_TO_UPGRADE;
  }
  return ConstructionStatus.NOT_ENOUGH_STORAGE;
};

const getFieldType = (classes: string[]): FieldType => {
  if (classes.includes(FieldType.CROP)) {
    return FieldType.CROP;
  } else if (classes.includes(FieldType.CLAY)) {
    return FieldType.CLAY;
  } else if (classes.includes(FieldType.IRON)) {
    return FieldType.IRON;
  } else if (classes.includes(FieldType.WOOD)) {
    return FieldType.WOOD;
  }
  throw new Error(`Field type not found for classes: ${classes.join(", ")}`);
};
