const Fee     = require('../models/Fee');
const Student = require('../models/Student');
const Class   = require('../models/Class');   
const SmsLog  = require('../models/SmsLog');

const { sendSMS } = require('../utils/smsService');
exports.getFees = async (req,res)=>{
  try {                                         
    const {classId,status,studentId,session} = req.query;
    const filter = {};
    if (classId)   filter.class   = classId;
    if (status)    filter.status  = status;
    if (studentId) filter.student = studentId;
    if (session)   filter.session = session;
    const fees = await Fee.find(filter)
      .populate('student','name rollNumber guardian')
      .populate('class', 'name section')
      .sort({ dueDate:1});
    res.json({success:true,count:fees.length,data:fees});
  } catch (err){
    res.status(500).json({success:false,message:err.message});
  }
};
exports.getFee = async (req,res)=>{
  try {                                         
    const fee = await Fee.findById(req.params.id)
      .populate('student class payments.collectedBy');
    if (!fee) return res.status(404).json({success: false,message:'Fee record not found.'});
    res.json({success:true,data:fee});
  } catch (err){
    res.status(500).json({success:false,message: err.message});
  }
};
exports.createFee = async (req,res)=>{
  try {
    const {student,class:className,session,totalAmount,paidAmount,status,dueDate} = req.body;
    let studentDoc;
    if (student.match(/^[0-9a-fA-F]{24}$/)){
      studentDoc = await Student.findById(student);
    } else {
      studentDoc = await Student.findOne({ name: new RegExp(`^${student}$`, 'i')});
      if (!studentDoc){
        const allStudents = await Student.find({},'name _id');
        studentDoc = allStudents.find(s =>
          s.name.replace(/\s+/g, '').toLowerCase() === student.replace(/\s+/g, '').toLowerCase()
        );
      }
    }
    if (!studentDoc){
      const allStudents = await Student.find({},'name _id');
      const names = allStudents.map(s => s.name);
      return res.status(404).json({
        success: false,
        message: `Student not found. Available students: ${names.join(',')}`
      });
    }
    let classDoc;
    if (className.match(/^[0-9a-fA-F]{24}$/)){
      classDoc = await Class.findById(className);
    } else {
      classDoc = await Class.findOne({name:new RegExp(`^${className}$`,'i')});
      if (!classDoc){
        const allClasses = await Class.find({},'name _id');
        classDoc = allClasses.find(c =>
          c.name.replace(/\s+/g, '').toLowerCase() === className.replace(/\s+/g,'').toLowerCase()
        );
      }
    }
    if (!classDoc){
      const allClasses = await Class.find({},'name _id');
      const names = allClasses.map(c => c.name);
      return res.status(404).json({
        success: false,
        message: `Class not found. Available classes: ${names.join(',')}`
      });
    }
    const fee = await Fee.create({
      student:studentDoc._id,
      class:classDoc._id,
      session,
      totalAmount,
      paidAmount:paidAmount ?? 0,
      status:status ?? 'pending',
      dueDate,
    });
    res.status(201).json({success:true,message:'Fee record created',data:fee});
  } catch (err){
    res.status(500).json({success:false,message:err.message});
  }
};
exports.recordPayment = async (req,res)=>{
  try {                                        
    const {amount,method,receiptNo,remarks} = req.body;
    const fee = await Fee.findById(req.params.id).populate('student', 'name guardian');
    if (!fee) return res.status(404).json({success:false,message:'Fee record not found.'});
    fee.payments.push({amount,method,receiptNo,remarks,collectedBy:req.user.id});
    fee.paidAmount += amount;
    await fee.save();
    await Student.findByIdAndUpdate(fee.student._id,{feeStatus:fee.status});
    res.json({ success: true, message: `Payment of ₹${amount} recorded.`,data:fee});
  } catch (err){
    res.status(500).json({success:false,message:err.message});
  }
};


exports.getFeeStats = async (req, res) => {
  try {
    const stats = await Fee.aggregate([
      { $group:{
        _id: '$status',
        count:       { $sum:1},
        totalAmount: { $sum:'$totalAmount'},
        paidAmount:  { $sum:'$paidAmount'},
      }},
    ]);
    const totals = await Fee.aggregate([
      { $group: {
        _id:          null,
        totalRevenue: {$sum:'$totalAmount'},
        collected:    {$sum:'$paidAmount'},
      }},
    ]);
    res.json({ success: true, data: { breakdown: stats, totals: totals[0] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendFeeReminders = async (req,res)=>{
  try {
    const fees = await Fee.find({ status:{$in:['pending','overdue']}})
      .populate('student','name rollNumber guardian');
    let sent = 0, failed = 0;
    for (const fee of fees){
      const msg = `Dear Parent, fee of ₹${fee.totalAmount - fee.paidAmount} is ${fee.status} for ${fee.student.name}. Due date: ${new Date(fee.dueDate).toLocaleDateString('en-IN')}. Please pay at the earliest.`;
      try {
        const result = await sendSMS(fee.student.guardian.phone,msg);
        await SmsLog.create({
          recipientType:  'parent',
          recipientPhone: fee.student.guardian.phone,
          recipientName:  fee.student.guardian.name,
          student:        fee.student._id,
          message:        msg,
          smsType:        'fee_reminder',
          status:         result.success ? 'sent' : 'failed',
          sentAt:         new Date(),
          sentBy:         req.user.id,
        });
        if (result.success) sent++; else failed++;
      } catch { failed++;}
    }
    res.json({ success: true, message: `Reminders sent: ${sent}, Failed: ${failed}`});
  } catch (err){
    res.status(500).json({ success: false,message:err.message});
  }
};

exports.deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found.' });

    const force = req.query.force === 'true';  

    if (!force && fee.paidAmount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete fee record with recorded payments of ₹${fee.paidAmount}. Use ?force=true to override.`
      });
    }

    await Fee.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Fee record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};