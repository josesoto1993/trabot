const BuildingTypes = require("../constants/buildingTypes");

const Unit = {
  Phalanx: {
    name: "Phalanx",
    selector: "t1",
    building: BuildingTypes.Barracks,
  },
  Swordsman: {
    name: "Swordsman",
    selector: "t2",
    building: BuildingTypes.Barracks,
  },
  Pathfinder: {
    name: "Pathfinder",
    selector: "t3",
    building: BuildingTypes.Stable,
  },
  TheutatesThunder: {
    name: "TheutatesThunder",
    selector: "t4",
    building: BuildingTypes.Stable,
  },
  Druidrider: {
    name: "Druidrider",
    selector: "t5",
    building: BuildingTypes.Stable,
  },
  Haeduan: { name: "Haeduan", selector: "t6", building: BuildingTypes.Stable },
  Ram: { name: "Ram", selector: "t7", building: BuildingTypes.Workshop },
  Trebuchet: {
    name: "Trebuchet",
    selector: "t8",
    building: BuildingTypes.Workshop,
  },
  Chieftain: {
    name: "Chieftain",
    selector: "t9",
    building: BuildingTypes.Residence,
  },
  Settler: {
    name: "Settler",
    selector: "t10",
    building: BuildingTypes.Residence,
  },
};

module.exports = Unit;
