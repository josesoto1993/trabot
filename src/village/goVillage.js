const { goPage } = require("../browser/browserService");
const { TRAVIAN_RESOURCES_VIEW } = require("../constants/links");
const { TRAVIAN_BASE } = require("../constants/links");

const MarketTabs = require("../constants/marketTabs");
const MARKET_SELECTOR = "div.buttonsWrapper a.market";

const goVillage = async (village) => {
  const villageUrl = new URL(TRAVIAN_RESOURCES_VIEW);
  villageUrl.searchParams.append("newdid", village.id);

  await goPage(villageUrl);
  console.log(`Navigated to village: ${village.name}`);
};

const goMarket = async (page, village) => {
  console.log("go market");
  await goVillage(village);

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

module.exports = { goVillage, goMarket };
