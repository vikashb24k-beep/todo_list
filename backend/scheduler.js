const cron = require("node-cron");
const Task = require("./models/Task");
const { sendTaskReminderEmail } = require("./utils/emailService");

function getCurrentHHMM() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getCurrentDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function getMinuteStart(date) {
  const minute = new Date(date);
  minute.setSeconds(0, 0);
  return minute;
}

function isTaskScheduledForToday(task, todayStamp) {
  if (task.repeatType === "daily") {
    return true;
  }

  if (task.repeatType === "dates") {
    return Array.isArray(task.repeatDates) && task.repeatDates.includes(todayStamp);
  }

  return task.dueDate === todayStamp;
}

function startScheduler() {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const currentTime = getCurrentHHMM();
      const todayStamp = getCurrentDateStamp();
      const minuteStart = getMinuteStart(now);

      const dueTasks = await Task.find({
        time: currentTime,
        completed: false,
        $or: [{ lastNotified: null }, { lastNotified: { $lt: minuteStart } }],
      }).populate("userId", "name email");

      const filteredDueTasks = dueTasks.filter((task) => isTaskScheduledForToday(task, todayStamp));

      for (const task of filteredDueTasks) {
        const user = task.userId;

        if (!user || !user.email) {
          continue;
        }

        try {
          await sendTaskReminderEmail({
            to: user.email,
            name: user.name || "there",
            title: task.title,
          });

          task.lastNotified = now;
          await task.save();
        } catch (emailError) {
          console.error(`[MAIL] Failed for task ${task._id}:`, emailError.message);
        }
      }
    } catch (error) {
      console.error("[CRON] Scheduler error:", error.message);
    }
  });

  console.log("[CRON] Reminder scheduler started (every minute)");
}

module.exports = startScheduler;
