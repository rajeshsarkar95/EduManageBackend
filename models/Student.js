const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true,
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  admissionNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Gender is required'],
  },
  photo: {
    type: String,
    default: null,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  religion: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    default: 'General',
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'],
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, 'Invalid pincode — must be 6 digits'],
    },
  },

  guardian: {
    name: {
      type: String,
      required: [true, 'Guardian name is required'],
      trim: true,
    },
    relation: {
      type: String,
      enum: ['Father', 'Mother', 'Guardian'],
      default: 'Father',
    },
    phone: {
      type: String,
      required: [true, 'Guardian phone is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Enter a valid guardian phone number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    occupation: {
      type: String,
      trim: true,
    },
    annualIncome: {
      type: Number,
      min: [0, 'Annual income cannot be negative'],
    },
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required'],
  },
  section: {
    type: String,
    trim: true,
    uppercase: true,
  },
  session: {
    type: String,
    default: '2024-25',
  },
  admissionDate: {
    type: Date,
    default: Date.now,
  },
  previousSchool: {
    type: String,
    trim: true,
  },
  feeStatus: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'transferred', 'graduated'],
    default: 'active',
  },
  notes: {
    type: String,
    trim: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },

},{timestamps: true });
studentSchema.index({ class: 1, rollNumber: 1 });
studentSchema.index({ name: 'text', rollNumber: 'text', studentNumber: 'text', admissionNumber: 'text' });
studentSchema.index({ 'guardian.phone': 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ feeStatus: 1 });
studentSchema.index({ session: 1 });

studentSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  let age = today.getFullYear() - this.dateOfBirth.getFullYear();
  const m = today.getMonth() - this.dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < this.dateOfBirth.getDate())) {
    age--;
  }
  return age;
});

studentSchema.virtual('fullAddress').get(function () {
  if (!this.address) return null;
  return [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.pincode,
  ].filter(Boolean).join(', ') || null;
});

studentSchema.pre('save', async function (next) {
  if (!this.isNew || this.studentNumber) return next();
  try {
    const count = await mongoose.model('Student').countDocuments();
    const year = new Date().getFullYear();
    this.studentNumber = `STN-${year}-${String(count + 1).padStart(5, '0')}`;
    next();
  } catch (err) {
    next(err);
  }
});
studentSchema.pre(/^find/, function (next) {
  if (this.getOptions().includeSoftDeleted) return next();
  this.where({ isDeleted: { $ne: true } });
  next();
});

studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);