const Player = require("../models/player");
const getVillagesOverviewInfo = require("../village/listVillagesOverview");
const getBuildingData = require("../village/buildingsData");
const getResourceFieldsData = require("../village/resourceFieldsData");

let player = new Player([]);

const updateVillages = async (page) => {
  const villages = await getVillagesOverviewInfo(page);

  for (const village of villages) {
    village.resourceFields = await getResourceFieldsData(page, village);
    village.buildings = await getBuildingData(page, village);
  }

  player.villages = villages;

  return player;
};

const getPlayer = () => {
  return player;
};

module.exports = {
  updateVillages,
  getPlayer,
};
