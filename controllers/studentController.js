const Student = require('../models/Student');
const { getPagination } = require('../utils/helpers');

exports.getStudents = async (req, res, next) => {
  try {
    const {page,limit,skip} = getPagination(req);
    const {
      search,
      class: classId,
      status,
      feeStatus,
      gender,
      session,
      category,
      sortBy,
      order,
    } = req.query;
    const filter = {isDeleted:false};
    if (classId)   filter.class     = classId;
    if (status)    filter.status    = status;
    if (feeStatus) filter.feeStatus = feeStatus;
    if (gender)    filter.gender    = gender;
    if (session)   filter.session   = session;
    if (category)  filter.category  = category;
    if (search){
      filter.$or = [
        { name:              { $regex: search, $options: 'i' } },
        { rollNumber:        { $regex: search, $options: 'i' } },
        { admissionNumber:   { $regex: search, $options: 'i' } },
        { studentNumber:     { $regex: search, $options: 'i' } },
        { 'guardian.phone':  { $regex: search, $options: 'i' } },
        { 'guardian.name':   { $regex: search, $options: 'i' } },
      ];
    }
    const sortField = sortBy || 'rollNumber';
    const sortOrder = order === 'desc' ? -1 : 1;
    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('class', 'name section')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      Student.countDocuments(filter),
    ]);
    res.json({
      success: true,
      count:   students.length,
      total,
      page,
      pages:Math.ceil(total / limit),
      data:students,
    });
  } catch (error) {
    next(error);
  }
};
exports.getStudent = async (req,res,next) => {
  try {
    const student = await Student.findOne({
      _id:req.params.id,
      isDeleted:false,
    })
      .populate('class','name section')
      .lean({ virtuals:true});
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    res.json({ success: true, data: student });
  } catch (error){
    next(error);
  }
};
exports.createStudent = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.photo = `${process.env.BASE_URL || ''}/uploads/photos/${req.file.filename}`;
    }
    const student = await Student.create(req.body);
    const populated = await Student.findById(student._id)
      .populate('class','name section')
      .lean({ virtuals:true});
    res.status(201).json({
      success:true,
      message:'Student created successfully.',
      data:populated,
    });
  } catch (error) {
    next(error);
  }
};
exports.updateStudent = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.photo = `${process.env.BASE_URL || ''}/uploads/photos/${req.file.filename}`;
    }
    const student = await Student.findOne({
      _id:       req.params.id,
      isDeleted: false,
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    Object.assign(student, req.body);
    await student.save();
    const updated = await Student.findById(student._id)
      .populate('class', 'name section')
      .lean({ virtuals: true });
    res.json({
      success: true,
      message: 'Student updated successfully.',
      data:    updated,
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      _id:       req.params.id,
      isDeleted: false,
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    student.isDeleted = true;
    await student.save();
    res.json({ success: true, message: 'Student deleted successfully.' });
  } catch (error){
    next(error);
  }
};
exports.getStudentsByClass = async (req,res,next) => {
  try {
    const students = await Student.find({
      class:     req.params.classId,
      status:    'active',
      isDeleted: false,
    })
      .populate('class', 'name section')
      .sort({ rollNumber: 1 })
      .lean({ virtuals: true });

    res.json({
      success: true,
      count:   students.length,
      data:    students,
    });
  } catch (error) {
    next(error);
  }
};
exports.getStats = async (req,res,next) => {
  try {
    const baseFilter = { isDeleted: false };
    const [
      total,
      active,
      feeRaw,
      statusRaw,
      genderRaw,
      categoryRaw,
    ] = await Promise.all([
      Student.countDocuments(baseFilter),
      Student.countDocuments({ ...baseFilter, status: 'active' }),
      Student.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$feeStatus', count: { $sum: 1 } } },
      ]),
      Student.aggregate([
        { $match: baseFilter },
        { $group: {_id: '$status',count: { $sum: 1 } } },
      ]),
      Student.aggregate([
        { $match:baseFilter},
        { $group: { _id: '$gender',count: { $sum: 1 } } },
      ]),
      Student.aggregate([
        { $match:baseFilter },
        { $group:{_id:'$category',count: { $sum: 1 } } },
      ]),
    ]);
    const toMap = (arr) =>
    arr.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {});
    res.json({
      success: true,
      data:{
        total,
        active,
        feeBreakdown:toMap(feeRaw),
        statusBreakdown:toMap(statusRaw),
        genderBreakdown:toMap(genderRaw),
        categoryBreakdown:toMap(categoryRaw),
      },
    });
  } catch (error) {
    next(error);
  }
};