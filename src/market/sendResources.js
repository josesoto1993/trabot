const { URL } = require("url");

const goVillage = require("../village/goVillage");
const { formatTime } = require("../utils/timePrintService");
const { goPage, typeInSelector } = require("../browser/browserService");
const { addTrade } = require("./ongoingTrades");

const { TRAVIAN_BASE } = require("../constants/links");
const MarketTabs = require("../constants/marketTabs");

const MARKET_SELECTOR = "div.buttonsWrapper a.market";
const TRADE_DELAY = 3;

const sendResources = async (page, trade) => {
  console.log(
    `Start send resources from ${trade.from.name} to ${trade.to.name}`
  );
  try {
    await verifyCargo(page, trade.from, trade.ammount);
    await setDestination(page, trade.to);
    await setResources(page, trade.ammount);
    const tradeDuration = await executeTrade(page);
    addTrade(trade, tradeDuration);

    console.log(
      `${trade.toString()}. Executed successfully. Will take ${formatTime(tradeDuration)}`
    );
    return tradeDuration;
  } catch (error) {
    console.error("Error in sendResources:", error);
  }
};

const verifyCargo = async (page, from, cargo) => {
  const maxCargo = getMaxCargo(page, from);
  const totalCargo = cargo.getTotal();
  if (totalCargo > maxCargo) {
    throw new Error(
      `Not enough capacity. Max cargo is ${maxCargo}, but trying to send ${totalCargo}.`
    );
  }
};

const getMaxCargo = async (page, from) => {
  await goMarket(page, from);
  const capacitySelector = "div.capacity span.value";
  await page.waitForSelector(capacitySelector);
  const capacityPerCart = await page.$eval(capacitySelector, (span) => {
    return parseInt(span.textContent.trim().replace(/[^\d]/g, ""), 10);
  });

  const availableCartsSelector = "div.available span.value";
  await page.waitForSelector(availableCartsSelector);
  const availableCarts = await page.$eval(availableCartsSelector, (span) => {
    const availableText = span.textContent.trim().replace(/[^\d/]/g, "");
    const [available, _] = availableText.split("/").map(Number);
    return available;
  });

  return availableCarts * capacityPerCart;
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

const setResources = async (page, ammount) => {
  console.log("set resources");
  await page.waitForSelector('input[name="lumber"]');

  await typeInSelector('input[name="lumber"]', ammount.lumber);
  await typeInSelector('input[name="clay"]', ammount.clay);
  await typeInSelector('input[name="iron"]', ammount.iron);
  await typeInSelector('input[name="crop"]', ammount.crop);
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

module.exports = { sendResources, getMaxCargo };
