const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [120, "Title must be at most 120 characters"],
    },
    time: {
      type: String,
      required: [true, "Task time is required"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM format"],
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    repeatType: {
      type: String,
      enum: ["none", "daily", "dates"],
      default: "none",
      index: true,
    },
    dueDate: {
      type: String,
      default: null,
      match: [/^\d{4}-\d{2}-\d{2}$/, "dueDate must be in YYYY-MM-DD format"],
    },
    repeatDates: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => value.every((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)),
        message: "repeatDates must contain dates in YYYY-MM-DD format",
      },
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastNotified: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ userId: 1, time: 1, completed: 1 });

module.exports = mongoose.model("Task", taskSchema);
