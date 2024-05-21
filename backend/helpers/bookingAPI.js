var express = require('express');
var router = express.Router();
const dotenv = require('dotenv');
const multer = require("multer");
dotenv.config(); // Load environment variables from .env file
const CompanyModel = require("../models/Leads");

const fs = require("fs");
const { sendMail } = require("./sendMail");
const RequestDeleteByBDE = require("../models/Deleterequestbybde");
const RedesignedLeadformModel = require("../models/RedesignedLeadform");
const EditableDraftModel = require("../models/EditableDraftModel");
const RedesignedDraftModel = require("../models/RedesignedDraftModel");
const { sendMail2 } = require("./sendMail2");
const TeamLeadsModel = require("../models/TeamLeads.js");
const InformBDEModel = require("../models/InformBDE.js");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the destination path based on the fieldname and company name
    const companyName = req.params.CompanyName;
    let destinationPath = "";

    if (file.fieldname === "otherDocs") {
      destinationPath = `BookingsDocument/${companyName}/ExtraDocs`;
    } else if (file.fieldname === "paymentReceipt") {
      destinationPath = `BookingsDocument/${companyName}/PaymentReceipts`;
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

// ******************************************************   Format Dates  ************************************************************************
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

// ***************************************************************** Get Requests *****************************************************************
// Get Request for bookings Draft 

router.get("/redesigned-leadData/:CompanyName", async (req, res) => {
  try {
    const companyName = req.params.CompanyName;

    // Check if the company exists in RedesignedDraftModel
    const existingData = await RedesignedDraftModel.findOne({
      "Company Name": companyName,
    });

    if (existingData) {
      // If company exists in RedesignedDraftModel, return the data
      return res.json(existingData);
    }

    // If company not found in RedesignedDraftModel, search in RedesignedLeadformModel
    const newData = await RedesignedLeadformModel.findOne({
      "Company Name": companyName,
    });

    if (!newData) {
      // If company not found in RedesignedLeadformModel, return 404
      return res.status(404).json({ error: "Company not found" });
    }
    const TempDataObject = {
      "Company Name": companyName,
      Step1Status: true,
      Step2Status: true,
      Step3Status: true,
      Step4Status: true,
      Step5Status: true,
      services: newData.services,
      "Company Email": newData["Company Email"],
      "Company Number": newData["Company Number"],
      incoDate: newData.incoDate,
      panNumber: newData.panNumber,
      gstNumber: newData.gstNumber,
      bdeName: newData.bdeName,
      bdeEmail: newData.bdeEmail,
    };
    // Create a new object with the same company name in RedesignedDraftModel
    const createData = await RedesignedDraftModel.create({
      "Company Name": companyName,
      Step1Status: true,
      Step2Status: true,
      Step3Status: true,
      Step4Status: true,
      Step5Status: true,
      services: newData.services,
      "Company Email": newData["Company Email"],
      "Company Number": newData["Company Number"],
      incoDate: newData.incoDate,
      panNumber: newData.panNumber,
      gstNumber: newData.gstNumber,
      bdeName: newData.bdeName,
      bdeEmail: newData.bdeEmail,
    });
    res.json(TempDataObject);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
});
// Get Request for fetching bookings Data
router.get("/redesigned-final-leadData", async (req, res) => {
  try {
    const allData = await RedesignedLeadformModel.find();
    res.status(200).json(allData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});
// Get Request for fetching bookings Data for Particular Company
router.get("/redesigned-final-leadData/:companyName", async (req, res) => {
  try {
    const companyName = req.params.companyName;
    const allData = await RedesignedLeadformModel.findOne({
      "Company Name": companyName,
    });

    res.status(200).json(allData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

// *****************************************************************POST METHODS *****************************************************************
// Old Method ,Not Important 
router.post("/redesigned-leadform", async (req, res) => {
  try {
    const newData = req.body; // Assuming the request body contains the data to be saved

    // Find the related company based on companyName
    const companyData = await CompanyModel.findOne({
      "Company Name": newData["Company Name"],
      Status: "Matured",
    });

    if (!companyData) {
      return res
        .status(404)
        .json({ message: 'Company not found or status is not "Matured"' });
    }

    // Add company data to the lead form data
    newData.company = companyData._id;

    // Create a new instance of RedesignedLeadformModel with the combined data
    const leadForm = new RedesignedLeadformModel(newData);

    // Save the lead form data to the database
    const savedLeadForm = await leadForm.save();

    res.status(201).json(savedLeadForm); // Respond with the saved data
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// Import Bookings Data
router.post("/redesigned-importData", async (req, res) => {
  try {
    const data = req.body;
    let leadData = [];

    // Loop through each data object in the array
    for (const item of data) {
      const companyName = item["Company Name"];
      let companyID = "";
      // Find the object with the given company name in RedesignedLeadformModel
      let existingData = await RedesignedLeadformModel.findOne({
        "Company Name": companyName,
      });
      const companyExists = await CompanyModel.findOne({
        "Company Name": companyName,
      });
      if (companyExists) {
        companyExists.Status = "Matured";
        const updatedData = await companyExists.save();
        companyID = updatedData._id;
      } else {
        const basicData = new CompanyModel({
          "Company Name": item["Company Name"],
          "Company Email": item["Company Email"],
          "Company Number": item["Company Number"],
          ename: item.bdeName,
          "Company Incorporation Date  ": item.incoDate,
          AssignDate: new Date(),
          Status: "Matured",
          Remarks: item.extraRemarks,
        });
        const storedData = await basicData.save();
        companyID = storedData._id;
      }

      // Create an array to store services data
      const services = [];

      // Loop through each service index (1 to 5)
      for (let i = 1; i <= 5; i++) {
        // Check if the serviceName exists for the current index
        if (item[`${i}serviceName`]) {
          const service = {
            serviceName: item[`${i}serviceName`],
            totalPaymentWOGST: item[`${i}TotalAmount`],
            totalPaymentWGST:
              item[`${i}GST`] === "YES"
                ? item[`${i}TotalAmount`] + item[`${i}TotalAmount`] * 0.18
                : item[`${i}TotalAmount`],
            withGST: item[`${i}GST`] === "YES",
            withDSC:
              item[`${i}serviceName`] === "Start-Up India Certificate With DSC",
            paymentTerms:
              item[`${i}PaymentTerms`] === "PART-PAYMENT"
                ? "two-part"
                : "Full Advanced",
            firstPayment: item[`${i}FirstPayment`],
            secondPayment: item[`${i}SecondPayment`],
            thirdPayment: item[`${i}ThirdPayment`],
            fourthPayment: item[`${i}FourthPayment`],
            paymentRemarks: item[`${i}PaymentRemarks`],
          };
          services.push(service);
        }
      }

      // Save other data with same property names
      // const otherData = {
      //   "Company Name": item["Company Name"],
      //   "Company Email": item["Company Email"],
      //   "Company Number": item["Company Number"],
      //   incoDate: item.incoDate,
      //   panNumber: item.panNumber,
      //   gstNumber: item.gstNumber,
      //   bdeName: item.bdeName,
      //   bdeEmail: item.bdeEmail,
      //   bdmType: item.bdmType,
      //   bdmEmail: item.bdmEmail,
      //   bookingDate: item.bookingDate,
      //   bookingSource: item.bookingSource,
      //   otherBookingSource: item.otherBookingSource,
      //   services: services,
      //   numberOfServices: services.length,
      //   caCase: item.caCase,
      //   caCommission: item.caCommission,
      //   caNumber: item.caNumber,
      //   caEmail: item.caEmail,
      //   totalAmount: item.totalPayment,
      //   pendingAmount: item.pendingPayment,
      //   receivedAmount: item.receivedPayment,
      //   paymentMethod: item.receivedAmount,
      //   extraRemarks: item.extraRemarks,
      // };

      if (!existingData) {
        // Create a new object if it doesn't exist
        console.log(item);
        const lmao = new RedesignedLeadformModel({
          company: companyID,
          "Company Name": item["Company Name"],
          "Company Email": item["Company Email"],
          "Company Number": item["Company Number"],
          incoDate: item.incoDate,
          panNumber: item.panNumber,
          gstNumber: item.gstNumber,
          bdeName: item.bdeName,
          bdeEmail: item.bdeEmail,
          bdmType: item.bdmType,
          bdmName: item.bdmName,
          bdmEmail: item.bdmEmail,
          bookingDate: item.bookingDate,
          bookingSource: item.leadSource,
          otherBookingSource: item.otherBookingSource,
          services: services,
          numberOfServices: services.length,
          caCase: item.caCase,
          caCommission: item.caCommission,
          caNumber: item.caNumber,
          caEmail: item.caEmail,
          totalAmount: item.totalPayment,
          pendingAmount: item.pendingPayment,
          receivedAmount: item.receivedPayment,
          paymentMethod: item.receivedAmount,
          extraRemarks: item.extraRemarks,
        });
        await lmao.save();
      } else {
        existingData.moreBookings.push({
          "Company Name": item["Company Name"],
          "Company Email": item["Company Email"],
          "Company Number": item["Company Number"],
          incoDate: item.incoDate,
          panNumber: item.panNumber,
          gstNumber: item.gstNumber,
          bdeName: item.bdeName,
          bdeEmail: item.bdeEmail,
          bdmType: item.bdmType,
          bdmEmail: item.bdmEmail,
          bookingDate: item.bookingDate,
          bookingSource: item.bookingSource,
          otherBookingSource: item.otherBookingSource,
          services: services,
          numberOfServices: services.length,
          caCase: item.caCase,
          caCommission: item.caCommission,
          caNumber: item.caNumber,
          caEmail: item.caEmail,
          totalAmount: item.totalPayment,
          pendingAmount: item.pendingPayment,
          receivedAmount: item.receivedPayment,
          paymentMethod: item.receivedAmount,
          extraRemarks: item.extraRemarks,
        });
        await existingData.save();
      }
      // Update existing data or add to moreBookings

      // Save the updated data
    }
    res.status(200).send("Data imported and updated successfully!");
  } catch (error) {
    console.error("Error importing data:", error);
    res.status(500).send("Internal Server Error");
  }
});
// Main Method for submitting Draft
router.post(
  "/redesigned-leadData/:CompanyName/:step",
  upload.fields([
    { name: "otherDocs", maxCount: 50 },
    { name: "paymentReceipt", maxCount: 2 },
  ]),
  async (req, res) => {
    try {
      const companyName = req.params.CompanyName;
      const newData = req.body;
      const Step = req.params.step;
      if (Step === "step1") {
        const existingData = await RedesignedDraftModel.findOne({
          "Company Name": companyName,
        });

        if (existingData) {
          // Update existing data if found
          const updatedData = await RedesignedDraftModel.findOneAndUpdate(
            { "Company Name": companyName },
            {
              $set: {
                "Company Email":
                  newData["Company Email"] || existingData["Company Email"],
                "Company Number":
                  newData["Company Number"] || existingData["Company Number"],
                incoDate: newData.incoDate || existingData.incoDate,
                panNumber: newData.panNumber || existingData.panNumber,
                gstNumber: newData.gstNumber || existingData.gstNumber,
                bdeName: newData.bdeName || existingData.bdeName,
                bdeEmail: newData.bdeEmail || existingData.bdeEmail,
              },
            },
            { new: true }
          );
          res.status(200).json(updatedData);
          return true; // Respond with updated data
        } else {
          // Create new data if not found
          const createdData = await RedesignedDraftModel.create({
            "Company Email": newData["Company Email"],
            "Company Name": newData["Company Name"],
            "Company Number": newData["Company Number"],
            incoDate: newData.incoDate,
            panNumber: newData.panNumber,
            gstNumber: newData.gstNumber,
            bdeName: newData.bdeName,
            bdeEmail: newData.bdeEmail,
            Step1Status: true,
          });
          res.status(201).json(createdData); // Respond with created data
          return true;
        }
      } else if (Step === "step2") {
        const existingData = await RedesignedDraftModel.findOne({
          "Company Name": companyName,
        });
        if (existingData) {
          const updatedData = await RedesignedDraftModel.findOneAndUpdate(
            { "Company Name": companyName },
            {
              $set: {
                bdeName: newData.bdeName || existingData.bdeName,
                bdeEmail: newData.bdeEmail || existingData.bdeEmail,
                bdmName: newData.bdmName || existingData.bdmName,
                otherBdmName: newData.otherBdmName || existingData.otherBdmName,
                bdmType: newData.bdmType || existingData.bdmType,
                bdmEmail: newData.bdmEmail || existingData.bdmEmail,
                bookingDate: newData.bookingDate || existingData.bookingDate,
                bookingSource:
                  newData.bookingSource || existingData.bookingSource,
                otherBookingSource:
                  newData.otherBookingSource || existingData.otherBookingSource,
                Step2Status: true,
              },
            },
            { new: true }
          );
          res.status(200).json(updatedData);
          return true; // Respond with updated data
        }
      } else if (Step === "step3") {
        const existingData = await RedesignedDraftModel.findOne({
          "Company Name": companyName,
        });
        if (existingData) {
          // Update existing data if found
          const updatedData = await RedesignedDraftModel.findOneAndUpdate(
            { "Company Name": companyName },
            {
              $set: {
                services: newData.services || existingData.services,
                numberOfServices:
                  newData.numberOfServices || existingData.numberOfServices,
                caCase: newData.caCase,
                caCommission: newData.caCommission,
                caNumber: newData.caNumber,
                caEmail: newData.caEmail,
                totalAmount: newData.totalAmount || existingData.totalAmount,
                pendingAmount:
                  newData.pendingAmount || existingData.pendingAmount,
                receivedAmount:
                  newData.receivedAmount || existingData.receivedAmount,
                generatedTotalAmount:
                  newData.generatedTotalAmount ||
                  existingData.generatedTotalAmount,
                generatedReceivedAmount:
                  newData.generatedReceivedAmount ||
                  existingData.generatedReceivedAmount || 0,
                Step3Status: true,
              },
            },
            { new: true }
          );
          res.status(200).json(updatedData);
          return true; // Respond with updated data
        }
      } else if (Step === "step4") {
        const existingData = await RedesignedDraftModel.findOne({
          "Company Name": companyName,
        });

        newData.otherDocs =
          req.files["otherDocs"] === undefined ||
            req.files["otherDocs"].length === 0
            ? []
            : req.files["otherDocs"].map((file) => file);
        newData.paymentReceipt =
          req.files["paymentReceipt"] === undefined ||
            req.files["paymentReceipt"].length === 0
            ? []
            : req.files["paymentReceipt"].map((file) => file);

        if (existingData) {
          // Update existing data if found
          const updatedData = await RedesignedDraftModel.findOneAndUpdate(
            { "Company Name": companyName },
            {
              $set: {
                totalAmount: newData.totalAmount || existingData.totalAmount,
                pendingAmount:
                  newData.pendingAmount || existingData.pendingAmount,
                receivedAmount:
                  newData.receivedAmount || existingData.receivedAmount,
                paymentReceipt:
                  newData.paymentReceipt || existingData.paymentReceipt,
                otherDocs: newData.otherDocs || existingData.otherDocs,
                paymentMethod: newData.paymentMethod || newData.paymentMethod,
                extraNotes: newData.extraNotes || existingData.extraNotes,
                Step4Status: true,
              },
            },
            { new: true }
          );
          res.status(200).json(updatedData);
          return true; // Respond with updated data
        }
      } else if (Step === "step5") {
        const updatedData = await RedesignedDraftModel.findOneAndUpdate(
          { "Company Name": companyName },
          {
            $set: {
              Step5Status: true,
            },
          },
          { new: true }
        );
        res.status(200).json(updatedData);
        return true; // R
      }
      // Add uploaded files information to newData

      newData.otherDocs =
        req.files["otherDocs"] === undefined
          ? ""
          : req.files["otherDocs"].map((file) => file);
      newData.paymentReceipt =
        req.files["paymentReceipt"] === undefined
          ? ""
          : req.files["paymentReceipt"].map((file) => file);

      // Search for existing data by Company Name
      const existingData = await RedesignedDraftModel.findOne({
        "Company Name": companyName,
      });

      if (existingData) {
        // Update existing data if found
        const updatedData = await RedesignedDraftModel.findOneAndUpdate(
          { "Company Name": companyName },
          { $set: newData },
          { new: true }
        );
        res.status(200).json(updatedData); // Respond with updated data
      } else {
        // Create new data if not found
        const createdData = await RedesignedDraftModel.create({
          ...newData,
          companyName,
        });
        res.status(201).json(createdData); // Respond with created data
      }
    } catch (error) {
      console.error("Error creating/updating data:", error);
      res.status(500).send("Error creating/updating data"); // Send an error response
    }
  }
);
// Main Method for Multi bookings 
router.post(
  "/redesigned-addmore-booking/:CompanyName/:step",
  upload.fields([
    { name: "otherDocs", maxCount: 50 },
    { name: "paymentReceipt", maxCount: 2 },
  ]),
  async (req, res) => {
    try {
      const companyName = req.params.CompanyName;
      const newData = req.body;
      const Step = req.params.step;
      if (Step === "step2") {
        const existingData = await RedesignedDraftModel.findOne({
          "Company Name": companyName,
        });
        console.log("Second Step Working");
        if (existingData) {
          const updatedData = await RedesignedDraftModel.findOneAndUpdate(
            { "Company Name": companyName },
            {
              $set: {
                "moreBookings.bdeName": newData.bdeName || "",
                "moreBookings.bdeEmail": newData.bdeEmail || "",
                "moreBookings.bdmName": newData.bdmName || "",
                "moreBookings.otherBdmName": newData.otherBdmName || "",
                "moreBookings.bdmEmail": newData.bdmEmail || "",
                "moreBookings.bdmType": newData.bdmType || "",
                "moreBookings.bookingDate": newData.bookingDate || "",
                "moreBookings.bookingSource": newData.bookingSource || "",
                "moreBookings.otherBookingSource":
                  newData.otherBookingSource || "",
                "moreBookings.Step2Status": true,
              },
            },
            { new: true }
          );
          res.status(200).json(updatedData);
          return true; // Respond with updated data
        } else {
          res.status(404).json("Company Not found");
          return true;
        }
      } else if (Step === "step3") {
        const existingData = await RedesignedDraftModel.findOne({
          "Company Name": companyName,
        });
        console.log("Third step Working");
        if (existingData) {
          const updatedData = await RedesignedDraftModel.findOneAndUpdate(
            { "Company Name": companyName },
            {
              $set: {
                "moreBookings.services":
                  newData.services || existingData.moreBookings.services,
                "moreBookings.numberOfServices":
                  newData.numberOfServices ||
                  existingData.moreBookings.numberOfServices,
                "moreBookings.caCase": newData.caCase,
                "moreBookings.caCommission": newData.caCommission,
                "moreBookings.caNumber": newData.caNumber,
                "moreBookings.caEmail": newData.caEmail,
                "moreBookings.totalAmount":
                  newData.totalAmount || existingData.moreBookings.totalAmount,
                "moreBookings.pendingAmount":
                  newData.pendingAmount ||
                  existingData.moreBookings.pendingAmount,
                "moreBookings.receivedAmount":
                  newData.receivedAmount ||
                  existingData.moreBookings.receivedAmount,

                "moreBookings.generatedReceivedAmount":
                  newData.generatedReceivedAmount ||
                  existingData.moreBookings.generatedReceivedAmount,
                "moreBookings.generatedTotalAmount":
                  newData.generatedTotalAmount ||
                  existingData.moreBookings.generatedTotalAmount,
                "moreBookings.Step3Status": true,
              },
            },
            { new: true }
          );
          res.status(200).json(updatedData);
          return true; // Respond with updated data
        } else {
          res.status(404).json("Company Not found");
          return true;
        }
      } else if (Step === "step4") {
        const existingData = await RedesignedDraftModel.findOne({
          "Company Name": companyName,
        });
        newData.otherDocs =
          req.files["otherDocs"] === undefined
            ? []
            : req.files["otherDocs"].map((file) => file);
        newData.paymentReceipt =
          req.files["paymentReceipt"] === undefined
            ? []
            : req.files["paymentReceipt"].map((file) => file);
        if (existingData) {
          const updatedData = await RedesignedDraftModel.findOneAndUpdate(
            { "Company Name": companyName },
            {
              $set: {
                "moreBookings.totalAmount":
                  newData.totalAmount || existingData.moreBookings.totalAmount,
                "moreBookings.pendingAmount":
                  newData.pendingAmount ||
                  existingData.moreBookings.pendingAmount,
                "moreBookings.receivedAmount":
                  newData.receivedAmount ||
                  existingData.moreBookings.receivedAmount,
                "moreBookings.Step4Status": true,
                "moreBookings.paymentReceipt":
                  newData.paymentReceipt ||
                  existingData.moreBookings.paymentReceipt,
                "moreBookings.otherDocs":
                  newData.otherDocs || existingData.moreBookings.otherDocs,
                "moreBookings.paymentMethod":
                  newData.paymentMethod ||
                  existingData.moreBookings.paymentMethod,
                "moreBookings.extraNotes":
                  newData.extraNotes || existingData.moreBookings.extraNotes,
              },
            },
            { new: true }
          );
          res.status(200).json(updatedData);
          return true; // Respond with updated data
        } else {
          res.status(404).json("Company Not found");
          return true;
        }
      } else if (Step === "step5") {
        const existingData = await RedesignedLeadformModel.findOne({
          "Company Name": companyName,
        });
        const companyData = await CompanyModel.findOne({
          "Company Name": newData["Company Name"],
        });
        if (companyData) {
          const multiBdmName = [];
          if (companyData.maturedBdmName !== newData.bdmName) {
            multiBdmName.push(newData.bdmName);
            await CompanyModel.findByIdAndUpdate(companyData._id, {
              multiBdmName: multiBdmName,
            });
          }
        }
        if (existingData) {
          const updatedData = await RedesignedLeadformModel.findOneAndUpdate(
            { "Company Name": companyName },
            {
              $set: {
                moreBookings: [...existingData.moreBookings, newData],
              },
            },
            { new: true }
          );
          const removeDraft = await RedesignedDraftModel.findOneAndUpdate(
            {
              "Company Name": companyName,
            },
            {
              $set: {
                moreBookings: [],
              },
            },
            { new: true }
          );
          const totalAmount = newData.services.reduce(
            (acc, curr) => acc + parseInt(curr.totalPaymentWGST),
            0
          );
          const receivedAmount = newData.services.reduce((acc, curr) => {
            return curr.paymentTerms === "Full Advanced"
              ? acc + parseInt(curr.totalPaymentWGST)
              : acc + parseInt(curr.firstPayment);
          }, 0);
          const pendingAmount = totalAmount - receivedAmount;
          // Render services HTML
          const renderServices = () => {
            let servicesHtml = "";
            for (let i = 0; i < newData.services.length; i++) {
              const displayPaymentTerms =
                newData.services[i].paymentTerms === "Full Advanced"
                  ? "none"
                  : "flex";
              servicesHtml += `
          <div>
          <div style="display: flex; flex-wrap: wrap; margin-top: 20px;">
          <div style="width: 25%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
              Services Name
            </div>
          </div>
          <div style="width: 75%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
              ${newData.services[i].serviceName === "Start Up Certificate"
                  ? newData.services[i].withDSC
                    ? "Start Up Certificate With DSC"
                    : "Start Up Certificate Without DCS"
                  : newData.services[i].serviceName
                }
            </div>
          </div>
        </div>
        <div style="display: flex; flex-wrap: wrap">
          <div style="width: 25%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
            Total Amount
            </div>
          </div>
          <div style="width: 75%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
                ₹ ${parseInt(
                  newData.services[i].totalPaymentWGST
                ).toLocaleString()}
            </div>
          </div>
        </div>
  
        <div style="display: flex; flex-wrap: wrap">
          <div style="width: 25%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
             With GST
            </div>
          </div>
          <div style="width: 75%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
              ${newData.services[i].withGST ? "Yes" : "No"}
            </div>
          </div>
        </div>
        <div style="display: flex; flex-wrap: wrap">
          <div style="width: 25%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
             Payment Terms
            </div>
          </div>
          <div style="width: 75%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
                ${newData.services[i].paymentTerms === "Full Advanced"
                  ? "Full Advanced"
                  : "Part-Payment"
                }
            </div>
          </div>
        </div>
        <div style="display: ${displayPaymentTerms}; flex-wrap: wrap">
          <div style="width: 25%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
             First Payment
            </div>
          </div>
          <div style="width: 75%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
                ₹ ${parseInt(newData.services[i].firstPayment).toLocaleString()}
            </div>
          </div>
        </div>
        <div style="display: ${displayPaymentTerms}; flex-wrap: wrap">
          <div style="width: 25%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
             Second Payment
            </div>
          </div>
          <div style="width: 75%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
                ₹ ${parseInt(
                  newData.services[i].secondPayment
                ).toLocaleString()} - ${isNaN(new Date(newData.services[i].secondPaymentRemarks))
                  ? newData.services[i].secondPaymentRemarks
                  : `Payment On ${newData.services[i].secondPaymentRemarks}`
                }
            </div>
          </div>
        </div>
        <div style="display: ${newData.services[i].thirdPayment === 0 ? "none" : "flex"
                }; flex-wrap: wrap">
          <div style="width: 25%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
             Third Payment
            </div>
          </div>
          <div style="width: 75%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
                ₹ ${Number(newData.services[i].thirdPayment).toFixed(2)} - ${isNaN(new Date(newData.services[i].thirdPaymentRemarks))
                  ? newData.services[i].thirdPaymentRemarks
                  : `Payment On ${newData.services[i].thirdPaymentRemarks}`
                }
            </div>
          </div>
        </div>
        <div style="display: ${newData.services[i].fourthPayment === 0 ? "none" : "flex"
                }; flex-wrap: wrap">
          <div style="width: 25%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
             Fourth Payment
            </div>
          </div>
          <div style="width: 75%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
                ₹ ${parseInt(
                  newData.services[i].fourthPayment
                ).toLocaleString()} - ${isNaN(new Date(newData.services[i].fourthPaymentRemarks))
                  ? newData.services[i].fourthPaymentRemarks
                  : `Payment On ${newData.services[i].fourthPaymentRemarks}`
                }
            </div>
          </div>
        </div>
        <div style="display: flex; flex-wrap: wrap">
          <div style="width: 25%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
             Payment Remarks
            </div>
          </div>
          <div style="width: 75%">
            <div style="
                  border: 1px solid #ccc;
                  font-size: 12px;
                  padding: 5px 10px;
                ">
              ${newData.services[i].paymentRemarks}
            </div>
          </div>
        </div>
        </div>
          `;
            }
            return servicesHtml;
          };
          const serviceNames = newData.services
            .map((service, index) => `${service.serviceName}`)
            .join(" , ");
          const isAdmin = newData.isAdmin;
          const visibility = newData.bookingSource !== "Other" && "none";
          const servicesHtmlContent = renderServices();
          const recipients = isAdmin ? ["nimesh@incscale.in"] : [
            newData.bdeEmail,
            newData.bdmEmail,
            "bookings@startupsahay.com",
            "documents@startupsahay.com",
          ];

          sendMail(
            recipients,
            `${newData["Company Name"]} | ${serviceNames} | ${newData.bookingDate}`,
            ``,
            ` <div style="width: 98%; padding: 20px 10px; background: #f6f8fb;margin:0 auto">
        <h3 style="text-align: center">Booking Form Deatils</h3>
        <div style="
              width: 95%;
              margin: 0 auto;
              padding: 20px 10px;
              background: #fff;
              border-radius: 10px;
            ">
          <!--Step One Start-->
          <div style="width: 98%; margin: 0 auto">
            <!-- Step's heading -->
            <div style="display: flex; align-items: center">
              <div style="
                    width: 30px;
                    height: 30px;
                    line-height: 30px;
                    border-radius: 100px;
                    background: #fbb900;
                    text-align: center;
                    font-weight: bold;
                    color: #fff;
                  ">
                1
              </div>
              <div style="margin-left: 10px">Company's Basic Informations</div>
            </div>
            <!-- Step's Table -->
            <div style="
                  background: #f7f7f7;
                  padding: 15px;
                  border-radius: 10px;
                  position: relative;
                  margin-top: 15px;
                ">
              <div style="display: flex; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    Company Name
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    ${newData["Company Name"]}
                  </div>
                </div>
              </div>
              <div style="display: flex; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    Email Address:
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData["Company Email"]}
                  </div>
                </div>
              </div>
              <div style="display: flex; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    Phone No:
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData["Company Number"]}
                  </div>
                </div>
              </div>
    
              <div style="display: flex; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    Incorporation date:
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${formatDate(newData["incoDate"])}
                  </div>
                </div>
              </div>
              <div style="display: flex; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    Company's PAN/GST Number:
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData.panNumber}
                  </div>
                </div>
              </div>
             
            </div>
          </div>
          <!--Step One End-->
    
    
          <!--Step Two Start-->
          <div style="width: 98%; margin: 10px auto">
            <!-- Step's heading -->
            <div style="display: flex; align-items: center">
              <div style="
                    width: 30px;
                    height: 30px;
                    line-height: 30px;
                    border-radius: 100px;
                    background: #fbb900;
                    text-align: center;
                    font-weight: bold;
                    color: #fff;
                  ">
                2
              </div>
              <div style="margin-left: 10px">Booking Details</div>
            </div>
            <!-- Step's Table -->
            <div style="
                  background: #f7f7f7;
                  padding: 15px;
                  border-radius: 10px;
                  position: relative;
                  margin-top: 15px;
                ">
                <div style="display: flex; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                   Booking Date
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData.bookingDate}
                  </div>
                </div>
              </div>
              <div style="display: flex; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    BDE Name:
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData.bdeName}
                  </div>
                </div>
              </div>
              <div style="display: flex; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    BDE Email
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData.bdeEmail}
                  </div>
                </div>
              </div>
              <div style="display: flex; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    BDM Name
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData.bdmName} 
                  </div>
                </div>
              </div>
    
              <div style="display: flex; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    BDM Email
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData.bdmEmail}
                  </div>
                </div>
              </div>
              <div style="display: flex; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    BDM Type
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                       ${newData.bdmType === "Close-by"
              ? "Closed-by"
              : "Supported-by"
            } 
                  </div>
                </div>
              </div>

              
              <div style="display: flex; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    Lead Source
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData.bookingSource}
                  </div>
                </div>
              </div>
              <div style="display: flex; flex-wrap: wrap; display: ${visibility}">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    Other Lead Source
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData.otherBookingSource}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Step 2 Ends -->
    
    
          <!--Step 3 Start-->
          <div style="width: 98%; margin: 10px auto">
          <!-- Step's heading -->
          <div style="display: flex; align-items: center">
            <div style="
                  width: 30px;
                  height: 30px;
                  line-height: 30px;
                  border-radius: 100px;
                  background: #fbb900;
                  text-align: center;
                  font-weight: bold;
                  color: #fff;
                ">
              3
            </div>
            <div style="margin-left: 10px">Services And Payment Details</div>
          </div>
          <!-- Step's Table -->
          <div style="
                background: #f7f7f7;
                padding: 15px;
                border-radius: 10px;
                position: relative;
                margin-top: 15px;
              ">
            <div style="display: flex; flex-wrap: wrap">
              <div style="width: 25%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                  Total Selected Services
                </div>
              </div>
              <div style="width: 75%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                    ${newData.services.length}
                </div>
              </div>
            </div>
           ${servicesHtmlContent}
            <div style="display: flex; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    CA Case
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData.caCase}
                  </div>
                </div>
            </div>
             <div style="display: ${newData.caCase === "Yes" ? "flex" : "none"
            }; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    CA Number
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData.caNumber}
                  </div>
                </div>
            </div>
            <div style="display: ${newData.caCase === "Yes" ? "flex" : "none"
            }; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    CA Email
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData.caEmail}
                  </div>
                </div>
            </div>
            <div style="display: ${newData.caCase === "Yes" ? "flex" : "none"
            }; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    CA Commission
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData.caCommission}
                  </div>
                </div>
            </div>

          </div>
        </div>
          <!-- Step 3 Ends -->
    
          <!--Step 4 Start-->
          <div style="width: 98%; margin: 10px auto">
            <!-- Step's heading -->
            <div style="display: flex; align-items: center">
              <div style="
                    width: 30px;
                    height: 30px;
                    line-height: 30px;
                    border-radius: 100px;
                    background: #fbb900;
                    text-align: center;
                    font-weight: bold;
                    color: #fff;
                  ">
                4
              </div>
              <div style="margin-left: 10px">Payment Summery</div>
            </div>
            <!-- Step's Table -->
            <div style="
                  background: #f7f7f7;
                  padding: 15px;
                  border-radius: 10px;
                  position: relative;
                  margin-top: 15px;
                ">
              <div style="display: flex; flex-wrap: wrap">
                <div style="width: 33.33%; display: flex;">
                  <div style="width: 50%">
                    <div style="
                          border: 1px solid #ccc;
                          font-size: 12px;
                          padding: 5px 10px;
                        ">
                      Total Payment
                    </div>
                  </div>
                  <div style="width: 50%">
                    <div style="
                          border: 1px solid #ccc;
                          font-size: 12px;
                          padding: 5px 10px;
                        ">
                      ₹ ${parseInt(totalAmount).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div style="width: 33.33%; display: flex;">
                  <div style="width: 50%">
                    <div style="
                          border: 1px solid #ccc;
                          font-size: 12px;
                          padding: 5px 10px;
                        ">
                     Received Payment
                    </div>
                  </div>
                  <div style="width: 50%">
                    <div style="
                          border: 1px solid #ccc;
                          font-size: 12px;
                          padding: 5px 10px;
                        ">
                      ₹ ${parseInt(receivedAmount).toLocaleString()}
                    </div>
                  </div>
    
                </div>
                <div style="width: 33.33%; display: flex;">
                  <div style="width: 50%">
                    <div style="
                          border: 1px solid #ccc;
                          font-size: 12px;
                          padding: 5px 10px;
                        ">
                      Pending Payment
                    </div>
                  </div>
                  <div style="width: 50%">
                    <div style="
                          border: 1px solid #ccc;
                          font-size: 12px;
                          padding: 5px 10px;
                        ">
                     ₹ ${parseInt(pendingAmount).toLocaleString()}
                    </div>
                  </div>
    
                </div>
                
              </div>
              <div style="display: flex; flex-wrap: wrap; margin-top: 20px;">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                   Payment Method
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    ${newData.paymentMethod}
                  </div>
                </div>
              </div>
              <div style="display: flex; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                  Extra Remarks
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    ${newData.extraNotes !== "" ? newData.extraNotes : "N/A"}
                  </div>
                </div>
              </div>        
            </div>
          </div>
          <!-- Step 4 Ends -->
        </div>
      </div>
        
  
        `,
            newData.otherDocs,
            newData.paymentReceipt
          );
          const renderServiceList = () => {
            let servicesHtml = "";
            for (let i = 0; i < newData.services.length; i++) {
              servicesHtml += `
              <span>Service ${i + 1}: ${newData.services[i].serviceName}</span>,  
              `;
            }
            return servicesHtml;
          };
          const renderPaymentDetails = () => {
            let servicesHtml = "";
            let paymentServices = "";
            const serviceLength = newData.services.length > 2 ? 2 : newData.services.length
            for (let i = 0; i < serviceLength; i++) {
              const Amount =
                newData.services[i].paymentTerms === "Full Advanced"
                  ? newData.services[i].totalPaymentWGST
                  : newData.services[i].firstPayment;
              let rowSpan;
      
              if (newData.services[i].paymentTerms === "two-part") {
                if (
                  newData.services[i].thirdPayment !== 0 &&
                  newData.services[i].fourthPayment === 0
                ) {
                  rowSpan = 2;
                } else if (newData.services[i].fourthPayment !== 0) {
                  rowSpan = 3;
                }
              } else {
                rowSpan = 1;
              }
      
              if (rowSpan === 3) {
                paymentServices = `
              <tr>
                <td style="border-right:1px solid #ddd">₹${parseInt(newData.services[i].secondPayment).toLocaleString()}/-</td>
                <td>${newData.services[i].secondPaymentRemarks}</td>
              </tr>
              <tr>
               <td style="border-right:1px solid #ddd">₹${parseInt(newData.services[i].thirdPayment).toLocaleString()}/-</td>
               <td>${newData.services[i].thirdPaymentRemarks}</td>
              </tr>
              <tr>
               <td style="border-right:1px solid #ddd">₹${parseInt(newData.services[i].fourthPayment).toLocaleString()}/-</td>
               <td>${newData.services[i].fourthPaymentRemarks}</td>
              </tr>
              `;
              } else if (rowSpan === 2) {
                paymentServices = `
              <tr>
                <td style="border-right:1px solid #ddd">₹${parseInt(newData.services[i].secondPayment).toLocaleString()}/-</td>
                <td >${newData.services[i].secondPaymentRemarks}</td>
              </tr>
              <tr>
                <td style="border-right:1px solid #ddd">₹${parseInt(newData.services[i].thirdPayment).toLocaleString()}/-</td>
                <td >${newData.services[i].thirdPaymentRemarks}</td>
              </tr>
              `;
              } else {
                paymentServices = `
              <tr>
                <td >₹${parseInt(newData.services[i].secondPayment).toLocaleString()}/-</td>
                <td>${newData.services[i].paymentTerms !== "Full Advanced"
                    ? newData.services[i].secondPaymentRemarks
                    : "100% Advance Payment"
                  }</td>
              </tr>
              `;
              }
              servicesHtml += `
              <table class="table table-bordered">
                  <thead>
                    <td colspan="4">Service Name : ${newData.services[i].serviceName
                }</td>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Total Payment</td>
                      <td>Advanced Payment</td>
                      <td>Pending payment</td>
                      <td>Remarks</td>
                    </tr>
                    <tr>
                          <th rowspan='4'>₹ ${newData.services[i].totalPaymentWGST
                } /-</th>
                          <th rowspan='4'>₹ ${newData.services[i].paymentTerms === "Full Advanced"
                  ? parseInt(newData.services[i].totalPaymentWGST).toLocaleString()
                  : parseInt(newData.services[i].firstPayment).toLocaleString()
                }/-</th>
                    </tr>
                    ${paymentServices}
                  </tbody>
              </table>
              `;
            }
            return servicesHtml;
          };
          const renderMorePaymentDetails = () => {
            let servicesHtml = "";
            let paymentServices = "";
      
            for (let i = 2; i < newData.services.length; i++) {
              const Amount =
                newData.services[i].paymentTerms === "Full Advanced"
                  ? newData.services[i].totalPaymentWGST
                  : newData.services[i].firstPayment;
              let rowSpan;
      
              if (newData.services[i].paymentTerms === "two-part") {
                if (
                  newData.services[i].thirdPayment !== 0 &&
                  newData.services[i].fourthPayment === 0
                ) {
                  rowSpan = 2;
                } else if (newData.services[i].fourthPayment !== 0) {
                  rowSpan = 3;
                }
              } else {
                rowSpan = 1;
              }
      
              if (rowSpan === 3) {
                paymentServices = `
              <tr>
                <td>₹${parseInt(newData.services[i].secondPayment).toLocaleString()}/-</td>
                <td>${newData.services[i].secondPaymentRemarks}</td>
              </tr>
              <tr>
               <td>₹${parseInt(newData.services[i].thirdPayment).toLocaleString()}/-</td>
               <td>${newData.services[i].thirdPaymentRemarks}</td>
              </tr>
              <tr>
               <td>₹${parseInt(newData.services[i].fourthPayment).toLocaleString()}/-</td>
               <td>${newData.services[i].fourthPaymentRemarks}</td>
              </tr>
              `;
              } else if (rowSpan === 2) {
                paymentServices = `
              <tr>
                <td>₹${parseInt(newData.services[i].secondPayment).toLocaleString()}/-</td>
                <td>${newData.services[i].secondPaymentRemarks}</td>
              </tr>
              <tr>
                <td>₹${parseInt(newData.services[i].thirdPayment).toLocaleString()}/-</td>
                <td>${newData.services[i].thirdPaymentRemarks}</td>
              </tr>
              `;
              } else {
                paymentServices = `
              <tr>
                <td>₹${parseInt(newData.services[i].secondPayment).toLocaleString()}/-</td>
                <td>${newData.services[i].paymentTerms !== "Full Advanced"
                    ? newData.services[i].secondPaymentRemarks
                    : "100% Advance Payment"
                  }</td>
              </tr>
              `;
              }
      
              servicesHtml += `
              <table class="table table-bordered">
                  <thead>
                    <td colspan="4">Service Name : ${newData.services[i].serviceName
                }</td>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Total Payment</td>
                      <td>Advanced Payment</td>
                      <td>Pending payment</td>
                      <td>Remarks</td>
                    </tr>
                    <tr>
                          <th rowspan='4'>₹ ${parseInt(newData.services[i].totalPaymentWGST).toLocaleString()
                } /-</th>
                          <th rowspan='4'>₹ ${newData.services[i].paymentTerms === "Full Advanced"
                  ? parseInt(newData.services[i].totalPaymentWGST).toLocaleString()
                  : parseInt(newData.services[i].firstPayment).toLocaleString()
                }/-</th>
                    </tr>
                    ${paymentServices}
                  </tbody>
              </table>
              `;
            }
            return servicesHtml;
          };
          const allowedServiceNames = [
            "Seed Funding Support",
            "Angel Funding Support",
            "VC Funding Support",
            "Crowd Funding Support",
            "I-Create",
            "Nidhi Seed Support Scheme",
            "Nidhi Prayash Yojna",
            "NAIF",
            "Raftaar",
            "CSR Funding",
            "Stand-Up India",
            "PMEGP",
            "USAID",
            "UP Grant",
            "DBS Grant",
            "MSME Innovation",
            "MSME Hackathon",
            "Gujarat Grant",
            "CGTMSC",
            "Mudra Loan",
            "SIDBI Loan",
            "Incubation Support",
          ];
          const AuthorizedName = newData.services.some((service) => {
            const tempServices = [...allowedServiceNames, "Income Tax Exemption"];
            return tempServices.includes(service);
          })
            ? "Shubhi Banthiya"
            : "Dhruvi Gohel";
      
          console.log(newData.services);
          const newPageDisplay = newData.services.some((service) => {
            const tempServices = [
              ...allowedServiceNames,
              "Income Tax Exemption",
              "Start-Up India Certificate",
            ];
            return tempServices.includes(service.serviceName);
          })
            ? 'style="display:block'
            : 'style="display:none';
      
          console.log(newPageDisplay);
      
      
      
          const renderServiceKawali = () => {
            let servicesHtml = "";
            let fundingServices = "";
            let fundingServicesArray = "";
            let incomeTaxServices = "";
      
            for (let i = 0; i < newData.services.length; i++) {
              if (
                newData.services[i].serviceName === "Start-Up India Certificate"
              ) {
                servicesHtml = `
                <p class="Declaration_text_head mt-2">
                <b>
                  Start-Up India Certification Acknowledgement:
                </b>
              </p>
              <p class="Declaration_text_data">
              I, Director of ${newData["Company Name"]}, acknowledge START-UP SAHAY PRIVATE LIMITED's assistance in obtaining the Start-up India certificate, including document preparation and application support. I understand they charge a fee for their services. I acknowledge that the certificate is issued by the government free of charge and that START-UP SAHAY hasn't misled me about this.
              </p>
              
              `;
              } else if (
                allowedServiceNames.includes(newData.services[i].serviceName)
              ) {
                fundingServicesArray += `${newData.services[i].serviceName},`;
                fundingServices = `
                <p class="Declaration_text_head mt-2">
                <b>
                ${newData.services[i].serviceName} Acknowledgement:   
                </b>
              </p>
              <p class="Declaration_text_data">
              I, Director of ${newData["Company Name"]}, engage START-UP SAHAY PRIVATE LIMITED for ${newData.services[i].serviceName}. They'll provide document creation and Application support, utilizing their resources and expertise. I understand there's a fee for their services, not as government fees, Approval of the application is up to the Concerned authorities. START-UP SAHAY PRIVATE LIMITED has not assured me of application approval.
              </p>
              
              `;
              } else if (
                newData.services[i].serviceName === "Income Tax Exemption"
              ) {
            
                incomeTaxServices = `
                <p class="Declaration_text_head mt-2">
                <b>
                Income Tax Exemption Services Acknowledgement:   
                </b>
              </p>
              <p class="Declaration_text_data">
              I, Director of ${newData["Company Name"]}, acknowledge START-UP SAHAY PRIVATE LIMITED's assistance in obtaining the Certificate of Eligibility for the 3-year tax exemption under the 80IAC Income Tax Act. Their services include document preparation and application support, for which they charge a fee. I understand that government fees are not involved. START-UP SAHAY has provided accurate information about the approval process, and the decision rests with the relevant authorities.
              </p>
            `;
              } else {
                servicesHtml += `
            <br>
            `;
              }
            }
      
            if (fundingServicesArray !== "") {
              servicesHtml += `
              <p class="Declaration_text_head mt-2">
              <b>
              ${fundingServicesArray} Acknowledgement:    
              </b>
            </p>
            <p class="Declaration_text_data">
            I, Director of ${newData["Company Name"]}, engage START-UP SAHAY PRIVATE LIMITED for ${fundingServicesArray}. They'll provide document creation and Application support, utilizing their resources and expertise. I understand there's a fee for their services, not as government fees, Approval of the application is up to the concerned department/authorities. START-UP SAHAY PRIVATE LIMITED has not assured me of application approval.
            </p>
          `;
            } 
            if (incomeTaxServices !== "") {
              servicesHtml += `
              <p class="Declaration_text_head mt-2">
              <b>
              Income Tax Exemption Services Acknowledgement:     
              </b>
            </p>
            <p class="Declaration_text_data">
            I, Director of ${newData["Company Name"]}, acknowledge that START-UP SAHAY PRIVATE LIMITED is assisting me in obtaining the Certificate of Eligibility for the 3-year tax exemption under the 80IAC Income Tax Act. These services involve preparing necessary documents and applications, and utilizing their infrastructure, experience, manpower, and expertise. I understand there's a fee for their services, not as government fees. START-UP SAHAY has provided accurate information regarding the approval process. The decision regarding the application approval rests with the concerned authorities.
            </p>
        `;
            }
            return servicesHtml;
          };
          const conditional = newData.services.length < 2 ? `<div class="Declaration_text">
      <p class="Declaration_text_data">
        I confirm that the outlined payment details and terms accurately represent the agreed-upon arrangements between ${newData["Company Name"]} and START-UP SAHAY PRIVATE LIMITED. The charges are solely for specified services, and no additional services will be provided without separate payment, even in the case of rejection.
      </p>
      </div>` : "";
          const serviceKawali = renderServiceKawali();
          const currentDate = new Date();
      
          const dateOptions = { day: "numeric", month: "long", year: "numeric" };
          const todaysDate = currentDate.toLocaleDateString("en-US", dateOptions);
          const mainPageHtml = `
              <div class="PDF_main">
                <section>
                  <div class="date_div">
                    <p>${todaysDate}</p>
                  </div>
                  <div class="pdf_heading">
                    <h3>Self Declaration</h3>
                  </div>
                  <div class="Declaration_text">
                    ${serviceKawali}
                    <p class="Declaration_text_data">
                      I, understands that because of government regulations and portal, I have no objections if the
                      process takes longer than initially committed, knowing it's just how government schemes
                      related process works.
                    </p>
                    <p class="Declaration_text_data">
                    As I am unfamiliar with the process, I give START-UP SAHAY PRIVATE LIMITED permission to submit the online or offline application in the concerned department on my behalf, if required.
                    </p>
                  </div>
               
                  
                </section>
              
              </div>
            `;
          const totalPaymentHtml = newData.services.length < 2 ? ` <div class="table-data">
      <table class="table table-bordered">
        <thead>
          <th colspan="3">Total Payment Details</th>
        </thead>
        <tbody>
          <tr>
            <td>Total Payment</td>
            <td>Advanced Payment</td>
            <td>Pending Payment</td>
          </tr>
          <tr><td>₹ ${parseInt(totalAmount).toLocaleString()}/-</td>
            <td>₹ ${parseInt(receivedAmount).toLocaleString()}/-</td>
            <td>₹ ${parseInt(pendingAmount).toLocaleString()}/-</td>
          </tr>
        </tbody>
      </table>
      </div>` : ""
          const mainPage =
            newPageDisplay === 'style="display:block' ? mainPageHtml : "";
          const bdNames =
            newData.bdeName == newData.bdmName
              ? newData.bdeName
              : `${newData.bdeName} && ${newData.bdmName}`;
          const waitpagination =
            newPageDisplay === 'style="display:block' ? "Page 2/2" : "Page 1/1";
          const pagination = newData.services.length > 1 ? "Page 2/3" : waitpagination
          // Render services HTML content
          const serviceList = renderServiceList();
          const paymentDetails = renderPaymentDetails();
          const morePaymentDetails = renderMorePaymentDetails();
          const thirdPage = newData.services.length > 1 ? ` <div class="PDF_main">
          <section>
            ${morePaymentDetails}
             <div class="table-data">
      <table class="table table-bordered">
        <thead>
          <th colspan="3">Total Payment Details</th>
        </thead>
        <tbody>
          <tr>
            <td>Total Payment</td>
            <td>Advanced Payment</td>
            <td>Pending Payment</td>
          </tr>
          <tr> <td>  ₹ ${parseInt(totalAmount).toLocaleString()}/-</td>
            <td>₹ ${parseInt(receivedAmount).toLocaleString()}/-</td>
            <td>₹ ${parseInt(pendingAmount).toLocaleString()}/-</td>
          </tr>
        </tbody>
      </table>
      </div>
            <div class="Declaration_text">
              <p class="Declaration_text_data">
                I confirm that the outlined payment details and terms accurately represent the agreed-upon arrangements between ${newData["Company Name"]} and START-UP SAHAY PRIVATE LIMITED. The charges are solely for specified services, and no additional services will be provided without separate payment, even in the case of rejection.
              </p>
            </div>
           
      
          </section>
        </div>` : "";
      
          // const htmlTemplate = fs.readFileSync("./template.html", "utf-8");
          const servicesShubhi = [
            "Pitch Deck Development ",
            "Financial Modeling",
            "DPR Development",
            "CMA Report Development",
            "Company Profile Write-Up",
            "Company Brochure",
            "Product Catalog",
            "Logo Design",
            "Business Card Design",
            "Letter Head Design",
            "Broucher Design",
            "Business Profile",
            "Seed Funding Support",
            "Angel Funding Support",
            "VC Funding Support",
            "Crowd Funding Support",
            "I-Create",
            "Nidhi Seed Support Scheme  ",
            "Nidhi Prayash Yojna",
            "NAIF",
            "Raftaar",
            "CSR Funding",
            "Stand-Up India",
            "PMEGP",
            "USAID",
            "UP Grant",
            "DBS Grant",
            "MSME Innovation",
            "MSME Hackathon",
            "Gujarat Grant",
            "CGTMSC",
            "Income Tax Exemption",
            "Mudra Loan",
            "SIDBI Loan",
            "Incubation Support",
            "Digital Marketing",
            "SEO Services",
            "Branding Services",
            "Social Promotion Management",
            "Email Marketing",
            "Digital Content",
            "Lead Generation",
            "Whatsapp Marketing",
            "Website Development",
            "App Design & Development",
            "Web Application Development",
            "Software Development",
            "CRM Development",
            "ERP Development",
            "E-Commerce Website",
            "Product Development"
          ];
          const mailName = newData.services.some((service) => {
            return servicesShubhi.includes(service.serviceName);
          })
            ? "Shubhi Banthiya"
            : "Dhruvi Gohel";
      
          const AuthorizedEmail =
            mailName === "Dhruvi Gohel"
              ? "dhruvi@startupsahay.com"
              : "rm@startupsahay.com";
          const AuthorizedNumber =
            mailName === "Dhruvi Gohel" ? "+919016928702" : "+919998992601";
      
          const htmlNewTemplate = fs.readFileSync("./templatev2.html", "utf-8");
          const filledHtml = htmlNewTemplate
            .replace("{{Company Name}}", newData["Company Name"])
            .replace("{{Company Name}}", newData["Company Name"])
            .replace("{{Company Name}}", newData["Company Name"])
            .replace("{{Company Name}}", newData["Company Name"])
            .replace("{{Company Name}}", newData["Company Name"])
            .replace("{{Services}}", serviceList)
            .replace("{{page-display}}", newPageDisplay)
            .replace("{{pagination}}", pagination)
            .replace("{{Authorized-Person}}", mailName)
            .replace("{{Authorized-Number}}", AuthorizedNumber)
            .replace("{{Authorized-Email}}", AuthorizedEmail)
            .replace("{{Main-page}}", mainPage)
            .replace("{{Total-Payment}}", totalPaymentHtml)
            .replace("{{Service-Details}}", paymentDetails)
            .replace("{{Third-Page}}", thirdPage)
            .replace("{{Company Number}}", newData["Company Number"])
            .replace("{{Conditional}}", conditional)
            .replace("{{Company Email}}", newData["Company Email"]);
            
      
          //   console.log("This is html file reading:-", filledHtml);
          const pdfFilePath = `./GeneratedDocs/${newData["Company Name"]}.pdf`;
          const pagelength = newData.services.length===1 && mailName === "Dhruvi Gohel" ? 1 ? newData.services.length===1 && mailName === "Shubhi Banthiya" : 2 : 3
          const options = {
            format: "A4", // Set the page format to A4 size
            orientation: "portrait", // Set the page orientation to portrait (or landscape if needed)
            border: "10mm", // Set the page border size (e.g., 10mm)
            header: {
              height: "70px",
              contents: ``, // Customize the header content
            },
            paginationOffset: 1,       // Override the initial pagination number
      "footer": {
        "height": "100px",
        "contents": {
          first: `<div><p>Client's Signature:__________________________________</p><p style="text-align: center;">Page 1/${pagelength}</p></div>`,
          2: `<div><p>Client's Signature:__________________________________</p><p style="text-align: center;">Page 2/${pagelength}</p></div>`, // Any page number is working. 1-based index
          3: `<div><p>Client's Signature:__________________________________</p><p style="text-align: center;">Page 3/3</p></div>`, // Any page number is working. 1-based index
          default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
          last: '<span style="color: #444;">2</span>/<span>2</span>'
        }
      },
            childProcessOptions: {
              env: {
                OPENSSL_CONF: "./dev/null",
              },
            },
          };
      
          pdf
            .create(filledHtml, options)
            .toFile(pdfFilePath, async (err, response) => {
              if (err) {
                console.error("Error generating PDF:", err);
                res.status(500).send("Error generating PDF");
              } else {
                try {
                  setTimeout(() => {
                    const mainBuffer = fs.readFileSync(pdfFilePath);
                    sendMail2(
                      ["nimesh@incscale.in", "bhagyesh@startupsahay.com", "kumarronak597@gmail.com"],
                      `${newData["Company Name"]} | ${serviceNames} | ${newData.bookingDate}`,
                      ``,
                      `
                        <div class="container">
      
                          <p>Dear ${newData["Company Name"]},</p>
                          <p style="margin-top:20px;">We are thrilled to extend a warm welcome to Start-Up Sahay Private Limited as our esteemed client!</p>
                          <p>Following your discussion with ${bdNames}, we understand that you have opted for ${serviceNames} from Start-Up Sahay Private Limited. We are delighted to have you on board and are committed to providing you with exceptional service and support.</p>
                          <p>In the attachment, you will find important information related to the services you have selected, including your company details, chosen services, and payment terms and conditions. This document named Self-Declaration is designed to be printed on your company letterhead, and we kindly request that you sign and stamp the copy to confirm your agreement.</p>
                          <p>Please review this information carefully. If you notice any discrepancies or incorrect details, kindly inform us as soon as possible so that we can make the necessary corrections and expedite the process.</p>
                          <p style="display:${serviceNames == "Start-Up India Certificate"
                        ? "none"
                        : "block"
                      }">To initiate the process of the services you have taken from us, we require some basic information about your business. This will help us develop the necessary documents for submission in the relevant scheme. Please fill out the form at <a href="https://startupsahay.com/basic-information/" class="btn" target="_blank">Basic Information Form</a>. Please ensure to upload the scanned copy of the signed and stamped <b> Self-Declaration </b> copy while filling out the basic information form.</p>
                          <p style="display:${serviceNames == "Start-Up India Certificate"
                        ? "none"
                        : "block"
                      }">If you encounter any difficulties in filling out the form, please do not worry. Our backend admin executives will be happy to assist you over the phone to ensure a smooth process.</p>
                          <p >Your decision to choose Start-Up Sahay Private Limited is greatly appreciated, and we assure you that we will do everything possible to meet and exceed your expectations. If you have any questions or need assistance at any point, please feel free to reach out to us.</p>
                          <div class="signature">
                              <div>Best regards,</div>
                              <div>${mailName} – Relationship Manager</div>
                              <div> ${mailName === "Dhruvi Gohel" ? "+919016928702" : "+919998992601"}</div>
                              <div>Start-Up Sahay Private Limited</div>
                          </div>
                      </div>
                    `,
                      mainBuffer
                    );
                  }, 4000);
                } catch (emailError) {
                  console.error("Error sending email:", emailError);
                  res.status(500).send("Error sending email with PDF attachment");
                }
              }
            });
      
          // Send success response
          res.status(201).send("Data sent");
        } else {
          res.status(404).json("Company Not found");
          return true;
        }
      } else {
        res.status(200).json("No Action Done");
      }
    } catch (error) {
      console.error("Error creating/updating data:", error);
      res.status(500).send("Error creating/updating data"); // Send an error response
    }
  }
);
// Editing a Leadform
router.post(
  "/redesigned-edit-leadData/:CompanyName/:step",
  upload.fields([
    { name: "otherDocs", maxCount: 50 },
    { name: "paymentReceipt", maxCount: 2 },
  ]),
  async (req, res) => {
    try {
      const companyName = req.params.CompanyName;
      const newData = req.body;
      const Step = req.params.step;
      console.log(Step, newData);
      if (Step === "step1") {
        const existingData = await EditableDraftModel.findOne({
          "Company Name": companyName,
        });

        if (existingData) {
          // Update existing data if found
          const updatedData = await EditableDraftModel.findOneAndUpdate(
            { "Company Name": companyName },
            {
              $set: {
                "Company Email":
                  newData["Company Email"] || existingData["Company Email"],
                "Company Name":
                  newData["Company Name"] || existingData["Company Name"],
                "Company Number":
                  newData["Company Number"] || existingData["Company Number"],
                incoDate: newData.incoDate || existingData.incoDate,
                panNumber: newData.panNumber || existingData.panNumber,
                gstNumber: newData.gstNumber || existingData.gstNumber,
              },
            },
            { new: true }
          );
          res.status(200).json(updatedData);
          return true; // Respond with updated data
        } else {
          // Create new data if not found
          const createdData = await EditableDraftModel.create({
            "Company Email": newData["Company Email"],
            "Company Name": newData["Company Name"],
            "Company Number": newData["Company Number"],
            incoDate: newData.incoDate,
            panNumber: newData.panNumber,
            gstNumber: newData.gstNumber,
            Step1Status: true,
          });
          res.status(201).json(createdData); // Respond with created data
          return true;
        }
      } else if (Step === "step2") {
        const existingData = await EditableDraftModel.findOne({
          "Company Name": companyName,
        });
        console.log("Second Step Working");
        if (existingData) {
          const updatedData = await EditableDraftModel.findOneAndUpdate(
            { "Company Name": companyName },
            {
              $set: {
                bdeName: newData.bdeName || "",
                bdeEmail: newData.bdeEmail || "",
                bdmName: newData.bdmName || "",
                otherBdmName: newData.otherBdmName || "",
                bdmEmail: newData.bdmEmail || "",
                bookingDate: newData.bookingDate || "",
                bookingSource: newData.bookingSource || "",
                otherBookingSource: newData.otherBookingSource || "",
                Step2Status: true,
              },
            },
            { new: true }
          );
          res.status(200).json(updatedData);
          return true; // Respond with updated data
        } else {
          const createdData = await EditableDraftModel.create({
            "Company Name": companyName || existingData["Company Name"],
            bdeName: newData.bdeName || "",
            bdeEmail: newData.bdeEmail || "",
            bdmName: newData.bdmName || "",
            otherBdmName: newData.otherBdmName || "",
            bdmEmail: newData.bdmEmail || "",
            bookingDate: newData.bookingDate || "",
            bookingSource: newData.bookingSource || "",
            otherBookingSource: newData.otherBookingSource || "",
            Step2Status: true,
          });
          res.status(200).json(createdData);
          return true;
        }
      } else if (Step === "step3") {
        const existingData = await EditableDraftModel.findOne({
          "Company Name": companyName,
        });

        if (existingData) {
          // Update existing data if found
          const updatedData = await EditableDraftModel.findOneAndUpdate(
            { "Company Name": companyName },
            {
              $set: {
                services: newData.services || existingData.services,
                numberOfServices:
                  newData.numberOfServices || existingData.numberOfServices,
                caCase: newData.caCase,
                caCommission: newData.caCommission,
                caNumber: newData.caNumber,
                caEmail: newData.caEmail,
                totalAmount: newData.totalAmount || existingData.totalAmount,
                pendingAmount:
                  newData.pendingAmount || existingData.pendingAmount,
                receivedAmount:
                  newData.receivedAmount || existingData.receivedAmount,
                Step3Status: true,
              },
            },
            { new: true }
          );
          res.status(200).json(updatedData);
          return true; // Respond with updated data
        } else {
          const createdData = await EditableDraftModel.create({
            "Company Name": companyName || existingData["Company Name"],
            services: newData.services || existingData.services,
            numberOfServices:
              newData.numberOfServices || existingData.numberOfServices,
            caCase: newData.caCase,
            caCommission: newData.caCommission,
            caNumber: newData.caNumber,
            caEmail: newData.caEmail,
            totalAmount: newData.totalAmount || existingData.totalAmount,
            pendingAmount: newData.pendingAmount || existingData.pendingAmount,
            receivedAmount:
              newData.receivedAmount || existingData.receivedAmount,
            Step3Status: true,
          });
          res.status(200).json(createdData);
          return true;
        }
      } else if (Step === "step4") {
        const existingData = await EditableDraftModel.findOne({
          "Company Name": companyName,
        });

        newData.otherDocs =
          req.files["otherDocs"] === undefined
            ? []
            : req.files["otherDocs"].map((file) => file);
        newData.paymentReceipt =
          req.files["paymentReceipt"] === undefined
            ? []
            : req.files["paymentReceipt"].map((file) => file);
        if (existingData) {
          // Update existing data if found
          const updatedData = await EditableDraftModel.findOneAndUpdate(
            { "Company Name": companyName },
            {
              $set: {
                totalAmount: newData.totalAmount || existingData.totalAmount,
                pendingAmount:
                  newData.pendingAmount || existingData.pendingAmount,
                receivedAmount:
                  newData.receivedAmount || existingData.receivedAmount,
                paymentReceipt:
                  newData.paymentReceipt || existingData.paymentReceipt,
                otherDocs: newData.otherDocs || existingData.otherDocs,
                paymentMethod: newData.paymentMethod || newData.paymentMethod,
                extraNotes: newData.extraNotes || newData.extraNotes,
                Step4Status: true,
              },
            },
            { new: true }
          );
          res.status(200).json(updatedData);
          return true; // Respond with updated data
        } else {
          const createdData = await EditableDraftModel.create({
            "Company Name": companyName || existingData["Company Name"],
            totalAmount: newData.totalAmount || existingData.totalAmount,
            pendingAmount: newData.pendingAmount || existingData.pendingAmount,
            receivedAmount:
              newData.receivedAmount || existingData.receivedAmount,
            paymentReceipt:
              newData.paymentReceipt || existingData.paymentReceipt,
            otherDocs: newData.otherDocs || existingData.otherDocs,
            paymentMethod: newData.paymentMethod || newData.paymentMethod,
            extraNotes: newData.extraNotes || newData.extraNotes,
            Step4Status: true,
          });
          res.status(200).json(createdData);
          return true;
        }
      } else if (Step === "step5") {
        const existingData = await EditableDraftModel.findOne({
          "Company Name": companyName,
        });
        if (existingData) {
          const date = new Date();
          console.log(newData.requestBy);

          const updatedData = await EditableDraftModel.findOneAndUpdate(
            { "Company Name": companyName },
            {
              $set: {
                Step5Status: true,
                requestBy: newData.requestBy,
                requestDate: date,
                services:
                  existingData.services.length !== 0
                    ? existingData.services
                    : newData.services,
              },
            },
            { new: true }
          );
          res.status(200).json(updatedData);
          return true;
        } else {
          res.status(200).json({ message: "No Changes made" });
          return true;
        }
      }
      // Add uploaded files information to newData
    } catch (error) {
      console.error("Error creating/updating data:", error);
      res.status(500).send("Error creating/updating data"); // Send an error response
    }
  }
);
// Main API to upload the data
router.post("/redesigned-final-leadData/:CompanyName", async (req, res) => {
  try {
    const newData = req.body;
    const isAdmin = newData.isAdmin;
    console.log("Admin :-", isAdmin)
    const companyData = await CompanyModel.findOne({
      "Company Name": newData["Company Name"],
    });
    const teamData = await TeamLeadsModel.findOne({
      "Company Name": newData["Company Name"],
    });
    if (companyData) {
      newData.company = companyData._id;
    }
    // Create a new entry in the database
    const createdData = await RedesignedLeadformModel.create(newData);
    const date = new Date();
    if (companyData) {
      await CompanyModel.findByIdAndUpdate(companyData._id, {
        Status: "Matured",
        lastActionDate: date,
        ename: newData.bdeName,
        maturedBdmName: newData.bdmName,
      });
    }
    if (teamData) {
      await TeamLeadsModel.findByIdAndUpdate(
        teamData._id,
        {
          bdmStatus: "Matured",
          Status: "Matured",
        },
        { new: true }
      );
      const date = new Date();
      await InformBDEModel.create({
        bdeName: teamData.ename,
        bdmName: teamData.bdmName,
        "Company Name": teamData["Company Name"],
        date: date,
      });
    }

    const totalAmount = newData.services.reduce(
      (acc, curr) => acc + parseInt(curr.totalPaymentWGST),
      0
    );
    const receivedAmount = newData.services.reduce((acc, curr) => {
      return curr.paymentTerms === "Full Advanced"
        ? acc + parseInt(curr.totalPaymentWGST)
        : acc + parseInt(curr.firstPayment);
    }, 0);
    const pendingAmount = totalAmount - receivedAmount;
    // Render services HTML
    const renderServices = () => {
      let servicesHtml = "";
      for (let i = 0; i < newData.services.length; i++) {
        const displayPaymentTerms =
          newData.services[i].paymentTerms === "Full Advanced"
            ? "none"
            : "flex";
        servicesHtml += `
        <div>
        <div style="display: flex; flex-wrap: wrap; margin-top: 20px;">
        <div style="width: 25%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
            Services Name
          </div>
        </div>
        <div style="width: 75%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
            ${newData.services[i].serviceName === "Start-Up India Certificate"
            ? newData.services[i].withDSC
              ? "Start-Up India Certificate With DSC"
              : "Start-Up India Certificate Without DSC"
            : newData.services[i].serviceName
          }
          </div>
        </div>
      </div>
      <div style="display: flex; flex-wrap: wrap">
        <div style="width: 25%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
          Total Amount
          </div>
        </div>
        <div style="width: 75%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
              ₹ ${parseInt(
            newData.services[i].totalPaymentWGST
          ).toLocaleString()}
          </div>
        </div>
      </div>

      <div style="display: flex; flex-wrap: wrap">
        <div style="width: 25%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
           With GST
          </div>
        </div>
        <div style="width: 75%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
            ${newData.services[i].withGST ? "Yes" : "No"}
          </div>
        </div>
      </div>
      <div style="display: flex; flex-wrap: wrap">
        <div style="width: 25%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
           Payment Terms
          </div>
        </div>
        <div style="width: 75%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
           ${newData.services[i].paymentTerms === "Full Advanced"
            ? "Full Advanced"
            : "Part-Payment"
          }
          </div>
        </div>
      </div>
      <div style="display: ${displayPaymentTerms}; flex-wrap: wrap">
        <div style="width: 25%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
           First Payment
          </div>
        </div>
        <div style="width: 75%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
              ₹ ${parseInt(newData.services[i].firstPayment).toLocaleString()}
          </div>
        </div>
      </div>
      <div style="display: ${displayPaymentTerms}; flex-wrap: wrap">
        <div style="width: 25%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
           Second Payment
          </div>
        </div>
        <div style="width: 75%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
              ₹ ${parseInt(
            newData.services[i].secondPayment
          ).toLocaleString()} - ${isNaN(new Date(newData.services[i].secondPaymentRemarks))
            ? newData.services[i].secondPaymentRemarks
            : `Payment On ${newData.services[i].secondPaymentRemarks}`
          }
          </div>
        </div>
      </div>
      <div style="display: ${newData.services[i].thirdPayment === 0 ? "none" : "flex"
          }; flex-wrap: wrap">
        <div style="width: 25%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
           Third Payment
          </div>
        </div>
        <div style="width: 75%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
              ₹ ${parseInt(
            newData.services[i].thirdPayment
          ).toLocaleString()} - ${isNaN(new Date(newData.services[i].thirdPaymentRemarks))
            ? newData.services[i].thirdPaymentRemarks
            : `Payment On ${newData.services[i].thirdPaymentRemarks}`
          }
          </div>
        </div>
      </div>
      <div style="display: ${newData.services[i].fourthPayment === 0 ? "none" : "flex"
          }; flex-wrap: wrap">
        <div style="width: 25%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
           Fourth Payment
          </div>
        </div>
        <div style="width: 75%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
              ₹ ${parseInt(
            newData.services[i].fourthPayment
          ).toLocaleString()} - ${isNaN(new Date(newData.services[i].fourthPaymentRemarks))
            ? newData.services[i].fourthPaymentRemarks
            : `Payment On ${newData.services[i].fourthPaymentRemarks}`
          }
          </div>
        </div>
      </div>
      <div style="display: flex; flex-wrap: wrap">
        <div style="width: 25%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
           Payment Remarks
          </div>
        </div>
        <div style="width: 75%">
          <div style="
                border: 1px solid #ccc;
                font-size: 12px;
                padding: 5px 10px;
              ">
            ${newData.services[i].paymentRemarks}
          </div>
        </div>
      </div>
      </div>
        `;
      }
      return servicesHtml;
    };

    // Render services HTML content
    const servicesHtmlContent = renderServices();
    const visibility = newData.bookingSource !== "Other" && "none";
    // Send email to recipients
    const recipients = !isAdmin ? [
      newData.bdeEmail,
      newData.bdmEmail,
      "bookings@startupsahay.com",
      "documents@startupsahay.com",
    ] : ["nimesh@incscale.in"];

    const serviceNames = newData.services
      .map((service, index) => `${service.serviceName}`)
      .join(" , ");

    sendMail(
      recipients,
      `${newData["Company Name"]} | ${serviceNames} | ${newData.bookingDate}`,
      ``,
      ` <div style="width: 98%; padding: 20px 10px; background: #f6f8fb;margin:0 auto">
      <h3 style="text-align: center">Booking Form Deatils</h3>
      <div style="
            width: 95%;
            margin: 0 auto;
            padding: 20px 10px;
            background: #fff;
            border-radius: 10px;
          ">
        <!--Step One Start-->
        <div style="width: 98%; margin: 0 auto">
          <!-- Step's heading -->
          <div style="display: flex; align-items: center">
            <div style="
                  width: 30px;
                  height: 30px;
                  line-height: 30px;
                  border-radius: 100px;
                  background: #fbb900;
                  text-align: center;
                  font-weight: bold;
                  color: #fff;
                ">
              1
            </div>
            <div style="margin-left: 10px">Company's Basic Informations</div>
          </div>
          <!-- Step's Table -->
          <div style="
                background: #f7f7f7;
                padding: 15px;
                border-radius: 10px;
                position: relative;
                margin-top: 15px;
              ">
            <div style="display: flex; flex-wrap: wrap">
              <div style="width: 25%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                  Company Name
                </div>
              </div>
              <div style="width: 75%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                  ${newData["Company Name"]}
                </div>
              </div>
            </div>
            <div style="display: flex; flex-wrap: wrap">
              <div style="width: 25%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                  Email Address:
                </div>
              </div>
              <div style="width: 75%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                    ${newData["Company Email"]}
                </div>
              </div>
            </div>
            <div style="display: flex; flex-wrap: wrap">
              <div style="width: 25%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                  Phone No:
                </div>
              </div>
              <div style="width: 75%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                    ${newData["Company Number"]}
                </div>
              </div>
            </div>

            <div style="display: flex; flex-wrap: wrap">
              <div style="width: 25%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                  Incorporation date:
                </div>
              </div>
              <div style="width: 75%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                    ${formatDate(newData["incoDate"])}
                </div>
              </div>
            </div>
            <div style="display: flex; flex-wrap: wrap">
              <div style="width: 25%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                  Company's PAN/GST Number:
                </div>
              </div>
              <div style="width: 75%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                    ${newData.panNumber}
                </div>
              </div>
            </div>
         
          </div>
        </div>
        <!--Step One End-->

        <!--Step Two Start-->
        <div style="width: 98%; margin: 10px auto">
          <!-- Step's heading -->
          <div style="display: flex; align-items: center">
            <div style="
                  width: 30px;
                  height: 30px;
                  line-height: 30px;
                  border-radius: 100px;
                  background: #fbb900;
                  text-align: center;
                  font-weight: bold;
                  color: #fff;
                ">
              2
            </div>
            <div style="margin-left: 10px">Booking Details</div>
          </div>
          <!-- Step's Table -->
          <div style="
                background: #f7f7f7;
                padding: 15px;
                border-radius: 10px;
                position: relative;
                margin-top: 15px;
              ">
              <div style="display: flex; flex-wrap: wrap">
              <div style="width: 25%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                 Booking Date
                </div>
              </div>
              <div style="width: 75%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                    ${newData.bookingDate}
                </div>
              </div>
            </div>
            <div style="display: flex; flex-wrap: wrap">
              <div style="width: 25%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                  BDE Name:
                </div>
              </div>
              <div style="width: 75%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                    ${newData.bdeName}
                </div>
              </div>
            </div>
            <div style="display: flex; flex-wrap: wrap">
              <div style="width: 25%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                  BDE Email
                </div>
              </div>
              <div style="width: 75%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                    ${newData.bdeEmail}
                </div>
              </div>
            </div>
            <div style="display: flex; flex-wrap: wrap">
              <div style="width: 25%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                  BDM Name
                </div>
              </div>
              <div style="width: 75%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                    ${newData.bdmName}
                </div>
              </div>
            </div>

            <div style="display: flex; flex-wrap: wrap">
              <div style="width: 25%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                  BDM Email
                </div>
              </div>
              <div style="width: 75%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                    ${newData.bdmEmail}
                </div>
              </div>
            </div>
            <div style="display: flex; flex-wrap: wrap">
              <div style="width: 25%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                  BDM Type
                </div>
              </div>
              <div style="width: 75%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                    ${newData.bdmType === "Close-by"
        ? "Closed-by"
        : "Supported-by"
      }
                </div>
              </div>
            </div>
           
            <div style="display: flex; flex-wrap: wrap">
              <div style="width: 25%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                  Lead Source
                </div>
              </div>
              <div style="width: 75%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                    ${newData.bookingSource}
                </div>
              </div>
            </div>
            <div style="display: flex; flex-wrap: wrap; display: ${visibility}">
              <div style="width: 25%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                  Other Lead Source
                </div>
              </div>
              <div style="width: 75%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                    ${newData.otherBookingSource}
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Step 2 Ends -->

        <!--Step 3 Start-->
        <div style="width: 98%; margin: 10px auto">
          <!-- Step's heading -->
          <div style="display: flex; align-items: center">
            <div style="
                  width: 30px;
                  height: 30px;
                  line-height: 30px;
                  border-radius: 100px;
                  background: #fbb900;
                  text-align: center;
                  font-weight: bold;
                  color: #fff;
                ">
              3
            </div>
            <div style="margin-left: 10px">Services And Payment Details</div>
          </div>
          <!-- Step's Table -->
          <div style="
                background: #f7f7f7;
                padding: 15px;
                border-radius: 10px;
                position: relative;
                margin-top: 15px;
              ">
            <div style="display: flex; flex-wrap: wrap">
              <div style="width: 25%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                  Total Selected Services
                </div>
              </div>
              <div style="width: 75%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                    ${newData.services.length}
                </div>
              </div>
            </div>
           ${servicesHtmlContent}
            <div style="display: flex; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    CA Case
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData.caCase}
                  </div>
                </div>
            </div>
             <div style="display: ${newData.caCase === "Yes" ? "flex" : "none"
      }; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    CA Number
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData.caNumber}
                  </div>
                </div>
            </div>
            <div style="display: ${newData.caCase === "Yes" ? "flex" : "none"
      }; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    CA Email
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData.caEmail}
                  </div>
                </div>
            </div>
            <div style="display: ${newData.caCase === "Yes" ? "flex" : "none"
      }; flex-wrap: wrap">
                <div style="width: 25%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    CA Commission
                  </div>
                </div>
                <div style="width: 75%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                      ${newData.caCommission}
                  </div>
                </div>
            </div>

          </div>
        </div>
        <!-- Step 3 Ends -->

        <!--Step 4 Start-->
        <div style="width: 98%; margin: 10px auto">
          <!-- Step's heading -->
          <div style="display: flex; align-items: center">
            <div style="
                  width: 30px;
                  height: 30px;
                  line-height: 30px;
                  border-radius: 100px;
                  background: #fbb900;
                  text-align: center;
                  font-weight: bold;
                  color: #fff;
                ">
              4
            </div>
            <div style="margin-left: 10px">Payment Summery</div>
          </div>
          <!-- Step's Table -->
          <div style="
                background: #f7f7f7;
                padding: 15px;
                border-radius: 10px;
                position: relative;
                margin-top: 15px;
              ">
            <div style="display: flex; flex-wrap: wrap">
              <div style="width: 33.33%; display: flex;">
                <div style="width: 50%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    Total Payment
                  </div>
                </div>
                <div style="width: 50%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    ₹ ${parseInt(totalAmount).toLocaleString()}
                  </div>
                </div>
              </div>
              <div style="width: 33.33%; display: flex;">
                <div style="width: 50%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                   Received Payment
                  </div>
                </div>
                <div style="width: 50%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    ₹ ${parseInt(receivedAmount).toLocaleString()}
                  </div>
                </div>

              </div>
              <div style="width: 33.33%; display: flex;">
                <div style="width: 50%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                    Pending Payment
                  </div>
                </div>
                <div style="width: 50%">
                  <div style="
                        border: 1px solid #ccc;
                        font-size: 12px;
                        padding: 5px 10px;
                      ">
                   ₹ ${parseInt(pendingAmount).toLocaleString()}
                  </div>
                </div>

              </div>

            </div>
            <div style="display: flex; flex-wrap: wrap; margin-top: 20px;">
              <div style="width: 25%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                 Payment Method
                </div>
              </div>
              <div style="width: 75%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                  ${newData.paymentMethod}
                </div>
              </div>
            </div>
            <div style="display: flex; flex-wrap: wrap">
              <div style="width: 25%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                Extra Remarks
                </div>
              </div>
              <div style="width: 75%">
                <div style="
                      border: 1px solid #ccc;
                      font-size: 12px;
                      padding: 5px 10px;
                    ">
                  ${newData.extraNotes}
                </div>
              </div>
            </div>

          </div>
        </div>
        <!-- Step 4 Ends -->
      </div>
    </div>

      `,
      newData.otherDocs,
      newData.paymentReceipt
    );

    const renderServiceList = () => {
      let servicesHtml = "";
      for (let i = 0; i < newData.services.length; i++) {
        servicesHtml += `
        <span>Service ${i + 1}: ${newData.services[i].serviceName}</span>,  
        `;
      }
      return servicesHtml;
    };
    const renderPaymentDetails = () => {
      let servicesHtml = "";
      let paymentServices = "";
      const serviceLength = newData.services.length > 2 ? 2 : newData.services.length
      for (let i = 0; i < serviceLength; i++) {
        const Amount =
          newData.services[i].paymentTerms === "Full Advanced"
            ? newData.services[i].totalPaymentWGST
            : newData.services[i].firstPayment;
        let rowSpan;

        if (newData.services[i].paymentTerms === "two-part") {
          if (
            newData.services[i].thirdPayment !== 0 &&
            newData.services[i].fourthPayment === 0
          ) {
            rowSpan = 2;
          } else if (newData.services[i].fourthPayment !== 0) {
            rowSpan = 3;
          }
        } else {
          rowSpan = 1;
        }

        if (rowSpan === 3) {
          paymentServices = `
        <tr>
          <td style="border-right:1px solid #ddd">₹${parseInt(newData.services[i].secondPayment).toLocaleString()}/-</td>
          <td>${newData.services[i].secondPaymentRemarks}</td>
        </tr>
        <tr>
         <td style="border-right:1px solid #ddd">₹${parseInt(newData.services[i].thirdPayment).toLocaleString()}/-</td>
         <td>${newData.services[i].thirdPaymentRemarks}</td>
        </tr>
        <tr>
         <td style="border-right:1px solid #ddd">₹${parseInt(newData.services[i].fourthPayment).toLocaleString()}/-</td>
         <td>${newData.services[i].fourthPaymentRemarks}</td>
        </tr>
        `;
        } else if (rowSpan === 2) {
          paymentServices = `
        <tr>
          <td style="border-right:1px solid #ddd">₹${parseInt(newData.services[i].secondPayment).toLocaleString()}/-</td>
          <td >${newData.services[i].secondPaymentRemarks}</td>
        </tr>
        <tr>
          <td style="border-right:1px solid #ddd">₹${parseInt(newData.services[i].thirdPayment).toLocaleString()}/-</td>
          <td >${newData.services[i].thirdPaymentRemarks}</td>
        </tr>
        `;
        } else {
          paymentServices = `
        <tr>
          <td >₹${parseInt(newData.services[i].secondPayment).toLocaleString()}/-</td>
          <td>${newData.services[i].paymentTerms !== "Full Advanced"
              ? newData.services[i].secondPaymentRemarks
              : "100% Advance Payment"
            }</td>
        </tr>
        `;
        }
        servicesHtml += `
        <table class="table table-bordered">
            <thead>
              <td colspan="4">Service Name : ${newData.services[i].serviceName
          }</td>
            </thead>
            <tbody>
              <tr>
                <td>Total Payment</td>
                <td>Advanced Payment</td>
                <td>Pending payment</td>
                <td>Remarks</td>
              </tr>
              <tr>
                    <th rowspan='4'>₹ ${newData.services[i].totalPaymentWGST
          } /-</th>
                    <th rowspan='4'>₹ ${newData.services[i].paymentTerms === "Full Advanced"
            ? parseInt(newData.services[i].totalPaymentWGST).toLocaleString()
            : parseInt(newData.services[i].firstPayment).toLocaleString()
          }/-</th>
              </tr>
              ${paymentServices}
            </tbody>
        </table>
        `;
      }
      return servicesHtml;
    };
    const renderMorePaymentDetails = () => {
      let servicesHtml = "";
      let paymentServices = "";

      for (let i = 2; i < newData.services.length; i++) {
        const Amount =
          newData.services[i].paymentTerms === "Full Advanced"
            ? newData.services[i].totalPaymentWGST
            : newData.services[i].firstPayment;
        let rowSpan;

        if (newData.services[i].paymentTerms === "two-part") {
          if (
            newData.services[i].thirdPayment !== 0 &&
            newData.services[i].fourthPayment === 0
          ) {
            rowSpan = 2;
          } else if (newData.services[i].fourthPayment !== 0) {
            rowSpan = 3;
          }
        } else {
          rowSpan = 1;
        }

        if (rowSpan === 3) {
          paymentServices = `
        <tr>
          <td>₹${parseInt(newData.services[i].secondPayment).toLocaleString()}/-</td>
          <td>${newData.services[i].secondPaymentRemarks}</td>
        </tr>
        <tr>
         <td>₹${parseInt(newData.services[i].thirdPayment).toLocaleString()}/-</td>
         <td>${newData.services[i].thirdPaymentRemarks}</td>
        </tr>
        <tr>
         <td>₹${parseInt(newData.services[i].fourthPayment).toLocaleString()}/-</td>
         <td>${newData.services[i].fourthPaymentRemarks}</td>
        </tr>
        `;
        } else if (rowSpan === 2) {
          paymentServices = `
        <tr>
          <td>₹${parseInt(newData.services[i].secondPayment).toLocaleString()}/-</td>
          <td>${newData.services[i].secondPaymentRemarks}</td>
        </tr>
        <tr>
          <td>₹${parseInt(newData.services[i].thirdPayment).toLocaleString()}/-</td>
          <td>${newData.services[i].thirdPaymentRemarks}</td>
        </tr>
        `;
        } else {
          paymentServices = `
        <tr>
          <td>₹${parseInt(newData.services[i].secondPayment).toLocaleString()}/-</td>
          <td>${newData.services[i].paymentTerms !== "Full Advanced"
              ? newData.services[i].secondPaymentRemarks
              : "100% Advance Payment"
            }</td>
        </tr>
        `;
        }

        servicesHtml += `
        <table class="table table-bordered">
            <thead>
              <td colspan="4">Service Name : ${newData.services[i].serviceName
          }</td>
            </thead>
            <tbody>
              <tr>
                <td>Total Payment</td>
                <td>Advanced Payment</td>
                <td>Pending payment</td>
                <td>Remarks</td>
              </tr>
              <tr>
                    <th rowspan='4'>₹ ${parseInt(newData.services[i].totalPaymentWGST).toLocaleString()
          } /-</th>
                    <th rowspan='4'>₹ ${newData.services[i].paymentTerms === "Full Advanced"
            ? parseInt(newData.services[i].totalPaymentWGST).toLocaleString()
            : parseInt(newData.services[i].firstPayment).toLocaleString()
          }/-</th>
              </tr>
              ${paymentServices}
            </tbody>
        </table>
        `;
      }
      return servicesHtml;
    };
    const allowedServiceNames = [
      "Seed Funding Support",
      "Angel Funding Support",
      "VC Funding Support",
      "Crowd Funding Support",
      "I-Create",
      "Nidhi Seed Support Scheme",
      "Nidhi Prayash Yojna",
      "NAIF",
      "Raftaar",
      "CSR Funding",
      "Stand-Up India",
      "PMEGP",
      "USAID",
      "UP Grant",
      "DBS Grant",
      "MSME Innovation",
      "MSME Hackathon",
      "Gujarat Grant",
      "CGTMSC",
      "Mudra Loan",
      "SIDBI Loan",
      "Incubation Support",
    ];
    const AuthorizedName = newData.services.some((service) => {
      const tempServices = [...allowedServiceNames, "Income Tax Exemption"];
      return tempServices.includes(service);
    })
      ? "Shubhi Banthiya"
      : "Dhruvi Gohel";

    console.log(newData.services);
    const newPageDisplay = newData.services.some((service) => {
      const tempServices = [
        ...allowedServiceNames,
        "Income Tax Exemption",
        "Start-Up India Certificate",
      ];
      return tempServices.includes(service.serviceName);
    })
      ? 'style="display:block'
      : 'style="display:none';

    console.log(newPageDisplay);



    const renderServiceKawali = () => {
      let servicesHtml = "";
      let fundingServices = "";
      let fundingServicesArray = "";
      let incomeTaxServices = "";

      for (let i = 0; i < newData.services.length; i++) {
        if (
          newData.services[i].serviceName === "Start-Up India Certificate"
        ) {
          servicesHtml = `
          <p class="Declaration_text_head mt-2">
          <b>
            Start-Up India Certification Acknowledgement:
          </b>
        </p>
        <p class="Declaration_text_data">
        I, Director of ${newData["Company Name"]}, acknowledge START-UP SAHAY PRIVATE LIMITED's assistance in obtaining the Start-up India certificate, including document preparation and application support. I understand they charge a fee for their services. I acknowledge that the certificate is issued by the government free of charge and that START-UP SAHAY hasn't misled me about this.
        </p>
        
        `;
        } else if (
          allowedServiceNames.includes(newData.services[i].serviceName)
        ) {
          fundingServicesArray += `${newData.services[i].serviceName},`;
          fundingServices = `
          <p class="Declaration_text_head mt-2">
          <b>
          ${newData.services[i].serviceName} Acknowledgement:   
          </b>
        </p>
        <p class="Declaration_text_data">
        I, Director of ${newData["Company Name"]}, engage START-UP SAHAY PRIVATE LIMITED for ${newData.services[i].serviceName}. They'll provide document creation and Application support, utilizing their resources and expertise. I understand there's a fee for their services, not as government fees, Approval of the application is up to the Concerned authorities. START-UP SAHAY PRIVATE LIMITED has not assured me of application approval.
        </p>
        
        `;
        } else if (
          newData.services[i].serviceName === "Income Tax Exemption"
        ) {
      
          incomeTaxServices = `
          <p class="Declaration_text_head mt-2">
          <b>
          Income Tax Exemption Services Acknowledgement:   
          </b>
        </p>
        <p class="Declaration_text_data">
        I, Director of ${newData["Company Name"]}, acknowledge START-UP SAHAY PRIVATE LIMITED's assistance in obtaining the Certificate of Eligibility for the 3-year tax exemption under the 80IAC Income Tax Act. Their services include document preparation and application support, for which they charge a fee. I understand that government fees are not involved. START-UP SAHAY has provided accurate information about the approval process, and the decision rests with the relevant authorities.
        </p>
      `;
        } else {
          servicesHtml += `
      <br>
      `;
        }
      }

      if (fundingServicesArray !== "") {
        servicesHtml += `
        <p class="Declaration_text_head mt-2">
        <b>
        ${fundingServicesArray} Acknowledgement:    
        </b>
      </p>
      <p class="Declaration_text_data">
      I, Director of ${newData["Company Name"]}, engage START-UP SAHAY PRIVATE LIMITED for ${fundingServicesArray}. They'll provide document creation and Application support, utilizing their resources and expertise. I understand there's a fee for their services, not as government fees, Approval of the application is up to the concerned department/authorities. START-UP SAHAY PRIVATE LIMITED has not assured me of application approval.
      </p>
    `;
      } 
      if (incomeTaxServices !== "") {
        servicesHtml += `
        <p class="Declaration_text_head mt-2">
        <b>
        Income Tax Exemption Services Acknowledgement:     
        </b>
      </p>
      <p class="Declaration_text_data">
      I, Director of ${newData["Company Name"]}, acknowledge that START-UP SAHAY PRIVATE LIMITED is assisting me in obtaining the Certificate of Eligibility for the 3-year tax exemption under the 80IAC Income Tax Act. These services involve preparing necessary documents and applications, and utilizing their infrastructure, experience, manpower, and expertise. I understand there's a fee for their services, not as government fees. START-UP SAHAY has provided accurate information regarding the approval process. The decision regarding the application approval rests with the concerned authorities.
      </p>
  `;
      }
      return servicesHtml;
    };
    const conditional = newData.services.length < 2 ? `<div class="Declaration_text">
<p class="Declaration_text_data">
  I confirm that the outlined payment details and terms accurately represent the agreed-upon arrangements between ${newData["Company Name"]} and START-UP SAHAY PRIVATE LIMITED. The charges are solely for specified services, and no additional services will be provided without separate payment, even in the case of rejection.
</p>
</div>` : "";
    const serviceKawali = renderServiceKawali();
    const currentDate = new Date();

    const dateOptions = { day: "numeric", month: "long", year: "numeric" };
    const todaysDate = currentDate.toLocaleDateString("en-US", dateOptions);
    const mainPageHtml = `
        <div class="PDF_main">
          <section>
            <div class="date_div">
              <p>${todaysDate}</p>
            </div>
            <div class="pdf_heading">
              <h3>Self Declaration</h3>
            </div>
            <div class="Declaration_text">
              ${serviceKawali}
              <p class="Declaration_text_data">
                I, understands that because of government regulations and portal, I have no objections if the
                process takes longer than initially committed, knowing it's just how government schemes
                related process works.
              </p>
              <p class="Declaration_text_data">
              As I am unfamiliar with the process, I give START-UP SAHAY PRIVATE LIMITED permission to submit the online or offline application in the concerned department on my behalf, if required.
              </p>
            </div>
         
            
          </section>
        
        </div>
      `;
    const totalPaymentHtml = newData.services.length < 2 ? ` <div class="table-data">
<table class="table table-bordered">
  <thead>
    <th colspan="3">Total Payment Details</th>
  </thead>
  <tbody>
    <tr>
      <td>Total Payment</td>
      <td>Advanced Payment</td>
      <td>Pending Payment</td>
    </tr>
    <tr><td>₹ ${parseInt(totalAmount).toLocaleString()}/-</td>
      <td>₹ ${parseInt(receivedAmount).toLocaleString()}/-</td>
      <td>₹ ${parseInt(pendingAmount).toLocaleString()}/-</td>
    </tr>
  </tbody>
</table>
</div>` : ""
    const mainPage =
      newPageDisplay === 'style="display:block' ? mainPageHtml : "";
    const bdNames =
      newData.bdeName == newData.bdmName
        ? newData.bdeName
        : `${newData.bdeName} && ${newData.bdmName}`;
    const waitpagination =
      newPageDisplay === 'style="display:block' ? "Page 2/2" : "Page 1/1";
    const pagination = newData.services.length > 1 ? "Page 2/3" : waitpagination
    // Render services HTML content
    const serviceList = renderServiceList();
    const paymentDetails = renderPaymentDetails();
    const morePaymentDetails = renderMorePaymentDetails();
    const thirdPage = newData.services.length > 1 ? ` <div class="PDF_main">
    <section>
      ${morePaymentDetails}
       <div class="table-data">
<table class="table table-bordered">
  <thead>
    <th colspan="3">Total Payment Details</th>
  </thead>
  <tbody>
    <tr>
      <td>Total Payment</td>
      <td>Advanced Payment</td>
      <td>Pending Payment</td>
    </tr>
    <tr> <td>  ₹ ${parseInt(totalAmount).toLocaleString()}/-</td>
      <td>₹ ${parseInt(receivedAmount).toLocaleString()}/-</td>
      <td>₹ ${parseInt(pendingAmount).toLocaleString()}/-</td>
    </tr>
  </tbody>
</table>
</div>
      <div class="Declaration_text">
        <p class="Declaration_text_data">
          I confirm that the outlined payment details and terms accurately represent the agreed-upon arrangements between ${newData["Company Name"]} and START-UP SAHAY PRIVATE LIMITED. The charges are solely for specified services, and no additional services will be provided without separate payment, even in the case of rejection.
        </p>
      </div>
     

    </section>
  </div>` : "";

    // const htmlTemplate = fs.readFileSync("./template.html", "utf-8");
    const servicesShubhi = [
      "Pitch Deck Development ",
      "Financial Modeling",
      "DPR Development",
      "CMA Report Development",
      "Company Profile Write-Up",
      "Company Brochure",
      "Product Catalog",
      "Logo Design",
      "Business Card Design",
      "Letter Head Design",
      "Broucher Design",
      "Business Profile",
      "Seed Funding Support",
      "Angel Funding Support",
      "VC Funding Support",
      "Crowd Funding Support",
      "I-Create",
      "Nidhi Seed Support Scheme  ",
      "Nidhi Prayash Yojna",
      "NAIF",
      "Raftaar",
      "CSR Funding",
      "Stand-Up India",
      "PMEGP",
      "USAID",
      "UP Grant",
      "DBS Grant",
      "MSME Innovation",
      "MSME Hackathon",
      "Gujarat Grant",
      "CGTMSC",
      "Income Tax Exemption",
      "Mudra Loan",
      "SIDBI Loan",
      "Incubation Support",
      "Digital Marketing",
      "SEO Services",
      "Branding Services",
      "Social Promotion Management",
      "Email Marketing",
      "Digital Content",
      "Lead Generation",
      "Whatsapp Marketing",
      "Website Development",
      "App Design & Development",
      "Web Application Development",
      "Software Development",
      "CRM Development",
      "ERP Development",
      "E-Commerce Website",
      "Product Development"
    ];
    const mailName = newData.services.some((service) => {
      return servicesShubhi.includes(service.serviceName);
    })
      ? "Shubhi Banthiya"
      : "Dhruvi Gohel";

    const AuthorizedEmail =
      mailName === "Dhruvi Gohel"
        ? "dhruvi@startupsahay.com"
        : "rm@startupsahay.com";
    const AuthorizedNumber =
      mailName === "Dhruvi Gohel" ? "+919016928702" : "+919998992601";

    const htmlNewTemplate = fs.readFileSync("./templatev2.html", "utf-8");
    const filledHtml = htmlNewTemplate
      .replace("{{Company Name}}", newData["Company Name"])
      .replace("{{Company Name}}", newData["Company Name"])
      .replace("{{Company Name}}", newData["Company Name"])
      .replace("{{Company Name}}", newData["Company Name"])
      .replace("{{Company Name}}", newData["Company Name"])
      .replace("{{Services}}", serviceList)
      .replace("{{page-display}}", newPageDisplay)
      .replace("{{pagination}}", pagination)
      .replace("{{Authorized-Person}}", mailName)
      .replace("{{Authorized-Number}}", AuthorizedNumber)
      .replace("{{Authorized-Email}}", AuthorizedEmail)
      .replace("{{Main-page}}", mainPage)
      .replace("{{Total-Payment}}", totalPaymentHtml)
      .replace("{{Service-Details}}", paymentDetails)
      .replace("{{Third-Page}}", thirdPage)
      .replace("{{Company Number}}", newData["Company Number"])
      .replace("{{Conditional}}", conditional)
      .replace("{{Company Email}}", newData["Company Email"]);
      

    //   console.log("This is html file reading:-", filledHtml);
    const pdfFilePath = `./GeneratedDocs/${newData["Company Name"]}.pdf`;
    const pagelength = newData.services.length===1 && mailName === "Dhruvi Gohel" ? 1 ? newData.services.length===1 && mailName === "Shubhi Banthiya" : 2 : 3
    const options = {
      format: "A4", // Set the page format to A4 size
      orientation: "portrait", // Set the page orientation to portrait (or landscape if needed)
      border: "10mm", // Set the page border size (e.g., 10mm)
      header: {
        height: "70px",
        contents: ``, // Customize the header content
      },
      paginationOffset: 1,       // Override the initial pagination number
"footer": {
  "height": "100px",
  "contents": {
    first: `<div><p>Client's Signature:__________________________________</p><p style="text-align: center;">Page 1/${pagelength}</p></div>`,
    2: `<div><p>Client's Signature:__________________________________</p><p style="text-align: center;">Page 2/${pagelength}</p></div>`, // Any page number is working. 1-based index
    3: `<div><p>Client's Signature:__________________________________</p><p style="text-align: center;">Page 3/3</p></div>`, // Any page number is working. 1-based index
    default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
    last: '<span style="color: #444;">2</span>/<span>2</span>'
  }
},
      childProcessOptions: {
        env: {
          OPENSSL_CONF: "./dev/null",
        },
      },
    };

    pdf
      .create(filledHtml, options)
      .toFile(pdfFilePath, async (err, response) => {
        if (err) {
          console.error("Error generating PDF:", err);
          res.status(500).send("Error generating PDF");
        } else {
          try {
            setTimeout(() => {
              const mainBuffer = fs.readFileSync(pdfFilePath);
              sendMail2(
                ["nimesh@incscale.in", "bhagyesh@startupsahay.com", "kumarronak597@gmail.com"],
                `${newData["Company Name"]} | ${serviceNames} | ${newData.bookingDate}`,
                ``,
                `
                  <div class="container">

                    <p>Dear ${newData["Company Name"]},</p>
                    <p style="margin-top:20px;">We are thrilled to extend a warm welcome to Start-Up Sahay Private Limited as our esteemed client!</p>
                    <p>Following your discussion with ${bdNames}, we understand that you have opted for ${serviceNames} from Start-Up Sahay Private Limited. We are delighted to have you on board and are committed to providing you with exceptional service and support.</p>
                    <p>In the attachment, you will find important information related to the services you have selected, including your company details, chosen services, and payment terms and conditions. This document named Self-Declaration is designed to be printed on your company letterhead, and we kindly request that you sign and stamp the copy to confirm your agreement.</p>
                    <p>Please review this information carefully. If you notice any discrepancies or incorrect details, kindly inform us as soon as possible so that we can make the necessary corrections and expedite the process.</p>
                    <p style="display:${serviceNames == "Start-Up India Certificate"
                  ? "none"
                  : "block"
                }">To initiate the process of the services you have taken from us, we require some basic information about your business. This will help us develop the necessary documents for submission in the relevant scheme. Please fill out the form at <a href="https://startupsahay.com/basic-information/" class="btn" target="_blank">Basic Information Form</a>. Please ensure to upload the scanned copy of the signed and stamped <b> Self-Declaration </b> copy while filling out the basic information form.</p>
                    <p style="display:${serviceNames == "Start-Up India Certificate"
                  ? "none"
                  : "block"
                }">If you encounter any difficulties in filling out the form, please do not worry. Our backend admin executives will be happy to assist you over the phone to ensure a smooth process.</p>
                    <p >Your decision to choose Start-Up Sahay Private Limited is greatly appreciated, and we assure you that we will do everything possible to meet and exceed your expectations. If you have any questions or need assistance at any point, please feel free to reach out to us.</p>
                    <div class="signature">
                        <div>Best regards,</div>
                        <div>${mailName} – Relationship Manager</div>
                        <div> ${mailName === "Dhruvi Gohel" ? "+919016928702" : "+919998992601"}</div>
                        <div>Start-Up Sahay Private Limited</div>
                    </div>
                </div>
              `,
                mainBuffer
              );
            }, 4000);
          } catch (emailError) {
            console.error("Error sending email:", emailError);
            res.status(500).send("Error sending email with PDF attachment");
          }
        }
      });

    // Send success response
    res.status(201).send("Data sent");
  } catch (error) {
    console.error("Error creating/updating data:", error);
    res.status(500).send("Error creating/updating data"); // Send an error response
  }
});

//  *****************************************************************  DELETE REQUESTS OF BOOKINGS *****************************************************************


// Request to Delete a booking
router.delete("/redesigned-delete-booking/:companyId", async (req, res) => {
  try {
    const companyId = req.params.companyId;
    // Find and delete the booking with the given companyId
    const deletedBooking = await RedesignedLeadformModel.findOneAndDelete({
      company: companyId,
    });
    const updateMainBooking = await CompanyModel.findByIdAndUpdate(
      companyId,
      { $set: { Status: "Interested" } },
      { new: true }
    );
    if (deletedBooking) {
      const deleteDraft = await RedesignedDraftModel.findOneAndDelete({
        "Company Name": deletedBooking["Company Name"],
      });
    } else {
      return res.status(404).send("Booking not found");
    }
    res.status(200).send("Booking deleted successfully");
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).send("Internal Server Error");
  }
});
// Request to Delete multiple bookings
router.delete(
  "/redesigned-delete-all-booking/:companyId/:bookingIndex",
  async (req, res) => {
    try {
      const companyID = req.params.companyId;
      const bookingIndex = req.params.bookingIndex;
      // Find and delete the booking with the given companyId
      if (bookingIndex == 0) {
        console.log("I am here in 0 index");
        const deletedBooking = await RedesignedLeadformModel.findOneAndDelete({
          company: companyID,
        });
        const updateMainBooking = await CompanyModel.findByIdAndUpdate(
          companyID,
          { $set: { Status: "Interested" } },
          { new: true }
        );
        if (deletedBooking) {
          const deleteDraft = await RedesignedDraftModel.findOneAndDelete({
            "Company Name": deletedBooking["Company Name"],
          });
          const deleterequest = await RequestDeleteByBDE.findOneAndUpdate(
            {
              companyName: deletedBooking["Company Name"],
              request: false,
              bookingIndex: 0,
            },
            {
              $set: {
                request: true,
              },
            }
          );
        } else {
          return res.status(404).send("Booking not found");
        }
      } else {
        console.log("I am here in 1 index");
        const moreObject = await RedesignedLeadformModel.findOne({
          company: companyID,
        });
        const moreID = moreObject.moreBookings[bookingIndex - 1]._id;
        const deletedBooking = await RedesignedLeadformModel.findOneAndUpdate(
          { company: companyID },
          { $pull: { moreBookings: { _id: moreID } } },
          { new: true }
        );
        const deleterequest = await RequestDeleteByBDE.findOneAndUpdate(
          {
            companyName: moreObject["Company Name"],
            request: false,
            bookingIndex: bookingIndex,
          },
          {
            $set: {
              request: true,
            },
          }
        );

        return res.status(200).send("booking Deleted Successfuly");
      }

      res.status(200).send("Booking deleted successfully");
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Deleting booking for particular id
router.delete(
  "/redesigned-delete-particular-booking/:company/:companyId",
  async (req, res) => {
    try {
      const company = req.params.company;
      const companyId = req.params.companyId;

      const updatedLeadForm = await RedesignedLeadformModel.findOneAndUpdate(
        { company: company },
        { $pull: { moreBookings: { _id: companyId } } },
        { new: true }
      );

      if (!updatedLeadForm) {
        return res.status(404).send("Booking not found");
      }

      res.status(200).send("Booking deleted successfully");
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);
// Backend: API endpoint for deleting a draft
router.delete("/redesigned-delete-model/:companyName", async (req, res) => {
  try {
    const companyName = req.params.companyName;
    // Assuming RedesignedDraftModel is your Mongoose model for drafts
    const deletedDraft = await RedesignedDraftModel.findOneAndDelete({
      "Company Name": companyName,
    });
    if (deletedDraft) {
      console.log("Draft deleted successfully:", deletedDraft);
      res.status(200).json({ message: "Draft deleted successfully" });
    } else {
      console.error("Draft not found or already deleted");
      res.status(404).json({ error: "Draft not found or already deleted" });
    }
  } catch (error) {
    console.error("Error deleting draft:", error);
    res.status(500).json({ error: "Error deleting draft" });
  }
});




//  *************************************************  Expanse Section Post Requests *****************************************************************

router.post(
  "/redesigned-submit-morePayments/:CompanyName",
  upload.fields([
    { name: "otherDocs", maxCount: 50 },
    { name: "paymentReceipt", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const objectData = req.body;
      console.log("Object Data:", objectData);

      const newPaymentReceipt = req.files["paymentReceipt"] || [];
      const companyName = objectData["Company Name"];
      const bookingIndex = objectData.bookingIndex;

      const sendingObject = {
        serviceName: objectData.serviceName,
        remainingAmount: objectData.remainingAmount,
        paymentMethod: objectData.paymentMethod,
        extraRemarks: objectData.extraRemarks,
        totalPayment: objectData.pendingAmount,
        receivedPayment: objectData.receivedAmount,
        pendingPayment: objectData.remainingAmount,
        paymentReceipt: newPaymentReceipt,
        withGST: objectData.withGST,
        paymentDate: objectData.paymentDate
      };
      console.log("Sending Object:", sendingObject, bookingIndex);

      if (bookingIndex == 0) {
        console.log("Hi guyz");
        const findObject = await RedesignedLeadformModel.findOne({
          "Company Name": companyName,
        })
        const findService = findObject.services.find((obj) => obj.serviceName === objectData.serviceName)
        const newReceivedAmount = parseInt(findObject.receivedAmount) + parseInt(objectData.receivedAmount);
        const newPendingAmount = parseInt(findObject.pendingAmount) - parseInt(objectData.receivedAmount);
        const newGeneratedReceivedAmount = findService.withGST ? parseInt(findObject.generatedReceivedAmount) + parseInt(objectData.receivedAmount) / 1.18 : parseInt(findObject.generatedReceivedAmount) + parseInt(objectData.receivedAmount);


        console.log(newReceivedAmount, newPendingAmount)
        // Handle updating RedesignedLeadformModel for bookingIndex 0
        // Example code: Uncomment and replace with your logic
        await RedesignedLeadformModel.updateOne(
          { "Company Name": companyName },
          {
            $set: {
              receivedAmount: newReceivedAmount,
              pendingAmount: newPendingAmount,
              generatedReceivedAmount: newGeneratedReceivedAmount
            },
          }
        );

        // Push sendingObject into remainingPayments array
        const updatedObject = await RedesignedLeadformModel.findOneAndUpdate(
          { "Company Name": companyName },
          { $push: { remainingPayments: sendingObject } },
          { new: true }
        );

        return res.status(200).send("Successfully submitted more payments.");
      } else {
        const mainObject = await RedesignedLeadformModel.findOne({
          "Company Name": companyName,
        })
        const findObject = mainObject.moreBookings[bookingIndex - 1];
        const findService = findObject.services.find((obj) => obj.serviceName === objectData.serviceName)
        const newReceivedAmount = parseInt(findObject.receivedAmount) + parseInt(objectData.receivedAmount);
        const newPendingAmount = parseInt(findObject.pendingAmount) - parseInt(objectData.receivedAmount);
        const newGeneratedReceivedAmount = findService.withGST ? parseInt(findObject.generatedReceivedAmount) + parseInt(objectData.receivedAmount) / 1.18 : parseInt(findObject.generatedReceivedAmount) + parseInt(objectData.receivedAmount);
        findObject.remainingPayments.$push

        console.log(newReceivedAmount, newPendingAmount)
        // Handle updating RedesignedLeadformModel for bookingIndex 0
        // Example code: Uncomment and replace with your logic



        // Push sendingObject into remainingPayments array
        await RedesignedLeadformModel.updateOne(
          { "Company Name": companyName },
          {
            $set: {
              [`moreBookings.${bookingIndex - 1}.receivedAmount`]: newReceivedAmount,
              [`moreBookings.${bookingIndex - 1}.pendingAmount`]: newPendingAmount,
              [`moreBookings.${bookingIndex - 1}.generatedReceivedAmount`]: newGeneratedReceivedAmount
            }
          }
        );
        const updatedObject = await RedesignedLeadformModel.updateOne(
          { "Company Name": companyName },
          {
            $push: {
              [`moreBookings.${bookingIndex - 1}.remainingPayments`]: sendingObject,

            }
          },


        );


        return res.status(200).send("Successfully submitted more payments.");
      }
    } catch (error) {
      console.error("Error submitting more payments:", error);
      return res.status(500).send("Internal Server Error.");
    }
  }
);
router.post(
  "/redesigned-update-morePayments/:CompanyName",
  upload.fields([
    { name: "otherDocs", maxCount: 50 },
    { name: "paymentReceipt", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const objectData = req.body;
      console.log("Object Data:", objectData);

      const newPaymentReceipt = req.files["paymentReceipt"] || [];
      const companyName = objectData["Company Name"];
      const bookingIndex = objectData.bookingIndex;

      const sendingObject = {
        serviceName: objectData.serviceName,
        remainingAmount: objectData.remainingAmount,
        paymentMethod: objectData.paymentMethod,
        extraRemarks: objectData.extraRemarks,
        totalPayment: objectData.pendingAmount,
        receivedPayment: objectData.receivedAmount,
        pendingPayment: objectData.remainingAmount,
        paymentReceipt: newPaymentReceipt,
        withGST: objectData.withGST,
        paymentDate: objectData.paymentDate
      };
      console.log("Sending Object:", sendingObject, bookingIndex);

      if (bookingIndex == 0) {
        console.log("Hi guyz");
        const findObject = await RedesignedLeadformModel.findOne({
          "Company Name": companyName,
        });
        const paymentObject = findObject.remainingPayments[findObject.remainingPayments.length - 1];
        const newReceivedAmount = parseInt(findObject.receivedAmount) - parseInt(paymentObject.receivedPayment) + parseInt(sendingObject.receivedPayment);
        const newPendingAmount = parseInt(findObject.pendingAmount) + parseInt(paymentObject.receivedPayment) - parseInt(sendingObject.receivedPayment);
        const findService = findObject.services.find((obj) => obj.serviceName === objectData.serviceName);
        // const newReceivedAmount = parseInt(findObject.receivedAmount) + parseInt(objectData.receivedAmount);
        // const newPendingAmount = parseInt(findObject.pendingAmount) - parseInt(objectData.receivedAmount);

        const newGeneratedReceivedAmount = findService.withGST ? parseInt(findObject.generatedReceivedAmount) - parseInt(paymentObject.receivedPayment) / 1.18 + parseInt(objectData.receivedAmount) / 1.18 : parseInt(findObject.generatedReceivedAmount) - parseInt(paymentObject.receivedPayment) / 1.18 + parseInt(objectData.receivedAmount);


        console.log(newReceivedAmount, newPendingAmount)
        // Handle updating RedesignedLeadformModel for bookingIndex 0
        // Example code: Uncomment and replace with your logic

        findObject.remainingPayments[findObject.remainingPayments.length - 1] = sendingObject;
        const updateResult = await findObject.save();
        await RedesignedLeadformModel.updateOne(
          { "Company Name": companyName },
          {
            $set: {
              receivedAmount: newReceivedAmount,
              pendingAmount: newPendingAmount,
              generatedReceivedAmount: newGeneratedReceivedAmount,

            },
          }
        );

        // Push sendingObject into remainingPayments array
        // const updatedObject = await RedesignedLeadformModel.findOneAndUpdate(
        //   { "Company Name": companyName },
        //   { $push: { remainingPayments: sendingObject } },
        //   { new: true }
        // );

        return res.status(200).send("Successfully submitted more payments.");
      } else {
        console.log("Hi guyz");
        const mainObject = await RedesignedLeadformModel.findOne({
          "Company Name": companyName,
        })
        const findObject = mainObject.moreBookings[bookingIndex - 1];
        const paymentObject = findObject.remainingPayments[findObject.remainingPayments.length - 1];
        const newReceivedAmount = parseInt(findObject.receivedAmount) - parseInt(paymentObject.receivedPayment) + parseInt(sendingObject.receivedPayment);
        const newPendingAmount = parseInt(findObject.pendingAmount) + parseInt(paymentObject.receivedPayment) - parseInt(sendingObject.receivedPayment);
        const findService = findObject.services.find((obj) => obj.serviceName === objectData.serviceName);
        // const newReceivedAmount = parseInt(findObject.receivedAmount) + parseInt(objectData.receivedAmount);
        // const newPendingAmount = parseInt(findObject.pendingAmount) - parseInt(objectData.receivedAmount);

        const newGeneratedReceivedAmount = findService.withGST ? parseInt(findObject.generatedReceivedAmount) - parseInt(paymentObject.receivedPayment) / 1.18 + parseInt(objectData.receivedAmount) / 1.18 : parseInt(findObject.generatedReceivedAmount) - parseInt(paymentObject.receivedPayment) + parseInt(objectData.receivedAmount);


        console.log(newReceivedAmount, newPendingAmount)
        // Handle updating RedesignedLeadformModel for bookingIndex 0
        // Example code: Uncomment and replace with your logic

        // findObject.remainingPayments[findObject.remainingPayments.length-1] = sendingObject;


        const updateResult = await findObject.save();
        await RedesignedLeadformModel.updateOne(
          { "Company Name": companyName },
          {
            $set: {
              [`moreBookings.${bookingIndex - 1}.receivedAmount`]: newReceivedAmount,
              [`moreBookings.${bookingIndex - 1}.pendingAmount`]: newPendingAmount,
              [`moreBookings.${bookingIndex - 1}.generatedReceivedAmount`]: newGeneratedReceivedAmount,
              [`moreBookings.${bookingIndex - 1}.remainingPayments.${findObject.remainingPayments.length - 1}`]: sendingObject
            }
          }
        );

        // Push sendingObject into remainingPayments array
        // const updatedObject = await RedesignedLeadformModel.findOneAndUpdate(
        //   { "Company Name": companyName },
        //   { $push: { remainingPayments: sendingObject } },
        //   { new: true }
        // );

        return res.status(200).send("Successfully submitted more payments.");
      }
    } catch (error) {
      console.error("Error submitting more payments:", error);
      return res.status(500).send("Internal Server Error.");
    }
  }
);
router.post('/redesigned-submit-expanse/:CompanyName', async (req, res) => {
  const data = req.body;
  const companyName = req.params.CompanyName;
  const bookingIndex = data.bookingIndex; // Assuming the bookingIndex is in the request body
  const mainObject = await RedesignedLeadformModel.findOne({ "Company Name": companyName });
  const serviceID = data.serviceID


  if (!mainObject) {
    return res.status(404).json({ error: "Company not found" });
  }

  if (bookingIndex === 0) {

    const findServices = mainObject.services
    const serviceObject = findServices.filter(service => (service._id).toString() === serviceID)[0];



    if (!serviceObject) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Update the serviceObject with new expanse amount
    const expanse = data.expanseAmount
    const updatedServiceObject = {
      serviceName: serviceObject.serviceName, // Spread operator to copy all properties from serviceObject
      totalPaymentWOGST: serviceObject.totalPaymentWOGST, // Spread operator to copy all properties from serviceObject
      totalPaymentWGST: serviceObject.totalPaymentWGST, // Spread operator to copy all properties from serviceObject
      withGST: serviceObject.withGST, // Spread operator to copy all properties from serviceObject
      withDSC: serviceObject.withDSC, // Spread operator to copy all properties from serviceObject
      paymentTerms: serviceObject.paymentTerms, // Spread operator to copy all properties from serviceObject
      firstPayment: serviceObject.firstPayment, // Spread operator to copy all properties from serviceObject
      secondPayment: serviceObject.secondPayment, // Spread operator to copy all properties from serviceObject
      thirdPayment: serviceObject.thirdPayment, // Spread operator to copy all properties from serviceObject
      fourthPayment: serviceObject.fourthPayment, // Spread operator to copy all properties from serviceObject
      secondPaymentRemarks: serviceObject.secondPaymentRemarks, // Spread operator to copy all properties from serviceObject
      thirdPaymentRemarks: serviceObject.thirdPaymentRemarks, // Spread operator to copy all properties from serviceObject
      fourthPaymentRemarks: serviceObject.fourthPaymentRemarks, // Spread operator to copy all properties from serviceObject
      paymentRemarks: serviceObject.paymentRemarks,
      _id: serviceObject._id,// Spread operator to copy all properties from serviceObject
      expanse: parseInt(expanse) // Update the expanse property with the value of the expanse variable
    };

    // Update the services array in mainObject with the updated serviceObject
    const updatedServices = mainObject.services.map(service => {
      if (service._id == serviceID) {
        return updatedServiceObject;
      }
      return service;
    });

    // Update the mainObject with the updated services array
    const updatedMainObject = await RedesignedLeadformModel.findOneAndUpdate(
      { "Company Name": companyName },
      { services: updatedServices },
      { new: true } // Return the updated document
    );

    res.status(200).json(updatedMainObject);
  } else {
    const moreObject = mainObject.moreBookings[bookingIndex - 1];
    const findServices = moreObject.services
    const serviceObject = findServices.filter(service => (service._id).toString() === serviceID)[0];

    if (!serviceObject) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Update the serviceObject with new expanse amount
    const expanse = data.expanseAmount
    const updatedServiceObject = {
      serviceName: serviceObject.serviceName, // Spread operator to copy all properties from serviceObject
      totalPaymentWOGST: serviceObject.totalPaymentWOGST, // Spread operator to copy all properties from serviceObject
      totalPaymentWGST: serviceObject.totalPaymentWGST, // Spread operator to copy all properties from serviceObject
      withGST: serviceObject.withGST, // Spread operator to copy all properties from serviceObject
      withDSC: serviceObject.withDSC, // Spread operator to copy all properties from serviceObject
      paymentTerms: serviceObject.paymentTerms, // Spread operator to copy all properties from serviceObject
      firstPayment: serviceObject.firstPayment, // Spread operator to copy all properties from serviceObject
      secondPayment: serviceObject.secondPayment, // Spread operator to copy all properties from serviceObject
      thirdPayment: serviceObject.thirdPayment, // Spread operator to copy all properties from serviceObject
      fourthPayment: serviceObject.fourthPayment, // Spread operator to copy all properties from serviceObject
      secondPaymentRemarks: serviceObject.secondPaymentRemarks, // Spread operator to copy all properties from serviceObject
      thirdPaymentRemarks: serviceObject.thirdPaymentRemarks, // Spread operator to copy all properties from serviceObject
      fourthPaymentRemarks: serviceObject.fourthPaymentRemarks, // Spread operator to copy all properties from serviceObject
      paymentRemarks: serviceObject.paymentRemarks,
      _id: serviceObject._id,// Spread operator to copy all properties from serviceObject
      expanse: parseInt(expanse) // Update the expanse property with the value of the expanse variable
    };
    console.log(updatedServiceObject);
    // Update the services array in mainObject with the updated serviceObject
    const updatedServices = moreObject.services.map(service => {
      if (service._id == serviceID) {
        return updatedServiceObject;
      }
      return service;
    });

    // Update the mainObject with the updated services array
    const updatedMainObj = await RedesignedLeadformModel.updateOne(
      { "Company Name": companyName },
      {
        $set: {
          [`moreBookings.${bookingIndex - 1}.services`]: updatedServices,

        }
      }
    );

    res.status(200).json(updatedMainObj);
  }
});

//  *************************************************  Expanse Section Delete Requests *****************************************************************
router.delete('/redesigned-delete-morePayments/:companyName/:bookingIndex/:serviceName', async (req, res) => {
  const companyName = req.params.companyName;

  const bookingIndex = req.params.bookingIndex;
  const serviceName = req.params.serviceName;
  console.log("bookingIndex", bookingIndex)

  const findCompany = await RedesignedLeadformModel.findOne({ "Company Name": companyName });
  if (bookingIndex == 0) {
    try {
      console.log("bhoom")
      const newCompany = findCompany;
      const tempObject = newCompany.remainingPayments.filter(rmpayments => rmpayments.serviceName === serviceName);
      const remainingObject = tempObject[tempObject.length - 1];

      const newReceivedAmount = parseInt(newCompany.receivedAmount) - parseInt(remainingObject.receivedPayment);
      const newPendingAmount = parseInt(newCompany.pendingAmount) + parseInt(remainingObject.receivedPayment);
      const findService = newCompany.services.find((obj) => obj.serviceName === remainingObject.serviceName);
      const newGeneratedReceivedAmount = findService.withGST ? parseInt(newCompany.generatedReceivedAmount) - parseInt(remainingObject.receivedPayment) / 1.18 : parseInt(newCompany.generatedReceivedAmount) - parseInt(remainingObject.receivedPayment);
      console.log("this is the required object", newGeneratedReceivedAmount);
      const newRemainingArray = newCompany.remainingPayments.filter(boom => boom._id !== remainingObject._id);
      console.log("This will be the object ", newRemainingArray)

      // findCompany.moreBookings[bookingIndex - 1].remainingPayments.pop(); // Delete the last object from remainingPayments array
      // const updateResult = await findCompany.save();

      const newUpdatedArray = await RedesignedLeadformModel.findOneAndUpdate({ "Company Name": companyName }, {
        $set: {
          receivedAmount: newReceivedAmount,
          pendingAmount: newPendingAmount,
          generatedReceivedAmount: newGeneratedReceivedAmount,
          remainingPayments: newRemainingArray,
        }
      })

      return res.status(200).send("Successfully deleted last payment.");
    } catch (error) {
      console.error("Error deleting more payments:", error);
      return res.status(500).send("Internal Server Error.");
    }

  } else {
    try {

      const newCompany = findCompany.moreBookings[bookingIndex - 1];
      const tempObject = newCompany.remainingPayments.filter(rmpayments => rmpayments.serviceName === serviceName);
      const remainingObject = tempObject[tempObject.length - 1];


      const newReceivedAmount = parseInt(newCompany.receivedAmount) - parseInt(remainingObject.receivedPayment);
      const newPendingAmount = parseInt(newCompany.pendingAmount) + parseInt(remainingObject.receivedPayment);

      const findService = newCompany.services.find((obj) => obj.serviceName === remainingObject.serviceName);
      const newGeneratedReceivedAmount = findService.withGST ? parseInt(newCompany.generatedReceivedAmount) - parseInt(remainingObject.receivedPayment) / 1.18 : parseInt(newCompany.generatedReceivedAmount) - parseInt(remainingObject.receivedPayment);
      console.log("this is the required object", newGeneratedReceivedAmount);
      const newRemainingArray = newCompany.remainingPayments.filter(boom => boom._id !== remainingObject._id);
      console.log("This will be the object ", newRemainingArray)

      // findCompany.moreBookings[bookingIndex - 1].remainingPayments.pop(); // Delete the last object from remainingPayments array
      // const updateResult = await findCompany.save();

      const newUpdatedArray = await RedesignedLeadformModel.findOneAndUpdate({ "Company Name": companyName }, {
        $set: {
          [`moreBookings.${bookingIndex - 1}.receivedAmount`]: newReceivedAmount,
          [`moreBookings.${bookingIndex - 1}.pendingAmount`]: newPendingAmount,
          [`moreBookings.${bookingIndex - 1}.generatedReceivedAmount`]: newGeneratedReceivedAmount,
          [`moreBookings.${bookingIndex - 1}.remainingPayments`]: newRemainingArray,
        }
      })

      return res.status(200).send("Successfully deleted last payment.");
    } catch (error) {
      console.error("Error deleting more payments:", error);
      return res.status(500).send("Internal Server Error.");
    }
  }
})


module.exports = router;