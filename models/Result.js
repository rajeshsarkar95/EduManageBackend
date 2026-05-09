const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  exam:    { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  class:   { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  session: { type: String, default: '2024-25' },

  // ── Marks ─────────────────────────────────────────────────
  marksObtained: { type: Number, required: true, min: 0 },
  totalMarks:    { type: Number, required: true },
  theoryMarks:   { type: Number },
  practicalMarks:{ type: Number },

  // ── Grade (auto-calculated) ───────────────────────────────
  grade:      { type: String },
  percentage: { type: Number },
  isPassed:   { type: Boolean },
  rank:       { type: Number },

  remarks: { type: String },
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ── Unique: one result per student per exam ────────────────
resultSchema.index({ student: 1, exam: 1 }, { unique: true });

// ── Auto-calculate grade & percentage before save ──────────
resultSchema.pre('save', function (next) {
  this.percentage = parseFloat(((this.marksObtained / this.totalMarks) * 100).toFixed(2));
  this.isPassed   = this.marksObtained >= (this.totalMarks * 0.33);

  const p = this.percentage;
  if (p >= 90)      this.grade = 'A+';
  else if (p >= 80) this.grade = 'A';
  else if (p >= 70) this.grade = 'B+';
  else if (p >= 60) this.grade = 'B';
  else if (p >= 50) this.grade = 'C+';
  else if (p >= 40) this.grade = 'C';
  else if (p >= 33) this.grade = 'D';
  else              this.grade = 'F';

  next();
});

module.exports = mongoose.model('Result', resultSchema);
