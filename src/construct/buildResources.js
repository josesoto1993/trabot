const { URL } = require("url");
const { getVillagesInfo } = require("../village/listVillageIdsService");
const { goPage } = require("../browser/browserService");
const { TRAVIAN_RESOURCES_VIEW } = require("../constants/links");
const ConstructionStatus = require("../constants/constructionStatus");

let upgradeResourceCount = 0;

const selectResourceFieldToUpgrade = async (page) => {
  await page.waitForSelector("#resourceFieldContainer");

  const resourceFieldLink = await page.$(
    `#resourceFieldContainer a.${ConstructionStatus.readyToUpgrade}`
  );
  if (!resourceFieldLink) {
    console.log("No resource fields to level found.");
    return false;
  }

  await resourceFieldLink.click();
  console.log("Clicked on a resource field to level.");
  return true;
};

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

module.exports = {
  buildResources,
};
