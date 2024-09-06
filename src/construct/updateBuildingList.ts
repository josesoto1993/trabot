import { Page } from "puppeteer";
import { upgradeExistingBuilding } from "./upgradeExistingBuilding";
import ConstructionStatus from "../constants/constructionStatus";
import { getBuildingType } from "../services/buildingTypeService";
import Village from "../models/village";
import { IPriorityBuilding } from "../services/PriorityBuildingService";
import Building from "../models/building";
import PriorityLevels from "../constants/priorityLevels";

const updateBuildingList = async (
  page: Page,
  village: Village,
  buildingsToUpgrade: IPriorityBuilding[],
  priority: PriorityLevels
): Promise<boolean> => {
  const buildingsToUpgradeInVillage = filterBuildingsToUpgrade(
    village.buildings,
    buildingsToUpgrade
  );
  const building = getFirstBuildingToUpgrade(buildingsToUpgradeInVillage);

  if (building) {
    return await upgradeBuilding(page, village, building);
  }

  console.log(
    `No priority ${priority} buildings to upgrade in village ${village.name}`
  );
  return false;
};

const filterBuildingsToUpgrade = (
  villageBuildings: Building[],
  buildingsToUpgrade: IPriorityBuilding[]
): Building[] => {
  return buildingsToUpgrade.flatMap((buildingToUpgrade) =>
    villageBuildings.filter((villageBuilding) =>
      isValidBuilding(villageBuilding, buildingToUpgrade)
    )
  );
};

const isValidBuilding = (
  villageBuilding: Building,
  buildingToUpgrade: IPriorityBuilding
): boolean => {
  return (
    villageBuilding.name === buildingToUpgrade.building.name &&
    villageBuilding.level < buildingToUpgrade.targetLevel &&
    villageBuilding.constructionStatus === ConstructionStatus.READY_TO_UPGRADE
  );
};

const getFirstBuildingToUpgrade = (
  buildingsToUpgradeInVillage: Building[]
): Building | null => {
  if (buildingsToUpgradeInVillage.length > 0) {
    return buildingsToUpgradeInVillage[0];
  }
  return null;
};

const upgradeBuilding = async (
  page: Page,
  village: Village,
  building: Building
): Promise<boolean> => {
  console.log(
    `Upgrading building ${building.name} in village ${village.name} from level ${building.level}`
  );

  const buildingType = await getBuildingType(building.name);
  return await upgradeExistingBuilding(
    page,
    village.id,
    building.slotId,
    buildingType
  );
};

export default updateBuildingList;
