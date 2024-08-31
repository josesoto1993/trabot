import { Page } from "puppeteer";
import { goPage } from "../browser/browserService";
import { getVillagesInfo } from "./listVillagesSimple";
import { getIncomingResources } from "../market/ongoingTrades";
import { OverviewTabs } from "../constants/overviewTabs";
import Resources from "../models/resources";
import Village from "../models/village";

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

const getVillagesOverviewInfo = async (page: Page): Promise<Village[]> => {
  try {
    const merchantsTable = await getOverviewMerchants(page);
    const resourcesTable = await getOverviewResources(
      page,
      OverviewTabs.RESOURCES_RESOURCES,
      resourceSelectors
    );
    const productionTable = await getOverviewResources(
      page,
      OverviewTabs.RESOURCES_PRODUCTION,
      resourceSelectors
    );
    const capacityTable = await getOverviewResources(
      page,
      OverviewTabs.RESOURCES_CAPACITY,
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
        merchantsTable[village.name]?.availableMerchants ?? 0;
      village.maxMerchants = merchantsTable[village.name]?.maxMerchants ?? 0;
      village.celebrationTime =
        cultureTable[village.name]?.celebrationTime ?? 0;
      village.consumption = consumptionTable[village.name] ?? 0;
    }

    return villages;
  } catch (error) {
    console.error("Error getting villages info:", error);
    throw error;
  }
};

const getOverviewMerchants = async (
  page: Page
): Promise<
  Record<string, { availableMerchants: number; maxMerchants: number }>
> => {
  await goPage(OverviewTabs.OVERVIEW);
  await page.waitForSelector(ROW_SELECTOR);

  const merchantsRaw = await page.evaluate((rowSelector: string) => {
    const rows = document.querySelectorAll(rowSelector);

    const result: Record<
      string,
      { availableMerchants: number; maxMerchants: number }
    > = {};
    rows.forEach((row) => {
      const villageLink = row.querySelector("td.vil a");
      if (!villageLink) {
        return;
      }

      const villageName = villageLink.textContent?.trim() ?? "";
      if (!result[villageName]) {
        result[villageName] = { availableMerchants: 0, maxMerchants: 0 };
      }

      const merchantElement = row.querySelector("td.tra.lc a");
      if (merchantElement) {
        const availableText =
          merchantElement.textContent?.trim().replace(/[^\d\/]/g, "") ?? "";
        const [available, max] = availableText.split("/").map(Number);
        result[villageName].availableMerchants = available || 0;
        result[villageName].maxMerchants = max || 0;
      }
    });
    return result;
  }, ROW_SELECTOR);

  return merchantsRaw;
};

const getOverviewCelebrations = async (
  page: Page
): Promise<Record<string, { celebrationTime: number }>> => {
  await goPage(OverviewTabs.CULTUREPOINTS);
  await page.waitForSelector(ROW_SELECTOR);

  const celebrationsRaw = await page.evaluate((rowSelector: string) => {
    const rows = document.querySelectorAll(rowSelector);

    const result: Record<string, { celebrationTime: number }> = {};
    rows.forEach((row) => {
      const villageLink = row.querySelector("td.vil a");
      if (!villageLink) {
        return;
      }

      const villageName = villageLink.textContent?.trim() ?? "";
      if (!result[villageName]) {
        result[villageName] = { celebrationTime: 0 };
      }

      const celebrationElement = row.querySelector("td.cel a span");
      let value: number | null = null;
      if (celebrationElement) {
        if (celebrationElement.classList.contains("timer")) {
          const durationText = celebrationElement.textContent?.trim() ?? "";
          const [hours, minutes, seconds] = durationText.split(":").map(Number);
          value = (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);
        } else if (celebrationElement.classList.contains("dot")) {
          value = 0;
        }
      }

      result[villageName].celebrationTime = value ?? 0;
    });
    return result;
  }, ROW_SELECTOR);

  return celebrationsRaw;
};

const getOverviewConsumption = async (
  page: Page
): Promise<Record<string, number>> => {
  await goPage(OverviewTabs.TROOPS_INVILLAGE);
  await page.waitForSelector(CONSUMPTION_TABLE_SELECTOR);

  const consumptionRaw = await page.evaluate((rowSelector: string) => {
    const rows = document.querySelectorAll(rowSelector);

    const result: Record<string, number> = {};
    rows.forEach((row) => {
      const villageNameElement = row.querySelector("thead tr th");
      if (!villageNameElement) {
        return;
      }

      const villageName = villageNameElement.textContent?.trim() ?? "";
      if (!villageName) {
        result[villageName] = -1;
        return;
      }

      const upkeepBody = row.querySelector("tbody.upkeep");
      if (!upkeepBody) {
        result[villageName] = -1;
        return;
      }

      const consumptionRow = upkeepBody.querySelector("tr");
      const spanElements = consumptionRow?.querySelectorAll(
        "td div.consumption span"
      );
      if (!spanElements) {
        result[villageName] = -1;
        return;
      }

      const consumption = Array.from(spanElements).reduce((sum, span) => {
        const value = parseInt(
          span.textContent?.trim().replace(/[^0-9]/g, "") ?? "0",
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

const getOverviewResources = async (
  page: Page,
  tableUrl: string,
  selectors: Record<string, string>
): Promise<Record<string, Resources>> => {
  await goPage(tableUrl);
  await page.waitForSelector(ROW_SELECTOR);

  const resourcesRaw = await page.evaluate(
    (selectors: Record<string, string>, rowSelector: string) => {
      const rows = document.querySelectorAll(rowSelector);
      const cleanNumber = (element: Element | null) =>
        parseInt(element?.textContent?.trim().replace(/[^\d]/g, "") ?? "0", 10);

      const result: Record<string, Record<string, number>> = {};
      rows.forEach((row) => {
        const villageLink = row.querySelector("td.vil a");
        if (!villageLink) {
          return;
        }

        const villageName = villageLink.textContent?.trim() ?? "";
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

const rawToResourceObject = (
  resourcesRaw: Record<string, Record<string, number>>
): Record<string, Resources> => {
  const resourcesByVillage: Record<string, Resources> = {};
  for (const [villageName, resourceData] of Object.entries(resourcesRaw)) {
    resourcesByVillage[villageName] = new Resources(
      resourceData.lumber ?? 0,
      resourceData.clay ?? 0,
      resourceData.iron ?? 0,
      resourceData.crop ?? 0
    );
  }
  return resourcesByVillage;
};

export default getVillagesOverviewInfo;
