const Attendance = require('../models/Attendance');
const Student    = require('../models/Student');
const SmsLog     = require('../models/SmsLog');
const {sendSMS } = require('../utils/smsService');

exports.markAttendance = async (req,res)=>{
  const {classId,date,records,note} = req.body;
  const attendanceDate = new Date(date);
  attendanceDate.setHours(0,0,0,0);
  let attendance = await Attendance.findOneAndUpdate(
    { class:classId,date:attendanceDate},
    {
      class:classId,
      date:attendanceDate,
      records,
      note,
      markedBy: req.user.id,
      markedAt: new Date(),
    },
   {new:true,upsert:true,runValidators:true}
  );
  const absentRecords = records.filter(r => r.status === 'absent');
  if (absentRecords.length > 0){
    const absentStudents = await Student.find({
      _id: {$in:absentRecords.map(r => r.studentId)},
    }).select('name guardian rollNumber');
    for (const student of absentStudents){
      const msg = `Dear Parent, your ward ${student.name} (Roll: ${student.rollNumber}) was ABSENT today (${new Date(date).toLocaleDateString('en-IN')}). Please contact school for details.`;
      try {
        const result = await sendSMS(student.guardian.phone,msg);
        await SmsLog.create({
          recipientType:'parent',
          recipientPhone:student.guardian.phone,
          recipientName:student.guardian.name,
          student:student._id,
          message:msg,
          smsType:'absent',
          status:result.success ? 'sent' : 'failed',
          errorMessage:result.error,
          sentAt:new Date(),
          sentBy:req.user.id,
        });
      } catch (err){
        console.error('SMS send error:',err.message);
      }
    }
  }
  res.status(201).json({success:true,message:'Attendance marked.',data: attendance});
};
exports.getAttendance = async (req,res)=>{
  const {classId,date} = req.query;
  const filter = {};
  if (classId) filter.class = classId;
  if (date){
    const d = new Date(date); d.setHours(0,0,0,0);
    const end = new Date(date); end.setHours(23,59,59,999);
    filter.date = {$gte:d,$lte:end};
  }
  const records = await Attendance.find(filter)
    .populate('class', 'name section')
    .populate('records.student', 'name rollNumber')
    .populate('markedBy', 'name')
    .sort({ date: -1 });
  res.json({success:true,count:records.length,data:records});
};

exports.getStudentAttendance = async (req,res)=>{
  const { studentId } = req.params;
  const start = new Date(req.query.startDate || new Date().setDate(1));
  const end   = new Date(req.query.endDate   || new Date());
  const stats = await Attendance.getStudentAttendance(studentId,start,end);
  const records = await Attendance.find({
    date: { $gte: start, $lte:end},
    'records.student': studentId,
  }).sort({date:-1});
  const detail = records.map(r =>({
    date:r.date,
    status:r.records.find(x => x.student.toString() === studentId)?.status,
  }));
  res.json({ success:true,data:{stats,records:detail}});
};
exports.getMonthlyReport = async (req,res)=>{
  const { classId, month, year } = req.query;
  const y = parseInt(year  || new Date().getFullYear());
  const m = parseInt(month || new Date().getMonth() + 1) - 1;
  const start = new Date(y, m, 1);
  const end   = new Date(y, m + 1, 0);
  const records = await Attendance.find({
    class: classId,
    date: {$gte:start,$lte:end},
  }).populate('records.student','name rollNumber');
  res.json({ success:true,data:records});
};
