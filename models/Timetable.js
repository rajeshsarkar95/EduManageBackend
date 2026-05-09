const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  periodNumber: { type: Number, required: true},
  startTime:    { type: String, required: true},  
  endTime:      { type: String, required: true},
  subject:      { type: mongoose.Schema.Types.ObjectId,ref:'Subject'},
  teacher:      { type: mongoose.Schema.Types.ObjectId,ref:'Teacher'},
  room:         { type: String },
  type:         { type: String, enum: ['class','break','assembly','free'], default: 'class' },
}, { _id: false });

const dayScheduleSchema = new mongoose.Schema({
  day:     { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], required: true },
  periods: [periodSchema],
}, { _id: false });

const timetableSchema = new mongoose.Schema({
  class:   { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  session: { type: String, default: '2024-25' },
  schedule: [dayScheduleSchema],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

timetableSchema.index({ class: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
