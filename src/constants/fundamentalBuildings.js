const { getBuildingType } = require("../services/buildingTypeService");

const getFundamentalBuildings = async () => {
  return [
    await getBuildingType("Main Building"),
    await getBuildingType("Rally Point"),
    await getBuildingType("Palisade"),
    await getBuildingType("Warehouse"),
    await getBuildingType("Granary"),
    await getBuildingType("Marketplace"),
    await getBuildingType("Residence"),
    await getBuildingType("Grain Mill"),
    await getBuildingType("Brickyard"),
    await getBuildingType("Sawmill"),
    await getBuildingType("Iron Foundry"),
    await getBuildingType("Academy"),
    await getBuildingType("Town Hall"),
    await getBuildingType("Bakery"),
  ];
};

module.exports = getFundamentalBuildings;
