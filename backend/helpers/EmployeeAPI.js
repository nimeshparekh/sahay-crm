var express = require("express");
var router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const adminModel = require("../models/Admin.js");
const PerformanceReportModel = require("../models/MonthlyPerformanceReportModel.js");
const TodaysProjectionModel = require("../models/TodaysGeneralProjection.js");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const EmployeeHistory = require("../models/EmployeeHistory");
const json2csv = require("json2csv").parse;
const deletedEmployeeModel = require("../models/DeletedEmployee.js");
const RedesignedLeadformModel = require("../models/RedesignedLeadform");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // Determine the destination path based on the fieldname and company name
//     // const employeeName = req.params.employeeName;
//     const {firstName, lastName} = req.body;
//     const empName = `${firstName} ${lastName}`;
//     let destinationPath = "";

//     if (file.fieldname === "file" && empName) {
//       // destinationPath = `EmployeeImages/${employeeName}`;
//       destinationPath = `EmployeeDocs/${empName}`;
//     }

//     // Create the directory if it doesn't exist
//     if (!fs.existsSync(destinationPath)) {
//       fs.mkdirSync(destinationPath, { recursive: true });
//     }

//     cb(null, destinationPath);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now();
//     cb(null, uniqueSuffix + "-" + `${empName}-${file.originalname}`);
//   },
// });


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { personalEmail } = req.params;
    const empName = `${personalEmail}`;
    let destinationPath = "";

    if (file.fieldname && empName) {
      destinationPath = `EmployeeDocs/${empName}`;
    }

    // Create the directory if it doesn't exist
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }

    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    const { personalEmail } = req.params;
    const empName = `${personalEmail}`;
    const uniqueSuffix = Date.now();
    cb(null, `${uniqueSuffix}-${empName}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.put("/online-status/:id/:socketID", async (req, res) => {
  const { id } = req.params;
  const { socketID } = req.params;
  console.log("kuhi", socketID);
  try {
    const admin = await adminModel.findByIdAndUpdate(
      id,
      { Active: socketID },
      { new: true }
    );
    res.status(200).json(admin);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/employee-history", async (req, res) => {
  const csvData = req.body;

  try {
    for (const employeeData of csvData) {
      try {
        const employee = new EmployeeHistory(employeeData);
        const savedEmployee = await employee.save();
      } catch (error) {
        console.error("Error saving employee:", error.message);
        // res.status(500).json({ error: 'Internal Server Error' });

        // Handle the error for this specific entry, but continue with the next one
      }
    }

    res.status(200).json({ message: "Data sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.error("Error in bulk save:", error.message);
  }
});

router.post("/post-bdmwork-request/:eid", async (req, res) => {
  const eid = req.params.eid;
  const { bdmWork } = req.body;

  //console.log("bdmwork" , bdmWork)// Extract bdmWork from req.body
  try {
    await adminModel.findByIdAndUpdate(eid, { bdmWork: bdmWork });
    // Assuming you're returning updatedCompany and remarksHistory after update
    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating BDM work:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/post-bdmwork-revoke/:eid", async (req, res) => {
  const eid = req.params.eid;
  const { bdmWork } = req.body;

  try {
    await adminModel.findByIdAndUpdate(eid, { bdmWork: bdmWork });

    res.status(200).json({ message: "Status Updated Successfully" });
  } catch (error) {
    console.error("error updating bdm work", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// router.post("/einfo", async (req, res) => {
//   try {
//     const { firstName, lastName, personalPhoneNo, personalEmail } = req.body;
//     // console.log("Reqest body is :", req.body);

//     adminModel.create({
//       ...req.body,
//       ename: `${firstName.toUpperCase()} ${lastName.toUpperCase()}`,
//       personal_number: personalPhoneNo,
//       personal_email: personalEmail,
//       AddedOn: new Date()
//     }).then((result) => {
//       // Change res to result
//       res.json(result); // Change res.json(res) to res.json(result)
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });


router.post("/einfo", async (req, res) => {
  try {
    const { firstName, middleName, lastName, personalPhoneNo, personalEmail } = req.body;
    const updateData = {
      ...req.body,
      ename: `${firstName} ${middleName} ${lastName}`,
      personal_number: personalPhoneNo,
      personal_email: personalEmail,
      AddedOn: new Date()
    };

    // Check if the document already exists and update it, otherwise create a new one
    const result = await adminModel.findOneAndUpdate(
      { personal_email: personalEmail },
      updateData,
      { new: true, upsert: true } // upsert option creates a new document if no match is found
    );

    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/fetchEmployeeFromPersonalEmail/:personalEmail", async (req, res) => {
  const { personalEmail } = req.params;

  try {
    if (!personalEmail) {
      return res.status(404).json({ result: false, message: "Email not found" });
    }
    const emp = await adminModel.findOne({ personal_email: personalEmail });

    if (!emp) {
      return res.status(404).json({ result: false, message: "Employee not found" });
    }

    res.status(200).json({ result: true, message: "Data successfully updated", data: emp });
  } catch (error) {
    res.status(500).json({ result: false, message: "Error updating employee", error: error.message });
  }
});

router.put("/updateEmployeeFromPersonalEmail/:personalEmail", upload.fields([
  { name: "offerLetter", maxCount: 1 },
  { name: "aadharCard", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
  { name: "educationCertificate", maxCount: 1 },
  { name: "relievingCertificate", maxCount: 1 },
  { name: "salarySlip", maxCount: 1 },
  { name: "profilePhoto", maxCount: 1 },
]), async (req, res) => {
  const { personalEmail } = req.params;
  const { officialNo, officialEmail, joiningDate, branch, manager, firstMonthSalary, salaryCalculation, personName, relationship, personPhoneNo } = req.body;
  // console.log("Reqest file is :", req.files);

  const getFileDetails = (fileArray) => fileArray ? fileArray.map(file => ({
    fieldname: file.fieldname,
    originalname: file.originalname,
    encoding: file.encoding,
    mimetype: file.mimetype,
    destination: file.destination,
    filename: file.filename,
    path: file.path,
    size: file.size
  })) : [];

  const offerLetterDetails = getFileDetails(req.files ? req.files["offerLetter"] : []);
  const aadharCardDetails = getFileDetails(req.files ? req.files["aadharCard"] : []);
  const panCardDetails = getFileDetails(req.files ? req.files["panCard"] : []);
  const educationCertificateDetails = getFileDetails(req.files ? req.files["educationCertificate"] : []);
  const relievingCertificateDetails = getFileDetails(req.files ? req.files["relievingCertificate"] : []);
  const salarySlipDetails = getFileDetails(req.files ? req.files["salarySlip"] : []);
  const profilePhotoDetails = getFileDetails(req.files ? req.files["profilePhoto"] : []);

  try {
    if (!personalEmail) {
      return res.status(404).json({ result: false, message: "Email not found" });
    }

    const emp = await adminModel.findOneAndUpdate(
      { personal_email: personalEmail },
      {
        ...req.body,
        email: officialEmail,
        number: officialNo,
        jdate: joiningDate,
        branchOffice: branch,
        reportingManager: manager,
        firstMonthSalaryCondition: firstMonthSalary,
        firstMonthSalary: salaryCalculation,
        offerLetter: offerLetterDetails || [],
        personal_contact_person: personName,
        personal_contact_person_relationship: relationship,
        personal_contact_person_number: personPhoneNo,
        aadharCard: aadharCardDetails || [],
        panCard: panCardDetails || [],
        educationCertificate: educationCertificateDetails || [],
        relievingCertificate: relievingCertificateDetails || [],
        salarySlip: salarySlipDetails || [],
        profilePhoto: profilePhotoDetails || [],
      },
      { new: true } // This option returns the updated document
    );

    if (!emp) {
      return res.status(404).json({ result: false, message: "Employee not found" });
    }

    res.status(200).json({ result: true, message: "Data successfully updated", data: emp });
  } catch (error) {
    res.status(500).json({ result: false, message: "Error updating employee", error: error.message });
  }
});

router.get("/fetchEmployeeFromId/:empId", async (req, res) => {
  const { empId } = req.params;
  try {
    const emp = await adminModel.findById(empId);
    if (!emp) {
      res.status(404).json({ result: false, message: "Employee not found" });
    }
    res.status(200).json({ result: true, message: "Employee fetched successfully", data: emp });
  } catch (error) {
    res.status(500).json({ result: true, message: "Error fetching employee", error: error });
  }
});

router.put("/updateEmployeeFromId/:empId", upload.fields([
  { name: "offerLetter", maxCount: 1 },
  { name: "aadharCard", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
  { name: "educationCertificate", maxCount: 1 },
  { name: "relievingCertificate", maxCount: 1 },
  { name: "salarySlip", maxCount: 1 },
  { name: "profilePhoto", maxCount: 1 },
]), async (req, res) => {
  const { empId } = req.params;
  const { firstName, lastName, dob, personalPhoneNo, personalEmail, officialNo, officialEmail, joiningDate, branch, manager, firstMonthSalary, salaryCalculation, personName, relationship, personPhoneNo } = req.body;
  // console.log("Reqest file is :", req.files);

  const getFileDetails = (fileArray) => fileArray ? fileArray.map(file => ({
    fieldname: file.fieldname,
    originalname: file.originalname,
    encoding: file.encoding,
    mimetype: file.mimetype,
    destination: file.destination,
    filename: file.filename,
    path: file.path,
    size: file.size
  })) : [];

  const offerLetterDetails = getFileDetails(req.files ? req.files["offerLetter"] : []);
  const aadharCardDetails = getFileDetails(req.files ? req.files["aadharCard"] : []);
  const panCardDetails = getFileDetails(req.files ? req.files["panCard"] : []);
  const educationCertificateDetails = getFileDetails(req.files ? req.files["educationCertificate"] : []);
  const relievingCertificateDetails = getFileDetails(req.files ? req.files["relievingCertificate"] : []);
  const salarySlipDetails = getFileDetails(req.files ? req.files["salarySlip"] : []);
  const profilePhotoDetails = getFileDetails(req.files ? req.files["profilePhoto"] : []);

  try {
    if (!empId) {
      return res.status(404).json({ result: false, message: "Employee not found" });
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      const [day, month, year] = dateStr.split("-");
      return `${year}-${month}-${day}`;
    };

    const formattedDob = formatDate(dob);
    const formattedJoiningDate = formatDate(joiningDate);

    console.log("Formatted DOB:", formattedDob);
    console.log("Formatted Joining Date:", formattedJoiningDate);

    const emp = await adminModel.findOneAndUpdate(
      { _id: empId },
      {
        ...req.body,
        ename: `${firstName} ${lastName}`,
        dob: new Date(formattedDob),
        personal_number: personalPhoneNo,
        personal_email: personalEmail,
        email: officialEmail,
        number: officialNo,
        jdate: new Date(formattedJoiningDate),
        branchOffice: branch,
        reportingManager: manager,
        firstMonthSalaryCondition: firstMonthSalary,
        firstMonthSalary: salaryCalculation,
        offerLetter: offerLetterDetails || [],
        personal_contact_person: personName,
        personal_contact_person_relationship: relationship,
        personal_contact_person_number: personPhoneNo,
        aadharCard: aadharCardDetails || [],
        panCard: panCardDetails || [],
        educationCertificate: educationCertificateDetails || [],
        relievingCertificate: relievingCertificateDetails || [],
        salarySlip: salarySlipDetails || [],
        profilePhoto: profilePhotoDetails || [],
      },
      { new: true } // This option returns the updated document
    );

    if (!emp) {
      return res.status(404).json({ result: false, message: "Employee not found" });
    }

    res.status(200).json({ result: true, message: "Data successfully updated", data: emp });
  } catch (error) {
    res.status(500).json({ result: false, message: "Error updating employee", error: error.message });
  }
});

router.put("/savedeletedemployee", async (req, res) => {
  const { dataToDelete } = req.body;

  if (!dataToDelete || dataToDelete.length === 0) {
    return res.status(400).json({ error: "No employee data to save" });
  }
  try {
    const newLeads = await Promise.all(
      dataToDelete.map(async (data) => {
        // Retain the original _id
        const newData = {
          ...data,
          _id: data._id,
          deletedDate: new Date().toISOString(),
        };

        // Create a new document in the deletedEmployeeModel with the same _id
        return await deletedEmployeeModel.create(newData);
      })
    );

    res.status(200).json(newLeads);
  } catch (error) {
    console.error("Error saving deleted employee", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/deletedemployeeinfo", async (req, res) => {
  try {
    const data = await deletedEmployeeModel.find();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete(
  "/deleteemployeedromdeletedemployeedetails/:id",
  async (req, res) => {
    const { id: itemId } = req.params; // Correct destructuring
    console.log(itemId);
    try {
      const data = await deletedEmployeeModel.findByIdAndDelete(itemId);

      if (!data) {
        return res.status(404).json({ error: "Data not found" });
      } else {
        return res
          .status(200)
          .json({ message: "Data deleted successfully", data });
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.put("/revertbackdeletedemployeeintomaindatabase", async (req, res) => {
  const { dataToRevertBack } = req.body;

  if (!dataToRevertBack || dataToRevertBack.length === 0) {
    return res.status(400).json({ error: "No employee data to save" });
  }

  try {
    const newLeads = await Promise.all(
      dataToRevertBack.map(async (data) => {
        const newData = {
          ...data,
          _id: data._id,
        };
        return await adminModel.create(newData);
      })
    );

    res.status(200).json(newLeads);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      console.error("Duplicate key error:", error.message);
      return res.status(409).json({
        error: "Duplicate key error. Document with this ID already exists.",
      });
    }
    console.error("Error reverting back employee:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


// router.get('/achieved-details/:ename', async (req, res) => {
//   const { ename } = req.params;

//   try {
//     const employeeData = await adminModel.findOne({ ename });
//     if (!employeeData) {
//       return res.status(404).json({ error: 'Admin not found' });
//     }

//     const redesignedData = await RedesignedLeadformModel.find();
//     if (!redesignedData) {
//       return res.status(404).json({ error: 'No redesigned data found' });
//     }

//     const calculateAchievedRevenue = (data, ename, filterBy = 'This Month') => {
//       let achievedAmount = 0;
//       let expanse = 0;
//       let caCommision = 0;
//       const today = new Date();

//       const isDateInRange = (date, filterBy) => {
//         const bookingDate = new Date(date);
//         switch (filterBy) {
//           case 'Today':
//             return bookingDate.toLocaleDateString() === today.toLocaleDateString();
//           case 'Last Month':
//             return bookingDate.getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 1);
//           case 'This Month':
//             return bookingDate.getMonth() === today.getMonth();
//           default:
//             return false;
//         }
//       };

//       const processBooking = (booking, ename) => {
//         if ((booking.bdeName === ename || booking.bdmName === ename) && isDateInRange(booking.bookingDate, filterBy)) {
//           if (booking.bdeName === booking.bdmName) {
//             achievedAmount += Math.round(booking.generatedReceivedAmount);
//             expanse += booking.services.reduce((sum, serv) => sum + (serv.expanse || 0), 0);
//             if (booking.caCase === "Yes") caCommision += parseInt(booking.caCommission);
//           } else if (booking.bdmType === "Close-by") {
//             achievedAmount += Math.round(booking.generatedReceivedAmount) / 2;
//             expanse += booking.services.reduce((sum, serv) => sum + ((serv.expanse || 0) / 2), 0);
//             if (booking.caCase === "Yes") caCommision += parseInt(booking.caCommission) / 2;
//           } else if (booking.bdmType === "Supported-by" && booking.bdeName === ename) {
//             achievedAmount += Math.round(booking.generatedReceivedAmount);
//             expanse += booking.services.reduce((sum, serv) => sum + (serv.expanse || 0), 0);
//             if (booking.caCase === "Yes") caCommision += parseInt(booking.caCommission);
//           }
//         }
//       };

//       data.forEach(mainBooking => {
//         processBooking(mainBooking, ename);
//         mainBooking.moreBookings.forEach(moreObject => processBooking(moreObject, ename));
//       });

//       return achievedAmount - expanse - caCommision;
//     };

//     const currentYear = new Date().getFullYear();
//     const currentMonth = new Date().getMonth();

//     const achievedObject = employeeData.achievedObject.filter(obj => !(obj.year === currentYear && obj.month === currentMonth));

//     const newAchievedObject = {
//       year: currentYear,
//       month: currentMonth,
//       achievedAmount: calculateAchievedRevenue(redesignedData, ename)
//     };

//     achievedObject.push(newAchievedObject);

//     const updateResult = await adminModel.updateOne({ ename }, {
//       $set: { achievedObject }
//     });

//     res.json({ updateResult });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.get('/achieved-details/:ename', async (req, res) => {
//   const { ename } = req.params;

//   try {
//     const employeeData = await adminModel.findOne({ ename });
//     if (!employeeData) {
//       return res.status(404).json({ error: 'Admin not found' });
//     }

//     const redesignedData = await RedesignedLeadformModel.find();
//     if (!redesignedData) {
//       return res.status(404).json({ error: 'No redesigned data found' });
//     }

//     const calculateAchievedRevenue = (data, ename, filterBy = 'Last Month') => {
//       let achievedAmount = 0;
//       let expanse = 0;
//       let caCommission = 0;
//       let remainingAmount = 0;
//       let remainingExpense = 0;
//       const today = new Date();

//       const isDateInRange = (date, filterBy) => {
//         const bookingDate = new Date(date);
//         switch (filterBy) {
//           case 'Today':
//             return bookingDate.toLocaleDateString() === today.toLocaleDateString();
//           case 'Last Month':
//             const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
//             return bookingDate.getMonth() === lastMonth && bookingDate.getFullYear() === today.getFullYear();
//           case 'This Month':
//             return bookingDate.getMonth() === today.getMonth() && bookingDate.getFullYear() === today.getFullYear();
//           default:
//             return false;
//         }
//       };

//       const processBooking = (booking, ename) => {
//         if ((booking.bdeName === ename || booking.bdmName === ename) && isDateInRange(booking.bookingDate, filterBy)) {
//           if (booking.bdeName === booking.bdmName) {
//             achievedAmount += Math.round(booking.generatedReceivedAmount);
//             expanse += booking.services.reduce((sum, serv) => sum + (serv.expanse || 0), 0);
//             if (booking.caCase === "Yes") caCommission += parseInt(booking.caCommission);
//           } else if (booking.bdmType === "Close-by") {
//             achievedAmount += Math.round(booking.generatedReceivedAmount) / 2;
//             expanse += booking.services.reduce((sum, serv) => sum + ((serv.expanse || 0) / 2), 0);
//             if (booking.caCase === "Yes") caCommission += parseInt(booking.caCommission) / 2;
//           } else if (booking.bdmType === "Supported-by" && booking.bdeName === ename) {
//             achievedAmount += Math.round(booking.generatedReceivedAmount);
//             expanse += booking.services.reduce((sum, serv) => sum + (serv.expanse || 0), 0);
//             if (booking.caCase === "Yes") caCommission += parseInt(booking.caCommission);
//           }
//         }

//         if (booking.remainingPayments.length !== 0 && (booking.bdeName === ename || booking.bdmName === ename)) {
//           let remainingExpanseCondition = false;
//           switch (filterBy) {
//             case 'Today':
//               remainingExpanseCondition = booking.remainingPayments.some(item => new Date(item.paymentDate).toLocaleDateString() === today.toLocaleDateString());
//               break;
//             case 'Last Month':
//               remainingExpanseCondition = booking.remainingPayments.some(item => {
//                 const paymentDate = new Date(item.paymentDate);
//                 const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
//                 return paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === today.getFullYear();
//               });
//               break;
//             case 'This Month':
//               remainingExpanseCondition = booking.remainingPayments.some(item => {
//                 const paymentDate = new Date(item.paymentDate);
//                 return paymentDate.getMonth() === today.getMonth() && paymentDate.getFullYear() === today.getFullYear();
//               });
//               break;
//             default:
//               break;
//           }

//           if (remainingExpanseCondition && filterBy === "Last Month") {
//             const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
//             const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//             booking.services.forEach(serv => {
//               if (serv.expanseDate && new Date(serv.expanseDate) >= startDate && new Date(serv.expanseDate) <= endDate) {
//                 if (booking.bdeName !== booking.bdmName && booking.bdmType === "Close-by") {
//                   remainingExpense += serv.expanse / 2;
//                 } else if (booking.bdeName === booking.bdmName) {
//                   remainingExpense += serv.expanse;
//                 } else if (booking.bdeName !== booking.bdmName && booking.bdmType === "Supported-by" && booking.bdeName === ename) {
//                   remainingExpense += serv.expanse;
//                 }
//               }
//             });
//           }

//           booking.remainingPayments.forEach(remainingObj => {
//             let condition = false;
//             switch (filterBy) {
//               case 'Today':
//                 condition = new Date(remainingObj.paymentDate).toLocaleDateString() === today.toLocaleDateString();
//                 break;
//               case 'Last Month':
//                 condition = new Date(remainingObj.paymentDate).getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 1);
//                 break;
//               case 'This Month':
//                 condition = new Date(remainingObj.paymentDate).getMonth() === today.getMonth();
//                 break;
//               default:
//                 break;
//             }

//             if (condition) {
//               const findService = booking.services.find(service => service.serviceName === remainingObj.serviceName);
//               const tempAmount = findService.withGST ? Math.round(remainingObj.receivedPayment) / 1.18 : Math.round(remainingObj.receivedPayment);
//               if (booking.bdeName === booking.bdmName) {
//                 remainingAmount += Math.round(tempAmount);
//               } else if (booking.bdeName !== booking.bdmName && booking.bdmType === "Close-by") {
//                 remainingAmount += Math.round(tempAmount) / 2;
//               } else if (booking.bdeName !== booking.bdmName && booking.bdmType === "Supported-by" && booking.bdeName === ename) {
//                 remainingAmount += Math.round(tempAmount);
//               }
//             }
//           });
//         }
//       };

//       data.forEach(mainBooking => {
//         processBooking(mainBooking, ename);
//         mainBooking.moreBookings.forEach(moreObject => processBooking(moreObject, ename));
//       });

//       return achievedAmount + remainingAmount - expanse - remainingExpense - caCommission;
//     };

//     const currentYear = new Date().getFullYear();
//     const currentMonth = new Date().getMonth() + 1;  // Month is zero-indexed

//     const achievedAmount = calculateAchievedRevenue(redesignedData, ename);

//     const updateResult = await adminModel.updateOne(
//       {
//         ename,
//         'targetDetails.year': currentYear,
//         'targetDetails.month': currentMonth
//       },
//       {
//         $set: {
//           'targetDetails.$[elem].achievedAmount': achievedAmount
//         }
//       },
//       {
//         arrayFilters: [{ 'elem.year': currentYear, 'elem.month': currentMonth }]
//       }
//     );
//     console.log("achievedamont" , achievedAmount)
//     console.log(updateResult)

//     res.json({ updateResult });
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ error: error.message });
//   }
// });


// Function to calculate achieved revenue


// const calculateAchievedRevenue = (data, ename, filterBy = 'Last Month') => {
//   let achievedAmount = 0;
//   let expanse = 0;
//   let caCommission = 0;
//   let remainingAmount = 0;
//   let remainingExpense = 0;
//   const today = new Date();

//   const isDateInRange = (date, filterBy) => {
//     const bookingDate = new Date(date);
//     switch (filterBy) {
//       case 'Today':
//         return bookingDate.toLocaleDateString() === today.toLocaleDateString();
//       case 'Last Month':
//         const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
//         return bookingDate.getMonth() === lastMonth && bookingDate.getFullYear() === today.getFullYear();
//       case 'This Month':
//         return bookingDate.getMonth() === today.getMonth() && bookingDate.getFullYear() === today.getFullYear();
//       default:
//         return false;
//     }
//   };

//   const processBooking = (booking, ename) => {
//     if ((booking.bdeName === ename || booking.bdmName === ename) && isDateInRange(booking.bookingDate, filterBy)) {
//       if (booking.bdeName === booking.bdmName) {
//         achievedAmount += Math.round(booking.generatedReceivedAmount);
//         expanse += booking.services.reduce((sum, serv) => sum + (serv.expanse || 0), 0);
//         if (booking.caCase === "Yes") caCommission += parseInt(booking.caCommission);
//       } else if (booking.bdmType === "Close-by") {
//         achievedAmount += Math.round(booking.generatedReceivedAmount) / 2;
//         expanse += booking.services.reduce((sum, serv) => sum + ((serv.expanse || 0) / 2), 0);
//         if (booking.caCase === "Yes") caCommission += parseInt(booking.caCommission) / 2;
//       } else if (booking.bdmType === "Supported-by" && booking.bdeName === ename) {
//         achievedAmount += Math.round(booking.generatedReceivedAmount);
//         expanse += booking.services.reduce((sum, serv) => sum + (serv.expanse || 0), 0);
//         if (booking.caCase === "Yes") caCommission += parseInt(booking.caCommission);
//       }
//     }else if (booking.remainingPayments.length !== 0 && (booking.bdeName === ename || booking.bdmName === ename)) {
//       let remainingExpanseCondition = false;
//       switch (filterBy) {
//         case 'Today':
//           remainingExpanseCondition = booking.remainingPayments.some(item => new Date(item.paymentDate).toLocaleDateString() === today.toLocaleDateString());
//           break;
//         case 'Last Month':
//           remainingExpanseCondition = booking.remainingPayments.some(item => {
//             const paymentDate = new Date(item.paymentDate);
//             const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
//             return paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === today.getFullYear();
//           });
//           break;
//         case 'This Month':
//           remainingExpanseCondition = booking.remainingPayments.some(item => {
//             const paymentDate = new Date(item.paymentDate);
//             return paymentDate.getMonth() === today.getMonth() && paymentDate.getFullYear() === today.getFullYear();
//           });
//           break;
//         default:
//           break;
//       }

//       if (remainingExpanseCondition && filterBy === "Last Month") {
//         const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
//         const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//         booking.services.forEach(serv => {
//           if (serv.expanseDate && new Date(serv.expanseDate) >= startDate && new Date(serv.expanseDate) <= endDate) {
//             if (booking.bdeName !== booking.bdmName && booking.bdmType === "Close-by") {
//               remainingExpense += serv.expanse / 2;
//             } else if (booking.bdeName === booking.bdmName) {
//               remainingExpense += serv.expanse;
//             } else if (booking.bdeName !== booking.bdmName && booking.bdmType === "Supported-by" && booking.bdeName === ename) {
//               remainingExpense += serv.expanse;
//             }
//           }
//         });
//       }

//       booking.remainingPayments.forEach(remainingObj => {
//         let condition = false;
//         switch (filterBy) {
//           case 'Today':
//             condition = new Date(remainingObj.paymentDate).toLocaleDateString() === today.toLocaleDateString();
//             break;
//           case 'Last Month':
//             condition = new Date(remainingObj.paymentDate).getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 1);
//             break;
//           case 'This Month':
//             condition = new Date(remainingObj.paymentDate).getMonth() === today.getMonth();
//             break;
//           default:
//             break;
//         }

//         if (condition) {
//           const findService = booking.services.find(service => service.serviceName === remainingObj.serviceName);
//           const tempAmount = findService.withGST ? Math.round(remainingObj.receivedPayment) / 1.18 : Math.round(remainingObj.receivedPayment);
//           if (booking.bdeName === booking.bdmName) {
//             remainingAmount += Math.round(tempAmount);
//           } else if (booking.bdeName !== booking.bdmName && booking.bdmType === "Close-by") {
//             remainingAmount += Math.round(tempAmount) / 2;
//           } else if (booking.bdeName !== booking.bdmName && booking.bdmType === "Supported-by" && booking.bdeName === ename) {
//             remainingAmount += Math.round(tempAmount);
//           }
//         }
//       });
//     }
//   };

//   data.forEach(mainBooking => {
//     processBooking(mainBooking, ename);
//     mainBooking.moreBookings.forEach(moreObject => processBooking(moreObject, ename));
//   });
//   console.log(achievedAmount,expanse,remainingAmount,)
//   console.log("function me achieved" ,achievedAmount + remainingAmount - expanse - remainingExpense - caCommission)

//   return achievedAmount + remainingAmount - expanse - remainingExpense - caCommission;
// };

// router.get('/achieved-details/:ename', async (req, res) => {
//   const { ename } = req.params;

//   try {
//     const employeeData = await adminModel.findOne({ ename });
//     if (!employeeData) {
//       return res.status(404).json({ error: 'Admin not found' });
//     }

//     const redesignedData = await RedesignedLeadformModel.find();
//     if (!redesignedData) {
//       return res.status(404).json({ error: 'No redesigned data found' });
//     }

//     const achievedAmount = calculateAchievedRevenue(redesignedData, ename);

//     console.log("achievedAmount" , achievedAmount)

//     const today = new Date();
//     const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//     const lastMonth = monthNames[today.getMonth() === 0 ? 11 : today.getMonth() - 1];

//     const targetDetailsUpdated = employeeData.targetDetails.map((targetDetail) => {
//       if (targetDetail.month === lastMonth) {
//         targetDetail.achievedAmount = achievedAmount;
//         targetDetail.ratio = Math.round((parseFloat(achievedAmount) / parseFloat(targetDetail.amount)) * 100);
//         const roundedRatio = Math.round(targetDetail.ratio);
//         if (roundedRatio === 0) {
//           targetDetail.result = "Poor";
//         } else if (roundedRatio > 0 && roundedRatio <= 40) {
//           targetDetail.result = "Poor";
//         } else if (roundedRatio >= 41 && roundedRatio <= 60) {
//           targetDetail.result = "Below Average";
//         } else if (roundedRatio >= 61 && roundedRatio <= 74) {
//           targetDetail.result = "Average";
//         } else if (roundedRatio >= 75 && roundedRatio <= 99) {
//           targetDetail.result = "Good";
//         } else if (roundedRatio >= 100 && roundedRatio <= 149) {
//           targetDetail.result = "Excellent";
//         } else if (roundedRatio >= 150 && roundedRatio <= 199) {
//           targetDetail.result = "Extraordinary";
//         } else if (roundedRatio >= 200 && roundedRatio <= 249) {
//           targetDetail.result = "Outstanding";
//         } else if (roundedRatio >= 250) {
//           targetDetail.result = "Exceptional";
//         }
//       }
//       return targetDetail;
//     });

//     // Update the employee data
//     const updateResult = await adminModel.findOneAndUpdate(
//       { ename },
//       { targetDetails: targetDetailsUpdated },
//       { new: true }
//     );

//     res.json({ updateResult });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// });
// const calculateAchievedRevenue = (data, ename, filterBy) => {
//   let achievedAmount = 0;
//   let expanse = 0;
//   let caCommission = 0;
//   let remainingAmount = 0;
//   let remainingExpense = 0;
//   const today = new Date();

//   const isDateInRange = (date, filterBy) => {
//     const bookingDate = new Date(date);
//     switch (filterBy) {
//       case 'Today':
//         return bookingDate.toLocaleDateString() === today.toLocaleDateString();
//       case 'Last Month':
//         const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
//         return bookingDate.getMonth() === lastMonth && bookingDate.getFullYear() === today.getFullYear();
//       case 'This Month':
//         return bookingDate.getMonth() === today.getMonth() && bookingDate.getFullYear() === today.getFullYear();
//       default:
//         return false;
//     }
//   };

//   const processBooking = (booking, ename) => {
//     if ((booking.bdeName === ename || booking.bdmName === ename) && isDateInRange(booking.bookingDate, filterBy)) {
//       if (booking.bdeName === booking.bdmName) {
//         achievedAmount += Math.round(booking.generatedReceivedAmount);
//         expanse += booking.services.reduce((sum, serv) => sum + (serv.expanse || 0), 0);
//         if (booking.caCase === "Yes") caCommission += parseInt(booking.caCommission);
//       } else if (booking.bdmType === "Close-by") {
//         achievedAmount += Math.round(booking.generatedReceivedAmount) / 2;
//         expanse += booking.services.reduce((sum, serv) => sum + ((serv.expanse || 0) / 2), 0);
//         if (booking.caCase === "Yes") caCommission += parseInt(booking.caCommission) / 2;
//       } else if (booking.bdmType === "Supported-by" && booking.bdeName === ename) {
//         achievedAmount += Math.round(booking.generatedReceivedAmount);
//         expanse += booking.services.reduce((sum, serv) => sum + (serv.expanse || 0), 0);
//         if (booking.caCase === "Yes") caCommission += parseInt(booking.caCommission);
//       }
//     } else if (booking.remainingPayments.length !== 0 && (booking.bdeName === ename || booking.bdmName === ename)) {
//       let remainingExpanseCondition = false;
//       switch (filterBy) {
//         case 'Today':
//           remainingExpanseCondition = booking.remainingPayments.some(item => new Date(item.paymentDate).toLocaleDateString() === today.toLocaleDateString());
//           break;
//         case 'Last Month':
//           remainingExpanseCondition = booking.remainingPayments.some(item => {
//             const paymentDate = new Date(item.paymentDate);
//             const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
//             return paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === today.getFullYear();
//           });
//           break;
//         case 'This Month':
//           remainingExpanseCondition = booking.remainingPayments.some(item => {
//             const paymentDate = new Date(item.paymentDate);
//             return paymentDate.getMonth() === today.getMonth() && paymentDate.getFullYear() === today.getFullYear();
//           });
//           break;
//         default:
//           break;
//       }

//       if (remainingExpanseCondition && filterBy === "Last Month") {
//         const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
//         const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//         booking.services.forEach(serv => {
//           if (serv.expanseDate && new Date(serv.expanseDate) >= startDate && new Date(serv.expanseDate) <= endDate) {
//             if (booking.bdeName !== booking.bdmName && booking.bdmType === "Close-by") {
//               remainingExpense += serv.expanse / 2;
//             } else if (booking.bdeName === booking.bdmName) {
//               remainingExpense += serv.expanse;
//             } else if (booking.bdeName !== booking.bdmName && booking.bdmType === "Supported-by" && booking.bdeName === ename) {
//               remainingExpense += serv.expanse;
//             }
//           }
//         });
//       }

//       booking.remainingPayments.forEach(remainingObj => {
//         let condition = false;
//         switch (filterBy) {
//           case 'Today':
//             condition = new Date(remainingObj.paymentDate).toLocaleDateString() === today.toLocaleDateString();
//             break;
//           case 'Last Month':
//             condition = new Date(remainingObj.paymentDate).getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 1);
//             break;
//           case 'This Month':
//             condition = new Date(remainingObj.paymentDate).getMonth() === today.getMonth();
//             break;
//           default:
//             break;
//         }

//         if (condition) {
//           const findService = booking.services.find(service => service.serviceName === remainingObj.serviceName);
//           const tempAmount = findService.withGST ? Math.round(remainingObj.receivedPayment) / 1.18 : Math.round(remainingObj.receivedPayment);
//           if (booking.bdeName === booking.bdmName) {
//             remainingAmount += Math.round(tempAmount);
//           } else if (booking.bdeName !== booking.bdmName && booking.bdmType === "Close-by") {
//             remainingAmount += Math.round(tempAmount) / 2;
//           } else if (booking.bdeName !== booking.bdmName && booking.bdmType === "Supported-by" && booking.bdeName === ename) {
//             remainingAmount += Math.round(tempAmount);
//           }
//         }
//       });
//     }
//   };

//   data.forEach(mainBooking => {
//     processBooking(mainBooking, ename);
//     mainBooking.moreBookings.forEach(moreObject => processBooking(moreObject, ename));
//   });

//   console.log("achieved", achievedAmount + remainingAmount - expanse - remainingExpense - caCommission);

//   return achievedAmount + remainingAmount - expanse - remainingExpense - caCommission;
// };

const functionCalculateAchievedRevenue = (redesignedData, ename, Filterby) => {
  //console.log("yahan chla achieved full function")
  let achievedAmount = 0;
  let remainingAmount = 0;
  let expanse = 0;
  let remainingExpense = 0;
  let remainingMoreExpense = 0;
  let add_caCommision = 0;
  const today = new Date();
  const cleanString = (str) => (str ? str.replace(/\s+/g, '').toLowerCase() : '');

  redesignedData.map((mainBooking) => {
    let condition = false;
    switch (Filterby) {
      case 'Today':
        condition = (new Date(mainBooking.bookingDate).toLocaleDateString() === today.toLocaleDateString())
        break;
      case 'Last Month':
        condition = (new Date(mainBooking.bookingDate).getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1)) && (new Date(mainBooking.bookingDate).getFullYear() === today.getFullYear())
        break;
      case 'This Month':
        condition = (new Date(mainBooking.bookingDate).getMonth() === today.getMonth()) && (new Date(mainBooking.bookingDate).getFullYear() === today.getFullYear())
        break;
      default:
        break;
    }
    if (condition && (cleanString(mainBooking.bdeName) === cleanString(ename) || cleanString(mainBooking.bdmName) === cleanString(ename))) {

      if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
        //achievedAmount = achievedAmount + Math.round(mainBooking.generatedReceivedAmount);
        mainBooking.services.map(serv => {
          if (serv.paymentTerms === "Full Advanced") {
            achievedAmount = achievedAmount + serv.totalPaymentWOGST;
          } else {
            if (serv.withGST) {
              achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18);
            } else {
              achievedAmount = achievedAmount + Math.round(serv.firstPayment);
            }
          }
          // console.log(serv.expanse , bdeName ,"this is services");
          let expanseDate = null
          if (serv.expanse) {
            expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
            expanseDate.setHours(0, 0, 0, 0);
            let expanseCondition = false;
            switch (Filterby) {
              case 'Today':
                expanseCondition = (new Date(expanseDate).toLocaleDateString() === today.toLocaleDateString())
                break;
              case 'Last Month':
                expanseCondition = (new Date(expanseDate).getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1)) && (new Date(expanseDate).getFullYear() === today.getFullYear())
                break;
              case 'This Month':
                expanseCondition = (new Date(expanseDate).getMonth() === today.getMonth()) && (new Date(expanseDate).getFullYear() === today.getFullYear())
                break;
              default:
                break;
            }
            expanse = expanseCondition ? expanse + serv.expanse : expanse;
          }
        });
        if (mainBooking.caCase === "Yes") {
          add_caCommision += parseInt(mainBooking.caCommission)
        }
      } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
        //achievedAmount = achievedAmount + Math.floor(mainBooking.generatedReceivedAmount) / 2;
        mainBooking.services.map(serv => {
          // console.log(serv.expanse , bdeName ,"this is services");
          if (serv.paymentTerms === "Full Advanced") {
            achievedAmount = achievedAmount + serv.totalPaymentWOGST / 2;
          } else {
            if (serv.withGST) {
              achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18) / 2;
            } else {
              achievedAmount = achievedAmount + Math.round(serv.firstPayment) / 2;
            }
          }
          let expanseDate = null
          expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
          expanseDate.setHours(0, 0, 0, 0);
          if (serv.expanse) {
            let expanseCondition = false;
            switch (Filterby) {
              case 'Today':
                expanseCondition = (expanseDate.toLocaleDateString() === today.toLocaleDateString())
                break;
              case 'Last Month':
                expanseCondition = (expanseDate.getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1)) && (expanseDate.getFullYear() === today.getFullYear())
                break;
              case 'This Month':
                expanseCondition = (expanseDate.getMonth() === today.getMonth()) && (expanseDate.getFullYear() === today.getFullYear())
                break;
              default:
                break;
            }
            expanse = expanseCondition ? expanse + serv.expanse / 2 : expanse;
          }
        });
        if (mainBooking.caCase === "Yes") {
          add_caCommision += parseInt(mainBooking.caCommission) / 2;
        }
      } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Supported-by") {
        if (cleanString(mainBooking.bdeName) === cleanString(ename)) {
          //achievedAmount = achievedAmount + Math.round(mainBooking.generatedReceivedAmount);
          mainBooking.services.map(serv => {
            if (serv.paymentTerms === "Full Advanced") {
              achievedAmount = achievedAmount + serv.totalPaymentWOGST;
            } else {
              if (serv.withGST) {
                achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18);
              } else {
                achievedAmount = achievedAmount + Math.round(serv.firstPayment);
              }
            }
            // console.log(serv.expanse , bdeName ,"this is services");
            let expanseDate = null
            expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
            expanseDate.setHours(0, 0, 0, 0);
            if (serv.expanse) {
              let expanseCondition = false;
              switch (Filterby) {
                case 'Today':
                  expanseCondition = (expanseDate.toLocaleDateString() === today.toLocaleDateString())
                  break;
                case 'Last Month':
                  expanseCondition = (expanseDate.getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1)) && (expanseDate.getFullYear() === today.getFullYear())
                  break;
                case 'This Month':
                  expanseCondition = (expanseDate.getMonth() === today.getMonth()) && (expanseDate.getFullYear() === today.getFullYear())
                  break;
                default:
                  break;
              }
              expanse = expanseCondition ? expanse + serv.expanse : expanse;
            }
          });
          if (mainBooking.caCase === "Yes") {
            add_caCommision += parseInt(mainBooking.caCommission);
          }
        }
      }
    }
    if (mainBooking.remainingPayments.length !== 0 && (cleanString(mainBooking.bdeName) === cleanString(ename) || cleanString(mainBooking.bdmName) === cleanString(ename))) {
      let remainingExpanseCondition = false;
      switch (Filterby) {
        case 'Today':
          remainingExpanseCondition = mainBooking.remainingPayments.some(item => new Date(item.paymentDate).toLocaleDateString() === today.toLocaleDateString())
          break;
        case 'Last Month':
          remainingExpanseCondition = mainBooking.remainingPayments.some(item => new Date(item.paymentDate).getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 1))
          break;
        case 'This Month':
          remainingExpanseCondition = mainBooking.remainingPayments.some(item => new Date(item.paymentDate).getMonth() === today.getMonth() && new Date(item.paymentDate).getFullYear() === today.getFullYear())
          break;
        default:
          break;
      }

      if (remainingExpanseCondition && Filterby === "This Month") {
        const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        mainBooking.services.forEach(serv => {
          if (serv.expanseDate && new Date(serv.expanseDate) >= startDate && new Date(serv.expanseDate) <= endDate) {
            if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
              remainingExpense += serv.expanse / 2;
            } else if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
              remainingExpense += serv.expanse;
            } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Support-by" && mainBooking.bdemName === cleanString(ename)) {
              remainingExpense += serv.expanse;
            }
          }

        });
      }

      mainBooking.remainingPayments.map((remainingObj) => {
        let condition = false;
        switch (Filterby) {
          case 'Today':
            condition = (new Date(remainingObj.paymentDate).toLocaleDateString() === today.toLocaleDateString())
            break;
          case 'Last Month':
            condition = (new Date(remainingObj.paymentDate).getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1))
            break;
          case 'This Month':
            condition = (new Date(remainingObj.paymentDate).getMonth() === today.getMonth())
            break;
          default:
            break;
        }
        if (condition) {
          // Find the service from mainBooking.services
          const findService = mainBooking.services.find(service => service.serviceName === remainingObj.serviceName);
          console.log("findService", mainBooking["Company Name"], findService)
          // Check if findService is defined
          if (findService) {
            // Calculate the tempAmount based on whether GST is included
            const tempAmount = findService.withGST
              ? Math.round(remainingObj.receivedPayment) / 1.18
              : Math.round(remainingObj.receivedPayment);

            // Update remainingAmount based on conditions
            if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
              remainingAmount += Math.round(tempAmount);
            } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
              remainingAmount += Math.round(tempAmount) / 2;
            } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Supported-by") {
              if (cleanString(mainBooking.bdeName) === cleanString(ename)) {
                remainingAmount += Math.round(tempAmount);
              }
            }
          } else {
            // Optional: Handle the case where findService is undefined
            console.warn(`Service with name ${remainingObj.serviceName} not found.`);
          }
        }
      })
    }

    mainBooking.moreBookings.map((moreObject) => {
      let condition = false;
      switch (Filterby) {
        case 'Today':
          condition = (new Date(moreObject.bookingDate).toLocaleDateString() === today.toLocaleDateString())
          break;
        case 'Last Month':
          condition = (new Date(moreObject.bookingDate).getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1))
          break;
        case 'This Month':
          condition = (new Date(moreObject.bookingDate).getMonth() === today.getMonth())
          break;
        default:
          break;
      }
      if (condition && (cleanString(moreObject.bdeName) === cleanString(ename) || cleanString(moreObject.bdmName) === cleanString(ename))) {

        if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
          //achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount);
          moreObject.services.map(serv => {
            if (serv.paymentTerms === "Full Advanced") {
              achievedAmount = achievedAmount + serv.totalPaymentWOGST;
            } else {
              if (serv.withGST) {
                achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18);
              } else {
                achievedAmount = achievedAmount + Math.round(serv.firstPayment);
              }
            }
            // console.log(serv.expanse , bdeName ,"this is services");
            let expanseDate = null
            expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
            expanseDate.setHours(0, 0, 0, 0);
            if (serv.expanse) {
              let expanseCondition = false;
              switch (Filterby) {
                case 'Today':
                  expanseCondition = (expanseDate.toLocaleDateString() === today.toLocaleDateString())
                  break;
                case 'Last Month':
                  expanseCondition = (expanseDate.getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1)) && (expanseDate.getFullYear() === today.getFullYear())
                  break;
                case 'This Month':
                  expanseCondition = (expanseDate.getMonth() === today.getMonth()) && (expanseDate.getFullYear() === today.getFullYear())
                  break;
                default:
                  break;
              }
              expanse = expanseCondition ? expanse + serv.expanse : expanse;
            }
          });
          if (moreObject.caCase === "Yes") {
            add_caCommision += parseInt(moreObject.caCommission);
          }
        } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
          //achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount) / 2;
          moreObject.services.map(serv => {
            if (serv.paymentTerms === "Full Advanced") {
              achievedAmount = achievedAmount + serv.totalPaymentWOGST / 2;
            } else {
              if (serv.withGST) {
                achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18) / 2;
              } else {
                achievedAmount = achievedAmount + Math.round(serv.firstPayment) / 2;
              }
            }
            // console.log(serv.expanse , bdeName ,"this is services");
            let expanseDate = null
            expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
            expanseDate.setHours(0, 0, 0, 0);
            if (serv.expanse) {
              let expanseCondition = false;
              switch (Filterby) {
                case 'Today':
                  expanseCondition = (expanseDate.toLocaleDateString() === today.toLocaleDateString())
                  break;
                case 'Last Month':
                  expanseCondition = (expanseDate.getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1)) && (expanseDate.getFullYear() === today.getFullYear())
                  break;
                case 'This Month':
                  expanseCondition = (expanseDate.getMonth() === today.getMonth()) && (expanseDate.getFullYear() === today.getFullYear())
                  break;
                default:
                  break;
              }
              expanse = expanseCondition ? expanse + serv.expanse / 2 : expanse;
            }
          });
          if (moreObject.caCase === "Yes") {
            add_caCommision += parseInt(moreObject.caCommission) / 2;
          }
        } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Supported-by") {
          if (cleanString(moreObject.bdeName) === cleanString(ename)) {
            //achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount);
            moreObject.services.map(serv => {
              if (serv.paymentTerms === "Full Advanced") {
                achievedAmount = achievedAmount + serv.totalPaymentWOGST;
              } else {
                if (serv.withGST) {
                  achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18);
                } else {
                  achievedAmount = achievedAmount + Math.round(serv.firstPayment);
                }
              }
              // console.log(serv.expanse , bdeName ,"this is services");
              let expanseDate = null
              expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
              expanseDate.setHours(0, 0, 0, 0);
              if (serv.expanse) {
                let expanseCondition = false;
                switch (Filterby) {
                  case 'Today':
                    expanseCondition = (expanseDate.toLocaleDateString() === today.toLocaleDateString())
                    break;
                  case 'Last Month':
                    expanseCondition = (expanseDate.getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1)) && (expanseDate.getFullYear() === today.getFullYear())
                    break;
                  case 'This Month':
                    expanseCondition = (expanseDate.getMonth() === today.getMonth()) && (expanseDate.getFullYear() === today.getFullYear())
                    break;
                  default:
                    break;
                }
                expanse = expanseCondition ? expanse + serv.expanse : expanse;
              }
            });
            if (moreObject.caCase === "Yes") {
              add_caCommision += parseInt(moreObject.caCommission);
            }
          }
        }
      }
      if (moreObject.remainingPayments.length !== 0 && (cleanString(moreObject.bdeName) === cleanString(ename) || cleanString(moreObject.bdmName) === cleanString(ename))) {

        let remainingExpanseCondition = false;
        switch (Filterby) {
          case 'Today':
            remainingExpanseCondition = moreObject.remainingPayments.some(item => new Date(item.paymentDate).toLocaleDateString() === today.toLocaleDateString())
            break;
          case 'Last Month':
            remainingExpanseCondition = moreObject.remainingPayments.some(item => new Date(item.paymentDate).getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 1))
            break;
          case 'This Month':
            remainingExpanseCondition = moreObject.remainingPayments.some(item => new Date(item.paymentDate).getMonth() === today.getMonth() && new Date(item.paymentDate).getFullYear() === today.getFullYear())
            break;
          default:
            break;
        }

        if (remainingExpanseCondition && Filterby === "This Month") {
          const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
          const endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
          moreObject.services.forEach(serv => {

            if (serv.expanseDate && new Date(serv.expanseDate) >= startDate && new Date(serv.expanseDate) <= endDate) {
              if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
                remainingMoreExpense += serv.expanse / 2;
              } else if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
                remainingMoreExpense += serv.expanse;
              } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Support-by" && moreObject.bdemName === cleanString(ename)) {
                remainingMoreExpense += serv.expanse;
              }
            }

          });
        }

        moreObject.remainingPayments.map((remainingObj) => {
          let condition = false;
          switch (Filterby) {
            case 'Today':
              condition = (new Date(remainingObj.paymentDate).toLocaleDateString() === today.toLocaleDateString())
              break;
            case 'Last Month':
              condition = (new Date(remainingObj.paymentDate).getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1))
              break;
            case 'This Month':
              condition = (new Date(remainingObj.paymentDate).getMonth() === today.getMonth())
              break;
            default:
              break;
          }
          if (condition) {

            const findService = moreObject.services.find((services) => services.serviceName === remainingObj.serviceName)
            const tempAmount = findService.withGST ? Math.round(remainingObj.receivedPayment) / 1.18 : Math.round(remainingObj.receivedPayment);
            if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
              remainingAmount += Math.round(tempAmount);
            } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
              remainingAmount += Math.round(tempAmount) / 2;
            } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Supported-by") {
              if (cleanString(moreObject.bdeName) === cleanString(ename)) {
                remainingAmount += Math.round(tempAmount);
              }
            }
          }
        })
      }
    })
  })
  return achievedAmount + Math.round(remainingAmount) - expanse - remainingExpense - remainingMoreExpense - add_caCommision;
};

router.get('/achieved-details/:ename', async (req, res) => {
  const { ename } = req.params;

  try {
    const employeeData = await adminModel.findOne({ ename });
    if (!employeeData) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const redesignedData = await RedesignedLeadformModel.find();
    if (!redesignedData) {
      return res.status(404).json({ error: 'No redesigned data found' });
    }

    const lastMonthAchievedAmount = functionCalculateAchievedRevenue(redesignedData, ename, 'Last Month');
    const thisMonthAchievedAmount = functionCalculateAchievedRevenue(redesignedData, ename, 'This Month');

    const today = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const lastMonth = monthNames[today.getMonth() === 0 ? 11 : today.getMonth() - 1];
    const thisMonth = monthNames[today.getMonth()];

    // console.log("Last Month:", lastMonth);
    // console.log("This Month:", thisMonth);
    // console.log("Employee Target Details Before Update:", employeeData.targetDetails);

    const targetDetailsUpdated = employeeData.targetDetails.map((targetDetail) => {
      if (targetDetail.month === lastMonth) {
        targetDetail.achievedAmount = lastMonthAchievedAmount;
        targetDetail.ratio = Math.round((parseFloat(lastMonthAchievedAmount) / parseFloat(targetDetail.amount)) * 100);
        const roundedRatio = Math.round(targetDetail.ratio);
        if (roundedRatio === 0) {
          targetDetail.result = "Poor";
        } else if (roundedRatio > 0 && roundedRatio <= 40) {
          targetDetail.result = "Poor";
        } else if (roundedRatio >= 41 && roundedRatio <= 60) {
          targetDetail.result = "Below Average";
        } else if (roundedRatio >= 61 && roundedRatio <= 74) {
          targetDetail.result = "Average";
        } else if (roundedRatio >= 75 && roundedRatio <= 99) {
          targetDetail.result = "Good";
        } else if (roundedRatio >= 100 && roundedRatio <= 149) {
          targetDetail.result = "Excellent";
        } else if (roundedRatio >= 150 && roundedRatio <= 199) {
          targetDetail.result = "Extraordinary";
        } else if (roundedRatio >= 200 && roundedRatio <= 249) {
          targetDetail.result = "Outstanding";
        } else if (roundedRatio >= 250) {
          targetDetail.result = "Exceptional";
        }
      } else if (targetDetail.month === thisMonth) {
        targetDetail.achievedAmount = thisMonthAchievedAmount;
        targetDetail.ratio = Math.round((parseFloat(thisMonthAchievedAmount) / parseFloat(targetDetail.amount)) * 100);
        const roundedRatio = Math.round(targetDetail.ratio);
        if (roundedRatio === 0) {
          targetDetail.result = "Poor";
        } else if (roundedRatio > 0 && roundedRatio <= 40) {
          targetDetail.result = "Poor";
        } else if (roundedRatio >= 41 && roundedRatio <= 60) {
          targetDetail.result = "Below Average";
        } else if (roundedRatio >= 61 && roundedRatio <= 74) {
          targetDetail.result = "Average";
        } else if (roundedRatio >= 75 && roundedRatio <= 99) {
          targetDetail.result = "Good";
        } else if (roundedRatio >= 100 && roundedRatio <= 149) {
          targetDetail.result = "Excellent";
        } else if (roundedRatio >= 150 && roundedRatio <= 199) {
          targetDetail.result = "Extraordinary";
        } else if (roundedRatio >= 200 && roundedRatio <= 249) {
          targetDetail.result = "Outstanding";
        } else if (roundedRatio >= 250) {
          targetDetail.result = "Exceptional";
        }
      }
      return targetDetail;
    });

    // console.log("Employee Target Details After Update:", targetDetailsUpdated);

    // Update the employee data
    const updateResult = await adminModel.findOneAndUpdate(
      { ename },
      { targetDetails: targetDetailsUpdated },
      { new: true }
    );

    res.json({ updateResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// 2. Read the Employee
router.get("/einfo", async (req, res) => {
  try {
    const data = await adminModel.find();
    res.json(data);
  } catch (error) {

    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});
// 3. Update the Employee
// router.put("/einfo/:id", async (req, res) => {
//   const id = req.params.id;
//   const dataToSendUpdated = req.body;
//   console.log("updatedData", dataToSendUpdated)
//   try {
//     const updatedData = await adminModel.findByIdAndUpdate(id, dataToSendUpdated, {
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

router.put("/einfo/:id", async (req, res) => {
  const id = req.params.id;
  const dataToSendUpdated = req.body;

  // Calculate ratio and result for each target detail
  dataToSendUpdated.targetDetails.forEach(target => {
    const amount = parseFloat(target.amount);
    const achievedAmount = parseFloat(target.achievedAmount);
    target.ratio = (achievedAmount / amount) * 100;

    // Determine the result based on the ratio
    const roundedRatio = Math.round(target.ratio);
    if (roundedRatio === 0) {
      target.result = "Poor";
    } else if (roundedRatio > 0 && roundedRatio <= 40) {
      target.result = "Poor";
    } else if (roundedRatio >= 41 && roundedRatio <= 60) {
      target.result = "Below Average";
    } else if (roundedRatio >= 61 && roundedRatio <= 74) {
      target.result = "Average";
    } else if (roundedRatio >= 75 && roundedRatio <= 99) {
      target.result = "Good";
    } else if (roundedRatio >= 100 && roundedRatio <= 149) {
      target.result = "Excellent";
    } else if (roundedRatio >= 150 && roundedRatio <= 199) {
      target.result = "Extraordinary";
    } else if (roundedRatio >= 200 && roundedRatio <= 249) {
      target.result = "Outstanding";
    } else if (roundedRatio >= 250) {
      target.result = "Exceptional";
    }
  });

  try {
    const updatedData = await adminModel.findByIdAndUpdate(id, dataToSendUpdated, {
      new: true,
    });

    if (!updatedData) {
      return res.status(404).json({ error: "Data not found" });
    }

    res.json({ message: "Data updated successfully", updatedData });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// 4. Delete an Employee
router.delete("/einfo/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // Use findByIdAndDelete to delete the document by its ID
    const deletedData = await adminModel.findByIdAndDelete(id);

    if (!deletedData) {
      return res.status(404).json({ error: "Data not found" });
    }

    res.json({ message: "Data deleted successfully", deletedData });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/permanentDelete/:id", async (req, res) => {
  const itemId = req.params.id;
  console.log(itemId);
  try {
    const deletedData = await deletedEmployeeModel.findByIdAndDelete(itemId);

    if (!deletedData) {
      return res.status(404).json({ error: "Data not found" });
    }
    res.status(200).json({ message: "Data deleted successfully", deletedData });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/einfo/:email/:password", async (req, res) => {
  const { email, password } = req.params;

  try {
    const data = await adminModel.findOne({ email: email, password: password });

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ error: "Employee not found" });
    }
  } catch (error) {
    console.log("Error fetching employee data", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post(
  "/employeeimages/:employeeName",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("No files were uploaded");
      }

      const employeeName = req.params.employeeName;

      // Find the employee by name
      const employee = await adminModel.findOne({ ename: employeeName });

      if (!employee) {
        return res.status(404).send("Employee Not Found");
      }

      // Construct the file details to store
      const fileDetails = {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date(),
      };

      // Update the employee_profile array
      // employee.employee_profile(fileDetails);
      // await employee.save();

      employee.employee_profile = fileDetails;
      await employee.save();

      // Remove old employee images after uploading the new one
      removeOldEmployeeImages(employeeName, req.file.filename);

      // Handle other logic like saving to database or processing
      res.status(200).send({
        message: "File Uploaded Successfully",
        imageUrl: `/path/to/${req.file.filename}`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }

    // This function is remove the old employee profile image then store the latest employee profile image
    function removeOldEmployeeImages(employeeName, newFileName) {
      const directoryPath = path.join(
        __dirname,
        `../EmployeeImages/${employeeName}`
      );

      fs.readdir(directoryPath, (err, files) => {
        if (err) {
          console.error("Error reading directory:", err);
          return;
        }

        files.forEach((file) => {
          if (file !== newFileName) {
            const filePath = path.join(directoryPath, file);

            fs.unlink(filePath, (err) => {
              if (err) {
                console.error("Error deleting file:", err);
              } else {
                console.log("Deleted old file:", file);
              }
            });
          }
        });
      });
    }
  }
);

router.get("/employeeImg/:employeeName/:filename", (req, res) => {
  const empName = req.params.employeeName;
  const fileName = req.params.filename;
  const pdfPath = path.join(
    __dirname,
    `../EmployeeImages/${empName}/${fileName}`
  );

  // Check if the file exists
  fs.access(pdfPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(err);
      return res.status(404).json({ error: "File not found" });
    }

    // If the file exists, send it
    res.sendFile(pdfPath);
  });
});


// Edit Employee Details by HR-Portal
router.post(
  "/post-employee-detail-byhr/:userId",
  async (req, res) => {
    const { userId } = req.params;
    const { personal_email, personal_number, personal_contact_person, currentAddress } = req.body;

    try {
      const updatedEmployee = await adminModel.findByIdAndUpdate(
        userId,
        {
          personal_email,
          personal_number,
          personal_contact_person,
          currentAddress,
        },
        { new: true } // This option returns the updated document
      );

      if (!updatedEmployee) {
        return res.status(404).send("Employee not found");
      }

      res.json(updatedEmployee);
    } catch (error) {
      console.error("Error updating employee details:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Adds record for today's projection :
router.post('/addTodaysProjection', async (req, res) => {
  try {
    const { empId, noOfCompany, noOfServiceOffered, totalOfferedPrice, totalCollectionExpected, date, time } = req.body;

    const employeeInfo = await adminModel.findOne({ _id: empId });

    if (!employeeInfo) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const todaysProjection = await TodaysProjectionModel.create({
      empId: empId,
      empName: employeeInfo.ename,
      noOfCompany: parseInt(noOfCompany),
      noOfServiceOffered: parseInt(noOfServiceOffered),
      totalOfferedPrice: parseInt(totalOfferedPrice),
      totalCollectionExpected: parseInt(totalCollectionExpected),
      date: date || new Date(),
      time: time || new Date()
    });
    res.status(200).json({ result: true, message: "Today's projection successfully added", data: todaysProjection });
  } catch (error) {
    res.status(500).json({ result: false, message: "Error adding today's projection :", error });
  }
});

// Displaying all the records for current date :
router.get('/showTodaysProjection', async (req, res) => {
  try {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // Months are zero-based
    const year = today.getFullYear();

    // Format the date as "d/m/yyyy"
    const formattedToday = `${day}/${month}/${year}`;

    const todaysProjection = await TodaysProjectionModel.find({
      date: formattedToday
    });

    res.status(200).json({ result: true, message: "Today's projection successfully fetched", data: todaysProjection });
  } catch (error) {
    res.status(500).json({ result: false, message: "Error displaying today's projection :", error });
  }
});

// Displaying records based on employee id :
router.get('/showEmployeeTodaysProjection/:empId', async (req, res) => {
  const { empId } = req.params;
  try {
    const todaysProjection = await TodaysProjectionModel.find({
      empId: empId
    });

    res.status(200).json({ result: true, message: "Today's projection successfully fetched", data: todaysProjection });
  } catch (error) {
    res.status(500).json({ result: false, message: "Error displaying today's projection :", error });
  }
});

// Update today's projection based on _id :
router.put('/updateTodaysProjection/:id', async (req, res) => {
  const { id } = req.params;
  const { empId, noOfCompany, noOfServiceOffered, totalOfferedPrice, totalCollectionExpected, date, time } = req.body;

  try {
    const employeeInfo = await adminModel.findOne({ _id: empId });

    if (!employeeInfo) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const updatedProjection = await TodaysProjectionModel.findByIdAndUpdate(id,
      {
        empId: empId,
        empName: employeeInfo.ename,
        noOfCompany: parseInt(noOfCompany),
        noOfServiceOffered: parseInt(noOfServiceOffered),
        totalOfferedPrice: parseInt(totalOfferedPrice),
        totalCollectionExpected: parseInt(totalCollectionExpected),
        date: date || new Date(),
        time: time || new Date()
      },
      { new: true } // When we use { new: true }, the response will contain the updated document:
    );

    if (updatedProjection) {
      res.status(200).json({ result: true, message: "Projection successfully updated", data: updatedProjection });
    } else {
      res.status(404).json({ result: false, message: "Projection not found" });
    }
  } catch (error) {
    res.status(500).json({ result: false, message: "Error updating today's projection", error });
  }
});

// Deleting today's projection based on _id :
router.delete('/deleteTodaysProjection/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProjection = await TodaysProjectionModel.findByIdAndDelete(id);

    if (deletedProjection) {
      res.status(200).json({ result: true, message: "Data successfully deleted", data: deletedProjection });
    } else {
      res.status(404).json({ result: false, message: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ result: false, message: "Error deleting data :", error });
  }
});

module.exports = router;