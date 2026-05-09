const Class   = require('../models/Class');
const Student = require('../models/Student');

exports.getClasses = async (req,res)=>{
  const classes = await Class.find()
    .populate('classTeacher','name email')
    .populate('subjects','name code')
    .populate('studentCount')
    .sort({name:1,section:1})
  res.json({success:true,count:classes.length,data:classes});
};

exports.getClass = async (req,res)=>{
  const cls = await Class.findById(req.params.id)
    .populate('classTeacher subjects studentCount');
  if (!cls) return res.status(404).json({ success: false, message: 'Class not found.'});
  res.json({success:true,data:cls});
};
exports.createClass = async (req, res)=>{
  const cls = await Class.create(req.body);
  res.status(201).json({ success: true, message:'Class created.',data:cls});
};
exports.updateClass = async (req, res)=>{
  const cls = await Class.findByIdAndUpdate(req.params.id, req.body,{new:true,runValidators:true});
  if (!cls) return res.status(404).json({success:false,message:'Class not found.'});
  res.json({ success:true,data:cls});
};

exports.deleteClass = async (req,res)=>{
  const cls = await Class.findById(req.params.id);
  if (!cls) return res.status(404).json({ success:false,message:'Class not found.'});
  const studentCount = await Student.countDocuments({class:req.params.id});
  if (studentCount > 0) return res.status(400).json({success:false,message:`Cannot delete class with ${studentCount}students.`});
  await cls.deleteOne();
  res.json({success:true,message:'Class deleted.'});
};

module.exports.classController = {getClasses:exports.getClasses,getClass:exports.getClass,createClass:exports.createClass,updateClass: exports.updateClass, deleteClass:exports.deleteClass};
