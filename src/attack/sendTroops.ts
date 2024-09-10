import { ElementHandle, Page } from "puppeteer";
import Village from "../models/village";
import { goBuilding } from "../village/goVillage";
import BuildingNames from "../constants/buildingNames";
import RallyPointTabs from "../constants/rallyPointTabs";
import SendTroopsTypes from "../constants/sendTroopsTypes";
import { CLICK_DELAY, typeInSelector } from "../browser/browserService";
import ISquadron from "../commonInterfaces/squadron";
import ICoordinates from "../commonInterfaces/coordinates";

export interface ISendTroops {
  village: Village;
  coordinates: ICoordinates;
  sendType: SendTroopsTypes;
  squadrons: ISquadron[];
}

const sendTroops = async (page: Page, data: ISendTroops): Promise<void> => {
  await goRallyPointSendTroops(data.village);
  await selectCoords(data.coordinates);
  await selectSendType(page, data.sendType);
  for (const squadron of data.squadrons) {
    await selectTroop(squadron);
  }
  await submit(page);
};

const goRallyPointSendTroops = async (village: Village): Promise<void> => {
  const marketTabSearchParam = {
    [RallyPointTabs.QUERY_PARAM_KEY]: RallyPointTabs.SEND_TROOPS,
  };
  await goBuilding(village, BuildingNames.RALLY_POINT, marketTabSearchParam);
};

const selectTroop = async (squadron: ISquadron): Promise<void> => {
  const inputSelector = `input[name='troop[${squadron.unit.selector}]']`;
  await typeInSelector(inputSelector, squadron.quantity);
};

const selectCoords = async (coordinates: ICoordinates): Promise<void> => {
  await typeInSelector("#xCoordInput", coordinates.x);
  await typeInSelector("#yCoordInput", coordinates.y);
};

const selectSendType = async (
  page: Page,
  type: SendTroopsTypes
): Promise<void> => {
  const optionSelector = "div#build div.a2b form div.option";
  await page.waitForSelector(optionSelector);

  const labels = await page.$$(optionSelector + " label");
  for (const label of labels) {
    const labelText = await page.evaluate(
      (el) => el.textContent?.trim(),
      label
    );

    if (labelText === type) {
      await clickLabel(type, label);
      return;
    }
  }

  console.error(`Label with text "${type}" not found.`);
};

const clickLabel = async (
  type: SendTroopsTypes,
  label: ElementHandle<Element>
): Promise<void> => {
  const radioButton = await label.$("input[type='radio']");
  if (!radioButton) {
    console.log(`ERROR! ${type} radioButton does not exist!`);
    return;
  }

  await radioButton.click();
  console.log(`${type} selected.`);
  await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
};

const submit = async (page: Page): Promise<void> => {
  try {
    await page.click('button[type="submit"]');
    await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
  } catch (error) {
    console.error("Error submitting send troops form:", error);
  }
};

export default sendTroops;
