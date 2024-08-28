const { getUnit } = require("../services/unitService");
const UNIT_NAMES = require("../constants/unitsNames");

let upgradeList = [];

const populateUpgradeList = async () => {
  const phalanx = await getUnit(UNIT_NAMES.PHALANX);
  const swordsman = await getUnit(UNIT_NAMES.SWORDSMAN);
  const pathfinder = await getUnit(UNIT_NAMES.PATHFINDER);
  const theutatesThunder = await getUnit(UNIT_NAMES.THEUTATES_THUNDER);
  const haeduan = await getUnit(UNIT_NAMES.HAEDUAN);
  const ram = await getUnit(UNIT_NAMES.RAM);
  const trebuchet = await getUnit(UNIT_NAMES.TREBUCHET);

  upgradeList = [
    {
      villageName: "HDS 01",
      unit: swordsman,
    },
    {
      villageName: "HDS 01",
      unit: theutatesThunder,
    },
    {
      villageName: "HDS 01",
      unit: haeduan,
    },
    {
      villageName: "HDS 01",
      unit: ram,
    },
    {
      villageName: "HDS 01",
      unit: trebuchet,
    },
    {
      villageName: "HDS 02",
      unit: phalanx,
    },
    {
      villageName: "HDS 02",
      unit: pathfinder,
    },
    {
      villageName: "HDS 03",
      unit: phalanx,
    },
    {
      villageName: "HDS 04",
      unit: phalanx,
    },
    {
      villageName: "HDS 05",
      unit: phalanx,
    },
    {
      villageName: "HDS 06",
      unit: phalanx,
    },
    {
      villageName: "HDS 07",
      unit: phalanx,
    },
    {
      villageName: "HDS 08",
      unit: phalanx,
    },
    {
      villageName: "HDS 09",
      unit: phalanx,
    },
    {
      villageName: "HDS 10",
      unit: phalanx,
    },
    {
      villageName: "HDS 11",
      unit: phalanx,
    },
    {
      villageName: "HDS 12",
      unit: phalanx,
    },
    {
      villageName: "HDS 13",
      unit: phalanx,
    },
    {
      villageName: "HDS 20",
      unit: swordsman,
    },
    {
      villageName: "HDS 20",
      unit: theutatesThunder,
    },
    {
      villageName: "HDS 20",
      unit: haeduan,
    },
    {
      villageName: "HDS 20",
      unit: ram,
    },
    {
      villageName: "HDS 20",
      unit: trebuchet,
    },
  ];
};

const getUpgradeList = async () => {
  if (upgradeList.length === 0) {
    await populateUpgradeList();
  }
  return upgradeList;
};

const removeFromUpgradeList = async (unitName) => {
  if (upgradeList.length === 0) {
    await populateUpgradeList();
  }
  upgradeList = upgradeList.filter((item) => item.unit.name !== unitName);
};

module.exports = { getUpgradeList, removeFromUpgradeList };
