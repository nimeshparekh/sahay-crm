// import React, { useState, useEffect } from "react";
// import EmpNav from "./EmpNav.js";
// import Header from "../components/Header";
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import { FaWhatsapp } from "react-icons/fa";
// import NoData from '../../Components/NoData/NoData.jsx';
// import { Drawer, Icon, IconButton } from "@mui/material";
// import { IconChevronLeft, IconEye } from "@tabler/icons-react";
// import { IconChevronRight } from "@tabler/icons-react";
// import { GrStatusGood } from "react-icons/gr";
// import EditIcon from "@mui/icons-material/Edit";
// import { Dialog, DialogContent, DialogTitle } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import Swal from "sweetalert2";
// import { useCallback } from "react";
// import debounce from "lodash/debounce";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { RiEditCircleFill } from "react-icons/ri";
// import { IoClose } from "react-icons/io5";
// import Select from "react-select";
// import { options } from "../../../components/Options.js";
// import { IoAddCircle } from "react-icons/io5";
// import Slider from '@mui/material/Slider';
// import RedesignedForm from "../../../admin/RedesignedForm.jsx";
import React, { useEffect, useState } from "react";

import Navbar from "./Navbar";
import Header from "./Header";
import { useLocation, useParams } from "react-router-dom";
import notificationSound from "../assets/media/iphone_sound.mp3";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import axios from "axios";
import { IconChevronLeft, IconEye } from "@tabler/icons-react";
import { IconChevronRight } from "@tabler/icons-react";
import { Drawer, Icon, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FontDownloadIcon from "@mui/icons-material/FontDownload";
import AttachmentIcon from "@mui/icons-material/Attachment";
import ImageIcon from "@mui/icons-material/Image";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import Select from "react-select";
import Swal from "sweetalert2";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import Form from "../components/Form.jsx";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import "../assets/table.css";
import "../assets/styles.css";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import Nodata from "../components/Nodata.jsx";
import EditForm from "../components/EditForm.jsx";
import { useCallback } from "react";
import debounce from "lodash/debounce";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { options } from "../components/Options.js";
import FilterListIcon from "@mui/icons-material/FilterList";
import io from "socket.io-client";
import AddCircle from "@mui/icons-material/AddCircle.js";
import { HiOutlineEye } from "react-icons/hi";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { RiEditCircleFill } from "react-icons/ri";
import { IoCloseCircleOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import ScaleLoader from "react-spinners/ScaleLoader";
import ClipLoader from "react-spinners/ClipLoader";
import RedesignedForm from "../admin/RedesignedForm.jsx";
import LeadFormPreview from "../admin/LeadFormPreview.jsx";
import Edit from "@mui/icons-material/Edit";
import EditableLeadform from "../admin/EditableLeadform.jsx";
import AddLeadForm from "../admin/AddLeadForm.jsx";
import { FaWhatsapp } from "react-icons/fa";
import EditableMoreBooking from "../admin/EditableMoreBooking.jsx";
import { RiShareForwardBoxFill } from "react-icons/ri";
import { RiShareForward2Fill } from "react-icons/ri";
import { TiArrowBack } from "react-icons/ti";
import { TiArrowForward } from "react-icons/ti";
import { MdNotInterested } from "react-icons/md";
import { RiInformationLine } from "react-icons/ri";
import PropTypes from "prop-types";
import Slider, { SliderThumb } from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { GrStatusGood } from "react-icons/gr";
import { IoAddCircle } from "react-icons/io5";
import { FaArrowLeft } from "react-icons/fa6";
//import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
//import Typography from '@mui/material/Typography';
//import Box from '@mui/material/Box';
import { GrDocumentStore } from "react-icons/gr";
import { AiOutlineTeam } from "react-icons/ai";
import { GoPerson } from "react-icons/go";
import { MdOutlinePersonPin } from "react-icons/md";
import Employee from './Employees.js'
import Team from './Team.js'
import EmployeeParticular from "./EmployeeParticular.js";









function AdminEmployeeTeamLeads() {
    const { id } = useParams();
    const [data, setData] = useState([])
    const [dataStatus, setdataStatus] = useState("All");
    const [currentPage, setCurrentPage] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const [maturedID, setMaturedID] = useState("");
    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const frontendKey = process.env.REACT_APP_FRONTEND_KEY;
    const itemsPerPage = 500;
    const [currentData, setCurrentData] = useState([])
    const [BDMrequests, setBDMrequests] = useState(null);
    const startIndex = currentPage * itemsPerPage;
    const [currentForm, setCurrentForm] = useState(null);
    const endIndex = startIndex + itemsPerPage;
    const [teamleadsData, setTeamLeadsData] = useState([]);
    const [teamData, setTeamData] = useState([])
    const [openbdmRequest, setOpenbdmRequest] = useState(false);
    const [openRemarks, setOpenRemarks] = useState(false)
    const [remarksHistory, setRemarksHistory] = useState([]);
    const [filteredRemarks, setFilteredRemarks] = useState([]);
    const [cid, setcid] = useState("");
    const [cstat, setCstat] = useState("");
    const [currentCompanyName, setCurrentCompanyName] = useState("");
    const [currentRemarks, setCurrentRemarks] = useState("");
    const [currentRemarksBdm, setCurrentRemarksBdm] = useState("");
    const [companyId, setCompanyId] = useState("");
    const [bdmNewStatus, setBdmNewStatus] = useState("Untouched");
    const [changeRemarks, setChangeRemarks] = useState("");
    const [updateData, setUpdateData] = useState({});
    const [projectionData, setProjectionData] = useState([]);
    const [eData, seteData] = useState([]);
    const [bdmWorkOn, setBdmWorkOn] = useState(false)
    const [bdmNames, setBdmNames] = useState([])
    const [branchOffice, setBranchOffice] = useState("")
    const [empData, setEmpData] = useState([])

    const fetchData = async () => {
        try {
            const response = await axios.get(`${secretKey}/einfo`);

            // Set the retrieved data in the state
            const tempData = response.data;
            const userData = tempData.find((item) => item._id === id);
            const salesExecutivesIds = response.data.filter((employee) => employee.designation === "Sales Executive")
                .map((employee) => employee._id)
            //console.log(userData);
            setEmpData(tempData)
            setBranchOffice(userData.branchOffice)
            seteData(salesExecutivesIds)
            setData(userData);
            setBdmNames(tempData
                .filter((obj) => obj.bdmWork && obj.branchOffice === branchOffice && !userData.ename.includes(obj.ename))
                .map((employee) => employee.ename)
            );

            setBdmWorkOn(tempData.find((item) => item._id === id)?.bdmWork || null);
            //console.log((tempData.find((item)=>item._id === id))?.bdmWork || null)
            //setmoreFilteredData(userData);
        } catch (error) {
            console.error("Error fetching data:", error.message);
        }
    };
    //console.log(eData)
    //console.log(data)

    // useEffect(()=>{
    //     fetchData()
    //     setBdmNames(empData
    //         .filter((obj) => obj.bdmWork && obj.branchOffice === branchOffice)
    //         .map((employee) => employee.ename)
    //       );

    // }, [empData])



    console.log(bdmNames)

    const [maturedBooking, setMaturedBooking] = useState(null);

    const fetchBDMbookingRequests = async () => {
        const bdmName = data.ename;
        console.log("This is bdm", bdmName);
        try {
            const response = await axios.get(
                `${secretKey}/matured-get-requests-byBDM/${bdmName}`
            );
            const mainData = response.data[0]
            setBDMrequests(mainData);

            if (response.data.length !== 0) {
                setOpenbdmRequest(true);
                const companyName = mainData["Company Name"];
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const fetchTeamLeadsData = async (status) => {
        const bdmName = data.ename
        try {
            const response = await axios.get(`${secretKey}/forwardedbybdedata/${bdmName}`)

            console.log("teamdata", response.data)

            setTeamData(response.data)
            if (bdmNewStatus === "Untouched") {
                setTeamLeadsData(response.data.filter((obj) => obj.bdmStatus === "Untouched").sort((a, b) => new Date(b.bdeForwardDate) - new Date(a.bdeForwardDate)))
                setBdmNewStatus("Untouched")
            }
            if (status === "Interested") {
                setTeamLeadsData(response.data.filter((obj) => obj.bdmStatus === "Interested").sort((a, b) => new Date(b.bdeForwardDate) - new Date(a.bdeForwardDate)))
                setBdmNewStatus("Interested")
            }
            if (status === "FollowUp") {
                setTeamLeadsData(response.data.filter((obj) => obj.bdmStatus === "FollowUp").sort((a, b) => new Date(b.bdeForwardDate) - new Date(a.bdeForwardDate)))
                setBdmNewStatus("FollowUp")
            }
            if (status === "Matured") {
                setTeamLeadsData(response.data.filter((obj) => obj.bdmStatus === "Matured").sort((a, b) => new Date(b.bdeForwardDate) - new Date(a.bdeForwardDate)))
                setBdmNewStatus("Matured")
            }
            if (status === "Not Interested") {
                setTeamLeadsData(response.data.filter((obj) => obj.bdmStatus === "Not Interested").sort((a, b) => new Date(b.bdeForwardDate) - new Date(a.bdeForwardDate)))
                setBdmNewStatus("NotInterested")
            }


            console.log("response", response.data)
        } catch (error) {
            console.log(error)
        }
    }

    //console.log("teamData", teamData)
    //console.log(data.ename)

    useEffect(() => {
        if (teamData.length !== 0 && BDMrequests) {
            const companyName = BDMrequests["Company Name"];
            const currentObject = teamData.find(obj => obj["Company Name"] === companyName);
            setMaturedBooking(currentObject);
            console.log("Current Booking:", currentObject);
        }
    }, [teamData, BDMrequests]);


    console.log("teamdata", teamleadsData)

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        fetchData()
        fetchTeamLeadsData()
        fetchBDMbookingRequests()
    }, [data.ename])

    //console.log("ename" , data.ename)


    function formatDate(inputDate) {
        const options = { year: "numeric", month: "long", day: "numeric" };
        const formattedDate = new Date(inputDate).toLocaleDateString(
            "en-US",
            options
        );
        return formattedDate;
    }
    function formatDateNew(timestamp) {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }


    const closePopUpRemarks = () => {
        setOpenRemarks(false)

    }
    const closePopUpRemarksEdit = () => {
        setOpenRemarksEdit(false)

    }
    const functionopenpopupremarks = (companyID, companyStatus, companyName, ename) => {
        setOpenRemarks(true);
        setFilteredRemarks(
            remarksHistory.filter((obj) => obj.companyID === companyID && obj.bdeName === ename)
        );
        // console.log(remarksHistory.filter((obj) => obj.companyID === companyID))
        setcid(companyID);
        setCstat(companyStatus);
        setCurrentCompanyName(companyName);

    };




    const [openRemarksEdit, setOpenRemarksEdit] = useState(false)
    const [remarksBdmName, setRemarksBdmName] = useState("")
    const [filteredRemarksBdm, setFilteredRemarksBdm] = useState([])

    const functionopenpopupremarksEdit = (companyID, companyStatus, companyName, bdmName) => {
        setOpenRemarksEdit(true);
        setFilteredRemarksBdm(
            remarksHistory.filter((obj) => obj.companyID === companyID && obj.bdmName === bdmName)
        );
        // console.log(remarksHistory.filter((obj) => obj.companyID === companyID))
        setcid(companyID);
        setCstat(companyStatus);
        setCurrentCompanyName(companyName);
        setRemarksBdmName(bdmName)
    };

    console.log("filteredRemarks", filteredRemarks)

    //console.log("currentcompanyname", currentCompanyName);

    const fetchRemarksHistory = async () => {
        try {
            const response = await axios.get(`${secretKey}/remarks-history`);
            setRemarksHistory(response.data.reverse());
            setFilteredRemarks(response.data.filter((obj) => obj.companyID === cid));

            console.log(response.data);
        } catch (error) {
            console.error("Error fetching remarks history:", error);
        }
    };


    useEffect(() => {
        fetchRemarksHistory();
    }, []);

    const debouncedSetChangeRemarks = useCallback(
        debounce((value) => {
            setChangeRemarks(value);
        }, 10), // Adjust the debounce delay as needed (e.g., 300 milliseconds)
        [] // Empty dependency array to ensure the function is memoized
    );

    const [isDeleted, setIsDeleted] = useState(false)
    const [maturedCompany, setMaturedCompany] = useState("")
    const [maturedEmail, setMaturedEmail] = useState("")
    const [maturedInco, setMaturedInco] = useState("")
    const [maturedId, setMaturedId] = useState("")
    const [maturedNumber, setMaturedNumber] = useState("")
    const [maturedOpen, setMaturedOpen] = useState(false)

    const handleRejectData = async (companyId) => {
        setIsDeleted(true)
    }

    const handleUpdate = async () => {
        // Now you have the updated Status and Remarks, perform the update logic
        console.log(cid, cstat, changeRemarks, remarksBdmName);
        const Remarks = changeRemarks;
        if (Remarks === "") {
            Swal.fire({ title: "Empty Remarks!", icon: "warning" });
            return true;
        }
        try {
            if (isDeleted) {
                const response = await axios.post(`${secretKey}/teamleads-rejectdata/${cid}`, {
                    bdmAcceptStatus: "NotForwarded",
                })
                const response2 = await axios.post(`${secretKey}/update-remarks/${cid}`, {
                    Remarks,
                });
                const response3 = await axios.post(
                    `${secretKey}/remarks-history/${cid}`,
                    {
                        Remarks,
                        remarksBdmName,

                    }
                );
                console.log("remarks", Remarks)
                if (response.status === 200) {
                    Swal.fire("Remarks updated!");
                    setChangeRemarks("");
                    // If successful, update the employeeData state or fetch data again to reflect changes
                    //fetchNewData(cstat);
                    //setCurrentRemarksBdm(changeRemarks)
                    fetchTeamLeadsData(cstat)
                    fetchRemarksHistory();
                    // setCstat("");
                    closePopUpRemarksEdit(); // Assuming fetchData is a function to fetch updated employee data
                } else {
                    // Handle the case where the API call was not successful
                    console.error("Failed to update status:", response.data.message);
                }

                console.log("response", response.data);
                fetchTeamLeadsData();
                Swal.fire("Data Rejected");
                setIsDeleted(false)

            } else {
                const response = await axios.post(`${secretKey}/update-remarks/${cid}`, {
                    Remarks,
                });
                const response2 = await axios.post(
                    `${secretKey}/remarks-history/${cid}`,
                    {
                        Remarks,
                        remarksBdmName,

                    }
                );
                console.log("remarks", Remarks)
                if (response.status === 200) {
                    Swal.fire("Remarks updated!");
                    setChangeRemarks("");
                    // If successful, update the employeeData state or fetch data again to reflect changes
                    //fetchNewData(cstat);
                    fetchTeamLeadsData(cstat)
                    fetchRemarksHistory();
                    // setCstat("");
                    closePopUpRemarksEdit(); // Assuming fetchData is a function to fetch updated employee data
                } else {
                    // Handle the case where the API call was not successful
                    console.error("Failed to update status:", response.data.message);
                }

            }
        } catch (error) {
            // Handle any errors that occur during the API call
            console.error("Error updating status:", error.message);
        }

        setUpdateData((prevData) => ({
            ...prevData,
            [companyId]: {
                ...prevData[companyId],
                isButtonEnabled: false,
            },
        }));

        //   // After updating, you can disable the button
    };

    // const handleUpdate = async () => {
    //   // Now you have the updated Status and Remarks, perform the update logic
    //   console.log(cid, cstat, changeRemarks);
    //   const Remarks = changeRemarks;
    //   if (Remarks === "") {
    //     Swal.fire({ title: "Empty Remarks!", icon: "warning" });
    //     return true;
    //   }
    //   try {
    //     // Make an API call to update the remarks in the database
    //     const response = await axios.post(`${secretKey}/update-remarks/${cid}`, {
    //       Remarks,
    //     });

    //     console.log("remarks", Remarks);

    //     // Check if the API call to update remarks was successful
    //     if (response.status === 200) {
    //       // If successful, proceed with rejecting the data
    //       Swal.fire("updated")
    //       const response2 = await axios.post(`${secretKey}/teamleads-rejectdata/${cid}`, {
    //         bdmAcceptStatus: "NotForwarded",
    //       });

    //       // Check if the API call to reject data was successful
    //       if (response2.status === 200) {
    //         // If both API calls were successful, fetch updated team leads data
    //         fetchTeamLeadsData();
    //         Swal.fire("Remarks updated and data rejected!");
    //         closePopUpRemarks(); // Close the remarks dialog
    //       } else {
    //         console.error("Failed to reject data:", response2.data.message);
    //       }
    //     } else {
    //       console.error("Failed to update remarks:", response.data.message);
    //     }
    //   } catch (error) {
    //     // Handle any errors that occur during the API calls
    //     console.error("Error updating remarks or rejecting data:", error.message);
    //   }

    //   setUpdateData((prevData) => ({
    //     ...prevData,
    //     [companyId]: {
    //       ...prevData[companyId],
    //       isButtonEnabled: false,
    //     },
    //   }));
    //   }));
    // };






    const handleAcceptClick = async (
        companyId,
        cName,
        cemail,
        cdate,
        cnumber,
        oldStatus,
        newBdmStatus
    ) => {
        try {
            const response = await axios.post(`${secretKey}/update-bdm-status/${companyId}`, {
                newBdmStatus,
                companyId,
                oldStatus,
                bdmAcceptStatus: "Accept",
            })

            if (response.status === 200) {
                Swal.fire("Accepted");
                fetchTeamLeadsData(oldStatus);
                //setBdmNewStatus(oldStatus)
            } else {
                console.error("Failed to update status:", response.data.message);
            }
        } catch (error) {
            console.log("Error updating status", error.message)
        }
    }

    console.log("bdmNewStatus", bdmNewStatus)



    // const handleRejectData = async (companyId) => {
    //   setIsDeleted(true)


    //   try {
    //     const response = await axios.post(`${secretKey}/teamleads-rejectdata/${companyId}`, {
    //       bdmAcceptStatus: "NotForwarded",
    //     })
    //     console.log("response", response.data);
    //     fetchTeamLeadsData();
    //     Swal.fire("Data Rejected");
    //   } catch (error) {
    //     console.log("error reversing bdm forwarded data", error.message);
    //     Swal.fire("Error rekecting data")
    //   }
    // }



    // try {
    //   const response = await axios.post(`${secretKey}/teamleads-rejectdata/${companyId}`, {
    //     bdmAcceptStatus: "NotForwarded",
    //   })
    //   console.log("response", response.data);
    //   fetchTeamLeadsData();
    //   Swal.fire("Data Rejected");
    // } catch (error) {
    //   console.log("error reversing bdm forwarded data", error.message);
    //   Swal.fire("Error rekecting data")
    // }


    const handlebdmStatusChange = async (
        companyId,
        bdmnewstatus,
        cname,
        cemail,
        cindate,
        cnum,
        bdeStatus,
        bdmOldStatus,
        bdeName
    ) => {
        const title = `${data.ename} changed ${cname} status from ${bdmOldStatus} to ${bdmnewstatus}`;
        const DT = new Date();
        const date = DT.toLocaleDateString();
        const time = DT.toLocaleTimeString();
        console.log("bdmnewstatus", bdmnewstatus)
        try {

            if (bdmnewstatus !== "Matured" && bdmnewstatus !== "Busy" && bdmnewstatus !== "Not Picked Up") {
                const response = await axios.post(
                    `${secretKey}/bdm-status-change/${companyId}`,
                    {
                        bdeStatus,
                        bdmnewstatus,
                        title,
                        date,
                        time,
                    }
                )
                console.log("yahan dikha ", bdmnewstatus)
                // Check if the API call was successful
                if (response.status === 200) {
                    // Assuming fetchData is a function to fetch updated employee data

                    fetchTeamLeadsData(bdmnewstatus);
                    setBdmNewStatus(bdmnewstatus)
                    setTeamLeadsData(teamData.filter((obj) => obj.bdmStatus === bdmnewstatus).sort((a, b) => new Date(b.bdeForwardDate) - new Date(a.bdeForwardDate)))


                } else {
                    // Handle the case where the API call was not successful
                    console.error("Failed to update status:", response.data.message);
                }

            } else if (bdmnewstatus === "Busy" || bdmnewstatus === "Not Picked Up") {

                const response = await axios.delete(
                    `${secretKey}/delete-bdm-busy/${companyId}`)
                console.log("yahan dikha", bdmnewstatus)
                // Check if the API call was successful
                if (response.status === 200) {
                    // Assuming fetchData is a function to fetch updated employee data

                    fetchTeamLeadsData(bdmnewstatus);
                    setBdmNewStatus(bdmnewstatus)
                    setTeamLeadsData(teamData.filter((obj) => obj.bdmStatus === bdmnewstatus).sort((a, b) => new Date(b.bdeForwardDate) - new Date(a.bdeForwardDate)))


                } else {
                    // Handle the case where the API call was not successful
                    console.error("Failed to update status:", response.data.message);
                }



            } else {
                // Use SweetAlert to confirm the "Matured" status
                const requestData = {
                    companyName: cname,
                    requestStatus: "Pending",
                    bdeName: bdeName,
                    bdmName: data.ename,
                    date: new Date(),
                    time: new Date().toLocaleTimeString(), // Assuming you want the current time
                };

                // Make API call to send the request
                axios
                    .post(`${secretKey}/matured-case-request`, requestData)
                    .then((response) => {
                        if (response.status === 200) {
                            // Assuming fetchData is a function to fetch updated employee data
                            fetchTeamLeadsData(bdmnewstatus);
                            setBdmNewStatus(bdmnewstatus);
                            setTeamLeadsData(
                                teamData.filter((obj) => obj.bdmStatus === bdmnewstatus)
                            );
                            Swal.fire(
                                "Request Sent",
                                "Request has been successfully sent to the BDE",
                                "success"
                            );
                        } else {
                            Swal.fire("Error", "Failed to sent Request", "error");
                            console.error("Failed to update status:", response.data.message);
                        }
                    })
                    .catch((error) => {
                        console.error("Error sending request to backend:", error);
                    });
            }
            // Make an API call to update the employee status in the database

        } catch (error) {
            // Handle any errors that occur during the API call
            console.error("Error updating status:", error.message);
        }

    }

    const handleDeleteRemarks = async (remarks_id, remarks_value) => {
        const mainRemarks = remarks_value === currentRemarks ? true : false;
        console.log(mainRemarks);
        const companyId = cid;
        console.log("Deleting Remarks with", remarks_id);
        try {
            // Send a delete request to the backend to delete the item with the specified ID
            await axios.delete(`${secretKey}/remarks-history/${remarks_id}`);
            if (mainRemarks) {
                await axios.delete(`${secretKey}/remarks-delete/${companyId}`);
            }
            // Set the deletedItemId state to trigger re-fetching of remarks history
            Swal.fire("Remarks Deleted");
            fetchRemarksHistory();
            //fetchNewData(cstat);
        } catch (error) {
            console.error("Error deleting remarks:", error);
        }
    };


    // -----------------------------projection------------------------------
    const [projectingCompany, setProjectingCompany] = useState("");
    const [openProjection, setOpenProjection] = useState(false);
    const [currentProjection, setCurrentProjection] = useState({
        companyName: "",
        ename: "",
        offeredPrize: 0,
        offeredServices: [],
        lastFollowUpdate: "",
        totalPayment: 0,
        estPaymentDate: "",
        remarks: "",
        date: "",
        time: "",
        editCount: -1,
        totalPaymentError: "",
    });
    const [selectedValues, setSelectedValues] = useState([]);
    const [isEditProjection, setIsEditProjection] = useState(false);
    const [openAnchor, setOpenAnchor] = useState(false);


    const functionopenprojection = (comName) => {
        setProjectingCompany(comName);
        setOpenProjection(true);
        const findOneprojection =
            projectionData.length !== 0 &&
            projectionData.find((item) => item.companyName === comName);
        if (findOneprojection) {
            setCurrentProjection({
                companyName: findOneprojection.companyName,
                ename: findOneprojection.ename,
                offeredPrize: findOneprojection.offeredPrize,
                offeredServices: findOneprojection.offeredServices,
                lastFollowUpdate: findOneprojection.lastFollowUpdate,
                estPaymentDate: findOneprojection.estPaymentDate,
                remarks: findOneprojection.remarks,
                totalPayment: findOneprojection.totalPayment,
                date: "",
                time: "",
                editCount: findOneprojection.editCount,
            });
            setSelectedValues(findOneprojection.offeredServices);
        }
    };

    const closeProjection = () => {
        setOpenProjection(false);
        setProjectingCompany("");
        setCurrentProjection({
            companyName: "",
            ename: "",
            offeredPrize: "",
            offeredServices: "",
            totalPayment: 0,
            lastFollowUpdate: "",
            remarks: "",
            date: "",
            time: "",
        });
        setIsEditProjection(false);
        setSelectedValues([]);
    };
    const functionopenAnchor = () => {
        setTimeout(() => {
            setOpenAnchor(true);
        }, 1000);
    };
    const closeAnchor = () => {
        setOpenAnchor(false);
    };
    const fetchRedesignedFormData = async () => {
        try {
            console.log(maturedID);
            const response = await axios.get(
                `${secretKey}/redesigned-final-leadData`
            );
            const data = response.data.find((obj) => obj.company === maturedID);
            console.log(data);
            setCurrentForm(data);
        } catch (error) {
            console.error("Error fetching data:", error.message);
        }
    };
    useEffect(() => {
        console.log("Matured ID Changed", maturedID);
        if (maturedID) {
            fetchRedesignedFormData();
        }
    }, [maturedID]);

    const handleDelete = async (company) => {
        const companyName = company;
        console.log(companyName);

        try {
            // Send a DELETE request to the backend API endpoint
            const response = await axios.delete(
                `${secretKey}/delete-followup/${companyName}`
            );
            console.log(response.data.message); // Log the response message
            // Show a success message after successful deletion
            console.log("Deleted!", "Your data has been deleted.", "success");
            setCurrentProjection({
                companyName: "",
                ename: "",
                offeredPrize: 0,
                offeredServices: [],
                lastFollowUpdate: "",
                totalPayment: 0,
                estPaymentDate: "",
                remarks: "",
                date: "",
                time: "",
            });
            setSelectedValues([]);
            fetchProjections();
        } catch (error) {
            console.error("Error deleting data:", error);
            // Show an error message if deletion fails
            console.log("Error!", "Follow Up Not Found.", "error");
        }
    };

    const handleProjectionSubmit = async () => {
        try {
            const newEditCount =
                currentProjection.editCount === -1
                    ? 0
                    : currentProjection.editCount + 1;

            const finalData = {
                ...currentProjection,
                companyName: projectingCompany,
                ename: data.ename,
                offeredServices: selectedValues,
                editCount: currentProjection.editCount + 1, // Increment editCount
            };

            if (finalData.offeredServices.length === 0) {
                Swal.fire({ title: "Services is required!", icon: "warning" });
            } else if (finalData.remarks === "") {
                Swal.fire({ title: "Remarks is required!", icon: "warning" });
            } else if (Number(finalData.totalPayment) === 0) {
                Swal.fire({ title: "Total Payment Can't be 0!", icon: "warning" });
            } else if (finalData.totalPayment === "") {
                Swal.fire({ title: "Total Payment Can't be 0", icon: "warning" });
            } else if (Number(finalData.offeredPrize) === 0) {
                Swal.fire({ title: "Offered Prize is required!", icon: "warning" });
            } else if (
                Number(finalData.totalPayment) > Number(finalData.offeredPrize)
            ) {
                Swal.fire({
                    title: "Total Payment cannot be greater than Offered Prize!",
                    icon: "warning",
                });
            } else if (finalData.lastFollowUpdate === null) {
                Swal.fire({
                    title: "Last FollowUp Date is required!",
                    icon: "warning",
                });
            } else if (finalData.estPaymentDate === 0) {
                Swal.fire({
                    title: "Estimated Payment Date is required!",
                    icon: "warning",
                });
            } else {
                // Send data to backend API
                const response = await axios.post(
                    `${secretKey}/update-followup`,
                    finalData
                );
                Swal.fire({ title: "Projection Submitted!", icon: "success" });
                setOpenProjection(false);
                setCurrentProjection({
                    companyName: "",
                    ename: "",
                    offeredPrize: 0,
                    offeredServices: [],
                    lastFollowUpdate: "",
                    remarks: "",
                    date: "",
                    time: "",
                    editCount: newEditCount,
                    totalPaymentError: "", // Increment editCount
                });
                fetchProjections();
                setSelectedValues([]);
            }
        } catch (error) {
            console.error("Error updating or adding data:", error.message);
        }
    };

    const fetchProjections = async () => {
        try {
            const response = await axios.get(
                `${secretKey}/projection-data/${data.ename}`
            );
            setProjectionData(response.data);
        } catch (error) {
            console.error("Error fetching Projection Data:", error.message);
        }
    };

    useEffect(() => {
        fetchProjections();
    }, [data]);


    const [openFeedback, setOpenFeedback] = useState(false)
    const [feedbackCompanyName, setFeedbackCompanyName] = useState("")
    const [valueSlider, setValueSlider] = useState(0)
    const [valueSlider2, setValueSlider2] = useState(0)
    const [valueSlider3, setValueSlider3] = useState(0)
    const [valueSlider4, setValueSlider4] = useState(0)
    const [valueSlider5, setValueSlider5] = useState(0)
    const [feedbackRemarks, setFeedbackRemarks] = useState("")
    const [companyFeedbackId, setCompanyFeedbackId] = useState("")
    const [isEditFeedback, setIsEditFeedback] = useState(false)
    const [feedbackPoints, setFeedbackPoints] = useState([])


    const handleOpenFeedback = (companyName, companyId, companyFeedbackPoints, companyFeedbackRemarks, bdmStatus) => {
        setOpenFeedback(true)
        setFeedbackCompanyName(companyName)
        setCompanyFeedbackId(companyId)
        setFeedbackPoints(companyFeedbackPoints)
        //setFeedbackRemarks(companyFeedbackRemarks)
        debouncedFeedbackRemarks(companyFeedbackRemarks)
        setValueSlider(companyFeedbackPoints[0])
        setValueSlider2(companyFeedbackPoints[1])
        setValueSlider3(companyFeedbackPoints[2])
        setValueSlider4(companyFeedbackPoints[3])
        setValueSlider5(companyFeedbackPoints[4])
        setBdmNewStatus(bdmStatus)
        //setIsEditFeedback(true)
    }
    console.log("yahan locha h", feedbackPoints.length)



    const handleCloseFeedback = () => {
        setOpenFeedback(false)
        setValueSlider(0)
        setCompanyFeedbackId("")
        setFeedbackCompanyName("")
        setFeedbackRemarks("")
        setIsEditFeedback(false)
    }

    const handleSliderChange = (value, sliderNumber) => {
        switch (sliderNumber) {
            case 1:
                setValueSlider(value);
                break;
            case 2:
                setValueSlider2(value);
                break;
            case 3:
                setValueSlider3(value);
                break;
            case 4:
                setValueSlider4(value);
                break;
            case 5:
                setValueSlider5(value);
                break;
            default:
                break;
        }
    };

    //console.log("valueSlider", valueSlider, feedbackRemarks)




    const debouncedFeedbackRemarks = useCallback(
        debounce((value) => {
            setFeedbackRemarks(value);
        }, 10), // Adjust the debounce delay as needed (e.g., 300 milliseconds)
        [] // Empty dependency array to ensure the function is memoized
    );

    const handleFeedbackSubmit = async () => {
        const data = {
            feedbackPoints: [valueSlider, valueSlider2, valueSlider3, valueSlider4, valueSlider5],
            feedbackRemarks: feedbackRemarks,
        };

        try {
            const response = await axios.post(`${secretKey}/post-feedback-remarks/${companyFeedbackId}`, data
            );

            if (response.status === 200) {
                Swal.fire("Feedback Updated");
                fetchTeamLeadsData(bdmNewStatus);
                setTeamLeadsData(teamData.filter((obj) => obj.bdmStatus === bdmNewStatus)
                    .sort((a, b) => new Date(b.bdeForwardDate) - new Date(a.bdeForwardDate)));
                handleCloseFeedback();
                //setdataStatus(bdmNewStatus)
            }
        } catch (error) {
            Swal.fire("Error sending feedback");
            console.log("error", error.message);
        }
    };

    const handleChangeUrlPrev = () => {
        const currId = id;
        //console.log(eData); // This is how the array looks like ['65bcb5ac2e8f74845bdc6211', '65bde8cf23df48d5fe3227ca']

        // Find the index of the currentId in the eData array
        const currentIndex = eData.findIndex((itemId) => itemId === currId);

        if (currentIndex !== -1) {
            // Calculate the previous index in a circular manner
            const prevIndex = (currentIndex - 1 + eData.length) % eData.length;

            if (currentIndex === 0) {
                // If it's the first page, navigate to the employees page
                window.location.replace(`/admin/admin-user`);
                setBackButton(false)
            } else {
                // Get the previousId from the eData array
                const prevId = eData[prevIndex];
                window.location.replace(`/admin/employeeleads/${prevId}`);
            }

            //setBackButton(prevIndex !== 0);
        } else {
            console.log("Current ID not found in eData array.");
        }
    };

    const [employeeName, setEmployeeName] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [AddForm, setAddForm] = useState(false);
    const [employeeData, setEmployeeData] = useState([]);
    const [moreEmpData, setmoreEmpData] = useState([]);
    const [backButton, setBackButton] = useState(false);

    const [openAssign, openchangeAssign] = useState(false);
    const [selectedField, setSelectedField] = useState("Company Name");
    const [visibility, setVisibility] = useState("none");
    const [visibilityOther, setVisibilityOther] = useState("block");
    const [visibilityOthernew, setVisibilityOthernew] = useState("none");
    const [searchText, setSearchText] = useState("");
    const [citySearch, setcitySearch] = useState("");
    const [month, setMonth] = useState(0);
    const [year, setYear] = useState(0);
    const [subFilterValue, setSubFilterValue] = useState("");
    const [currentTab, setCurrentTab] = useState("TeamLeads");
    const [newemployeeSelection, setnewEmployeeSelection] = useState("Not Alloted");


    const handleChangeUrl = () => {
        const currId = id;
        //console.log(eData); // This is how the array looks like ['65bcb5ac2e8f74845bdc6211', '65bde8cf23df48d5fe3227ca']

        // Find the index of the currentId in the eData array
        const currentIndex = eData.findIndex((itemId) => itemId === currId);

        if (currentIndex !== -1) {
            // Calculate the next index in a circular manner
            const nextIndex = (currentIndex + 1) % eData.length;

            // Get the nextId from the eData array
            const nextId = eData[nextIndex];
            window.location.replace(`/admin/employeeleads/${nextId}`);


            //setBackButton(nextId !== 0);
        } else {
            console.log("Current ID not found in eData array.");
        }
    };

    const functionOpenAssign = () => {
        openchangeAssign(true);
    };
    const closepopupAssign = () => {
        openchangeAssign(false);
    };
    const [selectedOption, setSelectedOption] = useState("direct");

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };



    const handleUploadData = async (e) => {
        //console.log("Uploading data");

        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();
        const bdmAcceptStatus = "NotForwarded"


        const csvdata = teamleadsData
            .filter((employee) => selectedRows.includes(employee._id))
            .map((employee) => {
                if (
                    employee.bdmStatus === "Interested" ||
                    employee.bdmStatus === "FollowUp"
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
            });

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
            console.log(newemployeeSelection, data, bdmAcceptStatus)
            // Add the promise for updating CompanyModel to the array
            updatePromises.push(
                axios.post(`${secretKey}/assign-leads-newbdm`, {
                    newemployeeSelection,
                    data: updatedObj,
                    bdmAcceptStatus,
                })
            );
        }

        try {
            // Wait for all update promises to resolve
            await Promise.all(updatePromises);
            //console.log("Employee data updated!");

            // Clear the selection
            setnewEmployeeSelection("Not Alloted");
            fetchTeamLeadsData();

            Swal.fire({
                title: "Data Sent!",
                text: "Data sent successfully!",
                icon: "success",
            });

            // Fetch updated employee details and new data
            //fetchEmployeeDetails();
            //fetchNewData();
            closepopupAssign();
        } catch (error) {
            console.error("Error updating employee data:", error);

            Swal.fire({
                title: "Error!",
                text: "Failed to update employee data. Please try again later.",
                icon: "error",
            });
        }
    };

    //console.log("new" , newemployeeSelection)

    const handleFieldChange = (event) => {
        if (event.target.value === "Company Incorporation Date  ") {
            setSelectedField(event.target.value);
            setVisibility("block");
            setVisibilityOther("none");
            setSubFilterValue("");
            setVisibilityOthernew("none");
        } else if (event.target.value === "Status") {
            setSelectedField(event.target.value);
            setVisibility("none");
            setVisibilityOther("none");
            setSubFilterValue("");
            setVisibilityOthernew("block");
        } else {
            setSelectedField(event.target.value);
            setVisibility("none");
            setVisibilityOther("block");
            setSubFilterValue("");
            setVisibilityOthernew("none");
        }

        console.log(selectedField);
    };

    const filteredData = teamleadsData.filter((company) => {
        const fieldValue = company[selectedField];

        if (selectedField === "State" && citySearch) {
            // Handle filtering by both State and City
            const stateMatches = fieldValue
                .toLowerCase()
                .includes(searchText.toLowerCase());
            const cityMatches = company.City.toLowerCase().includes(
                citySearch.toLowerCase()
            );
            return stateMatches && cityMatches;
        } else if (selectedField === "Company Incorporation Date  ") {
            // Assuming you have the month value in a variable named `month`
            if (month == 0) {
                return fieldValue.includes(searchText);
            } else if (year == 0) {
                return fieldValue.includes(searchText);
            }
            const selectedDate = new Date(fieldValue);
            const selectedMonth = selectedDate.getMonth() + 1; // Months are 0-indexed
            const selectedYear = selectedDate.getFullYear();

            // Use the provided month variable in the comparison
            return (
                selectedMonth.toString().includes(month) &&
                selectedYear.toString().includes(year)
            );
        } else if (selectedField === "Status" && searchText === "All") {
            // Display all data when Status is "All"
            return true;
        } else {
            // Your existing filtering logic for other fields
            if (typeof fieldValue === "string") {
                return fieldValue.toLowerCase().includes(searchText.toLowerCase());
            } else if (typeof fieldValue === "number") {
                return fieldValue.toString().includes(searchText);
            } else if (fieldValue instanceof Date) {
                // Handle date fields
                return fieldValue.includes(searchText);
            }

            return false;
        }
    });

    const handleDateChange = (e) => {
        const dateValue = e.target.value;
        setCurrentPage(0);

        // Check if the dateValue is not an empty string
        if (dateValue) {
            const dateObj = new Date(dateValue);
            const formattedDate = dateObj.toISOString().split("T")[0];
            setSearchText(formattedDate);
        } else {
            // Handle the case when the date is cleared
            setSearchText("");
        }
    };

    // ------------------------------panel-----------------------------------------

    function CustomTabPanel(props) {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 3 }}>
                        <Typography>{children}</Typography>
                    </Box>
                )}
            </div>
        );
    }

    CustomTabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
    };

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }
    const location = useLocation()
    const [value, setValue] = React.useState(location.pathname === `/admin/employeesleads/${id}` ? 0 : 1);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    console.log(value)

    // -------------------------------------------handle checkbox----------------------------------------------------------


    const handleCheckboxChange = (id, event) => {
        // If the id is 'all', toggle all checkboxes
        if (id === "all") {
            // If all checkboxes are already selected, clear the selection; otherwise, select all
            setSelectedRows((prevSelectedRows) =>
                prevSelectedRows.length === filteredData.length
                    ? []
                    : filteredData.map((row) => row._id)
            );
        } else {
            // Toggle the selection status of the row with the given id
            setSelectedRows((prevSelectedRows) => {
                // If the Ctrl key is pressed
                if (event.ctrlKey) {
                    //console.log("pressed");
                    const selectedIndex = filteredData.findIndex((row) => row._id === id);
                    const lastSelectedIndex = filteredData.findIndex((row) =>
                        prevSelectedRows.includes(row._id)
                    );

                    // Select rows between the last selected row and the current row
                    if (lastSelectedIndex !== -1 && selectedIndex !== -1) {
                        const start = Math.min(selectedIndex, lastSelectedIndex);
                        const end = Math.max(selectedIndex, lastSelectedIndex);
                        const idsToSelect = filteredData
                            .slice(start, end + 1)
                            .map((row) => row._id);

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

    const [startRowIndex, setStartRowIndex] = useState(null);

    const handleMouseEnter = (id) => {
        // Update selected rows during drag selection
        if (startRowIndex !== null) {
            const endRowIndex = filteredData.findIndex((row) => row._id === id);
            const selectedRange = [];
            const startIndex = Math.min(startRowIndex, endRowIndex);
            const endIndex = Math.max(startRowIndex, endRowIndex);

            for (let i = startIndex; i <= endIndex; i++) {
                selectedRange.push(filteredData[i]._id);
            }

            setSelectedRows(selectedRange);

            // Scroll the window vertically when dragging beyond the visible viewport
            const windowHeight = document.documentElement.clientHeight;
            const mouseY = window.event.clientY;
            const tableHeight = document.querySelector("table").clientHeight;
            const maxVisibleRows = Math.floor(
                windowHeight / (tableHeight / filteredData.length)
            );

            if (mouseY >= windowHeight - 20 && endIndex >= maxVisibleRows) {
                window.scrollTo(0, window.scrollY + 20);
            }
        }
    };

    const handleMouseUp = () => {
        // End drag selection
        setStartRowIndex(null);
    };

    const handleMouseDown = (id) => {
        // Initiate drag selection
        setStartRowIndex(filteredData.findIndex((row) => row._id === id));
    };

    function formatDateNow(timestamp) {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }





    return (
        <div>
            <Header />
            <Navbar />
            {!formOpen && <div className="page-wrapper">

                <div style={{
                    margin: "3px 0px 1px 0px",
                }} className="page-header d-print-none">
                    <div className="container-xl">
                        <div className="row g-2 align-items-center">
                            <div className="col d-flex justify-content-between">
                                {/* <!-- Page pre-title --> */}
                                <div className="d-flex">
                                    <IconButton>
                                        <IconChevronLeft onClick={handleChangeUrlPrev} />
                                    </IconButton>
                                    <h2 className="page-title">{data.ename}</h2>
                                    <div className="nextBtn">
                                        <IconButton onClick={handleChangeUrl}>
                                            <IconChevronRight
                                                style={
                                                    {
                                                        // backgroundColor: "#fbb900",
                                                        // borderRadius: "5px",
                                                        // padding: "2px",
                                                        // color: "white"
                                                    }
                                                }
                                            />
                                        </IconButton>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center justify-content-center">
                                    {selectedRows.length !== 0 && (
                                        <div className="request mr-1">
                                            <div className="btn-list">
                                                <button
                                                    onClick={functionOpenAssign}
                                                    className="btn btn-primary d-none d-sm-inline-block 2"
                                                >
                                                    Assign Data
                                                </button>
                                                <a
                                                    href="#"
                                                    className="btn btn-primary d-sm-none btn-icon"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#modal-report"
                                                    aria-label="Create new report"
                                                >
                                                    {/* <!-- Download SVG icon from http://tabler-icons.io/i/plus --> */}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-control sort-by">
                                        <label htmlFor="sort-by">Sort By:</label>
                                        <select
                                            style={{
                                                border: "none",
                                                outline: "none",
                                                color: "#666a66",
                                            }}
                                            name="sort-by"
                                            id="sort-by"
                                            onChange={(e) => {
                                                const selectedOption = e.target.value;

                                                switch (selectedOption) {
                                                    case "Busy":
                                                    case "Untouched":
                                                    case "Not Picked Up":
                                                        setBdmNewStatus("Untouched");
                                                        setTeamLeadsData(
                                                            teamData
                                                                .filter((data) =>
                                                                    [
                                                                        "Busy",
                                                                        "Untouched",
                                                                        "Not Picked Up",
                                                                    ].includes(data.bdmStatus)
                                                                )
                                                                .sort((a, b) => {
                                                                    if (a.bdmStatus === selectedOption) return -1;
                                                                    if (b.bdmStatus === selectedOption) return 1;
                                                                    return 0;
                                                                })
                                                        );
                                                        break;
                                                    case "Interested":
                                                        setBdmNewStatus("Interested");
                                                        setTeamLeadsData(
                                                            teamData
                                                                .filter((data) => data.bdmStatus === "Interested")
                                                                .sort((a, b) =>
                                                                    a.AssignDate.localeCompare(b.AssignDate)
                                                                )
                                                        );
                                                        break;
                                                    case "Not Interested":
                                                        setBdmNewStatus("NotInterested");
                                                        setTeamLeadsData(
                                                            teamData
                                                                .filter((data) =>
                                                                    ["Not Interested", "Junk"].includes(
                                                                        data.bdmStatus
                                                                    )
                                                                )
                                                                .sort((a, b) =>
                                                                    a.AssignDate.localeCompare(b.AssignDate)
                                                                )
                                                        );
                                                        break;
                                                    case "FollowUp":
                                                        setBdmNewStatus("FollowUp");
                                                        setTeamLeadsData(
                                                            teamData
                                                                .filter((data) => data.bdmStatus === "FollowUp")
                                                                .sort((a, b) =>
                                                                    a.AssignDate.localeCompare(b.AssignDate)
                                                                )
                                                        );
                                                        break;
                                                    case "BdeForwardDate":
                                                        setBdmNewStatus("BdeForwardDate");
                                                        setTeamLeadsData(
                                                            teamData.sort((a, b) =>
                                                                b.bdeForwardDate.localeCompare(a.bdeForwardDate)
                                                            )
                                                        );
                                                        break;
                                                    case "Company Incorporation Date  ":
                                                        setBdmNewStatus("CompanyIncorporationDate");
                                                        setTeamLeadsData(
                                                            teamData.sort((a, b) =>
                                                                b["Company Incorporation Date  "].localeCompare(
                                                                    a["Company Incorporation Date  "]
                                                                )
                                                            )
                                                        );
                                                        break;
                                                    default:
                                                        // No filtering if default option selected
                                                        setBdmNewStatus("Untouched");
                                                        setTeamLeadsData(
                                                            teamData.sort((a, b) => {
                                                                if (a.bdmStatus === selectedOption) return -1;
                                                                if (b.bdmStatus === selectedOption) return 1;
                                                                return 0;
                                                            })
                                                        );
                                                        break;
                                                }
                                            }}
                                        >
                                            <option value="" disabled selected>
                                                Select Status
                                            </option>
                                            <option value="Untouched">Untouched</option>
                                            <option value="Busy">Busy</option>
                                            <option value="Not Picked Up">Not Picked Up</option>
                                            <option value="FollowUp">Follow Up</option>
                                            <option value="Interested">Interested</option>
                                            <option value="Not Interested">Not Interested</option>
                                            <option value="BdeForwardDate">Bde Forward Date</option>
                                            <option value="Company Incorporation Date  ">
                                                C.Inco. Date
                                            </option>
                                        </select>
                                    </div>
                                    {/* {bdmWorkOn ? (
                                                  <button className="btn btn-primary d-none d-sm-inline-block ml-1" onClick={() => handleReverseBdmWork()}>
                                                         Revoke Bdm Work
                                                              </button>
                                                        ) : (
                                               <button className="btn btn-primary d-none d-sm-inline-block ml-1" onClick={() => handleAssignBdmWork()}>
                                                                   Assign Bdm Work
                                                                           </button>
                                                                   )} */}
                                    <Link
                                        to={`/admin/employees/${id}/login-details`}
                                        style={{ marginLeft: "10px" }}>
                                        <button className="btn btn-primary d-none d-sm-inline-block">
                                            Login Details
                                        </button>
                                    </Link>
                                    <div>
                                        <Link
                                            to={`/admin/admin-user`}
                                            style={{ marginLeft: "10px" }}>
                                            <button className="btn btn-primary d-none d-sm-inline-block">
                                                <span>
                                                    <FaArrowLeft
                                                        style={{
                                                            marginRight: "10px",
                                                            marginBottom: "3px",
                                                        }}
                                                    />
                                                </span>
                                                Back
                                            </button>
                                        </Link>
                                    </div>

                                </div>
                            </div>

                            {/* <!-- Page title actions --> */}
                        </div>
                    </div>
                </div>
                <div className="container-xl card mt-2 mb-2" style={{ width: "95%" }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                            <a
                                href="#tabs-home-5"
                                onClick={() => {
                                    setCurrentTab("Leads")
                                    window.location.pathname = `/admin/employees/${id}`
                                }}
                                className={
                                    currentTab === "Leads"
                                        ? "nav-link"
                                        : "nav-link"
                                }
                                data-bs-toggle="tab"
                            >
                                <Tab value={value} index={0} label={
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <MdOutlinePersonPin style={{ height: "24px", width: "19px", marginRight: "5px" }} />
                                        <span style={{ fontSize: "12px" }}>
                                            Leads </span>
                                    </div>
                                } {...a11yProps(0)} /></a>

                            {bdmWorkOn && (<a
                                href="#tabs-activity-5"
                                onClick={() => {
                                    setCurrentTab("TeamLeads")
                                    window.location.pathname = `/admin/employeeleads/${id}`
                                }}
                                className={
                                    currentTab === "TeamLeads"
                                        ? "nav-link"
                                        : "nav-link"
                                }
                                data-bs-toggle="tab">
                                <Tab value={value} index={1}
                                    label={
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <AiOutlineTeam style={{ height: "24px", width: "19px", marginRight: "5px" }} />
                                            <span style={{ fontSize: "12px" }}>
                                                Team Leads</span>
                                        </div>
                                    }
                                    {...a11yProps(1)}
                                /></a>)}
                        </Tabs>
                    </Box>
                </div>
                <div className="page-body" onCopy={(e) => {
                    e.preventDefault();
                }}>
                    <div className="container-xl">
                        <div className="row g-2 align-items-center">
                            <div className="col-2">
                                <div
                                    className="form-control"
                                    style={{ height: "fit-content", width: "auto" }}
                                >
                                    <select
                                        style={{
                                            border: "none",
                                            outline: "none",
                                            width: "fit-content",
                                        }}
                                        value={selectedField}
                                        onChange={handleFieldChange}
                                    >
                                        <option value="Company Name">Company Name</option>
                                        <option value="Company Number">Company Number</option>
                                        <option value="Company Email">Company Email</option>
                                        <option value="Company Incorporation Date  ">
                                            Company Incorporation Date
                                        </option>
                                        <option value="City">City</option>
                                        <option value="State">State</option>
                                        <option value="Status">Status</option>
                                    </select>
                                </div>
                            </div>

                            {visibility === "block" && (
                                <div className="col-2">
                                    <input
                                        onChange={handleDateChange}
                                        style={{ display: visibility }}
                                        type="date"
                                        className="form-control"
                                    />
                                </div>
                            )}
                            <div className="col-2">
                                {visibilityOther === "block" && (
                                    <div
                                        style={{
                                            //width: "20vw",
                                            //margin: "0px 8px",
                                            display: visibilityOther,
                                        }}
                                        className="input-icon"
                                    >
                                        <span className="input-icon-addon">
                                            {/* <!-- Download SVG icon from http://tabler-icons.io/i/search --> */}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="icon"
                                                width="20"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                stroke-width="2"
                                                stroke="currentColor"
                                                fill="none"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                            >
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                                                <path d="M21 21l-6 -6" />
                                            </svg>
                                        </span>
                                        <input
                                            type="text"
                                            value={searchText}
                                            onChange={(e) => {
                                                setSearchText(e.target.value);
                                                setCurrentPage(0);
                                            }}
                                            className="form-control"
                                            placeholder="Search…"
                                            aria-label="Search in website"
                                        />
                                    </div>
                                )}
                                {visibilityOthernew === "block" && (
                                    <div
                                        style={{
                                            //width: "20vw",
                                            width: "120px",
                                            // margin: "0px 8px",
                                            display: visibilityOthernew,
                                        }}
                                        className="input-icon"
                                    >
                                        <select
                                            value={searchText}
                                            onChange={(e) => {
                                                setSearchText(e.target.value);
                                                // Set dataStatus based on selected option
                                                if (
                                                    e.target.value === "All" ||
                                                    e.target.value === "Busy" ||
                                                    e.target.value === "Not Picked Up"
                                                ) {
                                                    setdataStatus("All");
                                                } else if (
                                                    e.target.value === "Junk" ||
                                                    e.target.value === "Not Interested"
                                                ) {
                                                    setdataStatus("NotInterested");
                                                } else if (e.target.value === "Interested") {
                                                    setdataStatus("Interested");
                                                } else if (e.target.value === "Untouched") {
                                                    setEmployeeData(
                                                        moreEmpData.filter(
                                                            (obj) => obj.Status === "Untouched"
                                                        )
                                                    );
                                                }
                                            }}
                                            className="form-select"
                                        >
                                            <option value="All">All</option>
                                            <option value="Busy">Busy</option>
                                            <option value="Not Picked Up">Not Picked Up</option>
                                            <option value="Junk">Junk</option>
                                            <option value="Interested">Interested</option>
                                            <option value="Not Interested">Not Interested</option>
                                            <option value="Untouched">Untouched</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div
                                className="col-2"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "7px",
                                }}
                            >
                                {selectedField === "State" && (
                                    <div style={{ marginLeft: "-16px" }} className="input-icon">
                                        <span className="input-icon-addon">
                                            {/* <!-- Download SVG icon from http://tabler-icons.io/i/search --> */}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="icon"
                                                width="20"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                stroke-width="2"
                                                stroke="currentColor"
                                                fill="none"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                            >
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                                                <path d="M21 21l-6 -6" />
                                            </svg>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={citySearch}
                                            onChange={(e) => {
                                                setcitySearch(e.target.value);
                                                setCurrentPage(0);
                                            }}
                                            placeholder="Search City"
                                            aria-label="Search in website"
                                        />
                                    </div>
                                )}
                                {selectedField === "Company Incorporation Date  " && (
                                    <>
                                        <div
                                            style={{ width: "fit-content" }}
                                            className="form-control"
                                        >
                                            <select
                                                style={{ border: "none", outline: "none" }}
                                                onChange={(e) => {
                                                    setMonth(e.target.value);
                                                    setCurrentPage(0);
                                                }}
                                            >
                                                <option value="" disabled selected>
                                                    Select Month
                                                </option>
                                                <option value="12">December</option>
                                                <option value="11">November</option>
                                                <option value="10">October</option>
                                                <option value="9">September</option>
                                                <option value="8">August</option>
                                                <option value="7">July</option>
                                                <option value="6">June</option>
                                                <option value="5">May</option>
                                                <option value="4">April</option>
                                                <option value="3">March</option>
                                                <option value="2">February</option>
                                                <option value="1">January</option>
                                            </select>
                                        </div>
                                        <div className="input-icon form-control">
                                            <select
                                                select
                                                style={{ border: "none", outline: "none" }}
                                                value={year}
                                                onChange={(e) => {
                                                    setYear(e.target.value);
                                                    setCurrentPage(0); // Reset page when year changes
                                                }}
                                            >
                                                <option value="">Select Year</option>
                                                {[...Array(15)].map((_, index) => {
                                                    const yearValue = 2024 - index;
                                                    return (
                                                        <option key={yearValue} value={yearValue}>
                                                            {yearValue}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div
                                style={{ display: "flex", justifyContent: "space-between" }}
                                className="features"
                            >
                                <div style={{ display: "flex" }} className="feature1 mb-2">
                                    {selectedRows.length !== 0 && (
                                        <div className="form-control">
                                            {selectedRows.length} Data Selected
                                        </div>
                                    )}
                                    {searchText !== "" && (
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                fontSize: "16px",
                                                fontFamily: "sans-serif",
                                            }}
                                            className="results"
                                        >
                                            {filteredData.length} results found
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* <!-- Page title actions --> */}
                        </div>
                        {/* <div class="card-header my-tab">
                            <ul
                                class="nav nav-tabs card-header-tabs nav-fill p-0"
                                data-bs-toggle="tabs"
                            >
                                <li class="nav-item data-heading">
                                    <a
                                        href="#tabs-home-5"
                                        onClick={() => {
                                            setCurrentTab("Leads")
                                            window.location.pathname = `/admin/employees/${id}`
                                        }}
                                        className={
                                            currentTab === 'Leads'
                                                ? "nav-link active item-act"
                                                : "nav-link"
                                        }
                                        data-bs-toggle="tab"
                                    >
                                        Leads{" "}
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a
                                        href="#tabs-activity-5"
                                        onClick={() => {
                                            setCurrentTab("TeamLeads")
                                            window.location.pathname = `/admin/employeeleads/${id}`
                                        }}
                                        className={
                                            currentTab === "TeamLeads"
                                                ? "nav-link active item-act"
                                                : "nav-link"
                                        }
                                        data-bs-toggle="tab"
                                    >
                                        <span>Team Leads</span>
                                    </a>
                                </li>
                            </ul>
                        </div> */}
                        <div class="card-header my-tab">
                            <ul class="nav nav-tabs card-header-tabs nav-fill p-0"
                                data-bs-toggle="tabs">
                                <li class="nav-item data-heading">
                                    <a
                                        href="#tabs-home-5"
                                        onClick={() => {
                                            setBdmNewStatus("Untouched");
                                            //setCurrentPage(0);
                                            setTeamLeadsData(
                                                teamData.filter(
                                                    (obj) =>
                                                        //obj.bdmStatus === "Busy" ||
                                                        //obj.bdmStatus === "Not Picked Up" ||
                                                        obj.bdmStatus === "Untouched"
                                                ).sort((a, b) => new Date(b.bdeForwardDate) - new Date(a.bdeForwardDate))
                                            );
                                        }}
                                        className={
                                            bdmNewStatus === "Untouched"
                                                ? "nav-link active item-act"
                                                : "nav-link"
                                        }
                                        data-bs-toggle="tab"
                                    >
                                        General{" "}
                                        <span className="no_badge">
                                            {
                                                teamData.filter(
                                                    (obj) =>
                                                        //obj.bdmStatus === "Busy" ||
                                                        //obj.bdmStatus === "Not Picked Up" ||
                                                        obj.bdmStatus === "Untouched"
                                                ).length
                                            }
                                        </span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a
                                        href="#tabs-activity-5"
                                        onClick={() => {
                                            setBdmNewStatus("Interested");
                                            //setCurrentPage(0);
                                            setTeamLeadsData(
                                                teamData.filter(
                                                    (obj) => obj.bdmStatus === "Interested"
                                                ).sort((a, b) => new Date(b.bdeForwardDate) - new Date(a.bdeForwardDate))
                                            );
                                        }}
                                        className={
                                            bdmNewStatus === "Interested"
                                                ? "nav-link active item-act"
                                                : "nav-link"
                                        }
                                        data-bs-toggle="tab"
                                    >
                                        Interested
                                        <span className="no_badge">
                                            {
                                                teamData.filter(
                                                    (obj) => obj.bdmStatus === "Interested"
                                                ).length
                                            }
                                        </span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a
                                        href="#tabs-activity-5"
                                        onClick={() => {
                                            setBdmNewStatus("FollowUp");
                                            //setCurrentPage(0);
                                            setTeamLeadsData(
                                                teamData.filter(
                                                    (obj) => obj.bdmStatus === "FollowUp"
                                                ).sort((a, b) => new Date(b.bdeForwardDate) - new Date(a.bdeForwardDate))
                                            );
                                        }}
                                        className={
                                            bdmNewStatus === "FollowUp"
                                                ? "nav-link active item-act"
                                                : "nav-link"
                                        }
                                        data-bs-toggle="tab"
                                    >
                                        Follow Up{" "}
                                        <span className="no_badge">
                                            {
                                                teamData.filter(
                                                    (obj) => obj.bdmStatus === "FollowUp"
                                                ).length
                                            }
                                        </span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a
                                        href="#tabs-activity-5"
                                        onClick={() => {
                                            setBdmNewStatus("Matured");
                                            //setCurrentPage(0);
                                            setTeamLeadsData(
                                                teamData
                                                    .filter((obj) => obj.bdmStatus === "Matured")
                                                    .sort((a, b) => new Date(b.bdeForwardDate) - new Date(a.bdeForwardDate))
                                            );
                                        }}
                                        className={
                                            bdmNewStatus === "Matured"
                                                ? "nav-link active item-act"
                                                : "nav-link"
                                        }
                                        data-bs-toggle="tab"
                                    >
                                        Matured{" "}
                                        <span className="no_badge">
                                            {" "}
                                            {
                                                teamData.filter(
                                                    (obj) => obj.bdmStatus === "Matured"
                                                ).length
                                            }
                                        </span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a
                                        href="#tabs-activity-5"
                                        onClick={() => {
                                            setBdmNewStatus("NotInterested");
                                            //setCurrentPage(0);
                                            setTeamLeadsData(
                                                teamData.filter(
                                                    (obj) =>
                                                        obj.bdmStatus === "Not Interested" ||
                                                        obj.bdmStatus === "Busy" ||
                                                        obj.bdmStatus === "Not Picked Up" ||
                                                        obj.bdmStatus === "Junk"
                                                )
                                            );
                                        }}
                                        className={
                                            bdmNewStatus === "NotInterested"
                                                ? "nav-link active item-act"
                                                : "nav-link"
                                        }
                                        data-bs-toggle="tab"
                                    >
                                        Not-Interested{" "}
                                        <span className="no_badge">
                                            {
                                                teamData.filter(
                                                    (obj) =>
                                                        obj.bdmStatus === "Not Interested" ||
                                                        obj.bdmStatus === "Busy" ||
                                                        obj.bdmStatus === "Not Picked Up" ||
                                                        obj.bdmStatus === "Junk"
                                                ).length
                                            }
                                        </span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="card">
                            <div className="card-body p-0" >
                                <div style={{
                                    overflowX: "auto",
                                    overflowY: "auto",
                                    maxHeight: "66vh",
                                }}>
                                    <table style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        border: "1px solid #ddd",
                                    }}
                                        className="table-vcenter table-nowrap">
                                        <thead>
                                            <tr className="tr-sticky">
                                                <th>
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            selectedRows.length === filteredData.length
                                                        }
                                                        onChange={() => handleCheckboxChange("all")}
                                                    />
                                                </th>
                                                <th className="th-sticky">Sr.No</th>
                                                <th className="th-sticky1">Company Name</th>
                                                <th>BDE Name</th>
                                                <th>Company Number</th>
                                                <th>BDE Status</th>
                                                {bdmNewStatus === "FollowUp" && (<th>Next FollowUp Date</th>)}
                                                <th>Bde Remarks</th>
                                                {(bdmNewStatus === "Interested" || bdmNewStatus === "FollowUp" || bdmNewStatus === "Matured" || bdmNewStatus === "NotInterested") && (
                                                    <>
                                                        <th>BDM Status</th>
                                                        <th>BDM Remarks</th>
                                                    </>
                                                )}
                                                <th>
                                                    Incorporation Date
                                                </th>
                                                <th>City</th>
                                                <th>State</th>
                                                <th>Company Email</th>
                                                <th>
                                                    Bde Forward Date
                                                </th>
                                                {(bdmNewStatus === "Untouched" || bdmNewStatus === "Matured") && <th>Action</th>}
                                                {/* {bdmNewStatus === "Untouched" && <th>Action</th>} */}
                                                {(bdmNewStatus === "FollowUp" || bdmNewStatus === "Interested") && (<>
                                                    <th>Add Projection</th>
                                                    <th>Add Feedback</th>
                                                </>)
                                                }
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.map((company, index) => (
                                                <tr
                                                    key={index}
                                                    className={
                                                        selectedRows.includes(company._id)
                                                            ? "selected"
                                                            : ""
                                                    }
                                                    style={{ border: "1px solid #ddd" }}
                                                >
                                                    <td
                                                        style={{
                                                            position: "sticky",
                                                            left: 0,
                                                            zIndex: 1,
                                                            background: "white",
                                                        }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRows.includes(
                                                                company._id
                                                            )}
                                                            onChange={(e) =>
                                                                handleCheckboxChange(company._id, e)
                                                            }
                                                            onMouseDown={() =>
                                                                handleMouseDown(company._id)
                                                            }
                                                            onMouseEnter={() =>
                                                                handleMouseEnter(company._id)
                                                            }
                                                            onMouseUp={handleMouseUp}
                                                        />
                                                    </td>

                                                    <td className="td-sticky">
                                                        {startIndex + index + 1}
                                                    </td>
                                                    <td className="td-sticky1">
                                                        {company["Company Name"]}
                                                    </td>
                                                    <td>{company.ename}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center justify-content-between wApp">
                                                            <div>{company["Company Number"]}</div>
                                                            <a
                                                                target="_blank"
                                                                href={`https://wa.me/91${company["Company Number"]}`}
                                                            >
                                                                <FaWhatsapp />
                                                            </a>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {company.Status}
                                                    </td>
                                                    {bdmNewStatus === "FollowUp" && (<td>{formatDateNew(company.bdmNextFollowUpDate)}</td>)}
                                                    <td>
                                                        <div
                                                            key={company._id}
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                                width: "100px",
                                                            }}>
                                                            <p
                                                                className="rematkText text-wrap m-0"
                                                                title={company.Remarks}
                                                            >
                                                                {!company["Remarks"]
                                                                    ? "No Remarks"
                                                                    : company.Remarks}
                                                            </p>
                                                            <IconButton
                                                                onClick={() => {
                                                                    functionopenpopupremarks(
                                                                        company._id,
                                                                        company.Status,
                                                                        company["Company Name"],
                                                                        company.ename
                                                                    );
                                                                    setCurrentRemarks(company.Remarks);
                                                                    //setCurrentRemarksBdm(company.bdmRemarks)
                                                                    setCompanyId(company._id);
                                                                }}
                                                            >
                                                                <IconEye
                                                                    style={{
                                                                        width: "12px",
                                                                        height: "12px",
                                                                        color: "#fbb900"
                                                                    }}
                                                                />
                                                            </IconButton>
                                                        </div>
                                                    </td>
                                                    {(bdmNewStatus === "Interested" ||
                                                        bdmNewStatus === "FollowUp" ||
                                                        bdmNewStatus === "Matured" ||
                                                        bdmNewStatus === "NotInterested") && (
                                                            <>
                                                                <td>
                                                                    <span>{company.bdmStatus}</span>
                                                                    {/* {company.bdmStatus === "Matured"  ? (
                                                                        <span>{company.bdmStatus} </span>
                                                                    ) : (
                                                                        <select
                                                                            style={{
                                                                                background: "none",
                                                                                padding: ".4375rem .75rem",
                                                                                border:
                                                                                    "1px solid var(--tblr-border-color)",
                                                                                borderRadius:
                                                                                    "var(--tblr-border-radius)",
                                                                            }}
                                                                            value={company.bdmStatus}
                                                                            onChange={(e) =>
                                                                                handlebdmStatusChange(
                                                                                    company._id,
                                                                                    e.target.value,
                                                                                    company["Company Name"],
                                                                                    company["Company Email"],
                                                                                    company[
                                                                                    "Company Incorporation Date  "
                                                                                    ],
                                                                                    company["Company Number"],
                                                                                    company["Status"],
                                                                                    company.bdmStatus,
                                                                                    company.ename
                                                                                )
                                                                            }
                                                                        >
                                                                            <option value="Not Picked Up">
                                                                                Not Picked Up
                                                                            </option>
                                                                            <option value="Busy">Busy </option>
                                                                            <option value="Junk">Junk</option>
                                                                            <option value="Not Interested">
                                                                                Not Interested
                                                                            </option>
                                                                            {bdmNewStatus === "Interested" && (
                                                                                <>
                                                                                    <option value="Interested">
                                                                                        Interested
                                                                                    </option>
                                                                                    <option value="FollowUp">
                                                                                        Follow Up{" "}
                                                                                    </option>
                                                                                    <option value="Matured">
                                                                                        Matured
                                                                                    </option>
                                                                                </>
                                                                            )}

                                                                            {bdmNewStatus === "FollowUp" && (
                                                                                <>
                                                                                    <option value="FollowUp">
                                                                                        Follow Up{" "}
                                                                                    </option>
                                                                                    <option value="Matured">
                                                                                        Matured
                                                                                    </option>
                                                                                </>
                                                                            )}
                                                                        </select>
                                                                    )} */}
                                                                </td>
                                                                <td>
                                                                    <div
                                                                        key={company._id}
                                                                        style={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "space-between",
                                                                            width: "100px",
                                                                        }}
                                                                    >
                                                                        <p
                                                                            className="rematkText text-wrap m-0"
                                                                            title={company.bdmRemarks}
                                                                        >
                                                                            {!company.bdmRemarks
                                                                                ? "No Remarks"
                                                                                : company.bdmRemarks}

                                                                        </p>

                                                                        <IconButton
                                                                            onClick={() => {
                                                                                functionopenpopupremarksEdit(
                                                                                    company._id,
                                                                                    company.Status,
                                                                                    company["Company Name"],
                                                                                    company.bdmName
                                                                                );
                                                                                setCurrentRemarks(company.Remarks);
                                                                                //setCurrentRemarksBdm(company.Remarks)
                                                                                setCompanyId(company._id);
                                                                            }}>
                                                                            <IconEye
                                                                                style={{
                                                                                    width: "12px",
                                                                                    height: "12px",
                                                                                    color: "#fbb900"
                                                                                }}


                                                                            />
                                                                        </IconButton>
                                                                    </div>
                                                                </td>

                                                            </>
                                                        )}
                                                    <td>
                                                        {formatDateNew(
                                                            company["Company Incorporation Date  "]
                                                        )}
                                                    </td>
                                                    <td>{company["City"]}</td>
                                                    <td>{company["State"]}</td>
                                                    <td>{company["Company Email"]}</td>
                                                    <td>{formatDateNew(company.bdeForwardDate)}</td>
                                                    {/* {
                                                        company.bdmStatus === "Untouched" && (
                                                            <td>
                                                                <IconButton style={{ color: "green", marginRight: "5px", height: "25px", width: "25px" }}
                                                                    onClick={(e) => handleAcceptClick(
                                                                        company._id,
                                                                        //e.target.value,
                                                                        company["Company Name"],
                                                                        company["Company Email"],
                                                                        company[
                                                                        "Company Incorporation Date  "
                                                                        ],
                                                                        company["Company Number"],
                                                                        company["Status"],
                                                                        company.bdmStatus
                                                                    )}>
                                                                    <GrStatusGood />
                                                                </IconButton>
                                                                <IconButton onClick={() => {
                                                                    functionopenpopupremarksEdit(company._id,
                                                                        company.Status,
                                                                        company["Company Name"],
                                                                        company.bdmName)
                                                                    handleRejectData(company._id)
                                                                }}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="red" style={{ width: "12px", height: "12px", color: "red" }}><path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z" /></svg></IconButton>
                                                            </td>
                                                        )
                                                    } */}
                                                    {
                                                        bdmNewStatus === "Matured" && <>
                                                            <td>
                                                                <IconButton
                                                                    style={{ marginRight: "5px" }}
                                                                    onClick={() => {
                                                                        setMaturedID(company._id);

                                                                        functionopenAnchor();
                                                                    }}
                                                                >
                                                                    <IconEye
                                                                        style={{
                                                                            width: "14px",
                                                                            height: "14px",
                                                                            color: "#d6a10c",
                                                                            cursor: "pointer",
                                                                        }}
                                                                    />
                                                                </IconButton>

                                                            </td>
                                                        </>
                                                    }
                                                    {(bdmNewStatus === "FollowUp" || bdmNewStatus === "Interested") && (<>
                                                        <td>
                                                            {company &&
                                                                projectionData &&
                                                                projectionData.some(
                                                                    (item) => item.companyName === company["Company Name"]
                                                                ) ? (
                                                                <IconButton>
                                                                    <RiEditCircleFill
                                                                        onClick={() => {
                                                                            functionopenprojection(
                                                                                company["Company Name"]
                                                                            );
                                                                        }}
                                                                        style={{
                                                                            cursor: "pointer",
                                                                            width: "17px",
                                                                            height: "17px",
                                                                            color: "#fbb900", // Set color to yellow
                                                                        }}
                                                                    />
                                                                </IconButton>
                                                            ) : (
                                                                <IconButton>
                                                                    <RiEditCircleFill
                                                                        onClick={() => {
                                                                            functionopenprojection(
                                                                                company["Company Name"]
                                                                            );
                                                                            setIsEditProjection(true);
                                                                        }}

                                                                        style={{
                                                                            cursor: "pointer",
                                                                            width: "17px",
                                                                            height: "17px",
                                                                        }}
                                                                    />
                                                                </IconButton>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {(company.feedbackRemarks || company.feedbackPoints.length !== 0) && (<IconButton>
                                                                <IoAddCircle
                                                                    onClick={() => {
                                                                        handleOpenFeedback(
                                                                            company["Company Name"],
                                                                            company._id,
                                                                            company.feedbackPoints,
                                                                            company.feedbackRemarks,
                                                                            company.bdmStatus
                                                                        )
                                                                    }}
                                                                    style={{
                                                                        cursor: "pointer",
                                                                        width: "17px",
                                                                        height: "17px",
                                                                        color: "#fbb900"
                                                                    }} />
                                                            </IconButton>)}
                                                        </td>
                                                    </>)}

                                                    {/* {dataStatus === "Matured" && (
                            <>
                              <td>
                                <div className="d-flex">
                                  <IconButton
                                    style={{ marginRight: "5px" }}
                                    onClick={() => {
                                      setMaturedID(company._id);

                                      functionopenAnchor();
                                    }}
                                  >
                                    <IconEye
                                      style={{
                                        width: "14px",
                                        height: "14px",
                                        color: "#d6a10c",
                                        cursor: "pointer",
                                      }}
                                    />
                                  </IconButton>

                                  <IconButton
                                    onClick={() => {
                                      handleRequestDelete(
                                        company._id,
                                        company["Company Name"]
                                      );
                                    }}
                                    disabled={requestDeletes.some(
                                      (item) =>
                                        item.companyId === company._id &&
                                        item.request === undefined
                                    )}
                                  >
                                    <DeleteIcon
                                      style={{
                                        cursor: "pointer",
                                        color: "#f70000",
                                        width: "14px",
                                        height: "14px",
                                      }}
                                    />
                                  </IconButton>
                                  <IconButton
                                    onClick={() => {
                                      handleEditClick(company._id)
                                    }}
                                  >
                                    <Edit
                                      style={{
                                        cursor: "pointer",
                                        color: "#109c0b",
                                        width: "14px",
                                        height: "14px",
                                      }}
                                    />
                                  </IconButton>
                                  <IconButton
                                    onClick={() => {
                                      setCompanyName(
                                        company["Company Name"]
                                      );
                                      setAddFormOpen(true);
                                    }}
                                  >
                                    <AddCircleIcon
                                      style={{
                                        cursor: "pointer",
                                        color: "#4f5b74",
                                        width: "14px",
                                        height: "14px",
                                      }}
                                    />
                                  </IconButton>
                                </div>
                              </td>
                            </>
                          )} */}
                                                </tr>
                                            ))}
                                        </tbody>
                                        {teamleadsData.length === 0 && (
                                            <tbody>
                                                <tr>
                                                    <td colSpan="11" className="p-2 particular">
                                                        <Nodata />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        )}
                                        {teamleadsData.length !== 0 && (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                }}
                                                className="pagination"
                                            >
                                                <IconButton
                                                    onClick={() =>
                                                        setCurrentPage((prevPage) =>
                                                            Math.max(prevPage - 1, 0)
                                                        )
                                                    }
                                                    disabled={currentPage === 0}
                                                >
                                                    <IconChevronLeft />
                                                </IconButton>
                                                {/* <span>
                          Page {currentPage + 1} of{" "}
                          {Math.ceil(filteredData.length / itemsPerPage)}
                        </span> */}

                                                {/* <IconButton
                          onClick={() =>
                            setCurrentPage((prevPage) =>
                              Math.min(
                                prevPage + 1,
                                Math.ceil(filteredData.length / itemsPerPage) -
                                1
                              )
                            )
                          }
                          disabled={
                            currentPage ===
                            Math.ceil(filteredData.length / itemsPerPage) - 1
                          }
                        >
                          <IconChevronRight />
                        </IconButton> */}
                                            </div>
                                        )}
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>}
            {formOpen && maturedBooking && (
                <>
                    <RedesignedForm
                        // matured={true}
                        // companysId={companyId}
                        // setDataStatus={setdataStatus}
                        setFormOpen={setFormOpen}
                        companysName={maturedBooking["Company Name"]}
                        companysEmail={maturedBooking["Company Email"]}
                        companyNumber={maturedBooking["Company Number"]}
                        // setNowToFetch={setNowToFetch}
                        companysInco={maturedBooking["Company Incorporation Date  "]}
                        employeeName={maturedBooking.ename}

                        bdmName={maturedBooking.bdmName}
                    />
                </>
            )}
            {/* // -------------------------------------------------------------------Dialog for bde Remarks--------------------------------------------------------- */}

            <Dialog
                open={openRemarks}
                onClose={closePopUpRemarks}
                fullWidth
                maxWidth="sm">
                <DialogTitle>
                    <span style={{ fontSize: "14px" }}>
                        {currentCompanyName}'s Remarks
                    </span>
                    <IconButton onClick={closePopUpRemarks} style={{ float: "right" }}>
                        <CloseIcon color="primary"></CloseIcon>
                    </IconButton>{" "}
                </DialogTitle>
                <DialogContent>
                    <div className="remarks-content">
                        {filteredRemarks.length !== 0 ? (
                            filteredRemarks.slice().map((historyItem) => (
                                <div className="col-sm-12" key={historyItem._id}>
                                    <div className="card RemarkCard position-relative">
                                        <div className="d-flex justify-content-between">
                                            <div className="reamrk-card-innerText">
                                                <pre className="remark-text">{historyItem.remarks}</pre>
                                                {historyItem.bdmName && <span>By BDM</span>}
                                            </div>
                                            {/* <div className="dlticon">
                        <DeleteIcon
                          style={{
                            cursor: "pointer",
                            color: "#f70000",
                            width: "14px",
                          }}
                          onClick={() => {
                            handleDeleteRemarks(
                              historyItem._id,
                              historyItem.remarks
                            );
                          }}
                        />
                      </div> */}
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

                    {/* <div class="card-footer">
            <div class="mb-3 remarks-input">
              <textarea
                placeholder="Add Remarks Here...  "
                className="form-control"
                id="remarks-input"
                rows="3"
                onChange={(e) => {
                  debouncedSetChangeRemarks(e.target.value);
                }}
              ></textarea>
            </div>
            <button
              onClick={handleUpdate}
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              Submit
            </button>
          </div> */}
                </DialogContent>
            </Dialog>
            {/* ----------------------------------------------------dialog for bdm remarks popup--------------------------------------------- */}

            <Dialog
                open={openRemarksEdit}
                onClose={closePopUpRemarksEdit}
                fullWidth
                maxWidth="sm">
                <DialogTitle>
                    <span style={{ fontSize: "14px" }}>
                        {currentCompanyName}'s Remarks
                    </span>
                    <IconButton onClick={closePopUpRemarksEdit} style={{ float: "right" }}>
                        <CloseIcon color="primary"></CloseIcon>
                    </IconButton>{" "}
                </DialogTitle>
                <DialogContent>
                    <div className="remarks-content">
                        {filteredRemarksBdm.length !== 0 ? (
                            filteredRemarksBdm.slice().map((historyItem) => (
                                <div className="col-sm-12" key={historyItem._id}>
                                    <div className="card RemarkCard position-relative">
                                        <div className="d-flex justify-content-between">
                                            <div className="reamrk-card-innerText">
                                                <pre className="remark-text">{historyItem.bdmRemarks}</pre>
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
            {/* --------------------------------------------------------- dialog for feedback----------------------------------------- */}

            <Dialog
                open={openFeedback}
                onClose={handleCloseFeedback}
                fullWidth
                maxWidth="xs">
                <DialogTitle>
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="m-0" style={{ fontSize: "16px" }}>Feedback Of <span className="text-wrap" >{feedbackCompanyName}</span></div>
                        <IconButton onClick={handleCloseFeedback} style={{ float: "right" }}>
                            <CloseIcon color="primary"></CloseIcon>
                        </IconButton>{" "}
                    </div>
                </DialogTitle>
                <DialogContent>
                    <div className="card-body mt-5">
                        <div className="mt-1">
                            <div>A. How was the quality of Information?</div>
                            <div className="feedback-slider">
                                <Slider
                                    defaultValue={0}
                                    value={valueSlider}
                                    onChange={(e) => { handleSliderChange(e.target.value, 1) }} // Pass slider number as 1
                                    sx={{ zIndex: "99999999", color: "#ffb900" }}
                                    min={0}
                                    max={10}
                                    aria-label="Default"
                                    valueLabelDisplay="auto"
                                    disabled />
                            </div>
                        </div>
                        <div className="mt-1">
                            <div>B. How was the clarity of communication with lead?</div>
                            <div className="feedback-slider">
                                <Slider
                                    defaultValue={0}
                                    value={valueSlider2}
                                    onChange={(e) => { handleSliderChange(e.target.value, 2) }} // Pass slider number as 2
                                    sx={{ zIndex: "99999999", color: "#ffb900" }}
                                    min={0}
                                    max={10}
                                    aria-label="Default"
                                    valueLabelDisplay="auto"
                                    disabled />
                            </div>
                        </div>
                        <div className="mt-1">
                            <div>C. How was the accuracy of lead qualification?</div>
                            <div className="feedback-slider">
                                <Slider
                                    defaultValue={0}
                                    value={valueSlider3}
                                    onChange={(e) => { handleSliderChange(e.target.value, 3) }} // Pass slider number as 3
                                    sx={{ zIndex: "99999999", color: "#ffb900" }}
                                    min={0}
                                    max={10}
                                    aria-label="Default"
                                    valueLabelDisplay="auto"
                                    disabled />
                            </div>
                        </div>
                        <div className="mt-1">
                            <div>D. How was engagement level of lead?</div>
                            <div className="feedback-slider">
                                <Slider
                                    defaultValue={0}
                                    value={valueSlider4}
                                    onChange={(e) => { handleSliderChange(e.target.value, 4) }} // Pass slider number as 4
                                    sx={{ zIndex: "99999999", color: "#ffb900" }}
                                    min={0}
                                    max={10}
                                    aria-label="Default"
                                    valueLabelDisplay="auto"
                                    disabled />
                            </div>
                        </div>
                        <div className="mt-1">
                            <div>E. Payment Chances</div>
                            <div className="feedback-slider">
                                <Slider
                                    defaultValue={0}
                                    value={valueSlider5}
                                    onChange={(e) => { handleSliderChange(e.target.value, 5) }} // Pass slider number as 5
                                    sx={{ zIndex: "99999999", color: "#ffb900" }}
                                    min={0}
                                    max={100}
                                    aria-label="Default"
                                    valueLabelDisplay="auto"
                                    disabled />
                            </div>
                        </div>

                    </div>
                    <div class="card-footer mt-4">
                        <div class="mb-3 remarks-input">
                            <textarea
                                placeholder="Add Remarks Here...  "
                                className="form-control"
                                id="remarks-input"
                                rows="3"
                                value={feedbackRemarks}
                                onChange={(e) => {
                                    debouncedFeedbackRemarks(e.target.value);
                                }}
                                disabled
                            ></textarea>
                        </div>
                        {/* <button
                            onClick={handleFeedbackSubmit}
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: "100%" }}
                        >
                            Submit
                        </button> */}
                    </div>

                </DialogContent>
            </Dialog>
            {/* --------------------------------dialog for assign data-------------------------------- */}
            <Dialog
                open={openAssign}
                onClose={closepopupAssign}
                fullWidth
                maxWidth="sm">
                <DialogTitle>
                    Change BDM{" "}
                    <IconButton onClick={closepopupAssign} style={{ float: "right" }}>
                        <CloseIcon color="primary"></CloseIcon>
                    </IconButton>{" "}
                </DialogTitle>
                <DialogContent>
                    <div className="maincon">
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
                                <label htmlFor="direct">Move In General Data</label>
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
                                <label htmlFor="someoneElse">Assign to BDM</label>
                            </div>
                        </div>
                    </div>
                    {selectedOption === "someoneElse" && (
                        <div>
                            {bdmNames.length !== 0 ? (
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
                                                    {bdmNames.map((item) => (
                                                        <option value={item}>{item}</option>
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
                <button onClick={handleUploadData} className="btn btn-primary">
                    Submit
                </button>
            </Dialog>



            {/* ---------------------------------projection drawer--------------------------------------------------------- */}

            <div>
                <Drawer
                    style={{ top: "50px" }}
                    anchor="right"
                    open={openProjection}
                    onClose={closeProjection}>
                    <div style={{ width: "31em" }} className="container-xl">
                        <div
                            className="header d-flex justify-content-between align-items-center"
                            style={{ margin: "10px 0px" }}
                        >
                            <h1
                                style={{ marginBottom: "0px", fontSize: "23px" }}
                                className="title"
                            >
                                Projection Form
                            </h1>
                            <div>
                                {projectingCompany &&
                                    projectionData &&
                                    projectionData.some(
                                        (item) => item.companyName === projectingCompany
                                    ) ? (
                                    <>
                                        <IconButton
                                            onClick={() => {
                                                setIsEditProjection(true);
                                            }}
                                        >
                                            <EditIcon color="grey"></EditIcon>
                                        </IconButton>
                                    </>
                                ) : null}
                                {/* <IconButton
                  onClick={() => {
                    setIsEditProjection(true);
                  }}>
                  <EditIcon color="grey"></EditIcon>
                </IconButton> */}
                                {/* <IconButton onClick={() => handleDelete(projectingCompany)}>
                  <DeleteIcon
                    style={{
                      width: "16px",
                      height: "16px",
                      color: "#bf0b0b",
                    }}
                  >
                    Delete
                  </DeleteIcon>
                </IconButton> */}
                                <IconButton>
                                    <IoClose onClick={closeProjection} />
                                </IconButton>
                            </div>
                        </div>
                        <hr style={{ margin: "0px" }} />
                        <div className="body-projection">
                            <div className="header d-flex align-items-center justify-content-between">
                                <div>
                                    <h1
                                        title={projectingCompany}
                                        style={{
                                            fontSize: "14px",
                                            textShadow: "none",
                                            fontFamily: "sans-serif",
                                            fontWeight: "400",
                                            fontFamily: "Poppins, sans-serif",
                                            margin: "10px 0px",
                                            width: "200px",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {projectingCompany}
                                    </h1>
                                </div>
                                <div>
                                    <button
                                        onClick={() => handleDelete(projectingCompany)}
                                        className="btn btn-link"
                                        style={{ color: "grey" }}
                                    >
                                        Clear Form
                                    </button>
                                </div>
                            </div>
                            <div className="label">
                                <strong>
                                    Offered Services{" "}
                                    {selectedValues.length === 0 && (
                                        <span style={{ color: "red" }}>*</span>
                                    )}{" "}
                                    :
                                </strong>
                                <div className="services mb-3">
                                    <Select
                                        isMulti
                                        options={options}
                                        onChange={(selectedOptions) => {
                                            setSelectedValues(
                                                selectedOptions.map((option) => option.value)
                                            );
                                        }}
                                        value={selectedValues.map((value) => ({
                                            value,
                                            label: value,
                                        }))}
                                        placeholder="Select Services..."
                                        isDisabled={!isEditProjection}
                                    />
                                </div>
                            </div>
                            <div className="label">
                                <strong>
                                    Offered Prices(With GST){" "}
                                    {!currentProjection.offeredPrize && (
                                        <span style={{ color: "red" }}>*</span>
                                    )}{" "}
                                    :
                                </strong>
                                <div className="services mb-3">
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Please enter offered Prize"
                                        value={currentProjection.offeredPrize}
                                        onChange={(e) => {
                                            setCurrentProjection((prevLeadData) => ({
                                                ...prevLeadData,
                                                offeredPrize: e.target.value,
                                            }));
                                        }}
                                        disabled={!isEditProjection}
                                    />
                                </div>
                            </div>
                            <div className="label">
                                <strong>
                                    Expected Price (With GST)
                                    {currentProjection.totalPayment === 0 && (
                                        <span style={{ color: "red" }}>*</span>
                                    )}{" "}
                                    :
                                </strong>
                                <div className="services mb-3">
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Please enter total Payment"
                                        value={currentProjection.totalPayment}
                                        onChange={(e) => {
                                            const newTotalPayment = e.target.value;
                                            if (
                                                Number(newTotalPayment) <=
                                                Number(currentProjection.offeredPrize)
                                            ) {
                                                setCurrentProjection((prevLeadData) => ({
                                                    ...prevLeadData,
                                                    totalPayment: newTotalPayment,
                                                    totalPaymentError: "",
                                                }));
                                            } else {
                                                setCurrentProjection((prevLeadData) => ({
                                                    ...prevLeadData,
                                                    totalPayment: newTotalPayment,
                                                    totalPaymentError:
                                                        "Expected Price should be less than or equal to Offered Price.",
                                                }));
                                            }
                                        }}
                                        disabled={!isEditProjection}
                                    />

                                    <div style={{ color: "lightred" }}>
                                        {currentProjection.totalPaymentError}
                                    </div>
                                </div>
                            </div>

                            <div className="label">
                                <strong>
                                    Last Follow Up Date{" "}
                                    {!currentProjection.lastFollowUpdate && (
                                        <span style={{ color: "red" }}>*</span>
                                    )}
                                    :{" "}
                                </strong>
                                <div className="services mb-3">
                                    <input
                                        type="date"
                                        className="form-control"
                                        placeholder="Please enter offered Prize"
                                        value={currentProjection.lastFollowUpdate}
                                        onChange={(e) => {
                                            setCurrentProjection((prevLeadData) => ({
                                                ...prevLeadData,
                                                lastFollowUpdate: e.target.value,
                                            }));
                                        }}
                                        disabled={!isEditProjection}
                                    />
                                </div>
                            </div>
                            <div className="label">
                                <strong>
                                    Payment Expected on{" "}
                                    {!currentProjection.estPaymentDate && (
                                        <span style={{ color: "red" }}>*</span>
                                    )}
                                    :
                                </strong>
                                <div className="services mb-3">
                                    <input
                                        type="date"
                                        className="form-control"
                                        placeholder="Please enter Estimated Payment Date"
                                        value={currentProjection.estPaymentDate}
                                        onChange={(e) => {
                                            setCurrentProjection((prevLeadData) => ({
                                                ...prevLeadData,
                                                estPaymentDate: e.target.value,
                                            }));
                                        }}
                                        disabled={!isEditProjection}
                                    />
                                </div>
                            </div>
                            <div className="label">
                                <strong>
                                    Remarks{" "}
                                    {currentProjection.remarks === "" && (
                                        <span style={{ color: "red" }}>*</span>
                                    )}
                                    :
                                </strong>
                                <div className="remarks mb-3">
                                    <textarea
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter any Remarks"
                                        value={currentProjection.remarks}
                                        onChange={(e) => {
                                            setCurrentProjection((prevLeadData) => ({
                                                ...prevLeadData,
                                                remarks: e.target.value,
                                            }));
                                        }}
                                        disabled={!isEditProjection}
                                    />
                                </div>
                            </div>
                            <div className="submitBtn">
                                <button
                                    disabled={!isEditProjection}
                                    onClick={handleProjectionSubmit}
                                    style={{ width: "100%" }}
                                    type="submit"
                                    class="btn btn-primary mb-3"
                                >
                                    Submit
                                </button>
                            </div>
                            <div>
                                <button>Pay now</button>
                                {/* <button onClick={generatePaymentLink}>Generate Payment Link</button>
                {paymentLink && <a href={paymentLink} target="_blank" rel="noopener noreferrer">Proceed to Payment</a>}
                {error && <p>{error}</p>} */}
                            </div>
                        </div>
                    </div>
                </Drawer>
            </div>
            {/*  --------------------------------     Bookings View Sidebar   --------------------------------------------- */}
            <Drawer anchor="right" open={openAnchor} onClose={closeAnchor}>
                <div style={{ minWidth: "60vw" }} className="LeadFormPreviewDrawar">
                    <div className="LeadFormPreviewDrawar-header">
                        <div className="Container">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h2 className="title m-0 ml-1">
                                        {currentForm ? currentForm["Company Name"] : "Company Name"}
                                    </h2>
                                </div>
                                <div>
                                    <IconButton onClick={closeAnchor}>
                                        <CloseIcon />
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <LeadFormPreview
                            setOpenAnchor={setOpenAnchor}
                            currentLeadForm={currentForm}
                        />
                    </div>
                </div>
            </Drawer>



        </div>

    );
}

export default AdminEmployeeTeamLeads;
