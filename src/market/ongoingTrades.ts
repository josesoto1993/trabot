import Resources from "../models/resources";
import Trade from "../models/trade";

export interface TradeRecord {
  trade: Trade;
  finishTime: number;
}

let ongoingTrades: TradeRecord[] = [];

const addTrade = (trade: Trade, duration: number): void => {
  const finishTime = Date.now() + duration * 1000;
  ongoingTrades.push({ trade, finishTime });
};

const getTrades = (): TradeRecord[] => {
  removeFinishedTrades();
  return ongoingTrades;
};

const getIncomingResources = (villageName: string): Resources => {
  const initialValue = new Resources(0, 0, 0, 0);

  const trades = getTrades().filter(
    (record) => record.trade.to.name === villageName
  );

  if (trades.length === 0) {
    return initialValue;
  }

  return trades
    .map((record) => record.trade.resources)
    .reduce((acc, resources) => Resources.add(acc, resources), initialValue);
};

const removeFinishedTrades = (): void => {
  const now = Date.now();
  ongoingTrades = ongoingTrades.filter((trade) => trade.finishTime >= now);
};

export { addTrade, getTrades, getIncomingResources };
