import TrainModel, { ITrainSchema } from "../schemas/trainSchema";
import { getUnit, IUnit } from "./unitService";

interface ITrainUnit {
  villageName: string;
  unit: IUnit;
}

export const getTrainList = async (): Promise<ITrainUnit[]> => {
  const trainList: ITrainSchema[] = await TrainModel.find().exec();

  const populatedTrainList = await Promise.all(
    trainList.map(async (train) => {
      const unit = await getUnit(train.unitName);
      if (!unit) {
        throw new Error(`Unit "${train.unitName}" not found`);
      }
      return {
        villageName: train.villageName,
        unit: unit,
      };
    })
  );

  return populatedTrainList;
};

export const clearVillage = async (villageName: string): Promise<void> => {
  const filter = { villageName };
  await TrainModel.deleteMany(filter).exec();
};

export const removeTrain = async (
  villageName: string,
  unitName: string
): Promise<void> => {
  const filter = { villageName, unitName };
  await TrainModel.deleteOne(filter).exec();
};

const trainsInVillage = async (
  villageName: string
): Promise<ITrainSchema[]> => {
  const filter = { villageName };
  return await TrainModel.find(filter).exec();
};

export const insertTrain = async (
  villageName: string,
  unitName: string
): Promise<ITrainSchema> => {
  const unit = await getUnit(unitName);
  if (!unit) {
    throw new Error(`Unit "${unitName}" not found`);
  }

  const existingTrainsInVillage = await trainsInVillage(villageName);

  const conflictingTrains = await Promise.all(
    existingTrainsInVillage.map(async (train) => {
      const existingUnit = await getUnit(train.unitName);
      return existingUnit && existingUnit.building.name === unit.building.name
        ? train
        : null;
    })
  );

  for (const conflict of conflictingTrains.filter(Boolean)) {
    await removeTrain(villageName, conflict.unitName);
  }

  const newTrain = new TrainModel({ villageName, unitName });
  await newTrain.save();

  return newTrain;
};
