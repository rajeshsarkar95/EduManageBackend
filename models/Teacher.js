const mongoose = require('mongoose');
const teacherSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
    trim:true,
  },
  subject:{ 
    type: String,
    required:true,
    trim:true,
  },
  classes:[{ 
    type:String,
    trim:true,
  }],
  phone:{
    type: String,
    required: true,
    match: [/^\d{10}$/,'Phone must be 10 digits'],
  },
  email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
  },
  qualification:{
    type:String,
    required:true,
    trim:true,
  },
  experience:{
    type:String,
    trim:true,
  },
  status:{
    type:String,
    enum:['Active','Inactive','On Leave'],
    default:'Active',
  },
},{timestamps:true});
module.exports = mongoose.model('Teacher', teacherSchema);