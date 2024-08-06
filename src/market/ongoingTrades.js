let ongoingTrades = [];

const addTrade = (trade, duration) => {
  const finishTime = Date.now() + duration * 1000;
  ongoingTrades.push({ trade, finishTime });
};

const getTrades = () => {
  removeFinishedTrades();
  return ongoingTrades;
};

const getIncomingResources = (villageName) => {
  const initialValue = { lumber: 0, clay: 0, iron: 0, crop: 0 };

  const trades = getTrades().filter(
    (record) => record.trade.to.name === villageName
  );

  if (trades.length === 0) {
    return initialValue;
  }

  return trades
    .map((record) => record.trade.ammount)
    .reduce((acc, amount) => {
      acc.lumber += amount.lumber;
      acc.clay += amount.clay;
      acc.iron += amount.iron;
      acc.crop += amount.crop;
      return acc;
    }, initialValue);
};

const removeFinishedTrades = () => {
  const now = Date.now();
  ongoingTrades = ongoingTrades.filter((trade) => trade.finishTime >= now);
};

module.exports = {
  addTrade,
  getTrades,
  getIncomingResources,
};
