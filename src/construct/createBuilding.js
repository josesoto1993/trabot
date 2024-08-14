const { URL } = require("url");
const { goPage, CLICK_DELAY } = require("../browser/browserService");
const { TRAVIAN_BUILD_VIEW } = require("../constants/links");
const {
  updatePlayerBuilding,
  updatePlayerVillageBuildFinishAt,
} = require("../player/playerHandler");
const BuildingType = require("../constants/buildingTypes");
const BuildingCategory = require("../constants/buildingCategory");

const createBuilding = async (page, villageId, slotId, buildingName) => {
  const buildingType = BuildingType[buildingName];
  if (!buildingType) {
    throw new Error(`buildingName ${buildingName} not in BuildingType`);
  }

  const realSlotId =
    buildingType.category !== BuildingCategory.other
      ? slotId
      : buildingType.slot;
  await selectSlot(villageId, realSlotId, buildingType.category);

  const result = await buildSelectedBuilding(page, buildingType.name);
  await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
  if (result.error) {
    console.log("Error on create building:", result.error);
    return null;
  }

  updatePlayerBuilding(villageId, realSlotId, buildingType, 1);
  updatePlayerVillageBuildFinishAt(villageId, result.time);
  return result.time;
};

const selectSlot = async (villageId, slotId, category) => {
  const villageUrl = new URL(TRAVIAN_BUILD_VIEW);
  villageUrl.searchParams.append("newdid", villageId);
  villageUrl.searchParams.append("id", slotId);
  villageUrl.searchParams.append("category", category);
  await goPage(villageUrl);

  console.log(`selectSlot: ${villageId} / ${slotId} / ${category}`);
};

const buildSelectedBuilding = async (page, buildingName) => {
  return await page.evaluate((buildingName) => {
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

    const contractLink = contractWrapper.querySelector(
      ".contractLink button:is(.build, .new)"
    );

    if (contractLink) {
      contractLink.click();
    } else {
      return { time: null, error: "ERROR!! Contract link button not found" };
    }

    return { time: durationValue, error: null };
  }, buildingName);
};

module.exports = createBuilding;
