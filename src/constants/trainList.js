const { getUnit } = require("./units");

const getTrainList = async () => {
  const swordsman = await getUnit("Swordsman");
  const haeduan = await getUnit("Haeduan");
  const phalanx = await getUnit("Phalanx");
  const trebuchet = await getUnit("Trebuchet");

  return [
    {
      villageName: "HDS 01",
      unit: swordsman,
    },
    {
      villageName: "HDS 01",
      unit: haeduan,
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
      unit: haeduan,
    },
  ];
};

module.exports = getTrainList;
