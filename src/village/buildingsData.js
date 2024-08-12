const fs = require("fs");
const path = require("path");
const ConstructionStatus = require("../constants/constructionStatus");
const { goVillageBuildingView } = require("./goVillage");
const Building = require("../models/building");
const BuildingTypes = require("../constants/buildingTypes");

const getBuildingData = async (page, village) => {
  await goVillageBuildingView(village);
  await page.waitForSelector("#villageContent");

  const buildings = await getBuildingRawData(page);

  return buildingsRawToObject(buildings);
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

const buildingsRawToObject = (raw) => {
  const buildings = raw.map((data) => {
    const slotId = parseInt(data.aid, 10);
    const id = parseInt(data.gid, 10);
    const name = data.name;
    const level = parseInt(data.level, 10);
    const constructionStatus = getConstructionStatus(data.anchorClasses);

    return new Building(id, slotId, name, level, constructionStatus);
  });

  buildings
    .filter(
      (building) =>
        !Object.values(BuildingTypes).some(
          (buildingType) => building.id === buildingType.id
        )
    )
    .forEach((building) => {
      addNewBuildingType(building.id, building.name);
    });

  return buildings;
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

const addNewBuildingType = (id, name) => {
  BuildingTypes[name] = {
    id,
    name,
    category: "TBD",
  };

  const sortedKeys = Object.keys(BuildingTypes).sort((a, b) =>
    a.localeCompare(b)
  );

  const sortedBuildingTypes = {};
  sortedKeys.forEach((key) => {
    sortedBuildingTypes[key] = BuildingTypes[key];
  });

  const buildingTypesPath = path.resolve(
    __dirname,
    "../constants/buildingTypes.js"
  );

  const updatedContent = `const BuildingTypes = ${JSON.stringify(sortedBuildingTypes, null, 2)};
    
    module.exports = BuildingTypes;`;

  fs.writeFileSync(buildingTypesPath, updatedContent, "utf8");

  console.log(`Added new building type: ${name} with id: ${id}`);
};

module.exports = getBuildingData;
