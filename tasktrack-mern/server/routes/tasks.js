import express from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";

const router = express.Router();

// GET /api/tasks — return newest tasks first.
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Could not load tasks." });
  }
});

// POST /api/tasks — validate and save a new task.
router.post("/", async (req, res) => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const description = typeof req.body.description === "string" ? req.body.description.trim() : "";

    if (!title) {
      return res.status(400).json({ message: "Please enter a task title." });
    }

    const task = await Task.create({ title, description });
    res.status(201).json(task);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Could not create the task." });
  }
});

// PATCH /api/tasks/:id — update completion status.
router.patch("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    if (typeof req.body.completed !== "boolean") {
      return res.status(400).json({ message: "completed must be true or false." });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { completed: req.body.completed },
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Could not update the task." });
  }
});

// DELETE /api/tasks/:id — remove a task.
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    res.json({ message: "Task deleted." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete the task." });
  }
});

export default router;
