var express = require('express');
var router = express.Router()
const dotenv = require('dotenv')
dotenv.config();

const CompanyModel = require("../models/Leads");
// const authRouter = require('./helpers/Oauth');
// const requestRouter = require('./helpers/request');
const RemarksHistory = require("../models/RemarksHistory");
const TeamLeadsModel = require("../models/TeamLeads.js");
const CompleteRemarksHistoryLeads = require('../models/CompleteRemarksHistoryLeads.js');
const axios = require('axios');





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
  const emp_numbers = ["7000879031"]; // Numbers fetched from the frontend
  const providedEmpNumber = req.body.providedEmpNumber; // Expected employee number sent by frontend
  const employeeData = req.body;
  console.log('Provided employee number:', providedEmpNumber , req.body);

  for (const employee of employeeData) {
    console.log('Processing employee:', employee.emp_name);

    // Check if `call_logs` exists and log its contents
    if (employee.call_logs && employee.call_logs.length > 0) {
      // Iterate and log each call log
      employee.call_logs.forEach((log, index) => {
        console.log(`Call Log ${index + 1}:`, log);
      });
    } else {
      console.log(`No call logs for employee: ${employee.emp_name}`);
    }
  }

  // const today = new Date();
  // const todayStartDate = new Date(today);
  // const todayEndDate = new Date(today);

  // // Set timestamps
  // todayEndDate.setUTCHours(13, 0, 0, 0); // End at 1 PM UTC
  // todayStartDate.setMonth(todayStartDate.getMonth());
  // todayStartDate.setUTCHours(4, 0, 0, 0); // Start at 4 AM UTC

  // const startTimestamp = Math.floor(todayStartDate.getTime() / 1000); // seconds
  // const endTimestamp = Math.floor(todayEndDate.getTime() / 1000); // seconds

  // const externalApiUrl = "https://api1.callyzer.co/v2/call-log/history";

  // try {
  //   const apiKey = "bc4e10cf-23dd-47e6-a1a3-2dd889b6dd46";
  //   const body = {
  //     call_from: startTimestamp,
  //     call_to: endTimestamp,
  //     call_types: ["Missed", "Rejected", "Incoming", "Outgoing"],
  //     client_numbers: emp_numbers,
  //   };

  //   console.log('Fetching call logs from external API with body:', body);

  //   const response = await axios({
  //     method: 'POST',
  //     url: externalApiUrl,
  //     headers: {
  //       'Authorization': `Bearer ${apiKey}`,
  //       'Content-Type': 'application/json',
  //     },
  //     data: body, // Correctly send the body using "data"
  //   });

  //   const callLogs = response.data.result; // Get call logs
  //   console.log('Fetched Call Logs:', callLogs);

  //   for (const log of callLogs) {
  //     console.log('Processing log:', log);

  //     const year = new Date(log.call_date).getFullYear();
  //     const month = new Date(log.call_date).toLocaleString('default', { month: 'long' });

  //     // Update only the callLogsDetails of the company
  //     const company = await CompanyModel.findOne({
  //       "Company Number": log.client_number,
  //     });

  //     if (!company) {
  //       console.log(`Company not found for number: ${log.client_number}`);
  //       continue;
  //     }

  //     console.log(`Updating call log details for company: ${company._id}`);

  //     let callLogsDetails = company.callLogsDetails || [];
  //     let yearData = callLogsDetails.find((y) => y.year === year);

  //     // Add year if not present
  //     if (!yearData) {
  //       console.log(`Adding new year: ${year}`);
  //       yearData = { year, months: [] };
  //       callLogsDetails.push(yearData);
  //     }

  //     let monthData = yearData.months.find((m) => m.month === month);

  //     // Add month if not present
  //     if (!monthData) {
  //       console.log(`Adding new month: ${month}`);
  //       monthData = { month, dates: [] };
  //       yearData.months.push(monthData);
  //     }

  //     let dateData = monthData.dates.find((d) => d.date === log.call_date);

  //     // Add date if not present
  //     if (!dateData) {
  //       console.log(`Adding new date: ${log.call_date}`);
  //       dateData = { date: log.call_date, details: [] };
  //       monthData.dates.push(dateData);
  //     }

  //     // Check if the call log already exists
  //     const isDuplicate = dateData.details.some((detail) => detail.callId === log.id);
  //     if (!isDuplicate) {
  //       console.log(`Adding new call log for date: ${log.call_date}`);
  //       dateData.details.push({
  //         callId: log.id,
  //         call_date: log.call_date,
  //         call_time: log.call_time,
  //         call_type: log.call_type,
  //         client_country_code: log.client_country_code,
  //         client_name: log.client_name,
  //         client_number: log.client_number,
  //         duration: log.duration,
  //         emp_name: log.emp_name,
  //         emp_number: log.emp_number,
  //         syncedAt: log.synced_at,
  //         modifiedAt: log.modified_at,
  //       });

  //       // Emit socket message for unexpected emp_number
  //       if (log.emp_number !== providedEmpNumber) {
  //         console.log(`Unexpected call detected from ${log.emp_number}`);
  //         socketIO.emit('unexpectedCall', {
  //           message: `Unexpected call detected from ${log.emp_number} on ${log.call_date}`,
  //           date: log.call_date,
  //           emp_number: log.emp_number,
  //         });
  //       }
  //     } else {
  //       console.log(`Duplicate log entry detected for call ID: ${log.id}`);
  //     }

  //     // Update only the callLogsDetails field in the database
  //     await CompanyModel.updateOne(
  //       { _id: company._id },
  //       { callLogsDetails: callLogsDetails }
  //     );

  //     console.log(`Call logs updated successfully for company ID: ${company._id}`);
  //   }

  //   res.status(200).json({ message: 'Call logs saved successfully' });
  // } catch (error) {
  //   console.error('Error fetching data from external API:', error.response?.data || error.message);
  //   res.status(500).json({ error: 'Failed to fetch data from external API' });
  // }
});


// router.post('/webhook', async (req, res) => {
//   const socketIO = req.io;
//   const emp_numbers = ["7000879031"];

//   const today = new Date();
//   const todayStartDate = new Date(today);
//   const todayEndDate = new Date(today);

//   // Set timestamps
//   todayEndDate.setUTCHours(13, 0, 0, 0); // End at 1 PM UTC
//   todayStartDate.setMonth(todayStartDate.getMonth());
//   todayStartDate.setUTCHours(4, 0, 0, 0); // Start 6 months ago at 4 AM UTC

//   const startTimestamp = Math.floor(todayStartDate.getTime() / 1000); // seconds
//   const endTimestamp = Math.floor(todayEndDate.getTime() / 1000);   // seconds

//   const externalApiUrl = "https://api1.callyzer.co/v2/call-log/history";

//   try {
//     // Fetch data from the external API using axios with GET request and body
//     const apiKey = "bc4e10cf-23dd-47e6-a1a3-2dd889b6dd46";
//     const body = {
//       call_from: startTimestamp,
//       call_to: endTimestamp,
//       call_types: ["Missed", "Rejected", "Incoming", "Outgoing"],
//       client_numbers: emp_numbers
//     };

//     const response = await axios({
//       method: 'POST',
//       url: externalApiUrl,
//       data: { emp_numbers }, // Send the data in the body of the GET request
//       headers: {
//         'Authorization': `Bearer ${apiKey}`,
//         'Content-Type': 'application/json'
//       },
//       data: body // Correctly send the body using "data"
//     });

//     console.log(response.data); // Log the response data
//      socketIO.emit("callLogs", {

//       updatedDocument: response.data,

//     })
//     res.status(200).json(response.data); // Send response back to the client
//   } catch (error) {
//     // Handle any errors
//     console.error('Error fetching data from external API:', error);
//     console.error('Error fetching data from external API:', error.response?.data || error.message);
//     res.status(500).json({ error: 'Failed to fetch data from external API' });
//   }
// });




module.exports = router;