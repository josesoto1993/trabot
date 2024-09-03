import TrainModel, { ITrainSchema } from "../schemas/trainSchema";
import { getUnit, IUnit } from "./unitService";

export interface ITrainUpsertData {
  villageName: string;
  unitName: string;
}
export interface ITrainUnit {
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

export const removeTrain = async (train: ITrainUpsertData): Promise<void> => {
  const filter = { villageName: train.villageName, unitName: train.unitName };
  await TrainModel.deleteOne(filter).exec();
};

const trainsInVillage = async (villageName: string): Promise<ITrainUnit[]> => {
  const filter = { villageName };

  const trainList: ITrainSchema[] = await TrainModel.find(filter).exec();

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

export const insertTrain = async (
  train: ITrainUpsertData
): Promise<ITrainSchema> => {
  const unit = await getUnit(train.unitName);
  if (!unit) {
    throw new Error(`Unit "${train.unitName}" not found`);
  }

  const existingTrainsInVillage = await trainsInVillage(train.villageName);

  const conflictingTrains = existingTrainsInVillage.filter(
    (existingTrain) => existingTrain.unit.building.name === unit.building.name
  );

  for (const conflict of conflictingTrains) {
    await removeTrain({
      villageName: train.villageName,
      unitName: conflict.unit.name,
    });
  }

  const newTrain = new TrainModel({
    villageName: train.villageName,
    unitName: train.unitName,
  });
  return await newTrain.save();
};
