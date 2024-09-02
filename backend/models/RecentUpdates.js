const mongoose = require('mongoose');


const yourSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  "Company Name": {
    type: String,
  },
  ename:{
    type:String
  },
  oldStatus:{
    type:String
  },
  newStatus:{
    type:String
  },
  properDate: {
    type: Date,
  },
  date: {
    type: String,
  },
  time:{
    type:String
  }
});


const RecentUpdatesModel= mongoose.model('recent-updates', yourSchema);

module.exports = RecentUpdatesModel;