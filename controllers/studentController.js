const Student = require('../models/Student');
const { getPagination } = require('../utils/helpers');

exports.getStudents = async (req,res,next)=>{
  try {
    const {page,limit,skip} = getPagination(req);
    const {search,class:classId,status,feeStatus,gender,sortBy,order} = req.query;
    const filter = { isDeleted:false};
    if (classId) filter.class = classId;
    if (status) filter.status = status;
    if (feeStatus) filter.feeStatus = feeStatus;
    if (gender) filter.gender = gender;
    if (search){
      filter.$or = [
        { name: {$regex:search,$options:'i'}},
        { rollNumber:{$regex: search,$options:'i'}},
        { 'guardian.phone':{$regex: search,$options:'i'}},
      ];
    }
    const sortField = sortBy || 'rollNumber';
    const sortOrder = order === 'desc' ? -1 : 1;
    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('class', 'name section')
        .sort({ [sortField]: sortOrder})
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
    ]);
    res.json({
      success: true,
      count: students.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: students,
    });
  } catch (error){
    next(error);
  }
};

exports.getStudent = async (req,res,next)=>{
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      isDeleted:false,
    })
      .populate('class','name section')
      .lean();
    if (!student){
      return res.status(404).json({success:false,message:'Student not found.'});
    }
    res.json({success:true,data:student});
  } catch (error){
    next(error);
  }
};

exports.createStudent = async (req,res,next)=>{
  try {
    if (req.file){
      req.body.photo = `${process.env.BASE_URL || ''}/uploads/photos/${req.file.filename}`;
    }
    const student = await Student.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Student created successfully.',
      data: student,
    });
  } catch (error){
    next(error);
  }
};
exports.updateStudent = async (req,res,next)=>{
  try { 
    if (req.file){
      req.body.photo = `${process.env.BASE_URL || ''}/uploads/photos/${req.file.filename}`;
    }
    const student = await Student.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!student){
      return res.status(404).json({success:false,message:'Student not found.'});
    }
    Object.assign(student,req.body);
    await student.save();
    const updatedStudent = await Student.findById(student._id)
      .populate('class','name section')
      .lean();
    res.json({
      success:true,
      message:'Student updated successfull.',
      data: updatedStudent,
    });
  } catch (error){
    next(error);
  }
};

exports.deleteStudent = async (req,res,next)=>{
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!student){
      return res.status(404).json({success:false,message:'Student not found.'});
    }
    student.isDeleted = true;
    await student.save();
    res.json({
      success:true,
      message:'Student deleted successfully.',
    });
  } catch (error){
    next(error);
  }
};

exports.getStudentsByClass = async (req,res,next) => {
  try {
    const students = await Student.find({
      class: req.params.classId,
      status: 'active',
      isDeleted: false,
    })
      .populate('class', 'name section')
      .sort({ rollNumber:1})
      .lean();
    res.json({
      success:true,
      count:students.length,
      data:students,
    });
  } catch (error){
    next(error);
  }
};

exports.getStats = async (req,res,next)=>{
  try {
    const baseFilter = {isDeleted:false};
    const [total,active,feeRaw,genderRaw] = await Promise.all([
      Student.countDocuments(baseFilter),
      Student.countDocuments({ ...baseFilter,status:'active'}),
      Student.aggregate([
        { $match:baseFilter},
        { $group: { _id: '$feeStatus',count:{$sum:1}}},
      ]),
      Student.aggregate([
        { $match:baseFilter},
        { $group:{_id:'$gender',count:{$sum:1}}},
      ]),
    ]);
    const feeBreakdown = {};
    feeRaw.forEach(item =>{
      feeBreakdown[item._id] = item.count;
    });
    const genderBreakdown = {};
    genderRaw.forEach(item =>{
      genderBreakdown[item._id] = item.count;
    });
    res.json({
      success:true,
      data:{
        total,
        active,
        feeBreakdown,
        genderBreakdown,
      },
    });
  } catch (error){
    next(error);
  }
};