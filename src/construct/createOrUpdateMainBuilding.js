const { upgradeExistingBuilding } = require("./upgradeExistingBuilding");

const BuildingTypes = require("../constants/buildingTypes");
const createBuilding = require("./createBuilding");

const mainBuildingType = BuildingTypes["Main Building"];

const createOrUpdateMainBuilding = async (page, village) => {
  const mainBuilding = village.buildings.find(
    (building) => building.name === mainBuildingType.name
  );

  if (!mainBuilding) {
    return await createMainBuilding(page, village);
  } else if (mainBuilding.level < 20) {
    return await upgradeMainBuilding(page, village, mainBuilding);
  } else {
    return null;
  }
};

const createMainBuilding = async (page, village) => {
  const availableSlotId = village.buildings.find(
    (building) =>
      building.name === null ||
      building.name === "null" ||
      building.name.trim() === ""
  )?.slotId;

  if (availableSlotId === undefined) {
    console.error(
      `No available slot found in village ${village.id} for Main Building.`
    );
    return null;
  }

  console.log(
    `Creating Main Building in village ${village.id} in slot ${availableSlotId}`
  );

  return await createBuilding(page, village, availableSlotId, mainBuildingType);
};

const upgradeMainBuilding = async (page, village, mainBuilding) => {
  console.log(
    `Upgrading Main Building in village ${village.name} from level ${mainBuilding.level}`
  );
  const upgradeTime = await upgradeExistingBuilding(
    page,
    village.id,
    mainBuilding.slotId,
    mainBuildingType
  );

  if (!upgradeTime) {
    console.log("There is MB to upgrade but cant upgrade now");
    return null;
  }

  return upgradeTime;
};

module.exports = createOrUpdateMainBuilding;
