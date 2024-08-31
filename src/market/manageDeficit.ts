const sendResources = require("./sendResources");
const Resources = require("../models/resources");
const Trade = require("../models/trade");
const { formatTime } = require("../utils/timePrint");
const {
  getVillages,
  updateVillagesOverviewInfo,
} = require("../player/playerHandler");

const MERCHANTS_CAPACITY = process.env.MERCHANTS_CAPACITY;
const DONOR_SAFE_LEVEL = 0.5;
const DONOR_SAFE_VALUE = 40000;
const ROUNDING_SAFETY_FACTOR = 0.999;
const DEFICIT_INTERVAL = 3 * 60;

let lastDeficitTime = 0;

const manageDeficit = async (page) => {
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

const checkVillageDeficit = async (page, village, villages) => {
  const deficitResources = village.getDeficitResources();

  if (deficitResources.getTotal() > MERCHANTS_CAPACITY) {
    await handleDeficitResources(page, villages, village, deficitResources);
  } else {
    console.log(`Village ${village.name} does not need resources`);
  }
};

const handleDeficitResources = async (
  page,
  villages,
  village,
  deficitResources
) => {
  console.log(`Village ${village.name} needs resources ${deficitResources}`);

  const [donorVillage, resourcesToSend] = findDonorVillageAndRes(
    villages,
    deficitResources
  );

  if (donorVillage) {
    console.log(
      `Village ${village.name} needs to request ${resourcesToSend} from village ${donorVillage.name}`
    );
    await requestResources(page, donorVillage, village, resourcesToSend);
    updateVillageResources(donorVillage, village, resourcesToSend);
  } else {
    console.log(`No one can send resources to ${village.name}`);
  }
};

const findDonorVillageAndRes = (villages, resourcesToRequest) => {
  const potentialDonors = [];

  for (const donorVillage of villages) {
    const donorResources = Resources.add(
      donorVillage.resources,
      donorVillage.ongoingResources
    );

    const possibleDonation = calculatePossibleDonationForDeficit(
      donorResources,
      donorVillage.capacity,
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
  donorResources,
  donorCapacity,
  resourcesToRequest
) => {
  const possibleDonation = new Resources(0, 0, 0, 0);

  Resources.getKeys().forEach((resourceType) => {
    const maxDonation =
      donorResources[resourceType] -
      Math.min(
        donorCapacity[resourceType] * DONOR_SAFE_LEVEL,
        DONOR_SAFE_VALUE
      );

    possibleDonation[resourceType] = Math.min(
      resourcesToRequest[resourceType],
      maxDonation
    );

    if (possibleDonation[resourceType] < 0) {
      possibleDonation[resourceType] = 0;
    }
  });

  return possibleDonation;
};

const requestResources = async (page, fromVillage, toVillage, resources) => {
  const resourcesToRequest = limitResourcesToMarket(fromVillage, resources);
  const trade = new Trade(fromVillage, toVillage, resourcesToRequest);
  await sendResources(page, trade);
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

const updateVillageResources = (fromVillage, toVillage, resources) => {
  fromVillage.resources = Resources.subtract(fromVillage.resources, resources);
  toVillage.resources = Resources.add(toVillage.resources, resources);
};

module.exports = manageDeficit;
