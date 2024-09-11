import Links from "../constants/links";

const OverviewTabs = {
  MAIN_URL: `${Links.TRAVIAN_BASE}/village/statistics`,
  OVERVIEW: `${Links.TRAVIAN_BASE}/village/statistics/overview`,
  RESOURCES_RESOURCES: `${Links.TRAVIAN_BASE}/village/statistics/resources/resources`,
  RESOURCES_WAREHOUSE: `${Links.TRAVIAN_BASE}/village/statistics/resources/warehouse`,
  RESOURCES_PRODUCTION: `${Links.TRAVIAN_BASE}/village/statistics/resources/production`,
  RESOURCES_CAPACITY: `${Links.TRAVIAN_BASE}/village/statistics/resources/capacity`,
  CULTUREPOINTS: `${Links.TRAVIAN_BASE}/village/statistics/culturepoints`,
  TROOPS_TRAINING: `${Links.TRAVIAN_BASE}/village/statistics/troops/training`,
  TROOPS_IN_VILLAGE: `${Links.TRAVIAN_BASE}/village/statistics/troops/support`,
} as const;

export default OverviewTabs;
