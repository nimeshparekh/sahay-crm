const mongoose = require('mongoose');

// Define the schema
const CompanySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },
  ename:{
    type:String,
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  offeredServices: {
    type: [String],
    default: []
  },
  offeredPrize: {
    type: Number,
    required: true
  },
  lastFollowUpdate: {
    type: String,
    required: true
  },
  totalPayment:{
    type:Number,
    required:true
  },
  estPaymentDate:{
    type:String,
    required:true
  },
  remarks:{
    type:String
  }

});


const FollowUpModel = mongoose.model('FollowupCollection', CompanySchema);

module.exports = FollowUpModel;