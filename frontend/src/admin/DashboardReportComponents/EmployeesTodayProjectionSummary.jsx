import React, { useState, useEffect } from 'react';
import ClipLoader from "react-spinners/ClipLoader";
import { useParams } from "react-router-dom";
import axios from "axios";
import { IconButton } from "@mui/material";
import { RiEditCircleFill } from "react-icons/ri";
import Nodata from '../../components/Nodata';
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FcDatabase } from "react-icons/fc";
import { MdHistory } from "react-icons/md";



function EmployeesTodayProjectionSummary() {

    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const { userId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [showProjectionDialog, setShowProjectionDialog] = useState(false);
    const [isProjectionEditable, setIsProjectionEditable] = useState(false);
    const [editableProjectionData, setEditableProjectionData] = useState({});
    const [projection, setProjection] = useState([]);
    const [companyName, setCompanyName] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [totalEmployees, setTotalEmployees] = useState([]);
    const [employeeProjectionData, setEmployeeProjectionData] = useState([])
    const [projectionEname, setProjectionEname] = useState("")
    const [openProjectionTable, setOpenProjectionTable] = useState(false);
    const [historyData, setHistoryData] = useState([])
    const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
    const [historyCompanyName, setHistoryCompanyName] = useState("");
    const [addedOnDate, setAddedOnDate] = useState(null)

    const formatDate = (dateString) => {
        if (!dateString) return "N/A"; // Handle undefined or null dates
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid Date"; // Handle invalid date formats
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN').format(amount);
    };



    const fetchEmployee = async () => {
        try {

            const res2 = await axios.get(`${secretKey}/employee/einfo`);
            console.log("res", res2);
            setTotalEmployees(res2.data.filter((employee) => employee.designation === "Sales Executive" || employee.designation === "Sales Manager"));
        } catch (error) {
            console.log("Unexpected error in fetchEmployee:", error);
        }
    };



    const fetchNewProjection = async (values) => {
        try {
            setIsLoading(true);

            // Call the first API to get current day projections
            const currentDayProjectionRes = await axios.get(`${secretKey}/company-data/getCurrentDayProjection`, {
                params: { companyName },
            });

            // Call the new API to get daily employee projections including result status
            const dailyEmployeeProjectionRes = await axios.get(`${secretKey}/company-data/getDailyEmployeeProjections`);
            console.log("dailyEmployeeProjectionRes", dailyEmployeeProjectionRes);
            // Transform the data from the first API to calculate the required metrics
            const summary = currentDayProjectionRes.data.data.reduce((acc, company) => {
                const isShared = company.bdeName !== company.bdmName;

                // Initialize each employee's data if not already in summary
                [company.bdeName, company.bdmName].forEach((employeeName) => {
                    if (!acc[employeeName]) {
                        acc[employeeName] = {
                            total_companies: 0,
                            total_offered_price: 0,
                            total_estimated_payment: 0,
                            total_services: 0,
                        };
                    }
                });

                const serviceCount = company.offeredServices ? company.offeredServices.length : 0;

                if (isShared) {
                    acc[company.bdeName].total_companies += 0.5;
                    acc[company.bdmName].total_companies += 0.5;
                    acc[company.bdeName].total_offered_price += (company.offeredPrice || 0) * 0.5;
                    acc[company.bdmName].total_offered_price += (company.offeredPrice || 0) * 0.5;
                    acc[company.bdeName].total_estimated_payment += (company.totalPayment || 0) * 0.5;
                    acc[company.bdmName].total_estimated_payment += (company.totalPayment || 0) * 0.5;
                    acc[company.bdeName].total_services += serviceCount;
                    acc[company.bdmName].total_services += serviceCount;
                } else {
                    acc[company.bdeName].total_companies += 1;
                    acc[company.bdeName].total_offered_price += company.offeredPrice || 0;
                    acc[company.bdeName].total_estimated_payment += company.totalPayment || 0;
                    acc[company.bdeName].total_services += serviceCount;
                }

                return acc;
            }, {});

            // Convert the summary object to an array
            const summaryArray = Object.entries(summary).map(([ename, values]) => ({
                ename,
                total_companies: values.total_companies,
                total_offered_price: values.total_offered_price,
                total_estimated_payment: values.total_estimated_payment,
                total_services: values.total_services,
            }));

            // Process daily employee projections to incorporate "Not Added Yet" status
            const dailyEmployeeProjections = dailyEmployeeProjectionRes.data.data;
            const combinedSummaryArray = totalEmployees.map(employee => {
                const existingEmployee = summaryArray.find(summary => summary.ename === employee.ename);
                const dailyProjection = dailyEmployeeProjections.find(daily => daily.ename === employee.ename);

                // If the employee exists in both summaries, use existing data; otherwise, default values
                if (existingEmployee) {
                    return {
                        ...existingEmployee,
                        result: dailyProjection?.result || "Added",  // Add result status if available
                    };
                } else if (dailyProjection) {
                    // If only found in daily projections, default counts with "Not Added Yet" as result
                    return {
                        ename: employee.ename,
                        total_companies: 0,
                        total_offered_price: 0,
                        total_estimated_payment: 0,
                        total_services: 0,
                        result: dailyProjection.result || "Not Added Yet",
                    };
                } else {
                    // If not found in either source, default values
                    return {
                        ename: employee.ename,
                        total_companies: 0,
                        total_offered_price: 0,
                        total_estimated_payment: 0,
                        total_services: 0,
                        result: 0,
                    };
                }
            });

            // Sort so that employees with projections are on top and zero projections at the bottom
            combinedSummaryArray.sort((a, b) => b.total_companies - a.total_companies);

            console.log("Employee Projection Summary:", combinedSummaryArray);
            setProjection(combinedSummaryArray);
        } catch (error) {
            console.log("Error fetching today's projection:", error);
        } finally {
            setIsLoading(false);
        }
    };



    const handleOpenProjectionsForEmployee = async (employeeName) => {
        setProjectionEname(employeeName); // Store the employee name for dialog title
        try {
            setIsLoading(true);
            const res = await axios.get(`${secretKey}/company-data/getCurrentDayProjection/${employeeName}`, {
                params: {
                    companyName,

                }
            });
            console.log("Projection data is :", res.data.data);
            setEmployeeProjectionData(res.data.data);
            setOpenProjectionTable(true); // Open the dialog
        } catch (error) {
            console.log("Error to fetch new projection :", error);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    }
    const closeProjectionTable = () => setOpenProjectionTable(false);

    useEffect(() => {
        // Fetch employees on component mount
        fetchEmployee();
    }, []);

    useEffect(() => {
        // Fetch projections only when totalEmployees has data
        if (totalEmployees && totalEmployees.length > 0) {
            fetchNewProjection();
        }
    }, [totalEmployees]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // ----------projection history function-----------------------------------
    const handleViewHistory = (companyId) => {
        // Find the specific projection that matches the companyId
        const selectedProjection = employeeProjectionData.find(projection => projection._id === companyId);
        console.log("selectedProjection", selectedProjection)
        setHistoryCompanyName(selectedProjection.companyName)
        setAddedOnDate(selectedProjection.addedOnDate)

        // Set history data if found; otherwise, set an empty array
        setHistoryData(selectedProjection ? selectedProjection.history || [] : []);

        // Open the history dialog
        setOpenHistoryDialog(true);
        setOpenProjectionTable(false);
    };

    const handleCloseHistoryDialog = () => {
        setOpenHistoryDialog(false);
        setOpenProjectionTable(true);
    }

    console.log("historyData", historyData)
    console.log("totalEmployees", totalEmployees)


    return (
        <div>
            <div className="col-12 mt-2" id="projectiondashboardemployee">
                <div className="card">
                    <div className="card-header p-1 employeedashboard d-flex align-items-center justify-content-between">
                        <div className="dashboard-title pl-1">
                            <h2 className="m-0">
                                Today's Projection Summary
                            </h2>
                        </div>

                        {/* <div className="d-flex align-items-center pr-1">
                            <div class="input-icon mr-1">
                                <span class="input-icon-addon">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                                        <path d="M21 21l-6 -6"></path>
                                    </svg>
                                </span>

                                <input
                                    className="form-control"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Enter Company Name..."
                                    type="text"
                                    name="company-search"
                                    id="company-search"
                                />
                            </div>
                        </div> */}
                    </div>

                    <div className="card-body">
                        <div id="table-default" className="row tbl-scroll">
                            <table className="table-vcenter table-nowrap admin-dash-tbl">
                                <thead className="admin-dash-tbl-thead">
                                    <tr className="tr-sticky"
                                        style={{
                                            backgroundColor: "#ffb900",
                                            color: "white",
                                            fontWeight: "bold",
                                        }}>
                                        <th>Sr. No</th>
                                        <th>Employee Name</th>
                                        <th>Total Companies</th>
                                        <th>Offered Services</th>
                                        <th>Total Offered Price</th>
                                        <th>Total Estimated Amount</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {isLoading && <tr>
                                        <td colSpan="11" className="LoaderTDSatyle">
                                            <ClipLoader
                                                color="lightgrey"
                                                loading
                                                size={30}
                                                aria-label="Loading Spinner"
                                                data-testid="loader"
                                            />
                                        </td>
                                    </tr>}

                                    {projection && projection.length > 0 ? (
                                        projection.map((data, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{data.ename}</td>
                                                <td>
                                                    {data.result === "Not Added Yet" ? "Not Added Yet" :data.total_companies}
                                                    {data.result !== "Not Added Yet" && <FcDatabase
                                                        className='ml-1'
                                                        onClick={() => handleOpenProjectionsForEmployee(data.ename)} />}
                                                </td>
                                                <td>{data.result === "Not Added Yet" ? "Not Added Yet" :data.total_services}</td>
                                                <td>{data.result === "Not Added Yet" ? "Not Added Yet" :formatCurrency(data.total_offered_price)}
                                                </td>
                                                <td>{data.result === "Not Added Yet" ? "Not Added Yet" :formatCurrency(data.total_estimated_payment)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="particular" colSpan="12">
                                                <Nodata />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                                {projection && projection.length > 0 &&
                                    <tfoot className="admin-dash-tbl-tfoot">
                                        <tr style={{ fontWeight: 500 }} className="tf-sticky">
                                            <td colSpan="2">Total</td>
                                            <td>{projection.reduce((total, item) => total + item.total_companies, 0)}</td>
                                            <td>{projection.reduce((total, item) => total + item.total_services, 0)}</td>
                                            <td>₹ {formatAmount(projection.reduce((total, item) => total + item.total_offered_price, 0))}</td>
                                            <td>₹ {formatAmount(projection.reduce((total, item) => total + item.total_estimated_payment, 0))}</td>
                                        </tr>
                                    </tfoot>
                                }

                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* -------------------------------------projection-dashboard--------------------------------------------- */}
            <Dialog
                open={openProjectionTable}
                onClose={closeProjectionTable}
                fullWidth
                maxWidth="lg"
            >
                <DialogTitle>
                    {projectionEname}'s Today's Report{" "}
                    <IconButton
                        onClick={closeProjectionTable}
                        style={{ float: "right" }}
                    >
                        <CloseIcon color="primary" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <div
                        id="table-default"
                        style={{
                            overflowX: "auto",
                            overflowY: "auto",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                border: "1px solid #ddd",
                                marginBottom: "10px",
                            }}
                            className="table-vcenter table-nowrap"
                        >
                            <thead
                                style={{
                                    position: "sticky",
                                    top: "-1px",
                                    backgroundColor: "#ffb900",
                                    color: "black",
                                    fontWeight: "bold",
                                    zIndex: 1,
                                }}
                            >
                                <tr
                                    style={{
                                        backgroundColor: "#ffb900",
                                        color: "white",
                                        fontWeight: "bold",
                                    }}
                                >
                                    <th>Sr. No</th>
                                    <th>Company Name</th>
                                    <th>BDE Name</th>
                                    <th>BDM Name</th>
                                    <th>Offered Services</th>
                                    <th>Total Offered Price</th>
                                    <th>Expected Amount</th>
                                    <th>Employee Payment</th>
                                    <th>Last Follow Up Date</th>
                                    <th>Estimated Payment Date</th>
                                    <th>Remarks</th>
                                    <th>Added On</th>
                                    <th>Modified On</th>
                                    <th>View History</th>

                                </tr>
                            </thead>
                            <tbody>
                                {employeeProjectionData && employeeProjectionData.length > 0 ? (
                                    employeeProjectionData.map((data, index) => (
                                        <tr key={data._id}>
                                            <td>{index + 1}</td>
                                            <td>{data.companyName}</td>
                                            <td>{data.bdeName}</td>
                                            <td>{data.bdmName}</td>
                                            <td>{data.offeredServices.join(', ')}</td>
                                            <td>{formatCurrency(data.offeredPrice)}</td>
                                            <td>{formatCurrency(data.totalPayment)}</td>
                                            <td>{formatCurrency(data.employeePayment)}</td>
                                            <td>{formatDate(new Date(data.lastFollowUpdate))}</td>
                                            <td>{formatDate(new Date(data.estPaymentDate))}</td>
                                            <td>{data.remarks}</td>
                                            <td>{formatDate(new Date(data.addedOnDate))}</td>
                                            <td>{formatDate(new Date(data.projectionDate))}</td>
                                            <td>
                                                {/* View History button or link (replace with your actual logic) */}
                                                <MdHistory
                                                    onClick={() => handleViewHistory(data._id)}
                                                />

                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="12">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
            </Dialog>
            {/* --------------------history dialog---------------------------- */}
            <Dialog
                open={openHistoryDialog}
                onClose={handleCloseHistoryDialog}
                fullWidth
                maxWidth="lg"

            >
                <DialogTitle>
                    {historyCompanyName}'s History
                    <IconButton
                        onClick={handleCloseHistoryDialog}
                        style={{ float: "right" }}
                    >
                        <CloseIcon color="primary" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <div
                        id="table-default"
                        style={{ overflowX: "auto", overflowY: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                border: "1px solid #ddd",
                                marginBottom: "10px",
                            }}
                            className="table-vcenter table-nowrap"
                        >
                            <thead
                                style={{
                                    position: "sticky",
                                    top: "-1px",
                                    backgroundColor: "#ffb900",
                                    color: "black",
                                    fontWeight: "bold",
                                    zIndex: 1,
                                }}
                            >
                                <tr
                                    style={{
                                        backgroundColor: "#ffb900",
                                        color: "white",
                                        fontWeight: "bold",
                                    }}
                                >
                                    <th>Sr. No</th>
                                    <th>Company Name</th>
                                    <th>BDE Name</th>
                                    <th>BDM Name</th>
                                    <th>Offered Services</th>
                                    <th>Total Offered Price</th>
                                    <th>Expected Amount</th>
                                    <th>Employee Payment</th>
                                    <th>Last Follow Up Date</th>
                                    <th>Estimated Payment Date</th>
                                    <th>Remarks</th>
                                    <th>Added On</th>
                                    <th>Modified On</th>

                                </tr>
                            </thead>
                            <tbody>
                                {historyData && historyData.length > 0 ? (
                                    historyData.map((entry, index) => (
                                        <tr key={entry._id || index}>
                                            <td>{index + 1}</td>
                                            <td>{historyCompanyName}</td>
                                            <td>{entry.data.bdeName}</td>
                                            <td>{entry.data.bdmName}</td>
                                            <td>{entry.data.offeredServices.join(', ')}</td>
                                            <td>{formatCurrency(entry.data.offeredPrice)}</td>
                                            <td>{formatCurrency(entry.data.totalPayment)}</td>
                                            <td>{entry.data.bdeName === entry.data.bdmName ? formatCurrency(entry.data.totalPayment) : formatCurrency((entry.data.totalPayment) / 2)}</td>
                                            <td>{formatDate(new Date(entry.data.lastFollowUpdate))}</td>
                                            <td>{formatDate(new Date(entry.data.estPaymentDate))}</td>
                                            <td>{entry.data.remarks}</td>
                                            <td>{formatDate(addedOnDate)}</td>
                                            <td>{formatDate(new Date(entry.modifiedAt))}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8">No history available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}

export default EmployeesTodayProjectionSummary