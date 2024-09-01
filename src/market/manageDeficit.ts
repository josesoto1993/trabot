import { Page } from "puppeteer";
import Resources from "../models/resources";
import Trade from "../models/trade";
import { formatTime } from "../utils/timePrint";
import {
  getVillages,
  updateVillagesOverviewInfo,
} from "../player/playerHandler";
import sendResources from "./sendResources";
import Village from "../models/village";
import { TaskResult } from "../index";

const DEFICIT_INTERVAL = 3 * 60;

let lastDeficitTime = 0;

const manageDeficit = async (page: Page): Promise<TaskResult> => {
  const remainingTime = getRemainingTime();
  if (remainingTime > 0) {
    return { nextExecutionTime: remainingTime, skip: true };
  }
  console.log(
    "Enough time has passed since the last deficit check, let's check again"
  );

  await checkVillagesDeficit(page);
  updateNextDeficitTime();

  console.log(
    `Manage Deficit finished. Next in ${formatTime(DEFICIT_INTERVAL)}`
  );
  return { nextExecutionTime: DEFICIT_INTERVAL, skip: false };
};

const getRemainingTime = (): number => {
  const currentTime = Date.now();
  const timePassed = (currentTime - lastDeficitTime) / 1000;
  return DEFICIT_INTERVAL - timePassed;
};

const updateNextDeficitTime = (): void => {
  lastDeficitTime = Date.now();
};

const checkVillagesDeficit = async (page: Page): Promise<void> => {
  try {
    await updateVillagesOverviewInfo(page);
    const villages = getVillages();

    for (const village of villages) {
      if (village.skipDeficit) {
        console.log(`Skip ${village.name} deficit check`);
        continue;
      }

      await checkVillageDeficit(page, village, villages);
    }
  } catch (error) {
    console.error("Error during check deficit:", error);
  }
};

const checkVillageDeficit = async (
  page: Page,
  village: Village,
  villages: Village[]
): Promise<void> => {
  const deficitResources = village.getDeficitResources();

  if (deficitResources.getTotal() > MERCHANTS_CAPACITY) {
    await handleDeficitResources(page, villages, village, deficitResources);
  } else {
    console.log(`Village ${village.name} does not need resources`);
  }
};

const handleDeficitResources = async (
  page: Page,
  villages: Village[],
  village: Village,
  deficitResources: Resources
): Promise<void> => {
  console.log(`Village ${village.name} needs resources ${deficitResources}`);

  const [donorVillage, resourcesToSend] = findDonorVillageAndRes(
    villages,
    deficitResources
  );

  if (donorVillage) {
    console.log(
      `Village ${village.name} needs to request ${resourcesToSend} from village ${donorVillage.name}`
    );
    const realResources = await requestResources(
      page,
      donorVillage,
      village,
      resourcesToSend
    );
    updateVillageResources(donorVillage, village, realResources);
  } else {
    console.log(`No one can send resources to ${village.name}`);
  }
};

const findDonorVillageAndRes = (
  villages: Village[],
  resourcesToRequest: Resources
): [Village | null, Resources | null] => {
  const potentialDonors: { village: Village; res: Resources }[] = [];

  for (const donorVillage of villages) {
    const possibleDonation = calculatePossibleDonationForDeficit(
      donorVillage,
      resourcesToRequest
    );

    if (possibleDonation.getTotal() > 0) {
      potentialDonors.push({
        village: donorVillage,
        res: possibleDonation,
      });
    }
  }

  if (potentialDonors.length === 0) {
    return [null, null];
  }

  potentialDonors.sort((a, b) => b.res.getTotal() - a.res.getTotal());

  return [potentialDonors[0].village, potentialDonors[0].res];
};

const calculatePossibleDonationForDeficit = (
  donorVillage: Village,
  resourcesToRequest: Resources
): Resources => {
  const possibleDonation = new Resources(0, 0, 0, 0);
  const maxSendResources = donorVillage.getMaxSendResources();

  Resources.getKeys().forEach((resourceType) => {
    possibleDonation[resourceType] = Math.min(
      resourcesToRequest[resourceType],
      maxSendResources[resourceType]
    );

    if (possibleDonation[resourceType] < 0) {
      possibleDonation[resourceType] = 0;
    }
  });

  return possibleDonation;
};

const requestResources = async (
  page: Page,
  fromVillage: Village,
  toVillage: Village,
  resources: Resources
): Promise<Resources> => {
  const trade = new Trade(fromVillage, toVillage, resources);
  return await sendResources(page, trade);
};

const updateVillageResources = (
  fromVillage: Village,
  toVillage: Village,
  resources: Resources
): void => {
  fromVillage.resources = Resources.subtract(fromVillage.resources, resources);
  toVillage.resources = Resources.add(toVillage.resources, resources);
};

export default manageDeficit;
