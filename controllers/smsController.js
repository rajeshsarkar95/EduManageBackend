const SmsLog  = require('../models/SmsLog');
const Student = require('../models/Student');
const { sendSMS } = require('../utils/smsService');
const { getPagination } = require('../utils/helpers');

// POST /api/v1/sms/send  — Manual SMS
exports.sendManualSMS = async (req, res) => {
  const { message, recipientType, targetClass, phones } = req.body;

  let allPhones = [];

  if (recipientType === 'all') {
    const students = await Student.find({ status: 'active' }).select('guardian');
    allPhones = [...new Set(students.map(s => s.guardian.phone).filter(Boolean))];
  } else if (recipientType === 'class' && targetClass) {
    const students = await Student.find({ class: targetClass, status: 'active' }).select('guardian');
    allPhones = [...new Set(students.map(s => s.guardian.phone).filter(Boolean))];
  } else if (phones && phones.length) {
    allPhones = phones;
  }

  let sent = 0, failed = 0;
  const logs = [];

  for (const phone of allPhones) {
    try {
      const result = await sendSMS(phone, message);
      logs.push({
        recipientType, recipientPhone: phone,
        message, smsType: 'manual',
        status: result.success ? 'sent' : 'failed',
        errorMessage: result.error,
        sentBy: req.user.id, sentAt: new Date(),
      });
      if (result.success) sent++; else failed++;
    } catch (err) {
      failed++;
      logs.push({ recipientType, recipientPhone: phone, message, smsType: 'manual', status: 'failed', errorMessage: err.message, sentBy: req.user.id });
    }
  }

  await SmsLog.insertMany(logs);
  res.json({ success: true, message: `SMS sent: ${sent}, Failed: ${failed}`, data: { sent, failed, total: allPhones.length } });
};

// GET /api/v1/sms/logs
exports.getSmsLogs = async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const { status, smsType } = req.query;
  const filter = {};
  if (status)  filter.status  = status;
  if (smsType) filter.smsType = smsType;

  const [logs, total] = await Promise.all([
    SmsLog.find(filter).populate('student','name rollNumber').populate('sentBy','name').sort({ createdAt: -1 }).skip(skip).limit(limit),
    SmsLog.countDocuments(filter),
  ]);

  res.json({ success: true, count: logs.length, total, page, data: logs });
};

// GET /api/v1/sms/stats
exports.getSmsStats = async (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0);

  const [total, sentToday, failed, byType] = await Promise.all([
    SmsLog.countDocuments(),
    SmsLog.countDocuments({ status: 'sent', sentAt: { $gte: today } }),
    SmsLog.countDocuments({ status: 'failed' }),
    SmsLog.aggregate([{ $group: { _id: '$smsType', count: { $sum: 1 } } }]),
  ]);

  res.json({ success: true, data: { total, sentToday, failed, byType } });
};
