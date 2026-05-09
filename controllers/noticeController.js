const Notice  = require('../models/Notice');
const Student = require('../models/Student');
const SmsLog  = require('../models/SmsLog');
const { sendSMS, sendBulkSMS } = require('../utils/smsService');

exports.getNotices = async (req, res) => {
  const { priority, targetType } = req.query;
  const filter = { isPublished: true };
  if (priority)   filter.priority   = priority;
  if (targetType) filter.targetType = targetType;

  const notices = await Notice.find(filter)
    .populate('publishedBy', 'name')
    .populate('targetClasses', 'name section')
    .sort({ publishedAt: -1 });

  res.json({ success: true, count: notices.length, data: notices });
};

exports.getNotice = async (req, res) => {
  const notice = await Notice.findById(req.params.id).populate('publishedBy targetClasses');
  if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });
  res.json({ success: true, data: notice });
};

exports.createNotice = async (req, res) => {
  req.body.publishedBy = req.user.id;
  if (req.file) req.body.attachment = `/uploads/attachments/${req.file.filename}`;

  const notice = await Notice.create(req.body);

  // ── Send SMS if requested ──────────────────────────────────
  if (req.body.sendSms) {
    // Gather all guardian phones
    const filter = req.body.targetType === 'class' && req.body.targetClasses?.length
      ? { class: { $in: req.body.targetClasses }, status: 'active' }
      : { status: 'active' };

    const students = await Student.find(filter).select('guardian');
    const phones   = [...new Set(students.map(s => s.guardian.phone).filter(Boolean))];
    const msg      = `📢 Notice from School: ${notice.title}. ${notice.content.substring(0, 100)}...`;

    let sent = 0;
    for (const phone of phones) {
      try {
        const result = await sendSMS(phone, msg);
        await SmsLog.create({ recipientType:'parent', recipientPhone:phone, message:msg, smsType:'notice', referenceId:notice._id, referenceModel:'Notice', status: result.success?'sent':'failed', sentBy:req.user.id, sentAt:new Date() });
        if (result.success) sent++;
      } catch {}
    }

    notice.smsSent  = true;
    notice.smsCount = sent;
    notice.smsSentAt = new Date();
    await notice.save();
  }

  res.status(201).json({ success: true, message: 'Notice published.', data: notice });
};

exports.updateNotice = async (req, res) => {
  const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });
  res.json({ success: true, data: notice });
};

exports.deleteNotice = async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });
  await notice.deleteOne();
  res.json({ success: true, message: 'Notice deleted.' });
};
