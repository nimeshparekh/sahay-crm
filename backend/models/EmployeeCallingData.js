const mongoose = require('mongoose');

const CallLogSchema = new mongoose.Schema({
    call_date: {
        type: String,
    },
    call_recording_url: {
        type: String,
    },
    call_time: {
        type: String,
    },
    call_type: {
        type: String,
    },
    client_country_code: {
        type: String,
    },
    client_name: {
        type: String,
    },
    client_number: {
        type: String,
    },
    duration: {
        type: Number,
    },
    id: {
        type: String,
    },
    modified_at: {
        type: String,
    },
    note: {
        type: String,
    },
    synced_at: {
        type: String,
    },
});

const DailyCallSchema = new mongoose.Schema({
    date: {
        type: String, // Store the date in format YYYY-MM-DD
        //required: true,
    },
    total_calls: {
        type: Number,
    },
    total_connected_calls: {
        type: Number,
    },
    total_duration: {
        type: Number,
    },
    total_incoming_calls: {
        type: Number,
    },
    total_incoming_connected_calls: {
        type: Number,
    },
    total_incoming_duration: {
        type: Number,
    },
    total_missed_calls: {
        type: Number,
    },
    total_never_attended_calls: {
        type: Number,
    },
    total_not_pickup_by_clients_call: {
        type: Number,
    },
    total_outgoing_calls: {
        type: Number,
    },
    total_outgoing_connected_calls: {
        type: Number,
    },
    total_outgoing_duration: {
        type: Number,
    },
    total_rejected_calls: {
        type: Number,
    },
    total_unique_clients: {
        type: Number,
    },
    total_working_hours: {
        type: String,
    },
    last_sync_req_at:{
        type:String
    },
    call_logs: [CallLogSchema], // Array of call logs for this day
});

const EmployeeSchema = new mongoose.Schema({
    emp_code: {
        type: String,
    },
    emp_country_code: {
        type: String,
    },
    emp_name: {
        type: String,
    },
    emp_number: {
        type: String,
        //required: true,
    },
    emp_tags: {
        type: Array,
        defauly:["Sales Executive" , "Sales Manager"]
    },
    monthly_data: [DailyCallSchema], // Store daily call data for the month
});

const CallingModel = mongoose.model('CallingModel', EmployeeSchema);
module.exports = CallingModel;
