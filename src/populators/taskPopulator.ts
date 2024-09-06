import TaskNames from "../constants/taskNames";
import { isTaskActive, upsertTask } from "../services/taskService";

const populateTasks = async (): Promise<void> => {
  console.log("start populate tasks");

  for (const taskName of Object.values(TaskNames)) {
    try {
      const taskStatus = await isTaskActive(taskName);
      if (taskStatus === null) {
        await upsertTask({ name: taskName, status: true });
        console.log(`Inserted task "${taskName}" with default active status.`);
      }
    } catch (error) {
      console.error(`Error processing task "${taskName}":`, error);
    }
  }

  console.log("finish populate tasks");
};

export default populateTasks;
