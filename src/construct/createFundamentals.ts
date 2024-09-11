import { Page } from "puppeteer";
import createBuilding from "./createBuilding";
import { getBuildingCategory } from "../services/buildingCategoryService";
import { getPriorityBuildingByPriority } from "../services/priorityBuildingService";
import PriorityLevels from "../constants/priorityLevels";
import BuildingCategory from "../constants/buildingCategories";
import Village from "../models/village";
import Building from "../models/building";
import { IBuildingType } from "../services/buildingTypeService";

const createFundamentals = async (
  page: Page,
  village: Village
): Promise<boolean> => {
  const fundamentals = await getPriorityBuildingByPriority(
    PriorityLevels.FUNDAMENTAL
  );

  for (const fundamental of fundamentals) {
    const fundamentalBuilding = fundamental.buildingType;
    const buildingExists = village.buildings.some(
      (building: Building) => building.name === fundamentalBuilding.name
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

  return false;
};

const createFundamentalBuilding = async (
  page: Page,
  village: Village,
  fundamentalBuilding: IBuildingType
): Promise<boolean> => {
  const availableSlotId = await getAvailableSlotId(
    fundamentalBuilding,
    village
  );

  if (availableSlotId === undefined) {
    console.error(
      `No available slot found in village ${village.name} for fundamental Building ${fundamentalBuilding.name}.`
    );
    return false;
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

const getAvailableSlotId = async (
  fundamentalBuilding: IBuildingType,
  village: Village
): Promise<number | undefined> => {
  const otherCategory = await getBuildingCategory(BuildingCategory.OTHER);

  if (fundamentalBuilding.category.name === otherCategory.name) {
    return fundamentalBuilding.slot;
  }

  return village.buildings.find(
    (building: Building) => !building.name || building.name.trim() === ""
  )?.slotId;
};

export default createFundamentals;
