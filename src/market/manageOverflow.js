const getVillagesDetailedInfo = require("../village/listVillageDetailed");
const { sendResources, getMaxCargo } = require("./sendResources");
const { formatTime } = require("../utils/timePrintService");
const Resources = require("../models/resources");
const Trade = require("../models/trade");

const RESOURCE_THRESHOLD = 0.8;
const RECEIVER_THRESHOLD = 0.7;
const SAFE_LEVEL = 0.6;
const ROUNDING_SAFETY_FACTOR = 0.999;
const OVERFLOW_INTERVAL = 9 * 60;

let lastOverflowTime = 0;

const manageOverflow = async (page) => {
  const remainingTime = getRemainingTime();
  if (remainingTime > 0) {
    return remainingTime;
  }
  console.log(
    "Enough time has passed since the last overflow check, let's check again."
  );

  await checkVillagesOverflow(page);
  updateNextOverflowTime();

  console.log(
    `Manage Overflow finished. Next in ${formatTime(OVERFLOW_INTERVAL)}`
  );
  return OVERFLOW_INTERVAL;
};

const getRemainingTime = () => {
  const currentTime = Date.now();
  const timePassed = (currentTime - lastOverflowTime) / 1000;
  return OVERFLOW_INTERVAL - timePassed;
};

const updateNextOverflowTime = () => {
  lastOverflowTime = Date.now();
};

const checkVillagesOverflow = async (page) => {
  const villages = await getVillagesDetailedInfo(page);

  for (const village of villages) {
    const actualVillageResources = Resources.add(
      village.resources,
      village.ongoingResources
    );
    const excessResources = getOverflowResources(
      actualVillageResources,
      village.capacity
    );

    if (excessResources.getTotal() > 0) {
      await handleOverflowResources(page, villages, village, excessResources);
    } else {
      console.log(
        `Village ${village.name} does not need to balance resources.`
      );
    }
  }
};

const getOverflowResources = (resources, capacity) => {
  const overflowResources = new Resources(0, 0, 0, 0);

  Resources.getKeys().forEach((resourceType) => {
    const actual = resources[resourceType];
    const maxCapacity = capacity[resourceType];

    if (actual > maxCapacity * RESOURCE_THRESHOLD) {
      overflowResources[resourceType] = actual - maxCapacity * SAFE_LEVEL;
    }
  });

  return overflowResources;
};

const handleOverflowResources = async (
  page,
  villages,
  village,
  excessResources
) => {
  console.log(
    `Village ${village.name} needs to send overflow resources ${excessResources}.`
  );
  const resourcesToSend = await limitResourcesToMarket(
    page,
    village,
    excessResources
  );

  const targetVillage = findReceivingVillage(villages, resourcesToSend);
  if (targetVillage) {
    console.log(
      `Village ${village.name} will send ${resourcesToSend} to village ${targetVillage.name}.`
    );
    await sendExcessResources(page, village, targetVillage, resourcesToSend);
    updateVillageResources(village, targetVillage, resourcesToSend);
  } else {
    console.log("ERROR!! Cannot handle excess resources:", resourcesToSend);
  }
};

const limitResourcesToMarket = async (page, village, excessResources) => {
  const maxCargo = await getMaxCargo(page, village);
  const totalExcess = excessResources.getTotal();

  if (totalExcess <= maxCargo) {
    return excessResources;
  }

  const factor = (maxCargo / totalExcess) * ROUNDING_SAFETY_FACTOR;
  const realCargoToSend = Resources.factor(excessResources, factor);
  console.log(
    `Cargo ${totalExcess} exceeds max cargo ${maxCargo}, scaling to send ${realCargoToSend}.`
  );
  return realCargoToSend;
};

const findReceivingVillage = (villages, resourcesToSend) => {
  for (const village of villages) {
    const actualVillageResources = Resources.add(
      village.resources,
      village.ongoingResources
    );
    if (
      canReceiveResources(
        actualVillageResources,
        village.capacity,
        resourcesToSend
      )
    ) {
      return village;
    }
  }
  return null;
};

const canReceiveResources = (resources, capacity, resourcesToReceive) => {
  return Resources.getKeys().every((resourceType) => {
    const actual = resources[resourceType];
    const maxCapacity = capacity[resourceType];
    const excess = resourcesToReceive[resourceType];

    return actual + excess <= maxCapacity * RECEIVER_THRESHOLD;
  });
};

const sendExcessResources = async (page, fromVillage, toVillage, resources) => {
  const trade = new Trade(fromVillage, toVillage, resources);
  await sendResources(page, trade);
};

const updateVillageResources = (fromVillage, toVillage, resources) => {
  fromVillage.resources = Resources.subtract(fromVillage.resources, resources);
  toVillage.resources = Resources.add(toVillage.resources, resources);
};

module.exports = manageOverflow;
