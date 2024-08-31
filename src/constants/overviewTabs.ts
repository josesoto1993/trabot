const { TRAVIAN_BASE } = require("./links");

const OVERVIEW_TABS = Object.freeze({
  MAIN_URL: `${TRAVIAN_BASE}/village/statistics`,
  OVERVIEW: `${TRAVIAN_BASE}/village/statistics/overview`,
  RESOURCES_RESOURCES: `${TRAVIAN_BASE}/village/statistics/resources/resources`,
  RESOURCES_WAREHOUSE: `${TRAVIAN_BASE}/village/statistics/resources/warehouse`,
  RESOURCES_PRODUCTION: `${TRAVIAN_BASE}/village/statistics/resources/production`,
  RESOURCES_CAPACITY: `${TRAVIAN_BASE}/village/statistics/resources/capacity`,
  CULTUREPOINTS: `${TRAVIAN_BASE}/village/statistics/culturepoints`,
  TROOPS_TARINING: `${TRAVIAN_BASE}/village/statistics/troops/training`,
  TROOPS_INVILLAGE: `${TRAVIAN_BASE}/village/statistics/troops/support`,
});

module.exports = OVERVIEW_TABS;
