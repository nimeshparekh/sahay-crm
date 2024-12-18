import React, { useState, useEffect } from "react";
import Header from "../../Components/Header/Header.jsx";
import Navbar from '../../Components/Navbar/Navbar.jsx'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaWhatsapp } from "react-icons/fa";
import NoData from '../../Components/NoData/NoData.jsx';
import { Drawer, Icon, IconButton } from "@mui/material";
import { IconChevronLeft, IconEye } from "@tabler/icons-react";
import { IconChevronRight } from "@tabler/icons-react";
import { GrStatusGood } from "react-icons/gr";
import EditIcon from "@mui/icons-material/Edit";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { useCallback } from "react";
import debounce from "lodash/debounce";
import DeleteIcon from "@mui/icons-material/Delete";
import { RiEditCircleFill } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import Select from "react-select";
import { options } from "../../../components/Options.js";
import { IoAddCircle } from "react-icons/io5";
import Slider from '@mui/material/Slider';
import RedesignedForm from "../../../admin/RedesignedForm.jsx";
import { IoFilterOutline } from "react-icons/io5";
import { TbFileImport } from "react-icons/tb";
import { TbFileExport } from "react-icons/tb";
import { TiUserAddOutline } from "react-icons/ti";
import { MdAssignmentAdd } from "react-icons/md";
import { MdOutlinePostAdd } from "react-icons/md";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { IoIosClose } from "react-icons/io";
import { Country, State, City } from 'country-state-city';
import { LuHistory } from "react-icons/lu";
import CallHistory from "../../../employeeComp/CallHistory.jsx";
import AddLeadForm from "../../../admin/AddLeadForm.jsx";





function BdmTeamLeads() {
  const { userId } = useParams();
  const [data, setData] = useState([])
  const [dataStatus, setdataStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [sortStatus, setSortStatus] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const secretKey = process.env.REACT_APP_SECRET_KEY;
  const frontendKey = process.env.REACT_APP_FRONTEND_KEY;
  const itemsPerPage = 500;
  // const [currentData, setCurrentData] = useState([])
  const [BDMrequests, setBDMrequests] = useState(null);
  const [selectedField, setSelectedField] = useState("Company Name");
  const startIndex = currentPage * itemsPerPage;
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
  const [searchText, setSearchText] = useState("");
  const [citySearch, setcitySearch] = useState("");
  const [visibility, setVisibility] = useState("none");
  const [visibilityOther, setVisibilityOther] = useState("block");
  const [visibilityOthernew, setVisibilityOthernew] = useState("none");
  const [subFilterValue, setSubFilterValue] = useState("");
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(0);
  const [revertBackRequestData, setRevertBackRequestData] = useState([])
  const [openRevertBackRequestDialog, setOpenRevertBackRequestDialog] = useState(false)
  const [openBacdrop, setOpenBacdrop] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [clientNumber, setClientNumber] = useState("");

  const hanleCloseCallHistory = () => {
    setShowCallHistory(false);
  };

  useEffect(() => {
    document.title = `Floor-Manager-Sahay-CRM`;
  }, []);

  // States for filtered and searching data :
  const stateList = State.getStatesOfCountry("IN");
  const cityList = City.getCitiesOfCountry("IN");

  const currentYear = new Date().getFullYear();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  //Create an array of years from 2018 to the current year
  const years = Array.from({ length: currentYear - 1990 }, (_, index) => currentYear - index);

  const [isSearch, setIsSearch] = useState(false);
  const [isFilter, setIsFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);    // Open and Close filter when button clicked.
  const [filteredData, setFilteredData] = useState([]);
  const [extraData, setExtraData] = useState([]);
  const [newFilteredData, setNewFilteredData] = useState([]);
  const [activeTab, setActiveTab] = useState('All');

  // State for selecting status.
  const [selectedStatus, setSelectedStatus] = useState("");

  // States for selecting states and cities.
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState(City.getCitiesOfCountry("IN"));
  const [selectedNewCity, setSelectedNewCity] = useState("");

  //  States for selecting assigned date.
  const [selectedBdeForwardDate, setSelectedBdeForwardDate] = useState(null);

  //  States for selecting company incorporation date.
  const [selectedCompanyIncoDate, setSelectedCompanyIncoDate] = useState(null);
  const [companyIncoDate, setCompanyIncoDate] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDate, setSelectedDate] = useState(0);
  const [monthIndex, setMonthIndex] = useState(0);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [leadHistoryData, setLeadHistoryData] = useState([])


  const formatDateLeadHistory = (dateInput) => {
    console.log(dateInput)
    // Create a Date object if input is a string
    const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateInput);
      return '';
    }

    // Get day, month, and year
    const day = date.getDate().toString().padStart(2, '0'); // Ensure two digits
    const month = date.toLocaleString('default', { month: 'long' }); // e.g., "August"
    const year = date.getFullYear();

    return `${day} ${month}, ${year}`;
  };

  function formatTime(timeString) {
    // Assuming timeString is in "3:23:14 PM" format
    const [time, period] = timeString.split(' ');
    const [hours, minutes, seconds] = time.split(':').map(Number);

    // Convert 24-hour format to 12-hour format
    const formattedHours = hours % 12 || 12; // Convert 0 hours to 12
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;

    return formattedTime;
  }

  // Function to calculate and format the time difference
  function timePassedSince(dateTimeString) {
    const entryTime = new Date(dateTimeString);
    const now = new Date();

    // Calculate difference in milliseconds
    const diffMs = now - entryTime;

    // Convert milliseconds to minutes and hours
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Format the difference
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  }

  useEffect(() => {
    let monthIndex;
    if (selectedYear && selectedMonth) {
      monthIndex = months.indexOf(selectedMonth);
      setMonthIndex(monthIndex + 1)
      const days = new Date(selectedYear, monthIndex + 1, 0).getDate();
      setDaysInMonth(Array.from({ length: days }, (_, i) => i + 1));
    } else {
      setDaysInMonth([]);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (selectedYear && selectedMonth && selectedDate) {
      const monthIndex = months.indexOf(selectedMonth) + 1;
      const formattedMonth = monthIndex < 10 ? `0${monthIndex}` : monthIndex;
      const formattedDate = selectedDate < 10 ? `0${selectedDate}` : selectedDate;
      const companyIncoDate = `${selectedYear}-${formattedMonth}-${formattedDate}`;
      setSelectedCompanyIncoDate(companyIncoDate);
    }
  }, [selectedYear, selectedMonth, selectedDate]);


  const fetchData = async () => {
    try {
      const response = await axios.get(`${secretKey}/employee/einfo`);

      // Set the retrieved data in the state
      const tempData = response.data;
      const userData = tempData.find((item) => item._id === userId);
      setEmployeeName(userData.ename);
      //console.log(tempData);
      setData(userData);
      //setmoreFilteredData(userData);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };
  const [maturedBooking, setMaturedBooking] = useState(null);

  const fetchBDMbookingRequests = async () => {
    const bdmName = data.ename;
    //console.log("This is bdm", bdmName);
    try {
      const response = await axios.get(
        `${secretKey}/bdm-data/matured-get-requests-byBDM/${bdmName}`
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
      const response = await axios.get(`${secretKey}/bdm-data/forwardedbybdedata/${bdmName}`);
      const response2 = await axios.get(`${secretKey}/company-data/leadDataHistoryInterested`);
      const leadHistory = response2.data
      const revertBackRequestData = response.data.filter((company) => company.RevertBackAcceptedCompanyRequest === "Send");
      setRevertBackRequestData(revertBackRequestData);
      setTeamData(response.data);

      const sortedData = response.data.sort((a, b) => {
        return new Date(b["Company Incorporation Date  "]) - new Date(a["Company Incorporation Date  "]);
      });
      setExtraData(sortedData);

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
      setLeadHistoryData(leadHistory)
      //console.log("response", response.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (teamData.length !== 0 && BDMrequests) {
      const companyName = BDMrequests["Company Name"];
      const currentObject = teamData.find(obj => obj["Company Name"] === companyName);
      setMaturedBooking(currentObject);
      //console.log("Current Booking:", currentObject);
    }
  }, [teamData, BDMrequests]);
  //console.log("teamdata", teamleadsData)

  useEffect(() => {
    fetchData()
  }, []);

  useEffect(() => {
    if (revertBackRequestData.length !== 0) {
      setOpenRevertBackRequestDialog(true);
    } else {
      fetchTeamLeadsData();
      fetchBDMbookingRequests();
    }
  }, [data.ename, revertBackRequestData.length]);
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

  const [filteredRemarksBde, setfilteredRemarksBde] = useState([])

  const functionopenpopupremarks = (companyID, companyStatus, companyName, bdmName, ename) => {
    setOpenRemarks(true);
    setfilteredRemarksBde(
      remarksHistory.filter((obj) => obj.companyID === companyID && obj.bdeName === ename)
    );
    // console.log(remarksHistory.filter((obj) => obj.companyID === companyID))
    setcid(companyID);
    setCstat(companyStatus);
    setCurrentCompanyName(companyName);

  };

  const [openRemarksEdit, setOpenRemarksEdit] = useState(false)
  const [remarksBdmName, setRemarksBdmName] = useState("")
  const [bdeNameReject, setBdeNameReject] = useState("")

  const functionopenpopupremarksEdit = (companyID, companyStatus, companyName, bdmName, bdeName) => {
    setOpenRemarksEdit(true);
    setFilteredRemarks(
      remarksHistory.filter((obj) => obj.companyID === companyID && obj.bdmName === bdmName)
    );
    // console.log(remarksHistory.filter((obj) => obj.companyID === companyID));
    setBdeNameReject(bdeName)
    setcid(companyID);
    setCstat(companyStatus);
    setCurrentCompanyName(companyName);
    setRemarksBdmName(bdmName)
  };
  //console.log("filteredRemarks", filteredRemarks);
  //console.log("currentcompanyname", currentCompanyName);

  const fetchRemarksHistory = async () => {
    try {
      const response = await axios.get(`${secretKey}/remarks/remarks-history`);
      setRemarksHistory(response.data.reverse());
      setFilteredRemarks(response.data.filter((obj) => obj.companyID === cid));
      //console.log(response.data);
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
  const [currentBdmName, setCurrentBdmName] = useState(false)

  const handleRejectData = async (companyId, currentbdmname) => {
    setIsDeleted(true)
    setCurrentBdmName(currentbdmname)
  }

  const handleUpdate = async () => {
    // Now you have the updated Status and Remarks, perform the update logic
    //console.log(cid, cstat, changeRemarks, remarksBdmName);
    const designation = data.designation
    const bdmWork = data.bdmWork
    const Remarks = changeRemarks;
    if (Remarks === "") {
      Swal.fire({ title: "Empty Remarks!", icon: "warning" });
      return true;
    }
    try {
      console.log(currentBdmName, Remarks)
      if (isDeleted) {
        const response = await axios.post(`${secretKey}/bdm-data/teamleads-rejectdata/${cid}`, {
          bdmAcceptStatus: "NotForwarded",
          bdmName: currentBdmName,
          remarks: Remarks
        })
        const response2 = await axios.post(`${secretKey}/remarks/update-remarks-bdm/${cid}`, {
          Remarks,
        });
        const response3 = await axios.post(
          `${secretKey}/remarks/remarks-history/${cid}`,
          {
            Remarks,
            remarksBdmName,
            currentCompanyName,
          }
        );
        const response4 = await axios.post(
          `${secretKey}/remarks/remarks-history/${cid}`, {
          Remarks,
          bdeName: bdeNameReject,
          currentCompanyName
        })

        const response5 = await axios.post(`${secretKey}/projection/post-updaterejectedfollowup/${currentCompanyName}`, {
          caseType: "NotForwarded"
        })
        //console.log("remarks", Remarks)

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
        //console.log("response", response.data);
        fetchTeamLeadsData();
        Swal.fire("Data Rejected");
        setIsDeleted(false)
      } else {
        const response = await axios.post(`${secretKey}/remarks/update-remarks-bdm/${cid}`, {
          Remarks,
            remarksBdmName,
            currentCompanyName,
            designation,
            bdmWork
        });
        // const response2 = await axios.post(
        //   `${secretKey}/remarks/remarks-history-bdm/${cid}`,
        //   {
        //     Remarks,
        //     remarksBdmName,
        //     currentCompanyName,
        //     designation,
        //     bdmWork
        //   }
        // );
        //console.log("remarks", Remarks)

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

    // After updating, you can disable the button
  };

  const handleAcceptClick = async (
    companyId,
    cName,
    cemail,
    cdate,
    cnumber,
    oldStatus,
    newBdmStatus
  ) => {
    const DT = new Date();
    try {
      console.log(companyId)
      const response = await axios.post(`${secretKey}/bdm-data/update-bdm-status/${companyId}`, {
        newBdmStatus,
        companyId,
        oldStatus,
        bdmAcceptStatus: "Accept",
        bdmStatusChangeDate: new Date(),
        bdmStatusChangeTime: DT.toLocaleTimeString()
      })
      console.log(response)
      const filteredProjectionData = projectionDataNew.filter((company) => company.companyName === cName)
      //console.log(filteredProjectionData)

      if (filteredProjectionData.length !== 0) {
        const response2 = await axios.post(`${secretKey}/projection/post-followupupdate-bdmaccepted/${cName}`, {
          caseType: "Recieved"
        })
      }

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
  //console.log("bdmNewStatus", bdmNewStatus)

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
  const [deletedEmployeeStatus, setDeletedEmployeeStatus] = useState(false)
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [nowToFetch, setNowToFetch] = useState(false);
  const handlebdmStatusChange = async (
    companyId,
    bdmnewstatus,
    cname,
    cemail,
    cindate,
    cnum,
    bdeStatus,
    bdmOldStatus,
    bdeName,
    isDeletedEmployeeCompany
  ) => {
    const title = `${data.ename} changed ${cname} status from ${bdmOldStatus} to ${bdmnewstatus}`;
    const DT = new Date();
    const date = DT.toLocaleDateString();
    const time = DT.toLocaleTimeString();
    const bdmStatusChangeDate = new Date();
    //console.log("bdmnewstatus", bdmnewstatus)
    try {

      if (bdmnewstatus !== "Matured") {
        const response = await axios.post(
          `${secretKey}/bdm-data/bdm-status-change/${companyId}`,
          {
            bdeStatus,
            bdmnewstatus,
            title,
            date,
            time,
            bdmStatusChangeDate,
          }
        )
        //console.log("yahan dikha ", bdmnewstatus)
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
        const currentObject = teamData.find(obj => obj["Company Name"] === cname);
        setMaturedBooking(currentObject);
        console.log("currentObject", currentObject)
        setDeletedEmployeeStatus(isDeletedEmployeeCompany)
        if (!isDeletedEmployeeCompany) {
          console.log("formchal")
          setFormOpen(true);
        } else {
          console.log("addleadfromchal")
          setAddFormOpen(true)
        }

      }
      // Make API call to send the reques
      // Make an API call to update the employee status in the databas
    } catch (error) {
      // Handle any errors that occur during the API call
      console.error("Error updating status:", error.message);
    }

  }

  const handleDeleteRemarks = async (remarks_id, remarks_value) => {
    const mainRemarks = remarks_value === currentRemarks ? true : false;
    //console.log(mainRemarks);
    const companyId = cid;
    //console.log("Deleting Remarks with", remarks_id);
    try {
      // Send a delete request to the backend to delete the item with the specified ID
      await axios.delete(`${secretKey}/remarks/remarks-history/${remarks_id}`);
      if (mainRemarks) {
        await axios.delete(`${secretKey}/remarks/remarks-delete-bdm/${companyId}`);
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
    bdeName: "",
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
  const [bdeNameProjection, setBdeNameProjection] = useState("")

  const functionopenprojection = (comName) => {
    const getBdeName = teamleadsData.filter((company) => company["Company Name"] === comName)
    if (getBdeName.length > 0) {
      const bdeName = getBdeName[0].ename;
      setBdeNameProjection(bdeName) // Accessing the 'ename' field from the first (and only) object
      //console.log("bdeename:", bdeName);
    } else {
      console.log("No matching company found.");
    }
    setProjectingCompany(comName);
    setOpenProjection(true);
    const findOneprojection =
      projectionData.length !== 0 &&
      projectionData.find((item) => item.companyName === comName);

    if (findOneprojection) {
      setCurrentProjection({
        companyName: findOneprojection.companyName,
        ename: findOneprojection.ename,
        bdeName: bdeNameProjection ? bdeNameProjection : findOneprojection.ename,
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
      bdeName: "",
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

  const handleDelete = async (company) => {
    const companyName = company;
    //console.log(companyName);

    try {
      // Send a DELETE request to the backend API endpoint
      const response = await axios.delete(
        `${secretKey}/projection/delete-followup/${companyName}`
      );
      //console.log(response.data.message); // Log the response message
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
        bdeName: bdeNameProjection ? bdeNameProjection : data.ename,
        offeredServices: selectedValues,
        editCount: currentProjection.editCount + 1,
        caseType: "Recieved",
        bdmName: data.ename // Increment editCount
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
          `${secretKey}/projection/update-followup`,
          finalData
        );
        Swal.fire({ title: "Projection Submitted!", icon: "success" });
        setOpenProjection(false);
        setCurrentProjection({
          companyName: "",
          ename: "",
          bdeName: "",
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

  const [projectionDataNew, setProjectionDataNew] = useState()

  const fetchProjections = async () => {
    try {
      const response = await axios.get(
        `${secretKey}/projection/projection-data/${data.ename}`
      );
      setProjectionData(response.data);
      setProjectionDataNew(response.data)
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
  //console.log("yahan locha h", feedbackPoints.length)


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
      const response = await axios.post(`${secretKey}/remarks/post-feedback-remarks/${companyFeedbackId}`, data
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

  const [nextFollowUpdate, setNextFollowUpDate] = useState(null)

  const functionSubmitNextFollowUpDate = async (nextFollowUpdate, companyId, companyStatus) => {
    const data = {
      bdmNextFollowUpDate: nextFollowUpdate
    }
    try {
      const resposne = await axios.post(`${secretKey}/bdm-data/post-bdmnextfollowupdate/${companyId}`, data)

      //console.log(resposne.data)
      fetchTeamLeadsData(companyStatus)

    } catch (error) {
      console.log("Error submitting Date", error)
    }

  }

  function formatDateNow(timestamp) {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  //  ----------------------------------------  Filterization Process ---------------------------------------------
  const handleFieldChange = (event) => {
    if (
      event.target.value === "Company Incorporation Date  " ||
      event.target.value === "AssignDate"
    ) {
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

    //console.log(selectedField);
  };

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


  // const filteredData = teamleadsData.filter((company) => {
  //   const fieldValue = company[selectedField];

  //   if (selectedField === "State" && citySearch) {
  //     // Handle filtering by both State and City
  //     const stateMatches = fieldValue
  //       .toLowerCase()
  //       .includes(searchText.toLowerCase());
  //     const cityMatches = company.City.toLowerCase().includes(
  //       citySearch.toLowerCase()
  //     );
  //     return stateMatches && cityMatches;
  //   } else if (selectedField === "Company Incorporation Date  ") {
  //     // Assuming you have the month value in a variable named `month`
  //     if (month == 0) {
  //       return fieldValue.includes(searchText);
  //     } else if (year == 0) {
  //       return fieldValue.includes(searchText);
  //     }
  //     const selectedDate = new Date(fieldValue);
  //     const selectedMonth = selectedDate.getMonth() + 1; // Months are 0-indexed
  //     const selectedYear = selectedDate.getFullYear();

  //     // Use the provided month variable in the comparison
  //     return (
  //       selectedMonth.toString().includes(month) &&
  //       selectedYear.toString().includes(year)
  //     );
  //   } else if (selectedField === "AssignDate") {
  //     // Assuming you have the month value in a variable named `month`
  //     return fieldValue.includes(searchText);
  //   } else if (selectedField === "Status" && searchText === "All") {
  //     // Display all data when Status is "All"
  //     return true;
  //   } else {
  //     // Your existing filtering logic for other fields
  //     if (typeof fieldValue === "string") {
  //       return fieldValue.toLowerCase().includes(searchText.toLowerCase());
  //     } else if (typeof fieldValue === "number") {
  //       return fieldValue.toString().includes(searchText);
  //     } else if (fieldValue instanceof Date) {
  //       // Handle date fields
  //       return fieldValue.includes(searchText);
  //     }

  //     return false;
  //   }
  // });

  //---------------------------------- function to revert back company-------------------------------------
  const handleRevertBackCompany = async (companyId, companyName, bdmStatus) => {
    console.log("yahan chala")
    try {
      const reponse = await axios.post(`${secretKey}/bdm-data/deletebdm-updatebdedata`, null, {
        params: {
          companyId,
          companyName
        }
      })
      Swal.fire(
        'Reverted!',
        'The company has been reverted.',
        'success'
      );
      setOpenRevertBackRequestDialog(false)
      fetchTeamLeadsData(bdmStatus)
    } catch (error) {

      console.log("Error deletetind company", error)
    }

  }

  const handleRejectRevertBackCompany = async (companyId, bdmStatus) => {
    try {
      const response = await axios.post(`${secretKey}/bdm-data/rejectrequestrevertbackcompany`, null, {
        params: {
          companyId,
        }
      })
      Swal.fire(
        'Success!',
        'The companynis not reverted.',
        'success'
      );
      setOpenRevertBackRequestDialog(false)
      fetchTeamLeadsData(bdmStatus)
    } catch (error) {
      console.log("Error rejecting revert request", error)
    }
  };

  // These function will close filter drawer.
  const functionCloseFilterDrawer = () => {
    setOpenFilterDrawer(false)
  };

  const handleSearch = (searchQuery) => {
    console.log(searchQuery);

    setIsFilter(false);

    const searchValue = searchQuery.trim().toLowerCase(); // Trim and convert search query to lowercase

    if (!searchQuery || searchQuery.trim().length === 0) {
      setIsSearch(false);
      setIsFilter(false);
      filterByTab(extraData); // Reset to full dataset filtered by active tab when search is empty
      return;
    }

    setIsSearch(true);

    const filteredItems = extraData.filter((company) => {
      const companyName = company["Company Name"];
      const companyNumber = company["Company Number"];
      const companyEmail = company["Company Email"];
      const companyState = company.State;
      const companyCity = company.City;

      return (
        (companyName && companyName.toString().toLowerCase().includes(searchValue)) ||
        (companyNumber && companyNumber.toString().includes(searchValue)) ||
        (companyEmail && companyEmail.toString().toLowerCase().includes(searchValue)) ||
        (companyState && companyState.toString().toLowerCase().includes(searchValue)) ||
        (companyCity && companyCity.toString().toLowerCase().includes(searchValue))
      );
    });
    setNewFilteredData(filteredItems);
    setFilteredData(filteredItems);
    filterByTab(filteredItems);
  };

  const filterByTab = (data) => {
    console.log("data is :", data);
    let filtered;

    switch (activeTab) {
      case "All":
        filtered = data.filter(obj =>
          obj.bdmStatus === "Busy" ||
          obj.bdmStatus === "Not Picked Up" ||
          obj.bdmStatus === "Untouched"
        );
        break;
      case "Interested":
        filtered = data.filter(obj =>
          obj.bdmStatus === "Interested"
        );
        break;
      case "FollowUp":
        filtered = data.filter(obj =>
          obj.bdmStatus === "FollowUp"
        );
        break;
      case "Matured":
        filtered = data.filter(obj =>
          obj.bdmStatus === "Matured"
        );
        break;
      case "Forwarded":
        filtered = data.filter(obj =>
          obj.bdmStatus !== "Not Interested" &&
          obj.bdmStatus !== "Busy" &&
          obj.bdmStatus !== "Junk" &&
          obj.bdmStatus !== "Not Picked Up" &&
          obj.bdmStatus !== "Matured"
        ).sort((a, b) => new Date(b.bdeForwardDate) - new Date(a.bdeForwardDate));
        break;
      case "NotInterested":
        filtered = data.filter(obj =>
          obj.bdmStatus === "Not Interested" ||
          obj.bdmStatus === "Junk"
        );
        break;
      default:
        filtered = data;
    }
    setTeamLeadsData(filtered);
  };

  // useEffect for searching data :
  useEffect(() => {
    if (filteredData.length === 0 && isFilter) {
      setTeamLeadsData(newFilteredData);
      return;
    }

    if (filteredData.length === 0) {
      filterByTab(extraData); // Reset to full dataset filtered by active tab when no filtered data
      return;
    }

    if (filteredData.length === 1) {
      const currentStatus = filteredData[0].bdmStatus;
      setBdmNewStatus(currentStatus);
      filterByTab(filteredData);
    } else if (filteredData.length > 1) {
      if (selectedStatus) {
        setBdmNewStatus(selectedStatus);
        setActiveTab(selectedStatus);
      }
      setTeamLeadsData(filteredData);
    }
  }, [filteredData, activeTab]);

  console.log("Is Search :", isSearch);

  // To clear filter data :
  const handleClearFilter = () => {
    setIsFilter(false);
    functionCloseFilterDrawer();
    setSelectedStatus("");
    setSelectedState("");
    setSelectedNewCity("");
    setSelectedBdeForwardDate(null);
    setCompanyIncoDate(null);
    setSelectedCompanyIncoDate(null);
    setSelectedYear("");
    setSelectedMonth("");
    setSelectedDate(0);
    setFilteredData([]);
    fetchTeamLeadsData(bdmNewStatus);
  };

  // To apply filter :
  const handleFilterData = async (page = 1, limit = itemsPerPage) => {
    const bdmName = data.ename;
    console.log("BDM Name is :", bdmName);
    try {
      setIsFilter(true);
      setOpenBacdrop(true);

      const response = await axios.get(`${secretKey}/bdm-data/filter-employee-team-leads/${bdmName}`, {
        params: {
          selectedStatus,
          selectedState,
          selectedNewCity,
          selectedBdeForwardDate,
          selectedCompanyIncoDate,
          selectedYear,
          monthIndex,
          page,
          limit
        }
      });

      if (!selectedStatus && !selectedState && !selectedNewCity && selectedYear && !selectedCompanyIncoDate) {
        setIsFilter(false);
      } else {
        // console.log("Filtered Data is :", response.data);
        setFilteredData(response.data);
        setNewFilteredData(response.data);
        setTeamLeadsData(response.data)
      }
    } catch (error) {
      console.log("Error to filtered data :", error);
    } finally {
      setOpenBacdrop(false);
      setOpenFilterDrawer(false);
    }
  };

 
  // useEffect for filtering data :
  useEffect(() => {
    if (filteredData.length !== 0) {
      let filtered;
      switch (activeTab) {
        case "All":
          filtered = filteredData.filter(obj =>
            obj.bdmStatus === "Busy" ||
            obj.bdmStatus === "Not Picked Up" ||
            obj.bdmStatus === "Untouched"
          );
          break;
        case "Interested":
          filtered = filteredData.filter(obj =>
            obj.bdmStatus === "Interested"
          );
          break;
        case "FollowUp":
          filtered = filteredData.filter(obj =>
            obj.bdmStatus === "FollowUp"
          );
          break;
        case "Matured":
          filtered = filteredData.filter(obj =>
            obj.bdmStatus === "Matured"
          );
          break;
        case "Forwarded":
          filtered = filteredData.filter(obj =>
            obj.bdmStatus !== "Not Interested" &&
            obj.bdmStatus !== "Busy" &&
            obj.bdmStatus !== "Junk" &&
            obj.bdmStatus !== "Not Picked Up" &&
            obj.bdmStatus !== "Matured"
          ).sort((a, b) => new Date(b.bdeForwardDate) - new Date(a.bdeForwardDate));
          break;
        case "NotInterested":
          filtered = filteredData.filter(obj =>
            obj.bdmStatus === "Not Interested" ||
            obj.bdmStatus === "Junk"
          );
          break;
        default:
          filtered = filteredData;
      }
      //setTeamLeadsData(filtered);

    } else if (filteredData.length === 0 && isFilter) {
      //setFilteredData(newFilteredData);
      setTeamLeadsData(newFilteredData)
    }

    if (filteredData.length === 0) {
      setTeamLeadsData([]);
    }

    if (filteredData.length === 1) {
      const currentStatus = filteredData[0].bdmStatus; // Access Status directly
      if (["Busy", "Not Picked Up", "Untouched"].includes(currentStatus)) {
        setActiveTab('All');
        setBdmNewStatus(currentStatus)
        setTeamLeadsData(newFilteredData)
      } else if (currentStatus === 'Interested') {
        setActiveTab('Interested');
        setBdmNewStatus(currentStatus)
      } else if (currentStatus === 'FollowUp') {
        setActiveTab('FollowUp');
        setBdmNewStatus(currentStatus)
        setTeamLeadsData(newFilteredData)
      } else if (currentStatus === 'Matured') {
        setActiveTab('Matured');
        setBdmNewStatus(currentStatus)
        setTeamLeadsData(newFilteredData)
      } else if (!["Not Interested", "Busy", 'Junk', 'Not Picked Up', 'Matured'].includes(currentStatus)) {
        setActiveTab('Forwarded');
        setBdmNewStatus(currentStatus)
        setTeamLeadsData(newFilteredData)
      } else if (currentStatus === 'Not Interested') {
        setActiveTab('NotInterested');
        setBdmNewStatus(currentStatus)
        setTeamLeadsData(newFilteredData)
      }
    } else if (filteredData.length > 1) {
      setFilteredData(newFilteredData);
      setTeamLeadsData(newFilteredData)
      if (selectedStatus) {
        console.log("yahan chal")
        setBdmNewStatus(selectedStatus)
        setActiveTab(selectedStatus);
      }
    }

  }, [filteredData, activeTab]);

  // console.log("activetab", activeTab);
  // console.log("selectedStatus", selectedStatus);
  // console.log("bdmNewStatus", bdmNewStatus);

  const currentData = teamleadsData.slice(startIndex, endIndex);

  return (
    <div>

      {/* <Header id={data._id} name={data.ename} empProfile={data.profilePhoto && data.profilePhoto.length !== 0 && data.profilePhoto[0].filename} gender={data.gender} designation={data.newDesignation} />
      <Navbar userId={userId} /> */}
      {!formOpen && !addFormOpen && (
        <>
          {!showCallHistory ? <div className="page-wrapper">
            {BDMrequests && (
              <Dialog open={openbdmRequest}>
                <DialogContent>
                  <div className="request-bdm-card">
                    <div className="request-title m-2 d-flex justify-content-between">
                      <div className="request-content mr-2">
                        Your Request to book form of{" "}
                        <b>{BDMrequests["Company Name"]}</b> has been accepted by <b>{BDMrequests.bdeName}</b>
                      </div>
                      <div className="request-time">
                        <IconButton onClick={() => setOpenbdmRequest(false)}>
                          <CloseIcon style={{ height: "15px", width: "15px" }} />
                        </IconButton>
                      </div>

                    </div>
                    <div className="request-reply">
                      <button
                        onClick={() => {
                          setFormOpen(true)
                          setOpenbdmRequest(false)
                        }}
                        className="request-display"
                      >
                        Open Form
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {revertBackRequestData.length !== 0 && revertBackRequestData.map((item) => (
              <Dialog key={item._id} open={openRevertBackRequestDialog} className='My_Mat_Dialog' maxWidth="sm">
                <DialogContent>
                  <div className="">
                    <div className="request-title m-2 d-flex justify-content-between">
                      <div className="request-content mr-2 text-center">
                        <h3 className="m-0">{item.ename} has requested to revert back  <b> {item["Company Name"]}</b> From you. Do you want accept his request?</h3>
                      </div>
                    </div>
                  </div>
                </DialogContent>
                <div className="request-reply d-flex justify-content-center align-items-center">
                  <button
                    onClick={() => handleRevertBackCompany(item._id, item["Company Name"], item.bdmStatus)}
                    className="btn btn-success bdr-radius-none w-100"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleRejectRevertBackCompany(item._id, item.bdmStatus)}
                    className="btn btn-danger bdr-radius-none w-100"
                  >
                    No
                  </button>
                </div>
              </Dialog>
            ))}

            <div className="page-body" onCopy={(e) => {
              e.preventDefault();
            }}>
              <div className="container-xl">

                <div className="row g-2 align-items-center mb-2">
                  
                  {/* New Filter Starts From Here */}
                  <div className="page-header d-print-none">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <div className="btn-group">
                          <div className="btn-group" role="group" aria-label="Basic example">
                            <button type="button"
                              className={isFilter ? 'btn mybtn active' : 'btn mybtn'}
                              onClick={() => setOpenFilterDrawer(true)}
                            >
                              <IoFilterOutline className='mr-1' /> Filter
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        {/* {selectedRows.length !== 0 && (
                                <div className="selection-data" >
                                    Total Data Selected : <b>{selectedRows.length}</b>
                                </div>
                            )} */}
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
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              handleSearch(e.target.value)
                              //   handleFilterSearch(e.target.value)
                              //   setCurrentPage(0);
                            }}
                            className="form-control search-cantrol mybtn"
                            placeholder="Search…"
                            type="text"
                            name="bdeName-search"
                            id="bdeName-search" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <!-- Page title actions --> */}
                </div>


                <div class="card-header my-tab">
                  <ul class="nav nav-tabs card-header-tabs nav-fill p-0"
                    data-bs-toggle="tabs">
                    <li class="nav-item data-heading">
                      <a
                        href="#tabs-home-5"
                        onClick={() => {
                          setBdmNewStatus("Untouched");
                          setCurrentPage(0);
                          const mappedData = (isSearch || isFilter) ? filteredData : teamData
                          setTeamLeadsData(
                            mappedData.filter(
                              (obj) =>
                                // obj.bdmStatus === "Busy" ||
                                // obj.bdmStatus === "Not Picked Up" ||
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
                            ((isSearch || isFilter) ? filteredData : teamData).filter(
                              (obj) =>
                                // obj.bdmStatus === "Busy" ||
                                // obj.bdmStatus === "Not Picked Up" ||
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
                          setCurrentPage(0);
                          const mappedData = (isSearch || isFilter) ? filteredData : teamData
                          setTeamLeadsData(
                            mappedData.filter(
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
                            ((isSearch || isFilter) ? filteredData : teamData).filter(
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
                          const mappedData = (isSearch || isFilter) ? filteredData : teamData
                          setTeamLeadsData(
                            mappedData.filter(
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
                            ((isSearch || isFilter) ? filteredData : teamData).filter(
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
                          setCurrentPage(0);
                          const mappedData = (isSearch || isFilter) ? filteredData : teamData
                          setTeamLeadsData(
                            mappedData
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
                            ((isSearch || isFilter) ? filteredData : teamData).filter(
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
                          setBdmNewStatus("Not Interested");
                          setCurrentPage(0);
                          const mappedData = (isSearch || isFilter) ? filteredData : teamData
                          setTeamLeadsData(
                            mappedData.filter(
                              (obj) =>
                                obj.bdmStatus === "Not Interested" ||
                                obj.bdmStatus === "Busy" ||
                                obj.bdmStatus === "Not Picked Up" ||
                                obj.bdmStatus === "Junk"
                            )
                          );
                        }}
                        className={
                          bdmNewStatus === "Not Interested"
                            ? "nav-link active item-act"
                            : "nav-link"
                        }
                        data-bs-toggle="tab"
                      >
                        Not-Interested{" "}
                        <span className="no_badge">
                          {
                            ((isSearch || isFilter) ? filteredData : teamData).filter(
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
                            <th className="th-sticky">Sr.No</th>
                            <th className="th-sticky1">Company Name</th>
                            <th>BDE Name</th>
                            {bdmNewStatus !== "Untouched" && (<th>Company Number</th>)}
                            <th>Call History</th>
                            <th>BDE Status</th>
                            <th>BDE Remarks</th>
                            {(bdmNewStatus === "Interested" || bdmNewStatus === "FollowUp" || bdmNewStatus === "Matured" || bdmNewStatus === "NotInterested") && (
                              <>
                                <th>BDM Status</th>
                                <th>BDM Remarks</th>
                              </>
                            )}
                            {bdmNewStatus === "FollowUp" && (
                              <th>Next FollowUp Date</th>
                            )}
                            <th>
                              Incorporation Date
                            </th>
                            <th>City</th>
                            <th>State</th>
                            {bdmNewStatus !== "Untouched" && (<th>Company Email</th>)}
                            <th>
                              BDE Forward Date
                            </th>
                            {bdmNewStatus === "Untouched" && <th>Action</th>}
                            {(bdmNewStatus === "FollowUp" || bdmNewStatus === "Interested") && (<>
                              <th>Add Projection</th>
                              <th>Add Feedback</th>
                              {(bdmNewStatus === "FollowUp" && (<>
                                <th>Status Modification Date</th>
                                <th>Age</th>
                              </>)) ||
                                (bdmNewStatus === "Interested" && (<>
                                  <th>Status Modification Date</th>
                                  <th>Age</th>
                                </>))}
                            </>)
                            }
                          </tr>
                        </thead>
                        <tbody>
                          {teamleadsData.map((company, index) => {
                            let matchingLeadHistory
                            if (Array.isArray(leadHistoryData)) {
                              matchingLeadHistory = leadHistoryData.find(leadHistory => leadHistory._id === company._id);
                              // Do something with matchingLeadHistory
                            } else {
                              console.error("leadHistoryData is not an array");
                            }
                            return (
                              <tr
                                key={index}
                                style={{ border: "1px solid #ddd" }}
                              >
                                <td className="td-sticky">{startIndex + index + 1}</td>
                                <td className="td-sticky1">{company["Company Name"]}</td>
                                <td>{company.ename}</td>

                                {bdmNewStatus !== "Untouched" && (<td>
                                  <div className="d-flex align-items-center justify-content-between wApp">
                                    <div>{company["Company Number"]}</div>
                                    <a
                                      target="_blank"
                                      href={`https://wa.me/91${company["Company Number"]}`}
                                    >
                                      <FaWhatsapp />
                                    </a>
                                  </div>
                                </td>)}

                                <td>
                                  <LuHistory onClick={() => {
                                    setShowCallHistory(true);
                                    setClientNumber(company["Company Number"])
                                  }}
                                    style={{
                                      cursor: "pointer",
                                      width: "15px",
                                      height: "15px",
                                    }}
                                    color="grey"
                                  />
                                </td>
                                <td>{company.Status}</td>

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
                                          company.bdmName,
                                          company.ename
                                        );
                                        //setCurrentRemarks(company.Remarks);
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
                                        {company.bdmStatus === "Matured" ? (
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
                                                company.ename,
                                                company.isDeletedEmployeeCompany
                                              )
                                            }
                                          >
                                            {bdmNewStatus !== "Interested" && bdmNewStatus !== "FollowUp" && (
                                              <option value="Not Picked Up">
                                                Not Picked Up
                                              </option>)}
                                            <option value="Busy">Busy </option>
                                            {bdmNewStatus !== "Interested" && bdmNewStatus !== "FollowUp" && (
                                              <option value="Junk">
                                                Junk
                                              </option>)}
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
                                            {bdmNewStatus === "NotInterested" && (
                                              <>
                                                <option value="Interested">Interested</option>
                                                <option value="FollowUp">Follow Up</option>
                                              </>
                                            )}
                                          </select>
                                        )}
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
                                                company.bdmName,
                                                company.ename
                                              );
                                              setCurrentRemarks(company.bdmRemarks);
                                              //setCurrentRemarksBdm(company.Remarks)
                                              setCompanyId(company._id);
                                            }}>
                                            <EditIcon
                                              style={{
                                                width: "12px",
                                                height: "12px",
                                              }}
                                            />
                                          </IconButton>
                                        </div>
                                      </td>
                                    </>
                                  )}

                                {bdmNewStatus === "FollowUp" && (
                                  <td> <input style={{ border: "none" }}
                                    type="date"
                                    value={formatDateNow(company.bdmNextFollowUpDate)}
                                    onChange={(e) => {
                                      //setNextFollowUpDate(e.target.value);
                                      functionSubmitNextFollowUpDate(e.target.value,
                                        company._id,
                                        company.bdmStatus
                                      );
                                    }}
                                  //className="hide-placeholder"
                                  /></td>
                                )}

                                <td>{formatDateNew(company["Company Incorporation Date  "])}</td>
                                <td>{company["City"]}</td>
                                <td>{company["State"]}</td>
                                {bdmNewStatus !== "Untouched" && (<td>{company["Company Email"]}</td>)}
                                <td>{formatDateNew(company.bdeForwardDate)}</td>

                                {company.bdmStatus === "Untouched" && (
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
                                    {/* <IconButton onClick={() => {
                                    functionopenpopupremarksEdit(company._id,
                                      company.Status,
                                      company["Company Name"],
                                      company.bdmName,
                                      company.ename
                                    )
                                    handleRejectData(company._id, company.bdmName)
                                  }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="red" style={{ width: "12px", height: "12px", color: "red" }}><path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z" />
                                    </svg>
                                    </IconButton> */}
                                  </td>
                                )}

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
                                    {(company.feedbackRemarks || company.feedbackPoints.length !== 0) ? (<IconButton>
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
                                    </IconButton>) : (
                                      <IconButton>
                                        <IoAddCircle
                                          onClick={() => {
                                            handleOpenFeedback(
                                              company["Company Name"],
                                              company._id,
                                              company.feedbackPoints,
                                              company.feedbackRemarks,
                                              company.bdmStatus
                                            )
                                            setIsEditFeedback(true)
                                          }}
                                          style={{
                                            cursor: "pointer",
                                            width: "17px",
                                            height: "17px",
                                          }} />
                                      </IconButton>
                                    )}
                                  </td>

                                  {(bdmNewStatus === "FollowUp" || bdmNewStatus === "Interested") && (
                                    <>
                                      <td>
                                        {matchingLeadHistory ? `${formatDateLeadHistory(matchingLeadHistory.date)} || ${formatTime(matchingLeadHistory.time)}` : "-"}
                                      </td>
                                      <td>
                                        {matchingLeadHistory ? timePassedSince(matchingLeadHistory.date) : "-"}
                                      </td>
                                    </>
                                  )}
                                </>)}
                              </tr>
                            )
                          })}
                        </tbody>
                        {teamleadsData.length === 0 && (
                          <tbody>
                            <tr>
                              <td colSpan="11" className="p-2 particular">
                                <NoData />
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
          </div> : <CallHistory handleCloseHistory={hanleCloseCallHistory} clientNumber={clientNumber} />}
        </>
      )}

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

      {addFormOpen && (
        <>
          {" "}
          <AddLeadForm
            employeeEmail={maturedBooking.bdeEmail}
            newBdeName={maturedBooking.ename}
            isDeletedEmployeeCompany={deletedEmployeeStatus}
            setFormOpen={setAddFormOpen}
            companysName={maturedBooking["Company Name"]}
            setNowToFetch={setNowToFetch}
            setDataStatus={setdataStatus}
            employeeName={maturedBooking.ename}
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
            {filteredRemarksBde.length !== 0 ? (
              filteredRemarksBde.slice().map((historyItem) => (
                <div className="col-sm-12" key={historyItem._id}>
                  <div className="card RemarkCard position-relative">
                    <div className="d-flex justify-content-between">
                      <div className="reamrk-card-innerText">
                        <pre className="remark-text">{historyItem.remarks}</pre>
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

      {/* ----------------------------------------------------dialog for editing popup--------------------------------------------- */}
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
            {filteredRemarks.length !== 0 ? (
              filteredRemarks.slice().map((historyItem) => (
                <div className="col-sm-12" key={historyItem._id}>
                  <div className="card RemarkCard position-relative">
                    <div className="d-flex justify-content-between">
                      <div className="reamrk-card-innerText">
                        <pre className="remark-text">{historyItem.bdmRemarks}</pre>
                      </div>
                      <div className="dlticon">
                        <DeleteIcon
                          style={{
                            cursor: "pointer",
                            color: "#f70000",
                            width: "14px",
                          }}
                          onClick={() => {
                            handleDeleteRemarks(
                              historyItem._id,
                              historyItem.bdmRemarks
                            );
                          }}
                        />
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

          <div class="card-footer">
            <div class="mb-3 remarks-input">
              <textarea
                placeholder="Add Remarks Here...  "
                className="form-control"
                id="remarks-input"
                rows="3"
                value={changeRemarks}
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
          </div>
        </DialogContent>
      </Dialog>

      {/* --------------------------------------------------------- dialog for feedback----------------------------------------- */}
      {/* <Dialog
        open={openFeedback}
        onClose={handleCloseFeedback}
        fullWidth
        maxWidth="xs">
        <DialogTitle>
          <span style={{ fontSize: "11px" }}>
            BDM Feedback for {feedbackCompanyName}
          </span>
          <IconButton onClick={handleCloseFeedback} style={{ float: "right" }}>
            <CloseIcon color="primary" style={{ width: "16px", height: "16px" }}></CloseIcon>
          </IconButton>{" "}
          {(valueSlider && feedbackRemarks) ? (<IconButton
            onClick={() => {
              setIsEditFeedback(true);
            }}
            style={{ float: "right" }}>
            <EditIcon color="grey" style={{ width: "16px", height: "16px" }}></EditIcon>
          </IconButton>) : (null)}
        </DialogTitle>
        <DialogContent>

          <div className="card-body mt-5">
            <div className="feedback-slider">
              <Slider
                defaultValue={0}
                //getAriaValueText={valuetext} 
                value={valueSlider}
                onChange={(e) => { handleSliderChange(e.target.value) }}
                sx={{ zIndex: "99999999", color: "#ffb900" }}
                min={0}
                max={10}
                aria-label="Default"
                valueLabelDisplay="auto"
                disabled={!isEditFeedback} />
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
                disabled={!isEditFeedback}
              ></textarea>
            </div>
            <button
              onClick={handleFeedbackSubmit}
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              Submit
            </button>
          </div>

        </DialogContent>
      </Dialog> */}

      <Dialog
        open={openFeedback}
        onClose={handleCloseFeedback}
        fullWidth
        maxWidth="xs">
        <DialogTitle>
          <div className="d-flex align-items-center justify-content-between">
            <div className="m-0" style={{ fontSize: "16px" }}>Feedback Of <span className="text-wrap" >{feedbackCompanyName}</span></div>
            {(feedbackPoints.length !== 0 || feedbackRemarks) ? (<IconButton
              onClick={() => {
                setIsEditFeedback(true);
              }}
              style={{ float: "right" }}>
              <EditIcon color="grey" ></EditIcon>
            </IconButton>) : (null)}
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
                  disabled={!isEditFeedback} />
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
                  disabled={!isEditFeedback} />
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
                  disabled={!isEditFeedback} />
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
                  disabled={!isEditFeedback} />
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
                  disabled={!isEditFeedback} />
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
                disabled={!isEditFeedback}
              ></textarea>
            </div>
            <button
              onClick={handleFeedbackSubmit}
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              Submit
            </button>
          </div>
        </DialogContent>
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
              {/* <div>
                <button>Pay now</button>
                <button onClick={generatePaymentLink}>Generate Payment Link</button>
                {paymentLink && <a href={paymentLink} target="_blank" rel="noopener noreferrer">Proceed to Payment</a>}
                {error && <p>{error}</p>}
              </div> */}
            </div>
          </div>
        </Drawer>

        {/* This code will open filter drawer. */}
        <Drawer
          style={{ top: "50px" }}
          anchor="left"
          open={openFilterDrawer}
          onClose={functionCloseFilterDrawer}>
          <div style={{ width: "31em" }}>
            <div className="d-flex justify-content-between align-items-center container-xl pt-2 pb-2">
              <h2 className="title m-0">
                Filters
              </h2>
              <div>
                <button style={{ background: "none", border: "0px transparent" }} onClick={() => functionCloseFilterDrawer()}>
                  <IoIosClose style={{
                    height: "36px",
                    width: "32px",
                    color: "grey"
                  }} />
                </button>
              </div>
            </div>
            <hr style={{ margin: "0px" }} />
            <div className="body-Drawer">
              <div className='container-xl mt-2 mb-2'>
                <div className='row'>
                  <div className='col-sm-12 mt-3'>
                    <div className='form-group'>
                      <label for="exampleFormControlInput1" class="form-label">Status</label>
                      <select class="form-select form-select-md" aria-label="Default select example"
                        value={selectedStatus}
                        onChange={(e) => {
                          setSelectedStatus(e.target.value)
                        }}
                      >
                        <option selected value='Select Status'>Select Status</option>
                        <option value='Not Picked Up'>Not Picked Up</option>
                        <option value="Busy">Busy</option>
                        <option value="Junk">Junk</option>
                        <option value="Not Interested">Not Interested</option>
                        <option value="Untouched">Untouched</option>
                        <option value="Interested">Interested</option>
                        <option value="Matured">Matured</option>
                        <option value="FollowUp">Followup</option>
                      </select>
                    </div>
                  </div>
                  <div className='col-sm-12 mt-2'>
                    <div className='d-flex align-items-center justify-content-between'>
                      <div className='form-group w-50 mr-1'>
                        <label for="exampleFormControlInput1" class="form-label">State</label>
                        <select class="form-select form-select-md" aria-label="Default select example"
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value)
                            setSelectedStateCode(stateList.filter(obj => obj.name === e.target.value)[0]?.isoCode);
                            setSelectedCity(City.getCitiesOfState("IN", stateList.filter(obj => obj.name === e.target.value)[0]?.isoCode))
                            //handleSelectState(e.target.value)
                          }}
                        >
                          <option value=''>State</option>
                          {stateList.length !== 0 && stateList.map((item) => (
                            <option value={item.name}>{item.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className='form-group w-50'>
                        <label for="exampleFormControlInput1" class="form-label">City</label>
                        <select class="form-select form-select-md" aria-label="Default select example"
                          value={selectedNewCity}
                          onChange={(e) => {
                            setSelectedNewCity(e.target.value)
                          }}
                        >
                          <option value="">City</option>
                          {selectedCity.lenth !== 0 && selectedCity.map((item) => (
                            <option value={item.name}>{item.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className='col-sm-12 mt-2'>
                    <div className='form-group'>
                      <label for="assignon" class="form-label">BDE Forward Date</label>
                      <input type="date" class="form-control" id="assignon"
                        value={selectedBdeForwardDate}
                        placeholder="dd-mm-yyyy"
                        onChange={(e) => setSelectedBdeForwardDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className='col-sm-12 mt-2'>
                    <label class="form-label">Incorporation Date</label>
                    <div className='row align-items-center justify-content-between'>
                      <div className='col form-group mr-1'>
                        <select class="form-select form-select-md" aria-label="Default select example"
                          value={selectedYear}
                          onChange={(e) => {
                            setSelectedYear(e.target.value)
                          }}
                        >
                          <option value=''>Year</option>
                          {years.length !== 0 && years.map((item) => (
                            <option value={item}>{item}</option>
                          ))}
                        </select>
                      </div>
                      <div className='col form-group mr-1'>
                        <select class="form-select form-select-md" aria-label="Default select example"
                          value={selectedMonth}
                          disabled={selectedYear === ""}
                          onChange={(e) => {
                            setSelectedMonth(e.target.value)
                          }}
                        >
                          <option value=''>Month</option>
                          {months && months.map((item) => (
                            <option value={item}>{item}</option>
                          ))}
                        </select>
                      </div>
                      <div className='col form-group mr-1'>
                        <select class="form-select form-select-md" aria-label="Default select example"
                          disabled={selectedMonth === ''}
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                        >
                          <option value=''>Date</option>
                          {daysInMonth.map((day) => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-Drawer d-flex justify-content-between align-items-center">
              <button className='filter-footer-btn btn-clear'
                onClick={handleClearFilter}
              >Clear Filter</button>
              <button className='filter-footer-btn btn-yellow'
                onClick={handleFilterData}
              >Apply Filter</button>
            </div>
          </div>
        </Drawer>
      </div>
    </div>
  );
}

export default BdmTeamLeads;