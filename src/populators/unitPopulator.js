const { upsertUnit } = require("../services/unitService");
const { getBuildingType } = require("../services/buildingTypeService");
const BUILDING_NAMES = require("../constants/buildingNames");
const UNIT_NAMES = require("../constants/unitsNames");

const populateUnits = async () => {
  console.log("start populating units");

  const units = await getBaseUnits();
  for (const unit of units) {
    try {
      await upsertUnit(unit);
    } catch (error) {
      console.error(`Error upserting unit "${unit}":`, error);
    }
  }

  console.log("finish populating units");
};

const getBaseUnits = async () => {
  const barracks = await getBuildingType(BUILDING_NAMES.BARRACKS);
  const stable = await getBuildingType(BUILDING_NAMES.STABLE);
  const workshop = await getBuildingType(BUILDING_NAMES.WORKSHOP);
  const residence = await getBuildingType(BUILDING_NAMES.RESIDENCE);

  return [
    {
      name: UNIT_NAMES.PHALANX,
      selector: "t1",
      building: barracks,
    },
    {
      name: UNIT_NAMES.SWORDSMAN,
      selector: "t2",
      building: barracks,
    },
    {
      name: UNIT_NAMES.PATHFINDER,
      selector: "t3",
      building: stable,
    },
    {
      name: UNIT_NAMES.THEUTATES_THUNDER,
      selector: "t4",
      building: stable,
    },
    {
      name: UNIT_NAMES.DRUIDRIDER,
      selector: "t5",
      building: stable,
    },
    {
      name: UNIT_NAMES.HAEDUAN,
      selector: "t6",
      building: stable,
    },
    {
      name: UNIT_NAMES.RAM,
      selector: "t7",
      building: workshop,
    },
    {
      name: UNIT_NAMES.TREBUCHET,
      selector: "t8",
      building: workshop,
    },
    {
      name: UNIT_NAMES.CHIEFTAIN,
      selector: "t9",
      building: residence,
    },
    {
      name: UNIT_NAMES.SETTLER,
      selector: "t10",
      building: residence,
    },
    {
      name: UNIT_NAMES.TRAPS,
      selector: "t911",
      building: residence,
    },
  ];
};

module.exports = populateUnits;
