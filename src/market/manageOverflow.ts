import { Page } from "puppeteer";
import sendResources from "./sendResources";
import Resources from "../models/resources";
import Trade from "../models/trade";
import {
  getVillages,
  updateVillagesOverviewInfo,
} from "../player/playerHandler";
import Village from "../models/village";
import { TaskResult } from "../index";

let lastOverflowTime = 0;

const manageOverflow = async (
  page: Page,
  interval: number
): Promise<TaskResult> => {
  const nextExecutionTime = getNextExecutionTime(interval);
  if (nextExecutionTime > Date.now()) {
    return { nextExecutionTime, skip: true };
  }
  console.log(
    "Enough time has passed since the last overflow check, let's check again."
  );

  await checkVillagesOverflow(page);
  updateNextOverflowTime();

  return { nextExecutionTime: getNextExecutionTime(interval), skip: false };
};

const getNextExecutionTime = (interval: number): number => {
  return lastOverflowTime + interval;
};

const updateNextOverflowTime = (): void => {
  lastOverflowTime = Date.now();
};

const checkVillagesOverflow = async (page: Page): Promise<void> => {
  try {
    await updateVillagesOverviewInfo(page);
    const villages = getVillages();

    for (const village of villages) {
      if (village.skipOverflow) {
        console.log(`Skip ${village.name} overflow check`);
        continue;
      }
      await checkVillageOverflow(page, village, villages);
    }
  } catch (error) {
    console.error("Error during check overflow:", error);
  }
};

const checkVillageOverflow = async (
  page: Page,
  village: Village,
  villages: Village[]
): Promise<void> => {
  const excessResources = village.getOverflowResources();

  if (excessResources.getTotal() > 0) {
    await handleOverflowResources(page, villages, village, excessResources);
  } else {
    console.log(`Village ${village.name} does not need to balance resources.`);
  }
};

const handleOverflowResources = async (
  page: Page,
  villages: Village[],
  village: Village,
  excessResources: Resources
): Promise<void> => {
  console.log(
    `Village ${village.name} needs to send overflow resources ${excessResources}.`
  );

  const [targetVillage, resourcesToSend] = findReceivingVillageAndRes(
    villages,
    excessResources
  );

  if (targetVillage) {
    console.log(
      `Village ${village.name} will send ${resourcesToSend} to village ${targetVillage.name}.`
    );
    const realResources = await sendExcessResources(
      page,
      village,
      targetVillage,
      resourcesToSend
    );
    updateVillageResources(village, targetVillage, realResources);
  } else {
    console.log("ERROR!! Cannot handle excess resources:", excessResources);
  }
};

const findReceivingVillageAndRes = (
  villages: Village[],
  resourcesToSend: Resources
): [Village | null, Resources | null] => {
  const potentialRecipients: { village: Village; res: Resources }[] = [];

  for (const receivingVillage of villages) {
    const possibleDonation = calculatePossibleDonation(
      receivingVillage,
      resourcesToSend
    );

    if (possibleDonation.getTotal() > 0) {
      potentialRecipients.push({
        village: receivingVillage,
        res: possibleDonation,
      });
    }
  }

  if (potentialRecipients.length === 0) {
    return [null, null];
  }

  potentialRecipients.sort((a, b) => b.res.getTotal() - a.res.getTotal());

  return [potentialRecipients[0].village, potentialRecipients[0].res];
};

const calculatePossibleDonation = (
  receiverVillage: Village,
  resourcesToReceive: Resources
): Resources => {
  const maxReceivableResources = receiverVillage.getMaxReceiveResources();

  const possibleDonation = Resources.getKeys().reduce(
    (acc, resourceType) => {
      acc[resourceType] = Math.min(
        resourcesToReceive[resourceType],
        maxReceivableResources[resourceType]
      );
      return acc;
    },
    new Resources(0, 0, 0, 0)
  );

  return possibleDonation;
};

const sendExcessResources = async (
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

export default manageOverflow;
