const { getUnit } = require("../services/unitService");

let upgradeList = [];

const populateUpgradeList = async () => {
  const phalanx = await getUnit("Phalanx");
  const swordsman = await getUnit("Swordsman");
  const pathfinder = await getUnit("Pathfinder");
  const theutatesThunder = await getUnit("TheutatesThunder");
  const haeduan = await getUnit("Haeduan");
  const ram = await getUnit("Ram");
  const trebuchet = await getUnit("Trebuchet");

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
