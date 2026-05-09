const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name:{type:String,required:true},
  time:{type:String},  
  latitude:{type:Number},
  longitude:{type:Number},
},{_id:false});

const transportSchema = new mongoose.Schema({
  routeName:{type:String,required:true,trim:true},
  routeNumber:{type: String,unique:true,sparse:true},
  busNumber:{type:String,required:true,uppercase:true},
  busCapacity:{type:Number,default:40},

  driver:{
    name:{type:String,required:true},
    phone:{type: String,required:true},
    license: { type: String },
  },
  conductor: {
    name:  { type: String },
    phone: { type: String },
  },
  stops: [stopSchema],
  morningPickup:{type:String},   
  afternoonDrop:{type:String},
  students:[{type:mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  monthlyFee: {type:Number,default:0},
  status: {
    type: String, enum: ['active','inactive','maintenance'], default: 'active',
  },
}, { timestamps:true});

module.exports = mongoose.model('Transport', transportSchema);
