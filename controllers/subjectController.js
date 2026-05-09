const Subject = require('../models/Subject');

exports.getSubjects = async (req, res) => {
  const subjects = await Subject.find().populate('classes','name section').populate('teachers','name').sort({ name: 1 });
  res.json({ success: true, count: subjects.length, data: subjects });
};

exports.getSubject = async (req, res) => {
  const subject = await Subject.findById(req.params.id).populate('classes teachers');
  if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });
  res.json({ success: true, data: subject });
};

exports.createSubject = async (req, res) => {
  const subject = await Subject.create(req.body);
  res.status(201).json({ success: true, data: subject });
};

exports.updateSubject = async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });
  res.json({ success: true, data: subject });
};

exports.deleteSubject = async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });
  res.json({ success: true, message: 'Subject deleted.' });
};
