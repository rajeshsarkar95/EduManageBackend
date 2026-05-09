const mongoose = require('mongoose');

const smsLogSchema = new mongoose.Schema({
  // Recipient
  recipientType: {
    type: String, enum: ['parent','teacher','all','class'], default: 'parent',
  },
  recipientPhone:  { type: String },
  recipientName:   { type: String },
  student:         { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  targetClass:     { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },

  // Message
  message:  { type: String, required: true },
  smsType:  {
    type: String,
    enum: ['absent','attendance','notice','fee_reminder','exam','general','manual'],
    default: 'general',
  },

  // Reference (e.g. attendance doc, notice doc)
  referenceId:   { type: mongoose.Schema.Types.ObjectId },
  referenceModel:{ type: String },

  // Delivery
  provider:   { type: String, enum: ['fast2sms','textlocal','other'], default: 'fast2sms' },
  status:     { type: String, enum: ['sent','failed','pending','queued'], default: 'pending' },
  providerMessageId: { type: String },
  errorMessage:      { type: String },
  sentAt:     { type: Date },

  // Sent by which user/system
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

smsLogSchema.index({ status: 1, createdAt: -1 });
smsLogSchema.index({ student: 1, smsType: 1 });

module.exports = mongoose.model('SmsLog', smsLogSchema);
