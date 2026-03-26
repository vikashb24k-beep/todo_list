const mongoose = require("mongoose");
const Task = require("../models/Task");

function isValidTimeFormat(value) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function isValidDateFormat(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function sanitizeDateList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((date) => String(date).trim()).filter(Boolean))];
}

function validateTaskInput({ title, time, priority, repeatType, dueDate, repeatDates }) {
  if (!title || !time) {
    return "Title and time are required.";
  }

  if (!isValidTimeFormat(time)) {
    return "Time must be in HH:MM format.";
  }

  if (priority && !["low", "medium", "high"].includes(priority)) {
    return "Priority must be low, medium, or high.";
  }

  if (!repeatType || !["none", "daily", "dates"].includes(repeatType)) {
    return "repeatType must be none, daily, or dates.";
  }

  if (repeatType === "none") {
    if (!dueDate || !isValidDateFormat(dueDate)) {
      return "A valid due date is required for one-time tasks.";
    }
  }

  if (repeatType === "dates") {
    if (!Array.isArray(repeatDates) || repeatDates.length === 0) {
      return "Please select at least one repeat date.";
    }

    const hasInvalidDate = repeatDates.some((date) => !isValidDateFormat(date));
    if (hasInvalidDate) {
      return "Repeat dates must be in YYYY-MM-DD format.";
    }
  }

  return null;
}

exports.createTask = async (req, res) => {
  try {
    const { title, time, priority } = req.body;
    const repeatType = req.body.repeatType || "none";
    const dueDate = req.body.dueDate || null;
    const repeatDates = sanitizeDateList(req.body.repeatDates);

    const validationError = validateTaskInput({
      title,
      time,
      priority,
      repeatType,
      dueDate,
      repeatDates,
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const task = await Task.create({
      userId: req.user.userId,
      title: title.trim(),
      time,
      priority: priority || "medium",
      repeatType,
      dueDate: repeatType === "none" ? dueDate : null,
      repeatDates: repeatType === "dates" ? repeatDates : [],
    });

    return res.status(201).json(task);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Failed to create task." });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { priority, completed } = req.query;
    const filters = { userId: req.user.userId };

    if (priority && ["low", "medium", "high"].includes(priority)) {
      filters.priority = priority;
    }

    if (completed === "true" || completed === "false") {
      filters.completed = completed === "true";
    }

    const tasks = await Task.find(filters).sort({ completed: 1, time: 1, createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch tasks." });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task id." });
    }

    const existingTask = await Task.findOne({ _id: id, userId: req.user.userId });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found." });
    }

    const updates = {};

    const hasTitle = typeof req.body.title === "string";
    const hasTime = typeof req.body.time === "string";
    const hasPriority = typeof req.body.priority === "string";
    const hasRepeatType = typeof req.body.repeatType === "string";
    const hasDueDate = req.body.dueDate !== undefined;
    const hasRepeatDates = req.body.repeatDates !== undefined;

    if (hasTitle) {
      updates.title = req.body.title.trim();
    }

    if (hasTime) {
      if (!isValidTimeFormat(req.body.time)) {
        return res.status(400).json({ message: "Time must be in HH:MM format." });
      }
      updates.time = req.body.time;
      updates.lastNotified = null;
    }

    if (hasPriority) {
      if (!["low", "medium", "high"].includes(req.body.priority)) {
        return res.status(400).json({ message: "Priority must be low, medium, or high." });
      }
      updates.priority = req.body.priority;
    }

    const finalRepeatType = hasRepeatType ? req.body.repeatType : existingTask.repeatType || "none";
    const finalDueDate = hasDueDate ? req.body.dueDate : existingTask.dueDate;
    const finalRepeatDates = hasRepeatDates
      ? sanitizeDateList(req.body.repeatDates)
      : existingTask.repeatDates || [];

    if (hasRepeatType && !["none", "daily", "dates"].includes(req.body.repeatType)) {
      return res.status(400).json({ message: "repeatType must be none, daily, or dates." });
    }

    if (finalRepeatType === "none") {
      if (!finalDueDate || !isValidDateFormat(finalDueDate)) {
        return res.status(400).json({ message: "A valid due date is required for one-time tasks." });
      }
    }

    if (finalRepeatType === "dates") {
      if (!Array.isArray(finalRepeatDates) || finalRepeatDates.length === 0) {
        return res.status(400).json({ message: "Please select at least one repeat date." });
      }

      const hasInvalidDate = finalRepeatDates.some((date) => !isValidDateFormat(date));
      if (hasInvalidDate) {
        return res.status(400).json({ message: "Repeat dates must be in YYYY-MM-DD format." });
      }
    }

    if (hasRepeatType || hasDueDate || hasRepeatDates) {
      updates.repeatType = finalRepeatType;
      updates.dueDate = finalRepeatType === "none" ? finalDueDate : null;
      updates.repeatDates = finalRepeatType === "dates" ? finalRepeatDates : [];
      updates.lastNotified = null;
    }

    if (typeof req.body.completed === "boolean") {
      updates.completed = req.body.completed;
      if (req.body.completed === true) {
        updates.lastNotified = new Date();
      }
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      updates,
      { new: true, runValidators: true }
    );

    return res.status(200).json(task);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Failed to update task." });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task id." });
    }

    const deletedTask = await Task.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found." });
    }

    return res.status(200).json({ message: "Task deleted successfully." });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to delete task." });
  }
};
