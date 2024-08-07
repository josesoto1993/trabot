const { URL } = require("url");

const goVillage = require("../village/goVillage");
const { formatTime } = require("../utils/timePrint");
const { goPage, typeInSelector } = require("../browser/browserService");
const { addTrade } = require("./ongoingTrades");

const { TRAVIAN_BASE } = require("../constants/links");
const MarketTabs = require("../constants/marketTabs");

const MARKET_SELECTOR = "div.buttonsWrapper a.market";
const TRADE_DELAY = 3;
const MARKET_WAIT_POSSIBLE_ERROR = 1 * 1000;

const sendResources = async (page, trade) => {
  console.log(
    `Start send resources from ${trade.from.name} to ${trade.to.name}`
  );
  try {
    await goMarket(page, trade.from);
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
    console.error(
      `Error in sendResources for trade ${JSON.stringify(trade, null, 2)} :`,
      error
    );
    return -1;
  }
};

const goMarket = async (page, from) => {
  console.log("go market");
  await goVillage(from);

  await page.waitForSelector(MARKET_SELECTOR);
  const marketAnchor = await page.$(MARKET_SELECTOR);
  if (!marketAnchor) {
    throw new Error("Market button not found.");
  }

  const href = await page.evaluate(
    (anchor) => anchor.getAttribute("href"),
    marketAnchor
  );
  if (!href) {
    throw new Error("Market href not found.");
  }

  const marketUrl = new URL(href, TRAVIAN_BASE);
  marketUrl.searchParams.set(
    MarketTabs.QueryParamKey,
    MarketTabs.SendResources
  );
  await goPage(marketUrl);
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

  await typeInSelector('input[name="lumber"]', resources.lumber);
  await typeInSelector('input[name="clay"]', resources.clay);
  await typeInSelector('input[name="iron"]', resources.iron);
  await typeInSelector('input[name="crop"]', resources.crop);
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
    await new Promise((resolve) => setTimeout(resolve, TRADE_DELAY * 1000));
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
