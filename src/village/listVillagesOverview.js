const { goPage } = require("../browser/browserService");
const getVillagesInfo = require("./listVillagesSimple");
const { getIncomingResources } = require("../market/ongoingTrades");

const OverviewTabs = require("../constants/overviewTabs");
const Resources = require("../models/resources");

const ROW_SELECTOR = "#content table tbody tr";
const CONSUMPTION_TABLE_SELECTOR = "#content div.troops_wrapper table";

const resourceSelectors = {
  lumber: "td.lum",
  clay: "td.clay",
  iron: "td.iron",
  crop: "td.crop",
};

const capacitySelectors = {
  lumber: "td.max123",
  clay: "td.max123",
  iron: "td.max123",
  crop: "td.max4",
};

const getVillagesOverviewInfo = async (page) => {
  try {
    const merchantsTable = await getOverviewMerchants(page);
    const resourcesTable = await getOverviewResources(
      page,
      OverviewTabs.resResources,
      resourceSelectors
    );
    const productionTable = await getOverviewResources(
      page,
      OverviewTabs.resProduction,
      resourceSelectors
    );
    const capacityTable = await getOverviewResources(
      page,
      OverviewTabs.resCapacity,
      capacitySelectors
    );
    const cultureTable = await getOverviewCelebrations(page);
    const consumptionTable = await getOverviewConsumption(page);

    const villages = await getVillagesInfo(page);

    for (const village of villages) {
      village.resources = resourcesTable[village.name];
      village.production = productionTable[village.name];
      village.capacity = capacityTable[village.name];
      village.ongoingResources = getIncomingResources(village.name);
      village.availableMerchants =
        merchantsTable[village.name].availableMerchants;
      village.maxMerchants = merchantsTable[village.name].maxMerchants;
      village.celebrationTime = cultureTable[village.name].celebrationTime;
      village.consumption = consumptionTable[village.name];
    }

    return villages;
  } catch (error) {
    console.error("Error getting villages info:", error);
    throw error;
  }
};

const getOverviewMerchants = async (page) => {
  await goPage(OverviewTabs.overview);
  await page.waitForSelector(ROW_SELECTOR);

  const merchantsRaw = await page.evaluate((rowSelector) => {
    const rows = document.querySelectorAll(rowSelector);

    const result = {};
    rows.forEach((row) => {
      const villageLink = row.querySelector("td.vil a");
      if (!villageLink) {
        return;
      }

      const villageName = villageLink.textContent.trim();
      if (!result[villageName]) {
        result[villageName] = {};
      }

      const merchantElement = row.querySelector("td.tra.lc a");
      if (merchantElement) {
        console.log(
          "village find merchantElement.textContent: ",
          merchantElement.textContent
        );
        console.log(
          "village find merchantElement.textContent.trim(): ",
          merchantElement.textContent.trim()
        );
        const availableText = merchantElement.textContent
          .trim()
          .replace(/[^\d\/]/g, "");
        console.log("village find availableText: ", availableText);
        const [available, max] = availableText.split("/").map(Number);
        console.log("village find available: ", available);
        console.log("village find max: ", max);
        result[villageName].availableMerchants = available ? available : 0;
        result[villageName].maxMerchants = max ? max : 0;
      }
    });
    return result;
  }, ROW_SELECTOR);

  return merchantsRaw;
};

const getOverviewCelebrations = async (page) => {
  await goPage(OverviewTabs.culturepoints);
  await page.waitForSelector(ROW_SELECTOR);

  const celebrationsRaw = await page.evaluate((rowSelector) => {
    const rows = document.querySelectorAll(rowSelector);

    const result = {};
    rows.forEach((row) => {
      const villageLink = row.querySelector("td.vil a");
      if (!villageLink) {
        return;
      }

      const villageName = villageLink.textContent.trim();
      if (!result[villageName]) {
        result[villageName] = {};
      }

      const celebrationElement = row.querySelector("td.cel a span");
      let value = null;
      if (celebrationElement) {
        if (celebrationElement.classList.contains("timer")) {
          const durationText = celebrationElement.textContent.trim();
          const [hours, minutes, seconds] = durationText.split(":").map(Number);
          value = hours * 3600 + minutes * 60 + seconds;
        } else if (celebrationElement.classList.contains("dot")) {
          value = 0;
        }
      }

      result[villageName].celebrationTime = value;
    });
    return result;
  }, ROW_SELECTOR);

  return celebrationsRaw;
};
0;

const getOverviewConsumption = async (page) => {
  await goPage(OverviewTabs.troopsInVillages);
  await page.waitForSelector(CONSUMPTION_TABLE_SELECTOR);

  const consumptionRaw = await page.evaluate((rowSelector) => {
    const rows = document.querySelectorAll(rowSelector);

    let errorCount = 0;
    const result = {};
    rows.forEach((row) => {
      const villageNameElement = row.querySelector("thead tr th");
      if (!villageNameElement) {
        result[errorCount] = "no villageNameElement";
        return;
      }

      const villageName = villageNameElement
        ? villageNameElement.textContent.trim()
        : null;

      if (!villageName) {
        result[errorCount] = "no villageName";
        return;
      }

      const upkeepBody = row.querySelector("tbody.upkeep");
      if (!upkeepBody) {
        result[villageName] = "no upkeepBody";
        return;
      }

      const consumptionRow = upkeepBody.querySelector("tr");
      const spanElements = consumptionRow.querySelectorAll(
        "td div.consumption span"
      );
      if (!spanElements) {
        result[villageName] = "no spanElements";
        return;
      }

      const consumption = Array.from(spanElements).reduce((sum, span) => {
        const value = parseInt(
          span.textContent.trim().replace(/[^0-9]/g, ""),
          10
        );
        return sum + (isNaN(value) ? 0 : value);
      }, 0);

      result[villageName] = consumption;
    });
    return result;
  }, CONSUMPTION_TABLE_SELECTOR);

  return consumptionRaw;
};

const getOverviewResources = async (page, tableUrl, selectors) => {
  await goPage(tableUrl);
  await page.waitForSelector(ROW_SELECTOR);

  const resourcesRaw = await page.evaluate(
    (selectors, rowSelector) => {
      const rows = document.querySelectorAll(rowSelector);
      const cleanNumber = (element) =>
        parseInt(element.textContent.trim().replace(/[^\d]/g, ""), 10);

      const result = {};
      rows.forEach((row) => {
        const villageLink = row.querySelector("td.vil a");
        if (!villageLink) {
          return;
        }

        const villageName = villageLink.textContent.trim();
        if (!result[villageName]) {
          result[villageName] = {};
        }

        for (const [key, selector] of Object.entries(selectors)) {
          const element = row.querySelector(selector);
          result[villageName][key] = cleanNumber(element);
        }
      });
      return result;
    },
    selectors,
    ROW_SELECTOR
  );

  return rawToResourceObject(resourcesRaw);
};

const rawToResourceObject = (resourcesRaw) => {
  const resourcesByVillage = {};
  for (const [villageName, resourceData] of Object.entries(resourcesRaw)) {
    resourcesByVillage[villageName] = new Resources(
      resourceData.lumber,
      resourceData.clay,
      resourceData.iron,
      resourceData.crop
    );
  }
  return resourcesByVillage;
};

module.exports = getVillagesOverviewInfo;
