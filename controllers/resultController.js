const Result = require('../models/Result');

exports.getResults = async (req, res) => {
  const { examId, classId, studentId } = req.query;
  const filter = {};
  if (examId)    filter.exam    = examId;
  if (classId)   filter.class   = classId;
  if (studentId) filter.student = studentId;

  const results = await Result.find(filter)
    .populate('student','name rollNumber').populate('exam','name examDate')
    .populate('subject','name').populate('class','name section')
    .sort({ marksObtained: -1 });

  res.json({ success: true, count: results.length, data: results });
};

exports.createResult = async (req, res) => {
  req.body.enteredBy = req.user.id;
  const result = await Result.create(req.body);
  res.status(201).json({ success: true, data: result });
};

exports.bulkCreateResults = async (req, res) => {
  const { results } = req.body;
  const docs = results.map(r => ({ ...r, enteredBy: req.user.id }));
  const created = await Result.insertMany(docs, { ordered: false });
  res.status(201).json({ success: true, count: created.length, data: created });
};

exports.updateResult = async (req, res) => {
  const result = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!result) return res.status(404).json({ success: false, message: 'Result not found.' });
  res.json({ success: true, data: result });
};

exports.getStudentReport = async (req, res) => {
  const results = await Result.find({ student: req.params.studentId })
    .populate('exam subject class').sort({ createdAt: -1 });
  const avg = results.length ? (results.reduce((a,r) => a + r.percentage, 0) / results.length).toFixed(1) : 0;
  res.json({ success: true, data: { results, average: avg } });
};
