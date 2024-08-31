const TaskModel = require("../schemas/taskSchema");

const isActive = async (name) => {
  const filter = { name };
  const task = await TaskModel.findOne(filter);
  return task ? task.isActive : null;
};

const upsert = async (name, status) => {
  const filter = { name };
  const update = { isActive: status };
  const options = { new: true, upsert: true, runValidators: true };

  return await TaskModel.findOneAndUpdate(filter, update, options);
};

module.exports = { isActive, upsert };
