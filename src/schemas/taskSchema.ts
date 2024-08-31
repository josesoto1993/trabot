const mongoose = require("mongoose");
const TASK_NAMES = require("../constants/taskNames");

const TaskSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: Object.values(TASK_NAMES),
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const TaskModel = mongoose.model("Task", TaskSchema);

module.exports = TaskModel;
