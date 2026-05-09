const User    = require('../models/User');
const Teacher = require('../models/Teacher');

const sendToken = (user,statusCode,res) =>{
  const token = user.generateToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:user._id,
      name:user.name,
      email:user.email,
      role:user.role,
      avatar:user.avatar,
    },
  });
};

exports.register = async (req,res) =>{
  const { name,email,password,role,phone } = req.body;
  const user = await User.create({name,email,password,role:role || 'teacher', phone });
  sendToken(user,201,res);
};


exports.login = async (req,res)=>{
  const {email,password} = req.body;
  if (!email || !password){
    return res.status(400).json({success:false,message:'Please provide email and password.'});
  }
  const user = await User.findOne({email}).select('+password');
  if (!user || !(await user.comparePassword(password))){
    return res.status(401).json({ success: false,message:'Invalid email or password.'});
  }
  if (!user.isActive){
    return res.status(401).json({success:false,message:'Your account has been deactivated.'});
  }
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave:false});
  sendToken(user,200,res);
};

exports.getMe = async (req,res) =>{
  const user = await User.findById(req.user.id).populate('teacherProfile');
  res.json({ success: true,data:user});
};

exports.changePassword = async (req,res)=>{
  const {currentPassword,newPassword} = req.body;
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.comparePassword(currentPassword))){
    return res.status(400).json({ success:false,message:'Current password is incorrect.'});
  }
  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();
  sendToken(user,200,res);
};

exports.getAllUsers = async (req,res) =>{
  const users = await User.find().select('-password').sort('-createdAt');
  res.json({ success:true,count:users.length,data:users});
};

exports.toggleUserStatus = async (req,res)=>{
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({success:false,message:'User not found.'});
  user.isActive = !user.isActive;
  await user.save({validateBeforeSave:false});
  res.json({ success: true, message: `User ${user.isActive ? 'activated':'deactivated'}.`,data:user});
};
