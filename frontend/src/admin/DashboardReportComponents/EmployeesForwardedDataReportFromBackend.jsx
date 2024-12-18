import React, { useState, useEffect } from 'react';
import Calendar from "@mui/icons-material/Event";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { SingleInputDateRangeField } from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import moment from "moment";
import { StaticDateRangePicker } from "@mui/x-date-pickers-pro/StaticDateRangePicker";
import dayjs from "dayjs";
import axios from "axios";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ClipLoader from "react-spinners/ClipLoader";
import Nodata from '../../components/Nodata';


function EmployeesForwardedDataReportFromBackend() {

    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;

    const [newSortType, setNewSortType] = useState({
        forwardedcase: "none",
        receivedcase: "none",
        forwardedprojectioncase: "none",
        receivedprojectioncase: "none",
        maturedcase: "none",
        generatedrevenue: "none",
    });

    const [isLoading, setIsLoading] = useState(true);
    const [backendData, setBackendData] = useState([]);
    const [employeeStats, setEmployeeStats] = useState({});
    const [followUpLeads, setFollowUpLeads] = useState([]);
    const [employeeTotalAmount, setEmployeeTotalAmount] = useState({});
    const [maturedCaseData, setMaturedCaseData] = useState([]);
    const [maturedTotals, setMaturedTotals] = useState({});
    const [selectedBranch, setSelectedBranch] = useState(''); // State for selected branch
    const [searchFromName, setSearchFromName] = useState(''); // State for search from name
    const [employeeName, setEmployeeName] = useState([]);   // State for employee name
    const [allEmployees, setAllEmployees] = useState([]); // To store all employee names for the dropdown
    const [filteredEmployeeStats, setFilteredEmployeeStats] = useState([]);
    const [originalFilteredData, setOriginalFilteredData] = useState([]);

    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };
    
    const formatSalary = (amount) => {
        return new Intl.NumberFormat('en-IN').format(amount);
    };

    const handleExportBookings = async () => {
        try {
            // Prepare the data for export
            const exportData = filteredEmployeeStats.map(([name, stats], index) => {
                const projectionData = employeeTotalAmount[name] || { forwardedProjection: 0, receivedProjection: 0 };
                const maturedData = maturedTotals[name] || { maturedCases: 0, generatedRevenue: 0 };

                return {
                    SrNo: index + 1,
                    employeeName: name,
                    branchOffice: stats.branchOffice,
                    ForwardedCases: stats.forwarded || 0,
                    ReceivedCases: stats.received || 0,
                    ForwardedCaseProjection: projectionData.forwardedProjection,
                    ReceivedCaseProjection: projectionData.receivedProjection,
                    MaturedCases: maturedData.maturedCases,
                    GeneratedRevenue: maturedData.generatedRevenue,
                };
            });

            // Convert to CSV format
            const csvContent = [
                ["SrNo", "Employee Name", "Branch Office", "Forwarded Cases", "Received Cases", "Forwarded Case Projection", "Received Case Projection", "Matured Cases", "Generated Revenue"],
                ...exportData.map(item => [
                    item.SrNo,
                    item.employeeName,
                    item.branchOffice,
                    item.ForwardedCases,
                    item.ReceivedCases,
                    item.ForwardedCaseProjection,
                    item.ReceivedCaseProjection,
                    item.MaturedCases,
                    item.GeneratedRevenue,
                ]),
            ].map(e => e.join(",")).join("\n");

            // Create a Blob from the CSV content
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "ForwardedData.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); // Clean up
        } catch (error) {
            console.error("Error exporting bookings:", error);
        }
    };

    const shortcutsItems = [
        {
            label: "This Week",
            getValue: () => {
                const today = dayjs();
                return [today.startOf("week"), today.endOf("week")];
            },
        },
        {
            label: "Last Week",
            getValue: () => {
                const today = dayjs();
                const prevWeek = today.subtract(7, "day");
                return [prevWeek.startOf("week"), prevWeek.endOf("week")];
            },
        },
        {
            label: "Last 7 Days",
            getValue: () => {
                const today = dayjs();
                return [today.subtract(7, "day"), today];
            },
        },
        {
            label: "Current Month",
            getValue: () => {
                const today = dayjs();
                return [today.startOf("month"), today.endOf("month")];
            },
        },
        {
            label: "Next Month",
            getValue: () => {
                const today = dayjs();
                const startOfNextMonth = today.endOf("month").add(1, "day");
                return [startOfNextMonth, startOfNextMonth.endOf("month")];
            },
        },
        { label: "Reset", getValue: () => [null, null] },
    ];

    const fetchDataFromBackend = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(`${secretKey}/company-data/fetchForwardedLeads`);
            setBackendData(res.data);
            // console.log("Data from backend :", res.data);

            const stats = {};

            res.data.forEach(item => {
                const { name, forwardedCases, receivedCases, designation, branchOffice } = item;

                // Update forwarded cases for BDEs
                if (designation === "BDE") {
                    if (!stats[name]) {
                        stats[name] = { forwarded: 0, received: 0 };
                    }
                    stats[name].forwarded += forwardedCases;
                    stats[name].branchOffice = branchOffice;
                }

                // Update received cases for BDMs
                if (designation === "BDM") {
                    if (!stats[name]) {
                        stats[name] = { forwarded: 0, received: 0 };
                    }
                    stats[name].received += receivedCases;
                    stats[name].branchOffice = branchOffice;
                }
            });

            setEmployeeStats(stats);
            setAllEmployees(Object.keys(stats)); // Store all employee names for the dropdown
        } catch (error) {
            console.log("Error fetching data from backend :", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchForwardedLeadsData = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(`${secretKey}/company-data/fetchForwardedLeadsAmount`);
            setFollowUpLeads(res.data);
            // console.log("Follow up data from backend :", res.data);

            const totalAmountData = {};

            // Process each entry from the backend
            res.data.forEach((item) => {
                const { name, designation, totalAmount } = item;

                // Initialize the object for the employee if it doesn't exist
                if (!totalAmountData[name]) {
                    totalAmountData[name] = { forwardedProjection: 0, receivedProjection: 0 };
                }

                // Add the total amount to either forwarded or received projection
                if (designation === "BDE") {
                    totalAmountData[name].forwardedProjection += totalAmount;
                } else if (designation === "BDM") {
                    totalAmountData[name].receivedProjection += totalAmount;
                }
            });

            setEmployeeTotalAmount(totalAmountData);
        } catch (error) {
            console.log("Error fetching follow up data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchGeneraedTotalAmount = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(`${secretKey}/company-data/fetchMaturedCases`);
            setMaturedCaseData(res.data);
            // console.log("Matured cases are :", res.data);

            const totals = {};

            res.data.forEach(item => {
                const { ename, maturedCases, bdmName } = item;
                const { maturedCase, services } = maturedCases;

                // Initialize totals for the employee if not present
                if (!totals[ename]) {
                    totals[ename] = { maturedCases: 0, generatedRevenue: 0 };
                }

                if (bdmName && !totals[bdmName]) {
                    totals[bdmName] = { maturedCases: 0, generatedRevenue: 0 };
                }

                // Add matured case counts
                // totals[ename].maturedCases += maturedCase;

                // Ensure maturedCase is a number, default to 0 if it's NaN
                const maturedCaseCount = isNaN(maturedCase) ? 0 : maturedCase;
                totals[ename].maturedCases += maturedCaseCount;

                services.forEach(service => {
                    // const { generatedReceivedAmount } = service;
                    // Ensure generatedReceivedAmount is a number, default to 0 if it's NaN
                    const generatedAmount = isNaN(service.generatedReceivedAmount) ? 0 : service.generatedReceivedAmount;

                    // If maturedCase is 0.5, split the revenue between ename and bdmName
                    if (maturedCase === 0.5 && bdmName) {
                        // totals[ename].generatedRevenue += generatedReceivedAmount;
                        // totals[bdmName].generatedRevenue += generatedReceivedAmount;
                        totals[ename].generatedRevenue += generatedAmount;
                        totals[bdmName].generatedRevenue += generatedAmount;
                    } else {
                        // If maturedCase is 1, add full revenue to ename
                        // totals[ename].generatedRevenue += generatedReceivedAmount;
                        totals[ename].generatedRevenue += generatedAmount;
                    }
                });
            });

            setMaturedTotals(totals);
        } catch (error) {
            console.log("Error fetching generated total amount:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDataFromBackend();
        fetchForwardedLeadsData();
        fetchGeneraedTotalAmount();
    }, []);

    // Function to filter data based on the selected branch and search term
    const filterEmployeeStats = () => {
        const filteredStats = Object.entries(employeeStats).filter(([name, stats]) => {
            const matchesBranch = selectedBranch === "" || stats.branchOffice === selectedBranch;
            const matchesSearchTerm = searchFromName === "" || name.toLowerCase().includes(searchFromName.toLowerCase());
            const matchesSelectedEmployee = employeeName.length === 0 || employeeName.includes(name);
            return matchesBranch && matchesSearchTerm && matchesSelectedEmployee;
        });

        setFilteredEmployeeStats(filteredStats); // Update state with filtered data
        setOriginalFilteredData(filteredStats); // Store the original filtered data for restoring later
    };

    // Initialize totals for footer
    let totalForwardedCases = 0;
    let totalReceivedCases = 0;
    let totalForwardedProjection = 0;
    let totalReceivedProjection = 0;
    let totalMaturedCases = 0;
    let totalGeneratedRevenue = 0;

    // Sorting logic for 'Forwarded Cases'
    const handleSortForwardedCases = (sortType) => {
        if (sortType === "none") {
            setFilteredEmployeeStats([...originalFilteredData]); // Restore original filtered data
        } else {
            const sortedStats = [...filteredEmployeeStats]; // Create a copy to sort
            if (sortType === "ascending") {
                sortedStats.sort((a, b) => (a[1].forwarded || 0) - (b[1].forwarded || 0));
            } else if (sortType === "descending") {
                sortedStats.sort((a, b) => (b[1].forwarded || 0) - (a[1].forwarded || 0));
            }
            setFilteredEmployeeStats(sortedStats); // Update state with sorted data
        }
        // console.log("Sorted data :", sortedStats.map(item => item[1]));
    };

    const handleSortReceivedCases = (sortType) => {
        if (sortType === "none") {
            setFilteredEmployeeStats([...originalFilteredData]); // Restore original filtered data
        } else {
            const sortedStats = [...filteredEmployeeStats]; // Create a copy to sort
            if (sortType === "ascending") {
                sortedStats.sort((a, b) => (a[1].received || 0) - (b[1].received || 0));
            } else if (sortType === "descending") {
                sortedStats.sort((a, b) => (b[1].received || 0) - (a[1].received || 0));
            }
            setFilteredEmployeeStats(sortedStats); // Update state with sorted data
        }
        // console.log("Sorted data :", sortedStats.map(item => item[1]));
    };

    const handleSortForwardedProjectionCase = (sortOrder) => {
        if (sortOrder === 'none') {
            setFilteredEmployeeStats([...originalFilteredData]); // Restore original filtered data
        } else {
            const sortedData = [...filteredEmployeeStats].sort((a, b) => {
                const aName = a[0];
                const bName = b[0];
                const aValue = employeeTotalAmount[aName]?.forwardedProjection || 0;
                const bValue = employeeTotalAmount[bName]?.forwardedProjection || 0;

                if (sortOrder === 'ascending') {
                    return aValue - bValue;
                } else if (sortOrder === 'descending') {
                    return bValue - aValue;
                } else {
                    // Handle 'none' sorting (default order)
                    return 0;
                }
            });
            setFilteredEmployeeStats(sortedData);
        }
    };

    const handleSortReceivedProjectionCase = (sortOrder) => {
        if (sortOrder === 'none') {
            setFilteredEmployeeStats([...originalFilteredData]); // Restore original filtered data
        } else {
            const sortedData = [...filteredEmployeeStats].sort((a, b) => {
                const aName = a[0];
                const bName = b[0];
                const aValue = employeeTotalAmount[aName]?.receivedProjection || 0;
                const bValue = employeeTotalAmount[bName]?.receivedProjection || 0;

                if (sortOrder === 'ascending') {
                    return aValue - bValue;
                } else if (sortOrder === 'descending') {
                    return bValue - aValue;
                } else {
                    // Handle 'none' sorting (default order)
                    return 0;
                }
            });
            setFilteredEmployeeStats(sortedData);
        }
    };

    const handleSortMaturedCases = (sortOrder) => {
        if (sortOrder === 'none') {
            setFilteredEmployeeStats([...originalFilteredData]); // Restore original filtered data
        } else {
            const sortedData = [...filteredEmployeeStats].sort((a, b) => {
                const aName = a[0];
                const bName = b[0];
                const aValue = maturedTotals[aName]?.maturedCases || 0;
                const bValue = maturedTotals[bName]?.maturedCases || 0;

                if (sortOrder === 'ascending') {
                    return aValue - bValue;
                } else if (sortOrder === 'descending') {
                    return bValue - aValue;
                } else {
                    return 0;
                }
            });
            setFilteredEmployeeStats(sortedData);
        }
    };

    const handleSortGeneratedRevenue = (sortOrder) => {
        if (sortOrder === 'none') {
            setFilteredEmployeeStats([...originalFilteredData]); // Restore original filtered data
        } else {
            const sortedData = [...filteredEmployeeStats].sort((a, b) => {
                const aName = a[0];
                const bName = b[0];
                const aValue = maturedTotals[aName]?.generatedRevenue || 0;
                const bValue = maturedTotals[bName]?.generatedRevenue || 0;

                if (sortOrder === 'ascending') {
                    return aValue - bValue;
                } else if (sortOrder === 'descending') {
                    return bValue - aValue;
                } else {
                    return 0;
                }
            });
            setFilteredEmployeeStats(sortedData);
        }
    };

    // Sorting Handler for Forwarded Cases Column
    const handleColumnSort = (column) => {
        let updatedSortType;
        if (newSortType[column] === "ascending") {
            updatedSortType = "descending";
        } else if (newSortType[column] === "descending") {
            updatedSortType = "none";
        } else {
            updatedSortType = "ascending";
        }

        setNewSortType((prevData) => ({
            ...prevData,
            [column]: updatedSortType,
        }));

        if (column === 'forwardedcase') handleSortForwardedCases(updatedSortType);
        if (column === 'receivedcase') handleSortReceivedCases(updatedSortType);
        if (column === 'forwardedprojectioncase') handleSortForwardedProjectionCase(updatedSortType);
        if (column === 'receivedprojectioncase') handleSortReceivedProjectionCase(updatedSortType);
        if (column === 'maturedcase') handleSortMaturedCases(updatedSortType);
        if (column === 'generatedrevenue') handleSortGeneratedRevenue(updatedSortType);
    };

    // Call filterEmployeeStats when dependencies change
    useEffect(() => {
        filterEmployeeStats();
    }, [employeeStats, selectedBranch, searchFromName, employeeName]);

    // console.log("Data is :", filteredEmployeeStats)


    // --------------------------date formats--------------------------------------------
    function formatDateFinal(timestamp) {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function formatDateMonth(timestamp) {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    // const handleForwardedEmployeeDateRange = (values) => {
    //     if (values[1]) {
    //         const startDate = values[0].format("MM/DD/YYYY");
    //         const endDate = values[1].format("MM/DD/YYYY");

    //         const filteredDataDateRange = companyDataFilter.filter((product) => {
    //             const productDate = formatDateMonth(product.bdeForwardDate);
    //             // Check if the formatted productDate is within the selected date range
    //             if (startDate === endDate) {
    //                 // If both startDate and endDate are the same, filter for transactions on that day
    //                 return productDate === startDate;
    //             } else if (startDate !== endDate) {
    //                 // If different startDate and endDate, filter within the range
    //                 return (
    //                     new Date(productDate) >= new Date(startDate) &&
    //                     new Date(productDate) <= new Date(endDate)
    //                 );
    //             } else {
    //                 return false;
    //             }
    //         });
    //         const filteredTeamLeadsData = teamLeadsDataFilter.filter((product) => {
    //             const productDate = formatDateMonth(product.bdeForwardDate);
    //             if (startDate === endDate) {
    //                 return productDate === startDate;

    //             } else if (startDate !== endDate) {
    //                 return (
    //                     new Date(productDate) >= new Date(startDate) &&
    //                     new Date(productDate) <= new Date(endDate)
    //                 );
    //             } else {
    //                 return false;
    //             }
    //         })

    //         const newFollowData = followDataFilter.filter((obj) => obj.caseType === "Forwarded" || obj.caseType === "Recieved")
    //         const filteredFollowData = newFollowData.filter((product) => {
    //             //console.log(product.date)
    //             const productDate = formatDateFinal(product.date);
    //             //console.log(startDate , endDate , productDate)
    //             if (startDate === endDate) {
    //                 return productDate === startDate;
    //             } else if (startDate !== endDate) {
    //                 return (
    //                     new Date(productDate) >= new Date(startDate) &&
    //                     new Date(productDate) <= new Date(endDate)
    //                 );
    //             } else {
    //                 return false;
    //             }

    //         })
    //         setTeamLeadsData(filteredTeamLeadsData)
    //         setCompanyDataTotal(filteredDataDateRange);
    //         setfollowData(filteredFollowData)
    //     } else {
    //         return true;
    //     }
    // };

    return (
        <div>
            <div className="employee-dashboard mt-2">
                <div className="card">
                    <div className="card-header p-1 employeedashboard d-flex align-items-center justify-content-between">
                        <div className="dashboard-title pl-1"  >
                            <h2 className="m-0">
                                Employees Forwaded Data Report
                            </h2>
                        </div>

                        <div className="d-flex align-items-center pr-1">
                            <div className="filter-booking d-flex align-items-center">
                                <div className="filter-booking mr-1 d-flex align-items-center">
                                    <div className="export-data">
                                        <button className="btn btn-link" onClick={handleExportBookings}>
                                            Export CSV
                                        </button>
                                    </div>

                                    <div className="filter-title mr-1">
                                        <h2 className="m-0">
                                            Filter Branch :
                                        </h2>
                                    </div>
                                    <div className="filter-main">
                                        <select
                                            className="form-select"
                                            id={`branch-filter`}
                                            value={selectedBranch}
                                            onChange={(e) => setSelectedBranch(e.target.value)}
                                        >
                                            <option value="" disabled selected>Select Branch</option>
                                            <option value="Gota">Gota</option>
                                            <option value="Sindhu Bhawan">Sindhu Bhawan</option>
                                            <option value="">None</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="input-icon mr-1">
                                <span class="input-icon-addon">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                                        <path d="M21 21l-6 -6"></path>
                                    </svg>
                                </span>
                                <input
                                    value={searchFromName}
                                    onChange={(e) => setSearchFromName(e.target.value)}
                                    className="form-control"
                                    placeholder="Enter BDE/BDM Name..."
                                    type="text"
                                    name="bdeName-search"
                                    id="bdeName-search" />
                            </div>

                            {/* <div className="data-filter">
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs} >
                                    <DemoContainer
                                        components={["SingleInputDateRangeField"]} sx={{
                                            padding: '0px',
                                            with: '220px'
                                        }}  >
                                        <DateRangePicker className="form-control my-date-picker form-control-sm p-0"
                                            onChange={(values) => {
                                                const startDateEmp = moment(values[0]).format(
                                                    "DD/MM/YYYY"
                                                );
                                                const endDateEmp = moment(values[1]).format(
                                                    "DD/MM/YYYY"
                                                );
                                                setSelectedDateRangeForwardedEmployee([
                                                    startDateEmp,
                                                    endDateEmp,
                                                ]);
                                                handleForwardedEmployeeDateRange(values); // Call handleSelect with the selected values
                                            }}
                                            slots={{ field: SingleInputDateRangeField }}
                                            slotProps={{
                                                shortcuts: {
                                                    items: shortcutsItems,
                                                },
                                                actionBar: { actions: [] },
                                                textField: {
                                                    InputProps: { endAdornment: <Calendar /> },
                                                },
                                            }}
                                        //calendars={1}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </div> */}

                            <div>
                                <FormControl sx={{ ml: 1, minWidth: 200 }}>
                                    <InputLabel id="demo-select-small-label">Select Employee</InputLabel>
                                    <Select
                                        className="form-control my-date-picker my-mul-select form-control-sm p-0"
                                        labelId="demo-multiple-name-label"
                                        id="demo-multiple-name"
                                        multiple
                                        value={employeeName}
                                        onChange={(e) => setEmployeeName(e.target.value)}
                                        input={<OutlinedInput label="Name" />}
                                        MenuProps={MenuProps}
                                    >
                                        {allEmployees.map((name) => (
                                            <MenuItem key={name} value={name}>
                                                {name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <div className='card-body'>
                        <div className="row tbl-scroll">

                            <table className="admin-dash-tbl">
                                <thead className="admin-dash-tbl-thead">
                                    <tr>
                                        <th>Sr.No</th>
                                        <th>BDE/BDM Name</th>
                                        <th>Branch Name</th>
                                        <th
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleColumnSort('forwardedcase')}
                                        >
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>Forwarded Cases</div>
                                                <div className="short-arrow-div">
                                                    <ArrowDropUpIcon
                                                        className="up-short-arrow"
                                                        style={{
                                                            color: newSortType.forwardedcase === "descending"
                                                                ? "black"
                                                                : "#9d8f8f",
                                                        }}
                                                    />
                                                    <ArrowDropDownIcon
                                                        className="down-short-arrow"
                                                        style={{
                                                            color: newSortType.forwardedcase === "ascending"
                                                                ? "black"
                                                                : "#9d8f8f",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </th>
                                        <th
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleColumnSort('receivedcase')}
                                        >
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>Received Cases</div>
                                                <div className="short-arrow-div">
                                                    <ArrowDropUpIcon
                                                        className="up-short-arrow"
                                                        style={{
                                                            color: newSortType.receivedcase === "descending"
                                                                ? "black"
                                                                : "#9d8f8f",
                                                        }}
                                                    />
                                                    <ArrowDropDownIcon
                                                        className="down-short-arrow"
                                                        style={{
                                                            color: newSortType.receivedcase === "ascending"
                                                                ? "black"
                                                                : "#9d8f8f",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </th>
                                        <th
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleColumnSort('forwardedprojectioncase')}
                                        >
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>Forwarded Case Projection</div>
                                                <div className="short-arrow-div">
                                                    <ArrowDropUpIcon
                                                        className="up-short-arrow"
                                                        style={{
                                                            color: newSortType.forwardedprojectioncase === "descending"
                                                                ? "black"
                                                                : "#9d8f8f",
                                                        }}
                                                    />
                                                    <ArrowDropDownIcon
                                                        className="down-short-arrow"
                                                        style={{
                                                            color: newSortType.forwardedprojectioncase === "ascending"
                                                                ? "black"
                                                                : "#9d8f8f",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </th>
                                        <th
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleColumnSort('receivedprojectioncase')}
                                        >
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>Received Case Projection</div>
                                                <div className="short-arrow-div">
                                                    <ArrowDropUpIcon
                                                        className="up-short-arrow"
                                                        style={{
                                                            color: newSortType.receivedprojectioncase === "descending"
                                                                ? "black"
                                                                : "#9d8f8f",
                                                        }}
                                                    />
                                                    <ArrowDropDownIcon
                                                        className="down-short-arrow"
                                                        style={{
                                                            color: newSortType.receivedprojectioncase === "ascending"
                                                                ? "black"
                                                                : "#9d8f8f",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </th>
                                        <th
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleColumnSort('maturedcase')}
                                        >
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>Matured Cases</div>
                                                <div className="short-arrow-div">
                                                    <ArrowDropUpIcon
                                                        className="up-short-arrow"
                                                        style={{
                                                            color: newSortType.maturedcase === "descending" ? "black" : "#9d8f8f",
                                                        }}
                                                    />
                                                    <ArrowDropDownIcon
                                                        className="down-short-arrow"
                                                        style={{
                                                            color: newSortType.maturedcase === "ascending" ? "black" : "#9d8f8f",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </th>
                                        <th
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleColumnSort('generatedrevenue')}
                                        >
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>Generated Revenue</div>
                                                <div className="short-arrow-div">
                                                    <ArrowDropUpIcon
                                                        className="up-short-arrow"
                                                        style={{
                                                            color: newSortType.generatedrevenue === "descending" ? "black" : "#9d8f8f",
                                                        }}
                                                    />
                                                    <ArrowDropDownIcon
                                                        className="down-short-arrow"
                                                        style={{
                                                            color: newSortType.generatedrevenue === "ascending" ? "black" : "#9d8f8f",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="12">
                                                    <div className="LoaderTDSatyle">
                                                        <ClipLoader
                                                            color="lightgrey"
                                                            loading
                                                            size={30}
                                                            aria-label="Loading Spinner"
                                                            data-testid="loader"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            <>
                                                {filteredEmployeeStats.length > 0 ? (
                                                    filteredEmployeeStats.map(([name, stats], index) => {
                                                        const projectionData = employeeTotalAmount[name] || { forwardedProjection: 0, receivedProjection: 0 };
                                                        const maturedData = maturedTotals[name] || { maturedCases: 0, generatedRevenue: 0 };

                                                        // Update totals
                                                        totalForwardedCases += stats.forwarded || 0;
                                                        totalReceivedCases += stats.received || 0;
                                                        totalForwardedProjection += projectionData.forwardedProjection;
                                                        totalReceivedProjection += projectionData.receivedProjection;
                                                        totalMaturedCases += maturedData.maturedCases;
                                                        totalGeneratedRevenue += maturedData.generatedRevenue;

                                                        return (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{name}</td>
                                                                <td>{stats.branchOffice}</td>
                                                                <td>{stats.forwarded || '0'}</td>
                                                                <td>{stats.received || '0'}</td>
                                                                <td>{`₹ ${formatSalary(projectionData.forwardedProjection.toFixed(2))}` || '₹ 0'}</td>
                                                                <td>{`₹ ${formatSalary(projectionData.receivedProjection.toFixed(2))}` || '₹ 0'}</td>
                                                                <td>{maturedData.maturedCases}</td>
                                                                <td>{`₹ ${formatSalary(maturedData.generatedRevenue.toFixed(2))}` || '₹ 0'}</td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="9"><Nodata /></td>
                                                    </tr>
                                                )}
                                            </>
                                        )}
                                    </>
                                </tbody>

                                {filteredEmployeeStats.length > 0 && <tfoot className="admin-dash-tbl-tfoot">
                                    <tr>
                                        <td colSpan={3}>Total</td>
                                        <td>{totalForwardedCases}</td>
                                        <td>{totalReceivedCases}</td>
                                        <td>{`₹ ${formatSalary(totalForwardedProjection.toFixed(2))}`}</td>
                                        <td>{`₹ ${formatSalary(totalReceivedProjection.toFixed(2))}`}</td>
                                        <td>{totalMaturedCases}</td>
                                        <td>{`₹ ${formatSalary(totalGeneratedRevenue.toFixed(2))}`}</td>
                                    </tr>
                                </tfoot>}
                            </table>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployeesForwardedDataReportFromBackend;