import TaskNames from "../constants/taskNames";
import { isTaskActive, upsertTask } from "../services/taskService";
import { formatTimeMillis } from "../utils/timePrint";

const populateTasks = async (): Promise<void> => {
  console.log("start populate tasks");

  for (const taskName of Object.values(TaskNames)) {
    try {
      const taskStatus = await isTaskActive(taskName);
      if (taskStatus === null) {
        const status = true;
        const interval = getDefaultInterval(taskName);
        await upsertTask({
          taskName,
          status,
          interval,
        });
        console.log(
          `Inserted task "${taskName}" with default active status and interval: ${formatTimeMillis(interval)}`
        );
      }
    } catch (error) {
      console.error(`Error processing task "${taskName}":`, error);
    }
  }

  console.log("finish populate tasks");
};

const getDefaultInterval = (taskName: TaskNames): number => {
  switch (taskName) {
    case TaskNames.DEFICIT:
      return 13 * 60 * 1000;
    case TaskNames.OVERFLOW:
      return 14 * 60 * 1000;
    case TaskNames.ATTACK_FARMS:
      return 5 * 60 * 1000;
    case TaskNames.TRAIN_TROOPS:
      return 4 * 60 * 60 * 1000;
    case TaskNames.UPGRADE_TROOPS:
      return 0;
    case TaskNames.GO_ADVENTURE:
      return 15 * 60 * 1000;
    case TaskNames.BUILD:
      return 15 * 60 * 1000;
    case TaskNames.REDEEM:
      return 60 * 60 * 1000;
    case TaskNames.CELEBRATIONS:
      return 4 * 60 * 60 * 1000;
    case TaskNames.MAP_SCANNER:
      return 15 * 60 * 1000;
    default:
      throw new Error(`Unknown task name: ${taskName}`);
  }
};

export default populateTasks;
