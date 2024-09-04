import { URL } from "url";
import { Page } from "puppeteer";
import { goPage, CLICK_DELAY } from "../browser/browserService";
import Link from "../constants/links";
import {
  updatePlayerBuilding,
  updatePlayerVillageBuildFinishAt,
} from "../player/playerHandler";
import { getBuildingType } from "../services/buildingTypeService";

interface BuildResult {
  time: number | null;
  error: string | null;
}

const createBuilding = async (
  page: Page,
  villageId: string,
  slotId: number,
  buildingName: string
): Promise<number | null> => {
  const buildingType = await getBuildingType(buildingName);
  if (!buildingType) {
    throw new Error(`Building name ${buildingName} not found in BuildingType`);
  }

  await selectSlot(villageId, slotId, buildingType.category.value);

  const result = await buildSelectedBuilding(page, buildingType.name);
  await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));

  if (result.error) {
    console.error("Error in creating building:", result.error);
    return null;
  }

  updatePlayerBuilding(villageId, slotId, buildingType, 1);
  updatePlayerVillageBuildFinishAt(villageId, result.time);
  return result.time;
};

const selectSlot = async (
  villageId: string,
  slotId: number,
  categoryValue: number
): Promise<void> => {
  const villageUrl = new URL(Link.TRAVIAN_BUILD_VIEW);
  villageUrl.searchParams.append("newdid", villageId);
  villageUrl.searchParams.append("id", slotId.toString());
  villageUrl.searchParams.append("category", categoryValue.toString());
  await goPage(villageUrl);

  console.log(`selectSlot: ${villageId} / ${slotId} / ${categoryValue}`);
};

const buildSelectedBuilding = async (
  page: Page,
  buildingName: string
): Promise<BuildResult> => {
  return await page.evaluate((buildingName: string) => {
    const buildDiv = document.getElementById("build");
    if (!buildDiv) {
      return { time: null, error: "ERROR!! div#build not found" };
    }

    const validBuildingWrappers = Array.from(buildDiv.children).filter(
      (element) => element.classList.contains("buildingWrapper")
    );

    const selectedBuilding = validBuildingWrappers.find((wrapper) => {
      const h2Element = wrapper.querySelector("h2");
      return (
        h2Element &&
        h2Element.innerText.trim().toLowerCase() === buildingName.toLowerCase()
      );
    });

    if (!selectedBuilding) {
      return {
        time: null,
        error: `ERROR!! Building name ${buildingName} does not exist`,
      };
    }

    const contractWrapper = selectedBuilding.querySelector(".contractWrapper");
    if (!contractWrapper) {
      return { time: null, error: "ERROR!! Contract wrapper not found" };
    }

    const durationElement = contractWrapper.querySelector(
      ".lineWrapper .duration span"
    );
    if (!durationElement) {
      return { time: null, error: "ERROR!! Duration element not found" };
    }

    const durationText = durationElement.textContent.trim();
    const [hours, minutes, seconds] = durationText.split(":").map(Number);
    const durationValue = hours * 3600 + minutes * 60 + seconds;

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const contractLink = contractWrapper.querySelector(
      ".contractLink button:is(.build, .new)"
    ) as HTMLButtonElement;

    if (contractLink) {
      contractLink.click();
    } else {
      return { time: null, error: "ERROR!! Contract link button not found" };
    }

    return { time: durationValue, error: null };
  }, buildingName);
};

export default createBuilding;
