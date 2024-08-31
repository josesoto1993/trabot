import { ConstructionStatus } from "../constants/constructionStatus";
const { goVillageBuildingView } = require("./goVillage");
const Building = require("../models/building");
const {
  getBuildingTypes,
  upsertBuildingType,
} = require("../services/buildingTypeService");
const { getBuildingCategory } = require("../services/buildingCategoryService");
import { BuildingCategory } from "../constants/buildingCategories";

const getBuildingData = async (page, village) => {
  await goVillageBuildingView(village);
  await page.waitForSelector("#villageContent");

  const buildings = await getBuildingRawData(page);

  return await buildingsRawToObject(buildings);
};

const getBuildingRawData = async (page) => {
  return await page.$$eval("#villageContent .buildingSlot", (nodes) => {
    return nodes.map((node) => {
      const anchor = node.querySelector("a.level");

      let level = anchor ? parseInt(anchor.getAttribute("data-level"), 10) : 0;

      if (anchor && anchor.classList.contains("underConstruction")) {
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

const buildingsRawToObject = async (raw) => {
  const buildings = raw.map((data) => {
    const slotId = parseInt(data.aid, 10);
    const structureId = parseInt(data.gid, 10);
    const name = data.name;
    const level = parseInt(data.level, 10);
    const constructionStatus = getConstructionStatus(data.anchorClasses);

    return new Building(structureId, slotId, name, level, constructionStatus);
  });

  const buildingTypes = await getBuildingTypes();
  buildings
    .filter(
      (building) =>
        !Object.values(buildingTypes).some(
          (buildingType) => building.structureId === buildingType.structureId
        )
    )
    .forEach((newBuildingType) => {
      addNewBuildingType(newBuildingType.structureId, newBuildingType.name);
    });

  return buildings;
};

const getConstructionStatus = (classes) => {
  if (classes.includes(ConstructionStatus.MAX_LEVEL)) {
    return ConstructionStatus.MAX_LEVEL;
  } else if (classes.includes(ConstructionStatus.NOT_ENOUGH_RESOURCES)) {
    return ConstructionStatus.NOT_ENOUGH_RESOURCES;
  } else if (classes.includes(ConstructionStatus.READY_TO_UPGRADE)) {
    return ConstructionStatus.READY_TO_UPGRADE;
  }
  return ConstructionStatus.NOT_ENOUGH_STORAGE;
};

const addNewBuildingType = async (structureId, name) => {
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

module.exports = getBuildingData;
