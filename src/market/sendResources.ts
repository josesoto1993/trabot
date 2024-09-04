import { Page } from "puppeteer";
import Resources from "../models/resources";
import Trade from "../models/trade";
import { goBuilding } from "../village/goVillage";
import { formatTime } from "../utils/timePrint";
import { typeInSelector, CLICK_DELAY } from "../browser/browserService";
import { addTrade } from "./ongoingTrades";
import MarketTabs from "../constants/marketTabs";
import BuildingNames from "../constants/buildingNames";
import Village from "../models/village";

const ROUNDING_SAFETY_FACTOR = 0.999;

const sendResources = async (page: Page, trade: Trade): Promise<Resources> => {
  console.log(
    `Start send resources from ${trade.from.name} to ${trade.to.name}`
  );
  try {
    trade.resources = limitResourcesToMarket(trade.from, trade.resources);
    if (trade.resources.getTotal() <= 0) {
      return new Resources(0, 0, 0, 0);
    }

    await goMarket(trade.from);
    await setDestination(page, trade.to);
    await setResources(page, trade.resources);
    await verify(page);
    const tradeDuration = await executeTrade(page);
    addTrade(trade, tradeDuration);

    console.log(
      `${trade.toString()}. Executed successfully. Will take ${formatTime(tradeDuration)}`
    );
    return trade.resources;
  } catch (error) {
    console.error(`Error in sendResources for trade ${trade} :`, error);
    return new Resources(0, 0, 0, 0);
  }
};

const goMarket = async (village: Village): Promise<void> => {
  const marketTabSearchParam = {
    [MarketTabs.QUERY_PARAM_KEY]: MarketTabs.SEND_RESOURCES,
  };
  await goBuilding(village, BuildingNames.MARKETPLACE, marketTabSearchParam);
};

const setDestination = async (page: Page, to: Village): Promise<void> => {
  console.log("set destination");
  await page.waitForSelector("div.inputWrapper");

  await typeInSelector(
    "div.inputWrapper label.coordinateX input",
    to.coordinateX.toString()
  );
  await typeInSelector(
    "div.inputWrapper label.coordinateY input",
    to.coordinateY.toString()
  );
};

const setResources = async (
  page: Page,
  resources: Resources
): Promise<void> => {
  console.log("set resources");
  await page.waitForSelector('input[name="lumber"]');

  if (resources.lumber > 0) {
    await typeInSelector('input[name="lumber"]', resources.lumber.toString());
  }
  if (resources.clay > 0) {
    await typeInSelector('input[name="clay"]', resources.clay.toString());
  }
  if (resources.iron > 0) {
    await typeInSelector('input[name="iron"]', resources.iron.toString());
  }
  if (resources.crop > 0) {
    await typeInSelector('input[name="crop"]', resources.crop.toString());
  }
};

const verify = async (page: Page): Promise<void> => {
  const waitPossibleError = 1 * 1000;
  await new Promise((resolve) => setTimeout(resolve, waitPossibleError));

  const errorDivsText = await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll("div.error"));
    return divs.map((div) => div.textContent);
  });

  const notEnoughMerchantsText = errorDivsText.find((text) =>
    text.includes("Not enough merchants")
  );

  if (notEnoughMerchantsText) {
    throw new Error(
      `Not enough capacity. Show in screen: ${notEnoughMerchantsText}.`
    );
  }
};

const executeTrade = async (page: Page): Promise<number> => {
  console.log("execute trade");
  await page.waitForSelector("button.send");
  const sendButton = await page.$("button.send");
  if (sendButton) {
    const durationValue = await getTradeDuration(page);
    await sendButton.click();
    await new Promise((resolve) => setTimeout(resolve, CLICK_DELAY));
    return durationValue;
  } else {
    throw new Error("Send button not found.");
  }
};

const getTradeDuration = async (page: Page): Promise<number> => {
  const durationSelector = "div.targetWrapper div.duration span.value";
  await page.waitForSelector(durationSelector);
  return await page.$eval(durationSelector, (span) => {
    const timeString = span.textContent?.trim() || "00:00:00";
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  });
};

const limitResourcesToMarket = (
  village: Village,
  resources: Resources
): Resources => {
  const maxCargo = village.getMaxCargo();
  const merchantsCapacity = village.merchantsCapacity;
  const totalRes = resources.getTotal();

  if (totalRes > maxCargo) {
    return limitResourcesToMax(resources, maxCargo);
  } else {
    return roundResourcesToMerchant(resources, merchantsCapacity);
  }
};

const limitResourcesToMax = (
  resources: Resources,
  maxCargo: number
): Resources => {
  const totalRes = resources.getTotal();
  const factor = (maxCargo / totalRes) * ROUNDING_SAFETY_FACTOR;
  const realCargo = Resources.factor(resources, factor);
  console.log(
    `Cargo ${totalRes} exceeds max cargo ${maxCargo}, scaling to send ${realCargo}.`
  );
  return realCargo;
};

const roundResourcesToMerchant = (
  resources: Resources,
  merchantsCapacity: number
): Resources => {
  const totalRes = resources.getTotal();
  const adjustedTotalRes =
    Math.floor(totalRes / merchantsCapacity) * merchantsCapacity;

  if (adjustedTotalRes === 0) {
    console.log(
      `Cargo ${totalRes} is too small to fill even one merchant. Stop trade.`
    );
    return new Resources(0, 0, 0, 0);
  }

  const adjustmentFactor =
    (adjustedTotalRes / totalRes) * ROUNDING_SAFETY_FACTOR;
  const realCargo = Resources.factor(resources, adjustmentFactor);
  console.log(
    `Cargo ${totalRes} is under max cargo, adjusting to send ${realCargo} (multiples of ${merchantsCapacity})`
  );
  return realCargo;
};

export default sendResources;
