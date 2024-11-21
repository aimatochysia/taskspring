const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    task_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    user_email: { type: String, required: true, ref: 'User' },
    task_title: { type: String, required: true, maxlength: 20 },
    task_description: { type: String, maxlength: 1000 },
    created_at: { type: Date, default: Date.now },
    started_at: { type: Date, required: true },
    end_at: { type: Date, required: true },
    repeatable: { type: Boolean, default: false },
    repeat_options: {
        frequency: { type: String, enum: ['daily', 'weekly', 'hourly'], default: null },
        repeat_day: { type: [String], default: [] },
        repeat_hour: { type: Number, default: null },
    },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
