const { URL } = require("url");
const { getVillagesInfo } = require("../village/listVillageIdsService");
const { goPage } = require("../browser/browserService");
const {
  TRAVIAN_RESOURCES_VIEW,
  TRAVIAN_BUILD_VIEW,
} = require("../constants/links");
const ConstructionStatus = require("../constants/constructionStatus");
const getResourceFieldsData = require("./resourceFieldsData");

let upgradeResourceCount = 0;

const upgradeSelectedResourceField = async (page) => {
  await page.waitForSelector(".upgradeButtonsContainer .section1 .build");

  const buildButton = await page.$(".upgradeButtonsContainer .section1 .build");
  if (!buildButton) {
    console.log("No build button found.");
    return false;
  }

  await buildButton.click();
  console.log("Clicked on the build button.");
  return true;
};

const buildResources = async (page) => {
  try {
    const villages = await getVillagesInfo(page);

    let upgrades = 0;
    for (const village of villages) {
      const someUpgrade = await upgradeResourceFieldInVillage(page, village);
      if (someUpgrade) {
        upgrades = upgrades + 1;
      }
    }

    if (upgrades > 0) {
      console.log(`Upgrades done this time: ${upgrades}`);
      console.log(`Total upgrades done: ${upgradeResourceCount}`);
    } else {
      console.log("Nothing to update");
    }
  } catch (error) {
    console.error("Error in buildResources:", error);
  }
};

const upgradeResourceFieldInVillage = async (page, village) => {
  const villageUrl = new URL(TRAVIAN_RESOURCES_VIEW);
  villageUrl.searchParams.append("newdid", village.id);

  await goPage(villageUrl.toString());
  console.log(`Navigated to village: ${village.name}`);

  const someUpgrade = await upgradeResourceField(page);
  if (someUpgrade) {
    upgradeResourceCount = upgradeResourceCount + 1;
  }

  return someUpgrade;
};

const upgradeResourceField = async (page) => {
  try {
    const anyToUpgrade = await selectResourceFieldToUpgrade(page);
    if (!anyToUpgrade) {
      return false;
    }

    return await upgradeSelectedResourceField(page);
  } catch (error) {
    console.error("Error upgrading resource field:", error);
    return false;
  }
};

const selectResourceFieldToUpgrade = async (page) => {
  const possibleResourcesToUpgrade = await getPossibleResourcesToUpgrade(page);

  if (possibleResourcesToUpgrade.length === 0) {
    console.log("No resource fields ready for upgrade found.");
    return false;
  }

  await selectResourceToUpgrade(possibleResourcesToUpgrade);
  return true;
};

const getPossibleResourcesToUpgrade = async (page) => {
  const resourceFields = await getResourceFieldsData(page);

  const possibleResourcesToUpgrade = resourceFields.filter(
    (field) =>
      field.constructionStatus === ConstructionStatus.readyToUpgrade &&
      field.level <= 10
  );
  possibleResourcesToUpgrade.sort((a, b) => b.level - a.level);

  return possibleResourcesToUpgrade;
};

const selectResourceToUpgrade = async (possibleResourcesToUpgrade) => {
  const selectedField = possibleResourcesToUpgrade[0];

  const villageUrl = new URL(TRAVIAN_BUILD_VIEW);
  villageUrl.searchParams.append("id", selectedField.id);
  await goPage(villageUrl.toString());

  console.log(`Clicked on a resource field to level: ${selectedField.id}`);
};

module.exports = buildResources;
