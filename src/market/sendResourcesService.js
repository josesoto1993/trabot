const { URL } = require("url");
const { TRAVIAN_BASE } = require("../constants/links");
const goVillage = require("../village/goVillageService");
const { formatTime } = require("../utils/timePrintService");
const { goPage, typeInSelector } = require("../browser/browserService");
const MarketTabs = require("../constants/marketTabs");

const MARKET_SELECTOR = "div.buttonsWrapper a.market";

const sendResources = async (page, trade) => {
  console.log(
    `Start send resources from ${trade.from.name} to ${trade.to.name}`
  );
  try {
    await goMarket(page, trade);
    await setDestination(page, trade);
    await setResources(page, trade);
    const tradeDuration = await executeTrade(page);

    console.log(
      `${trade}. Executed successfully. Will take ${formatTime(tradeDuration)}`
    );
    return tradeDuration;
  } catch (error) {
    console.error("Error in sendResources:", error);
  }
};

const goMarket = async (page, trade) => {
  console.log("go market");
  await goVillage(trade.from);

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
  await goPage(marketUrl.toString());
};

const setDestination = async (page, trade) => {
  console.log("set destination");
  await page.waitForSelector("div.inputWrapper");

  await typeInSelector(
    "div.inputWrapper label.coordinateX input",
    trade.to.coordinateX.toString()
  );
  await typeInSelector(
    "div.inputWrapper label.coordinateY input",
    trade.to.coordinateY.toString()
  );
};

const setResources = async (page, trade) => {
  console.log("set resources");
  await page.waitForSelector('input[name="lumber"]');

  await typeInSelector('input[name="lumber"]', trade.lumber.toString());
  await typeInSelector('input[name="clay"]', trade.clay.toString());
  await typeInSelector('input[name="iron"]', trade.iron.toString());
  await typeInSelector('input[name="crop"]', trade.crop.toString());
};

const executeTrade = async (page) => {
  console.log("execute trade");
  await page.waitForSelector("button.send");
  const sendButton = await page.$("button.send");
  if (sendButton) {
    const durationValue = await getTradeDuration(page);
    await sendButton.click();
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
