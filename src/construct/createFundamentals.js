const FundamentalBuildings = require("../constants/fundamentalBuildings");
const { BuildingCategory } = require("../constants/buildingCategory");
const createBuilding = require("./createBuilding");

const createFundamentals = async (page, village) => {
  for (const fundamentalBuilding of FundamentalBuildings) {
    const buildingExists = village.buildings.some(
      (building) => building.name === fundamentalBuilding.name
    );

    if (!buildingExists) {
      console.log(
        `Village ${village.name} lacks fundamental building ${fundamentalBuilding.name}`
      );
      return await createFundamentalBuilding(
        page,
        village,
        fundamentalBuilding
      );
    }
  }

  return null;
};

const createFundamentalBuilding = async (
  page,
  village,
  fundamentalBuilding
) => {
  if (fundamentalBuilding.category === BuildingCategory.other) {
    return await createBuilding(page, village.id, 0, fundamentalBuilding.name);
  }

  const availableSlotId = village.buildings.find(
    (building) =>
      building.name === null ||
      building.name === "null" ||
      building.name.trim() === ""
  )?.slotId;

  if (availableSlotId === undefined) {
    console.error(
      `No available slot found in village ${village.id} for fundamental Building ${fundamentalBuilding.name}.`
    );
    return null;
  }

  console.log(
    `Creating ${fundamentalBuilding.name} in village ${village.id} in slot ${availableSlotId}`
  );

  return await createBuilding(
    page,
    village.id,
    availableSlotId,
    fundamentalBuilding.name
  );
};

module.exports = createFundamentals;
