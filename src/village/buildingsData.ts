import { Page } from "puppeteer";
import ConstructionStatus from "../constants/constructionStatus";
import { goVillageBuildingView } from "./goVillage";
import Building from "../models/building";
import {
  getBuildingTypes,
  upsertBuildingType,
} from "../services/buildingTypeService";
import { getBuildingCategory } from "../services/buildingCategoryService";
import BuildingCategory from "../constants/buildingCategories";
import Village from "../models/village";
import { getBuildingName } from "../constants/buildingNames";

interface BuildingRawData {
  aid: string;
  gid: string;
  name: string;
  level: number;
  anchorClasses: string[];
}

const getBuildingData = async (
  page: Page,
  village: Village
): Promise<Building[]> => {
  await goVillageBuildingView(village);

  const rawBuildings = await getBuildingRawData(page);

  return await buildingsRawToObject(rawBuildings);
};

const getBuildingRawData = async (page: Page): Promise<BuildingRawData[]> => {
  await page.waitForSelector("#villageContent");
  return await page.$$eval("#villageContent .buildingSlot", (nodes) => {
    return nodes.map((node) => {
      const anchor = node.querySelector("a.level");

      let level = anchor ? parseInt(anchor.getAttribute("data-level"), 10) : 0;

      if (anchor?.classList.contains("underConstruction")) {
        level += 1;
      }

      return {
        aid: node.getAttribute("data-aid"),
        gid: node.getAttribute("data-gid"),
        name: node.getAttribute("data-name"),
        level: level,
        anchorClasses: anchor ? Array.from(anchor.classList) : [],
      };
    });
  });
};

const buildingsRawToObject = async (
  raw: BuildingRawData[]
): Promise<Building[]> => {
  const buildings = raw.map((data) => {
    const slotId = parseInt(data.aid, 10);
    const structureId = parseInt(data.gid, 10);
    const name = getBuildingName(data.name);
    const level = parseInt(data.level.toString(), 10);
    const constructionStatus = getConstructionStatus(data.anchorClasses);

    return new Building(structureId, slotId, name, level, constructionStatus);
  });

  const buildingTypes = await getBuildingTypes();
  await Promise.all(
    buildings
      .filter(
        (building) =>
          !Object.values(buildingTypes).some(
            (buildingType) => building.structureId === buildingType.structureId
          )
      )
      .map(async (newBuildingType) => {
        await addNewBuildingType(
          newBuildingType.structureId,
          newBuildingType.name
        );
      })
  );

  return buildings;
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

const addNewBuildingType = async (
  structureId: number,
  name: string
): Promise<void> => {
  const buildingCategory = await getBuildingCategory(
    BuildingCategory.UNDEFINED
  );

  if (!buildingCategory) {
    console.error(`Error: '${BuildingCategory.UNDEFINED}' category not found.`);
    return;
  }

  const buildingTypeData = {
    structureId,
    name,
    category: buildingCategory,
    slot: null,
  };

  await upsertBuildingType(buildingTypeData);

  console.log(
    `Added or updated building type: ${name} with id: ${structureId}`
  );
};

export default getBuildingData;
