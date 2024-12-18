const mongoose = require("mongoose");

const isoTypeSchema = new mongoose.Schema({
  serviceID: {
    type: Number
  },
  type: {
    type: String
  },
  IAFtype1: {
    type: String
  },
  IAFtype2: {
    type: String
  },
  Nontype: {
    type: String
  },
  forOther:{
    type:String
  },
});

const companyIncoTypeSchema = new mongoose.Schema({
  serviceID: {
    type: Number
  },
  type: {
    type: String
  },
})

const organizationDscTypeSchema = new mongoose.Schema({
  serviceID: {
    type: Number
  },
  type: {
    type: String
  },
  validity:{
    type:String
  }
})
const directorDscTypeSchema = new mongoose.Schema({
  serviceID: {
    type: Number
  },
  type: {
    type: String
  },
  validity:{
    type:String
  }
})

const ServiceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
  },
  totalPaymentWOGST: {
    type: Number,
    required: true,
  },
  isoTypeObject: [isoTypeSchema],
  companyIncoTypeObject:[companyIncoTypeSchema],
  organizationTypeObject:[organizationDscTypeSchema],
  directorDscTypeObject:[directorDscTypeSchema],
  totalPaymentWGST: {
    type: Number,
    required: true,
  },
  withGST: {
    type: Boolean
  },
  withDSC: {
    type: Boolean
  },
  paymentTerms: {
    type: String,
    required: true,
  },
  firstPayment: {
    type: Number,
  },
  secondPayment: {
    type: Number,
  },
  thirdPayment: {
    type: Number,
  },
  fourthPayment: {
    type: Number,
  },
  secondPaymentRemarks: {
    type: String,
  },
  thirdPaymentRemarks: {
    type: String,
  },
  fourthPaymentRemarks: {
    type: String,
  },
  paymentRemarks: {
    type: String,
    default: "No payment remarks",
  },
  expanse: {
    type: Number
  },
  expanseDate: {
    type: Date
  },
  pendingRecievedAmount:{
    type:Number
  },
  remainingAmount:{
    type:Number
  }
});

const RemainingPaymentSchema = new mongoose.Schema({
  serviceName: {
    type: String
  },
  remainingAmount: {
    type: Number
  },
  paymentMethod: {
    type: String
  },
  extraRemarks: {
    type: String
  },
  totalPayment: {
    type: Number
  },
  receivedPayment: {
    type: Number
  },
  pendingPayment: {
    type: Number
  },
  paymentReceipt: {
    type: Array
  },
  paymentDate: {
    type: Date
  },
  publishDate: {
    type: Date
  }
})

const TempSchema = new mongoose.Schema({

  bdeName: {
    type: String,
  },
  bdmType: {
    type: String,
  },
  bdeEmail: {
    type: String,
  },
  bdmName: {
    type: String,
  },
  otherBdmName: {
    type: String,
  },
  bdmEmail: {
    type: String,
  },
  bookingDate: {
    type: String,
  },
  bookingPublishDate: {
    type: String,
  },
  lastActionDate: {
    type: Date,
  },
  bookingSource: {
    type: String,
  },
  otherBookingSource: {
    type: String,
  },
  numberOfServices: {
    type: Number,
  },
  services: [ServiceSchema],
  caCase: {
    type: String,
  },
  caNumber: {
    type: String,
  },
  caEmail: {
    type: String,
  },
  caCommission: {
    type: Number,
  },
  paymentMethod: {
    type: String,
  },
  paymentReceipt: {
    type: Array,
  },
  extraNotes: {
    type: String,
  },
  totalAmount: {
    type: Number,
  },
  receivedAmount: {
    type: Number,
  },
  pendingAmount: {
    type: Number,
  },
  generatedTotalAmount: {
    type: Number,
  },
  generatedReceivedAmount: {
    type: Number,
  },
  otherDocs: {
    type: Array
  },
  Step1Status: {
    type: Boolean,
    default: false
  },
  Step2Status: {
    type: Boolean,
    default: false
  },
  Step3Status: {
    type: Boolean,
    default: false
  },
  Step4Status: {
    type: Boolean,
    default: false
  },
  Step5Status: {
    type: Boolean,
    default: false
  },
  remainingPayments: [RemainingPaymentSchema],
  servicesTakenByRmOfCertification:{
    type:Array,
    default:[]
  },
  servicesTakenByAdminExecutive:{
    type:Array,
    default:[]
  },
  servicesTakenByRmOfFunding:{
    type:Array,
    default:[]
  },
});

const RedesignedLeadformSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'newcdatas',
    localField: 'Company Name',
    foreignField: 'Company Name',
    justOne: true,
    match: { Status: 'Matured' }
  },
  "Company Name": {
    type: String,
    required: true,
    unique: true
  },
  "Company Number": {
    type: Number,
    required: true,
  },
  "Company Email": {
    type: String,
    required: true,
  },
  panNumber: {
    type: String,
    required: true
  },
  gstNumber: {
    type: String
  },
  incoDate: {
    type: String,
    required: true,
  },
  bdeName: {
    type: String,
    required: true,
  },
  bdmName: {
    type: String,
    required: true,
  },
  bdeEmail: {
    type: String,
  },
  bdmType: {
    type: String,
  },
  bdmEmail: {
    type: String,
  },
  otherBdmName: {
    type: String,
  },
  lastActionDate: {
    type: String,
  },
  bookingPublishDate: {
    type: String,
  },
  bookingDate: {
    type: String,
    required: true,
  },
  bookingTime: {
    type: Date,
  },
  bookingSource: {
    type: String,
    required: true,
  },
  numberOfServices: {
    type: Number,
    required: true,
  },
  services: [ServiceSchema],
  caCase: {
    type: String,
  },
  caNumber: {
    type: Number,
  },
  caEmail: {
    type: String,
  },
  caCommission: {
    type: Number,
  },
  paymentMethod: {
    type: String,
  },
  paymentReceipt: {
    type: Array
  }, 
  otherDocs: {
    type: Array
  },
  extraNotes: {
    type: String,
  },
  totalAmount: {
    type: Number,
  },
  receivedAmount: {
    type: Number,
  },
  pendingAmount: {
    type: Number,
  },
  generatedTotalAmount: {
    type: Number,
  },
  generatedReceivedAmount: {
    type: Number,
  },
  moreBookings: [TempSchema],
  remainingPayments: [RemainingPaymentSchema],
  isDeletedEmployeeCompany: {
    type: Boolean,
    default: false,
  },
  servicesTakenByRmOfCertification:{
    type:Array,
    default:[]
  },
  isVisibleToRmOfCerification:{
    type:Boolean,
    default:true
  },
  displayOfDateForRmCert:{
    type:Date,
  },
  permanentlDeleteFromRmCert:{
    type:Boolean
  },
  permanentlDeleteDateFromRmCert:{
    type:Date
  },
  servicesTakenByAdminExecutive:{
    type:Array,
    default:[]
  },
  isVisibleToAdminExecutive:{
    type:Boolean,
    default:true
  },
  displayOfDateForAdminExecutive:{
    type:Date,
  },
  permanentlDeleteFromAdminExecutive:{
    type:Boolean
  },
  permanentlDeleteDateFromAdminExecutive:{
    type:Date
  },
  servicesTakenByRmOfFunding:{
    type:Array,
    default:[]
  },
  isVisibleToRmOfFunding:{
    type:Boolean,
    default:true
  },
  displayOfDateForRmOfFunding:{
    type:Date,
  },
  permanentlDeleteFromRmOfFunding:{
    type:Boolean
  },
  permanentlDeleteDateFromRmOfFunding:{
    type:Date
  },

});

const RedesignedLeadformModel = mongoose.model("RedesignedLeadform", RedesignedLeadformSchema);

module.exports = RedesignedLeadformModel;
