const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },       // e.g. "Mathematics"
  code:     { type: String, required: true, uppercase: true, unique: true },  // e.g. "MATH10"
  type:     { type: String, enum: ['theory','practical','both'], default: 'theory' },
  fullMarks: { type: Number, default: 100 },
  passMarks: { type: Number, default: 33 },
  classes:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }],
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
