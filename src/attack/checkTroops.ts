import { Page } from "puppeteer";
import Village from "../models/village";
import { getUnitsByTribe } from "../services/unitService";
import TribeNames from "../constants/tribes";
import ISquadron from "../commonInterfaces/squadron";

export const updateVillageSquadronsInfo = async (
  page: Page,
  village: Village
): Promise<void> => {
  const tribeUnits = await getUnitsByTribe(TribeNames.GAULS);
  const squadrons: ISquadron[] = [];

  for (const unit of tribeUnits) {
    const selector = `input[name='troop[${unit.selector}]']`;

    const quantity = await page.evaluate((selector) => {
      const inputElement = document.querySelector(selector);
      if (!inputElement) {
        return 0;
      }

      const quantityElement = inputElement.nextElementSibling
        ?.nextElementSibling as HTMLAnchorElement;

      return quantityElement
        ? parseInt(quantityElement.textContent.replace(/\D/g, ""), 10) || 0
        : 0;
    }, selector);

    squadrons.push({ unit, quantity });
  }

  village.squadrons = squadrons;
};

export default updateVillageSquadronsInfo;
