import React, { useState, useEffect } from 'react';
import Header from "../../Components/Header/Header.jsx";
import Navbar from "../../Components/Navbar/Navbar.jsx";
import ClipLoader from "react-spinners/ClipLoader";
import axios from 'axios';
import { IconChevronLeft } from "@tabler/icons-react";
import debounce from 'lodash/debounce';
import { IconChevronRight } from "@tabler/icons-react";
import * as XLSX from "xlsx";
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Nodata from "../../../components/Nodata.jsx";
import { Page } from 'react-pdf';
import { IoFilterOutline } from "react-icons/io5";
import { TbFileImport } from "react-icons/tb";
import { TbFileExport } from "react-icons/tb";
import { TiUserAddOutline } from "react-icons/ti";
import { MdAssignmentAdd } from "react-icons/md";
import { MdOutlinePostAdd } from "react-icons/md";
import { MdOutlineDeleteSweep } from "react-icons/md";
import Swal from "sweetalert2";
import Papa from "papaparse";
// import DeleteIcon from "@mui/icons-material/Delete";
// import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { Link, json } from "react-router-dom";
import { IconEye } from "@tabler/icons-react";
import { MdDeleteOutline } from "react-icons/md";
import { MdOutlineEdit } from "react-icons/md";
import { BsFillArrowLeftSquareFill } from 'react-icons/bs';
import { IoIosClose } from "react-icons/io";

function ManageLeads() {
    const [currentDataLoading, setCurrentDataLoading] = useState(false)
    const [data, setData] = useState([])
    const [mainData, setmainData] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [completeLeads, setCompleteLeads] = useState([]);
    const [totalCount, setTotalCount] = useState()
    const itemsPerPage = 500;
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const [searchText, setSearchText] = useState("")
    const [dataStatus, setDataStatus] = useState("Unassigned");
    const [totalCompaniesUnassigned, setTotalCompaniesUnaasigned] = useState()
    const [totalCompaniesAssigned, setTotalCompaniesAssigned] = useState()
    const [empData, setEmpData] = useState([])
    const frontendKey = process.env.REACT_APP_FRONTEND_KEY;
    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const [remarksHistory, setRemarksHistory] = useState([]);
    const [filteredRemarks, setFilteredRemarks] = useState([]);
    const [cid, setcid] = useState("");
    const [cstat, setCstat] = useState("");

    const fetchTotalLeads = async () => {
        const response = await axios.get(`${secretKey}/company-data/leads`)
        setCompleteLeads(response.data)
    }


    const fetchData = async (page) => {
        try {
            setCurrentDataLoading(true)
            //console.log("dataStatus", dataStatus)
            const response = await axios.get(`${secretKey}/company-data/new-leads?page=${page}&limit=${itemsPerPage}&dataStatus=${dataStatus}`);
            //console.log("data", response.data.data)
            // Set the retrieved data in the state
            //console.log(response.data.unAssignedCount)

            setData(response.data.data);
            setTotalCount(response.data.totalPages)
            setTotalCompaniesUnaasigned(response.data.unAssignedCount)
            setTotalCompaniesAssigned(response.data.assignedCount)
            setmainData(response.data.data.filter((item) => item.ename === "Not Alloted"));
            //console.log("mainData", mainData)
            //setDataStatus("Unassigned")

            // Set isLoading back to false after data is fetched
            //setIsLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error.message);
            // Set isLoading back to false if an error occurs
            //setIsLoading(false);
        } finally {
            setCurrentDataLoading(false)
        }
    };

    const fetchEmployeesData = async () => {
        try {

            const response = await axios.get(`${secretKey}/employee/einfo`)
            setEmpData(response.data)

        } catch (error) {
            console.log("Error fetching data", error.message)
        }
    }

    const fetchRemarksHistory = async () => {
        try {
            const response = await axios.get(`${secretKey}/remarks/remarks-history`);
            setRemarksHistory(response.data);
            setFilteredRemarks(response.data.filter((obj) => obj.companyID === cid));


        } catch (error) {
            console.error("Error fetching remarks history:", error);
        }
    };

    useEffect(() => {
        fetchData(1)
        fetchTotalLeads()
        fetchEmployeesData()
        fetchRemarksHistory()
    }, [dataStatus])

    const handleNextPage = () => {
        setCurrentPage(currentPage + 1);
        fetchData(currentPage + 1);
    };

    const handlePreviousPage = () => {
        setCurrentPage(currentPage - 1);
        fetchData(currentPage - 1);
    };

    //const currentData = mainData.slice(startIndex, endIndex);

    function formatDateFinal(timestamp) {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const handleFilterSearch = async (searchQuery) => {
        try {
            setCurrentDataLoading(true);

            const response = await axios.get(`${secretKey}/company-data/search-leads`, {
                params: { searchQuery , field:"Company Name" }
            });

            if (!searchQuery.trim()) {
                // If search query is empty, reset data to mainData
                fetchData(1)
            } else {
                // Set data to the search results
                setData(response.data);
            }
        } catch (error) {
            console.error('Error searching leads:', error.message);
        } finally {
            setCurrentDataLoading(false);
        }
    };


    //--------------------function to add leads-------------------------------------
    const [openAddLeadsDialog, setOpenAddLeadsDialog] = useState(false)
    const [error, setError] = useState('');
    const [errorDirectorNumberFirst, setErrorDirectorNumberFirst] = useState("")
    const [errorDirectorNumberSecond, setErrorDirectorNumberSecond] = useState("")
    const [errorDirectorNumberThird, setErrorDirectorNumberThird] = useState("")
    const [openSecondDirector, setOpenSecondDirector] = useState(false)
    const [openFirstDirector, setOpenFirstDirector] = useState(true)
    const [openThirdDirector, setOpenThirdDirector] = useState(false)
    const [firstPlus, setFirstPlus] = useState(true)
    const [secondPlus, setSecondPlus] = useState(false)
    const [openThirdMinus, setOpenThirdMinus] = useState(false)
    const [cname, setCname] = useState("");
    const [cemail, setCemail] = useState("");
    const [companyAddress, setCompanyAddress] = useState("");
    const [directorNameFirst, setDirectorNameFirst] = useState("");
    const [directorNameSecond, setDirectorNameSecond] = useState("");
    const [directorNameThird, setDirectorNameThird] = useState("");
    const [directorNumberFirst, setDirectorNumberFirst] = useState(0);
    const [directorNumberSecond, setDirectorNumberSecond] = useState(0);
    const [directorNumberThird, setDirectorNumberThird] = useState(0);
    const [directorEmailFirst, setDirectorEmailFirst] = useState("");
    const [directorEmailSecond, setDirectorEmailSecond] = useState("");
    const [directorEmailThird, setDirectorEmailThird] = useState("");
    const [cnumber, setCnumber] = useState(0);
    const [state, setState] = useState("");
    const [openRemarks, openchangeRemarks] = useState(false);
    const [city, setCity] = useState("");
    const [cidate, setCidate] = useState(null);

    function closeAddLeadsDialog() {
        setOpenAddLeadsDialog(false)
        setOpenFirstDirector(true);
        setOpenSecondDirector(false);
        setOpenThirdDirector(false);
        setFirstPlus(true);
        setSecondPlus(false);
        setOpenThirdMinus(false)
        //fetchData(1);
        setError('')
        setErrorDirectorNumberFirst("");
        setErrorDirectorNumberSecond("");
        setErrorDirectorNumberThird("");
    }

    const functionOpenSecondDirector = () => {
        setOpenSecondDirector(true);
        setFirstPlus(false);
        setSecondPlus(true);
    };
    const functionOpenThirdDirector = () => {
        setOpenSecondDirector(true);
        setOpenThirdDirector(true);
        setFirstPlus(false);
        setSecondPlus(false);
        setOpenThirdMinus(true);
    };

    const functionCloseSecondDirector = () => {
        setOpenFirstDirector(false);
        //setOpenThirdMinus(true);
        setOpenThirdMinus(false);
        setOpenSecondDirector(false);
        setSecondPlus(false);
        setFirstPlus(true)
    }
    const functionCloseThirdDirector = () => {
        setOpenSecondDirector(true);
        setOpenThirdDirector(false);
        setFirstPlus(false);
        setOpenThirdMinus(false)
        setSecondPlus(true)
    }

    const handleSubmitData = (e) => {
        e.preventDefault();

        if (cname === "") {
            Swal.fire("Please Enter Company Name");
        } else if (!cnumber && !/^\d{10}$/.test(cnumber)) {
            Swal.fire("Company Number is required");
        } else if (cemail === "") {
            Swal.fire("Company Email is required");
        } else if (city === "") {
            Swal.fire("City is required");
        } else if (state === "") {
            Swal.fire("State is required");
        } else if (directorNumberFirst !== 0 && !/^\d{10}$/.test(directorNumberFirst)) {
            Swal.fire("First Director Number should be 10 digits");
        } else if (directorNumberSecond !== 0 && !/^\d{10}$/.test(directorNumberSecond)) {
            Swal.fire("Second Director Number should be 10 digits");
        } else if (directorNumberThird !== 0 && !/^\d{10}$/.test(directorNumberThird)) {
            Swal.fire("Third Director Number should be 10 digits");
        } else {
            axios
                .post(`${secretKey}/admin-leads/manual`, {
                    "Company Name": cname.toUpperCase().trim(),
                    "Company Number": cnumber,
                    "Company Email": cemail,
                    "Company Incorporation Date  ": cidate, // Assuming the correct key is "Company Incorporation Date"
                    City: city,
                    State: state,
                    ename: data.ename,
                    AssignDate: new Date(),
                    "Company Address": companyAddress,
                    "Director Name(First)": directorNameFirst,
                    "Director Number(First)": directorNumberFirst,
                    "Director Email(First)": directorEmailFirst,
                    "Director Name(Second)": directorNameSecond,
                    "Director Number(Second)": directorNumberSecond,
                    "Director Email(Second)": directorEmailSecond,
                    "Director Name(Third)": directorNameThird,
                    "Director Number(Third)": directorNumberThird,
                    "Director Email(Third)": directorEmailThird,
                })
                .then((response) => {
                    //console.log("response", response);
                    console.log("Data sent Successfully");
                    Swal.fire({
                        title: "Data Added!",
                        text: "Successfully added new Data!",
                        icon: "success",
                    });
                    fetchData(1);
                    closeAddLeadsDialog();
                })
                .catch((error) => {
                    console.error("Error sending data:", error);
                    Swal.fire("An error occurred. Please try again later.");
                });
        }
    };

    //------------------------------function add leads through csv-----------------------------------

    const [openBulkLeadsCSVPopup, setOpenBulkLeadsCSVPopup] = useState(false)
    const [selectedOption, setSelectedOption] = useState("direct");
    const [csvdata, setCsvData] = useState([]);
    const [newemployeeSelection, setnewEmployeeSelection] = useState("Not Alloted");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    function closeBulkLeadsCSVPopup() {
        setOpenBulkLeadsCSVPopup(false)
        setCsvData([])
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (
            file &&
            file.type ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });

                // Assuming there's only one sheet in the XLSX file
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                const adminName = localStorage.getItem("adminName")
                const formattedJsonData = jsonData
                    .slice(1) // Exclude the first row (header)
                    .map((row) => ({
                        "Sr. No": row[0],
                        "Company Name": row[1],
                        "Company Number": row[2],
                        "Company Email": row[3],
                        "Company Incorporation Date  ": formatDateFromExcel(row[4]), // Assuming the date is in column 'E' (0-based)
                        City: row[5],
                        State: row[6],
                        "Company Address": row[7],
                        "Director Name(First)": row[8],
                        "Director Number(First)": row[9],
                        "Director Email(First)": row[10],
                        "Director Name(Second)": row[11],
                        "Director Number(Second)": row[12],
                        "Director Email(Second)": row[13],
                        "Director Name(Third)": row[14],
                        "Director Number(Third)": row[15],
                        "Director Email(Third)": row[16],
                        "UploadedBy": adminName ? adminName : "Admin"
                    }));

                setCsvData(formattedJsonData);
            };

            reader.readAsArrayBuffer(file);
        } else if (file.type === "text/csv") {
            // CSV file
            const parsedCsvData = parseCsv(data);
            setCsvData(parsedCsvData);
        } else {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong!",
                footer: '<a href="#">Why do I have this issue?</a>',
            });

            console.error("Please upload a valid XLSX file.");
        }
    };
    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const parseCsv = (data) => {
        // Use a CSV parsing library (e.g., Papaparse) to parse CSV data
        // Example using Papaparse:
        const parsedData = Papa.parse(data, { header: true });
        return parsedData.data;
    };
    function formatDateFromExcel(serialNumber) {
        // Excel uses a different date origin (January 1, 1900)
        const excelDateOrigin = new Date(Date.UTC(1900, 0, 0));
        const millisecondsPerDay = 24 * 60 * 60 * 1000;

        // Adjust for Excel leap year bug (1900 is not a leap year)
        const daysAdjustment = serialNumber > 59 ? 1 : 0;

        // Calculate the date in milliseconds
        const dateMilliseconds =
            excelDateOrigin.getTime() +
            (serialNumber - daysAdjustment) * millisecondsPerDay;

        // Create a Date object using the calculated milliseconds
        const formattedDate = new Date(dateMilliseconds);

        // Format the date as needed (you can use a library like 'date-fns' or 'moment' for more options)
        // const formattedDateString = formattedDate.toISOString().split('T')[0];

        return formattedDate;
    }
    //console.log(csvdata)

    const handleUploadData = async (e) => {
        // Get current date and time

        // newArray now contains objects with updated properties
        const adminName = localStorage.getItem("adminName")

        if (selectedOption === "someoneElse") {
            const properDate = new Date();
            const updatedCsvdata = csvdata.map((data) => ({
                ...data,
                ename: newemployeeSelection,
                AssignDate: properDate,
                UploadedBy: adminName ? adminName : "Admin"
            }));

            const currentDate = new Date().toLocaleDateString();
            const currentTime = new Date().toLocaleTimeString();

            //console.log(updatedCsvdata)
            // Create a new array of objects with desired properties
            const newArray = updatedCsvdata.map((data) => ({
                date: currentDate,
                time: currentTime,
                ename: newemployeeSelection,
                companyName: data["Company Name"], // Assuming companyName is one of the existing properties in updatedCsvdata
            }));
            if (updatedCsvdata.length !== 0) {
                setLoading(true); // Move setLoading outside of the loop

                try {
                    const response = await axios.post(
                        `${secretKey}/company-data/leads`,
                        updatedCsvdata
                    );
                    await axios.post(`${secretKey}/employee/employee-history`, newArray);
                    // await axios.post(`${secretKey}/employee-history`, updatedCsvdata);

                    const counter = response.data.counter;
                    // console.log("counter", counter)
                    const successCounter = response.data.sucessCounter;
                    //console.log(successCounter)

                    if (counter === 0) {
                        //console.log(response.data)
                        Swal.fire({
                            title: "Data Send!",
                            text: "Data successfully sent to the Employee",
                            icon: "success",
                        });
                    } else {
                        const lines = response.data.split('\n');
                        const numberOfDuplicateEntries = lines.length - 1;
                        const noofSuccessEntries = newArray.length - numberOfDuplicateEntries
                        Swal.fire({
                            title: 'Do you want download duplicate entries report?',
                            html: `Successful Entries: ${noofSuccessEntries}<br>Duplicate Entries: ${numberOfDuplicateEntries}<br>Click Yes to download report?`,
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Yes',
                            cancelButtonText: 'No'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                //console.log(response.data)
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement("a");
                                link.href = url;
                                link.setAttribute("download", "DuplicateEntriesLeads.csv");
                                document.body.appendChild(link);
                                link.click();
                                // User clicked "Yes", perform action
                                // Call your function or execute your code here
                            } else if (result.dismiss === Swal.DismissReason.cancel) {
                                return true;
                            }
                        });
                    }
                    fetchData(1);
                    closeBulkLeadsCSVPopup();
                    setnewEmployeeSelection("Not Alloted");
                } catch (error) {
                    if (error.response.status !== 500) {
                        setErrorMessage(error.response.data.error);
                        Swal.fire("Some of the data are not unique");
                    } else {
                        setErrorMessage("An error occurred. Please try again.");
                        Swal.fire("Please upload unique data");
                    }
                    console.log("Error:", error);
                }
                setLoading(false); // Move setLoading outside of the loop
                setCsvData([]);
            } else {
                Swal.fire("Please upload data");
            }
        } else {
            if (csvdata.length !== 0) {
                setLoading(true); // Move setLoading outside of the loop

                try {
                    const response = await axios.post(
                        `${secretKey}/company-data/leads`,
                        csvdata
                    );

                    // await axios.post(`${secretKey}/employee-history`, updatedCsvdata);

                    const counter = response.data.counter;
                    // console.log("counter", counter)
                    const successCounter = response.data.sucessCounter;
                    //console.log(successCounter)

                    if (counter === 0) {
                        //console.log(response.data)
                        Swal.fire({
                            title: "Data Added!",
                            text: "Data Successfully added to the Leads",
                            icon: "success",
                        });
                    } else {
                        const lines = response.data.split('\n');

                        // Count the number of lines (entries)
                        const numberOfDuplicateEntries = lines.length - 1;
                        const noofSuccessEntries = csvdata.length - numberOfDuplicateEntries
                        Swal.fire({
                            title: 'Do you want download duplicate entries report?',
                            html: `Successful Entries: ${noofSuccessEntries}<br>Duplicate Entries: ${numberOfDuplicateEntries}<br>Click Yes to download report?`,
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Yes',
                            cancelButtonText: 'No'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                //console.log(response.data)
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement("a");
                                link.href = url;
                                link.setAttribute("download", "DuplicateEntriesLeads.csv");
                                document.body.appendChild(link);
                                link.click();
                                // User clicked "Yes", perform action
                                // Call your function or execute your code here
                            } else if (result.dismiss === Swal.DismissReason.cancel) {
                                return true;
                            }
                        });
                    }
                    fetchData(1);
                    closeBulkLeadsCSVPopup();
                    setnewEmployeeSelection("Not Alloted");
                } catch (error) {
                    if (error.response.status !== 500) {
                        setErrorMessage(error.response.data.error);
                        Swal.fire("Some of the data are not unique");
                    } else {
                        setErrorMessage("An error occurred. Please try again.");
                        Swal.fire("Please upload unique data");
                    }
                    console.log("Error:", error);
                }
                setLoading(false); // Move setLoading outside of the loop
                setCsvData([]);
            } else {
                Swal.fire("Please upload data");
            }
        }
    };

    //----------------------function for export leads data-------------------------------------
    const [selectedRows, setSelectedRows] = useState([]);
    const [startRowIndex, setStartRowIndex] = useState(null);
    const [allIds, setAllIds] = useState([])

    const handleCheckboxChange = async (id) => {
        // If the id is 'all', toggle all checkboxes
        if (id === "all") {
            // If all checkboxes are already selected, clear the selection; otherwise, select all
            //console.log(id)
            const response = await axios.get(`${secretKey}/admin-leads/getIds?dataStatus=${dataStatus}`)
            //console.log(response.data)
            setAllIds(response.data)
            setSelectedRows((prevSelectedRows) =>
                prevSelectedRows.length === response.data.length
                    ? []
                    : response.data
            );
        } else {
            // Toggle the selection status of the row with the given id
            setSelectedRows((prevSelectedRows) => {
                if (prevSelectedRows.includes(id)) {
                    return prevSelectedRows.filter((rowId) => rowId !== id);
                } else {
                    return [...prevSelectedRows, id];
                }
            });
        }
    };

    const handleMouseDown = (id) => {
        // Initiate drag selection
        setStartRowIndex(data.findIndex((row) => row._id === id));
    };

    const handleMouseEnter = (id) => {
        // Update selected rows during drag selection
        if (startRowIndex !== null) {
            const endRowIndex = data.findIndex((row) => row._id === id);
            const selectedRange = [];
            const startIndex = Math.min(startRowIndex, endRowIndex);
            const endIndex = Math.max(startRowIndex, endRowIndex);

            for (let i = startIndex; i <= endIndex; i++) {
                selectedRange.push(data[i]._id);
            }

            setSelectedRows(selectedRange);
        }
    };

    const handleMouseUp = () => {
        // End drag selection
        setStartRowIndex(null);
    };

    const exportData = async () => {
        try {
            const response = await axios.post(
                `${secretKey}/admin-leads/exportLeads/`,
                selectedRows
            );
            //console.log("response",response.data)
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            dataStatus === "Assigned"
                ? link.setAttribute("download", "AssignedLeads_Admin.csv")
                : link.setAttribute("download", "UnAssignedLeads_Admin.csv");

            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error("Error downloading CSV:", error);
        }
    };
    //--------------------function to assign leads to employees---------------------
    const [openAssignLeadsDialog, setOpenAssignLeadsDialog] = useState(false)
    const [employeeSelection, setEmployeeSelection] = useState("")

    function closeAssignLeadsDialog() {
        setOpenAssignLeadsDialog(false)
        fetchData(1)
        setEmployeeSelection("")
    }
    const handleconfirmAssign = async () => {
        const selectedObjects = data.filter((row) =>
            selectedRows.includes(row._id)
        );

        //console.log("selectedObjecyt", selectedObjects)
        // Check if no data is selected
        if (selectedObjects.length === 0) {
            Swal.fire("Empty Data!");
            closeAssignLeadsDialog();
            return; // Exit the function early if no data is selected
        }

        const alreadyAssignedData = selectedObjects.filter(
            (obj) => obj.ename && obj.ename !== "Not Alloted"
        );

        // If all selected data is not already assigned, proceed with assignment
        if (alreadyAssignedData.length === 0) {
            handleAssignData();
            return; // Exit the function after handling assignment
        }

        // If some selected data is already assigned, show confirmation dialog
        const userConfirmed = window.confirm(
            `Some data is already assigned. Do you want to continue?`
        );

        if (userConfirmed) {
            handleAssignData();
        }
    };

    const handleAssignData = async () => {
        const title = `${selectedRows.length} data assigned to ${employeeSelection}`;
        const DT = new Date();
        const date = DT.toLocaleDateString();
        const time = DT.toLocaleTimeString();
        const currentDataStatus = dataStatus;
        try {
            const response = await axios.post(`${secretKey}/admin-leads/postAssignData`, {
                employeeSelection,
                selectedObjects: data.filter((row) => selectedRows.includes(row._id)),
                title,
                date,
                time,
            });
            Swal.fire("Data Assigned");
            setOpenAssignLeadsDialog(false);
            fetchData(1);
            setSelectedRows([]);
            setDataStatus(currentDataStatus);
            setEmployeeSelection("")
        } catch (err) {
            console.log("Internal server Error", err);
            Swal.fire("Error Assigning Data");
        }
    };

    //-------------------------function to delete leads-------------------------

    const handleDeleteSelection = async () => {
        if (selectedRows.length !== 0) {
            // Show confirmation dialog using SweetAlert2
            Swal.fire({
                title: "Confirm Deletion",
                text: "Are you sure you want to delete the selected rows?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete",
                cancelButtonText: "No, cancel",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {

                        Swal.fire({
                            title: 'Deleting...',
                            allowOutsideClick: false,
                            didOpen: () => {
                              Swal.showLoading();
                            }
                          });
                        // If user confirms, proceed with deletion
                        const response = await axios.delete(`${secretKey}/admin-leads/deleteAdminSelectedLeads`, {
                            data: { selectedRows }, // Pass selected rows to the server
                        });

                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Selected rows have been deleted.',
                            icon: 'success',
                          });
                        //console.log(response.data)
                        // Store backup process
                        // After deletion, fetch updated data
                        await fetchData(1);
                        setSelectedRows([]); // Clear selectedRows state
                    } catch (error) {
                        console.error("Error deleting rows:", error.message);
                    }
                }
            });
        } else {
            // If no rows are selected, show an alert
            Swal.fire("Select some rows first!");
        }
    };

    // ---------------------function to delete particular lead----------------------------------
    const handleDeleteClick = async (id) => {
        try {
            const result = await Swal.fire({
                title: 'Confirm Deletion',
                text: 'Are you sure you want to delete this item?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, cancel'
            });

            if (result.isConfirmed) {
                await axios.delete(`${secretKey}/company-data/leads/${id}`);

                Swal.fire(
                    'Deleted!',
                    'The item has been deleted.',
                    'success'
                );

                // Refresh the data after successful deletion
                fetchData(1);
            }
        } catch (error) {
            console.error("Error deleting data:", error);

            Swal.fire(
                'Error!',
                'An error occurred while deleting the item.',
                'error'
            );
        }
    };

    //----------------------function to modify leads----------------------------------------
    const [openLeadsModifyPopUp, setOpenLeadsModifyPopUp] = useState(false)
    const [selectedDataId, setSelectedDataId] = useState()
    const [companyEmail, setCompanyEmail] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [companyIncoDate, setCompanyIncoDate] = useState(null);
    const [companyCity, setCompnayCity] = useState("");
    const [companyState, setCompnayState] = useState("");
    const [companynumber, setCompnayNumber] = useState("");
    const [isEditProjection, setIsEditProjection] = useState(false);
    const [cAddress, setCAddress] = useState("");
    const [directorNameFirstModify, setDirectorNameFirstModify] = useState("")
    const [directorNumberFirstModify, setDirectorNumberFirstModify] = useState("")
    const [directorEmailFirstModify, setDirectorEmailFirstModify] = useState("")
    const [directorNameSecondModify, setDirectorNameSecondModify] = useState("")
    const [directorNumberSecondModify, setDirectorNumberSecondModify] = useState("")
    const [directorEmailSecondModify, setDirectorEmailSecondModify] = useState("")
    const [directorNameThirdModify, setDirectorNameThirdModify] = useState("")
    const [directorNumberThirdModify, setDirectorNumberThirdModify] = useState("")
    const [directorEmailThirdModify, setDirectorEmailThirdModify] = useState("")
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [errorCompnayNumber, setErrorCompnayNumber] = useState('');
    const [errorDirectorNumberFirstModify, setErrorDirectorNumberFirstModify] = useState("")
    const [errorDirectorNumberSecondModify, setErrorDirectorNumberSecondModify] = useState("")
    const [errorDirectorNumberThirdModify, setErrorDirectorNumberThirdModify] = useState("")

    const functioncloseModifyPopup = () => {
        setOpenLeadsModifyPopUp(false);
        setIsEditProjection(false);
        setOpenFirstDirector(true);
        setOpenSecondDirector(false);
        setOpenThirdDirector(false);
        setFirstPlus(true);
        setSecondPlus(false);
        setOpenThirdMinus(false)
        //fetchData();
        setError('')
        setErrorDirectorNumberFirst("");
        setErrorDirectorNumberSecond("");
        setErrorDirectorNumberThird("");
    }

    const handleUpdateClick = (id) => {
        //console.log(id)
        //Set the selected data ID and set update mode to true
        setSelectedDataId(id);
        setIsUpdateMode(true);
        // setCompanyData(cdata.filter((item) => item.ename === echangename));

        // // Find the selected data object

        const selectedData = data.find((item) => item._id === id);

        //console.log(selectedData["Company Incorporation Date  "])
        //console.log(selectedData)
        // console.log(echangename);

        // // Update the form data with the selected data values
        setCompanyEmail(selectedData["Company Email"]);
        setCompanyName(selectedData["Company Name"]);
        //setCompanyIncoDate(new Date(selectedData["Company Incorporation Date  "]));
        setCompnayCity(selectedData["City"]);
        setCompnayState(selectedData["State"]);
        setCompnayNumber(selectedData["Company Number"]);
        setCAddress(selectedData["Company Address"])
        setDirectorNameFirstModify(selectedData["Director Name(First)"])
        setDirectorNumberFirstModify(selectedData["Director Number(First)"])
        setDirectorEmailFirstModify(selectedData["Director Email(First)"])
        setDirectorNameSecondModify(selectedData["Director Name(Second)"])
        setDirectorNumberSecondModify(selectedData["Director Number(Second)"])
        setDirectorEmailSecondModify(selectedData["Director Email(Second)"])
        setDirectorNameThirdModify(selectedData["Director Name(Third)"])
        setDirectorNumberThirdModify(selectedData["Director Number(Third)"])
        setDirectorEmailThirdModify(selectedData["Director Email(Third)"])
        const dateString = selectedData["Company Incorporation Date  "];

        // Parse the date string into a Date object
        const dateObject = new Date(dateString);

        // Check if the parsed Date object is valid
        if (!isNaN(dateObject.getTime())) {
            // Date object is valid, proceed with further processing
            //console.log("Company Incorporation Date:", dateObject);

            // Format the date as dd-mm-yyyy
            const day = dateObject.getDate().toString().padStart(2, "0");
            const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
            const year = dateObject.getFullYear();
            const formattedDate = `${year}-${month}-${day}`;
            setCompanyIncoDate(formattedDate)

            //console.log("Formatted Company Incorporation Date:", formattedDate);

            // Rest of your code...
        } else {
            // Date string couldn't be parsed into a valid Date object
            console.error("Invalid Company Incorporation Date string:", dateString);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const adminName = localStorage.getItem("adminName");
        try {
            let validationError = false;

            if (companyName === "") {
                validationError = true;
                Swal.fire("Please Enter Company Name");
            } else if (!companynumber || !/^\d{10}$/.test(companynumber)) {
                validationError = true;
                Swal.fire("Company Number is required and should be 10 digits");
            } else if (companyEmail === "") {
                validationError = true;
                Swal.fire("Company Email is required");
            } else if (companyCity === "") {
                validationError = true;
                Swal.fire("City is required");
            } else if (companyState === "") {
                validationError = true;
                Swal.fire("State is required");
            } else if (directorNumberFirstModify && !/^\d{10}$/.test(directorNumberFirstModify)) {
                validationError = true;
                Swal.fire("First Director Number should be 10 digits");
            } else if (directorNumberSecondModify && !/^\d{10}$/.test(directorNumberSecondModify)) {
                validationError = true;
                Swal.fire("Second Director Number should be 10 digits");
            } else if (directorNumberThirdModify && !/^\d{10}$/.test(directorNumberThirdModify)) {
                validationError = true;
                Swal.fire("Third Director Number should be 10 digits");
            }

            if (!validationError) {
                const dateObject = new Date(companyIncoDate);

                // Check if the parsed Date object is valid
                if (!isNaN(dateObject.getTime())) {
                    // Date object is valid, proceed with further processing
                    // Format the date as yyyy-mm-ddThh:mm:ss.000
                    const isoDateString = dateObject.toISOString();

                    // Update dataToSendUpdated with the formatted date
                    let dataToSendUpdated = {
                        "Company Name": companyName,
                        "Company Email": companyEmail,
                        "Company Number": companynumber,
                        "Company Incorporation Date ": isoDateString, // Updated format
                        "City": companyCity,
                        "State": companyState,
                        "Company Address": cAddress,
                        'Director Name(First)': directorNameFirstModify,
                        'Director Number(First)': directorNumberFirstModify,
                        'Director Email(First)': directorEmailFirstModify,
                        'Director Name(Second)': directorNameSecondModify,
                        'Director Number(Second)': directorNumberSecondModify,
                        'Director Email(Second)': directorEmailSecondModify,
                        'Director Name(Third)': directorNameThirdModify,
                        'Director Number(Third)': directorNumberThirdModify,
                        'Director Email(Third)': directorEmailThirdModify,
                        "UploadedBy": adminName ? adminName : "Admin"
                    };

                    if (isUpdateMode) {
                        await axios.put(`${secretKey}/company-data/leads/${selectedDataId}`, dataToSendUpdated);
                        Swal.fire({
                            title: "Data Updated!",
                            text: "You have successfully updated the name!",
                            icon: "success",
                        });
                    }

                    // Reset the form and any error messages
                    setIsUpdateMode(false);
                    fetchData(1)
                    functioncloseModifyPopup();
                } else {
                    // Date string couldn't be parsed into a valid Date object
                    console.error("Invalid Company Incorporation Date string:", companyIncoDate);
                }
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong!",
            });
            console.error("Internal server error", error);
        }
    };

    //-----------------------function to open popup remarks--------------------------------
    
    const functionopenpopupremarks = (companyID, companyStatus) => {
        openchangeRemarks(true);
        setFilteredRemarks(
            remarksHistory.filter((obj) => obj.companyID === companyID)
        );
        // console.log(remarksHistory.filter((obj) => obj.companyID === companyID))

        setcid(companyID);
        setCstat(companyStatus);
    };
    const closepopupRemarks = () => {
        openchangeRemarks(false);
        setFilteredRemarks([]);
    };

    const dataManagerName = localStorage.getItem("dataManagerName");
    return (
        <div>
          <Header name={dataManagerName} />
      <Navbar name={dataManagerName} />
            <div className='page-wrapper'>
                <div page-header d-print-none>
                    <div className="container-xl d-flex" style={{ gap: "20px" }}>
                        <div class="d-grid gap-4 d-md-block mt-3">
                            <button class="btn btn-primary mr-1" type="button" onClick={data.length === '0' ? Swal.fire('Please import some data first !') : () => setOpenAddLeadsDialog(true)}><span><TiUserAddOutline style={{ marginRight: "7px", height: "16.5px", width: "16.5px", marginBottom: "2px" }} /></span>Add Leads</button>
                            <div class="btn-group" role="group" aria-label="Basic example" style={{ height: "39px" }}>
                                <button type="button" class="btn"><span><IoFilterOutline style={{ marginRight: "7px" }} /></span>Filter</button>
                               
                                <button type="button" class="btn" onClick={() => setOpenAssignLeadsDialog(true)}><span><MdOutlinePostAdd style={{ marginRight: "7px", height: "20px", width: "16px", opacity: "0.6" }} /></span>Assign Leads</button>
                               
                            </div>
                        </div>
                        <div className='w-25'>
                            <input
                                type="text"
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    handleFilterSearch(e.target.value)
                                    //setCurrentPage(0);
                                }}
                                className="form-control"
                                placeholder="Search…"
                                aria-label="Search in website"
                            />
                        </div>
                    </div>
                </div>
                <div className="page-body">
                    <div className="container-xl">
                        <div class="card-header  my-tab">
                            <ul
                                class="nav nav-tabs card-header-tabs nav-fill p-0"
                                data-bs-toggle="tabs"
                            >
                                <li class="nav-item data-heading">
                                    <a
                                        href="#tabs-home-5"
                                        className={
                                            dataStatus === "Unassigned"
                                                ? "nav-link active item-act"
                                                : "nav-link"
                                        }
                                        data-bs-toggle="tab"
                                        onClick={() => {
                                            setDataStatus("Unassigned")
                                            setCurrentPage(1)
                                        }}
                                    >
                                        UnAssigned
                                        <span className="no_badge">
                                            {totalCompaniesUnassigned}
                                        </span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a
                                        href="#tabs-home-5"
                                        className={
                                            dataStatus === "Assigned"
                                                ? "nav-link active item-act"
                                                : "nav-link"
                                        }
                                        data-bs-toggle="tab"
                                        onClick={() => {
                                            setDataStatus("Assigned")
                                            setCurrentPage(1)
                                        }}>
                                        Assigned
                                        <span className="no_badge">
                                            {totalCompaniesAssigned}
                                        </span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="card">
                            <div className="card-body p-0">
                                <div
                                    id="table-default"
                                    style={{
                                        overflowX: "auto",
                                        overflowY: "auto",
                                        maxHeight: "60vh",
                                    }}
                                >
                                    <table
                                        style={{
                                            width: "100%",
                                            borderCollapse: "collapse",
                                            border: "1px solid #ddd",
                                        }}
                                        className="table-vcenter table-nowrap "
                                    >
                                        <thead>
                                            <tr className="tr-sticky">
                                                <th>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.length === allIds.length && selectedRows.length !== 0}
                                                        onChange={() => handleCheckboxChange("all")}
                                                        defaultChecked={false}
                                                    />
                                                </th>
                                                <th>Sr.No</th>
                                                <th>Company Name</th>
                                                <th>Company Number</th>

                                                <th>
                                                    Incorporation Date
                                                    {/* <FilterListIcon
                                                    style={{
                                                        height: "14px",
                                                        width: "14px",
                                                        cursor: "pointer",
                                                        marginLeft: "4px",
                                                    }}
                                                    onClick={handleFilterIncoDate}
                                                /> */}
                                                    {/* {openIncoDate && <div className="inco-filter">
                                                    <div

                                                        className="inco-subFilter"
                                                        onClick={(e) => handleSort("oldest")}
                                                    >
                                                        <SwapVertIcon style={{ height: "14px" }} />
                                                        Oldest
                                                    </div>

                                                    <div
                                                        className="inco-subFilter"
                                                        onClick={(e) => handleSort("newest")}
                                                    >
                                                        <SwapVertIcon style={{ height: "14px" }} />
                                                        Newest
                                                    </div>

                                                    <div
                                                        className="inco-subFilter"
                                                        onClick={(e) => handleSort("none")}
                                                    >
                                                        <SwapVertIcon style={{ height: "14px" }} />
                                                        None
                                                    </div>
                                                </div>} */}
                                                </th>
                                                <th>City</th>
                                                <th>State</th>
                                                <th>Company Email</th>
                                                <th>Status</th>
                                                {dataStatus !== "Unassigned" && <th>Remarks</th>}

                                                <th>Uploaded By</th>
                                                {dataStatus !== "Unassigned" && <th>Assigned to</th>}

                                                <th>
                                                    {dataStatus !== "Unassigned" ? "Assigned On" : "Uploaded On"}

                                                </th>
                                                {/* <th>Assigned On</th> */}
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        {currentDataLoading ? (
                                            <tbody>
                                                <tr>
                                                    <td colSpan="13" className="LoaderTDSatyle">
                                                        <ClipLoader
                                                            color="lightgrey"
                                                            loading
                                                            size={30}
                                                            aria-label="Loading Spinner"
                                                            data-testid="loader"
                                                        />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        ) : (
                                            <tbody>
                                                {data.map((company, index) => (
                                                    <tr
                                                        key={index}
                                                        className={selectedRows.includes(company._id) ? "selected" : ""}
                                                        style={{ border: "1px solid #ddd" }}
                                                    >
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedRows.includes(company._id)}
                                                                onChange={() => handleCheckboxChange(company._id)}
                                                                onMouseDown={() => handleMouseDown(company._id)}
                                                                onMouseEnter={() => handleMouseEnter(company._id)}
                                                                onMouseUp={handleMouseUp}
                                                            />
                                                        </td>
                                                        <td>{startIndex - 500 + index + 1}</td>
                                                        <td>{company["Company Name"]}</td>
                                                        <td>{company["Company Number"]}</td>
                                                        <td>{formatDateFinal(company["Company Incorporation Date  "])}</td>
                                                        <td>{company["City"]}</td>
                                                        <td>{company["State"]}</td>
                                                        <td>{company["Company Email"]}</td>
                                                        <td>{company["Status"]}</td>
                                                        {dataStatus !== "Unassigned" && <td >
                                                            <div style={{ width: "100px" }} className="d-flex align-items-center justify-content-between">
                                                                <p className="rematkText text-wrap m-0">
                                                                    {company["Remarks"]}{" "}
                                                                </p>
                                                                <div
                                                                    onClick={() => {
                                                                        functionopenpopupremarks(company._id, company.Status);
                                                                    }} 
                                                                    style={{ cursor: "pointer" }}>
                                                                    <IconEye

                                                                        style={{
                                                                            width: "14px",
                                                                            height: "14px",
                                                                            color: "#d6a10c",
                                                                            cursor: "pointer",
                                                                            marginLeft: "4px",
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>}
                                                        <td>{company["UploadedBy"] ? company["UploadedBy"] : "-"}</td>
                                                        {dataStatus !== "Unassigned" && <td>{company["ename"]}</td>}
                                                        <td>{formatDateFinal(company["AssignDate"])}</td>
                                                        <td>
                                                        
                                                            <button
                                                                style={{
                                                                    border: " 0px transparent",
                                                                    background: " none"
                                                                }}
                                                                onClick={
                                                                    data.length === "0"
                                                                        ? Swal.fire("Please Import Some data first")
                                                                        : () => {
                                                                            setOpenLeadsModifyPopUp(true);
                                                                            handleUpdateClick(company._id);
                                                                        }
                                                                }>
                                                                < MdOutlineEdit
                                                                    style={{
                                                                        width: "14px",
                                                                        height: "14px",
                                                                        color: "grey",
                                                                    }}
                                                                />

                                                            </button>
                                                            <Link to={`/datamanager/leads/${company._id}`}>
                                                                <button
                                                                    style={{
                                                                        border: " 0px transparent",
                                                                        background: " none"
                                                                    }}>
                                                                    <IconEye
                                                                        style={{
                                                                            width: "14px",
                                                                            height: "14px",
                                                                            color: "#d6a10c",
                                                                            cursor: "pointer",
                                                                        }}
                                                                    />
                                                                </button>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        )}
                                    </table>
                                </div>
                            </div>
                            {data.length === 0 && !currentDataLoading &&
                                (
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td colSpan="13" className="p-2 particular">
                                                    <Nodata />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                )}
                            {data.length !== 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between", margin: "10px" }} className="pagination">
                                    <IconButton onClick={handlePreviousPage} disabled={currentPage === 1}>
                                        <IconChevronLeft />
                                    </IconButton>
                                    <span>Page {currentPage} /{totalCount}</span>
                                    <IconButton onClick={handleNextPage} disabled={data.length < itemsPerPage}>
                                        <IconChevronRight />
                                    </IconButton>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* -------------------- dialog to add leads---------------------------- */}
            <Dialog open={openAddLeadsDialog} onClose={closeAddLeadsDialog} fullWidth maxWidth="md">
                <DialogTitle>
                    Company Info{" "}
                    <button style={{ background: "none", border: "0px transparent",float:"right" }} onClick={closeAddLeadsDialog} >
                    <IoIosClose style={{
                                height: "36px",
                                width: "32px",
                                color: "grey"
                            }} />
                    </button>
                </DialogTitle>
                <DialogContent>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Company Name <span style={{ color: "red" }}>*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="example-text-input"
                                                placeholder="Your Company Name"
                                                onChange={(e) => {
                                                    setCname(e.target.value);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Company Number <span style={{ color: "red" }}>*</span></label>
                                            <input
                                                type="number"
                                                placeholder="Enter Company's Phone No."
                                                onChange={(e) => {
                                                    if (/^\d{10}$/.test(e.target.value)) {
                                                        setCnumber(e.target.value);
                                                        setError('');
                                                    } else {
                                                        setError('Please enter a 10-digit number');
                                                        setCnumber()
                                                    }
                                                }}
                                                className="form-control"
                                            />
                                            {error && <p style={{ color: 'red' }}>{error}</p>}
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Company Email <span style={{ color: "red" }}>*</span></label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="example-text-input"
                                                placeholder="example@gmail.com"
                                                onChange={(e) => {
                                                    setCemail(e.target.value);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-4">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Company Incorporation Date
                                            </label>
                                            <input
                                                onChange={(e) => {
                                                    setCidate(e.target.value);
                                                }}
                                                type="date"
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-4">
                                        <div className="mb-3">
                                            <label className="form-label">City<span style={{ color: "red" }}>*</span></label>
                                            <input
                                                onChange={(e) => {
                                                    setCity(e.target.value);
                                                }}
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter Your City"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-4">
                                        <div className="mb-3">
                                            <label className="form-label">State<span style={{ color: "red" }}>*</span></label>
                                            <input
                                                onChange={(e) => {
                                                    setState(e.target.value);
                                                }}
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter Your State"
                                            //disabled={!isEditProjection}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="mb-3">
                                            <label className="form-label">Company Address</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="example-text-input"
                                                placeholder="Enter Your Address"
                                                onChange={(e) => {
                                                    setCompanyAddress(e.target.value);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Director's Name(First)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="example-text-input"
                                                placeholder="Your Company Name"
                                                onChange={(e) => {
                                                    setDirectorNameFirst(e.target.value);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Director's Number(First)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="example-text-input"
                                                placeholder="Enter Phone No."
                                                onChange={(e) => {
                                                    if (/^\d{10}$/.test(e.target.value)) {
                                                        setDirectorNumberFirst(e.target.value)
                                                        setErrorDirectorNumberFirst("")
                                                    } else {
                                                        setErrorDirectorNumberFirst('Please Enter 10 digit Number')
                                                        setDirectorNumberFirst()
                                                    }
                                                }}
                                            />
                                            {errorDirectorNumberFirst && <p style={{ color: 'red' }}>{errorDirectorNumberFirst}</p>}
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Director's Email(First)</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="example-text-input"
                                                placeholder="example@gmail.com"
                                                onChange={(e) => {
                                                    setDirectorEmailFirst(e.target.value);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {firstPlus && (<div className="d-flex align-items-center justify-content-end gap-2">
                                    <button
                                        onClick={() => { functionOpenSecondDirector() }}
                                        className="btn btn-primary d-none d-sm-inline-block">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="icon"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            stroke-width="2"
                                            stroke="currentColor"
                                            fill="none"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M12 5l0 14" />
                                            <path d="M5 12l14 0" />
                                        </svg>
                                    </button>
                                    <button className="btn btn-primary d-none d-sm-inline-block">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="icon"
                                            width="24"
                                            height="24"
                                            fill="white" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" /></svg>
                                    </button></div>)}

                                {openSecondDirector && (
                                    <div className="row">
                                        <div className="col-4">
                                            <div className="mb-3">
                                                <label className="form-label">Director's Name(Second)</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="example-text-input"
                                                    placeholder="Your Company Name"
                                                    onChange={(e) => {
                                                        setDirectorNameSecond(e.target.value);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="mb-3">
                                                <label className="form-label">Director's Number(Second)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="example-text-input"
                                                    placeholder="Enter Phone No."
                                                    onChange={(e) => {
                                                        if (/^\d{10}$/.test(e.target.value)) {
                                                            setDirectorNumberSecond(e.target.value)
                                                            setErrorDirectorNumberSecond("")
                                                        } else {
                                                            setErrorDirectorNumberSecond('Please Enter 10 digit Number')
                                                            setDirectorNumberSecond()
                                                        }
                                                    }}
                                                />
                                                {errorDirectorNumberSecond && <p style={{ color: 'red' }}>{errorDirectorNumberSecond}</p>}
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="mb-3">
                                                <label className="form-label">Director's Email(Second)</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="example-text-input"
                                                    placeholder="example@gmail.com"
                                                    onChange={(e) => {
                                                        setDirectorEmailSecond(e.target.value);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>)}
                                {secondPlus && (<div className="d-flex align-items-center justify-content-end gap-2">
                                    <button
                                        onClick={() => { functionOpenThirdDirector() }}
                                        className="btn btn-primary d-none d-sm-inline-block">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="icon"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            stroke-width="2"
                                            stroke="currentColor"
                                            fill="none"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M12 5l0 14" />
                                            <path d="M5 12l14 0" />
                                        </svg>
                                    </button>
                                    <button className="btn btn-primary d-none d-sm-inline-block"
                                        onClick={() => { functionCloseSecondDirector() }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="icon"
                                            width="24"
                                            height="24"
                                            fill="white" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" /></svg>
                                    </button></div>)}

                                {openThirdDirector && (<div className="row">
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Director's Name(Third)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="example-text-input"
                                                placeholder="Your Company Name"
                                                onChange={(e) => {
                                                    setDirectorNameThird(e.target.value);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Director's Number(Third)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="example-text-input"
                                                placeholder="Enter Phone No"
                                                onChange={(e) => {
                                                    if (/^\d{10}$/.test(e.target.value)) {
                                                        setDirectorNumberThird(e.target.value)
                                                        setErrorDirectorNumberThird("")
                                                    } else {
                                                        setErrorDirectorNumberThird('Please Enter 10 digit Number')
                                                        setDirectorNumberThird()
                                                    }
                                                }}
                                            />
                                            {errorDirectorNumberThird && <p style={{ color: 'red' }}>{errorDirectorNumberThird}</p>}
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Director's Email(Third)</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="example-text-input"
                                                placeholder="example@gmail.com"
                                                onChange={(e) => {
                                                    setDirectorEmailThird(e.target.value);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>)}
                                {openThirdMinus && (<button className="btn btn-primary d-none d-sm-inline-block" style={{ float: "right" }}
                                    onClick={() => { functionCloseThirdDirector() }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon"
                                        width="24"
                                        height="24"
                                        fill="white" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" /></svg>
                                </button>)}
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <button className="btn btn-primary"
                    onClick={handleSubmitData}
                >
                    Submit
                </button>
            </Dialog>

            {/* ------------------------ dialog to add bulk leads as csv---------------- */}
            <Dialog open={openBulkLeadsCSVPopup} onClose={closeBulkLeadsCSVPopup} fullWidth maxWidth="sm">
                <DialogTitle>
                    Import CSV DATA{" "}
                    <button style={{ background: "none", border: "0px transparent",float:"right" }} onClick={closeBulkLeadsCSVPopup}>
                    <IoIosClose style={{
                                height: "36px",
                                width: "32px",
                                color: "grey"
                            }} />
                    </button>
                </DialogTitle>
                <DialogContent>
                    <div className="maincon">
                        <div
                            style={{ justifyContent: "space-between" }}
                            className="con1 d-flex"
                        >
                            <div style={{ paddingTop: "9px" }} className="uploadcsv">
                                <label
                                    style={{ margin: "0px 0px 6px 0px" }}
                                    htmlFor="upload"
                                >
                                    Upload CSV File
                                </label>
                            </div>
                            <a href={frontendKey + "/AddLeads_AdminSample.xlsx"} download>
                                Download Sample
                            </a>
                        </div>
                        <div
                            style={{ margin: "5px 0px 0px 0px" }}
                            className="form-control"
                        >
                            <input
                                type="file"
                                name="csvfile
                      "
                                id="csvfile"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="con2 d-flex">
                            <div
                                style={
                                    selectedOption === "direct"
                                        ? {
                                            backgroundColor: "#e9eae9",
                                            margin: "10px 10px 0px 0px",
                                            cursor: "pointer",
                                        }
                                        : {
                                            backgroundColor: "white",
                                            margin: "10px 10px 0px 0px",
                                            cursor: "pointer",
                                        }
                                }
                                onClick={() => {
                                    setSelectedOption("direct");
                                }}
                                className="direct form-control"
                            >
                                <input
                                    type="radio"
                                    id="direct"
                                    value="direct"
                                    style={{
                                        display: "none",
                                    }}
                                    checked={selectedOption === "direct"}
                                    onChange={handleOptionChange}
                                />
                                <label htmlFor="direct">Upload To General</label>
                            </div>
                            <div
                                style={
                                    selectedOption === "someoneElse"
                                        ? {
                                            backgroundColor: "#e9eae9",
                                            margin: "10px 0px 0px 0px",
                                            cursor: "pointer",
                                        }
                                        : {
                                            backgroundColor: "white",
                                            margin: "10px 0px 0px 0px",
                                            cursor: "pointer",
                                        }
                                }
                                className="indirect form-control"
                                onClick={() => {
                                    setSelectedOption("someoneElse");
                                }}
                            >
                                <input
                                    type="radio"
                                    id="someoneElse"
                                    value="someoneElse"
                                    style={{
                                        display: "none",
                                    }}
                                    checked={selectedOption === "someoneElse"}
                                    onChange={handleOptionChange}
                                />
                                <label htmlFor="someoneElse">Assign to Employee</label>
                            </div>
                        </div>
                    </div>
                    {selectedOption === "someoneElse" && (
                        <div>
                            {empData.length !== 0 ? (
                                <>
                                    <div className="dialogAssign">
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "space-between",
                                                margin: " 10px 0px 0px 0px",
                                            }}
                                            className="selector"
                                        >
                                            <label>Select an Employee</label>
                                            <div className="form-control">
                                                <select
                                                    style={{
                                                        width: "inherit",
                                                        border: "none",
                                                        outline: "none",
                                                    }}
                                                    value={newemployeeSelection}
                                                    onChange={(e) => {
                                                        setnewEmployeeSelection(e.target.value);
                                                    }}
                                                >
                                                    <option value="Not Alloted" disabled>
                                                        Select employee
                                                    </option>
                                                    {empData.map((item) => (
                                                        <option value={item.ename}>{item.ename}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <h1>No Employees Found</h1>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
                <button className="btn btn-primary" onClick={handleUploadData}>
                    Submit
                </button>
            </Dialog>

            {/* ----------------------- dialog to assign leads to employees ----------------------------- */}
            <Dialog open={openAssignLeadsDialog} onClose={closeAssignLeadsDialog} fullWidth maxWidth="sm">
                <DialogTitle>
                    Assign Data{" "}
                    <button style={{ background: "none", border: "0px transparent",float:"right" }} onClick={closeAssignLeadsDialog}>
                    <IoIosClose style={{
                                height: "36px",
                                width: "32px",
                                color: "grey"
                            }} />
                    </button>
                </DialogTitle>
                <DialogContent>
                    <div>
                        {empData.length !== 0 ? (
                            <>
                                <div className="dialogAssign">
                                    <div className="selector form-control">
                                        <select
                                            style={{
                                                width: "inherit",
                                                border: "none",
                                                outline: "none",
                                            }}
                                            value={employeeSelection}
                                            onChange={(e) => {
                                                setEmployeeSelection(e.target.value);
                                            }}
                                        >
                                            <option value="Not Alloted" disabled>
                                                Select employee
                                            </option>
                                            {empData.map((item) => (
                                                <option value={item.ename}>{item.ename}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div>
                                <h1>No Employees Found</h1>
                            </div>
                        )}
                    </div>
                </DialogContent>
                <div className="btn-list">
                    <button
                        style={{ width: "100vw", borderRadius: "0px" }}
                        onClick={handleconfirmAssign}
                        className="btn btn-primary ms-auto"
                    >
                        Assign Data
                    </button>
                </div>
            </Dialog>
            {/* ------------------------------------------------------------dialog for modify leads----------------------------------------------- */}


            <Dialog open={openLeadsModifyPopUp} onClose={functioncloseModifyPopup} fullWidth maxWidth="md">
                <DialogTitle className="d-flex align-items-center justify-content-between">
                    <div>
                        Company Info{" "}
                    </div>
                    <div>
                        <button style={{ background: "none", border: "0px transparent" }}
                            onClick={() => { setIsEditProjection(true) }}>
                            <MdOutlineEdit
                                style={{
                                    width: "20px",
                                    height: "20px",
                                    color: "grey"
                                }}
                            />
                        </button>
                        <button style={{ background: "none", border: "0px transparent" }}
                            onClick={functioncloseModifyPopup}>
                            <IoIosClose style={{
                                height: "36px",
                                width: "32px",
                                color: "grey"
                            }} />
                        </button>{" "}
                    </div>

                </DialogTitle>
                <DialogContent>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Company Name <span style={{ color: "red" }}>*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="example-text-input"
                                                placeholder="Your Company Name"
                                                value={companyName}
                                                onChange={(e) => {
                                                    setCompanyName(e.target.value);
                                                }}
                                                disabled={!isEditProjection}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Company Number <span style={{ color: "red" }}>*</span></label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="example-text-input"
                                                placeholder="Your Company Number"
                                                value={companynumber}
                                                onChange={(e) => {
                                                    if (/^\d{10}$/.test(e.target.value)) {
                                                        setCompnayNumber(e.target.value);
                                                        setErrorCompnayNumber('');
                                                    } else {
                                                        setError('Please enter a 10-digit number');
                                                        setCompnayNumber()
                                                    }
                                                }}
                                                disabled={!isEditProjection}
                                            />
                                            {errorCompnayNumber && <p style={{ color: 'red' }}>{errorCompnayNumber}</p>}
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Company Email <span style={{ color: "red" }}>*</span></label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="example-text-input"
                                                placeholder="example@gmail.com"
                                                value={companyEmail}
                                                onChange={(e) => {
                                                    setCompanyEmail(e.target.value);
                                                }}
                                                disabled={!isEditProjection}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-4">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Company Incorporation Date
                                            </label>
                                            <input
                                                value={companyIncoDate}
                                                onChange={(e) => {
                                                    setCompanyIncoDate(e.target.value)
                                                }}
                                                type="date"
                                                className="form-control"
                                                disabled={!isEditProjection}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-4">
                                        <div className="mb-3">
                                            <label className="form-label">City<span style={{ color: "red" }}>*</span></label>
                                            <input
                                                value={companyCity}
                                                onChange={(e) => {
                                                    setCompnayCity(e.target.value);
                                                }}
                                                type="text"
                                                className="form-control"
                                                disabled={!isEditProjection}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-4">
                                        <div className="mb-3">
                                            <label className="form-label">State<span style={{ color: "red" }}>*</span></label>
                                            <input
                                                value={companyState}
                                                onChange={(e) => {
                                                    setCompnayState(e.target.value);
                                                }}
                                                type="text"
                                                className="form-control"
                                                disabled={!isEditProjection}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="mb-3">
                                            <label className="form-label">Company Address</label>
                                            <input
                                                value={cAddress}
                                                onChange={(e) => {
                                                    setCAddress(e.target.value);
                                                }}
                                                type="text"
                                                className="form-control"
                                                disabled={!isEditProjection}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Director's Name(First)</label>
                                            <input
                                                value={directorNameFirstModify}
                                                onChange={(e) => {
                                                    setDirectorNameFirstModify(e.target.value);
                                                }}
                                                type="text"
                                                className="form-control"
                                                disabled={!isEditProjection}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Director's Number(First)</label>
                                            <input
                                                value={directorNumberFirstModify}
                                                onChange={(e) => {
                                                    if (/^\d{10}$/.test(e.target.value)) {
                                                        setDirectorNumberFirstModify(e.target.value)
                                                        setErrorDirectorNumberFirstModify("")
                                                    } else {
                                                        setErrorDirectorNumberFirstModify('Please Enter 10 digit Number')
                                                        setDirectorNumberFirstModify()
                                                    }
                                                }}
                                                type="number"
                                                className="form-control"
                                                disabled={!isEditProjection}
                                            />
                                            {errorDirectorNumberFirst && <p style={{ color: 'red' }}>{errorDirectorNumberFirst}</p>}
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Director's Email(First)</label>
                                            <input
                                                value={directorEmailFirstModify}
                                                onChange={(e) => {
                                                    setDirectorEmailFirstModify(e.target.value);
                                                }}
                                                type="email"
                                                className="form-control"
                                                disabled={!isEditProjection}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {firstPlus && (<div className="d-flex align-items-center justify-content-end gap-2">
                                    <button
                                        onClick={() => { functionOpenSecondDirector() }}
                                        className="btn btn-primary d-none d-sm-inline-block">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="icon"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            stroke-width="2"
                                            stroke="currentColor"
                                            fill="none"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M12 5l0 14" />
                                            <path d="M5 12l14 0" />
                                        </svg>
                                    </button>
                                    <button className="btn btn-primary d-none d-sm-inline-block">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="icon"
                                            width="24"
                                            height="24"
                                            fill="white" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" /></svg>
                                    </button></div>)}

                                {openSecondDirector && (
                                    <div className="row">
                                        <div className="col-4">
                                            <div className="mb-3">
                                                <label className="form-label">Director's Name(Second)</label>
                                                <input
                                                    value={directorNameSecondModify}
                                                    onChange={(e) => {
                                                        setDirectorNameSecondModify(e.target.value);
                                                    }}
                                                    type="text"
                                                    className="form-control"
                                                    disabled={!isEditProjection}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="mb-3">
                                                <label className="form-label">Director's Number(Second)</label>
                                                <input
                                                    value={directorNumberSecondModify}
                                                    onChange={(e) => {
                                                        if (/^\d{10}$/.test(e.target.value)) {
                                                            setDirectorNumberSecondModify(e.target.value)
                                                            setErrorDirectorNumberSecondModify("")
                                                        } else {
                                                            setErrorDirectorNumberSecondModify('Please Enter 10 digit Number')
                                                            setDirectorNumberSecondModify()
                                                        }
                                                    }}
                                                    type="number"
                                                    className="form-control"
                                                    disabled={!isEditProjection}
                                                />
                                                {errorDirectorNumberSecondModify && <p style={{ color: 'red' }}>{errorDirectorNumberSecondModify}</p>}
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="mb-3">
                                                <label className="form-label">Director's Email(Second)</label>
                                                <input
                                                    value={directorEmailSecondModify}
                                                    onChange={(e) => {
                                                        setDirectorEmailSecondModify(e.target.value);
                                                    }}
                                                    type="email"
                                                    className="form-control"
                                                    disabled={!isEditProjection}
                                                />
                                            </div>
                                        </div>
                                    </div>)}
                                {secondPlus && (<div className="d-flex align-items-center justify-content-end gap-2">
                                    <button
                                        //onClick={() => { functionOpenThirdDirector() }}
                                        className="btn btn-primary d-none d-sm-inline-block">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="icon"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            stroke-width="2"
                                            stroke="currentColor"
                                            fill="none"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M12 5l0 14" />
                                            <path d="M5 12l14 0" />
                                        </svg>
                                    </button>
                                    <button className="btn btn-primary d-none d-sm-inline-block" onClick={() => { functionCloseSecondDirector() }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="icon"
                                            width="24"
                                            height="24"
                                            fill="white" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" /></svg>
                                    </button></div>)}

                                {openThirdDirector && (<div className="row">
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Director's Name(Third)</label>
                                            <input
                                                value={directorNameThirdModify}
                                                onChange={(e) => {
                                                    setDirectorNameThirdModify(e.target.value);
                                                }}
                                                type="text"
                                                className="form-control"
                                                disabled={!isEditProjection}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Director's Number(Third)</label>
                                            <input
                                                value={directorNumberThirdModify}
                                                onChange={(e) => {
                                                    if (/^\d{10}$/.test(e.target.value)) {
                                                        setDirectorNumberThirdModify(e.target.value)
                                                        setErrorDirectorNumberThirdModify("")
                                                    } else {
                                                        setErrorDirectorNumberThirdModify('Please Enter 10 digit Number')
                                                        setDirectorNumberThirdModify()
                                                    }
                                                }}
                                                type="number"
                                                className="form-control"
                                                disabled={!isEditProjection}
                                            />
                                            {errorDirectorNumberThirdModify && <p style={{ color: 'red' }}>{errorDirectorNumberThirdModify}</p>}
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="mb-3">
                                            <label className="form-label">Director's Email(Third)</label>
                                            <input
                                                value={directorEmailThirdModify}
                                                onChange={(e) => {
                                                    setDirectorEmailThirdModify(e.target.value);
                                                }}
                                                type="email"
                                                className="form-control"
                                                disabled={!isEditProjection}
                                            />
                                        </div>
                                    </div>
                                </div>)}
                                {openThirdMinus && (<button className="btn btn-primary d-none d-sm-inline-block" style={{ float: "right" }} onClick={() => { functionCloseThirdDirector() }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon"
                                        width="24"
                                        height="24"
                                        fill="white" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" /></svg>
                                </button>)}
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <button className="btn btn-primary"
                    onClick={handleSubmit}
                >
                    Submit
                </button>
            </Dialog>
            {/* //----------------------------dialog to view remarks popup------------------------- */}

            <Dialog
                open={openRemarks}
                onClose={closepopupRemarks}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Remarks
                    <button style={{ background: "none", border: "0px transparent",float:"right" }} 
                    onClick={closepopupRemarks}>
                    <IoIosClose style={{
                                height: "36px",
                                width: "32px",
                                color: "grey"
                            }} />
                    </button>
                </DialogTitle>
                <DialogContent>
                    <div className="remarks-content">
                        {filteredRemarks.length !== 0 ? (
                            filteredRemarks
                                .slice()
                                .reverse()
                                .map((historyItem) => (
                                    <div className="col-sm-12" key={historyItem._id}>
                                        <div className="card RemarkCard position-relative">
                                            <div className="d-flex justify-content-between">
                                                <div className="reamrk-card-innerText">
                                                    <pre>{historyItem.remarks}</pre>
                                                </div>
                                            </div>

                                            <div className="d-flex card-dateTime justify-content-between">
                                                <div className="date">{historyItem.date}</div>
                                                <div className="time">{historyItem.time}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div className="text-center overflow-hidden">
                                No Remarks History
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>


        </div>
    )
}

export default ManageLeads