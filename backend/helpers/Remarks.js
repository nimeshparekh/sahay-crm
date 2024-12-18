var express = require('express');
var router = express.Router()
const dotenv = require('dotenv')
dotenv.config();
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const CompanyModel = require("../models/Leads");
// const authRouter = require('./helpers/Oauth');
// const requestRouter = require('./helpers/request');
const RemarksHistory = require("../models/RemarksHistory");
const TeamLeadsModel = require("../models/TeamLeads.js");
const CompleteRemarksHistoryLeads = require('../models/CompleteRemarksHistoryLeads.js');
const axios = require('axios');
const adminModel = require('../models/Admin.js');
const NotiModel = require('../models/Notifications.js');





router.post("/update-remarks/:id", async (req, res) => {
  const { id } = req.params;
  const { Remarks, bdeName, currentCompanyName, designation } = req.body;
  const socketIO = req.io;

  // Get the current date and time
  const currentDate = new Date();
  const time = `${currentDate.getHours()}:${currentDate.getMinutes()}`;
  const date = currentDate.toISOString().split("T")[0]; // Get the date in YYYY-MM-DD format

  try {
    // Update remarks in both CompanyModel and TeamLeadsModel
    await CompanyModel.findByIdAndUpdate(id, { Remarks: Remarks });
    await TeamLeadsModel.findByIdAndUpdate(id, { Remarks: Remarks });

    // New object to be pushed
    const newCompleteRemarks = {
      companyID: id,
      "Company Name": currentCompanyName,
      employeeName: bdeName,
      designation: designation,
      remarks: Remarks,
      bdeName: bdeName,
      addedOn: new Date()
    };



    // Find existing remarks history for the company
    const existingCompleteRemarksHistory = await CompleteRemarksHistoryLeads.findOne({ companyID: id })
      .select("companyID"); // Only select companyID and remarks

    if (existingCompleteRemarksHistory) {

      // Check if the remarks array exists, and if not, initialize it
      if (!existingCompleteRemarksHistory.remarks) {
        existingCompleteRemarksHistory.remarks = [];
      }
      const saveEntry = await CompleteRemarksHistoryLeads.findOneAndUpdate(
        {
          companyID: id
        },
        {
          $push: {
            remarks: [newCompleteRemarks]

          }
        }
      )
    } else {
      // If the company doesn't exist, create a new entry with the new object
      const newCompleteRemarksHistory = new CompleteRemarksHistoryLeads({
        companyID: id,
        "Company Name": currentCompanyName,
        remarks: [newCompleteRemarks], // Store the general remarks
      });

      await newCompleteRemarksHistory.save();
    }
    // Fetch updated data and remarks history
    const updatedCompany = await CompanyModel.findById(id).lean();
    const remarksHistory = await RemarksHistory.find({ companyID: id }).lean();

    // Send the updated company and remarks history data back to the client
    socketIO.emit("employee__remarks_successfull_update", {
      message: `Status updated to "Not Interested" for company: ${updatedCompany["Company Name"]}`,
      updatedDocument: updatedCompany,
      ename: updatedCompany.ename
    })
    res.status(200).json({ updatedCompany, remarksHistory });
  } catch (error) {
    console.error("Error updating remarks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --------------------------------remarks-history-bdm-------------------------------------


router.post("/update-remarks-bdm/:id", async (req, res) => {
  const { id } = req.params;
  const { Remarks, remarksBdmName, currentCompanyName, designation, bdmWork } = req.body;

  // Get the current date and time
  const currentDate = new Date();
  const time = `${currentDate.getHours()}:${currentDate.getMinutes()}`;
  const date = currentDate.toISOString().split("T")[0]; // Get the date in YYYY-MM-DD format

  try {
    // Update bdmRemarks in both CompanyModel and TeamLeadsModel
    await CompanyModel.findByIdAndUpdate(id, { bdmRemarks: Remarks });
    await TeamLeadsModel.findByIdAndUpdate(id, { bdmRemarks: Remarks });

    // New object to be pushed
    const newCompleteRemarks = {
      companyID: id,
      "Company Name": currentCompanyName,
      employeeName: remarksBdmName,
      designation: designation,
      bdmRemarks: Remarks,
      bdmName: remarksBdmName,
      bdmWork: bdmWork,
      addedOn: new Date()
    };



    // Find existing remarks history for the company
    const existingCompleteRemarksHistory = await CompleteRemarksHistoryLeads.findOne({ companyID: id })
      .select("companyID"); // Only select companyID and remarks

    if (existingCompleteRemarksHistory) {
      console.log(existingCompleteRemarksHistory, id)
      // Check if the remarks array exists, and if not, initialize it
      if (!existingCompleteRemarksHistory.remarks) {
        existingCompleteRemarksHistory.remarks = [];
      }
      const saveEntry = await CompleteRemarksHistoryLeads.findOneAndUpdate({
        companyID: id
      },
        {
          $push: {
            remarks: [newCompleteRemarks]

          }
        })
      console.log(saveEntry)
    } else {
      // If the company doesn't exist, create a new entry with the new object
      const newCompleteRemarksHistory = new CompleteRemarksHistoryLeads({
        companyID: id,
        "Company Name": currentCompanyName,
        remarks: [newCompleteRemarks], // Store the general remarks
      });

      await newCompleteRemarksHistory.save();
    }

    // Fetch updated company data and remarks history
    const updatedCompany = await CompanyModel.findById(id);
    const remarksHistory = await RemarksHistory.find({ companyID: id });

    // Send the updated company and remarks history data back to the client
    res.status(200).json({ updatedCompany, remarksHistory });
  } catch (error) {
    console.error("Error updating bdmRemarks and adding to remarks history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/delete-bdm-remarks/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;
    const { remarksId } = req.query;

    console.log("Company ID is:", companyId);
    console.log("Remarks ID is:", remarksId);

    // Find the document by companyId
    const data = await CompleteRemarksHistoryLeads.findOne({ companyID: companyId });

    // Check if the company and remarks exist
    if (!data || !data.remarks || data.remarks.length === 0) {
      return res.status(404).json({ message: "Company or remarks not found." });
    }

    // Find the index of the remark to be deleted
    const remarkIndex = data.remarks.findIndex(remark => remark._id.toString() === remarksId);

    // If the remark is not found
    if (remarkIndex === -1) {
      return res.status(404).json({ message: "Remark not found." });
    }

    // Remove the remark from the array
    data.remarks.splice(remarkIndex, 1);

    // Save the updated document after removing the remark
    await data.save();

    // Check if the remarks array is empty after deletion
    let updatedBdmRemarks;
    if (data.remarks.length === 0) {
      // If no remarks left, set 'No Remarks Added' in the company collection
      updatedBdmRemarks = "No Remarks Added";
    } else {
      // If there are remarks left, use the bdmRemarks from the last remaining remark
      updatedBdmRemarks = data.remarks[data.remarks.length - 1].bdmRemarks;
    }

    // Update the company collection's bdmRemarks field
    await CompanyModel.findOneAndUpdate(
      { _id: companyId },
      { bdmRemarks: updatedBdmRemarks },
      { new: true }
    );

    console.log("Updated data after deletion:", data);

    // Return success response
    return res.status(200).json({
      message: "Remark deleted successfully.",
      updatedRemarks: data.remarks,
      updatedBdmRemarks
    });
  } catch (error) {
    console.error("Error deleting remark:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


router.delete("/delete-remarks-history/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Update remarks and fetch updated data in a single operation

    // Fetch updated data and remarks history
    const remarksHistory = await RemarksHistory.findByIdAndDelete({
      companyId: id,
    });

    res.status(200).json({ updatedCompany, remarksHistory, updatedLeadHistory });
  } catch (error) {
    console.error("Error updating remarks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/remarks-delete/:companyId", async (req, res) => {
  const { companyId } = req.params;

  try {
    // Find the company by companyId and update the remarks field
    const updatedCompany = await CompanyModel.findByIdAndUpdate(
      companyId,
      { Remarks: "No Remarks Added" },
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res
      .status(200)
      .json({ message: "Remarks deleted successfully", updatedCompany });
  } catch (error) {
    console.error("Error deleting remarks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// -------------------------------bdm-remarks-delete--------------------------------------

router.delete("/remarks-delete-bdm/:companyId", async (req, res) => {
  const { companyId } = req.params;

  try {
    // Find the company by companyId and update the remarks field
    const updatedCompany = await TeamLeadsModel.findByIdAndUpdate(
      companyId,
      { bdmRemarks: "No Remarks Added" },
      { new: true }
    );

    const updatedCompanyMainModel = await CompanyModel.findByIdAndUpdate(
      companyId,
      { bdmRemarks: "No Remarks Added" },
      { new: true }
    );

    if (!updatedCompany || !updatedCompanyMainModel) {
      return res.status(404).json({ message: "Company not found" });
    }

    res
      .status(200)
      .json({ message: "Remarks deleted successfully", updatedCompany });
  } catch (error) {
    console.error("Error deleting remarks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// -------------------------------  Feedback Remarks  -----------------------------------

router.post("/post-feedback-remarks/:companyId", async (req, res) => {
  const companyId = req.params.companyId;
  const feedbackPoints = req.body.feedbackPoints;
  const feedbackRemarks = req.body.feedbackRemarks;
  //console.log("feedbackPoints" , feedbackPoints)
  try {
    await TeamLeadsModel.findByIdAndUpdate(companyId, {
      feedbackPoints: feedbackPoints,
      feedbackRemarks: feedbackRemarks,
    });

    await CompanyModel.findByIdAndUpdate(companyId, {
      feedbackPoints: feedbackPoints,
      feedbackRemarks: feedbackRemarks,
    });

    res.status(200).json({ message: "Feedback updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/post-feedback-remarks/:companyId", async (req, res) => {
  const companyId = req.params.companyId;
  const { feedbackPoints, feedbackRemarks } = req.body;

  try {
    await TeamLeadsModel.findByIdAndUpdate(companyId, {
      feedbackPoints: feedbackPoints,
      feedbackRemarks: feedbackRemarks,
    });

    await CompanyModel.findByIdAndUpdate(companyId, {
      feedbackPoints: feedbackPoints,
      feedbackRemarks: feedbackRemarks,
    });

    res.status(200).json({ message: "Feedback updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//  *************************************************   Remarks History   *************************************************************

router.get("/remarks-history", async (req, res) => {
  try {
    const remarksHistory = await RemarksHistory.find();
    res.json(remarksHistory);
  } catch (error) {
    console.error("Error fetching remarks history:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/remarks-history/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const remarksHistory = await RemarksHistory.find({ companyID: id });
    res.json(remarksHistory);
  } catch (error) {
    console.error("Error fetching remarks history:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
router.get("/remarks-history-complete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const remarksHistory = await CompleteRemarksHistoryLeads.find({ companyID: id });
    //console.log("id", id, remarksHistory)
    res.json(remarksHistory);
  } catch (error) {
    console.error("Error fetching remarks history:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/complete-new-remarks-history", async (req, res) => {
  try {
    const remarksHistory = await CompleteRemarksHistoryLeads.find();
    res.json(remarksHistory);
  } catch (error) {
    console.error("Error fetching remarks history:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }

})

router.delete("/remarks-history/:id", async (req, res) => {
  const { id } = req.params;
  const { companyId } = req.query;
  console.log("companyId", companyId, id)
  try {
    await RemarksHistory.findByIdAndDelete(id);
    //Now, find the corresponding document in CompleteRemarksHistoryLeads and remove the remark from the `remarks` array
    const updatedLeadHistory = await CompleteRemarksHistoryLeads.findOneAndUpdate(
      { companyID: companyId },
      { $pull: { remarks: { _id: id } } }, // Remove the remark from the remarks array
      { new: true } // Return the updated document
    );

    // // Check if the `remarks` array is empty after the deletion, and if so, optionally delete the document
    if (updatedLeadHistory.remarks.length === 0 && updatedLeadHistory.serviceWiseRemarks.length === 0) {
      await CompleteRemarksHistoryLeads.findOneAndDelete({ companyID: companyId });
    }
    res.json({ success: true, message: "Remarks deleted successfully" });
  } catch (error) {
    console.error("Error deleting remark:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/webhook', async (req, res) => {
  const socketIO = req.io;
  const employeeData = req.body; // Array of employee data from the webhook
  // console.log('Received Webhook Data:', employeeData);


  try {
    for (const employee of employeeData) {
      // console.log('Processing Employee:', employee.emp_name);

      if (employee.call_logs && employee.call_logs.length > 0) {
        for (const log of employee.call_logs) {
          // console.log('Processing Call Log:', log);

          const year = new Date(log.call_date).getFullYear();
          const month = new Date(log.call_date).toLocaleString('default', { month: 'long' });

          // Find the company associated with the call's client_number
          let company = await CompanyModel.findOne({
            "Company Number": log.client_number,
          });
          const employeeDetails = await adminModel.findOne({ ename: employee.emp_name }).select('designation').lean();
          // console.log('Employee Details:', employeeDetails);
          // if (!company) {
          //   console.log(Company not found for number: ${log.client_number});
          //   continue;
          // }
          // console.log(`"company" , ${company}`);

          // console.log(`Found Company: ${company["Company Name"]}, ID: ${company._id}`);

          // Emit a socket message if emp_name does not match ename or bdmName
          if (
            (employeeDetails?.designation === "Sales Executive" ||
              employeeDetails?.designation === "Sales Manager" ||
              employeeDetails?.designation === "Floor Manager") &&
            employee.emp_name.toLowerCase() !== company.ename.toLowerCase() &&
            employee.emp_name.toLowerCase() !== company.bdmName.toLowerCase()
          ) {
            // console.log("socket working")
            socketIO.emit('unexpectedCaller', {
              message: `Unexpected caller detected for company: ${company["Company Name"]}`,
              companyId: company._id,
              companyName: company["Company Name"],
              expectedEmployee: [company.ename, company.bdmName],
              callingEmployeeName: employee.emp_name,
              callDetails: log,
              ename: company.ename,
              bdmName: company.bdmName
            });
            let GetEmployeeProfile = "no-image"
            // console.log(`Mismatch: Employee ${employee.emp_name} called ${company["Company Name"]}`);
            const requestCreate = {
              ename: company.ename,
              actualEmployeeCalling: employee.emp_name,
              requestType: `Unexpected Caller for ${company["Company Name"]}`,
              requestTime: new Date(),
              designation: "SE",
              status: "Unread",
              employee_status: "Unread",
              img_url: GetEmployeeProfile,
              employeeRequestType: `Unexpected Caller`,
              companyName: company["Company Name"],
              callingBdmName: company.bdmName
            }
            const addRequest = new NotiModel(requestCreate);
            const saveRequest = await addRequest.save();

          }


          // If callLogsDetails is missing, initialize it with full structure
          if (!company.callLogsDetails || company.callLogsDetails.length === 0) {
            // console.log('Initializing callLogsDetails with full structure');
            company.callLogsDetails = [
              {
                year: year,
                months: [
                  {
                    month: month,
                    dates: [
                      {
                        date: log.call_date,
                        details: [
                          {
                            callId: log.id,
                            call_date: log.call_date,
                            call_time: log.call_time,
                            call_type: log.call_type,
                            client_country_code: log.client_country_code,
                            client_name: log.client_name,
                            client_number: log.client_number,
                            duration: log.duration,
                            emp_name: log.emp_name,
                            emp_number: log.emp_number,
                            syncedAt: log.synced_at,
                            modifiedAt: log.modified_at,
                            emp_name: employee.emp_name,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ];
          } else {
            // Find or create the year entry
            let yearData = company.callLogsDetails.find((y) => y.year === year);
            if (!yearData) {
              // console.log(`Adding new year: ${year}`);
              yearData = { year, months: [] };
              company.callLogsDetails.push(yearData);
            }

            // Find or create the month entry
            let monthData = yearData.months.find((m) => m.month === month);
            if (!monthData) {
              // console.log(`Adding new month: ${month}`);
              monthData = { month, dates: [] };
              yearData.months.push(monthData);
            }

            // Find or create the date entry
            let dateData = monthData.dates.find((d) => d.date === log.call_date);
            if (!dateData) {
              // console.log(`Adding new date: ${log.call_date}`);
              dateData = { date: log.call_date, details: [] };
              monthData.dates.push(dateData);
            }

            // Check for duplicate call logs
            const isDuplicate = dateData.details.some((detail) => detail.callId === log.id);
            if (!isDuplicate) {
              // console.log(`Adding new call log for date: ${log.call_date}`);
              dateData.details.push({
                callId: log.id,
                call_date: log.call_date,
                call_time: log.call_time,
                call_type: log.call_type,
                client_country_code: log.client_country_code,
                client_name: log.client_name,
                client_number: log.client_number,
                duration: log.duration,
                emp_name: log.emp_name,
                emp_number: log.emp_number,
                syncedAt: log.synced_at,
                modifiedAt: log.modified_at,
                emp_name: employee.emp_name
              });
            } else {
              console.log(`Duplicate call log found for call ID: ${log.id}`);
            }
          }

          // console.log("Updated callLogsDetails", JSON.stringify(company.callLogsDetails, null, 2));

          // Save only the updated callLogsDetails
          await CompanyModel.updateOne(
            { _id: company._id },
            { $set: { callLogsDetails: company.callLogsDetails } }
          );

          // console.log(`Call logs updated successfully for company ID: ${company._id}`);
        }
      } else {
        console.log(`No call logs for employee: ${employee.emp_name}`);
      }
    }

    res.status(200).json({ message: 'Call logs saved successfully' });
  } catch (error) {
    // console.error('Error processing webhook:', error.message);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

router.post("/save-client-call-history", async (req, res) => {
  const { client_number, callHistoryData } = req.body;
  

  try {
    // Convert client_number to a number
    const numericClientNumber = Number(client_number);
    // console.log("type after conversion:", typeof(numericClientNumber), numericClientNumber);

    // Validate the conversion
    if (isNaN(numericClientNumber)) {
        return res.status(400).json({ error: "Invalid client number format" });
    }

      // Find the company by client number
      const company = await CompanyModel.findOne({ "Company Number": numericClientNumber });

      if (!company) {
          return res.status(404).json({ error: "Company not found" });
      }
      

      // Filter out duplicate call logs based on callId
      const existingCallIds = company.clientCallHistory?.map((log) => log.callId) || [];
      const newCallHistory = callHistoryData
          .filter((call) => !existingCallIds.includes(call.id))
          .map((call) => ({
              client_number: call.client_number,
              call_date: call.call_date,
              call_time: call.call_time,
              call_type: call.call_type,
              client_country_code: call.client_country_code,
              client_name: call.client_name,
              duration: call.duration,
              emp_name: call.emp_name,
              emp_number: call.emp_number,
              synced_at: call.synced_at,
              callId: call.id,
          }));

      // Use the `$push` operator to append new call logs without modifying other fields
      await CompanyModel.updateOne(
          { "Company Number": numericClientNumber },
          {
              $push: {
                  clientCallHistory: { $each: newCallHistory },
              },
          }
      );

      res.status(200).json({ message: "Call history saved successfully" });
  } catch (error) {
      console.error("Error saving call history:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// File path to store progress
const PROGRESS_FILE = path.join(__dirname, "batch_progress.json");

// Function to save progress
const saveProgress = (lastProcessedIndex) => {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ lastProcessedIndex }), "utf-8");
};

// Function to load progress
const loadProgress = () => {
  if (fs.existsSync(PROGRESS_FILE)) {
    const data = fs.readFileSync(PROGRESS_FILE, "utf-8");
    return JSON.parse(data)?.lastProcessedIndex || 0;
  }
  return 0;
};

// Function to process call history in batches
const processCallHistoryInBatches = async () => {
  try {
    console.log("Starting batch processing...");

    const companies = await CompanyModel.find({}, { "Company Number": 1 });
    const companyNumbers = companies
      .map((company) => String(company["Company Number"]).trim())
      .filter((num) => num && !isNaN(num)); // Filter valid numbers

    if (companyNumbers.length === 0) {
      console.log("No valid company numbers found.");
      return;
    }

    console.log(`Total company numbers to process: ${companyNumbers.length}`);

    const chunks = [];
    for (let i = 0; i < companyNumbers.length; i += 10) {
      chunks.push(companyNumbers.slice(i, i + 10));
    }

    console.log(`Total chunks to process: ${chunks.length}`);

    // Load last processed index
    let lastProcessedIndex = loadProgress();
    console.log(`Resuming from chunk index: ${lastProcessedIndex}`);

    for (let i = lastProcessedIndex; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length}:`, chunk);

      await fetchAndSaveCallHistory(chunk);

      console.log(`Chunk ${i + 1}/${chunks.length} processed successfully.`);

      // Save progress
      saveProgress(i + 1);

      if (i < chunks.length - 1) {
        console.log("Waiting for 2 minutes before processing the next chunk...");
        await new Promise((resolve) => setTimeout(resolve, 120000)); // 2 minutes
      }
    }

    console.log("All chunks processed successfully. Resetting progress.");
    saveProgress(0); // Reset progress when all chunks are processed
  } catch (error) {
    console.error("Error processing call history in batches:", error.message);
  }
};

const fetchAndSaveCallHistory = async (clientNumbers) => {
  try {
    const today = new Date();
    const todayStartDate = new Date(today);
    const todayEndDate = new Date(today);

    todayEndDate.setUTCHours(13, 0, 0, 0);
    todayStartDate.setMonth(todayStartDate.getMonth() - 5);
    todayStartDate.setUTCHours(4, 0, 0, 0);

    const startTimestamp = Math.floor(todayStartDate.getTime() / 1000);
    const endTimestamp = Math.floor(todayEndDate.getTime() / 1000);

    const body = {
      call_from: startTimestamp,
      call_to: endTimestamp,
      call_types: ["Missed", "Rejected", "Incoming", "Outgoing"],
      client_numbers: clientNumbers,
    };

    console.log("Fetching call history for:", clientNumbers);
    const apiKey = "bc4e10cf-23dd-47e6-a1a3-2dd889b6dd46"; // Replace with your actual API key
    const response = await axios({
      method: "POST",
      url: "https://api1.callyzer.co/v2/call-log/history",
      data: body, // Correctly send the body using "data"
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const callHistoryData = response.data?.result || [];

    console.log(`Fetched ${callHistoryData.length} call logs for batch.`);

    for (const call of callHistoryData) {
      const clientNumber = Number(call.client_number);
      if (isNaN(clientNumber)) continue;

      const company = await CompanyModel.findOne({
        "Company Number": clientNumber,
      });

      if (!company) continue;

      const existingCallIds =
        company.clientCallHistory?.map((log) => log.callId) || [];
      const newCallHistory = callHistoryData
        .filter((call) => !existingCallIds.includes(call.id))
        .map((call) => ({
          client_number: call.client_number,
          call_date: call.call_date,
          call_time: call.call_time,
          call_type: call.call_type,
          client_country_code: call.client_country_code,
          client_name: call.client_name,
          duration: call.duration,
          emp_name: call.emp_name,
          emp_number: call.emp_number,
          synced_at: call.synced_at,
          callId: call.id,
        }));

      if (newCallHistory.length > 0) {
        await CompanyModel.updateOne(
          { "Company Number": clientNumber },
          {
            $push: {
              clientCallHistory: { $each: newCallHistory },
            },
          }
        );

        console.log(
          `Saved ${newCallHistory.length} new call logs for company number: ${clientNumber}`
        );
      }
    }
  } catch (error) {
    console.error("Error fetching or saving call history:", error);
  }
};

let isProcessing = false;

// cron.schedule("*/2 * * * *", async () => {
//   if (isProcessing) {
//     console.log("Previous job still running. Skipping this iteration.");
//     return;
//   }

//   try {
//     isProcessing = true;
//     console.log("Cron job started: Fetching and processing call history.");
//     await processCallHistoryInBatches();
//   } finally {
//     isProcessing = false;
//   }
// });

// Cron job to run every 10 minutes
// cron.schedule("*/10 * * * *", async () => {
//   console.log("Cron Job Started: Fetching and saving call data every 10 minutes.");

//   try {
//     const today = new Date();
//     const todayStartDate = new Date(today);
//     const todayEndDate = new Date(today);

//     todayEndDate.setUTCHours(13, 0, 0, 0);
//     todayStartDate.setMonth(todayStartDate.getMonth());
//     todayStartDate.setUTCHours(4, 0, 0, 0);

//     const startTimestamp = Math.floor(todayStartDate.getTime() / 1000);
//     const endTimestamp = Math.floor(todayEndDate.getTime() / 1000);

//     console.log(startTimestamp ,endTimestamp)

//     const body = {
//       call_from: startTimestamp,
//       call_to: endTimestamp,
//       call_types: ["Missed", "Rejected", "Incoming", "Outgoing"],
//       client_numbers: [], // Send an empty client numbers array
//     };

//     console.log("Fetching call data with empty client numbers array Daily report.");
//     const apiKey = "bc4e10cf-23dd-47e6-a1a3-2dd889b6dd46"; // Replace with your actual API key
//     const response = await axios({
//       method: "POST",
//       url: "https://api1.callyzer.co/v2/call-log/history",
//       data: body, // Correctly send the body using "data"
//       headers: {
//         Authorization: `Bearer ${apiKey}`,
//         "Content-Type": "application/json",
//       },
//     });

//     const callHistoryData = response.data?.result || [];

//     console.log(`Fetched ${callHistoryData.length} call logs for this batch daily report.`);

//     for (const call of callHistoryData) {
//       const clientNumber = Number(call.client_number);
//       if (isNaN(clientNumber)) continue;

//       const company = await CompanyModel.findOne({
//         "Company Number": clientNumber,
//       });

//       if (!company) {
//         console.log(`No matching company found for client number: ${clientNumber}`);
//         continue;
//       }

//       const existingCallIds =
//         company.clientCallHistory?.map((log) => log.callId) || [];
//       const newCallHistory = callHistoryData
//         .filter((call) => !existingCallIds.includes(call.id))
//         .map((call) => ({
//           client_number: call.client_number,
//           call_date: call.call_date,
//           call_time: call.call_time,
//           call_type: call.call_type,
//           client_country_code: call.client_country_code,
//           client_name: call.client_name,
//           duration: call.duration,
//           emp_name: call.emp_name,
//           emp_number: call.emp_number,
//           synced_at: call.synced_at,
//           callId: call.id,
//         }));

//       if (newCallHistory.length > 0) {
//         await CompanyModel.updateOne(
//           { "Company Number": clientNumber },
//           {
//             $push: {
//               clientCallHistory: { $each: newCallHistory },
//             },
//           }
//         );

//         console.log(
//           `Saved ${newCallHistory.length} new call logs for company number: ${clientNumber} daily report`
//         );
//       }
//     }

//     console.log("Call data processing completed for this batch.");
//   } catch (error) {
//     console.error("Error fetching or saving call data daily report:", error);
//   }
// });

cron.schedule("*/10 * * * *", async () => {
  console.log("Cron Job Started: Fetching and saving call data every 10 minutes.");

  try {
    const today = new Date();
    const todayStartDate = new Date(today);
    const todayEndDate = new Date(today);

    todayEndDate.setUTCHours(13, 0, 0, 0);
    todayStartDate.setMonth(todayStartDate.getMonth());
    todayStartDate.setUTCHours(4, 0, 0, 0);

    const startTimestamp = Math.floor(todayStartDate.getTime() / 1000);
    const endTimestamp = Math.floor(todayEndDate.getTime() / 1000);

    console.log(startTimestamp, endTimestamp);

    const body = {
      call_from: startTimestamp,
      call_to: endTimestamp,
      call_types: ["Missed", "Rejected", "Incoming", "Outgoing"],
      client_numbers: [], // Send an empty client numbers array
    };

    console.log("Fetching call data with empty client numbers array for the daily report.");
    const apiKey = "bc4e10cf-23dd-47e6-a1a3-2dd889b6dd46"; // Replace with your actual API key
    const response = await axios({
      method: "POST",
      url: "https://api1.callyzer.co/v2/call-log/history",
      data: body,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const callHistoryData = response.data?.result || [];
    console.log(`Fetched ${callHistoryData.length} call logs for this batch daily report.`);

    // Group call logs by client_number
    const groupedCallLogs = callHistoryData.reduce((acc, call) => {
      const clientNumber = call.client_number;
      if (!acc[clientNumber]) {
        acc[clientNumber] = [];
      }
      acc[clientNumber].push({
        client_number: call.client_number,
        call_date: call.call_date,
        call_time: call.call_time,
        call_type: call.call_type,
        client_country_code: call.client_country_code,
        client_name: call.client_name,
        duration: call.duration,
        emp_name: call.emp_name,
        emp_number: call.emp_number,
        synced_at: call.synced_at,
        callId: call.id,
      });
      return acc;
    }, {});

    // Process each client number
    for (const clientNumber in groupedCallLogs) {
      const company = await CompanyModel.findOne({ "Company Number": Number(clientNumber) });

      if (!company) {
        console.log(`No matching company found for client number: ${clientNumber}`);
        continue;
      }

      const existingCallIds = company.clientCallHistory?.map((log) => log.callId) || [];
      const newCallHistory = groupedCallLogs[clientNumber].filter(
        (call) => !existingCallIds.includes(call.callId)
      );

      if (newCallHistory.length > 0) {
        await CompanyModel.updateOne(
          { "Company Number": Number(clientNumber) },
          {
            $push: {
              clientCallHistory: { $each: newCallHistory },
            },
          }
        );

        console.log(
          `Saved ${newCallHistory.length} new call logs for company number: ${clientNumber}`
        );
      }
    }

    console.log("Call data processing completed for this batch.");
  } catch (error) {
    console.error("Error fetching or saving call data daily report:", error);
  }
});




module.exports = router;