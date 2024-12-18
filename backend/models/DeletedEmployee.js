const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  fieldname: String,
  originalname: String,
  encoding: String,
  mimetype: String,
  destination: String,
  filename: String,
  path: String,
  size: Number
});

const yourSchema = new mongoose.Schema({
  ename: {
    type: String,
  },
  empFullName: {
    type: String,
  },
  employeeID: {
    type: String
  },
  dob: {
    type: Date
  },
  bloodGroup: {
    type: String,
    default:""
  },
  gender: {
    type: String
  },
  personal_number: {
    type: String,
  },
  personal_email: {
    type: String,
  },
  currentAddress: {
    type: String
  },
  permanentAddress: {
    type: String
  },
  department: {
    type: String
  },
  designation: {
    type: String
  },
  newDesignation : {
    type: String
  },
  jdate: {
    type: Date,
  },
  branchOffice: {
    type: String,
  },
  employeementType: {
    type: String
  },
  reportingManager: {
    type: String
  },
  number: {
    type: String,
  },
  email: {
    type: String,
    unique: true
  },  
  password: {
    type: String,
  },
  accountNo: {
    type: String
  },
  nameAsPerBankRecord: {
    type: String
  },
  ifscCode: {
    type: String
  },
  salary: {
    type: Number
  },
  firstMonthSalaryCondition: {
    type: String
  },
  firstMonthSalary: {
    type: Number
  },
  offerLetter: {
    type: [fileSchema]
  },
  panNumber: {
    type: String
  },
  aadharNumber: {
    type: String
  },
  uanNumber: {
    type: String
  },
  personal_contact_person: {
    type: String
  },
  personal_contact_person_relationship: {
    type: String
  },
  personal_contact_person_number: {
    type: String
  },
  aadharCard: {
    type: [fileSchema]
  },
  panCard: {
    type: [fileSchema]
  },
  educationCertificate: {
    type: [fileSchema]
  },
  relievingCertificate: {
    type: [fileSchema]
  },
  salarySlip: {
    type: [fileSchema]
  },
  offerLetter: {
    type: [fileSchema]
  },
  profilePhoto: {
    type: [fileSchema]
  },
  targetDetails: {
    type: Array
  },
  AddedOn: {
    type: String
  },
  Active: {
    type: String
  },
  refresh_token: {
    type: String
  },
  access_token: {
    type: String
  },
  bdmWork: {
    type: Boolean,
    default: false
  },
  employee_profile: {
    type: Array
  },
  deletedDate: {
    type: Date
  },
  isPermanentDeleted: {
    type: Boolean,
    default: false
  },
  isDeletedEmployeeCompany: {
    type: Boolean,
    default: false
  },
  permanentDeletingDate:{
    type:Date,
    default:new Date()
  },
  permanentDeletingPerson:{
    type:String,
    default:""
  }
})

// Add indexes for search fields
yourSchema.index({ ename: 1 });
yourSchema.index({ number: 1 });
yourSchema.index({ email: 1 });
yourSchema.index({ branchOffice: 1 });
yourSchema.index({ department: 1 });
yourSchema.index({ newDesignation: 1 });

const deletedEmployeeModel = mongoose.model('deletedemployeedetail', yourSchema)
module.exports = deletedEmployeeModel;