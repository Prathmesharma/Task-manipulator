const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect, adminOnly } = require('../middleware/auth');

// Get all tasks (Admin sees all, Member sees assigned)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Member') {
      query.assignedTo = req.user.id;
    }
    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create task (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, dueDate, project, assignedTo } = req.body;
    const task = new Task({
      title,
      description,
      dueDate,
      project,
      assignedTo: assignedTo || null
    });
    await task.save();
    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name');
    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update task status (Admin or Assigned Member)
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Check permissions
    if (req.user.role !== 'Admin' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    if (req.body.status) task.status = req.body.status;
    
    // Only admin can reassign or change other details
    if (req.user.role === 'Admin') {
      if (req.body.title) task.title = req.body.title;
      if (req.body.description) task.description = req.body.description;
      if (req.body.dueDate) task.dueDate = req.body.dueDate;
      if (req.body.assignedTo) task.assignedTo = req.body.assignedTo;
    }

    await task.save();
    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name');
    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete task (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
