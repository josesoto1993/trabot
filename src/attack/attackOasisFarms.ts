import { Page } from "puppeteer";
import { TaskResult } from "../index";
import { getAllOasisFarms, IOasisFarm } from "../services/oasisFarmService";
import sendTroops, { ISendTroops } from "./sendTroops";
import SendTroopsTypes from "../constants/sendTroopsTypes";
import { getVillages } from "../player/playerHandler";
import Village from "../models/village";
import updateVillageSquadronsInfo from "./checkTroops";

let lastAttackOasisTime: number = 0;

interface IVillageOasisFarms {
  village: Village;
  oasisFarms: IOasisFarm[];
}

const attackOasisFarms = async (
  page: Page,
  interval: number
): Promise<TaskResult> => {
  const nextExecutionTime = getNextExecutionTime(interval);
  if (nextExecutionTime > Date.now()) {
    return { nextExecutionTime: nextExecutionTime, skip: true };
  }
  console.log(
    "Enough time has passed since the last attack oasis, go for attack!"
  );

  const attackDone = await performAttackOasis(page);

  updateNextAttackTime();
  return {
    nextExecutionTime: getNextExecutionTime(interval),
    skip: attackDone,
  };
};

const getNextExecutionTime = (interval: number): number => {
  return interval + lastAttackOasisTime;
};

const updateNextAttackTime = (): void => {
  lastAttackOasisTime = Date.now();
};

const performAttackOasis = async (page: Page): Promise<boolean> => {
  const villageSortedOasisFarms = await getSortedOasisFarmsByVilla();
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
      sendType: SendTroopsTypes.ATTACK,
      squadrons: [oasisFarm.squadron],
    };

    await sendTroops(page, data);
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

const getSortedOasisFarmsByVilla = async (): Promise<IVillageOasisFarms[]> => {
  const oasisFarms = await getAllOasisFarms();
  const villages = getVillages();

  return groupOasisFarmsByVillage(oasisFarms, villages);
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
