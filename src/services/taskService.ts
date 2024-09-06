import TaskNames from "../constants/taskNames";
import TaskModel, { ITaskSchema } from "../schemas/taskSchema";

export interface ITaskUpsertData {
  name: string;
  status?: boolean;
  interval?: number;
}
export interface ITask extends ITaskSchema {}

export const isTaskActive = async (
  name: TaskNames
): Promise<boolean | null> => {
  const filter = { name };
  const task = await TaskModel.findOne(filter).exec();
  return task ? task.isActive : null;
};

export const getTaskInterval = async (
  name: TaskNames
): Promise<number | null> => {
  const filter = { name };
  const task = await TaskModel.findOne(filter).exec();

  return task ? task.interval : null;
};

export const upsertTask = async (
  data: ITaskUpsertData
): Promise<ITaskSchema | null> => {
  const filter = { name: data.name };
  const update: any = {};
  if (data.status !== undefined) {
    update.isActive = data.status;
  }
  if (data.interval !== undefined) {
    update.interval = data.interval;
  }
  const options = { new: true, upsert: true, runValidators: true };

  return await TaskModel.findOneAndUpdate(filter, update, options).exec();
};
