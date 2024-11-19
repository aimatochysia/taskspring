const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, async (req, res) => {
    const { task_title, task_description, started_at, end_at, repeatable, repeat_options } = req.body;

    if (!task_title || !started_at || !end_at) {
        return res.status(400).json({ message: 'Task title, start date, and end date are required.' });
    }

    try {
        const newTask = new Task({
            user_email: req.user.user_email,
            task_title,
            task_description,
            started_at,
            end_at,
            repeatable,
            repeat_options: repeatable ? repeat_options : null,
        });

        const savedTask = await newTask.save();
        res.status(201).json({ message: 'Task created successfully.', task: savedTask });
    } catch (error) {
        res.status(500).json({ message: 'Error creating task.', error: error.message });
    }
});




router.get('/all', protect, async (req, res) => {
    try {
        const tasks = await Task.find({ user_email: req.user.user_email });
        res.status(200).json({ tasks });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks.', error: error.message });
    }
});

router.get('/repeatable', protect, async (req, res) => {
    try {
        const tasks = await Task.find({ user_email: req.user.user_email, repeatable: true });
        res.status(200).json({ tasks });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching repeatable tasks.', error: error.message });
    }
});


router.put('/:taskId', protect, async (req, res) => {
    const { taskId } = req.params;
    const { task_title, task_description, end_at } = req.body;

    try {
        const task = await Task.findOne({ _id: taskId, user_email: req.user.user_email });

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        task.task_title = task_title || task.task_title;
        task.task_description = task_description || task.task_description;
        task.end_at = end_at || task.end_at;

        const updatedTask = await task.save();
        res.status(200).json({ message: 'Task updated successfully.', task: updatedTask });
    } catch (error) {
        res.status(500).json({ message: 'Error updating task.', error: error.message });
    }
});

router.delete('/:taskId', protect, async (req, res) => {
    const { taskId } = req.params;

    try {
        const task = await Task.findOneAndDelete({ _id: taskId, user_email: req.user.user_email });

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        res.status(200).json({ message: 'Task deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task.', error: error.message });
    }
});

module.exports = router;
