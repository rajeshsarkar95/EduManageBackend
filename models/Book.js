const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title:{type:String,required:true,trim:true},
  author:{type:String,required:true,trim:true},
  isbn:{type:String,unique:true,sparse:true,trim:true},
  publisher:{type:String},
  publishYear:{type:Number},
  edition:{type:String},
  category:{
    type:String,
    enum: ['textbook','fiction','non-fiction','reference','autobiography','science','history','other'],
    default: 'other',
  },
  language:{type:String,default:'English'},
  pages:{type:Number},
  price:{type:Number},
  shelfNumber:{type:String},
  description:{type:String },
  coverImage:{type:String },
  totalCopies:{type:Number,required:true,default:1},
  availableCopies:{type: Number,required:true,default:1},

  issueHistory: [{
    student:{type:mongoose.Schema.Types.ObjectId,ref:'Student'},
    issuedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    issuedDate:{type:Date,default: Date.now},
    dueDate:{type:Date},
    returnDate:{type:Date},
    fine:{type:Number,default:0},
    status:{type: String,enum:['issued','returned','lost'],default:'issued'},
  }],

  status: {
    type: String,
    enum: ['available','all-issued','lost'],
    default: 'available'
  },
},{timestamps:true});

bookSchema.index({
  title: 'text',
  author: 'text',
  isbn: 'text'
});

module.exports =
  mongoose.models.Book ||
  mongoose.model('Book', bookSchema);