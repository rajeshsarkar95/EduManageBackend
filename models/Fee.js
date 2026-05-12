const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student:  {type:mongoose.Schema.Types.ObjectId,ref:'Student',required:true},
  class:    {type:mongoose.Schema.Types.ObjectId,ref:'Class',required:true},
  session:  {type:String,default:'2024-25'},
  feeType:{
    type:String,
    enum: ['tuition','transport','hostel','library','sports','exam','annual','other'],
    default: 'tuition',
  },
  description:{type:String},
  totalAmount:{type:Number,required:true},
  paidAmount:{type:Number,default:0},
  discountAmount:{type:Number,default:0},
  fineAmount:{type:Number,default:0},
  dueDate:{type:Date,required:true},
  payments:[{
    amount:{type:Number,required:true},
    paidOn:{type:Date,default: Date.now},
    method:{type:String, enum: ['cash','online','cheque','dd'],default:'cash'},
    receiptNo:{type:String },
    collectedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    remarks:{type:String},
  }],
  status:{
    type: String,enum:['paid','pending','overdue','partial'], default:'pending',
  },
}, {timestamps:true});

feeSchema.pre('save',function (next){
  const due = this.totalAmount - this.discountAmount + this.fineAmount;
  if (this.paidAmount >= due){
    this.status = 'paid';
  } else if (this.paidAmount > 0){
    this.status = 'partial';
  } else if (new Date() > this.dueDate){
    this.status = 'overdue';
  } else {
    this.status = 'pending';
  }
  next();
});
feeSchema.virtual('balanceDue').get(function () {
  return (this.totalAmount - this.discountAmount + this.fineAmount) - this.paidAmount;
});

feeSchema.set('toJSON', {virtuals:true});
feeSchema.index({student:1,session: 1,feeType:1});
module.exports = mongoose.model('Fee',feeSchema);
