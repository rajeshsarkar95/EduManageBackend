const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name:     {type:String,required:true,trim:true},
  section:  {type:String,required:true,trim:true,uppercase:true},
  roomNumber:{type:String},
  session:  {type:String,default:'2024-25'},
  classTeacher:{type: mongoose.Schema.Types.ObjectId,ref:'Teacher'},
  subjects: [{ type: mongoose.Schema.Types.ObjectId,ref:'Subject'}],
  maxStudents: { type: Number, default:50},
  isActive: { type: Boolean, default:true},
},{timestamps:true});

classSchema.index({ name: 1,section:1,session:1},{unique:true});
classSchema.virtual('fullName').get(function(){
  return `${this.name}-${this.section}`;
});
classSchema.virtual('studentCount', {
  ref: 'Student', localField: '_id', foreignField: 'class', count: true,
});
classSchema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('Class', classSchema);
