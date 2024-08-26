const { upsertUnit } = require("../services/unitService");
const { getBuildingType } = require("../services/buildingTypeService");

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
  const barracks = await getBuildingType("Barracks");
  const stable = await getBuildingType("Stable");
  const workshop = await getBuildingType("Workshop");
  const residence = await getBuildingType("Residence");

  return [
    {
      name: "Phalanx",
      selector: "t1",
      building: barracks,
    },
    {
      name: "Swordsman",
      selector: "t2",
      building: barracks,
    },
    {
      name: "Pathfinder",
      selector: "t3",
      building: stable,
    },
    {
      name: "TheutatesThunder",
      selector: "t4",
      building: stable,
    },
    {
      name: "Druidrider",
      selector: "t5",
      building: stable,
    },
    { name: "Haeduan", selector: "t6", building: stable },
    { name: "Ram", selector: "t7", building: workshop },
    {
      name: "Trebuchet",
      selector: "t8",
      building: workshop,
    },
    {
      name: "Chieftain",
      selector: "t9",
      building: residence,
    },
    {
      name: "Settler",
      selector: "t10",
      building: residence,
    },
  ];
};

module.exports = populateUnits;
