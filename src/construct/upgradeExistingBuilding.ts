const { URL } = require("url");
const { goPage, CLICK_DELAY } = require("../browser/browserService");
const { TRAVIAN_BUILD_VIEW } = require("../constants/links");
const {
  updatePlayerBuilding,
  updatePlayerField,
  updatePlayerVillageBuildFinishAt,
} = require("../player/playerHandler");

const upgradeExistingBuilding = async (
  page,
  villageId,
  slotId,
  buildingType
) => {
  await selectBuilding(villageId, slotId);
  const { duration, level } = await upgradeSelectedBuilding(page);
  if (!duration) {
    return null;
  }

  updatePlayerBuilding(villageId, slotId, buildingType, level + 1);
  updatePlayerVillageBuildFinishAt(villageId, duration);
  return duration;
};

const upgradeExistingField = async (page, villageId, slotId) => {
  await selectBuilding(villageId, slotId);
  const { duration, level } = await upgradeSelectedBuilding(page);
  if (!duration) {
    return null;
  }

  updatePlayerField(villageId, slotId, level + 1);
  updatePlayerVillageBuildFinishAt(villageId, duration);
  return duration;
};

const selectBuilding = async (villageId, slotId) => {
  const villageUrl = new URL(TRAVIAN_BUILD_VIEW);
  villageUrl.searchParams.append("newdid", villageId);
  villageUrl.searchParams.append("id", slotId);
  await goPage(villageUrl);

  console.log(`Clicked on city with id ${villageId} building ${slotId}`);
};

const upgradeSelectedBuilding = async (page) => {
  const buildButton = await getBuildButton(page);
  if (!buildButton) {
    console.log("No build button found.");
    return { duration: null, level: null };
  }

  const durationValue = await getDurationValue(page);
  const oldLevel = await getLevelValue(page);

  await buildButton.click();
  await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
  console.log("Clicked on the build button.");
  return { duration: durationValue, level: oldLevel };
};

const getBuildButton = async (page) => {
  const buildSelector =
    "#build .upgradeBuilding .upgradeButtonsContainer .section1";
  const buildButtonSelector = buildSelector + " .build:not(.disabled)";

  await page.waitForSelector(buildSelector);

  const buildButton = await page.$(buildButtonSelector);
  if (buildButton) {
    const buttonText = await page.evaluate(
      (button) => button.innerText,
      buildButton
    );
    if (buttonText.includes("Upgrade to level")) {
      return buildButton;
    }
  }

  return null;
};

const getDurationValue = async (page) => {
  const buildTimerSelector =
    ".upgradeButtonsContainer .section1 .duration .value";

  await page.waitForSelector(buildTimerSelector);
  const durationValue = await page.$eval(buildTimerSelector, (span) => {
    const timeString = span.textContent.trim();
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  });
  console.log(`Upgrade duration: ${durationValue}`);
  return durationValue;
};

const getLevelValue = async (page) => {
  const contentSelector = "#content .titleInHeader .level";

  await page.waitForSelector(contentSelector);

  const levelValue = await page.$eval(contentSelector, (span) => {
    const levelText = span.textContent.trim();
    const levelNumber = parseInt(levelText.replace(/\D/g, ""), 10);
    return levelNumber;
  });

  return levelValue;
};

module.exports = { upgradeExistingBuilding, upgradeExistingField };
