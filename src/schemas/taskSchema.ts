import mongoose, { Document, Model, Schema } from "mongoose";
import { TaskNames } from "../constants/taskNames";

export interface ITaskSchema extends Document {
  name: keyof typeof TaskNames;
  isActive: boolean;
}

const TaskSchema: Schema<ITaskSchema> = new Schema({
  name: {
    type: String,
    enum: Object.values(TaskNames),
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const TaskModel: Model<ITaskSchema> = mongoose.model<ITaskSchema>(
  "Task",
  TaskSchema
);

export default TaskModel;
