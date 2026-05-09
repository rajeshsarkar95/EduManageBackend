const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name:{
    type: String, required: [true,'Name is required'],trim: true,
  },
  email:{
    type: String, required: [true,'Email is required'],
    unique: true, lowercase: true, trim:true,
    match: [/^\S+@\S+\.\S+$/,'Please enter a valid email'],
  },
  password:{
    type: String, required:[true,'Password is required'],
    minlength: [6,'Password must be at least 6 characters'],
    select: false,
  },
  role:{
    type: String, enum: ['admin','teacher'], default:'teacher',
  },
  teacherProfile:{
    type: mongoose.Schema.Types.ObjectId, ref:'Teacher',
  },
  phone:{type:String,trim:true},
  avatar:{type:String},
  isActive:{type:Boolean,default:true},
  lastLogin:{type:Date},
  passwordChangedAt: { type: Date },
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (){
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password,12);
});

userSchema.methods.comparePassword = async function (candidatePassword){
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateToken = function (){
  return jwt.sign(
    { id: this._id,role:this.role},
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d'}
  );
};
module.exports = mongoose.model('User',userSchema);
