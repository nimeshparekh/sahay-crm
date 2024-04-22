const mongoose = require('mongoose');



// Define the schema
const yourSchema = new mongoose.Schema({
  email: {
    type: String,
    unique:true
  },
  number: {
    type: String,
  },
  ename: {
    type: String,
  },
  jdate: {
    type: Date,
  },
  password: {
    type: String,
  },
  designation:{
    type: String
  },
  branchOffice:{
    type:String,
  },
  AddedOn:{
    type:String
  },
  Active:{
    type : String
  },
  refresh_token:{
    type:String
  },
  access_token:{
    type:String
  },
  bdmWork:{
    type:Boolean,
    default:false
  }
});



// Create the model
const adminModel = mongoose.model('newemployeeinfos', yourSchema);

module.exports = adminModel;