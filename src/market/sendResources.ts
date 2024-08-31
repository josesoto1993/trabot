const { goBuilding } = require("../village/goVillage");
import { formatTime } from "../utils/timePrint";
import { typeInSelector, CLICK_DELAY } from "../browser/browserService";
const { addTrade } = require("./ongoingTrades");
import { MarketTabs } from "../constants/marketTabs";
import { BuildingNames } from "../constants/buildingNames";

const MARKET_WAIT_POSSIBLE_ERROR = 1 * 1000;

const sendResources = async (page, trade) => {
  console.log(
    `Start send resources from ${trade.from.name} to ${trade.to.name}`
  );
  try {
    await goMarket(trade.from);
    await setDestination(page, trade.to);
    await setResources(page, trade.resources);
    await verify(page);
    const tradeDuration = await executeTrade(page);
    addTrade(trade, tradeDuration);

    console.log(
      `${trade.toString()}. Executed successfully. Will take ${formatTime(tradeDuration)}`
    );
    return tradeDuration;
  } catch (error) {
    console.error(`Error in sendResources for trade ${trade} :`, error);
    return -1;
  }
};

const goMarket = async (village) => {
  const marketTabSearchParam = {
    [MarketTabs.QUERY_PARAM_KEY]: MarketTabs.SEND_RESOURCES,
  };
  await goBuilding(village, BuildingNames.MARKETPLACE, marketTabSearchParam);
};

const setDestination = async (page, to) => {
  console.log("set destination");
  await page.waitForSelector("div.inputWrapper");

  await typeInSelector(
    "div.inputWrapper label.coordinateX input",
    to.coordinateX
  );
  await typeInSelector(
    "div.inputWrapper label.coordinateY input",
    to.coordinateY
  );
};

const setResources = async (page, resources) => {
  console.log("set resources");
  await page.waitForSelector('input[name="lumber"]');

  if (resources.lumber > 0) {
    await typeInSelector('input[name="lumber"]', resources.lumber);
  }
  if (resources.clay > 0) {
    await typeInSelector('input[name="clay"]', resources.clay);
  }
  if (resources.iron > 0) {
    await typeInSelector('input[name="iron"]', resources.iron);
  }
  if (resources.crop > 0) {
    await typeInSelector('input[name="crop"]', resources.crop);
  }
};

const verify = async (page) => {
  await new Promise((resolve) =>
    setTimeout(resolve, MARKET_WAIT_POSSIBLE_ERROR)
  );

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

const executeTrade = async (page) => {
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

const getTradeDuration = async (page) => {
  const durationSelector = "div.targetWrapper div.duration span.value";
  await page.waitForSelector(durationSelector);
  return await page.$eval(durationSelector, (span) => {
    const timeString = span.textContent.trim();
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  });
};

module.exports = sendResources;
