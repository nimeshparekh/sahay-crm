const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const { route } = require("./EmployeeAPI");
const EmployeeDraftModel = require("../models/EmployeeDraftModel");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // const { firstName, lastName } = req.body;
        // const empName = `${firstName}-${lastName}`;
        const { empId } = req.params;
        let destinationPath = "";

        if (file.fieldname && empId) {
            destinationPath = `EmployeeDocs/${empId}`;
        }

        // Create the directory if it doesn't exist
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath, { recursive: true });
        }

        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        // const { firstName, lastName } = req.body;
        // const empName = `${firstName}-${lastName}`;
        const { empId } = req.params;
        const uniqueSuffix = Date.now();
        cb(null, `${uniqueSuffix}-${empId}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

router.post("/saveEmployeeDraft/", async (req, res) => {
    try {
        const { firstName, middleName, lastName, gender, dob, personalPhoneNo, personalEmail, currentAddress, permanentAddress } = req.body;
        const emp = {
            ...req.body,
            ename: `${firstName} ${lastName}`,
            empFullName: `${firstName} ${middleName} ${lastName}`,
            dob: dob,
            gender: gender,
            personal_number: personalPhoneNo,
            personal_email: personalEmail,
            currentAddress: currentAddress,
            permanentAddress: permanentAddress,
            AddedOn: new Date()
        };

        // Check if the document already exists and update it, otherwise create a new one
        const result = await EmployeeDraftModel.create(emp
            // { new: true, upsert: true } // upsert option creates a new document if no match is found
        );

        res.json(result);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/fetchEmployeeDraft/", async (req, res) => {
    try {
        const emp = await EmployeeDraftModel.find();
        if (!emp) {
            return res.status(404).json({ result: false, message: "Employee not found" });
        }
        res.status(200).json({ result: true, message: "Data successfully updated", data: emp });
    } catch (error) {
        res.status(500).json({ result: false, message: "Error updating employee", error: error.message });
    }
});

router.put("/updateEmployeeDraft/:empId", upload.fields([
    { name: "offerLetter", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "educationCertificate", maxCount: 1 },
    { name: "relievingCertificate", maxCount: 1 },
    { name: "salarySlip", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 },
]), async (req, res) => {

    const { empId } = req.params;
    const { 
        firstName, 
        middleName, 
        lastName, 
        dob, 
        gender, 
        personalPhoneNo, 
        personalEmail, 
        employeeID, 
        designation, 
        officialNo, 
        officialEmail, 
        joiningDate, 
        branch, 
        manager, 
        nameAsPerBankRecord, 
        firstMonthSalaryCondition, 
        firstMonthSalary, 
        personName, 
        relationship, 
        personPhoneNo, 
        activeStep 
    } = req.body;
    // console.log("Reqest file is :", req.files);
    // console.log("Emp id is :", employeeID);
    // console.log("Active step :", activeStep);

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

        let newDesignation = designation;

        if ((designation) === "Business Development Executive" || designation === "Business Development Manager") {
            newDesignation = "Sales Executive";
        } else if (designation === "Floor Manager") {
            newDesignation = "Sales Manager";
        } else if (designation === "Data Analyst") {
            newDesignation = "Data Manager";
        } else if (designation === "Admin Head") {
            newDesignation = "RM-Certification";
        } else if (designation === "HR Manager") {
            newDesignation = "HR";
        } else {
            newDesignation = designation;
        }

        const updateFields = {
            ...req.body,
            ...(activeStep && { activeStep: activeStep }),

            ...(firstName || middleName || lastName) && {
                empFullName: `${firstName || ""} ${middleName || ""} ${lastName || ""}`
            },
            ...(dob && { dob }),
            ...(gender && { gender }),
            ...(personalPhoneNo && { personal_number: personalPhoneNo }),
            ...(personalEmail && { personal_email: personalEmail }),

            ...(employeeID && { employeeID: employeeID }),
            ...(designation && {designation: newDesignation}),
            ...(designation && {newDesignation: designation}),
            ...(officialNo && { number: officialNo }),
            ...(officialEmail && { email: officialEmail }),
            ...(joiningDate && { jdate: joiningDate }),
            ...(branch && { branchOffice: branch }),
            ...(manager && { reportingManager: manager }),

            ...(nameAsPerBankRecord && { nameAsPerBankRecord: nameAsPerBankRecord }),
            ...(firstMonthSalaryCondition && { firstMonthSalaryCondition: firstMonthSalaryCondition }),
            ...(firstMonthSalary && { firstMonthSalary: firstMonthSalary }),

            ...(personName && { personal_contact_person: personName }),
            ...(relationship && { personal_contact_person_relationship: relationship }),
            ...(personPhoneNo && { personal_contact_person_number: personPhoneNo }),

            ...(offerLetterDetails.length > 0 && { offerLetter: offerLetterDetails }),
            ...(aadharCardDetails.length > 0 && { aadharCard: aadharCardDetails }),
            ...(panCardDetails.length > 0 && { panCard: panCardDetails }),
            ...(educationCertificateDetails.length > 0 && { educationCertificate: educationCertificateDetails }),
            ...(relievingCertificateDetails.length > 0 && { relievingCertificate: relievingCertificateDetails }),
            ...(salarySlipDetails.length > 0 && { salarySlip: salarySlipDetails }),
            ...(profilePhotoDetails.length > 0 && { profilePhoto: profilePhotoDetails })
        };

        const emp = await EmployeeDraftModel.findOneAndUpdate(
            { _id: empId },
            updateFields,
            { new: true } // Return the updated document
        );

        if (!emp) {
            return res.status(404).json({ result: false, message: "Employee not found" });
        }

        res.status(200).json({ result: true, message: "Data successfully updated", data: emp });
    } catch (error) {
        res.status(500).json({ result: false, message: "Error updating employee", error: error.message });
    }
});

router.delete("/deleteEmployeeDraft/:empId", async (req, res) => {
    const { empId } = req.params;

    try {
        if (!empId) {
            return res.status(404).json({ result: false, message: "Employee not found" });
        }
        const emp = await EmployeeDraftModel.findByIdAndDelete(empId);
        res.status(200).json({ result: true, message: "Employee successfully deleted", data: emp });
    } catch (error) {
        res.status(500).json({ result: false, message: "Error deleting employee", error: error });
    }
});

module.exports = router;