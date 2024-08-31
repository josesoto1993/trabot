const { goPage } = require("../browser/browserService");
import {
  TRAVIAN_RESOURCES_VIEW,
  TRAVIAN_BUILDING_VIEW,
  TRAVIAN_BUILD_VIEW,
} from "../constants/links";

const goVillageResView = async (village) => {
  const villageUrl = new URL(TRAVIAN_RESOURCES_VIEW);
  villageUrl.searchParams.append("newdid", village.id);

  await goPage(villageUrl);
  console.log(`Navigated to village resources view: ${village.name}`);
};

const goVillageBuildingView = async (village) => {
  const villageUrl = new URL(TRAVIAN_BUILDING_VIEW);
  villageUrl.searchParams.append("newdid", village.id);

  await goPage(villageUrl);
  console.log(`Navigated to village building view: ${village.name}`);
};

const goBuilding = async (village, buildingName, searchParams = {}) => {
  const villageBuilding = village.buildings.find(
    (building) => building.name === buildingName
  );

  if (!villageBuilding) {
    throw new Error(
      `Building with name "${buildingName}" not found in village "${village.name}"`
    );
  }

  const buildingUrl = new URL(TRAVIAN_BUILD_VIEW);
  buildingUrl.searchParams.append("newdid", village.id);
  buildingUrl.searchParams.append("id", villageBuilding.slotId);
  buildingUrl.searchParams.append("gid", villageBuilding.structureId);

  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== null && value !== undefined) {
      buildingUrl.searchParams.append(key, value);
    }
  }

  await goPage(buildingUrl);
};

module.exports = { goVillageResView, goVillageBuildingView, goBuilding };
