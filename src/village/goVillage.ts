import { goPage } from "../browser/browserService";
import Links from "../constants/links";
import Village from "../models/village";

export const goVillageResView = async (village: Village): Promise<void> => {
  const villageUrl = new URL(Links.TRAVIAN_RESOURCES_VIEW);
  villageUrl.searchParams.append("newdid", village.id);

  await goPage(villageUrl);
  console.log(`Navigated to village resources view: ${village.name}`);
};

export const goVillageBuildingView = async (
  village: Village
): Promise<void> => {
  const villageUrl = new URL(Links.TRAVIAN_BUILDING_VIEW);
  villageUrl.searchParams.append("newdid", village.id);

  await goPage(villageUrl);
  console.log(`Navigated to village building view: ${village.name}`);
};

export const goBuilding = async (
  village: Village,
  buildingName: string,
  searchParams: Record<
    string,
    string | number | boolean | null | undefined
  > = {}
): Promise<void> => {
  const villageBuilding = village.buildings.find(
    (building) => building.name === buildingName
  );

  if (!villageBuilding) {
    throw new Error(
      `Building with name "${buildingName}" not found in village "${village.name}"`
    );
  }

  const buildingUrl = new URL(Links.TRAVIAN_BUILD_VIEW);
  buildingUrl.searchParams.append("newdid", village.id);
  buildingUrl.searchParams.append("id", villageBuilding.slotId.toString());
  buildingUrl.searchParams.append(
    "gid",
    villageBuilding.structureId.toString()
  );

  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== null && value !== undefined) {
      buildingUrl.searchParams.append(key, String(value));
    }
  }

  await goPage(buildingUrl);
};
