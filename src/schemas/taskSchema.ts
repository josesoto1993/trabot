const mongoose = require("mongoose");
import { TaskNames } from "../constants/taskNames";

const TaskSchema = new mongoose.Schema({
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

const TaskModel = mongoose.model("Task", TaskSchema);

module.exports = TaskModel;
