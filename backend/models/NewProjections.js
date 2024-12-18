const mongoose = require('mongoose');

// Define the schema
const CompanySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    unique: true
  },
  companyId: {
    type: String,
  },
  ename: {
    type: String,
    required: true
  },
  date: {
    type: Date,
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
  offeredPrice: {
    type: Number,
    required: true
  },
  totalPayment: {
    type: Number,
    required: true
  },
  offeredPriceWithGst: {
    type: Number
  },
  totalPaymentWithGst: {
    type: Number
  },
  bookingAmount: {
    type: Number,
    default: 0
  },
  lastFollowUpdate: {
    type: Date,
    required: true
  },
  estPaymentDate: {
    type: Date,
    required: true
  },
  remarks: {
    type: String,
    default: "no remarks added"
  },
  editCount: {
    type: Number,
    default: 0
  },
  bdeName: {
    type: String,
  },
  bdmName: {
    type: String
  },
  caseType: {
    type: String,
    default: "NotForwarded"
  },
  isPreviousMaturedCase: {
    type: String,
    default: false,
  },
  modifiedAt: { 
    type: Date, 
    default: Date.now() 
  },
  addedOnDate:{
    type: Date,
    // default: Date.now()
  },
  isDeletedCompany: {
    type: Boolean,
    default: false
  },
  history: [{
    modifiedAt: { 
      type: Date, 
      default: Date.now() 
    },
    data: {
      ename: {
        type: String,
        required: true
      },
      date: {
        type: Date,
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
      offeredPrice: {
        type: Number,
        required: true
      },
      totalPayment: {
        type: Number,
        required: true
      },
      offeredPriceWithGst: {
        type: Number
      },
      totalPaymentWithGst: {
        type: Number
      },
      bookingAmount: {
        type: Number,
        default: 0
      },
      lastFollowUpdate: {
        type: Date,
        required: true
      },
      estPaymentDate: {
        type: Date,
        required: true
      },
      remarks: {
        type: String,
        default: "no remarks added"
      },
      editCount: {
        type: Number,
        default: 0
      },
      bdeName: {
        type: String,
      },
      bdmName: {
        type: String
      },
      caseType: {
        type: String,
        default: "NotForwarded"
      },
      isPreviousMaturedCase: {
        type: String,
        default: false,
      },
      lastAddedOnDate:{
        type: Date,
        // default: Date.now()
      },
    },
  }],
});
CompanySchema.index({ companyName: 1 }, { unique: true });

const NewFollowUpModel = mongoose.model('Projection', CompanySchema);

module.exports = NewFollowUpModel;