import { Page } from "puppeteer";
import { TaskResult } from "../index";
import {
  getAllOasisFarms,
  IOasisFarm,
  updateOasisFarmTime,
} from "../services/oasisFarmService";
import sendTroops, { ISendTroops } from "./sendTroops";
import SendTroopsTypes from "../constants/sendTroopsTypes";
import { getVillages } from "../player/playerHandler";
import Village from "../models/village";
import updateVillageSquadronsInfo from "./checkTroops";

let lastAttackOasisTime: number = 0;
const RECHECK_FARMS = 5 * 60 * 1000;

interface IVillageOasisFarms {
  village: Village;
  oasisFarms: IOasisFarm[];
}

const attackOasisFarms = async (
  page: Page,
  interval: number
): Promise<TaskResult> => {
  const nextExecutionTime = getNextExecutionTime();
  if (nextExecutionTime > Date.now()) {
    return { nextExecutionTime: nextExecutionTime, skip: true };
  }
  console.log(
    "Enough time has passed since the last attack oasis, go for attack!"
  );

  const attackDone = await performAttackOasis(page, interval);

  updateNextAttackTime();
  return {
    nextExecutionTime: getNextExecutionTime(),
    skip: !attackDone,
  };
};

const getNextExecutionTime = (): number => {
  return RECHECK_FARMS + lastAttackOasisTime;
};

const updateNextAttackTime = (): void => {
  lastAttackOasisTime = Date.now();
};

const performAttackOasis = async (
  page: Page,
  interval: number
): Promise<boolean> => {
  const villageSortedOasisFarms = await getSortedOasisFarmsByVilla(interval);
  let anyAttackSent = false;

  for (const villageOasisFarms of villageSortedOasisFarms) {
    const attackDone = await performAttackForVillage(page, villageOasisFarms);
    if (attackDone) {
      anyAttackSent = true;
    }
  }

  return anyAttackSent;
};

const performAttackForVillage = async (
  page: Page,
  villageOasisFarms: IVillageOasisFarms
): Promise<boolean> => {
  const village = villageOasisFarms.village;
  await updateVillageSquadronsInfo(page, village);
  let attackSent = false;

  for (const oasisFarm of villageOasisFarms.oasisFarms) {
    if (!(await isTroopSufficient(village, oasisFarm))) {
      console.log(
        `Not enough troops in squadron for attack in village: ${village.name}`
      );
      break;
    }

    const data: ISendTroops = {
      village,
      coordinates: oasisFarm.tile.coordinates,
      sendType: SendTroopsTypes.RAID,
      squadrons: [oasisFarm.squadron],
    };

    await sendTroops(page, data);
    await updateOasisFarmTime(oasisFarm);
    attackSent = true;
  }

  return attackSent;
};

const isTroopSufficient = async (
  village: Village,
  oasisFarm: IOasisFarm
): Promise<boolean> => {
  return village.haveSquadron(oasisFarm.squadron);
};

const getSortedOasisFarmsByVilla = async (
  interval: number
): Promise<IVillageOasisFarms[]> => {
  const oasisFarms = await getAllOasisFarms();
  const villages = getVillages();

  const readyToAttack = Date.now() - interval;
  const filteredOasisFarms = oasisFarms.filter(
    (farm) => !farm.lastAttack || farm.lastAttack?.getTime() < readyToAttack
  );

  return groupOasisFarmsByVillage(filteredOasisFarms, villages);
};

const groupOasisFarmsByVillage = (
  oasisFarms: IOasisFarm[],
  villages: Village[]
): IVillageOasisFarms[] => {
  const villageOasisFarmsMap = new Map<Village, IOasisFarm[]>();

  oasisFarms.forEach((oasisFarm) => {
    const village = villages.find((vil) => vil.name === oasisFarm.villageName);
    if (!village) {
      return;
    }

    if (!villageOasisFarmsMap.has(village)) {
      villageOasisFarmsMap.set(village, []);
    }
    villageOasisFarmsMap.get(village).push(oasisFarm);
  });

  return Array.from(villageOasisFarmsMap, ([village, oasisFarms]) => ({
    village,
    oasisFarms: sortOasisFarmsByDate(oasisFarms),
  }));
};

const sortOasisFarmsByDate = (oasisFarms: IOasisFarm[]): IOasisFarm[] => {
  return oasisFarms.sort((a, b) => {
    const lastAttackA = a.lastAttack?.getTime() || 0;
    const lastAttackB = b.lastAttack?.getTime() || 0;
    return lastAttackA - lastAttackB;
  });
};

export default attackOasisFarms;
