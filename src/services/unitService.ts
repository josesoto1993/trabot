const UnitModel = require("../schemas/unitSchema");

let cachedUnits = null;

const loadUnits = async () => {
  if (!cachedUnits) {
    const units = await UnitModel.find().populate("building");
    cachedUnits = {};
    units.forEach((unit) => {
      cachedUnits[unit.name] = unit;
    });
  }
  return cachedUnits;
};

const getUnits = async () => {
  return await loadUnits();
};

const getUnit = async (name) => {
  const units = await getUnits();
  return units[name];
};

const upsertUnit = async (unitData) => {
  const filter = { name: unitData.name };
  const update = {
    selector: unitData.selector,
    building: unitData.building._id,
  };
  const options = { new: true, upsert: true };

  const result = await UnitModel.findOneAndUpdate(filter, update, options);

  cleanCache();

  return result;
};

const cleanCache = () => {
  cachedUnits = null;
};

module.exports = { getUnits, getUnit, upsertUnit };
