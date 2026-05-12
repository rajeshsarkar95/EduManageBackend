const Fee     = require('../models/Fee');
const Student = require('../models/Student');
const SmsLog  = require('../models/SmsLog');
const { sendSMS } = require('../utils/smsService');

exports.getFees = async (req,res)=>{
  const {classId,status,studentId,session} = req.query;
  const filter = {};
  if (classId)filter.class     = classId;
  if (status)filter.status     = status;
  if (studentId)filter.student = studentId;
  if (session)filter.session   = session;

  const fees = await Fee.find(filter)
    .populate('student','name rollNumber guardian')
    .populate('class','name section')
    .sort({ dueDate:1});
  res.json({success:true,count:fees.length,data:fees});
};

exports.getFee = async (req,res)=>{
  const fee = await Fee.findById(req.params.id)
    .populate('student class payments.collectedBy');
  if (!fee) return res.status(404).json({success:false,message:'Fee record not found.'});
  res.json({success:true,data:fee});
};

exports.createFee = async (req,res)=>{
  const fee = await Fee.create(req.body);
  res.status(201).json({success:true,message:'Fee record created.',data:fee});
};

exports.recordPayment = async (req,res)=>{
  const { amount, method, receiptNo, remarks } = req.body;
  const fee = await Fee.findById(req.params.id).populate('student','name guardian');
  if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found.'});
  fee.payments.push({amount,method,receiptNo,remarks,collectedBy:req.user.id});
  fee.paidAmount += amount;
  await fee.save();
  await Student.findByIdAndUpdate(fee.student._id,{feeStatus:fee.status});
  res.json({ success: true, message: `Payment of ₹${amount}recorded.`,data:fee});
};

exports.getFeeStats = async (req,res)=>{
  const stats = await Fee.aggregate([
    { $group:{
      _id: '$status',
      count:       { $sum:1},
      totalAmount: { $sum:'$totalAmount'},
      paidAmount:  { $sum:'$paidAmount'},
    }},
  ]);
  const totals = await Fee.aggregate([
    { $group:{
      _id:null,
      totalRevenue:{$sum: '$totalAmount'},
      collected:{$sum: '$paidAmount'},
    }},
  ]);
  res.json({success:true,data:{breakdown:stats,totals:totals[0]}});
};

exports.sendFeeReminders = async (req,res)=>{
  const fees = await Fee.find({ status: {$in:['pending','overdue']}})
  .populate('student', 'name rollNumber guardian');

  let sent = 0, failed = 0;

  for (const fee of fees){
    const msg = `Dear Parent, fee of ₹${fee.totalAmount - fee.paidAmount} is ${fee.status} for ${fee.student.name}. Due date: ${new Date(fee.dueDate).toLocaleDateString('en-IN')}. Please pay at the earliest.`;
    try {
      const result = await sendSMS(fee.student.guardian.phone,msg);
      await SmsLog.create({
        recipientType:'parent', recipientPhone: fee.student.guardian.phone,
        recipientName: fee.student.guardian.name, student: fee.student._id,
        message: msg, smsType: 'fee_reminder', status: result.success ? 'sent' : 'failed',
        sentAt: new Date(), sentBy: req.user.id,
      });
      if (result.success) sent++; else failed++;
    } catch {failed++;}
  }
  res.json({ success: true, message: `Reminders sent:${sent},Failed:${failed}`});
};
