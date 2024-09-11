import { Page } from "puppeteer";
import Village from "../models/village";
import { getUnitsByTribe, IUnit } from "../services/unitService";
import TribeNames from "../constants/tribes";
import ISquadron from "../commonInterfaces/squadron";
import { goRallyPointSendTroops } from "./sendTroops";

export const updateVillageSquadronsInfo = async (
  page: Page,
  village: Village
): Promise<void> => {
  await goRallyPointSendTroops(village);
  const tribeUnits = await getUnitsByTribe(TribeNames.GAULS);
  village.squadrons = await getSquadrons(page, tribeUnits);
};

const getSquadrons = async (
  page: Page,
  tribeUnits: IUnit[]
): Promise<ISquadron[]> => {
  const squadrons: ISquadron[] = [];

  for (const unit of tribeUnits) {
    const quantity = await getUnitQuantity(page, unit.selector);
    squadrons.push({ unit, quantity });
  }

  return squadrons;
};

const getUnitQuantity = async (
  page: Page,
  unitSelector: string
): Promise<number> => {
  const selector = `input[name='troop[${unitSelector}]']`;

  await page.waitForSelector(selector);
  const quantityResult = await page.evaluate((selector) => {
    const inputElement = document.querySelector(selector);
    if (!inputElement) {
      return {
        quantity: 0,
        error: `No troop input element found for selector ${selector}`,
      };
    }

    const tdElement = inputElement.closest("td");
    if (!tdElement) {
      return {
        quantity: 0,
        error: `No <td> found for input element ${selector}`,
      };
    }

    const quantityElement = tdElement.querySelector("a");
    if (quantityElement) {
      const quantity =
        parseInt(quantityElement.textContent.replace(/\D/g, ""), 10) || 0;
      return { quantity, error: null };
    }

    const noneSpanElement = tdElement.querySelector("span.none");
    if (noneSpanElement) {
      return { quantity: 0, error: null };
    }

    return {
      quantity: 0,
      error: `No anchor or "none" span found for troop ${selector}`,
    };
  }, selector);

  if (quantityResult.error) {
    console.error(quantityResult.error);
  }

  return quantityResult.quantity;
};

export default updateVillageSquadronsInfo;
