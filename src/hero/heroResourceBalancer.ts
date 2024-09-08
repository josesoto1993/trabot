import { Page } from "puppeteer";
import Resources from "../models/resources";
import {
  getVillages,
  updateVillagesOverviewInfo,
} from "../player/playerHandler";
import { CLICK_DELAY, goPage } from "../browser/browserService";
import { TaskResult } from "../index";
import Links from "../constants/links";

const HERO_PRODUCTION_IGNORE_CROP =
  process.env.HERO_PRODUCTION_IGNORE_CROP === "true";
let lastHeroResourceTime: number = 0;

const balanceHeroResources = async (
  page: Page,
  interval: number
): Promise<TaskResult> => {
  const skip = shouldSkip(interval);
  if (skip) {
    return skip;
  }

  const lowerResourceName = await getLowerResource(
    page,
    HERO_PRODUCTION_IGNORE_CROP
  );
  await selectHeroProduction(page, lowerResourceName);

  updateNextHeroResourceTime();

  return { nextExecutionTime: getNextExecutionTime(interval), skip: false };
};

const shouldSkip = (interval: number): TaskResult | null => {
  const nextExecutionTime = getNextExecutionTime(interval);

  return nextExecutionTime > Date.now()
    ? { nextExecutionTime, skip: true }
    : null;
};

const getNextExecutionTime = (interval: number): number => {
  return interval + lastHeroResourceTime;
};

const updateNextHeroResourceTime = (): void => {
  lastHeroResourceTime = Date.now();
};

const selectHeroProduction = async (
  page: Page,
  resourceName: string
): Promise<void> => {
  const resourceClassSuffix = resourceName + "_small";
  const buttonSelector = `.resource.${resourceClassSuffix} button`;

  await goPage(Links.TRAVIAN_HERO_ATTRIBUTES);
  await page.waitForSelector(buttonSelector);
  await page.click(buttonSelector);
  await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));

  console.log(`Clicked on the ${resourceName} production button.`);
};

const getLowerResource = async (
  page: Page,
  ignoreCrop: boolean
): Promise<string> => {
  const actualResources = await getActualResources(page);
  const resourceEntries = Object.entries(actualResources) as [string, number][];

  const filteredResources = ignoreCrop
    ? resourceEntries.filter(([key, _]) => key !== "crop")
    : resourceEntries;

  const [minResourceKey, _] = filteredResources.reduce(
    (minResource, currentResource) =>
      currentResource[1] < minResource[1] ? currentResource : minResource,
    filteredResources[0]
  );

  return minResourceKey;
};

const getActualResources = async (page: Page): Promise<Resources> => {
  await updateVillagesOverviewInfo(page);
  const villages = getVillages();
  return villages
    .map((villa) => villa.getFutureResources())
    .reduce(
      (acum: Resources, actual: Resources) => Resources.add(acum, actual),
      new Resources(0, 0, 0, 0)
    );
};

export default balanceHeroResources;
