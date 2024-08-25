const { TRAVIAN_BASE } = require("./links");

const OverviewTabs = {
  mainUrl: `${TRAVIAN_BASE}/village/statistics`,
  overview: `${TRAVIAN_BASE}/village/statistics/overview`,
  resResources: `${TRAVIAN_BASE}/village/statistics/resources/resources`,
  resWarehouse: `${TRAVIAN_BASE}/village/statistics/resources/warehouse`,
  resProduction: `${TRAVIAN_BASE}/village/statistics/resources/production`,
  resCapacity: `${TRAVIAN_BASE}/village/statistics/resources/capacity`,
  culturepoints: `${TRAVIAN_BASE}/village/statistics/culturepoints`,
  troopsTraining: `${TRAVIAN_BASE}/village/statistics/troops/training`,
  troopsInVillages: `${TRAVIAN_BASE}/village/statistics/troops/support`,
};

module.exports = OverviewTabs;
