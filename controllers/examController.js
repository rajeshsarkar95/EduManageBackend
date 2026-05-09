const Exam = require('../models/Exam');

exports.getExams = async (req,res)=>{
  try {
    const {classId,status,subject} = req.query;
    const filter = {};
    if (classId) filter.class = classId;
    if (status) filter.status = status;
    if (subject) filter.subject = subject;
    const exams = await Exam.find(filter)
      .sort({ examDate: 1 });
    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }
    res.status(200).json({
      success: true,
      data: exam
    });
  } catch (error){
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createExam = async (req,res)=>{
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Exam scheduled successfully',
      data:exam
    });
  } catch (error){
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
exports.updateExam = async (req,res)=>{
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Exam updated successfully',
      data: exam
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
exports.deleteExam = async (req,res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam){
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error){
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};