import React, { useEffect, useState, useRef } from 'react';
import { MdDelete } from "react-icons/md";
import { MdOutlineAddCircle } from "react-icons/md";
import Swal from 'sweetalert2';
import ClipLoader from 'react-spinners/ClipLoader';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { AiOutlineDownload } from "react-icons/ai";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { MdOutlineFileUpload } from "react-icons/md";
import { SiGoogledocs } from "react-icons/si";
import { MdOutlineDelete } from "react-icons/md";

function DialogAddRecentEmployee({ refetch, isAdmin }) {

    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const [openBacdrop, setOpenBacdrop] = useState(false);
    const [bdmWork, setBdmWork] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [openPopup, setOpenPopup] = useState(false);
    const [employeeID, setEmployeeID] = useState("");
    const [ename, setEname] = useState("");
    const [email, setEmail] = useState("");
    const [salary, setSalary] = useState("")
    const [gender, setGender] = useState("")
    const [password, setPassword] = useState("");
    const [number, setNumber] = useState(0);
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [department, setDepartment] = useState("");
    const [newDesignation, setNewDesignation] = useState("");
    const [jdate, setJdate] = useState(null);
    // const [designation, setDesignation] = useState("");
    const [branchOffice, setBranchOffice] = useState("");
    const [reportingManager, setReportingManager] = useState("");
    const [nowFetched, setNowFetched] = useState(false);
    const [otherdesignation, setotherDesignation] = useState("");
    const [employeeData, setEmployeeData] = useState([]);
    const [companyData, setCompanyData] = useState([]);
    const [errors, setErrors] = useState([]);
    const [isDepartmentSelected, setIsDepartmentSelected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddSingleEmployee, setIsAddSingleEmployee] = useState(true); // By default, "Add Single Employee" is checked
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false); // To highlight the area during drag
    const [isValidForm, setIsValidForm] = useState(false); // State to track form validity
    const modalRef = useRef(null); // Create a ref for the modal

    const handleCloseBackdrop = () => {
        setOpenBacdrop(false)
    }
    const defaultObject = {
        year: "",
        month: "",
        amount: 0,
        achievedAmount: 0,
        ratio: 0,
        result: "N/A"
    };
    const [targetObjects, setTargetObjects] = useState([defaultObject]);
    const [targetCount, setTargetCount] = useState(1);

    const handleClosePopup = () => {
        setOpenPopup(false);

    }
    // Function to generate a random password in the pattern: firstName@Sahay#XXXX
    const generateRandomPassword = (firstName) => {
        const randomNumber = Math.floor(1000 + Math.random() * 9000);
        return `${firstName}@Sahay#${randomNumber}`;
    };

    const convertToDateInputFormat = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const parseExcelDate = (serial) => {
        const excelEpoch = new Date(Date.UTC(1900, 0, 1)); // Excel's epoch starts at January 1, 1900
        const utcDays = serial - 2; // Excel counts incorrectly starting from 1900 (1900 is considered a leap year by Excel)
        const dateInMilliseconds = utcDays * 24 * 60 * 60 * 1000;
        return new Date(excelEpoch.getTime() + dateInMilliseconds);
    };

    const validate = () => {
        const newErrors = {};
        if (!firstName) newErrors.firstName = "First name is required";
        if (!middleName) newErrors.middleName = "Middle name is required";
        if (!lastName) newErrors.lastName = "Last name is required";
        if (!email) newErrors.email = "Email is required";
        if (!salary) newErrors.salary = "Salary is required";
        if (!gender) newErrors.gender = "Gender is required";
        // if (!password) newErrors.password = "Password is required";
        if (!department || department === "Select Department") newErrors.department = "Department is required";
        if (!newDesignation || newDesignation === "Select Designation") newErrors.newDesignation = "Designation is required";
        if (!branchOffice) newErrors.branchOffice = "Branch office is required";
        if (!reportingManager || reportingManager === "Select Manager") newErrors.reportingManager = "Reporting manager is required";
        if (!number) newErrors.number = "Phone number is required";
        if (!jdate) newErrors.jdate = "Joining date is required";


        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailPattern.test(email)) newErrors.email = "Invalid email";

        // Phone number validation (Indian phone number)
        // const phonePattern = /^(?:\+91|91)?[789]\d{9}$/;
        // if (number && !phonePattern.test(number)) newErrors.number = "Invalid phone number";
        const phonePattern = /^\d{10}$/;
        if (number && !phonePattern.test(number)) {
            newErrors.number = "Invalid phone number";
        }

        return newErrors;
    };

    const departmentDesignations = {
        "Start-Up": [
            "Admin Head",
            "Accountant",
            "Data Analyst",
            "Content Writer",
            "Graphic Designer",
            "Company Secretary",
            "Admin Head",
            "Admin Executive",
        ],
        HR: ["HR Manager", "HR Recruiter"],
        Operation: [
            "Finance Analyst",
            "Content Writer",
            "Relationship Manager",
            "Graphic Designer",
            "Research Analyst",
        ],
        IT: [
            "Web Developer",
            "Software Developer",
            "SEO Executive",
            "Graphic Designer",
            "Content Writer",
            "App Developer",
            "Digital Marketing Executive",
            "Social Media Executive",
        ],
        Sales: [
            "Business Development Executive",
            "Business Development Manager",
            // "Sales Manager",
            "Team Leader",
            "Floor Manager",
            "Vice President"
        ],
        Others: ["Receptionist"],
    };

    const departmentManagers = {
        "Start-Up": [
            "Mr. Ronak Kumar",
            "Mr. Krunal Pithadia",
            "Mr. Saurav Mevada",
            "Miss. Dhruvi Gohel"
        ],
        HR: [
            "Mr. Ronak Kumar",
            "Mr. Krunal Pithadia",
            "Mr. Saurav Mevada",
            "Miss. Hiral Panchal"
        ],
        Operation: [
            "Miss. Subhi Banthiya",
            "Mr. Rahul Pancholi",
            "Mr. Ronak Kumar",
            "Mr. Nimesh Parekh"
        ],
        IT: ["Mr. Nimesh Parekh"],
        Sales: [
            "Mr. Vaibhav Acharya",
            "Mr. Vishal Gohel"
        ],
        Others: ["Miss. Hiral Panchal"],
    }
    const departmentValidation = {
        "Start-Up": {
            designations: ["Admin Head", "Accountant", "Data Analyst", "Content Writer", "Graphic Designer", "Company Secretary", "Admin Executive"],
            managers: ["Mr. Ronak Kumar", "Mr. Krunal Pithadia", "Miss. Dhruvi Gohel"]
        },
        "HR": {
            designations: ["HR Manager", "HR Recruiter"],
            managers: ["Mr. Ronak Kumar", "Miss. Hiral Panchal"]
        },
        "Sales": {
            designations: ["Business Development Executive", "Business Development Manager", "Floor Manager", "Sales Manager"],
            managers: ["Mr. Vishal Gohel", "Mr. Vaibhav Acharya"]
        },
        "IT": {
            designations: ["Web Developer", "Software Developer", "SEO Executive", "Graphic Designer", "App Developer", "Digital Marketing Executive"],
            managers: ["Mr. Nimesh Parekh"]
        },
        Sales: {
            designations: [
                "Business Development Executive",
                "Business Development Manager",
                // "Sales Manager",
                "Team Leader",
                "Floor Manager",
            ],
            managers: [
                "Mr. Vaibhav Acharya",
                "Mr. Vishal Gohel"
            ],
        },
        Operation: {
            designations: [
                "Finance Analyst",
                "Content Writer",
                "Relationship Manager",
                "Graphic Designer",
                "Research Analyst",
            ],
            managers: [
                "Miss. Subhi Banthiya",
                "Mr. Rahul Pancholi",
                "Mr. Ronak Kumar",
                "Mr. Nimesh Parekh"
            ],
        },
        Others: {
            designations: ["Receptionist"],
            managers: ["Miss. Hiral Panchal"],
        }
    };


    const renderDesignationOptions = () => {
        const designations = departmentDesignations[department] || [];
        return designations.map((designation, index) => (
            <option key={index} value={designation}>
                {designation}
            </option>
        ));
    };

    const renderManagerOptions = () => {
        const managers = departmentManagers[department] || [];

        // Special case for "Sales" department with "Vice President" designation
        if (department === "Sales" && newDesignation === "Vice President") {
            return ["Mr. Ronak Kumar", "Mr. Krunal Pithadia", "Mr. Saurav Mevada"].map((manager, index) => (
                <option key={index} value={manager}>
                    {manager}
                </option>
            ));
        }

        // Default case for other designations or departments
        return managers.map((manager, index) => (
            <option key={index} value={manager}>
                {manager}
            </option>
        ));
    };


    const handleInputChange = (field, value) => {
        switch (field) {
            case "firstName":
                setFirstName(value);
                break;
            case "middleName":
                setMiddleName(value);
                break;
            case "lastName":
                setLastName(value);
                break;
            case "email":
                setEmail(value);
                break;
            case "salary":
                setSalary(value);
                break;
            case "gender":
                setGender(value);
                break;
            // case "password":
            //     setPassword(value);
            //     break;
            case "department":
                setDepartment(value);
                break;
            case "newDesignation":
                setNewDesignation(value);
                break;
            case "branchOffice":
                setBranchOffice(value);
                break;
            case "reportingManager":
                setReportingManager(value);
                break;
            case "number":
                setNumber(value);
                break;
            case "jdate":
                setJdate(value);
                break;
            default:
                break;
        }
        setErrors((prevErrors) => {
            const { [field]: removedError, ...restErrors } = prevErrors;
            return restErrors;
        });
    };



    const handleSubmit = async (e) => {

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsValidForm(false)
        } else {
            // Submit form data
            setErrors({});
            setIsValidForm(true);
            // Add your form submission logic here
            // const referenceId = uuidv4();
            const AddedOn = new Date().toLocaleDateString();
            console.log("added on", AddedOn)
            let designation;
            if (newDesignation === "Business Development Executive" || newDesignation === "Business Development Manager") {
                designation = "Sales Executive";
            } else if (newDesignation === "Floor Manager") {
                designation = "Sales Manager";
            } else if (newDesignation === "Data Analyst") {
                designation = "Data Manager";
            } else if (newDesignation === "Admin Head") {
                designation = "RM-Certification";
            } else if (newDesignation === "HR Manager") {
                designation = "HR";
            } else {
                designation = newDesignation;
            }
            // Generate password if creating a new employee
            let generatedPassword = "";
            if (!isUpdateMode) {
                generatedPassword = generateRandomPassword(firstName);
            }
            try {
                setOpenBacdrop(true);
                let dataToSend = {
                    email: email,
                    number: number,
                    ename: `${firstName} ${lastName}`,
                    empFullName: `${firstName} ${middleName} ${lastName}`,
                    department: department,
                    oldDesignation: designation,
                    newDesignation: newDesignation,
                    branchOffice: branchOffice,
                    reportingManager: reportingManager,
                    password: generatedPassword,
                    jdate: jdate,
                    AddedOn: AddedOn,
                    salary: salary,
                    gender: gender,
                    targetDetails: targetObjects,
                    // bdmWork,
                };
                if (newDesignation === "Floor Manager" || newDesignation === "Business Development Manager" || newDesignation === "Business Development Executive") {
                    dataToSend.bdmWork = true;

                } else {
                    dataToSend.bdmWork = false;
                }
                // console.log(isUpdateMode, "updateMode")
                console.log("Before creating employee data is :", dataToSend);
                const response = await axios.post(`${secretKey}/employee/addemployee/hrside`, dataToSend);
                // Only close the modal if the status is 200 (success)
                if (response.status === 200) {
                    Swal.fire({
                        title: "Data Added!",
                        text: "You have successfully added the data!",
                        icon: "success",
                    });
                    document.querySelector("#myModal").classList.remove("show");
                    document.querySelector("#myModal").setAttribute("aria-hidden", "true");
                    document.querySelector("#myModal").style.display = "none";

                    // Remove the modal-backdrop (faded overlay) to avoid screen fade
                    const modalBackdrop = document.querySelector('.modal-backdrop');
                    if (modalBackdrop) {
                        modalBackdrop.parentNode.removeChild(modalBackdrop);
                    }

                    // Ensure body does not have leftover modal-open class (which disables scrolling)
                    document.body.classList.remove('modal-open');
                    document.body.style.removeProperty('overflow');
                    document.body.style.removeProperty('padding-right');
                    handleCloseDialog()
                    refetch(); // To refresh data
                }
            } catch {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something went wrong!",
                });
                console.error("Internal server error");
            } finally {
                setOpenBacdrop(false);
            }
        }
    };


    const handleAddTarget = () => {
        const totalTargets = targetObjects;
        totalTargets.push(defaultObject);
        setTargetCount(targetCount + 1);
        setTargetObjects(totalTargets);
    };

    const handleRemoveTarget = () => {
        const totalTargets = targetObjects;
        totalTargets.pop();
        setTargetCount(targetCount - 1);
        setTargetObjects(totalTargets);
    };

    const handleCloseDialog = () => {
        setIsAddSingleEmployee(true)
        // console.log("Created employee is :", response.data);
        // console.log("Close add popup", openForAdd);
        setFirstName("");
        setMiddleName("");
        setLastName("");
        setEname("");
        setEmail("")
        setSalary("");
        setGender("");
        setNumber(0);
        // setPassword("");
        setDepartment("");
        setNewDesignation("");
        setBranchOffice("");
        setReportingManager("");
        setotherDesignation("");
        setJdate(null);
        setIsUpdateMode(false);
        setTargetCount(1);
        setTargetObjects([defaultObject]);
        setErrors({});
    }

    // Handle radio button change
    const handleCheckboxChange = (isSingleEmployee) => {
        setIsAddSingleEmployee(isSingleEmployee);
        setUploadedFile(null); // Clear uploaded file if switching modes
    };

    // Handle file selection for bulk upload
    const handleFileChange = (e) => {
        setUploadedFile(e.target.files[0]);
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
    }

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true); // Show drag highlight
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true); // Show drag highlight
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false); // Remove drag highlight
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false); // Remove drag highlight
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setUploadedFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData(); // Clear data after drop
        }
    };


    const handleBulkUploadSubmit = async () => {
        if (!uploadedFile) {
            Swal.fire({
                icon: 'error',
                title: 'Missing File',
                text: 'Please upload an Excel file.',
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            const employeesData = sheetData.map((row) => {
                const generatedPassword = generateRandomPassword(row["First Name"]);
                let designation;
                if (row["Designation"] === "Business Development Executive" || row["Designation"] === "Business Development Manager") {
                    designation = "Sales Executive";
                } else if (row["Designation"] === "Floor Manager") {
                    designation = "Sales Manager";
                } else if (row["Designation"] === "Data Analyst") {
                    designation = "Data Manager";
                } else if (row["Designation"] === "Admin Head") {
                    designation = "RM-Certification";
                } else if (row["Designation"] === "HR Manager") {
                    designation = "HR";
                } else {
                    designation = row["Designation"];
                }
                return {
                    firstName: row["First Name"],
                    middleName: row["Middle Name"],
                    lastName: row["Last Name"],
                    email: row["Email  Address"],
                    number: typeof row["Number"] === "string" ? row["Number"].replace(/\s+/g, '') : String(row["Number"] || '').replace(/\s+/g, ''),
                    ename: `${row["First Name"]} ${row["Last Name"]}`,
                    empFullName: `${row["First Name"]} ${row["Middle Name"]} ${row["Last Name"]}`,
                    department: row["Department"],
                    designation: designation,
                    newDesignation: row["Designation"],
                    branchOffice: row["Branch Office"],
                    reportingManager: row["Manager"],
                    password: generatedPassword,
                    jdate: parseExcelDate(row["Joining Date"]),
                    AddedOn: new Date().toLocaleDateString(),
                    salary: row["Salary"],
                    gender: row["Gender"],
                    targetDetails: [],
                    bdmWork: row["Designation"] === "Floor Manager" || row["Designation"] === "Business Development Manager" || row["Designation"] === "Business Development Executive" ? true : false,
                };
            });

            const validEmployees = [];
            const invalidRows = [];
            let errorMessages = "";

            employeesData.forEach((employee, index) => {
                const department = employee.department;
                const newDesignation = employee.newDesignation;
                const manager = employee.reportingManager;

                if (departmentValidation[department]) {
                    const validDesignations = departmentValidation[department].designations;
                    const validManagers = departmentValidation[department].managers;

                    if (department === "Sales" && newDesignation === "Vice President") {
                        if (!["Mr. Ronak Kumar", "Mr. Krunal Pithadia", "Mr. Saurav Mevada"].includes(manager)) {
                            invalidRows.push(index + 2);
                            errorMessages += `Row ${index + 2}: Invalid Manager "${manager}" for Designation "Vice President" in Sales department.<br>`;
                            return;
                        }
                    } else {
                        if (!validDesignations.includes(newDesignation)) {
                            invalidRows.push(index + 2);
                            errorMessages += `Row ${index + 2}: Invalid Designation "${newDesignation}" for Department "${department}".<br>`;
                            return;
                        }

                        if (!validManagers.includes(manager)) {
                            invalidRows.push(index + 2);
                            errorMessages += `Row ${index + 2}: Invalid Manager "${manager}" for Department "${department}".<br>`;
                            return;
                        }
                    }
                    // If valid, add to the validEmployees list
                    validEmployees.push(employee);
                } else {
                    invalidRows.push(index + 2);
                    errorMessages += `Row ${index + 2}: Unknown Department "${department}".<br>`;
                }
            });

            if (invalidRows.length > 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Some rows were skipped due to errors',
                    html: errorMessages,
                });
            }

            // Process only valid rows
            if (validEmployees.length > 0) {
                try {
                    setOpenBacdrop(true);
                    const response = await axios.post(`${secretKey}/employee/hr-bulk-add-employees`, { employeesData: validEmployees });

                    if (response.status === 200) {
                        Swal.fire({
                            title: 'Employees Added!',
                            html: `Successfully added ${response.data.successCount} employees.<br>Skipped Rows: ${invalidRows.join(", ")}`,
                            icon: 'success',
                        });
                        handleCloseDialog();
                        refetch();
                    }
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Bulk Upload Failed',
                        text: `Error occurred during bulk upload: ${error.message}`,
                    });
                } finally {
                    setOpenBacdrop(false);
                }
            }
        };

        reader.readAsArrayBuffer(uploadedFile);
    };





    return (
        <div>
            <div className={'d-flex align-items-center justify-content-center'}>
                <a
                    style={{ textDecoration: "none" }}
                    data-bs-toggle="modal"
                    data-bs-target="#myModal" // Use dynamic modal ID
                >
                    <button className="btn btn-primary mr-1">+ Add Employee</button>
                </a>
            </div>
            {/* ------------------------------------------------------add employee dialog------------------------------------------------------- */}
            <div className="modal" id="myModal" ref={modalRef}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        {/* Modal Header */}
                        <div className="modal-header d-flex align-items-center justify-content-between">
                            <h4 className="modal-title">Add Recent Employee</h4>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                onClick={handleCloseDialog}
                            >

                            </button>
                        </div>

                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-3">
                                <div className="form-check form-check-inline">
                                    <input
                                        className="form-check-input rounded-circle"
                                        type="radio"
                                        name="employeeOption"
                                        id="addSingleEmployee"
                                        checked={isAddSingleEmployee}
                                        onChange={() => handleCheckboxChange(true)}
                                    />
                                    <label className="form-check-label" htmlFor="addSingleEmployee">
                                        Add Single Employee
                                    </label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <input
                                        className="form-check-input rounded-circle"
                                        type="radio"
                                        name="employeeOption"
                                        id="bulkUpload"
                                        checked={!isAddSingleEmployee}
                                        onChange={() => handleCheckboxChange(false)}
                                    />
                                    <label className="form-check-label" htmlFor="bulkUpload">
                                        Bulk Upload
                                    </label>
                                </div>
                            </div>
                        </div>
                        {/* Modal Body */}
                        <div className="modal-body">
                            {isAddSingleEmployee ? (
                                <>
                                    <div className='row mb-3'>
                                        <label className="form-label">Employee Name</label>
                                        <div className="col-lg-4">
                                            <input
                                                type="text"
                                                name="firstName"
                                                className="form-control mt-1"
                                                placeholder="First name"
                                                value={firstName?.trim()}
                                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                            />
                                            {errors.firstName && <p style={{ color: 'red' }}>{errors.firstName}</p>}
                                        </div>
                                        <div className="col-lg-4">
                                            <input
                                                type="text"
                                                name="middleName"
                                                className="form-control mt-1"
                                                placeholder="Middle name"
                                                value={middleName?.trim()}
                                                onChange={(e) => handleInputChange("middleName", e.target.value)}
                                            />
                                            {errors.middleName && <p style={{ color: 'red' }}>{errors.middleName}</p>}
                                        </div>
                                        <div className="col-lg-4">
                                            <input
                                                type="text"
                                                name="lastName"
                                                className="form-control mt-1"
                                                placeholder="Last name"
                                                value={lastName?.trim()}
                                                onChange={(e) => handleInputChange("lastName", e.target.value)}
                                            />
                                            {errors.lastName && <p style={{ color: 'red' }}>{errors.lastName}</p>}
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className=" col-lg-12 mb-3">
                                            <label className="form-label">Email Address</label>
                                            <input
                                                value={email}
                                                type="email"
                                                className="form-control"
                                                name="example-text-input"
                                                placeholder="Email"
                                                onChange={(e) => handleInputChange("email", e.target.value)}
                                            />
                                            {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className=" col-lg-6 mb-3">
                                            <label className="form-label">Salary</label>
                                            <input
                                                value={salary}
                                                type="text"
                                                className="form-control"
                                                name="example-text-input"
                                                placeholder="Salary"
                                                onChange={(e) => handleInputChange("salary", e.target.value)}
                                            />
                                            {errors.salary && <p style={{ color: 'red' }}>{errors.salary}</p>}
                                        </div>
                                        <div className=" col-lg-6 mb-3">
                                            <label className="form-label">Gender</label>
                                            <select
                                                className="form-select"
                                                value={gender}
                                                required
                                                onChange={(e) => {
                                                    handleInputChange("gender", e.target.value);
                                                    setIsDepartmentSelected(e.target.value !== "Select Gender");
                                                }}
                                            >
                                                <option value="Select Department" selected> Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>

                                            </select>
                                            {errors.gender && <p style={{ color: 'red' }}>{errors.gender}</p>}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-4 mb-3">
                                            <label className="form-label">Department</label>
                                            <div>
                                                <select
                                                    className="form-select"
                                                    value={department}
                                                    required
                                                    onChange={(e) => {
                                                        handleInputChange("department", e.target.value);
                                                        setIsDepartmentSelected(e.target.value !== "Select Department");
                                                    }}
                                                >
                                                    <option value="Select Department" selected> Select Department</option>
                                                    <option value="Start-Up">Start-Up</option>
                                                    <option value="HR">HR</option>
                                                    <option value="Operation">Operation</option>
                                                    <option value="IT">IT</option>
                                                    <option value="Sales">Sales</option>
                                                    <option value="Others">Others</option>
                                                </select>
                                            </div>
                                            {errors.department && <p style={{ color: 'red' }}>{errors.department}</p>}
                                        </div>

                                        <div className="col-lg-4 mb-3">
                                            <label className="form-label">Designation/Job Title</label>
                                            <div>
                                                <select className="form-select"
                                                    name="newDesignation"
                                                    id="newDesignation"
                                                    value={newDesignation}
                                                    onChange={(e) => handleInputChange("newDesignation", e.target.value)}
                                                    disabled={!isDepartmentSelected}
                                                >
                                                    <option value="Select Designation">Select Designation</option>
                                                    {renderDesignationOptions()}
                                                </select>
                                            </div>
                                            {errors.newDesignation && <p style={{ color: 'red' }}>{errors.newDesignation}</p>}
                                        </div>
                                        <div className="col-lg-4 mb-3">
                                            <label className="form-label">Branch Office</label>
                                            <div>
                                                <select
                                                    className="form-select"
                                                    value={branchOffice}
                                                    required
                                                    onChange={(e) => handleInputChange("branchOffice", e.target.value)}
                                                >
                                                    <option value="" selected>Select Branch Office</option>
                                                    <option value="Gota">Gota</option>
                                                    <option value="Sindhu Bhawan">Sindhu Bhawan</option>
                                                </select>
                                            </div>
                                            {errors.branchOffice && <p style={{ color: 'red' }}>{errors.branchOffice}</p>}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-4 mb-3">
                                            <label className="form-label">Manager</label>
                                            <div>
                                                <select className="form-select"
                                                    name="reportingManager"
                                                    id="reportingManager"
                                                    value={reportingManager}
                                                    onChange={(e) => handleInputChange("reportingManager", e.target.value)}
                                                    disabled={!isDepartmentSelected}
                                                >
                                                    <option value="Select Designation">Select Manager</option>
                                                    {department === "Sales" && newDesignation === "Floor Manager"
                                                        ? <option value="Mr. Ronak Kumar">Mr. Ronak Kumar</option> : <>{renderManagerOptions()}</>
                                                    }
                                                </select>
                                            </div>
                                            {errors.reportingManager && <p style={{ color: 'red' }}>{errors.reportingManager}</p>}
                                        </div>
                                        <div className="col-lg-4">
                                            <div className="mb-3">
                                                <label className="form-label">Phone No.</label>
                                                <input
                                                    value={number}
                                                    type="number"
                                                    className="form-control"
                                                    onChange={(e) => handleInputChange("number", e.target.value)}
                                                />
                                                {errors.number && <p style={{ color: 'red' }}>{errors.number}</p>}
                                            </div>
                                        </div>
                                        <div className="col-lg-4">
                                            <div className="mb-3">
                                                <label className="form-label">Joining Date</label>
                                                <input
                                                    value={jdate}
                                                    type="date"
                                                    onChange={(e) => handleInputChange("jdate", e.target.value)}
                                                    className="form-control"
                                                />
                                                {errors.jdate && <p style={{ color: 'red' }}>{errors.jdate}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    {targetObjects.map((obj, index) => (
                                        <div className="row mb-3" key={index}>
                                            <label className="form-label">ADD Target</label>
                                            <div className="col-lg-3">
                                                <div>
                                                    <select
                                                        className="form-select"
                                                        value={obj.year}
                                                        onChange={(e) => {
                                                            setTargetObjects(prevState => {
                                                                const updatedTargets = [...prevState];
                                                                updatedTargets[index] = { ...updatedTargets[index], year: e.target.value };
                                                                return updatedTargets;
                                                            });
                                                        }}
                                                    >
                                                        <option value="" disabled>
                                                            Select Year
                                                        </option>
                                                        <option value="2024">2024</option>
                                                        <option value="2023">2023</option>
                                                        <option value="2022">2022</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-lg-3">
                                                <div>
                                                    <select
                                                        className="form-select"
                                                        value={obj.month}
                                                        onChange={(e) => {
                                                            setTargetObjects(prevState => {
                                                                const updatedTargets = [...prevState];
                                                                updatedTargets[index] = { ...updatedTargets[index], month: e.target.value };
                                                                return updatedTargets;
                                                            });
                                                        }}
                                                    >
                                                        <option value="" disabled>
                                                            Select Month
                                                        </option>
                                                        <option value="January">January</option>
                                                        <option value="February">February</option>
                                                        <option value="March">March</option>
                                                        <option value="April">April</option>
                                                        <option value="May">May</option>
                                                        <option value="June">June</option>
                                                        <option value="July">July</option>
                                                        <option value="August">August</option>
                                                        <option value="September">September</option>
                                                        <option value="October">October</option>
                                                        <option value="November">November</option>
                                                        <option value="December">December</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-lg-3">
                                                <div>
                                                    <input
                                                        placeholder="ADD Target value"
                                                        type="number"
                                                        className="form-control"
                                                        value={obj.amount}
                                                        onChange={(e) => {
                                                            setTargetObjects(prevState => {
                                                                const updatedTargets = [...prevState];
                                                                updatedTargets[index] = { ...updatedTargets[index], amount: e.target.value };
                                                                return updatedTargets;
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-2 d-flex align-items-center justify-content-end">
                                                <button className="btn" onClick={() => handleAddTarget(index)}>
                                                    <MdOutlineAddCircle

                                                    />
                                                </button>
                                                <button className="btn ms-2" onClick={() => handleRemoveTarget(index)}>
                                                    <MdDelete

                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </>

                            ) : (
                                <>
                                    {/* Field for Bulk Upload */}
                                    <div>
                                        <div className={`drag-file-area ${isDragging ? 'dragging' : ''}`} // Add 'dragging' class to change style during drag
                                            onDragOver={handleDragOver}
                                            onDragEnter={handleDragEnter}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}>
                                            <div className='upload-icon'>
                                                <MdOutlineFileUpload />
                                            </div>
                                            <h3 class="dynamic-message"> Drag & drop any file here </h3>
                                            <label className='browse-files-text'> Browse Files Here
                                                <input type="file" class="default-file-input" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        {uploadedFile && (
                                            <div className="file-block">
                                                <div className="file-info">
                                                    <span className="material-icons-outlined file-icon"><SiGoogledocs /></span>
                                                    <span className="file-name">{uploadedFile.name}</span>
                                                </div>
                                                <span className="material-icons remove-file-icon" onClick={handleRemoveFile}><MdDelete /></span>
                                                <div className="progress-bar"></div>
                                            </div>
                                        )}
                                        <a className='hr_bulk_upload_a'
                                            href={`${process.env.PUBLIC_URL}/AddNewEmployeeFormat.xlsx`}
                                            download={"AddNewEmployeeFormat.xlsx"}
                                        >
                                            <div className='hr_bulk_upload'>
                                                <div style={{ marginRight: "5px" }}>
                                                    <AiOutlineDownload />
                                                </div>
                                                <div>
                                                    Download Sample
                                                </div>

                                            </div>
                                        </a>
                                    </div>
                                </>
                            )
                            }

                        </div>
                        <div className="modal-footer">
                            {isAddSingleEmployee ? (
                                <button className="btn btn-primary"
                                    // {...(isValidForm ? { 'data-bs-dismiss': 'modal' } : {})} // Only close modal if form is valid
                                    //data-bs-dismiss="modal"
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </button>
                            ) : (
                                <button className="btn btn-primary" data-bs-dismiss="modal" onClick={handleBulkUploadSubmit}>
                                    Bulk Upload
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* --------------------------------backedrop------------------------- */}
            {openBacdrop && (<Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={openBacdrop}
                onClick={handleCloseBackdrop}>
                <CircularProgress color="inherit" />
            </Backdrop>)}
        </div>

    )
}

export default DialogAddRecentEmployee