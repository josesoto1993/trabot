const getVillagesDetailedInfo = require("../village/listVillageDetailed");
const sendResources = require("./sendResources");
const Resources = require("../models/resources");
const Trade = require("../models/trade");

const MERCHANTS_CAPACITY = process.env.MERCHANTS_CAPACITY;
const DEFICIT_THRESHOLD = 0.4;
const DEFICIT_MAX_VALUE = 35000;
const REQUEST_THRESHOLD = 0.6;
const DONOR_SAFE_LEVEL = 0.5;
const DONOR_SAFE_VALUE = 40000;
const ROUNDING_SAFETY_FACTOR = 0.999;
const DEFICIT_INTERVAL = 3 * 60;

let lastDeficitTime = 0;

const manageDeficit = async (page) => {
  const remainingTime = getRemainingTime();
  if (remainingTime > 0) {
    return remainingTime;
  }
  console.log(
    "Enough time has passed since the last deficit check, let's check again"
  );

  await checkVillagesDeficit(page);
  updateNextDeficitTime();

  console.log("Manage Deficit finished");
  return DEFICIT_INTERVAL;
};

const getRemainingTime = () => {
  const currentTime = Date.now();
  const timePassed = (currentTime - lastDeficitTime) / 1000;
  return DEFICIT_INTERVAL - timePassed;
};

const updateNextDeficitTime = () => {
  lastDeficitTime = Date.now();
};

const checkVillagesDeficit = async (page) => {
  try {
    const villages = await getVillagesDetailedInfo(page);

    for (const village of villages) {
      await checkVillageDeficit(page, village, villages);
    }
  } catch (error) {
    console.error("Error during check deficit:", error);
  }
};

const checkVillageDeficit = async (page, village, villages) => {
  const actualVillageResources = Resources.add(
    village.resources,
    village.ongoingResources
  );
  const deficitResources = getDeficitResources(
    actualVillageResources,
    village.capacity
  );

  if (deficitResources.getTotal() > 0) {
    await handleDeficitResources(page, villages, village, deficitResources);
  } else {
    console.log(`Village ${village.name} does not need resources`);
  }
};

const getDeficitResources = (resources, capacity) => {
  const deficitResources = new Resources(0, 0, 0, 0);

  Resources.getKeys().forEach((resourceType) => {
    const actual = resources[resourceType];
    const maxCapacity = capacity[resourceType];
    const thresholdValue = Math.min(
      maxCapacity * DEFICIT_THRESHOLD,
      DEFICIT_MAX_VALUE
    );

    if (actual < thresholdValue) {
      deficitResources[resourceType] = maxCapacity * REQUEST_THRESHOLD - actual;
    }
  });

  return deficitResources;
};

const handleDeficitResources = async (
  page,
  villages,
  village,
  deficitResources
) => {
  console.log(`Village ${village.name} needs resources ${deficitResources}`);

  const donorVillage = findDonorVillage(villages, deficitResources);
  if (donorVillage) {
    console.log(
      `Village ${village.name} needs to request ${deficitResources} from village ${donorVillage.name}`
    );
    await requestResources(page, donorVillage, village, deficitResources);
    updateVillageResources(donorVillage, village, deficitResources);
  } else {
    console.log("ERROR!! CANNOT FULFILL DEFICIT", deficitResources);
  }
};

const limitResourcesToMarket = (village, deficitResources) => {
  const maxCargo = village.availableMerchants * MERCHANTS_CAPACITY;
  const totalDeficit = deficitResources.getTotal();

  if (totalDeficit <= maxCargo) {
    return deficitResources;
  }

  const factor = (maxCargo / totalDeficit) * ROUNDING_SAFETY_FACTOR;
  const realCargoToRequest = Resources.factor(deficitResources, factor);
  console.log(
    `Deficit ${totalDeficit} exceeds max cargo ${maxCargo}, scale to request ${realCargoToRequest}`
  );
  return realCargoToRequest;
};

const findDonorVillage = (villages, resourcesToRequest) => {
  for (const village of villages) {
    const actualVillageResources = Resources.add(
      village.resources,
      village.ongoingResources
    );
    if (
      canDonateResources(
        actualVillageResources,
        village.capacity,
        resourcesToRequest
      )
    ) {
      return village;
    }
  }
  return null;
};

const canDonateResources = (resources, capacity, resourcesToDonate) => {
  return Resources.getKeys().every((resourceType) => {
    const resourceAfterDonation =
      resources[resourceType] - resourcesToDonate[resourceType];
    const keepOnStorage = Math.min(
      capacity[resourceType] * DONOR_SAFE_LEVEL,
      DONOR_SAFE_VALUE
    );

    return resourceAfterDonation >= keepOnStorage;
  });
};

const requestResources = async (page, fromVillage, toVillage, resources) => {
  const resourcesToRequest = limitResourcesToMarket(fromVillage, resources);
  const trade = new Trade(fromVillage, toVillage, resourcesToRequest);
  await sendResources(page, trade);
};

const updateVillageResources = (fromVillage, toVillage, resources) => {
  fromVillage.resources = Resources.subtract(fromVillage.resources, resources);
  toVillage.resources = Resources.add(toVillage.resources, resources);
};

module.exports = manageDeficit;
