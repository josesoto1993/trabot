import TaskModel, { ITaskSchema } from "../schemas/taskSchema";

export interface ITaskUpsertData {
  name: string;
  status: boolean;
}
export interface ITask extends ITaskSchema {}

export const isTaskActive = async (name: string): Promise<boolean | null> => {
  const filter = { name };
  const task = await TaskModel.findOne(filter).exec();
  return task ? task.isActive : null;
};

export const upsertTask = async (
  data: ITaskUpsertData
): Promise<ITaskSchema | null> => {
  const filter = { name: data.name };
  const update = { isActive: data.status };
  const options = { new: true, upsert: true, runValidators: true };

  return await TaskModel.findOneAndUpdate(filter, update, options).exec();
};
