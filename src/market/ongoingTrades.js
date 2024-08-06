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
  let initialValue = { lumber: 0, clay: 0, iron: 0, crop: 0 };
  return getTrades()
    .filter((record) => record.trade.to.name === villageName)
    .map((record) => record.trade.ammount)
    .reduce((acc, ammount) => {
      acc.lumber += ammount.lumber;
      acc.clay += ammount.clay;
      acc.iron += ammount.iron;
      acc.crop += ammount.crop;
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
