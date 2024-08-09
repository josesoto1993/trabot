const { URL } = require("url");
const { goPage } = require("../browser/browserService");
const { TRAVIAN_BUILD_VIEW } = require("../constants/links");
const { updatePlayerBuilding } = require("../player/playerHandler");

const createBuilding = async (page, village, slotId, buildingType) => {
  await selectSlot(village, slotId, buildingType.category);

  const result = await buildSelectedBuilding(page, buildingType.name);
  if (result.error) {
    throw new Error(result.error);
  }

  await updatePlayerBuilding(village.id, slotId, buildingType, 1);
  return result.time;
};

const selectSlot = async (village, slotId, category) => {
  const villageUrl = new URL(TRAVIAN_BUILD_VIEW);
  villageUrl.searchParams.append("newdid", village.id);
  villageUrl.searchParams.append("id", slotId);
  villageUrl.searchParams.append("category", category);
  await goPage(villageUrl);

  console.log(`selectSlot: ${village.name} / ${slotId} / ${category}`);
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

    const contractLink = contractWrapper.querySelector(".contractLink button");
    if (contractLink) {
      contractLink.click();
    } else {
      return { time: null, error: "ERROR!! Contract link button not found" };
    }

    return { time: durationValue, error: null };
  }, buildingName);
};

module.exports = createBuilding;
