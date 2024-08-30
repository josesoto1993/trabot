const TASK_NAMES = require("../constants/taskNames");
const { isActive, upsert } = require("../services/taskService");

const populateTasks = async () => {
  console.log("start populate tasks");

  for (const taskName of Object.values(TASK_NAMES)) {
    try {
      const taskStatus = await isActive(taskName);
      if (taskStatus === null) {
        await upsert(taskName, true);
        console.log(`Inserted task "${taskName}" with default active status.`);
      }
    } catch (error) {
      console.error(`Error processing task "${taskName}":`, error);
    }
  }

  console.log("finish populate tasks");
};

module.exports = populateTasks;
