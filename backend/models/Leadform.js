const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({

    bdeName: {
        type:String,
        required:true
    },
    bdeEmail:{
        type:String,
        required:true
    },
    bdmName: {
        type:String,
        required:true
    },
    bdmEmail:{
        type:String,
        required:true
    },
    bdmType: String,
    supportedBy: Boolean,
    bookingDate: Date,
    caCase: String,
    caNumber: Number,
    caEmail: String,
    caCommission: String,
    companyName: String,
    contactNumber: Number,
    companyEmail: String,
    services: Array,
    originalTotalPayment: Number,
    totalPayment: Number,
    paymentTerms: String,
    paymentMethod: String,
    firstPayment: Number,
    secondPayment: Number,
    thirdPayment: Number,
    fourthPayment: Number,
    paymentRemarks:String,
    paymentReceipt: String,
    bookingSource: String,
    cPANorGSTnum: Number,
    incoDate: Date,
    extraNotes: String,
    otherDocs: String,
    bookingTime: String
});

const LeadModel = mongoose.model('Leadform', leadSchema);

module.exports = LeadModel;
