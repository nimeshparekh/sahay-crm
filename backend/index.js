const express = require("express");
const cors = require("cors");
const compression = require("compression");
const pdf = require("html-pdf");
// const { Server } = require("socket.io");
// const http = require("http");
// const server = http.createServer(app);
// const session = require('express-session');
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const { OAuth2Client } = require('google-auth-library');
// const nodemailer = require('nodemailer');
const mongoose = require("mongoose");
// const googleAuthRouter = require('./helpers/googleAuth');
const adminModel = require("./models/Admin");
const CompanyModel = require("./models/Leads");
const CompanyRequestModel = require("./models/LeadsRequest");
const RequestModel = require("./models/Request");
const path = require("path");
const fs = require("fs");
const RequestGModel = require("./models/RequestG");
const { exec } = require("child_process");
const jwt = require("jsonwebtoken");
const onlyAdminModel = require("./models/AdminTable");
const DeletedDatabase = require("./models/DeletedCollection");
const { sendMail } = require("./helpers/sendMail");
const { mailFormat } = require("./helpers/mailFormat");
const multer = require("multer");
// const authRouter = require('./helpers/Oauth');
// const requestRouter = require('./helpers/request');
const RemarksHistory = require("./models/RemarksHistory");
const EmployeeHistory = require("./models/EmployeeHistory");
const LoginDetails = require("./models/loginDetails");
const RequestDeleteByBDE = require("./models/Deleterequestbybde");
const BookingsRequestModel = require("./models/BookingsEdit");
const json2csv = require("json2csv").parse;
const fastCsv = require("fast-csv");
const RecentUpdatesModel = require("./models/RecentUpdates");
const FollowUpModel = require("./models/FollowUp");
const DraftModel = require("./models/DraftLeadform");
const { type } = require("os");
const RedesignedLeadformModel = require("./models/RedesignedLeadform");
const EditableDraftModel = require("./models/EditableDraftModel");
const RedesignedDraftModel = require("./models/RedesignedDraftModel");
const { sendMail2 } = require("./helpers/sendMail2");
const { sendMail3 } = require("./helpers/sendMail3");
const { sendMail4 } = require("./helpers/sendMail4");
const pdfAttachment = path.join("./helpers/src", './MITC.pdf');
//const axios = require('axios');
const crypto = require("crypto");
const TeamModel = require("./models/TeamModel.js");
const TeamLeadsModel = require("./models/TeamLeads.js");
const RequestMaturedModel = require("./models/RequestMatured.js");
const InformBDEModel = require("./models/InformBDE.js");
const { dataform_v1beta1 } = require("googleapis");
const bookingsAPI = require("./helpers/bookingAPI.js");
const AdminLeadsAPI = require("./helpers/AdminLeadsAPI.js");
const RemarksAPI = require("./helpers/Remarks.js");
const bdmAPI = require("./helpers/bdmAPI.js");
const EmployeeAPI = require("./helpers/EmployeeAPI.js");
const ProjectionAPI = require("./helpers/ProjectionAPI.js");
const RequestAPI = require("./helpers/RequestAPI.js");
const companyAPI = require("./helpers/Company_dataAPI.js");
const TeamsAPI = require("./helpers/TeamsAPI.js");
const userModel = require("./models/CompanyBusinessInput.js");
const processAttachments = require("./helpers/sendMail3.js");
const { Parser } = require("json2csv");
const { file } = require("googleapis/build/src/apis/file/index.js");
// const { Cashfree } = require('cashfree-pg');

// const http = require('http');
// const socketIo = require('socket.io');
require("dotenv").config();

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(compression());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use("/api/admin-leads", AdminLeadsAPI);
app.use("/api/remarks", RemarksAPI);
app.use("/api/bookings", bookingsAPI)
app.use('/api/company-data', companyAPI)
app.use('/api/requests', RequestAPI)
app.use('/api/teams', TeamsAPI)
app.use('/api/bdm-data', bdmAPI)
app.use('/api/projection', ProjectionAPI)
app.use('/api/employee' , EmployeeAPI)

// app.use(session({
//   secret: 'boombadaboom', // Replace with a secret key for session encryption
//   resave: false,
//   saveUninitialized: false,
// }));
// app.use(passport.initialize())
// app.use(passport.session());

var http = require("http").createServer(app);
var socketIO = require("socket.io")(http, {
  cors: {
    origin: " * ",
  },
});
// const server = http.createServer(app);
// const io = socketIo(server);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((err) => {
    console.log(err);
  });
// const secretKey = 'random32numberjsonwebtokenrequire';
const secretKey = process.env.SECRET_KEY || "mydefaultsecret";

app.get("/api", (req, res) => {
  console.log(req.url);
  res.send("hello from backend!");
});

//  ***********************************************   Format Dates   *********************************************************
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDateNew(timestamp) {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const formattedDay = day < 10 ? "0" + day : day;
  const formattedMonth = month < 10 ? "0" + month : month;
  return `${formattedDay}/${formattedMonth}/${year}`;
}

// ************************************   Storage Section  ***********************************************

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the destination path based on the fieldname and company name
    const companyName = req.params.CompanyName;
    let destinationPath = "";

    if (file.fieldname === "otherDocs") {
      destinationPath = `BookingsDocument/${companyName}/ExtraDocs`;
    } else if (file.fieldname === "paymentReceipt") {
      destinationPath = `BookingsDocument/${companyName}/PaymentReceipts`;
    } else if (
      file.fieldname === "DirectorPassportPhoto" ||
      file.fieldname === "DirectorAdharCard" ||
      file.fieldname === "UploadMOA" ||
      file.fieldname === "UploadAOA" ||
      file.fieldname === "UploadPhotos" ||
      file.fieldname === "RelevantDocument"
    ) {
      destinationPath = `ClientDocuments`;
    }

    // Create the directory if it doesn't exist
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }

    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// ***************************************   Login Section  **********************************************
app.post("/api/admin/login-admin", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);

  const user = await onlyAdminModel.findOne({
    admin_email: username,
    admin_password: password,
  });
  console.log("user", user);
  //console.log(user);
  if (user) {
    // Generate a JWT token
    // console.log("user is appropriate");
    const adminName = user.admin_name;
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "1h",
    });
    console.log(adminName, token);
    res.status(200).json({ token, adminName });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});
app.post("/api/employeelogin", async (req, res) => {
  const { email, password } = req.body;
  //console.log(email , password)
  // Replace this with your actual Employee authentication logic
  const user = await adminModel.findOne({
    email: email,
    password: password,
    //designation: "Sales Executive",
  });

  if (!user) {
    // If user is not found
    return res.status(401).json({ message: "Invalid email or password" });
  } else if (user.designation !== "Sales Executive") {
    // If designation is incorrect
    return res.status(401).json({ message: "Designation is incorrect" });
  } else {
    // If credentials are correct
    const newtoken = jwt.sign({ employeeId: user._id }, secretKey, {
      expiresIn: "10h",
    });
    res.json({ newtoken });
    socketIO.emit("Employee-login");
  }
});
app.post("/api/datamanagerlogin", async (req, res) => {
  const { email, password } = req.body;

  // Replace this with your actual Employee authentication logic
  const user = await adminModel.findOne({
    email: email,
    password: password,
    //designation: "Sales Executive",
  });
  //console.log(user)

  if (!user) {
    //console.log("not user condition")
    return res.status(401).json({ message: "Invalid email or password" });
  } else if (user.designation !== "Data Manager") {
    // If designation is incorrect

    return res.status(401).json({ message: "Designation is incorrect" });
  } else {
    //console.log("user condition")
    const newtoken = jwt.sign({ employeeId: user._id }, secretKey, {
      expiresIn: "10h",
    });
    //console.log(newtoken)
    res.status(200).json({ newtoken });
    // socketIO.emit("Employee-login");
  }
});
app.post("/api/bdmlogin", async (req, res) => {
  const { email, password } = req.body;
  //console.log(email,password)
  const user = await adminModel.findOne({
    email: email,
    password: password,
  });
  //console.log(user)
  if (!user) {
    // If user is not found
    return res.status(401).json({ message: "Invalid email or password" });
  } else if (user.designation !== "Sales Manager") {
    // If designation is incorrect
    return res.status(401).json({ message: "Designation is incorrect" });
  } else {
    // If credentials are correct
    const bdmToken = jwt.sign({ employeeId: user._id }, secretKey, {
      expiresIn: "10h",
    });
    //console.log(bdmToken)
    res.status(200).json({ bdmToken });
    //socketIO.emit("Employee-login");
  }
});
app.post("/api/processingLogin", async (req, res) => {
  const { username, password } = req.body;

  // Replace this with your actual Employee authentication logic
  const user = await adminModel.findOne({
    email: username,
    password: password,
    designation: "Admin Team",
  });

  if (user) {
    const ename = user.ename;
    const processingToken = jwt.sign({ employeeId: user._id }, secretKey, {
      expiresIn: "10h",
    });
    res.json({ processingToken, ename });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});
//   const { email, password } = req.body;
//   console.log(email,password)
//   // Replace this with your actual Employee authentication logic
//   const user = await adminModel.findOne({
//     email: email,
//     password: password,
//     designation: "Data Manager",
//   });
//   // console.log(user);

//   if (user) {
//     const newtoken = jwt.sign({ employeeId: user._id }, secretKey, {
//       expiresIn: "10h",
//     });
//     res.json({ newtoken });
//     //socketIO.emit('Employee-login');

//   } else {
//     res.status(401).json({ message: "Invalid credentials" });
//   }
// });

// **************************************  Socket IO Active Status  **************************************************
// app.put("/api/employee/online-status/:id/:socketID", async (req, res) => {
//   const { id } = req.params;
//   const { socketID } = req.params;
//   console.log("kuhi", socketID);
//   try {
//     const admin = await adminModel.findByIdAndUpdate(
//       id,
//       { Active: socketID },
//       { new: true }
//     );
//     res.status(200).json(admin);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
app.put("/api/online-status/:id/disconnect", async (req, res) => {
  const { id } = req.params;
  const date = new Date().toString();
  try {
    const admin = await adminModel.findByIdAndUpdate(
      id,
      { Active: date },
      { new: true }
    );
    res.status(200).json(admin);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//  ******************************************************************* Login Details ***************************************************************************
app.post("/api/loginDetails", (req, res) => {
  const { ename, date, time, address } = req.body;
  const newLoginDetails = new LoginDetails({ ename, date, time, address });
  newLoginDetails
    .save()
    .then((savedLoginDetails) => {
      // console.log("Login details saved to database:", savedLoginDetails);
      res.json(savedLoginDetails);
    })
    .catch((error) => {
      console.error("Failed to save login details to database:", error);
      res.status(500).json({ error: "Failed to save login details" });
    });
});

app.get("/api/loginDetails", (req, res) => {
  LoginDetails.find()
    .then((loginDetails) => {
      res.json(loginDetails);
    })
    .catch((error) => {
      console.error("Failed to fetch login details from database:", error);
      res.status(500).json({ error: "Failed to fetch login details" });
    });
});

//  *************************************************  Company Data POSTING Request  ******************************************************

function createCSVString(data) {
  const csvData = [];
  // Push the headers as the first row
  csvData.push([
    "Company Name",
    "Company Number",
    "Company Email",
    "Company Incorporation Date",
    "City",
    "State",
    `"${lead["Company Address"]}"`,
    "Director Name(First)",
    "Director Number(First)",
    "Director Email(First)",
    "Director Name(Second)",
    "Director Number(Second)",
    "Director Email(Second)",
    "Director Name(Third)",
    "Director Number(Third)",
    "Director Email(Third)",
    "CInumber",
    "ename",
    "AssignDate",
    "Status",
    `"${lead["Remarks"]}"`,
  ]);

  // Push each duplicate entry as a row into the csvData array
  data.forEach((lead) => {
    const rowData = [
      lead["Company Name"],
      lead["Company Number"],
      lead["Company Email"],
      lead["Company Incorporation Date"],
      lead["City"],
      lead["State"],
      `"${lead["Company Address"]}"`, // Enclose Company Address in double quotes
      lead["Director Name(First)"],
      lead["Director Number(First)"],
      lead["Director Email(First)"],
      lead["Director Name(Second)"],
      lead["Director Number(Second)"],
      lead["Director Email(Second)"],
      lead["Director Name(Third)"],
      lead["Director Number(Third)"],
      lead["Director Email(Third)"],
      lead["CInumber"],
      lead["ename"],
      lead["AssignDate"],
      lead["Status"],
      `"${lead["Remarks"]}"`, // Enclose Remarks in double quotes
    ];
    csvData.push(rowData);
  });

  return csvData.map((row) => row.join(",")).join("\n");
}

// app.post("/api/employee/employee-history", async (req, res) => {
//   const csvData = req.body;

//   try {
//     for (const employeeData of csvData) {
//       try {
//         const employee = new EmployeeHistory(employeeData);
//         const savedEmployee = await employee.save();
//       } catch (error) {
//         console.error("Error saving employee:", error.message);
//         // res.status(500).json({ error: 'Internal Server Error' });

//         // Handle the error for this specific entry, but continue with the next one
//       }
//     }

//     res.status(200).json({ message: "Data sent successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//     console.error("Error in bulk save:", error.message);
//   }
// });

app.get("/api/employee-history/:companyName", async (req, res) => {
  try {
    // Extract the companyName from the URL parameter
    const { companyName } = req.params;

    // Query the database to find all data with matching companyName
    const employeeHistory = await EmployeeHistory.find({ companyName });

    // Respond with the fetched data
    res.json(employeeHistory);
  } catch (error) {
    // Handle errors
    console.error("Error fetching employee history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// app.get("/api/insert-bdmName", async (req, res) => {
//   try {
//     // Find RedesignedLeadformModel documents where bdmName and bdeName are not the same
//     const redesignedData = await RedesignedLeadformModel.find({
//       $expr: { $ne: ["$bdmName", "$bdeName"] }
//     });

//     // Iterate over each document in redesignedData
//     for (const doc of redesignedData) {
//       // Update the corresponding CompanyModel document with maturedBdmName
//       await CompanyModel.findByIdAndUpdate(
//         { _id: doc.company },
//         { $set: { maturedBdmName: doc.bdmName } }
//       );
//     }
//     const remarksHistories = await RemarksHistory.find();
//     for(const doc of remarksHistories){
//      const obj = await CompanyModel.findById({
//         _id: doc.companyID
//       });
//       if(obj){
//         await RemarksHistory.findByIdAndUpdate({_id:doc._id},{$set:{bdeName:obj.ename}});
//       }
//     }

//     // Send the updated redesignedData as a response
//     res.json(redesignedData);

//   } catch (error) {
//     console.error("Error fetching company:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });



// app.post("/api/employee/post-bdmwork-request/:eid", async (req, res) => {
//   const eid = req.params.eid;
//   const { bdmWork } = req.body;

//   //console.log("bdmwork" , bdmWork)// Extract bdmWork from req.body
//   try {
//     await adminModel.findByIdAndUpdate(eid, { bdmWork: bdmWork });
//     // Assuming you're returning updatedCompany and remarksHistory after update
//     res.status(200).json({ message: "Status updated successfully" });
//   } catch (error) {
//     console.error("Error updating BDM work:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.post("/api/employee/post-bdmwork-revoke/:eid", async (req, res) => {
//   const eid = req.params.eid;
//   const { bdmWork } = req.body;

//   try {
//     await adminModel.findByIdAndUpdate(eid, { bdmWork: bdmWork });

//     res.status(200).json({ message: "Status Updated Successfully" });
//   } catch (error) {
//     console.error("error updating bdm work", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// --------------------------api for teams----------------------------------------

// app.post('/api/teaminfo', async (req, res) => {
//   try {
//       const teamData = req.body;
//       console.log(teamData)
//       const newTeam = await TeamModel.create(teamData);
//       res.status(201).json(newTeam);
//       console.log("newTeam" , newTeam)
//   } catch (error) {
//       console.error('Error creating team:', error.message);
//       res.status(500).json({ message: "Duplicate Entries Found" });
//   }
// });

// app.post('/api/teaminfo', async (req, res) => {
//   try {
//     const teamData = req.body;
//     //console.log(teamData);
//     // Assuming `formatDate()` is a function that formats the current date
//     const newTeam = await TeamModel.create({ modifiedAt: formatDate(Date.now()),...teamData});
//     console.log("newTeam", newTeam);
//     res.status(201).json(newTeam);
//   } catch (error) {
//     console.error('Error creating team:', error.message);
//     res.status(500).json({ message: "Duplicate Entries Found" });
//   }
// });

// ************************************************************************  Teams Section ********************************************************************************************

// app.delete("/api/delete-followup/:companyName", async (req, res) => {
//   try {
//     // Extract the company name from the request parameters
//     const { companyName } = req.params;

//     // Check if a document with the given company name exists
//     const existingData = await FollowUpModel.findOne({ companyName });

//     if (existingData) {
//       // If the document exists, delete it
//       await FollowUpModel.findOneAndDelete({ companyName });
//       res.status(200).json({ message: "Data deleted successfully" });
//     } else {
//       // If no document with the given company name exists, return a 404 Not Found response
//       res.status(404).json({ error: "Company not found" });
//     }
//   } catch (error) {
//     // If there's an error during the deletion process, send a 500 Internal Server Error response
//     console.error("Error deleting data:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

app.delete(`/api/delete-bdmTeam/:teamId`, async (req, res) => {
  const teamId = req.params.teamId; // Correctly access teamId from req.params

  try {
    const existingData = await TeamModel.findById(teamId);
    console.log(existingData);

    if (existingData) {
      await TeamModel.findByIdAndDelete(teamId); // Use findByIdAndDelete to delete by ID
      res.status(200).json({ message: "Deleted Successfully" });
    } else {
      res.status(400).json({ error: "Team Does Not Exist" }); // Correct typo in error message
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// app.delete(`/api/delete-bdm-busy/:companyId`, async (req, res) => {
//   const companyId = req.params.companyId; // Correctly access teamId from req.params

//   try {
//     const existingData = await TeamLeadsModel.findById(companyId);
//     console.log(existingData);

//     if (existingData) {
//       await TeamLeadsModel.findByIdAndDelete(companyId); // Use findByIdAndDelete to delete by ID
//       res.status(200).json({ message: "Deleted Successfully" });
//     } else {
//       res.status(400).json({ error: "Team Does Not Exist" }); // Correct typo in error message
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

app.post(`/api/update-bdmstatusfrombde/:companyId`, async (req, res) => {
  const companyId = req.params.companyId;

  //console.log(companyId)
  const { newStatus } = req.body;
  //console.log(newStatus)                // Assuming the new status is under the key 'bdmStatus' in the request body
  try {
    const update = await TeamLeadsModel.findByIdAndUpdate(companyId, {
      bdmStatus: newStatus,
      Status: newStatus,
    });

    //console.log(update)

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/api/teaminfo/:teamId", async (req, res) => {
  const teamId = req.params.teamId;

  const dataToUpdated = req.body;

  console.log("Update", dataToUpdated);

  try {
    const updatedData = await TeamModel.findByIdAndUpdate(
      teamId,
      dataToUpdated,
      {
        new: true,
      }
    );
    if (!updatedData) {
      return res.status(404).json({ error: "Data not found" });
    } else {
      res.json({ message: "Data updated successfully", updatedData });
    }
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------------------------------------------------------team api end----------------------------------

// app.get("/api/new-leads", async (req, res) => {
//   try {
//     const { page, limit } = req.query;
//     const pageNumber = parseInt(page) || 1;
//     const itemsPerPage = parseInt(limit) || 50;
//     const startIndex = (pageNumber-1) * itemsPerPage;
// console.log(page)
//     const data = await CompanyModel.find()
//       .skip(startIndex)
//       .limit(itemsPerPage)
//       .lean();

//     res.send(data);
//   } catch (error) {
//     console.error("Error fetching data:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// ------------------------------api to get leads on the basis of ename------------------------

// app.get("/api/new-leads", async (req, res) => {
//   try {
//     const { startIndex, endIndex } = req.query;
//     const start = parseInt(startIndex) || 0;
//     const end = parseInt(endIndex) || 500;

//     const data = await CompanyModel.find({ ename: "Not Alloted" })
//       .skip(start)
//       .limit(end - start)
//       .lean();

//     res.send(data);
//   } catch (error) {
//     console.error("Error fetching data:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.get("/api/leads2", async (req, res) => {
//   try {
//     // Get the query parameters for pagination
//     const { startIndex, endIndex } = req.query;

//     // Convert startIndex and endIndex to numbers
//     const start = parseInt(startIndex);
//     const end = parseInt(endIndex);

//     // Fetch data using lean queries to retrieve plain JavaScript objects
//     const data = await CompanyModel.find()
//       .skip(start)
//       .limit(end - start)
//       .lean();

//     // Send the data as the API response
//     res.send(data);
//   } catch (error) {
//     console.error("Error fetching data:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// ****************************************  Projection Section's Hadi *********************************************************

// ----------------------------------api to delete projection data-----------------------------------

// Backend API to update or add data to FollowUpModel
// Backend API to update or add data to FollowUpModel
// app.post('/api/update-followup', async (req, res) => {
//   try {
//     const { companyName } = req.body;
//     const todayDate = new Date();
//     const time = todayDate.toLocaleTimeString();
//     const date = todayDate.toLocaleDateString();
//     const finalData = { ...req.body, date, time };

//     // Check if a document with companyName exists
//     const existingData = await FollowUpModel.findOne({ companyName });

//     if (existingData) {
//       // Update existing document
//       await FollowUpModel.findOneAndUpdate({ companyName }, finalData);
//       res.status(200).json({ message: 'Data updated successfully' });
//     } else {
//       // Create new document
//       await FollowUpModel.create(finalData);
//       res.status(201).json({ message: 'New data added successfully' });
//     }
//   } catch (error) {
//     console.error('Error updating or adding data:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

//  ***************************************************  Employee's Hadi(CRUD Operation)  ******************************************************

// 1. Create an Employee
// app.post("/api/employee/einfo", async (req, res) => {
//   try {
//     adminModel.create(req.body).then((res) => {
//       res.json(res);
//       //console.log("newemployee", req.body);
//       //console.log("respond" , respond)
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });


// app.post("/api/employee/einfo", async (req, res) => {
//   try {
//     adminModel.create(req.body).then((result) => { // Change res to result
//       res.json(result); // Change res.json(res) to res.json(result)
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // 2. Read the Employee
// app.get("/api/employee/einfo", async (req, res) => {
//   try {
//     const data = await adminModel.find();
//     res.json(data);
//   } catch (error) {
//     console.error("Error fetching data:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
// // 3. Update the Employee
// app.put("/api/employee/einfo/:id", async (req, res) => {
//   const id = req.params.id;

//   try {
//     const updatedData = await adminModel.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });

//     if (!updatedData) {
//       return res.status(404).json({ error: "Data not found" });
//     }

//     res.json({ message: "Data updated successfully", updatedData });
//   } catch (error) {
//     console.error("Error updating data:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
// // 4. Delete an Employee 
// app.delete("/api/employee/einfo/:id", async (req, res) => {
//   const id = req.params.id;
//   try {
//     // Use findByIdAndDelete to delete the document by its ID
//     const deletedData = await adminModel.findByIdAndDelete(id);

//     if (!deletedData) {
//       return res.status(404).json({ error: "Data not found" });
//     }

//     res.json({ message: "Data deleted successfully", deletedData });
//   } catch (error) {
//     console.error("Error deleting data:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
// ***************************************************************  Company Data's Hadi  *************************************************************

// 5. ADD Multiple Companies
app.post("/api/company", async (req, res) => {
  const { newemployeeSelection, csvdata } = req.body;

  try {
    const insertedCompanies = [];
    let counter = 0;
    for (const company of csvdata) {
      // Check for duplicate based on some unique identifier, like company name
      const isDuplicate = await CompanyModel.exists({
        "Company Name": company["Company Name"].trim().toLowerCase(),
      });

      if (!isDuplicate) {
        // If not a duplicate, add ename and insert into the database
        const companyWithEname = {
          ...company,
          ename: newemployeeSelection,
          AssignDate: new Date(),
        };

        const insertedCompany = await CompanyModel.create(companyWithEname);
        insertedCompanies.push(insertedCompany);
      } else {
        console.log(
          `Duplicate entry found for company name: ${company["Company Name"]}. Skipped.`
        );
        counter++;
      }
    }

    res.json(insertedCompanies, counter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//   const name = req.params.id;

//   try {
//     const updatedData = await CompanyModel.find({ename : name}, { new: true });

//     if (!updatedData) {
//       return res.status(404).json({ error: 'Data not found' });
//     }

//     res.json({ message: 'Data updated successfully', updatedData });
//   } catch (error) {
//     console.error('Error updating data:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// Assigning data

// app.post("/api/postData", async (req, res) => {cd
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

// **************************************************************  Follow UPDATE content  **************************************************************

app.post("/api/delete-companies-teamleads-assignednew", async (req, res) => {
  try {
    // Extract the companyIds from the request body
    const { companyIds } = req.body;

    //console.log("companycom", companyIds)

    // Validate that companyIds is an array
    if (!Array.isArray(companyIds)) {
      return res
        .status(400)
        .json({ error: "Invalid input: companyIds must be an array" });
    }

    // Delete companies from the TeamLeadsModel using the companyIds
    const deleteResult = await TeamLeadsModel.deleteMany({
      _id: { $in: companyIds },
    });

    // Check if any companies were deleted
    if (deleteResult.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: "No companies found with the provided IDs" });
    }

    // Respond with success message
    res.status(200).json({ message: "Companies deleted successfully" });
  } catch (error) {
    console.error("Error deleting companies:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// *************************************************  Fetching Company Data   ***********************************************************

// api call for employee requesting for the data

// app.get("/api/booking-model-filter", async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     // Convert start and end dates to JavaScript Date objects
//     const formattedStartDate = new Date(startDate);
//     const formattedEndDate = new Date(endDate);

//     // Convert the start date to match the format of the bookingDate field
//     const formattedBookingStartDate = formattedStartDate
//       .toISOString()
//       .split("T")[0];

//     // Define the filter criteria based on the date range
//     let filterCriteria = {};
//     if (formattedStartDate.getTime() === formattedEndDate.getTime()) {
//       // If start and end dates are the same, filter by a single date
//       filterCriteria = { bookingDate: formattedBookingStartDate };
//     } else {
//       // If start and end dates are different, filter by a date range
//       filterCriteria = {
//         bookingDate: {
//           $gte: formattedBookingStartDate,
//           $lte: formattedEndDate.toISOString().split("T")[0],
//         },
//       };
//     }

//     // Fetch leads from the database filtered by the specified date range
//     const leads = await LeadModel.find(filterCriteria);

//     res.json({ leads });
//   } catch (error) {
//     console.error("Error fetching leads:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.post("/api/accept-booking-request/:companyName", async (req, res) => {
//   const companyName = req.params.companyName;
//   const requestData = req.body;

//   try {
//     // Find the data to be moved from BookingsRequestModel

//     // Update leadModel data with data from BookingsRequestModel
//     const { _id, ...updatedData } = requestData;

//     // Update leadModel data with data from BookingsRequestModel
//     const updatedLead = await LeadModel.findOneAndUpdate(
//       { companyName },
//       { $set: updatedData },
//       { new: true }
//     );

//     // Delete the data from BookingsRequestModel
//     await BookingsRequestModel.findOneAndDelete({ companyName });

//     // Send success response with the updated lead data
//     res.status(200).json(updatedLead);
//   } catch (error) {
//     console.error("Error accepting booking request:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });
app.get("/api/drafts-search/:companyName", async (req, res) => {
  const companyName = req.params.companyName;

  try {
    // Find draft data for the company name
    const draft = await DraftModel.findOne({ companyName });

    // Send the draft data as response
    res.status(200).json(draft);
  } catch (error) {
    console.error("Error fetching draft:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/api/deleterequestbybde/:cname", async (req, res) => {
  try {
    const companyName = req.params.cname;

    // Find document by company name and delete it
    const updatedCompany = await RequestDeleteByBDE.findOneAndUpdate(
      { companyName, request: undefined },
      { $set: { request: true } },
      { new: true }
    );
    if (!updatedCompany) {
      return res.status(404).json({ error: "Company not found" });
    }

    // If document is deleted successfully, return the deleted document
    res.json(updatedCompany);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ********************************************************pdf files reader *************************************************************************************

app.get("/download/recieptpdf/:fileName", (req, res) => {
  const fileName = req.params.filePath;
  const filePath = path.join(__dirname, "uploads", fileName);
  // console.log(fileName);
  res.setHeader("Content-Disposition", attachment, (fileName = `${fileName}`));
  res.setHeader("Content-Type", "application/pdf");
  res.sendFile(filePath);
});

app.post("/api/undo", (req, res) => {
  // Run mongorestore command to restore the data
  exec(
    `mongorestore --uri "mongodb://localhost:27017/AdminTable" --nsInclude "AdminTable.newcdatas" ${process.env.BACKUP_PATH}\newcdatas.bson
  `,
    (error, stdout, stderr) => {
      if (error) {
        console.error("Error restoring data:", error);
        res.status(500).json({ error: "Error restoring data." });
      } else {
        // console.log("Data restored successfully:", stdout);
        res.status(200).json({ message: "Data restored successfully." });
      }
    }
  );
});

console.log(pdfAttachment);

/*****************************************************CompanyBusinessInput *****************************************************************/

app.post(
  "/api/users",
  upload.fields([
    { name: "DirectorPassportPhoto", maxCount: 10 },
    { name: "DirectorAdharCard", maxCount: 10 },
    { name: "UploadMOA", maxCount: 1 },
    { name: "UploadAOA", maxCount: 1 },
    { name: "UploadPhotos", maxCount: 1 },
    { name: "RelevantDocument", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const DirectorPassportPhoto = req.files["DirectorPassportPhoto"] || [];
      const DirectorAdharCard = req.files["DirectorAdharCard"] || [];
      const UploadMOA = req.files["UploadMOA"] || [];
      const UploadAOA = req.files["UploadAOA"] || [];
      const UploadPhotos = req.files["UploadPhotos"] || [];
      const RelevantDocument = req.files["RelevantDocument"] || [];

      // Get user details from the request body
      const {
        CompanyName,
        CompanyEmail,
        CompanyNo,
        BrandName,
        WebsiteLink,
        FacebookLink,
        InstagramLink,
        LinkedInLink,
        YoutubeLink,
        CompanyActivities,
        ProductService,
        CompanyUSP,
        ValueProposition,
        TechnologyInvolved,
        DirectInDirectMarket,
        Finance,
        BusinessModel,
        DirectorDetails,
      } = req.body;

      console.log(req.body);


      // Construct the HTML content conditionally
      let facebookHtml = "";
      if (FacebookLink && FacebookLink !== "No Facebook Id") {
        facebookHtml = `
     <div style="display: flex; flex-wrap: wrap">
        <div style="width: 25%">
          <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
            Facebook Id
          </div>
        </div>
        <div style="width: 75%">
          <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
            ${FacebookLink}
          </div>
        </div>
      </div>
    `;
      }

      let instagramHtml = "";
      if (InstagramLink && InstagramLink !== "No Instagram Id") {
        instagramHtml = `
        <div style="display: flex; flex-wrap: wrap">
          <div style="width: 25%">
            <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
              Instagram Id
            </div>
          </div>
          <div style="width: 75%">
            <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
              ${InstagramLink}
            </div>
          </div>
        </div>
      `;
      }

      let linkedInHtml = "";
      if (LinkedInLink && LinkedInLink !== "No LinkedIn Id") {
        linkedInHtml = `
        <div style="display: flex; flex-wrap: wrap">
          <div style="width: 25%">
            <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
              LinkedIn Id
            </div>
          </div>
          <div style="width: 75%">
            <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
              ${LinkedInLink}
            </div>
          </div>
        </div>
      `;
      }

      let youtubeHtml = "";
      if (YoutubeLink && YoutubeLink !== "No YouTube Id") {
        youtubeHtml = `
        <div style="display: flex; flex-wrap: wrap">
          <div style="width: 25%">
            <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
              YouTube Id
            </div>
          </div>
          <div style="width: 75%">
            <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
              ${YoutubeLink}
            </div>
          </div>
        </div>
      `;
      }
      let TechnologyInvolvedHtml = "";
      if (
        TechnologyInvolved &&
        TechnologyInvolved !== "No Technology Invloved"
      ) {
        TechnologyInvolvedHtml = `
        <div style="display: flex; flex-wrap: wrap">
          <div style="width: 25%">
            <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
              Technology Involved
            </div>
          </div>
          <div style="width: 75%">
            <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
              ${TechnologyInvolved}
            </div>
          </div>
        </div>
      `;
      }

      let uploadPhotosHtml = "";
      if (UploadPhotos && UploadPhotos !== "No Upload Photos") {
        uploadPhotosHtml = `
      <div style="display: flex; flex-wrap: wrap">
        <div style="width: 25%">
          <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
            Upload Photos
          </div>
        </div>
        <div style="width: 75%">
          <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
            ${UploadPhotos}
          </div>
        </div>
      </div>
    `;
      }

      let relevantDocumentsHtml = "";
      if (RelevantDocument && RelevantDocument !== "No Relevant Documents") {
        relevantDocumentsHtml = `
      <div style="display: flex; flex-wrap: wrap">
        <div style="width: 25%">
          <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
            Relevant Documents
          </div>
        </div>
        <div style="width: 75%">
          <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
            ${RelevantDocument}
          </div>
        </div>
      </div>
    `;
      }

      let businessModelHtml = "";
      if (BusinessModel && BusinessModel !== "No Business Model") {
        businessModelHtml = `
      <div style="display: flex; flex-wrap: wrap">
        <div style="width: 25%">
          <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
            Business Model
          </div>
        </div>
        <div style="width: 75%">
          <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
            ${BusinessModel}
          </div>
        </div>
      </div>
    `;
      }

      let financeDetailsHtml = "";
      if (Finance && Finance !== "No Finance Details") {
        financeDetailsHtml = `
      <div style="display: flex; flex-wrap: wrap">
        <div style="width: 25%">
          <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
            Finance Details
          </div>
        </div>
        <div style="width: 75%">
          <div style="border: 1px solid #ccc; font-size: 12px; padding: 5px 10px;">
            ${Finance}
          </div>
        </div>
      </div>
    `;
      }

      const tempHtml = () => {
        let team = "";
        let isFirstMainDirectorSet = false;
        for (let index = 0; index < DirectorDetails.length; index++) {
          const {
            DirectorName,
            DirectorEmail,
            DirectorMobileNo,
            DirectorQualification,
            DirectorWorkExperience,
            DirectorAnnualIncome,
            LinkedInProfileLink,
            DirectorDesignation,
            DirectorAdharCardNumber,
            DirectorGender,
            IsMainDirector,
          } = DirectorDetails[index];

          // Check if this is the first director and they are marked as the main director
          console.log(DirectorDetails[index].IsMainDirector, "This is it")
          if (DirectorDetails[index].IsMainDirector === "true") {
            team += `
           <div 
           style="width: 50%;
                  margin-bottom: 4px;
                  font-weight: bold;
                  color: blue;
                  margin-left: 57px;
                  margin-bottom: -34px;">
              This is the authorised person
            </div>
      `;
            isFirstMainDirectorSet = true;
          }

          team += `
      <div style="width: 95%; margin: 10px auto">
        <div>
          <div
            style="
              width: 30px;
              height: 30px;
              line-height: 30px;
              text-align: center;
              font-weight: bold;
              color: black;
            "
          >
            ${index + 1} 
            <div
            style="
              width: 30px;
              height: 30px;
              line-height: 30px;
              text-align: center;
              font-weight: bold;
              color: black;
            "
          >
            
          </div>
        </div>
        <div
          style="
            background: #f7f7f7;
            padding: 15px;
            border-radius: 10px;
            position: relative;
            margin-top: 15px;
          "
        >
          <div style="display: flex; flex-wrap: wrap">
            <div style="width: 25%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                DirectorName
              </div>
            </div>
            <div style="width: 75%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                ${DirectorName}
              </div>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap">
            <div style="width: 25%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                DirectorEmail
              </div>
            </div>
            <div style="width: 75%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                ${DirectorEmail}
              </div>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap">
            <div style="width: 25%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                DirectorMobileNo
              </div>
            </div>
            <div style="width: 75%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                ${DirectorMobileNo}
              </div>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap">
            <div style="width: 25%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                Director Qualification
              </div>
            </div>
            <div style="width: 75%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                ${DirectorQualification}
              </div>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap">
            <div style="width: 25%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                Director Work Experience
              </div>
            </div>
            <div style="width: 75%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                ${DirectorWorkExperience}
              </div>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap">
            <div style="width: 25%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                Director Annual Income
              </div>
            </div>
            <div style="width: 75%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                ${DirectorAnnualIncome}
              </div>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap">
            <div style="width: 25%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                LinkedIn Profile
              </div>
            </div>
            <div style="width: 75%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                ${LinkedInProfileLink}
              </div>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap">
            <div style="width: 25%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                Director Designation
              </div>
            </div>
            <div style="width: 75%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                ${DirectorDesignation}
              </div>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap">
            <div style="width: 25%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                Director AdharCard Number
              </div>
            </div>
            <div style="width: 75%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                ${DirectorAdharCardNumber}
              </div>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap">
            <div style="width: 25%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                Director Gender
              </div>
            </div>
            <div style="width: 75%">
              <div
                style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                "
              >
                ${DirectorGender}
              </div>
            </div>
          </div>
        </div>
      </div>
      `;
        }
        return team;
      };
      const generatedHtml = tempHtml(); // Call the tempHtml function to generate HTML
      console.log(generatedHtml);


      // send Thank You email for sendEmail-3.js
      const email = ["nisargpatel@startupsahay.com"];
      const subject = "Thank you for signing up!";
      const text = "";
      const html = ` 
       <body>
     <div style="width: 100%; padding: 20px 20px; background: #f6f8fb">
       <h3 style="text-align: center">Basic Details Form</h3>
       <div
         style="
           width: 95%;
           margin: 0 auto;
           padding: 20px 20px;
           background: #fff;
           border-radius: 10px;
         "
       >
         <div style="width: 95%; margin: 10px auto">
           <div style="display: flex; align-items: center; margin-top: 20px; font-size:19px;">
             <div
               style="
                 width: 30px;
                 height: 30px;
                 line-height: 30px;
                 text-align: center;
                 font-weight: bold;
                 color: black;
               "
             >
               1
             </div>
             <div style="margin-left: 10px">Basic Information</div>
           </div>
           <div
             style="
               background: #f7f7f7;
               padding: 15px;
               border-radius: 10px;
               position: relative;
               margin-top: 15px;
             "
           >
             <div style="display: flex; flex-wrap: wrap">
               <div style="width: 25%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   Company Name
                 </div>
               </div>
               <div style="width: 75%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   ${CompanyName}
                 </div>
               </div>
             </div>
             <div style="display: flex; flex-wrap: wrap">
               <div style="width: 25%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   Company Email
                 </div>
               </div>
               <div style="width: 75%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   ${CompanyEmail}
                 </div>
               </div>
             </div>
             <div style="display: flex; flex-wrap: wrap">
               <div style="width: 25%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   Company No
                 </div>
               </div>
               <div style="width: 75%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   ${CompanyNo}
                 </div>
               </div>
             </div>
 
             <div style="display: flex; flex-wrap: wrap">
               <div style="width: 25%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   Brand Name
                 </div>
               </div>
               <div style="width: 75%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   ${BrandName}
                 </div>
               </div>
             </div>
             <div style="display: flex; flex-wrap: wrap">
               <div style="width: 25%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   Website Link
                 </div>
               </div>
               <div style="width: 75%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   ${WebsiteLink}
                 </div>
               </div>
             </div>
             <div style="display: flex; flex-wrap: wrap">
               <div style="width: 100%">
                 <div>
                 ${facebookHtml}
                 </div>
               </div>
             </div>
             <div style="display: flex; flex-wrap: wrap">
               <div style="width:100%">
                 <div>
                  ${instagramHtml}
                 </div>
               </div>
             </div>
             <div style="display: flex; flex-wrap: wrap">
               <div style="width:100%">
                 <div>
                 ${linkedInHtml}
                 </div>
               </div>
             </div>
             <div style="display: flex; flex-wrap: wrap">
               <div style="width:100%">
                 <div>
                 ${youtubeHtml} 
                 </div>
               </div>
             </div>
           </div>
         </div>
 
         <div style="width: 95%; margin: 10px auto">
           <div style="display: flex; align-items: center; margin-top: 20px; font-size:19px;">
             <div
               style="
                 width: 30px;
                 height: 30px;
                 line-height: 30px;
                 text-align: center;
                 font-weight: bold;
                 color: black;
               "
             >
               2
             </div>
             <div style="margin-left: 10px">Brief About Your Business</div>
           </div>
           <div
             style="
               background: #f7f7f7;
               padding: 15px;
               border-radius: 10px;
               position: relative;
               margin-top: 15px;
             "
           >
             <div style="display: flex; flex-wrap: wrap">
               <div style="width: 25%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   Company Activities
                 </div>
               </div>
               <div style="width: 75%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   ${CompanyActivities}
                 </div>
               </div>
             </div>
             <div style="display: flex; flex-wrap: wrap">
               <div style="width: 25%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   Problems and Solution
                 </div>
               </div>
               <div style="width: 75%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   ${ProductService}
                 </div>
               </div>
             </div>
             <div style="display: flex; flex-wrap: wrap">
               <div style="width: 25%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   USP
                 </div>
               </div>
               <div style="width: 75%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   ${CompanyUSP}
                 </div>
               </div>
             </div>
 
             <div style="display: flex; flex-wrap: wrap">
               <div style="width: 25%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   Value Proposition
                 </div>
               </div>
               <div style="width: 75%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   ${ValueProposition}
                 </div>
               </div>
             </div>
             <div style="display: flex; flex-wrap: wrap">
               <div style="width: 100%">
                 <div>
                   ${TechnologyInvolvedHtml}
                 </div>
               </div>
             </div>
             <div style="display: flex; flex-wrap: wrap">
               <div style="width: 25%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   Direct/Indirect Competitor
                 </div>
               </div>
               <div style="width: 75%">
                 <div
                   style="
                     border: 1px solid #ccc;
                     font-size: 12px;
                     padding: 5px 10px;
                   "
                 >
                   ${DirectInDirectMarket}
                 </div>
               </div>
             </div>
             <div style="display: flex; flex-wrap: wrap">
               <div style="width: 100%">
                 <div>
                   ${businessModelHtml}
                 </div>
               </div>
             </div>
             
             <div style="display: flex; flex-wrap: wrap">
               <div style="width: 100%">
                 <div>
                 ${financeDetailsHtml}
                </div>
              </div>
              </div>
              </div>
            <div style="display: flex; align-items: center; margin-top: 20px; font-size:19px;">
             <div
               style="
                 width: 30px;
                 height: 30px;
                 line-height: 30px;
                 text-align: center;
                 font-weight: bold;
                 color: black;
                 margin-top:5px;
               "
             >
               3
             </div>
             <div style="margin-left: 10px">Directors And Team Details</div>
           </div>
           <div
             style="
               background: #f7f7f7;
               padding: 15px;
               border-radius: 10px;
               position: relative;
               margin-top: 15px;
             "
           >
           ${generatedHtml}
        </div>
      </div>
    </body>
     `;

      await sendMail3(
        email,
        subject,
        text,
        html,
        DirectorPassportPhoto,
        DirectorAdharCard,
        UploadMOA,
        UploadAOA,
        UploadPhotos,
        RelevantDocument
      )
        .then((info) => {
          console.log("Email Sent:", info);
        })
        .catch((error) => {
          console.error("Error sending email:", error);
          res.status(500).send("Error sending email");
        });


      // Send Thank You Message with pdf Draft sendMail4.js 

      const recipients = [formData.CompanyEmail];
      // const ccEmail = formData.DirectorDetails.map(director => director.DirectorEmail);
      const subject1 = "Thank you for submitting the form!";
      const text1 = "";
      const html1 = `
       <p>Dear Client,</p>

<p>Thank you for submitting the form. We appreciate your cooperation and are excited to begin working on your project for Your Company [company-name]. As a first step, we will provide you with limited content for your pitch deck, which will be created by our team to meet pitch deck standards.</p>

<p>Simultaneously, our graphic designer will work on the visual elements of the pitch deck. Once you approve the content shared by our employee, it will be incorporated into the pitch deck. The final version of the pitch deck will be shared with you in the WhatsApp group for your final approval.</p>

<p>During this time, our financial analyst will reach out to you for financial inputs to create a comprehensive financial projection. The financial projection will be included in the application for the [selct_multiselct-164]</p>

<p>Please note that the entire process, including content creation, graphic design, and financial projection, will take approximately 15 to 20 working days. We strive to deliver high-quality results within this timeframe. However, it's important to mention that any delays in providing information or approvals from your end may affect the delivery timeline.</p>

<p>Once again, we appreciate your trust in our services. Should you have any questions or require further clarification, please feel free to reach out to us through the WhatsApp group or contact our team directly.</p>
<p>Best regards,</p>

<p>Operation Team </p>
<p>+91-9998992601</p>
<p>Start-Up Sahay Private Limited</p>
      `;

      const pdfAttachment = {
        filename: 'MITC.pdf', // Replace with actual file name
        path: path.join(__dirname, './helpers/src/MITC.pdf') // Adjust the path accordingly
      };

      const attachments = [pdfAttachment];

      // Sending email for CompanyEmail 
      sendMail4(recipients, ccEmail, subject1, text1, html1, attachments)
        .then((info) => {
          console.log("Email sent:", info);
        })
        .catch((error) => {
          console.error("Error sending email:", error);
        });


      const newUser = new userModel({
        ...req.body,
        DirectorPassportPhoto,
        DirectorAdharCard,
        UploadMOA,
        UploadAOA,
        UploadPhotos,
        RelevantDocument,
      });

      await newUser.save();

      res.status(201).send(newUser);
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  }
);

http.listen(3001, function () {
  console.log("Server started...");

  socketIO.on("connection", function (socket) {
    console.log("User connected: " + socket.id);
    socketIO.emit("employee-entered");

    socket.on("disconnect", async function () {
      const date = new Date().toString();
      console.log("User disconnected: " + socket.id);
      socketIO.emit("user-disconnected");
      try {
        await adminModel.updateOne({ Active: socket.id }, { Active: date });
        console.log("Admin updated: " + socket.id);
      } catch (error) {
        console.error("Error updating admin:", error);
      }
    });
  });
});
