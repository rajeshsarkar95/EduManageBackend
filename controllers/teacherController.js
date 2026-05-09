const Teacher = require('../models/Teacher');

const getPagination = (req)=>{
  const page = Math.max(parseInt(req.query.page) || 1,1);
  const limit = Math.max(parseInt(req.query.limit) || 10,1);
  const skip = (page - 1) * limit;
  return {page,limit,skip};
};

exports.getTeachers = async (req,res)=>{
  try {
    const {page,limit,skip} = getPagination(req);
    const {search,status} = req.query;
    const filter = {};
    if (status)filter.status = status;
    if (search){
      filter.$or = [
        {name:{$regex: search, $options:'i'}},
        {email:{$regex: search, $options:'i'}},
        {subject:{$regex: search, $options:'i'}},
        {classes:{$regex: search, $options:'i'}},
      ];
    }

const [teachers,total] = await Promise.all([
      Teacher.find(filter)
        .sort({name:1})
        .skip(skip)
        .limit(limit),
      Teacher.countDocuments(filter),
    ]);
    res.json({
      success:true,
      count:teachers.length,
      total,
      page,
      data:teachers,
    });
  } catch (error){
    res.status(500).json({success:false,message: error.message});
  }
};

exports.getTeacher = async (req,res)=>{
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher){
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }
    res.json({success:true,data:teacher});
  } catch (error){
    res.status(500).json({ success:false,message:error.message});
  }
};

exports.createTeacher = async (req,res)=>{
  try {
    if (req.file){
      req.body.photo = `/uploads/photos/${req.file.filename}`;
    }
    if (req.body.classes && typeof req.body.classes === 'string'){
      req.body.classes = req.body.classes
        .split(',')
        .map(c => c.trim());
    }
    const teacher = await Teacher.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: teacher,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTeacher = async (req, res)=>{
  try {
    if (req.file){
      req.body.photo = `/uploads/photos/${req.file.filename}`;
    }
    if (req.body.classes && typeof req.body.classes === 'string'){
      req.body.classes = req.body.classes
        .split(',')
        .map(c => c.trim());
    }
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new:true,runValidators:true}
    );
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }
    res.json({
      success: true,
      message: 'Teacher updated successfully',
      data: teacher,
    });
  } catch (error){
    res.status(500).json({success:false,message:error.message});
  }
};

exports.deleteTeacher = async (req,res)=>{
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }
    res.json({
      success: true,
      message: 'Teacher deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req,res)=>{
  try {
    const [total, active, onLeave] = await Promise.all([
      Teacher.countDocuments(),
      Teacher.countDocuments({status:'Active'}),
      Teacher.countDocuments({status:'On Leave'}),
    ]);
    res.json({
      success: true,
      data: {total,active,onLeave},
    });
  } catch (error){
    res.status(500).json({ success: false, message: error.message });
  }
};