const Student    = require('../models/Student');
const Teacher    = require('../models/Teacher');
const Class      = require('../models/Class');
const Attendance = require('../models/Attendance');
const Fee        = require('../models/Fee');
const Notice     = require('../models/Notice');
const SmsLog     = require('../models/SmsLog');
const Exam       = require('../models/Exam');

exports.getStats = async (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0);

  const [
    totalStudents, totalTeachers, totalClasses,
    feeStats, noticeCount, smsSentToday,
    attendanceToday, upcomingExams,
  ] = await Promise.all([
    Student.countDocuments({status:'active'}),
    Teacher.countDocuments({status:'active'}),
    Class.countDocuments({isActive:true}),
    Fee.aggregate([{
      $group:{
        _id:null,
        totalAmount:{$sum:'$totalAmount'},
        paidAmount:{$sum:'$paidAmount'},
        pendingCount:{$sum: { $cond: [{ $in: ['$status', ['pending','overdue']] },1,0]}},
      }
    }]),

    Notice.countDocuments({ isPublished: true }),
    SmsLog.countDocuments({ status: 'sent', sentAt: { $gte: today }}),
    Attendance.findOne({ date: { $gte: today } }).sort({ createdAt: -1}),
    Exam.find({ status: 'upcoming', examDate: { $gte: new Date() }})
      .populate('class subject').sort({ examDate: 1 }).limit(5),
  ]);

  let presentToday = 0, absentToday = 0;
  if (attendanceToday) {
    presentToday = attendanceToday.records.filter(r => r.status === 'present').length;
    absentToday  = attendanceToday.records.filter(r => r.status === 'absent').length;
  }

  const feeData = feeStats[0] || {totalAmount:0,paidAmount:0,pendingCount:0};
  res.json({
    success: true,
    data: {
      students:{total:totalStudents,presentToday,absentToday},
      teachers:{total:totalTeachers},
      classes:{total:totalClasses},
      fees:{
        totalAmount:  feeData.totalAmount,
        paidAmount:   feeData.paidAmount,
        pendingCount: feeData.pendingCount,
        collectionPct: feeData.totalAmount
          ? ((feeData.paidAmount / feeData.totalAmount) * 100).toFixed(1)
          : 0,
      },
      notices:{ total:noticeCount },
      sms:{sentToday:smsSentToday },
      upcomingExams,
    },
  });
};

exports.getRecentActivity = async (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const [recentSms, recentNotices, recentFees] = await Promise.all([
    SmsLog.find().populate('student','name').sort({ createdAt:-1 }).limit(5),
    Notice.find({ isPublished:true }).populate('publishedBy','name').sort({ publishedAt:-1 }).limit(5),
    Fee.find({ 'payments.0': { $exists: true } }).populate('student','name').sort({ updatedAt:-1 }).limit(5),
  ]);
  res.json({ success: true, data: { recentSms, recentNotices, recentFees } });
};
