const { getBuildingType } = require("../services/buildingTypeService");

const getUnits = async () => {
  const barracks = await getBuildingType("Barracks");
  const stable = await getBuildingType("Stable");
  const workshop = await getBuildingType("Workshop");
  const residence = await getBuildingType("Residence");

  return {
    Phalanx: {
      name: "Phalanx",
      selector: "t1",
      building: barracks,
    },
    Swordsman: {
      name: "Swordsman",
      selector: "t2",
      building: barracks,
    },
    Pathfinder: {
      name: "Pathfinder",
      selector: "t3",
      building: stable,
    },
    TheutatesThunder: {
      name: "TheutatesThunder",
      selector: "t4",
      building: stable,
    },
    Druidrider: {
      name: "Druidrider",
      selector: "t5",
      building: stable,
    },
    Haeduan: { name: "Haeduan", selector: "t6", building: stable },
    Ram: { name: "Ram", selector: "t7", building: workshop },
    Trebuchet: {
      name: "Trebuchet",
      selector: "t8",
      building: workshop,
    },
    Chieftain: {
      name: "Chieftain",
      selector: "t9",
      building: residence,
    },
    Settler: {
      name: "Settler",
      selector: "t10",
      building: residence,
    },
  };
};

const getUnit = async (name) => {
  const unit = await getUnits();
  return unit[name];
};

module.exports = { getUnits, getUnit };
