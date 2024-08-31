const createBuilding = require("./createBuilding");
const { getBuildingCategory } = require("../services/buildingCategoryService");
const { getAllByPriority } = require("../services/PriorityBuildingService");
import { PriorityLevels } from "../constants/priorityLevels";
import { BuildingCategory } from "../constants/buildingCategories";

const createFundamentals = async (page, village) => {
  const fundamentals = await getAllByPriority(PriorityLevels.FUNDAMENTAL);
  for (const fundamental of fundamentals) {
    const fundamentalBuilding = fundamental.building;
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
  const availableSlotId = await getAvailableSlotId(
    fundamentalBuilding,
    village
  );

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

const getAvailableSlotId = async (fundamentalBuilding, village) => {
  const otherCategory = await getBuildingCategory(BuildingCategory.OTHER);
  if (fundamentalBuilding.category._id.equals(otherCategory._id)) {
    return fundamentalBuilding.slot;
  }

  return village.buildings.find(
    (building) =>
      building.name === null ||
      building.name === "null" ||
      building.name.trim() === ""
  )?.slotId;
};

module.exports = createFundamentals;
