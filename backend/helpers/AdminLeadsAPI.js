var express = require('express');
var router = express.Router()
const dotenv = require('dotenv')
dotenv.config();
const CompanyModel = require("../models/Leads.js");
const RecentUpdatesModel = require('../models/RecentUpdates.js')
const { exec } = require("child_process");
const TeamLeadsModel = require('../models/TeamLeads.js');
const FollowUpModel = require("../models/FollowUp");
const { Parser } = require('json2csv');

const convertToCSV = (json) => {
  try {
    const parser = new Parser();
    return parser.parse(json);
  } catch (error) {
    console.error('Error converting to CSV:', error);
    throw error;
  }
};

router.get('/', async function (req, res) {
  try {
    res.status(200).json({ message: "running" })
  } catch (err) {
    console.log('Error logging in with OAuth2 user', err);
  }

})
// router.post("/exportLeads/", async (req, res) => {
//   try {
//     const selectedIds = req.body;

//     const leads = await CompanyModel.find({
//       _id: { $in: selectedIds },
//     });

//     const csvData = [];
//     // Push the headers as the first row
//     csvData.push([
//       "SR. NO",
//       "Company Name",
//       "Company Number",
//       "Company Email",
//       "Company Incorporation Date  ",
//       "City",
//       "State",
//       "Company Address",
//       "Director Name(First)",
//       "Director Number(First)",
//       "Director Email(First)",
//       "Director Name(Second)",
//       "Director Number(Second)",
//       "Director Email(Second)",
//       "Director Name(Third)",
//       "Director Number(Third)",
//       "Director Email(Third)",
//       "ename",
//       "AssignDate",
//       "Status",
//       "Remarks",
//     ]);

//     function formatDateFinal(timestamp) {
//       const date = new Date(timestamp);
//       const day = date.getDate().toString().padStart(2, "0");
//       const month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0
//       const year = date.getFullYear();
//       return `${day}/${month}/${year}`;
//   }

//     // Push each lead as a row into the csvData array
//     leads.forEach((lead, index) => {
//       const rowData = [
//         index + 1,
//         lead["Company Name"],
//         lead["Company Number"],
//         lead["Company Email"],
//         formatDateFinal(lead["Company Incorporation Date  "]),
//         lead["City"],
//         lead["State"],
//         lead["Company Address"],
//         lead["Director Name(First)"],
//         lead["Director Number(First)"],
//         lead["Director Email(First)"],
//         lead["Director Name(Second)"],
//         lead["Director Number(Second)"],
//         lead["Director Email(Second)"],
//         lead["Director Name(Third)"],
//         lead["Director Number(Third)"],
//         lead["Director Email(Third)"],
//         lead["ename"],
//         formatDateFinal(lead["AssignDate"]),
//         lead["Status"],
//         `"${lead["Remarks"]}"`,
//       ];
//       csvData.push(rowData);
//       // console.log("rowData:" , rowData)
//     });

//     // Use fast-csv to stringify the csvData array
//     res.setHeader("Content-Type", "text/csv");
//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=UnAssignedLeads_Admin.csv"
//     );

//     const csvString = csvData.map((row) => row.join(",")).join("\n");
//     // Send response with CSV data
//     // Send response with CSV data
//     //console.log(csvString)
//     res.status(200).end(csvString);
//     // console.log(csvString)
//     // Here you're ending the response
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// });

router.post('/exportLeads', async (req, res) => {
  try {
    const {
      selectedRows, 
      isFilter, 
      dataStatus, 
      selectedStatus, 
      selectedState, 
      selectedNewCity, 
      selectedBDEName, 
      selectedAssignDate, 
      selectedUploadedDate, 
      selectedAdminName, 
      selectedYear, 
      selectedCompanyIncoDate
    } = req.body;

    let query = { _id: { $in: selectedRows } }; // Start with selectedRows

    // Construct query object based on filters if any filters are applied
    if (isFilter) {
      if (selectedStatus) query.Status = selectedStatus;
      if (selectedState) query.State = selectedState;
      if (selectedNewCity) query.City = selectedNewCity;
      if (selectedAssignDate) {
        query.AssignDate = {
          $gte: new Date(selectedAssignDate).toISOString(),
          $lt: new Date(new Date(selectedAssignDate).setDate(new Date(selectedAssignDate).getDate() + 1)).toISOString()
        };
      }
      if (selectedAdminName && selectedAdminName.trim() !== '') {
        query.UploadedBy = new RegExp(`^${selectedAdminName.trim()}$`, 'i');
      }
      if (selectedUploadedDate) {
        query.UploadedDate = {
          $gte: new Date(selectedUploadedDate).toISOString(),
          $lt: new Date(new Date(selectedUploadedDate).setDate(new Date(selectedUploadedDate).getDate() + 1)).toISOString()
        };
      }
      if (selectedYear) {
        const yearStartDate = new Date(`${selectedYear}-01-01T00:00:00.000Z`);
        const yearEndDate = new Date(`${selectedYear}-12-31T23:59:59.999Z`);
        query["Company Incorporation Date"] = {
          $gte: yearStartDate,
          $lt: yearEndDate
        };
      }
      if (selectedCompanyIncoDate) {
        query["Company Incorporation Date"] = {
          $gte: new Date(selectedCompanyIncoDate).toISOString(),
          $lt: new Date(new Date(selectedCompanyIncoDate).setDate(new Date(selectedCompanyIncoDate).getDate() + 1)).toISOString()
        };
      }

      // Apply data status filters
      if (dataStatus === 'Unassigned') {
        query.ename = 'Not Alloted';
      } else if (dataStatus === 'Assigned') {
        query.ename = { $ne: 'Not Alloted' };
      }
    }

    // Query to get the leads to be exported
    const leads = await CompanyModel.find(query).lean();

    // Convert leads to CSV and send as response
    const csv = convertToCSV(leads);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${dataStatus === 'Assigned' ? 'AssignedLeads_Admin.csv' : 'UnAssignedLeads_Admin.csv'}`);
    res.status(200).send(csv);

  } catch (error) {
    console.error('Error exporting leads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.post("/manual", async (req, res) => {
  const receivedData = req.body;
  //console.log("receiveddata" , receivedData)

  // console.log(receivedData);

  try {
    const employee = new CompanyModel(receivedData);
    const savedEmployee = await employee.save();
    // console.log("Data sent");
    res
      .status(200)
      .json(savedEmployee || { message: "Data sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error("Error saving employee:", error.message);
  }
})

// router.get('/getIds', async (req, res) => {
//   try {
//     const { dataStatus } = req.query;

//     let query = {};
//     if (dataStatus === 'Unassigned') {
//       query = { ename: 'Not Alloted' };
//     } else if (dataStatus === 'Assigned') {
//       query = { ename: { $ne: 'Not Alloted' } };
//     }

//     // Query the collection to get only the _id fields
//     const getId = await CompanyModel.find(query, '_id');

//     // Extract the _id values into an array
//     const allIds = getId.map(doc => doc._id);

//     // Send the array of IDs as a response
//     res.status(200).json(allIds);
//   } catch (error) {
//     console.error('Error fetching IDs:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
router.get('/getIds', async (req, res) => {
  try {
    const {
      dataStatus,
      selectedStatus,
      selectedState,
      selectedNewCity,
      selectedBDEName,
      selectedAssignDate,
      selectedUploadedDate,
      selectedAdminName,
      selectedYear,
      selectedCompanyIncoDate
    } = req.query;

    let query = {};

    // Construct query object based on filters
    if (selectedStatus) query.Status = selectedStatus;
    if (selectedState) query.State = selectedState;
    if (selectedNewCity) query.City = selectedNewCity;
    if (selectedAssignDate) {
      query.AssignDate = {
        $gte: new Date(selectedAssignDate).toISOString(),
        $lt: new Date(new Date(selectedAssignDate).setDate(new Date(selectedAssignDate).getDate() + 1)).toISOString()
      };
    }
    if (selectedAdminName && selectedAdminName.trim() !== '') {
      query.UploadedBy = new RegExp(`^${selectedAdminName.trim()}$`, 'i');
    }
    if (selectedUploadedDate) {
      query.UploadedDate = {
        $gte: new Date(selectedUploadedDate).toISOString(),
        $lt: new Date(new Date(selectedUploadedDate).setDate(new Date(selectedUploadedDate).getDate() + 1)).toISOString()
      };
    }
    if (selectedYear) {
      const yearStartDate = new Date(`${selectedYear}-01-01T00:00:00.000Z`);
      const yearEndDate = new Date(`${selectedYear}-12-31T23:59:59.999Z`);
      query["Company Incorporation Date"] = {
        $gte: yearStartDate,
        $lt: yearEndDate
      };
    }
    if (selectedCompanyIncoDate) {
      query["Company Incorporation Date"] = {
        $gte: new Date(selectedCompanyIncoDate).toISOString(),
        $lt: new Date(new Date(selectedCompanyIncoDate).setDate(new Date(selectedCompanyIncoDate).getDate() + 1)).toISOString()
      };
    }

    // Apply data status filters
    if (dataStatus === 'Unassigned') {
      query.ename = 'Not Alloted';
    } else if (dataStatus === 'Assigned') {
      query.ename = { $ne: 'Not Alloted' };
    }

    // Query the collection to get only the _id fields
    const getId = await CompanyModel.find(query, '_id');

    // Extract the _id values into an array
    const allIds = getId.map(doc => doc._id);

    // Send the array of IDs as a response
    res.status(200).json(allIds);
  } catch (error) {
    console.error('Error fetching IDs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// router.post("/postAssignData", async (req, res) => {
//   const { employeeSelection, selectedObjects, title, date, time } = req.body;

//   // If not assigned, post data to MongoDB or perform any desired action
//   const updatePromises = selectedObjects.map((obj) => {
//     // Add AssignData property with the current date
//     const updatedObj = {
//       ...obj,
//       ename: employeeSelection,
//       AssignDate: new Date(),
//     };

//     return CompanyModel.updateOne({ _id: obj._id }, updatedObj);
//   });

//   // Add the recent update to the RecentUpdatesModel
//   const newUpdate = new RecentUpdatesModel({
//     title: title,
//     date: date,
//     time: time,
//   });
//   await newUpdate.save();

//   // Execute all update promises
//   await Promise.all(updatePromises);

//   res.json({ message: "Data posted successfully" });
// });

router.post("/postAssignData", async (req, res) => {
  const { employeeSelection, selectedObjects, title, date, time } = req.body;

  // Bulk operations for CompanyModel
  const bulkOperationsCompany = selectedObjects.map((obj) => ({
    updateOne: {
      filter: { _id: obj._id },
      update: {
        $set: {
          ename: employeeSelection,
          AssignDate: new Date(),
          bdmAcceptStatus: "NotForwarded",
          feedbackPoints: [],
          multiBdmName: [],
          Status: "Untouched"
        },
        $unset: {
          bdmName: "",
          bdeOldStatus: "",
          bdeForwardDate: "",
          bdmStatusChangeDate: "",
          bdmStatusChangeTime: "",
          bdmRemarks: "",
          RevertBackAcceptedCompanyRequest:""
        }
      }
    }
  }));

  // Bulk operations for TeamLeadsModel
  const bulkOperationsTeamLeads = selectedObjects.map((obj) => ({
    deleteOne: {
      filter: { _id: obj._id }
    }
  }));

  const bulkOperationsProjection = selectedObjects.map((obj) => ({
    deleteOne: {
      filter: { companyName: obj["Company Name"] }
    }
  }))

  try {
    // Perform bulk update on CompanyModel
    await CompanyModel.bulkWrite(bulkOperationsCompany);

    // Perform bulk delete on TeamLeadsModel
    await TeamLeadsModel.bulkWrite(bulkOperationsTeamLeads);

    await FollowUpModel.bulkWrite(bulkOperationsProjection)

    // Add the recent update to the RecentUpdatesModel
    const newUpdate = new RecentUpdatesModel({
      title,
      date,
      time
    });
    await newUpdate.save();

    res.json({ message: "Data posted successfully" });
  } catch (error) {
    console.error("Error posting assign data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.delete("/deleteAdminSelectedLeads", async (req, res) => {
  const { selectedRows } = req.body;

  try {
    // Use Mongoose to delete rows by their IDs
    const response = await CompanyModel.deleteMany({ _id: { $in: selectedRows } });
    const response2 = await TeamLeadsModel.deleteMany({ _id: { $in: selectedRows } })
    const followModelResponse = await Promise.all(selectedRows.map(async (companyId) => {
      const company = await CompanyModel.findById(companyId);
      if (company) {
        // Find and delete documents from followmodel collection based on company name
        return FollowUpModel.deleteOne({ companyName: company['Company Name'] });
      }
      return null;
    }));
    console.log(response)
    res.status(200).json({
      message:
        "Rows deleted successfully and backup created successfully.",
    });

    // Trigger backup on the server
    // exec(
    //   `mongodump --db AdminTable --collection newcdatas --out ${process.env.BACKUP_PATH}`,
    //   (error, stdout, stderr) => {
    //     if (error) {
    //       console.error("Error creating backup:", error);
    //       // Respond with an error if backup fails
    //       res.status(500).json({ error: "Error creating backup." });
    //     } else {
    //       // console.log("Backup created successfully:", stdout);
    //       // Respond with success message if backup is successful
    //       res.status(200).json({
    //         message:
    //           "Rows deleted successfully and backup created successfully.",
    //       });
    //     }
    //   }
    // );
  } catch (error) {
    console.error("Error deleting rows:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get('/searchCompany', async (req, res) => {
  try {
    const { id } = req.query;

    // Check if ID is provided and is a valid MongoDB ObjectId

    // Search for the company in the database
    const company = await CompanyModel.findById(id);

    // Return the company data
    res.status(200).json(company);
  } catch (error) {
    console.error('Error searching for company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




module.exports = router;