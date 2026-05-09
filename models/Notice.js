const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title:   { type: String, required: true, trim: true },
  content: { type: String, required: true },
  priority:{
    type: String, enum: ['low','medium','high','urgent'], default: 'medium',
  },

  // Target audience
  targetType: {
    type: String, enum: ['all','class','teacher','parent'], default: 'all',
  },
  targetClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],

  // Published by
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Attachment
  attachment: { type: String },

  // SMS
  smsSent:    { type: Boolean, default: false },
  smsCount:   { type: Number, default: 0 },
  smsSentAt:  { type: Date },

  isPublished: { type: Boolean, default: true },
  publishedAt: { type: Date, default: Date.now },
  expiresAt:   { type: Date },
}, { timestamps: true });

noticeSchema.index({ isPublished: 1, publishedAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
