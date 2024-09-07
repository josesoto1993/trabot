import mongoose, { Document, Model, Schema } from "mongoose";
import TaskNames from "../constants/taskNames";

export interface ITaskSchema extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  name: TaskNames;
  isActive: boolean;
  interval: number;
}

const TaskSchema: Schema<ITaskSchema> = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    enum: Object.values(TaskNames),
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  interval: {
    type: Number,
    required: false,
  },
});

const TaskModel: Model<ITaskSchema> = mongoose.model<ITaskSchema>(
  "Task",
  TaskSchema
);

export default TaskModel;
