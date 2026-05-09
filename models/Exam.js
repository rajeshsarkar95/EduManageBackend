const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true},
  class:{type:String,required:true,trim:true},
  subject:{type:String,required:true,trim:true},
  examDate:{type:Date,required:true},
  totalMarks:{type:Number,required:true,default:100},
  status:{type:String,enum:['upcoming','ongoing','completed','cancelled'],default:'upcoming'}
},{timestamps:true});

module.exports = mongoose.model('Exam',examSchema);