import TaskModel, { ITaskSchema } from "../schemas/taskSchema";

export interface ITask extends ITaskSchema {}

export const isActive = async (name: string): Promise<boolean | null> => {
  const filter = { name };
  const task = await TaskModel.findOne(filter).exec();
  return task ? task.isActive : null;
};

export const upsert = async (
  name: string,
  status: boolean
): Promise<ITaskSchema | null> => {
  const filter = { name };
  const update = { isActive: status };
  const options = { new: true, upsert: true, runValidators: true };

  return await TaskModel.findOneAndUpdate(filter, update, options).exec();
};
