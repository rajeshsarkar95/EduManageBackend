const mongoose = require('mongoose');

// One document = one class's attendance for one date
const attendanceSchema = new mongoose.Schema({
  class:   { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  date:    { type: Date, required: true },
  session: { type: String, default: '2024-25' },

  // Marked by which teacher
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  markedAt: { type: Date, default: Date.now },

  // Array of student attendance records
  records: [{
    student: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'holiday'],
      default: 'present',
    },
    remark: { type: String },
    // Track SMS notification
    smsSent: { type: Boolean, default: false },
    smsTime: { type: Date },
  }],

  // Holiday / note for the day
  note: { type: String },
}, { timestamps: true });

// ── Ensure one attendance record per class per date ────────
attendanceSchema.index({ class: 1, date: 1 }, { unique: true });

// ── Statics ───────────────────────────────────────────────

// Get attendance % for a student in a date range
attendanceSchema.statics.getStudentAttendance = async function (studentId, startDate, endDate) {
  const records = await this.find({
    date: { $gte: startDate, $lte: endDate },
    'records.student': studentId,
  });

  let total = 0, present = 0, absent = 0, late = 0;

  records.forEach(doc => {
    const record = doc.records.find(r => r.student.toString() === studentId.toString());
    if (record) {
      total++;
      if (record.status === 'present') present++;
      else if (record.status === 'absent') absent++;
      else if (record.status === 'late') late++;
    }
  });

  return {
    total, present, absent, late,
    percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0,
  };
};

module.exports = mongoose.model('Attendance', attendanceSchema);
