const TrainModel = require("../schemas/trainSchema");
const { getUnit } = require("./unitService");

const getTrainList = async () => {
  const trainList = await TrainModel.find();

  const populatedTrainList = await Promise.all(
    trainList.map(async (train) => {
      const unit = await getUnit(train.unitName);
      return {
        villageName: train.villageName,
        unit: unit,
      };
    })
  );

  return populatedTrainList;
};

const clearVillage = async (villageName) => {
  const filter = { villageName };
  await TrainModel.deleteMany(filter);
};

const removeTrain = async (villageName, unitName) => {
  const filter = { villageName, unitName };
  await TrainModel.deleteOne(filter);
};

const trainsInVillage = async (villageName) => {
  const filter = { villageName };
  await TrainModel.find(filter);
};

const insertTrain = async (villageName, unitName) => {
  const unit = await getUnit(unitName);
  if (!unit) {
    throw new Error(`Unit "${unitName}" not found`);
  }

  const existingTrainsInVillage = await trainsInVillage(villageName);

  const conflictingTrains = existingTrainsInVillage.filter(async (train) => {
    const existingUnit = await getUnit(train.unitName);
    return existingUnit.building._id.equals(unit.building._id);
  });

  for (const conflict of conflictingTrains) {
    await removeTrain(villageName, conflict.unitName);
  }

  const newTrain = new TrainModel({ villageName, unitName });
  await newTrain.save();

  return newTrain;
};

module.exports = {
  getTrainList,
  clearVillage,
  removeTrain,
  insertTrain,
};
