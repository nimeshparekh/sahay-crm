import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../assets/table.css";
import "../assets/styles.css";
import CallHistory from "./CallHistory.jsx";
import RedesignedForm from "../admin/RedesignedForm.jsx";
import AddLeadForm from "../admin/AddLeadForm.jsx";
import TeamLeadsGeneral from "./EmployeeTeamLeadsTabPanels/TeamLeadsGeneral.jsx";
import TeamLeadsInterested from "./EmployeeTeamLeadsTabPanels/TeamLeadsInterested.jsx";
import TeamLeadsMatured from "./EmployeeTeamLeadsTabPanels/TeamLeadsMatured.jsx";
import TeamLeadsNotInterested from "./EmployeeTeamLeadsTabPanels/TeamLeadsNotInterested.jsx";
import AssignLeads from "../admin/ExtraComponent/AssignLeads.jsx";
import NewProjectionDialog from "./ExtraComponents/NewProjectionDialog.jsx";
import { IoFilterOutline } from "react-icons/io5";
// import DrawerComponent from "../components/Drawer.js";
import { MdOutlinePostAdd } from "react-icons/md";
import { useQuery } from '@tanstack/react-query';
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaCircleChevronLeft } from "react-icons/fa6";
import { FaCircleChevronRight } from "react-icons/fa6";
import { MdOutlinePersonPin } from "react-icons/md";
import { AiOutlineTeam } from "react-icons/ai";
import { IoIosArrowDropleft } from "react-icons/io";

function EmployeeTeamLeadsCopy({ designation }) {

    const { userId } = useParams();
    const navigate = useNavigate();
    const secretKey = process.env.REACT_APP_SECRET_KEY;

    const [projectionData, setProjectionData] = useState([]);
    const [data, setData] = useState([]);
    const [isFilter, setIsFilter] = useState(false);
    const [employeeData, setEmployeeData] = useState([]);
    const [showAssignLeadsFromBdm, setShowAssignLeadsFromBdm] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [startRowIndex, setStartRowIndex] = useState(null);
    const [selectedOption, setSelectedOption] = useState("direct");
    const [newemployeeSelection, setnewEmployeeSelection] = useState("Not Alloted");
    const [newEmpData, setNewEmpData] = useState([]);
    const [employeeName, setEmployeeName] = useState("");
    const [showCallHistory, setShowCallHistory] = useState(false);
    const [clientNumber, setClientNumber] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [addFormOpen, setAddFormOpen] = useState(false);
    const [dataStatus, setDataStatus] = useState("General");
    const [activeTabId, setActiveTabId] = useState("General"); // Track active tab ID
    const [generalData, setGeneralData] = useState([]);
    const [interestedData, setInterestedData] = useState([]);
    const [maturedData, setMaturedData] = useState([]);
    const [notInterestedData, setNotInterestedData] = useState([]);
    const [companyName, setCompanyName] = useState("");
    const [maturedCompanyName, setMaturedCompanyName] = useState("");
    const [companyEmail, setCompanyEmail] = useState("");
    const [companyInco, setCompanyInco] = useState(null);
    const [companyNumber, setCompanyNumber] = useState(0);
    const [companyId, setCompanyId] = useState("");
    const [deletedEmployeeStatus, setDeletedEmployeeStatus] = useState(false);
    const [newBdeName, setNewBdeName] = useState("");
    const [teamData, setTeamData] = useState([]);
    const [bdmName, setbdmName] = useState("");
    const [showProjection, setShowProjection] = useState(false);

    const itemsPerPage = 500;
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // -------------------------call history functions-------------------------------------
    const allTabRef = useRef(null); // Ref for the Matured tab
    const interestedTabRef = useRef(null); // Ref for the Interested tab
    const maturedTabRef = useRef(null); // Ref for the Matured tab
    const notInterestedTabRef = useRef(null); // Ref for the Matured tab

    const handleCloseProjection = () => {
        setShowProjection(false);
    };

    function formatDateNew(timestamp) {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const handleCloseAssignLeadsFromBdm = () => {
        setShowAssignLeadsFromBdm(false);
    };

    const handleShowCallHistory = (companyName, clientNumber) => {
        setShowCallHistory(true);
        setClientNumber(clientNumber);
    };

    const hanleCloseCallHistory = () => {
        setShowCallHistory(false);
        if (activeTabId === "Interested" && interestedTabRef.current) {
            interestedTabRef.current.click(); // Trigger the Interested tab click
        } else if (activeTabId === "Matured" && maturedTabRef.current) {
            maturedTabRef.current.click(); // Trigger the Matured tab click
        } else if (activeTabId === "General" && allTabRef.current) {
            allTabRef.current.click(); // Trigger the Matured tab click
        } else if (activeTabId === "Not Interested" && notInterestedTabRef.current) {
            notInterestedTabRef.current.click(); // Trigger the Matured tab click
        }
    };

    const handleOpenFormOpen = (cname, cemail, cindate, employeeId, cnum, isDeletedEmployeeCompany, ename, bdmName) => {
        setCompanyName(cname);
        setCompanyEmail(cemail);
        setCompanyInco(cindate);
        setCompanyId(employeeId);
        setCompanyNumber(cnum);
        setDeletedEmployeeStatus(isDeletedEmployeeCompany)
        setNewBdeName(ename)
        setbdmName(bdmName)
        if (!isDeletedEmployeeCompany) {
            console.log("formchal")
            setFormOpen(true);
        } else {
            console.log("addleadfromchal")
            setAddFormOpen(true)
        }
    };

    const handleCloseFormOpen = () => {
        setFormOpen(false);
        setAddFormOpen(false);
        setCompanyName("");
        setCompanyEmail("");
        setCompanyInco("");
        setCompanyId("");
        setCompanyNumber("");
        setDeletedEmployeeStatus("")
        setNewBdeName("")
        if (activeTabId === "Interested" && interestedTabRef.current) {
            interestedTabRef.current.click(); // Trigger the Interested tab click
        } else if (activeTabId === "Matured" && maturedTabRef.current) {
            maturedTabRef.current.click(); // Trigger the Matured tab click
        } else if (activeTabId === "General" && allTabRef.current) {
            allTabRef.current.click(); // Trigger the Matured tab click
        } else if (activeTabId === "Not Interested" && notInterestedTabRef.current) {
            notInterestedTabRef.current.click(); // Trigger the Matured tab click
        }
    };

    const fetchData = async () => {
        try {
            const response = await axios.get(`${secretKey}/employee/fetchEmployeeFromId/${userId}`);
            // Set the retrieved data in the state
            const userData = response.data.data;
            setEmployeeName(userData.ename)
            //console.log(userData);
            setData(userData);
        } catch (error) {
            console.error("Error fetching data:", error.message);
        }
    };

    const fetchEmployeeData = async () => {
        try {
            const response = await axios.get(`${secretKey}/employee/einfo`);
            const data = response.data.filter(item => item.designation === "Sales Executive" || item.designation === "Sales Manager");
            // console.log("Employee data is :", data);
            setEmployeeData(data);
            setNewEmpData(data.filter(employee => (employee.newDesignation === "Business Development Manager" || employee.newDesignation === "Floor Manager") && employee._id !== userId));
        } catch (error) {
            console.error("Error fetching data:", error.message);
        }
    };

    const fetchTeamLeadsData = async () => {
        try {
            const response = await axios.get(`${secretKey}/bdm-data/forwardedbybdedata/${employeeName}`);
            setTeamData(response.data);
        } catch (error) {
            console.log(error)
        }
    };

    useEffect(() => {
        if (employeeName) {
            fetchTeamLeadsData();
        }
    }, [employeeName]);

    // const fetchProjections = async () => {
    //     try {
    //         const response = await axios.get(`${secretKey}/projection/projection-data`);
    //         setProjectionData(response.data);
    //     } catch (error) {
    //         console.error("Error fetching Projection Data:", error.message);
    //     }
    // };

    const fetchNewProjections = async () => {
        try {
            const response = await axios.get(`${secretKey}/company-data/getProjection/${employeeName}`);
            //console.log("forprojec" , response.data);
            setProjectionData(response.data.data);
        } catch (error) {
            console.error("Error fetching Projection Data:", error.message);
        }
    };

    // const { data: teamLeadsData, isLoading: isTeamLeadsLoading, isError: isTeamLeadsError, refetch: refetchTeamLeads } = useQuery({
    //     queryKey: ["teamLeadsData", data.ename, dataStatus, currentPage, searchQuery],
    //     queryFn: async () => {
    //         const res = await axios.get(`${secretKey}/bdm-data/teamLeadsData/${data.ename}`, {
    //             params: {
    //                 status: dataStatus,
    //                 companyName: searchQuery, // Send the search query as a parameter
    //                 page: currentPage + 1, // Send current page for pagination
    //                 limit: itemsPerPage, // Set the limit of records per page
    //             }
    //         });
    //         return res;
    //     },
    //     enabled: !!data.ename,  // Only fetch data when ename is available
    //     refetchOnWindowFocus: false,  // Prevent fetching on window focus
    //     keepPreviousData: true, // This helps prevent a loading state when moving between pages
    // });

    const { data: teamLeadsData, isLoading: isTeamLeadsLoading, isError: isTeamLeadsError, refetch: refetchTeamLeads } = useQuery({
        queryKey: ["teamLeadsData", data.ename, currentPage, searchQuery],
        queryFn: async () => {
            const res = await axios.get(`${secretKey}/bdm-data/teamLeadsData/${data.ename}`, {
                params: {
                    searchQuery: searchQuery, // Send the search query as a parameter
                    page: currentPage + 1, // Send current page for pagination
                    limit: itemsPerPage, // Set the limit of records per page
                }
            });
            return res;
        },
        enabled: !!data.ename,  // Only fetch data when ename is available
        refetchOnWindowFocus: false,  // Prevent fetching on window focus
        keepPreviousData: true, // This helps prevent a loading state when moving between pages
    });

    // console.log("Team leads data is :", teamLeadsData?.data);

    useEffect(() => {
        if (teamLeadsData?.data) {
            setGeneralData(teamLeadsData?.data?.generalData);
            setInterestedData(teamLeadsData?.data?.interestedData);
            setMaturedData(teamLeadsData?.data?.maturedData);
            setNotInterestedData(teamLeadsData?.data?.notInterestedData);
        }
    }, [teamLeadsData?.data, searchQuery]);

    useEffect(() => {
        fetchData();
        // fetchProjections();
        fetchNewProjections();
    }, []);

    useEffect(() => {
        fetchEmployeeData();
    }, [designation]);

    // Auto logout functionality :
    useEffect(() => {
        // Function to check token expiry and initiate logout if expired
        const checkTokenExpiry = () => {
            const token = localStorage.getItem("newtoken");
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    const currentTime = Date.now() / 1000; // Get current time in seconds
                    if (decoded.exp < currentTime) {
                        // console.log("Decode Expirary :", decoded.exp);
                        // Token expired, perform logout actions
                        // console.log("Logout called");
                        handleLogout();
                    } else {
                        // Token not expired, continue session
                        const timeToExpire = decoded.exp - currentTime;

                    }
                } catch (error) {
                    console.error("Error decoding token:", error);
                    // console.log("Logout called");
                    handleLogout(); // Handle invalid token or decoding errors
                }
            }
        };

        // Initial check on component mount
        checkTokenExpiry();

        // Periodically check token expiry (e.g., every minute)
        const interval = setInterval(checkTokenExpiry, 60000); // 60 seconds

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    const handleLogout = () => {
        // Clear local storage and redirect to login page
        localStorage.removeItem("newtoken");
        localStorage.removeItem("userId");
        window.location.replace("/"); // Redirect to login page
    };

    useEffect(() => {
        if (designation === "admin") {
            document.title = `Admin-Sahay-CRM`;
        } else {
            document.title = `Employee-Sahay-CRM`;
        }
    }, [designation]);

    const handleCheckboxChange = (id, event) => {
        // If the id is 'all', toggle all checkboxes
        if (id === "all") {
            // If all checkboxes are already selected, clear the selection; otherwise, select all
            if (dataStatus === "General" && activeTabId === "General") {
                setSelectedRows((prevSelectedRows) =>
                    prevSelectedRows.length === teamLeadsData?.data?.generalData?.length
                        ? []
                        : teamLeadsData?.data?.generalData?.map((row) => row._id)
                );
            } else if (dataStatus === "Interested" && activeTabId === "Interested") {
                setSelectedRows((prevSelectedRows) =>
                    prevSelectedRows.length === teamLeadsData?.data?.interestedData?.length
                        ? []
                        : teamLeadsData?.data?.interestedData?.map((row) => row._id)
                );
            } else if (dataStatus === "Matured" && activeTabId === "Matured") {
                setSelectedRows((prevSelectedRows) =>
                    prevSelectedRows.length === teamLeadsData?.data?.maturedData?.length
                        ? []
                        : teamLeadsData?.data?.maturedData?.map((row) => row._id)
                );
            } else if (dataStatus === "Not Interested" && activeTabId === "Not Interested") {
                setSelectedRows((prevSelectedRows) =>
                    prevSelectedRows.length === teamLeadsData?.data?.notInterestedData?.length
                        ? []
                        : teamLeadsData?.data?.notInterestedData?.map((row) => row._id)
                );
            } else {
                setSelectedRows([]);
            }
        } else {
            // Toggle the selection status of the row with the given id
            setSelectedRows((prevSelectedRows) => {
                // If the Ctrl key is pressed
                if (event.ctrlKey) {
                    //console.log("pressed");
                    const selectedIndex = teamLeadsData?.data.findIndex((row) => row._id === id);
                    const lastSelectedIndex = teamLeadsData?.data.findIndex((row) => prevSelectedRows.includes(row._id));

                    // Select rows between the last selected row and the current row
                    if (lastSelectedIndex !== -1 && selectedIndex !== -1) {
                        const start = Math.min(selectedIndex, lastSelectedIndex);
                        const end = Math.max(selectedIndex, lastSelectedIndex);
                        const idsToSelect = teamLeadsData?.data.slice(start, end + 1).map((row) => row._id);

                        return prevSelectedRows.includes(id)
                            ? prevSelectedRows.filter((rowId) => !idsToSelect.includes(rowId))
                            : [...prevSelectedRows, ...idsToSelect];
                    }
                }

                // Toggle the selection status of the row with the given id
                return prevSelectedRows.includes(id)
                    ? prevSelectedRows.filter((rowId) => rowId !== id)
                    : [...prevSelectedRows, id];
            });
        }
    };


    const handleMouseDown = (id) => {
        // Initiate drag selection
        setStartRowIndex(teamLeadsData?.data.data.findIndex((row) => row._id === id));
    };

    const handleMouseEnter = (id) => {
        if (startRowIndex !== null && (designation === "admin" || designation === "datamanager")) {
            const endRowIndex = teamLeadsData?.data.data.findIndex(row => row._id === id);

            // Ensure startRowIndex and endRowIndex are valid and within array bounds
            const validStartIndex = Math.min(startRowIndex, endRowIndex);
            const validEndIndex = Math.max(startRowIndex, endRowIndex);

            // Only proceed if valid indices
            if (validStartIndex >= 0 && validEndIndex < teamLeadsData?.data.length) {
                const selectedRange = [];
                for (let i = validStartIndex; i <= validEndIndex; i++) {
                    if (teamLeadsData?.data[i] && teamLeadsData?.data[i]._id) {
                        // Ensure that teamLeadsData?.data[i] is not undefined and has an _id
                        selectedRange.push(teamLeadsData?.data[i]._id);
                    }
                }
                setSelectedRows(selectedRange); // Update selected rows
            }
        }
    };
    console.log("data", teamLeadsData?.data);
    const handleMouseUp = () => {
        // End drag selection
        setStartRowIndex(null);
    };

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleUploadData = async (e) => {
        //console.log("Uploading data");
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();
        const bdmAcceptStatus = "NotForwarded"

        const csvdata = teamLeadsData?.data?.data
            .filter((item) => selectedRows.includes(item._id))
            .map((employee) => {
                if (employee.bdmStatus === "Interested" || employee.bdmStatus === "FollowUp"
                ) {
                    // If Status is "Interested" or "FollowUp", don't change Status and Remarks
                    return { ...employee };
                } else {
                    // For other Status values, update Status to "Untouched" and Remarks to "No Remarks Added"
                    return {
                        ...employee,
                        bdmStatus: "Untouched",
                        Remarks: "No Remarks Added",
                    };
                }
            }
            );
        // console.log("Data to be assigned :", csvdata);

        // Create an array to store promises for updating CompanyModel
        const updatePromises = [];

        for (const data of csvdata) {
            const updatedObj = {
                ...data,
                date: currentDate,
                time: currentTime,
                bdmName: newemployeeSelection,
                companyName: data["Company Name"],
                bdmAcceptStatus,
            };
            // console.log(newemployeeSelection, data, bdmAcceptStatus)
            // Add the promise for updating CompanyModel to the array
            updatePromises.push(axios.post(`${secretKey}/bdm-data/assign-leads-newbdm`, {
                newemployeeSelection,
                data: updatedObj,
                bdmAcceptStatus,
            }));
        }

        try {
            // Wait for all update promises to resolve
            await Promise.all(updatePromises);
            //console.log("Employee data updated!");

            // Clear the selection
            setnewEmployeeSelection("Not Alloted");
            setSelectedRows([]);
            refetchTeamLeads();
            Swal.fire({
                title: "Data Assign!",
                text: "Data assigned successfully!",
                icon: "success",
            });
            handleCloseAssignLeadsFromBdm();
        } catch (error) {
            console.error("Error updating employee data:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to update employee data. Please try again later.",
                icon: "error",
            });
        }
    };

    const handleDeleteLeadsFromBdm = async () => {
        const selectedData = teamLeadsData?.data?.data.filter((item) => selectedRows.includes(item._id));
        // console.log("Data to be deleted :", selectedData);

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you really want to delete this company ${companyName} from BDM?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.post(`${secretKey}/bdm-data/delete-bdm-teamLeads`, {
                    companies: selectedData
                });
                Swal.fire('Deleted!', 'The selected companies have been deleted.', 'success');
                setSelectedRows([]);
                refetchTeamLeads();
                console.log("Companies updated and deleted successfully", response.data);
            } catch (error) {
                console.error("Error deleting companies:", error);
                Swal.fire('Error!', 'There was an error deleting the companies.', 'error');
            }
        }
    };

    const handleChangeUrlPrev = () => {
        const currId = userId;
        const salesExecutivesIds = employeeData.map(employee => employee._id);
        //console.log(newEmpData); // This is how the array looks like ['65bcb5ac2e8f74845bdc6211', '65bde8cf23df48d5fe3227ca']

        // Find the index of the currentId in the newEmpData array
        const currentIndex = salesExecutivesIds.findIndex((itemId) => itemId === currId);

        if (currentIndex !== -1) {
            // Calculate the previous index in a circular manner
            const prevIndex = (currentIndex - 1 + salesExecutivesIds.length) % salesExecutivesIds.length;

            if (currentIndex === 0) {
                // If it's the first page, navigate to the employees page
                if (designation === "admin") {
                    navigate(`/managing-director/user`);
                } else {
                    navigate(`dataanalyst/newEmployees`);
                }

                //setBackButton(false)
            } else {
                // Get the previousId from the salesExecutivesIds array
                const prevId = salesExecutivesIds[prevIndex];
                if (designation === "admin") {
                    navigate(`/managing-director/employees/${prevId}`);
                } else {
                    navigate(`/dataanalyst/employeeLeads/${prevId}`);

                }

            }
            //setBackButton(prevIndex !== 0);
        } else {
            console.log("Current ID not found in newEmpData array.");
        }
    };

    const handleChangeUrlNext = () => {
        const currId = userId;
        // Filter the response data to find _id values where designation is "Sales Executive" or "Sales Manager"
        const salesExecutivesIds = employeeData.map(employee => employee._id);

        //console.log(newEmpData); // This is how the array looks like ['65bcb5ac2e8f74845bdc6211', '65bde8cf23df48d5fe3227ca']

        // Find the index of the currentId in the newEmpData array
        const currentIndex = salesExecutivesIds.findIndex((itemId) => itemId === currId);

        if (currentIndex !== -1) {
            // Calculate the next index in a circular manner
            const nextIndex = (currentIndex + 1) % salesExecutivesIds.length;

            // Get the nextId from the salesExecutivesIds array
            const nextId = salesExecutivesIds[nextIndex];
            if (designation === "admin") {
                navigate(`/managing-director/employees/${nextId}`);
            } else {
                navigate(`/dataanalyst/employeeLeads/${nextId}`);

            }
            //setBackButton(nextId !== 0);
        } else {
            console.log("Current ID not found in newEmpData array.");
        }
    };

    return (
        <div>
            {!showCallHistory && !formOpen && !addFormOpen ? (
                <div className="page-wrapper">
                    <div className="page-wrapper">
                        <div className="page-header mt-3">
                            <div className="container-xl">
                                <div className="d-flex align-items-center justify-content-between">

                                    <div className="d-flex align-items-center">
                                        <div>
                                            {(designation === "admin" || designation === "datamanager") && (
                                                <>
                                                    <div className="btn-group mr-1" role="group" aria-label="Basic example">
                                                        <button className="btn mybtn">
                                                            <FaCircleChevronLeft className="ep_right_button" onClick={handleChangeUrlPrev} />
                                                        </button>
                                                        <button className="btn mybtn"><b>{data.ename}</b></button>
                                                        <button className="btn mybtn">
                                                            <FaCircleChevronRight className="ep_left_button" onClick={handleChangeUrlNext} />
                                                        </button>
                                                    </div>

                                                    <div className="btn-group" role="group" aria-label="Basic example">
                                                        <button type="button"
                                                            onClick={() => {
                                                                if (designation === "admin") {
                                                                    navigate(`/managing-director/employees/${userId}`);
                                                                } else if (designation === "datamanager") {
                                                                    navigate(`/dataanalyst/employeeLeads/${userId}`);
                                                                }
                                                            }}
                                                            className={
                                                                ((designation === "admin" && window.location.pathname === `/managing-director/employees/${userId}`) ||
                                                                    (designation === "datamanager" && window.location.pathname === `/dataanalyst/employeeLeads/${userId}`)) &&
                                                                    data.bdmWork ? "btn mybtn active" : "btn mybtn"
                                                            }
                                                        >
                                                            <MdOutlinePersonPin className='mr-1' />
                                                            Leads
                                                        </button>

                                                        {data.bdmWork &&
                                                            <button
                                                                type="button"
                                                                className={
                                                                    (designation === "admin" && window.location.pathname === `/managing-director/employeeleads/${userId}`) ||
                                                                        (designation === "datamanager" && window.location.pathname === `/datamanager/datamanagerside-employeeteamleads/${userId}`)
                                                                        ? "btn mybtn active"
                                                                        : "btn mybtn"
                                                                }
                                                                onClick={() => {
                                                                    if (designation === "admin") {
                                                                        navigate(`/managing-director/employeeleads/${userId}`);
                                                                    } else if (designation === "datamanager") {
                                                                        navigate(`/datamanager/datamanagerside-employeeteamleads/${userId}`);
                                                                    }
                                                                }}
                                                            >
                                                                <AiOutlineTeam
                                                                    className='mr-1' /> Team Leads
                                                            </button>}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {designation !== "admin" && <div className="btn-group" role="group" aria-label="Basic example">
                                            <button type="button" className={isFilter ? 'btn mybtn active' : 'btn mybtn'}
                                            // onClick={() => setOpenFilterDrawer(true)}
                                            >
                                                <IoFilterOutline className='mr-1' /> Filter
                                            </button>
                                            <button type="button" className="btn mybtn" onClick={() => setShowProjection(true)}>
                                                <MdOutlinePostAdd className='mr-1' /> Add Projection
                                            </button>
                                            {/* {open &&
                                            <EmployeeRequestDataDialog
                                                secretKey={secretKey}
                                                ename={data.ename}
                                                setOpenChange={openchange}
                                                open={open}
                                            />} */}
                                        </div>}
                                    </div>

                                    <div className="d-flex align-items-center">
                                        {(designation === "admin" || designation === "datamanager") && (
                                            <>
                                                {selectedRows.length !== 0 && (
                                                    <div className="selection-data mr-1" >
                                                        Total Data Selected : <b>{selectedRows.length}</b>
                                                    </div>
                                                )}

                                                <div className="btn-group mr-1" role="group" aria-label="Basic example">
                                                    <Link style={{ marginLeft: "10px" }}
                                                        to={designation === "admin" ? `/managing-director/user` : `/dataanalyst/newEmployees`}>
                                                        <button type="button" className="btn mybtn">
                                                            <IoIosArrowDropleft className='mr-1' /> Back
                                                        </button>
                                                    </Link>
                                                </div>

                                                <button type="button" className="btn mybtn cursor-pointer mr-1" disabled={!selectedRows.length} onClick={() => setShowAssignLeadsFromBdm(true)}>
                                                    <MdOutlinePostAdd className='mr-1' />Assign Leads
                                                </button>

                                                <button type="button" className="btn mybtn cursor-pointer" disabled={!selectedRows.length} onClick={handleDeleteLeadsFromBdm}>
                                                    <MdOutlinePostAdd className='mr-1' />Delete Leads
                                                </button>

                                                {showAssignLeadsFromBdm && (
                                                    <AssignLeads
                                                        openAssign={showAssignLeadsFromBdm}
                                                        closepopupAssign={handleCloseAssignLeadsFromBdm}
                                                        selectedOption={selectedOption}
                                                        setSelectedOption={setSelectedOption}
                                                        newemployeeSelection={newemployeeSelection}
                                                        setnewEmployeeSelection={setnewEmployeeSelection}
                                                        handleOptionChange={handleOptionChange}
                                                        handleUploadData={handleUploadData}
                                                        newempData={newEmpData}
                                                        isAssignFromBdm={true}
                                                    />
                                                )}
                                            </>
                                        )}

                                        <div class="input-icon ml-1">
                                            <span class="input-icon-addon">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="icon mybtn" width="18" height="18" viewBox="0 0 22 22" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                    <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                                                    <path d="M21 21l-6 -6"></path>
                                                </svg>
                                            </span>
                                            <input
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="form-control search-cantrol mybtn"
                                                placeholder="Search…"
                                                type="text"
                                                name="bdeName-search"
                                                id="bdeName-search" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div onCopy={(e) => !designation && e.preventDefault()} className="page-body">
                            <div className="container-xl">
                                <div class="card-header my-tab">
                                    <ul class="nav nav-tabs sales-nav-tabs card-header-tabs nav-fill p-0" data-bs-toggle="tabs">
                                        <li class="nav-item sales-nav-item data-heading" ref={allTabRef}>
                                            <a
                                                href="#general"
                                                ref={allTabRef} // Attach the ref to the anchor tag
                                                // onClick={() => handleDataStatusChange("All", allTabRef)}
                                                onClick={() => {
                                                    setDataStatus("General");
                                                    setActiveTabId("General");
                                                    setSelectedRows([]);
                                                    setCurrentPage(0);
                                                }}
                                                className={`nav-link  ${dataStatus === "General" ? "active item-act" : ""}`}
                                                data-bs-toggle="tab"
                                            >
                                                <div>General</div>
                                                <div className="no_badge">
                                                    {teamLeadsData?.data?.totalGeneral || 0}
                                                </div>

                                            </a>
                                        </li>

                                        <li class="nav-item sales-nav-item data-heading" ref={interestedTabRef}>
                                            <a
                                                href="#Interested"
                                                ref={interestedTabRef}
                                                // onClick={() => handleDataStatusChange("Interested", interestedTabRef)}
                                                onClick={() => {
                                                    setDataStatus("Interested");
                                                    setActiveTabId("Interested");
                                                    setSelectedRows([]);
                                                    setCurrentPage(0);
                                                }}
                                                className={`nav-link ${dataStatus === "Interested" ? "active item-act" : ""}`}
                                                data-bs-toggle="tab"
                                            >
                                                Interested
                                                <span className="no_badge">
                                                    {teamLeadsData?.data?.totalInterested || 0}
                                                </span>
                                            </a>
                                        </li>

                                        <li class="nav-item sales-nav-item data-heading" ref={maturedTabRef}>
                                            <a
                                                href="#Matured"
                                                ref={maturedTabRef}
                                                // onClick={() => handleDataStatusChange("Matured", maturedTabRef)}
                                                onClick={() => {
                                                    setDataStatus("Matured");
                                                    setActiveTabId("Matured");
                                                    setSelectedRows([]);
                                                    setCurrentPage(0);
                                                }}
                                                className={`nav-link ${dataStatus === "Matured" ? "active item-act" : ""}`}
                                                data-bs-toggle="tab"
                                            >
                                                Matured
                                                <span className="no_badge">
                                                    {teamLeadsData?.data?.totalMatured || 0}
                                                </span>
                                            </a>
                                        </li>

                                        <li class="nav-item sales-nav-item data-heading">
                                            <a
                                                href="#NotInterested"
                                                ref={notInterestedTabRef}
                                                // onClick={() => handleDataStatusChange("Not Interested", notInterestedTabRef)}
                                                onClick={() => {
                                                    setDataStatus("Not Interested");
                                                    setActiveTabId("Not Interested");
                                                    setSelectedRows([]);
                                                    setCurrentPage(0);
                                                }}
                                                className={`nav-link ${dataStatus === "Not Interested" ? "active item-act" : ""}`}
                                                data-bs-toggle="tab"
                                            >
                                                Not Interested
                                                <span className="no_badge">
                                                    {teamLeadsData?.data?.totalNotInterested || 0}
                                                </span>
                                            </a>
                                        </li>
                                    </ul>
                                </div>

                                <div className="tab-content card-body">
                                    <div className={`tab-pane ${dataStatus === "General" ? "active" : ""}`} id="general">
                                        {activeTabId === "General" && dataStatus === "General" && (<TeamLeadsGeneral
                                            secretKey={secretKey}
                                            // generalData={teamLeadsData?.data?.data}
                                            generalData={generalData}
                                            isLoading={isTeamLeadsLoading}
                                            refetchTeamLeads={refetchTeamLeads}
                                            formatDateNew={formatDateNew}
                                            startIndex={startIndex}
                                            endIndex={endIndex}
                                            totalPages={teamLeadsData?.data?.totalGeneralPages}
                                            setCurrentPage={setCurrentPage}
                                            currentPage={currentPage}
                                            dataStatus={dataStatus}
                                            setDataStatus={setDataStatus}
                                            ename={data.ename}
                                            email={data.email}
                                            designation={data.designation}
                                            handleShowCallHistory={handleShowCallHistory}
                                            projectionData={projectionData}
                                            newDesignation={designation}
                                            selectedRows={selectedRows}
                                            setSelectedRows={setSelectedRows}
                                            handleCheckboxChange={handleCheckboxChange}
                                            handleMouseDown={handleMouseDown}
                                            handleMouseEnter={handleMouseEnter}
                                            handleMouseUp={handleMouseUp}
                                        />)}
                                    </div>

                                    <div className={`tab-pane ${dataStatus === "Interested" ? "active" : ""}`} id="Interested">
                                        {activeTabId === "Interested" && dataStatus === "Interested" && (<TeamLeadsInterested
                                            secretKey={secretKey}
                                            employeeName={employeeName}
                                            // interestedData={teamLeadsData?.data?.data}
                                            interestedData={interestedData}
                                            isLoading={isTeamLeadsLoading}
                                            refetchTeamLeads={refetchTeamLeads}
                                            formatDateNew={formatDateNew}
                                            startIndex={startIndex}
                                            endIndex={endIndex}
                                            totalPages={teamLeadsData?.data?.totalInterestedPages}
                                            setCurrentPage={setCurrentPage}
                                            currentPage={currentPage}
                                            dataStatus={dataStatus}
                                            setDataStatus={setDataStatus}
                                            ename={data.ename}
                                            email={data.email}
                                            designation={data.designation}
                                            handleShowCallHistory={handleShowCallHistory}
                                            fetchProjections={fetchNewProjections}
                                            projectionData={projectionData}
                                            teamData={teamData}
                                            handleOpenFormOpen={handleOpenFormOpen}
                                            newDesignation={designation}
                                            selectedRows={selectedRows}
                                            setSelectedRows={setSelectedRows}
                                            handleCheckboxChange={handleCheckboxChange}
                                            handleMouseDown={handleMouseDown}
                                            handleMouseEnter={handleMouseEnter}
                                            handleMouseUp={handleMouseUp}
                                        />)}
                                    </div>

                                    <div className={`tab-pane ${dataStatus === "Matured" ? "active" : ""}`} id="Matured">
                                        {activeTabId === "Matured" && (<TeamLeadsMatured
                                            secretKey={secretKey}
                                            // maturedData={teamLeadsData?.data?.data}
                                            maturedData={maturedData}
                                            isLoading={isTeamLeadsLoading}
                                            refetchTeamLeads={refetchTeamLeads}
                                            formatDateNew={formatDateNew}
                                            startIndex={startIndex}
                                            endIndex={endIndex}
                                            totalPages={teamLeadsData?.data?.totalMaturedPages}
                                            setCurrentPage={setCurrentPage}
                                            currentPage={currentPage}
                                            dataStatus={dataStatus}
                                            setDataStatus={setDataStatus}
                                            ename={data.ename}
                                            email={data.email}
                                            designation={data.designation}
                                            handleShowCallHistory={handleShowCallHistory}
                                            fetchProjections={fetchNewProjections}
                                            projectionData={projectionData}
                                            newDesignation={designation}
                                            selectedRows={selectedRows}
                                            setSelectedRows={setSelectedRows}
                                            handleCheckboxChange={handleCheckboxChange}
                                            handleMouseDown={handleMouseDown}
                                            handleMouseEnter={handleMouseEnter}
                                            handleMouseUp={handleMouseUp}
                                        />)}
                                    </div>

                                    <div className={`tab-pane ${dataStatus === "Not Interested" ? "active" : ""}`} id="NotInterested">
                                        {activeTabId === "Not Interested" && (<TeamLeadsNotInterested
                                            secretKey={secretKey}
                                            // notInterestedData={teamLeadsData?.data?.data}
                                            notInterestedData={notInterestedData}
                                            isLoading={isTeamLeadsLoading}
                                            refetchTeamLeads={refetchTeamLeads}
                                            formatDateNew={formatDateNew}
                                            startIndex={startIndex}
                                            endIndex={endIndex}
                                            totalPages={teamLeadsData?.data?.totalNotInterestedPages}
                                            setCurrentPage={setCurrentPage}
                                            currentPage={currentPage}
                                            dataStatus={dataStatus}
                                            setDataStatus={setDataStatus}
                                            ename={data.ename}
                                            email={data.email}
                                            designation={data.designation}
                                            handleShowCallHistory={handleShowCallHistory}
                                            newDesignation={designation}
                                            selectedRows={selectedRows}
                                            setSelectedRows={setSelectedRows}
                                            handleCheckboxChange={handleCheckboxChange}
                                            handleMouseDown={handleMouseDown}
                                            handleMouseEnter={handleMouseEnter}
                                            handleMouseUp={handleMouseUp}
                                        />)}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            ) : showCallHistory ? (
                <CallHistory
                    handleCloseHistory={hanleCloseCallHistory}
                    clientNumber={clientNumber}
                />
            ) : formOpen ? (
                <RedesignedForm
                    isEmployee={true}
                    companysName={companyName}
                    companysEmail={companyEmail}
                    companyNumber={companyNumber}
                    setNowToFetch={refetchTeamLeads}
                    companysInco={companyInco}
                    bdmName={data.ename}
                    employeeName={newBdeName}
                    employeeEmail={newEmpData.find(employee => employee.ename === newBdeName)?.email}
                    handleCloseFormOpen={handleCloseFormOpen}
                />
            ) : addFormOpen ? (
                <AddLeadForm
                    isEmployee={true}
                    employeeName={newBdeName}
                    employeeEmail={newEmpData.find(employee => employee.ename === newBdeName)?.email}
                    isDeletedEmployeeCompany={deletedEmployeeStatus}
                    setFormOpen={setAddFormOpen}
                    companysName={companyName}
                    setNowToFetch={refetchTeamLeads}
                    setDataStatus={setDataStatus}
                    bdmName={data.ename}
                    bdmEmail={data.email}
                    handleCloseFormOpen={handleCloseFormOpen}
                />
            ) : null
            }

            <NewProjectionDialog
                open={showProjection}
                closepopup={handleCloseProjection}
                employeeName={data.ename}
                refetch={refetchTeamLeads}
                isFilledFromTeamLeads={true}
            />

        </div>
    );
}

export default EmployeeTeamLeadsCopy;