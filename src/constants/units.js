const BuildingTypes = require("../constants/buildingTypes");

const Unit = {
  Phalanx: { selector: "t1", building: BuildingTypes.Barracks },
  Swordsman: { selector: "t2", building: BuildingTypes.Barracks },
  Pathfinder: { selector: "t3", building: BuildingTypes.Stable },
  TheutatesThunder: { selector: "t4", building: BuildingTypes.Stable },
  Druidrider: { selector: "t5", building: BuildingTypes.Stable },
  Haeduan: { selector: "t6", building: BuildingTypes.Stable },
  Ram: { selector: "t7", building: BuildingTypes.Workshop },
  Trebuchet: { selector: "t8", building: BuildingTypes.Workshop },
  Chieftain: { selector: "t9", building: BuildingTypes.Residence },
  Settler: { selector: "t10", building: BuildingTypes.Residence },
};

module.exports = Unit;
