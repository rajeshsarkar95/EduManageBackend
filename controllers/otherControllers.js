const Timetable = require('../models/Transport');

exports.getTimetable = async (req,res)=>{
  const { classId } = req.params;
  const tt = await Timetable.findOne({class:classId,isActive:true})
    .populate('schedule.periods.subject','name code')
    .populate('schedule.periods.teacher','name');
  if (!tt) return res.status(404).json({success:false,message:'Timetable not found.'});
  res.json({success:true,data:tt});
};

exports.getAllTimetables = async (req,res)=>{
  const tts = await Timetable.find().populate('class','name section').sort({ createdAt: -1 });
  res.json({ success: true, count: tts.length, data: tts });
};

exports.createTimetable = async (req,res)=>{
  req.body.createdBy = req.user.id;
  const tt = await Timetable.findOneAndUpdate(
    { class: req.body.class, session: req.body.session || '2024-25' },
    req.body, { new: true, upsert: true, runValidators: true }
  );
  res.status(201).json({success:true,message:'Timetable saved.',data:tt});
};

exports.deleteTimetable = async (req,res)=>{
  await Timetable.findByIdAndDelete(req.params.id);
  res.json({success:true,message:'Timetable deleted.'});
};

const Book    = require('../models/Book');
const Student = require('../models/Student');

exports.getBooks = async (req, res) => {
  const { search, category, status } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (status)   filter.status   = status;
  if (search)   filter.$text    = { $search:search};
  const books = await Book.find(filter).sort({ title: 1 });
  res.json({ success: true, count: books.length, data: books });
};

exports.getBook = async (req, res) => {
  const book = await Book.findById(req.params.id)
    .populate('issueHistory.student', 'name rollNumber');
  if (!book) return res.status(404).json({success:false,message:'Book not found.'});
  res.json({success:true,data:book});
};

exports.createBook = async (req, res) => {
  const book = await Book.create(req.body);
  res.status(201).json({ success: true, data: book });
};
exports.updateBook = async (req, res)=>{
  const book = await Book.findByIdAndUpdate(req.params.id,req.body,{new:true});
  if (!book) return res.status(404).json({success: false,message:'Book not found.'});
  res.json({ success:true,data:book});
};

exports.issueBook = async (req, res) => {
  const { studentId, dueDate } = req.body;
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
  if (book.availableCopies < 1) return res.status(400).json({ success: false, message: 'No copies available.' });

  book.issueHistory.push({ student: studentId, issuedBy: req.user.id, dueDate, status: 'issued' });
  book.availableCopies -= 1;
  if (book.availableCopies === 0) book.status = 'all-issued';
  await book.save();
  res.json({ success: true, message: 'Book issued.', data: book });
};

exports.returnBook = async (req, res) => {
  const {issueId,fine} = req.body;
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
  const issue = book.issueHistory.id(issueId);
  if (!issue) return res.status(404).json({ success: false, message: 'Issue record not found.' });

  issue.returnDate = new Date();
  issue.status     = 'returned';
  issue.fine       = fine || 0;
  book.availableCopies += 1;
  book.status = 'available';
  await book.save();
  res.json({ success: true, message: 'Book returned.', data: book });
};

exports.deleteBook = async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Book deleted.'});
};

const Transport = require('../models/Transport');

exports.getRoutes = async (req, res) => {
  const routes = await Transport.find().populate('students', 'name rollNumber class').sort({ routeName: 1 });
  res.json({ success: true, count: routes.length, data: routes });
};

exports.getRoute = async (req, res) => {
  const route = await Transport.findById(req.params.id).populate('students', 'name rollNumber class guardian');
  if (!route) return res.status(404).json({ success: false, message: 'Route not found.' });
  res.json({ success: true, data: route });
};

exports.createRoute = async (req, res) => {
  const route = await Transport.create(req.body);
  res.status(201).json({ success: true, data: route });
};

exports.updateRoute = async (req, res) => {
  const route = await Transport.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!route) return res.status(404).json({ success: false, message: 'Route not found.' });
  res.json({ success: true, data: route });
};

exports.deleteRoute = async (req, res) => {
  await Transport.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Route deleted.' });
};

exports.assignStudent = async (req,res)=>{
  const { studentId } = req.body;
  const route = await Transport.findByIdAndUpdate(
    req.params.id,
    {$addToSet: { students:studentId}},
    {new:true}
  );
  if (!route) return res.status(404).json({ success: false, message: 'Route not found.' });
  res.json({ success: true, message: 'Student assigned to route.', data: route });
};

module.exports = {
  getTimetable: exports.getTimetable,
  getAllTimetables: exports.getAllTimetables,
  createTimetable: exports.createTimetable,
  deleteTimetable: exports.deleteTimetable,
  getBooks: exports.getBooks,
  getBook:  exports.getBook,
  createBook: exports.createBook,
  updateBook: exports.updateBook,
  issueBook:  exports.issueBook,
  returnBook: exports.returnBook,
  deleteBook: exports.deleteBook,
  getRoutes:     exports.getRoutes,
  getRoute:      exports.getRoute,
  createRoute:   exports.createRoute,
  updateRoute:   exports.updateRoute,
  deleteRoute:   exports.deleteRoute,
  assignStudent: exports.assignStudent,
};
