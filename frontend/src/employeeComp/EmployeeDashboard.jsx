import React, { useEffect, useState, CSSProperties, useRef } from "react";
import Header from "../components/Header";
import EmpNav from "./EmpNav";
import axios from "axios";
import { useParams } from "react-router-dom";
import { options } from "../components/Options.js";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
//import { DateRangePicker } from "react-date-range";
import { FaRegCalendar } from "react-icons/fa";
import { Drawer, IconButton, colors } from "@mui/material";
import Swal from "sweetalert2";
import Select from "react-select";
import EditIcon from "@mui/icons-material/Edit";
import { CiSearch } from "react-icons/ci";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import ScaleLoader from "react-spinners/ScaleLoader";
import ClipLoader from "react-spinners/ClipLoader";
import AddCircle from "@mui/icons-material/AddCircle.js";
import io from "socket.io-client";
// import { ColorRing } from 'react-loader-spinner'
import Nodata from "../components/Nodata";
import { RiEditCircleFill } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import Calendar from "@mui/icons-material/Event";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { SingleInputDateRangeField } from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import { GrDocumentStore } from "react-icons/gr";
import { CiCalendar } from "react-icons/ci";
import { HiMiniCurrencyRupee } from "react-icons/hi2";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import moment from "moment";
import { StaticDateRangePicker } from "@mui/x-date-pickers-pro/StaticDateRangePicker";
import dayjs from "dayjs";
import { GoDatabase } from "react-icons/go";
import { ChartContainer } from '@mui/x-charts';
import {
  LinePlot,
  MarkPlot,
  lineElementClasses,
  markElementClasses,
} from '@mui/x-charts/LineChart';
import successImg from "../static/my-images/success.png"
import TotalAmount from "../static/my-images/salary.png"
import advance from "../static/my-images/advance.png"
import pending from "../static/my-images/pending.png"
import yesterday from "../static/my-images/yesterday.png"
import target from "../static/my-images/target.png"
import booking_date from "../static/my-images/booking_date.png"
import achivement from "../static/my-images/achivement.png"
import ratio from "../static/my-images/ratio.png"
import { set } from "date-fns";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
//import Select, { SelectChangeEvent } from '@mui/material/Select';
import roundImgOrg from "../static/my-images/circle-orange.svg";
import roundImggreen from "../static/my-images/Circle-Green.svg"
//icons
import { IoFileTrayFullOutline } from "react-icons/io5";
import { CiViewList } from "react-icons/ci";
import { MdImportantDevices } from "react-icons/md";
import { LiaAlgolia } from "react-icons/lia";
import { LiaClipboardCheckSolid } from "react-icons/lia";
import { RiFileCloseLine } from "react-icons/ri";
import EmployeeSalesReport from "./EmployeeDashboardComponents/EmployeeSalesReport.jsx";


//PIA CHART IMPORT
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';


//SPEDOMETER IMPORT
import GaugeComponent from 'react-gauge-component'


// LINE CHART
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from '@mui/x-charts/Gauge';
import { GoArrowUp } from "react-icons/go";
import { LineChart } from '@mui/x-charts/LineChart';
import EmployeeCallingReport from "./EmployeeDashboardComponents/EmployeeCallingReport.jsx";
import EmployeeForwardedReport from "./EmployeeDashboardComponents/EmployeeForwardedReport.jsx";
import EmployeeTopSellingServices from "./EmployeeDashboardComponents/EmployeeTopSellingServices.jsx";
import EmployeePerformance from "./EmployeeDashboardComponents/EmployeePerformance.jsx";
import EmployeeCallLogs from "./EmployeeDashboardComponents/EmployeeCallLogs.jsx";
import { maxHeight } from "@mui/system";
import EmployeePerformanceReport from "./EmployeeDashboardComponents/EmployeePerformanceReport.jsx";
import TodaysCollection from "./TodaysCollection.jsx";
import CurrentMonthLeadsReport from "./EmployeeDashboardComponents/CurrentMonthLeadsReport.jsx";
import { jwtDecode } from "jwt-decode";





// LINE CHART CODE START



function EmployeeDashboard() {
  const { userId } = useParams();
  const { newtoken } = useParams();
  const [data, setData] = useState([]);
  const [isEditProjection, setIsEditProjection] = useState(false);
  const [projectingCompany, setProjectingCompany] = useState("");
  const [showBookingDate, setShowBookingDate] = useState(false);
  const [startDateAnother, setStartDateAnother] = useState(new Date());
  const [endDateAnother, setEndDateAnother] = useState(new Date());
  const [startDateTotalSummary, setStartDateTotalSummary] = useState(
    new Date()
  );
  const [endDateTotalSummary, setEndDateTotalSummary] = useState(new Date());
  const [openProjection, setOpenProjection] = useState(false);
  const [socketID, setSocketID] = useState("");
  const [totalBooking, setTotalBooking] = useState([]);
  //const [uniqueArray, setuniqueArray] = useState([])
  const [filteredBooking, setFilteredBooking] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [uniqueArrayLoading, setuniqueArrayLoading] = useState(false);
  const [projectionLoading, setprojectionLoading] = useState(false);
  const [currentProjection, setCurrentProjection] = useState({
    companyName: "",
    ename: "",
    offeredPrize: 0,
    offeredServices: [],
    lastFollowUpdate: "",
    estPaymentDate: "",
    date: "",
    time: "",
  });
  const [empData, setEmpData] = useState([]);
  const [followData, setFollowData] = useState([]);
  const [followDataFilter, setFollowDataFilter] = useState([]);
  const [displayDateRange, setDateRangeDisplay] = useState(false);
  const [buttonToggle, setButtonToggle] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [filteredDataDateRange, setFilteredDataDateRange] = useState([]);
  const [sortType, setSortType] = useState({
    untouched: "ascending",
    notPickedUp: "ascending",
    busy: "ascending",
    junk: "ascending",
    notInterested: "ascending",
    followUp: "ascending",
    matured: "ascending",
    interested: "ascending",
    lastLead: "ascending",
    totalLeads: "ascending",
  });
  const [incoFilter, setIncoFilter] = useState("");
  const dateRangePickerRef = useRef(null);
  const dateRangePickerProhectionRef = useRef(null);
  const dateRangePickerProhectionSummaryRef = useRef(null);

  // Performance Report State :
  const secretKey = process.env.REACT_APP_SECRET_KEY;
  const formatDate = (inputDate) => {
    const date = new Date(inputDate);
    const convertedDate = date.toLocaleDateString();
    return convertedDate;
  };

  useEffect(() => {
    document.title = `Employee-Sahay-CRM`;
  }, [data.ename]);




  const fetchData = async () => {
    try {
      const response = await axios.get(`${secretKey}/employee/einfo`);
      // Set the retrieved data in the state
      const tempData = response.data;
      const userData = tempData.find((item) => item._id === userId);
      setData(userData);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const [tempData, setTempData] = useState([]);
  const [loadingNew, setLoadingNew] = useState([]);
  const [moreEmpData, setmoreEmpData] = useState([])
  const [speed, setSpeed] = useState(0);




  // -------------------------api for contact number-------------------------------------------------------

  const fetchNewData = async () => {
    try {
      const response = await axios.get(`${secretKey}/company-data/employees/${data.ename}`);
      const tempData = response.data;
      setTempData(tempData);
      setmoreEmpData(tempData)
    } catch (error) {
      console.error("Error fetching new data:", error);
    }
  };

  useEffect(() => {
    fetchNewData();
    fetchRedesignedBookings();
  }, [data]);

  const [todayFollowUpDateData, setTodayFollowUpDateData] = useState([])
  const [todayFollowUpDateDataFilter, setTodayFollowUpDateDataFilter] = useState([])

  function formatDateNow(timestamp) {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  const fetchEmployeeData = async () => {
    setLoading(true);
    fetch(`${secretKey}/company-data/edata-particular/${data.ename}`)
      .then((response) => response.json())
      .then((data) => {
        setEmpData(data);
        setTodayFollowUpDateDataFilter(data.filter((company) => {
          // Assuming you want to filter companies with an estimated payment date for today
          const today = new Date().toISOString().split("T")[0]; // Get today's date in the format 'YYYY-MM-DD'
          return formatDateNow(company.bdeNextFollowUpDate) === today;
        }));
        setTodayFollowUpDateData(
          data.filter((company) => {
            // Assuming you want to filter companies with an estimated payment date for today
            const today = new Date().toISOString().split("T")[0]; // Get today's date in the format 'YYYY-MM-DD'
            return formatDateNow(company.bdeNextFollowUpDate) === today;
          })
        );
        //setTodayFollowUpDateData(data.filter((company)=> company.bdeNextFollowUpDate === new Date().toISOString().split("T")[0]))
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  // --------------------------------fetching team leads data--------------------------------------------------

  const [teamLeadsData, setTeamLeadsData] = useState([])
  const [teamData, setTeamData] = useState([])

  const fetchTeamLeadsData = async () => {

    try {
      const response = await axios.get(`${secretKey}/bdm-data/forwardedbybdedata/${data.ename}`)
      setTeamLeadsData(response.data)
      setTeamData(response.data)

    } catch (error) {
      console.log("Error fetching data", error.message)
    }
  }

  //console.log(teamLeadsData)

  useEffect(() => {
    fetchTeamLeadsData()
  }, [data.ename])

  // const tableEmployee = data.ename;
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchEmployeeData().then(() => setLoading(false)); // Set loading to false after data is fetched
  }, [data]);

  const formattedDates =
    empData.length !== 0 && empData.map((data) => formatDate(data.AssignDate));
  //console.log("Formatted Dates", formattedDates);
  const uniqueArray = formattedDates && [...new Set(formattedDates)];

  // ---------------------------Bookings Part --------------------------------------

  const handleCloseIconClickAnother = () => {
    if (showBookingDate) {
      setShowBookingDate(false);
    }
  };

  const handleClickOutside = (event) => {
    if (
      dateRangePickerRef.current &&
      !dateRangePickerRef.current.contains(event.target)
    ) {
      setShowBookingDate(false);
    }
  };

  // Add event listener when the component mounts
  useEffect(() => {
    const totalBookingElement = document.getElementById("bookingdashboard");
    if (totalBookingElement) {
      totalBookingElement.addEventListener("click", handleClickOutside);
      // Remove event listener when the component unmounts
      return () => {
        totalBookingElement.removeEventListener("click", handleClickOutside);
      };
    }
  }, []);

  const handleClickOutsideProjectionSummary = (event) => {
    if (
      dateRangePickerProhectionSummaryRef.current &&
      !dateRangePickerProhectionSummaryRef.current.contains(event.target)
    ) {
      setdateRangeTotalSummary(false);
    }
  };

  // Add event listener when the component mounts
  useEffect(() => {
    const totalBookingElement = document.getElementById(
      "projectiontotalsummary"
    );
    if (totalBookingElement) {
      totalBookingElement.addEventListener(
        "click",
        handleClickOutsideProjectionSummary
      );
      // Remove event listener when the component unmounts
      return () => {
        totalBookingElement.removeEventListener(
          "click",
          handleClickOutsideProjectionSummary
        );
      };
    }
  }, []);

  useEffect(() => {
    const totalBookingElement = document.getElementById("bookingdashboard");
    if (totalBookingElement) {
      totalBookingElement.addEventListener("click", handleClickOutside);
      // Remove event listener when the component unmounts
      return () => {
        totalBookingElement.removeEventListener("click", handleClickOutside);
      };
    }
  }, []);

  const handleClickOutsideProjection = (event) => {
    if (
      dateRangePickerProhectionRef.current &&
      !dateRangePickerProhectionRef.current.contains(event.target)
    ) {
      setDateRangeDisplay(false);
    }
  };
  // -------------------------------------------- socket.io section ------------------------------------------------
  useEffect(() => {
    const socket = secretKey === "http://localhost:3001/api" ? io("http://localhost:3001") : io("wss://startupsahay.in", {
      secure: true, // Use HTTPS
      path: '/socket.io',
      reconnection: true,
      transports: ['websocket'],
    });
    socket.on("connect", () => {
      console.log("Socket connected with ID:", socket.id);
      setSocketID(socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  const activeStatus = async () => {
    if (data._id && socketID) {
      try {
        const id = data._id;
        console.log("Request is sending for socket id" + socketID + data._id);
        const response = await axios.put(
          `${secretKey}/employee/online-status/${id}/${socketID}`
        );
        //console.log(response.data); // Log response for debugging
        return response.data; // Return response data if needed
      } catch (error) {
        console.error("Error:", error);
        throw error; // Throw error for handling in the caller function
      }
    }
  };
  useEffect(() => {
    const timerId = setTimeout(() => {
      activeStatus();
    }, 2000);

    return () => {
      clearTimeout(timerId);
    };
  }, [socketID]);
  // ----------------------------------------  Socket.io Section End  -------------------------------------------------------
  const selectionRangeAnother = {
    startDate: startDateAnother,
    endDate: endDateAnother,
    key: "selection",
  };
  // const handleSelectAnother = (date) => {

  //   const filteredDataDateRange = totalBooking.filter((product) => {
  //     const productDate = new Date(product["bookingDate"]);
  //     return (
  //       productDate >= date.selection.startDate &&
  //       productDate <= date.selection.endDate
  //     );
  //   });
  //   setStartDateAnother(date.selection.startDate);
  //   setEndDateAnother(date.selection.endDate);
  //   setFilteredBooking(filteredDataDateRange);
  // };

  // ---------------------------projectiondata-------------------------------------

  const [followDataToday, setfollowDataToday] = useState([]);
  const [followDataTodayFilter, setfollowDataTodayFilter] = useState([]);

  const fetchFollowUpData = async () => {
    try {
      setprojectionLoading(true);
      const response = await fetch(
        `${secretKey}/projection/projection-data/${data.ename}`
      );
      const followdata = await response.json();
      setFollowData(followdata);
      setFollowDataFilter(followdata);
      setfollowDataToday(
        followdata.filter((company) => {
          // Assuming you want to filter companies with an estimated payment date for today
          const today = new Date().toISOString().split("T")[0]; // Get today's date in the format 'YYYY-MM-DD'
          return company.estPaymentDate === today;
        })
      );
      setfollowDataTodayFilter(
        followdata.filter((company) => {
          // Assuming you want to filter companies with an estimated payment date for today
          const today = new Date().toISOString().split("T")[0]; // Get today's date in the format 'YYYY-MM-DD'
          return company.estPaymentDate === today;
        })
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      return { error: "Error fetching data" };
    } finally {
      setprojectionLoading(false);
    }
  };

  //console.log("ajki", followDataToday)

  const today = new Date().toISOString().split("T")[0];

  // console.log(followData);

  function calculateSum(data) {
    const initialValue = {
      totalPaymentSum: 0,
      offeredPaymentSum: 0,
      offeredServices: [],
    };

    const sum = data.reduce((accumulator, currentValue) => {
      // Concatenate offeredServices from each object into a single array
      const offeredServices = accumulator.offeredServices.concat(
        currentValue.offeredServices
      );

      return {
        totalPaymentSum:
          accumulator.totalPaymentSum + currentValue.totalPayment,
        offeredPaymentSum:
          accumulator.offeredPaymentSum + currentValue.offeredPrize,
        offeredServices: offeredServices,
      };
    }, initialValue);

    // // Remove duplicate services from the array
    // sum.offeredServices = Array.from(new Set(sum.offeredServices));

    return sum;
  }

  // Calculate the sums
  const { totalPaymentSum, offeredPaymentSum, offeredServices } =
    calculateSum(followDataFilter);

  //console.log(totalPaymentSum , offeredPaymentSum , offeredServices)

  useEffect(() => {
    fetchFollowUpData();
  }, [data]);

  const [bdeNameProjection, setbdeNameProjection] = useState(" ")
  const [enameProjection, setEnameProjection] = useState("")

  const functionopenprojection = (comName, bdeName, ename) => {
    setProjectingCompany(comName);
    setOpenProjection(true);
    setbdeNameProjection(bdeName)
    setEnameProjection(ename)
    const findOneprojection =
      followData.length !== 0 &&
      followData.find((item) => item.companyName === comName);
    if (findOneprojection) {
      setCurrentProjection({
        companyName: findOneprojection.companyName,
        ename: findOneprojection.ename,
        offeredPrize: findOneprojection.offeredPrize,
        offeredServices: findOneprojection.offeredServices,
        lastFollowUpdate: findOneprojection.lastFollowUpdate,
        estPaymentDate: findOneprojection.estPaymentDate,
        totalPayment: findOneprojection.totalPayment,
        remarks: findOneprojection.remarks,
        date: "",
        time: "",
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
      lastFollowUpdate: "",
      date: "",
      time: "",
    });
    setIsEditProjection(false);
    setSelectedValues([]);
  };

  //console.log("currentprojection", currentProjection)

  const handleProjectionSubmit = async () => {
    try {
      const finalData = {
        ...currentProjection,
        companyName: projectingCompany,
        ename: data.ename,
        offeredServices: selectedValues,
      };
      //console.log(Number(finalData.totalPayment) , Number(finalData.offeredPrize))
      if (finalData.offeredServices.length === 0) {
        Swal.fire({ title: "Services is required!", icon: "warning" });
      } else if (finalData.remarks === "") {
        Swal.fire({ title: "Remarks is required!", icon: "warning" });
      } else if (Number(finalData.totalPayment) === 0) {
        Swal.fire({ title: "Total Payment Can't be 0!", icon: "warning" });
      } else if (finalData.totalPayment === "") {
        Swal.fire({ title: "Total Payment Can't be 0", icon: "warning" });
      } else if (finalData.offeredPrize === "") {
        Swal.fire({ title: "Offred Price Can't be 0", icon: "warning" });
      } else if (Number(finalData.offeredPrize) === 0) {
        Swal.fire({ title: "Offered Prize is required!", icon: "warning" });
      } else if (
        Number(finalData.totalPayment) > Number(finalData.offeredPrize)
      ) {
        Swal.fire({
          title: "Total Payment cannot be greater than Offered Prize!",
          icon: "warning",
        });
      } else if (finalData.lastFollowpdate === null) {
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
        const response = await axios.post(
          `${secretKey}/projection/update-followup`,
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
          totalPaymentError: "",
          totalPayment: 0,
        });
        fetchFollowUpData();
      }

      // Send data to backend API

      // Log success message
    } catch (error) {
      console.error("Error updating or adding data:", error.message);
    }
  };

  // -------------------------------date-range-picker-------------------------------------------

  const [dateRangeTotalSummary, setdateRangeTotalSummary] = useState(false);

  const handleIconClick = () => {
    if (!buttonToggle) {
      setDateRangeDisplay(true);
    } else {
      setDateRangeDisplay(false);
    }
    setButtonToggle(!buttonToggle);
  };

  const handleIconClickTotalSummary = () => {
    if (!buttonToggle) {
      setdateRangeTotalSummary(true);
    } else {
      setdateRangeTotalSummary(false);
    }
    setButtonToggle(!buttonToggle);
  };

  const selectionRange = {
    startDate: startDate,
    endDate: endDate,
    key: "selection",
  };

  const selectionRangeTotalSummary = {
    startDate: startDateTotalSummary,
    endDate: endDateTotalSummary,
    key: "selection",
  };

  const [selectedDateRange, setSelectedDateRange] = useState([]);

  //console.log("selectedDates", selectedDateRange);

  const handleSelect = (values) => {
    // Extract startDate and endDate from the values array
    const startDate = values[0];
    const endDate = values[1];

    // Set the startDate, endDate, and filteredDataDateRange states
    setStartDate(startDate);
    setEndDate(endDate);
    //setFilteredDataDateRange(filteredDataDateRange);
  };

  useEffect(() => {
    // Filter followData based on the selected date range
    const filteredDataDateRange = followData.filter((product) => {
      const productDate = new Date(product["estPaymentDate"]);

      // Convert productDate to the sameformat as startDate and endDate
      const formattedProductDate = dayjs(productDate).startOf("day");
      const formattedStartDate = startDate
        ? dayjs(startDate).startOf("day")
        : null;
      const formattedEndDate = endDate ? dayjs(endDate).endOf("day") : null;

      // Check if the formatted productDate is within the selected date range
      if (
        formattedStartDate &&
        formattedEndDate &&
        formattedStartDate.isSame(formattedEndDate)
      ) {
        // If both startDate and endDate are the same, filter for transactions on that day
        return formattedProductDate.isSame(formattedStartDate);
      } else if (formattedStartDate && formattedEndDate) {
        // If different startDate and endDate, filter within the range
        return (
          formattedProductDate >= formattedStartDate &&
          formattedProductDate <= formattedEndDate
        );
      } else {
        // If either startDate or endDate is null, return false
        return false;
      }
    });

    setFollowDataFilter(filteredDataDateRange);
  }, [startDate, endDate]);

  //console.log(totalBooking);

  const handleSelectAnother = (values) => {
    console.log(values);
    if (values[1]) {
      const startDate = values[0].format("MM/DD/YYYY");
      const endDate = values[1].format("MM/DD/YYYY");

      const filteredDataDateRange = totalBooking.filter((product) => {
        const productDate = new Date(product["bookingDate"]).setHours(
          0,
          0,
          0,
          0
        );

        // Check if the formatted productDate is within the selected date range
        if (startDate === endDate) {
          // If both startDate and endDate are the same, filter for transactions on that day
          return new Date(productDate) === new Date(startDate);
        } else if (startDate !== endDate) {
          // If different startDate and endDate, filter within the range
          return (
            new Date(productDate) >= new Date(startDate) &&
            new Date(productDate) <= new Date(endDate)
          );
        } else {
          return false;
        }
      });
      setFilteredBooking(filteredDataDateRange);
    } else {
      return true;
    }
  };

  const handleSelectTotalSummary = (date) => {
    const filteredDataDateRange = followData.filter((product) => {
      const productDate = new Date(product["estPaymentDate"]);
      //console.log("productdate", productDate)

      if (
        formatDate(date.selection.startDate) ===
        formatDate(date.selection.endDate)
      ) {
        return formatDate(productDate) == formatDate(date.selection.startDate);
      } else {
        return (
          productDate >= date.selection.startDate &&
          productDate <= date.selection.endDate
        );
      }
    });
    setStartDateTotalSummary(date.selection.startDate);
    setEndDateTotalSummary(date.selection.endDate);
    setFollowDataFilter(filteredDataDateRange);
    //console.log(filteredDataDateRange);
  };
  //console.log(startDateTotalSummary)
  //console.log(endDateTotalSummary)

  // function calculateSumFilter(data) {
  //   const initialValue = {
  //     totalPaymentSumFilter: 0,
  //     offeredPaymentSumFilter: 0,
  //     offeredServicesFilter: [],
  //   };

  //   const sum = data.reduce((accumulator, currentValue) => {
  //     // Concatenate offeredServices from each object into a single array
  //     const offeredServices = accumulator.offeredServicesFilter.concat(
  //       currentValue.offeredServices
  //     );

  //     return {
  //       totalPaymentSumFilter:
  //         accumulator.totalPaymentSumFilter + currentValue.totalPayment,
  //       offeredPaymentSumFilter:
  //         accumulator.offeredPaymentSumFilter + currentValue.offeredPrize,
  //       offeredServicesFilter: offeredServices,
  //     };
  //   }, initialValue);

  //   // // Remove duplicate services from the array
  //   // sum.offeredServices = Array.from(new Set(sum.offeredServices));

  //   return sum;
  // }

  // // Calculate the sums
  // const {
  //   totalPaymentSumFilter,
  //   offeredPaymentSumFilter,
  //   offeredServicesFilter,
  // } = calculateSumFilter(filteredDataDateRange);

  function calculateSumFilter(data) {
    const initialValue = {
      totalPaymentSumFilter: 0,
      offeredPaymentSumFilter: 0,
      offeredServicesFilter: [],
    };

    const sum = data.reduce((accumulator, currentValue) => {
      // Concatenate offeredServices from each object into a single array
      const offeredServices = accumulator.offeredServicesFilter.concat(
        currentValue.offeredServices
      );

      return {
        totalPaymentSumFilter:
          accumulator.totalPaymentSumFilter + currentValue.totalPayment,
        offeredPaymentSumFilter:
          accumulator.offeredPaymentSumFilter + currentValue.offeredPrize,
        offeredServicesFilter: offeredServices,
      };
    }, initialValue);

    // // Remove duplicate services from the array
    // sum.offeredServices = Array.from(new Set(sum.offeredServices));

    return sum;
  }

  // Calculate the sums
  const {
    totalPaymentSumFilter,
    offeredPaymentSumFilter,
    offeredServicesFilter,
  } = calculateSumFilter(followDataTodayFilter);

  //console.log("follow data:", currentProjection);
  // -----------------------------------------------------general-search--------------------------------------------

  // function filterSearch(searchTerm) {
  //   setSearchTerm(searchTerm);
  //   setFilteredDataDateRange(followData.filter(company =>
  //     company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     company.offeredServices.some(service =>
  //       service.toLowerCase().includes(searchTerm.toLowerCase())
  //     ) ||
  //     company.totalPayment.toString() === searchTerm ||
  //     company.offeredPrize.toString() === searchTerm ||
  //     company.estPaymentDate.includes(searchTerm)

  //   ));
  // }

  function filterSearch(searchTerm) {
    setSearchTerm(searchTerm);
    setfollowDataTodayFilter(
      followDataToday.filter(
        (company) =>
          company.companyName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          company.offeredServices.some((service) =>
            service.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          company.totalPayment.toString() === searchTerm ||
          company.offeredPrize.toString() === searchTerm ||
          company.estPaymentDate.includes(searchTerm)
      )
    );
  }

  const [searchTermTotalSummary, setsearchTermTotalSummary] = useState("");

  //console.log(followDataFilter)
  //console.log(followData)

  function filterSearchTotalSummary(searchTermTotalSummary) {
    setsearchTermTotalSummary(searchTermTotalSummary);
    //console.log(searchTermTotalSummary)
    setFollowDataFilter(
      followData.filter(
        (company) =>
          company.companyName
            .toLowerCase()
            .includes(searchTermTotalSummary.toLowerCase()) ||
          company.offeredServices.some((service) =>
            service.toLowerCase().includes(searchTermTotalSummary.toLowerCase())
          ) ||
          company.totalPayment.toString() === searchTermTotalSummary ||
          company.offeredPrize.toString() === searchTermTotalSummary ||
          company.estPaymentDate.includes(searchTermTotalSummary)
      )
    );
  }

  //console.log(filteredDataDateRange)
  const [newSearchTerm, setNewSearchTerm] = useState("");
  const [newSearchTermFollow, setNewSearchTermFollow] = useState("");

  function filterSearchBooking(newSearchTerm) {
    setNewSearchTerm(newSearchTerm);
    setFilteredBooking(
      totalBooking.filter(
        (company) =>
          company.companyName
            .toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          company.contactNumber.toString() === newSearchTerm ||
          company.companyEmail
            .toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          company.services.some((service) =>
            service.toLowerCase().includes(newSearchTerm.toLowerCase())
          ) ||
          company.totalPayment.toString() === newSearchTerm ||
          //(company.firstPayment ? company.firstPayment.toString() : company.totalPayment.toString()) === newSearchTerm
          company.bdmName.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          new Date(company.bookingDate)
            .toLocaleDateString()
            .includes(newSearchTerm)
      )
    );
  }


  function filterSearchBookingFollow(newSearchTerm) {
    setNewSearchTermFollow(newSearchTerm);

    console.log(newSearchTerm);

    setTodayFollowUpDateData(
      todayFollowUpDateDataFilter.filter((company) =>
        company["Company Name"].toLowerCase().includes(newSearchTerm.toLowerCase()) ||
        company["Company Number"].toString() === newSearchTerm
      )
    );
  }
  //  -----------------------------------sorting- your -dashboard-----------------------------------

  const handleSortUntouched = (sortBy1) => {
    setSortType((prevData) => ({
      ...prevData,
      untouched:
        prevData.untouched === "ascending"
          ? "descending"
          : prevData.untouched === "descending"
            ? "none"
            : "ascending",
    }));
    switch (sortBy1) {
      case "ascending":
        setIncoFilter("ascending");
        const untouchedCountAscending = {};
        //console.log("ascending is working")
        empData.forEach((company) => {
          if (company.Status === "Untouched") {
            untouchedCountAscending[company.AssignDate] =
              (untouchedCountAscending[company.AssignDate] || 0) + 1;
          }
        });

        // Step 2: Sort employeeData based on the count of "Untouched" statuses
        empData.sort((a, b) => {
          const countA = untouchedCountAscending[a.AssignDate] || 0;
          const countB = untouchedCountAscending[b.AssignDate] || 0;
          return countA - countB; // Sort in ascending order of "Untouched" count
        });
        break;

      case "descending":
        setIncoFilter("descending");
        const untouchedCount = {};
        //console.log("descending is working")
        empData.forEach((company) => {
          if (company.Status === "Untouched") {
            untouchedCount[company.AssignDate] =
              (untouchedCount[company.AssignDate] || 0) + 1;
          }
        });

        // Step 2: Sort employeeData based on the count of "Untouched" statuses
        empData.sort((a, b) => {
          const countA = untouchedCount[a.AssignDate] || 0;
          const countB = untouchedCount[b.AssignDate] || 0;
          return countB - countA; // Sort in descending order of "Untouched" count
        });
        break;

      case "none":
        setIncoFilter("none");

        break;

      default:
        break;
    }
  };

  const handleSortBusy = (sortBy1) => {
    setSortType((prevData) => ({
      ...prevData,
      busy:
        prevData.busy === "ascending"
          ? "descending"
          : prevData.untouched === "descending"
            ? "none"
            : "ascending",
    }));
    switch (sortBy1) {
      case "ascending":
        setIncoFilter("ascending");
        const untouchedCountAscending = {};
        empData.forEach((company) => {
          if (company.Status === "Busy") {
            untouchedCountAscending[company.AssignDate] =
              (untouchedCountAscending[company.AssignDate] || 0) + 1;
          }
        });
        // Step 2: Sort employeeData based on the count of "Untouched" statuses in ascending order
        empData.sort((a, b) => {
          const countA = untouchedCountAscending[a.AssignDate] || 0;
          const countB = untouchedCountAscending[b.AssignDate] || 0;
          return countA - countB; // Sort in ascending order of "Untouched" count
        });
        break;

      case "descending":
        setIncoFilter("descending");
        const untouchedCount = {};
        empData.forEach((company) => {
          if (company.Status === "Busy") {
            untouchedCount[company.AssignDate] =
              (untouchedCount[company.AssignDate] || 0) + 1;
          }
        });

        // Step 2: Sort employeeData based on the count of "Untouched" statuses
        empData.sort((a, b) => {
          const countA = untouchedCount[a.AssignDate] || 0;
          const countB = untouchedCount[b.AssignDate] || 0;
          return countB - countA; // Sort in descending order of "Untouched" count
        });
        break;

      case "none":
        setIncoFilter("none");

        break;

      default:
        break;
    }
  };
  const handleSortJunk = (sortBy1) => {
    setSortType((prevData) => ({
      ...prevData,
      junk:
        prevData.junk === "ascending"
          ? "descending"
          : prevData.junk === "descending"
            ? "none"
            : "ascending",
    }));
    switch (sortBy1) {
      case "ascending":
        setIncoFilter("ascending");
        const untouchedCountAscending = {};
        empData.forEach((company) => {
          if (company.Status === "Junk") {
            untouchedCountAscending[company.AssignDate] =
              (untouchedCountAscending[company.AssignDate] || 0) + 1;
          }
        });
        // Step 2: Sort employeeData based on the count of "Untouched" statuses in ascending order
        empData.sort((a, b) => {
          const countA = untouchedCountAscending[a.AssignDate] || 0;
          const countB = untouchedCountAscending[b.AssignDate] || 0;
          return countA - countB; // Sort in ascending order of "Untouched" count
        });
        break;

      case "descending":
        setIncoFilter("descending");
        const untouchedCount = {};
        empData.forEach((company) => {
          if (company.Status === "Junk") {
            untouchedCount[company.AssignDate] =
              (untouchedCount[company.AssignDate] || 0) + 1;
          }
        });

        // Step 2: Sort employeeData based on the count of "Untouched" statuses
        empData.sort((a, b) => {
          const countA = untouchedCount[a.AssignDate] || 0;
          const countB = untouchedCount[b.AssignDate] || 0;
          return countB - countA; // Sort in descending order of "Untouched" count
        });
        break;

      case "none":
        setIncoFilter("none");

        break;

      default:
        break;
    }
  };
  const handleSortNotPickedUp = (sortBy1) => {
    setSortType((prevData) => ({
      ...prevData,
      notPickedUp:
        prevData.notPickedUp === "ascending"
          ? "descending"
          : prevData.notPickedUp === "descending"
            ? "none"
            : "ascending",
    }));
    switch (sortBy1) {
      case "ascending":
        setIncoFilter("ascending");
        const untouchedCountAscending = {};
        empData.forEach((company) => {
          if (company.Status === "Not Picked Up") {
            untouchedCountAscending[company.AssignDate] =
              (untouchedCountAscending[company.AssignDate] || 0) + 1;
          }
        });
        // Step 2: Sort employeeData based on the count of "Untouched" statuses in ascending order
        empData.sort((a, b) => {
          const countA = untouchedCountAscending[a.AssignDate] || 0;
          const countB = untouchedCountAscending[b.AssignDate] || 0;
          return countA - countB; // Sort in ascending order of "Untouched" count
        });
        break;

      case "descending":
        setIncoFilter("descending");
        const untouchedCount = {};
        empData.forEach((company) => {
          if (company.Status === "Not Picked Up") {
            untouchedCount[company.AssignDate] =
              (untouchedCount[company.AssignDate] || 0) + 1;
          }
        });

        // Step 2: Sort employeeData based on the count of "Untouched" statuses
        empData.sort((a, b) => {
          const countA = untouchedCount[a.AssignDate] || 0;
          const countB = untouchedCount[b.AssignDate] || 0;
          return countB - countA; // Sort in descending order of "Untouched" count
        });
        break;

      case "none":
        setIncoFilter("none");

        break;

      default:
        break;
    }
  };

  const handleSortFollowUp = (sortBy1) => {
    setSortType((prevData) => ({
      ...prevData,
      followUp:
        prevData.followUp === "ascending"
          ? "descending"
          : prevData.followUp === "descending"
            ? "none"
            : "ascending",
    }));
    switch (sortBy1) {
      case "ascending":
        setIncoFilter("ascending");
        const untouchedCountAscending = {};
        empData.forEach((company) => {
          if (company.Status === "FollowUp") {
            untouchedCountAscending[company.AssignDate] =
              (untouchedCountAscending[company.AssignDate] || 0) + 1;
          }
        });
        // Step 2: Sort employeeData based on the count of "Untouched" statuses in ascending order
        empData.sort((a, b) => {
          const countA = untouchedCountAscending[a.AssignDate] || 0;
          const countB = untouchedCountAscending[b.AssignDate] || 0;
          return countA - countB; // Sort in ascending order of "Untouched" count
        });
        break;

      case "descending":
        setIncoFilter("descending");
        const untouchedCount = {};
        empData.forEach((company) => {
          if (company.Status === "FollowUp") {
            untouchedCount[company.AssignDate] =
              (untouchedCount[company.AssignDate] || 0) + 1;
          }
        });

        // Step 2: Sort employeeData based on the count of "Untouched" statuses
        empData.sort((a, b) => {
          const countA = untouchedCount[a.AssignDate] || 0;
          const countB = untouchedCount[b.AssignDate] || 0;
          return countB - countA; // Sort in descending order of "Untouched" count
        });
        break;

      case "none":
        setIncoFilter("none");

        break;

      default:
        break;
    }
  };

  const handleSortInterested = (sortBy1) => {
    setSortType((prevData) => ({
      ...prevData,
      interested:
        prevData.interested === "ascending"
          ? "descending"
          : prevData.interested === "descending"
            ? "none"
            : "ascending",
    }));
    switch (sortBy1) {
      case "ascending":
        setIncoFilter("ascending");
        const untouchedCountAscending = {};
        empData.forEach((company) => {
          if (company.Status === "Interested") {
            untouchedCountAscending[company.AssignDate] =
              (untouchedCountAscending[company.AssignDate] || 0) + 1;
          }
        });
        // Step 2: Sort employeeData based on the count of "Untouched" statuses in ascending order
        empData.sort((a, b) => {
          const countA = untouchedCountAscending[a.AssignDate] || 0;
          const countB = untouchedCountAscending[b.AssignDate] || 0;
          return countA - countB; // Sort in ascending order of "Untouched" count
        });
        break;

      case "descending":
        setIncoFilter("descending");
        const untouchedCount = {};
        empData.forEach((company) => {
          if (company.Status === "Interested") {
            untouchedCount[company.AssignDate] =
              (untouchedCount[company.AssignDate] || 0) + 1;
          }
        });

        // Step 2: Sort employeeData based on the count of "Untouched" statuses
        empData.sort((a, b) => {
          const countA = untouchedCount[a.AssignDate] || 0;
          const countB = untouchedCount[b.AssignDate] || 0;
          return countB - countA; // Sort in descending order of "Untouched" count
        });
        break;

      case "none":
        setIncoFilter("none");

        break;

      default:
        break;
    }
  };

  const handleSortNotInterested = (sortBy1) => {
    setSortType((prevData) => ({
      ...prevData,
      notInterested:
        prevData.notInterested === "ascending"
          ? "descending"
          : prevData.notInterested === "descending"
            ? "none"
            : "ascending",
    }));
    switch (sortBy1) {
      case "ascending":
        setIncoFilter("ascending");
        const untouchedCountAscending = {};
        empData.forEach((company) => {
          if (company.Status === "Not Interested") {
            untouchedCountAscending[company.AssignDate] =
              (untouchedCountAscending[company.AssignDate] || 0) + 1;
          }
        });
        // Step 2: Sort employeeData based on the count of "Untouched" statuses in ascending order
        empData.sort((a, b) => {
          const countA = untouchedCountAscending[a.AssignDate] || 0;
          const countB = untouchedCountAscending[b.AssignDate] || 0;
          return countA - countB; // Sort in ascending order of "Untouched" count
        });
        break;

      case "descending":
        setIncoFilter("descending");
        const untouchedCount = {};
        empData.forEach((company) => {
          if (company.Status === "Not Interested") {
            untouchedCount[company.AssignDate] =
              (untouchedCount[company.AssignDate] || 0) + 1;
          }
        });

        // Step 2: Sort employeeData based on the count of "Untouched" statuses
        empData.sort((a, b) => {
          const countA = untouchedCount[a.AssignDate] || 0;
          const countB = untouchedCount[b.AssignDate] || 0;
          return countB - countA; // Sort in descending order of "Untouched" count
        });
        break;

      case "none":
        setIncoFilter("none");

        break;

      default:
        break;
    }
  };

  const handleSortMatured = (sortBy1) => {
    setSortType((prevData) => ({
      ...prevData,
      matured:
        prevData.matured === "ascending"
          ? "descending"
          : prevData.matured === "descending"
            ? "none"
            : "ascending",
    }));
    switch (sortBy1) {
      case "ascending":
        setIncoFilter("ascending");
        const untouchedCountAscending = {};
        empData.forEach((company) => {
          if (company.Status === "Matured") {
            untouchedCountAscending[company.AssignDate] =
              (untouchedCountAscending[company.AssignDate] || 0) + 1;
          }
        });
        // Step 2: Sort employeeData based on the count of "Untouched" statuses in ascending order
        empData.sort((a, b) => {
          const countA = untouchedCountAscending[a.AssignDate] || 0;
          const countB = untouchedCountAscending[b.AssignDate] || 0;
          return countA - countB; // Sort in ascending order of "Untouched" count
        });
        break;

      case "descending":
        setIncoFilter("descending");
        const untouchedCount = {};
        empData.forEach((company) => {
          if (company.Status === "Matured") {
            untouchedCount[company.AssignDate] =
              (untouchedCount[company.AssignDate] || 0) + 1;
          }
        });

        // Step 2: Sort employeeData based on the count of "Untouched" statuses
        empData.sort((a, b) => {
          const countA = untouchedCount[a.AssignDate] || 0;
          const countB = untouchedCount[b.AssignDate] || 0;
          return countB - countA; // Sort in descending order of "Untouched" count
        });
        break;

      case "none":
        setIncoFilter("none");

        break;

      default:
        break;
    }
  };
  const handleSortTotalLeads = (sortBy1) => {
    setSortType((prevData) => ({
      ...prevData,
      totalLeads:
        prevData.totalLeads === "ascending"
          ? "descending"
          : prevData.totalLeads === "descending"
            ? "none"
            : "ascending",
    }));
    switch (sortBy1) {
      case "ascending":
        setIncoFilter("ascending");
        const untouchedCountAscending = {};
        empData.forEach((company) => {
          if (company) {
            untouchedCountAscending[company.AssignDate] =
              (untouchedCountAscending[company.AssignDate] || 0) + 1;
          }
        });
        // Step 2: Sort employeeData based on the count of "Untouched" statuses in ascending order
        empData.sort((a, b) => {
          const countA = untouchedCountAscending[a.AssignDate] || 0;
          const countB = untouchedCountAscending[b.AssignDate] || 0;
          return countA - countB; // Sort in ascending order of "Untouched" count
        });
        break;

      case "descending":
        setIncoFilter("descending");
        const untouchedCount = {};
        empData.forEach((company) => {
          if (company) {
            untouchedCount[company.AssignDate] =
              (untouchedCount[company.AssignDate] || 0) + 1;
          }
        });

        // Step 2: Sort employeeData based on the count of "Untouched" statuses
        empData.sort((a, b) => {
          const countA = untouchedCount[a.AssignDate] || 0;
          const countB = untouchedCount[b.AssignDate] || 0;
          return countB - countA; // Sort in descending order of "Untouched" count
        });
        break;

      case "none":
        setIncoFilter("none");

        break;

      default:
        break;
    }
  };

  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
    width: "20px",
  };

  // ---------------------------------------------delete Projection----------------------------------------------------\

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
      //console.log('Deleted!', 'Your data has been deleted.', 'success');
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
      fetchFollowUpData();
      setIsEditProjection(true);
    } catch (error) {
      console.error("Error deleting data:", error);
      // Show an error message if deletion fails
      console.log("Error!", "Follow Up Not Found.", "error");
    }
  };
  //console.log("projections", currentProjection);
  //const containerRef = useRef();

  // const handleButtonClick = (dateRangePickerRef) => {
  //   console.log("hello world")
  //   setShowBookingDate(true);
  //   // Scroll the window to the position of the date range picker
  //   console.log(dateRangePickerRef.current)
  //   if (showBookingDate && dateRangePickerRef.current) {
  //     const { top } = dateRangePickerRef.current.getBoundingClientRect();

  //     window.scrollTo({
  //       top: window.scrollY + top,
  //       //bottom:"0px",
  //       behavior: "smooth" // You can change this to "auto" if you prefer instant scrolling
  //     });
  //   }
  // };

  // -----------------------------------------------------------------newdaterangepicker-------------------------------------------------------------------
  function formatDateFinal(timestamp) {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
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
  const [redesignedData, setRedesignedData] = useState([]);
  const [permanentFormData, setPermanentFormData] = useState([]);

  const fetchRedesignedBookings = async () => {
    try {
      const response = await axios.get(
        `${secretKey}/bookings/redesigned-final-leadData`
      );
      const bookingsData = response.data;
      const cleanString = (str) => (str ? str.replace(/\u00A0/g, ' ').replace(/\s+/g, '').toLowerCase() : '');

      setRedesignedData(bookingsData.filter(obj => cleanString(obj.bdeName) === cleanString(data.ename) || (cleanString(obj.bdmName) === cleanString(data.ename) && obj.bdmType === "Close-by") || (obj.moreBookings.length !== 0 && obj.moreBookings.some((more) => cleanString(more.bdeName) === cleanString(data.ename) || cleanString(more.bdmName) === cleanString(data.ename)))));
      setPermanentFormData(bookingsData.filter(obj => cleanString(obj.bdeName) === cleanString(data.ename) || (cleanString(obj.bdmName) === cleanString(data.ename) && obj.bdmType === "Close-by") || (obj.moreBookings.length !== 0 && obj.moreBookings.some((more) => cleanString(more.bdeName) === cleanString(data.ename) || cleanString(more.bdmName) === cleanString(data.ename)))));
    } catch (error) {
      console.log("Error Fetching Bookings Data", error);
    }
  };

  //console.log("redesigneddata", redesignedData)

  // -------------------------------------------  Calculations --------------------------------------------------------

  let totalMaturedCount = 0;
  let totalTargetAmount = 0;
  let totalAchievedAmount = 0;

  const functionCalculateMatured = (istrue) => {

    let maturedCount = 0;
    const today = new Date();

    redesignedData.map((mainBooking) => {
      if (istrue) {
        if (new Date(mainBooking.bookingDate).toLocaleDateString() === today.toLocaleDateString()) {

          if (mainBooking.bdeName === mainBooking.bdmName) {
            maturedCount = maturedCount + 1
          } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
            maturedCount = maturedCount + 0.5;
          } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
            if (mainBooking.bdeName === data.ename) {
              maturedCount = maturedCount + 1;
            }
          }
        }
        mainBooking.moreBookings.map((moreObject) => {
          if (new Date(moreObject.bookingDate).toLocaleDateString() === today.toLocaleDateString()) {

            if (moreObject.bdeName === moreObject.bdmName) {
              maturedCount = maturedCount + 1;
            } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
              maturedCount = maturedCount + 0.5
            } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
              if (moreObject.bdeName === data.ename) {
                maturedCount = maturedCount + 1;
              }
            }

          }
        })

      } else {
        if (new Date(mainBooking.bookingDate).getMonth() === today.getMonth()) {

          if (mainBooking.bdeName === mainBooking.bdmName) {
            maturedCount = maturedCount + 1
          } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
            maturedCount = maturedCount + 0.5;
          } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
            if (mainBooking.bdeName === data.ename) {
              maturedCount = maturedCount + 1;
            }
          }
        }
        mainBooking.moreBookings.map((moreObject) => {
          if (new Date(moreObject.bookingDate).getMonth() === today.getMonth()) {

            if (moreObject.bdeName === moreObject.bdmName) {
              maturedCount = maturedCount + 1;
            } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
              maturedCount = maturedCount + 0.5;
            } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
              if (moreObject.bdeName === data.ename) {
                maturedCount = maturedCount + 1;
              }
            }
          }
        })
      }

    })

    // Set hours, minutes, and seconds to zero
    // const todayData = istrue
    //   ? redesignedData.filter(
    //     (obj) => new Date(obj.bookingDate).toLocaleDateString() === today.toLocaleDateString()
    //   )
    //   : redesignedData.filter(
    //     (obj) => new Date(obj.bookingDate).getMonth() === today.getMonth()
    //   );

    // todayData.forEach((obj) => {
    //   if (obj.moreBookings.length === 0) {
    //     if (obj.bdeName !== obj.bdmName && obj.bdmType === "Close-by") {
    //       maturedCount += 0.5;
    //     } else {
    //       maturedCount += 1;
    //     }
    //   } else {
    //     if (obj.bdeName !== obj.bdmName && obj.bdmType === "Close-by") {
    //       maturedCount += 0.5;
    //     } else {
    //       maturedCount += 1;
    //     }

    //     obj.moreBookings.forEach((booking) => {
    //       if (
    //         booking.bdeName !== booking.bdmName &&
    //         booking.bdmType === "Close-by"
    //       ) {
    //         maturedCount += 0.5;
    //       } else {
    //         maturedCount += 1;
    //       }
    //     });
    //   }
    // });
    totalMaturedCount = totalMaturedCount + maturedCount;
    return maturedCount;
  };
  const functionCalculateTotalRevenue = (istrue) => {
    let achievedAmount = 0;
    const today = new Date();
    // Set hours, minutes, and seconds to zero
    const todayData = istrue ? redesignedData.filter(obj => new Date(obj.bookingDate).toLocaleDateString() === today.toLocaleDateString()) : redesignedData.filter(
      (obj) => new Date(obj.bookingDate).getMonth() === today.getMonth()
    );

    todayData.forEach((obj) => {
      if (obj.moreBookings.length === 0) {
        if (obj.bdeName !== obj.bdmName && obj.bdmType === "Close-by") {
          achievedAmount += Math.round(obj.generatedTotalAmount / 2);
        } else {
          achievedAmount += Math.round(obj.generatedTotalAmount);
        }
      } else {
        if (obj.bdeName !== obj.bdmName && obj.bdmType === "Close-by") {
          achievedAmount += Math.round(obj.generatedTotalAmount / 2);
        } else {
          achievedAmount += Math.round(obj.generatedTotalAmount);
        }
        obj.moreBookings.forEach((booking) => {
          if (
            booking.bdeName !== booking.bdmName &&
            booking.bdmType === "Close-by"
          ) {
            achievedAmount += Math.round(obj.generatedTotalAmount / 2);
          } else {
            achievedAmount += Math.round(obj.generatedTotalAmount);
          }
        });
      }
    });
    return achievedAmount

  };
  const functionCalculateAchievedRevenue = (istrue) => {
    let achievedAmount = 0;
    let remainingAmount = 0;
    let expanse = 0;
    const today = new Date();

    redesignedData.map((mainBooking) => {
      if (istrue) {
        if (new Date(mainBooking.bookingDate).toLocaleDateString() === today.toLocaleDateString()) {

          if (mainBooking.bdeName === mainBooking.bdmName) {
            achievedAmount = achievedAmount + Math.round(mainBooking.generatedReceivedAmount);
            mainBooking.services.map(serv => {
              // console.log(serv.expanse , bdeName ,"this is services");
              expanse = serv.expanse ? expanse + serv.expanse : expanse;
            });
          } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
            achievedAmount = achievedAmount + Math.round(mainBooking.generatedReceivedAmount) / 2;
            mainBooking.services.map(serv => {
              expanse = serv.expanse ? expanse + serv.expanse / 2 : expanse;
            })
          } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
            if (mainBooking.bdeName === data.ename) {
              achievedAmount = achievedAmount + Math.round(mainBooking.generatedReceivedAmount);
              mainBooking.services.map(serv => {
                expanse = serv.expanse ? expanse + serv.expanse : expanse;
              })
            }
          }
        }
        mainBooking.moreBookings.map((moreObject) => {
          if (new Date(moreObject.bookingDate).toLocaleDateString() === today.toLocaleDateString()) {

            if (moreObject.bdeName === moreObject.bdmName) {
              achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount);
              moreObject.services.map(serv => {
                expanse = serv.expanse ? expanse + serv.expanse : expanse;
              })
            } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
              achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount) / 2;
              moreObject.services.map(serv => {
                expanse = serv.expanse ? expanse + serv.expanse / 2 : expanse;
              })
            } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
              if (moreObject.bdeName === data.ename) {
                achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount);
                moreObject.services.map(serv => {
                  expanse = serv.expanse ? expanse + serv.expanse : expanse;
                })
              }
            }

          }
        })

      } else {
        if (new Date(mainBooking.bookingDate).getMonth() === today.getMonth()) {

          if (mainBooking.bdeName === mainBooking.bdmName) {
            achievedAmount = achievedAmount + Math.round(mainBooking.generatedReceivedAmount);
            mainBooking.services.map(serv => {
              expanse = serv.expanse ? expanse + serv.expanse : expanse;
            })
          } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
            achievedAmount = achievedAmount + Math.round(mainBooking.generatedReceivedAmount) / 2;
            mainBooking.services.map(serv => {
              expanse = serv.expanse ? expanse + serv.expanse / 2 : expanse;
            })
          } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
            if (mainBooking.bdeName === data.ename) {
              achievedAmount = achievedAmount + Math.round(mainBooking.generatedReceivedAmount);
              mainBooking.services.map(serv => {
                expanse = serv.expanse ? expanse + serv.expanse : expanse;
              })
            }
          }
        } else if (mainBooking.remainingPayments.length !== 0) {
          mainBooking.remainingPayments.map((remainingObj) => {
            if (new Date(remainingObj.paymentDate).getMonth() === today.getMonth()) {
              const findService = mainBooking.services.find((services) => services.serviceName === remainingObj.serviceName)
              const tempAmount = findService.withGST ? Math.round(remainingObj.receivedPayment) / 1.18 : Math.round(remainingObj.receivedPayment);
              if (mainBooking.bdeName === mainBooking.bdmName) {
                remainingAmount += Math.round(tempAmount);
              } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
                remainingAmount += Math.round(tempAmount) / 2;
              } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
                if (mainBooking.bdeName === data.ename) {
                  remainingAmount += Math.round(tempAmount);
                }
              }
            }
          })
        }
        mainBooking.moreBookings.map((moreObject) => {
          if (new Date(moreObject.bookingDate).getMonth() === today.getMonth()) {

            if (moreObject.bdeName === moreObject.bdmName) {
              achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount);
              moreObject.services.map(serv => {
                expanse = serv.expanse ? expanse + serv.expanse : expanse;
              })
            } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
              achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount) / 2;
              moreObject.services.map(serv => {
                expanse = serv.expanse ? expanse + serv.expanse / 2 : expanse;
              })
            } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
              if (moreObject.bdeName === data.ename) {
                achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount);
                moreObject.services.map(serv => {
                  expanse = serv.expanse ? expanse + serv.expanse : expanse;
                })
              }
            }

          } else if (moreObject.remainingPayments.length !== 0) {

            moreObject.remainingPayments.map((remainingObj) => {
              if (new Date(remainingObj.paymentDate).getMonth() === today.getMonth()) {

                const findService = moreObject.services.find((services) => services.serviceName === remainingObj.serviceName)
                const tempAmount = findService.withGST ? Math.round(remainingObj.receivedPayment) / 1.18 : Math.round(remainingObj.receivedPayment);
                if (moreObject.bdeName === moreObject.bdmName) {
                  remainingAmount += Math.round(tempAmount);
                } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
                  remainingAmount += Math.round(tempAmount) / 2;
                } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
                  if (moreObject.bdeName === data.ename) {
                    remainingAmount += Math.round(tempAmount);
                  }
                }
              }
            })
          }
        })
      }




    })
    // const today = new Date();
    // // Set hours, minutes, and seconds to zero
    // const todayData = istrue ? redesignedData.filter(obj => new Date(obj.bookingDate).toLocaleDateString() === today.toLocaleDateString()) : redesignedData.filter(
    //   (obj) => new Date(obj.bookingDate).getMonth() === today.getMonth()
    // );

    // todayData.forEach((obj) => {
    //   if (obj.moreBookings.length === 0) {
    //     if (obj.bdeName !== obj.bdmName && obj.bdmType === "Close-by") {
    //       achievedAmount += Math.round(obj.generatedReceivedAmount / 2);
    //     } else {
    //       achievedAmount += Math.round(obj.generatedReceivedAmount);
    //     }
    //   } else {
    //     if (obj.bdeName !== obj.bdmName && obj.bdmType === "Close-by") {
    //       achievedAmount += Math.round(obj.generatedReceivedAmount / 2);
    //     } else {
    //       achievedAmount += Math.round(obj.generatedReceivedAmount);
    //     }
    //     obj.moreBookings.forEach((booking) => {
    //       if (
    //         booking.bdeName !== booking.bdmName &&
    //         booking.bdmType === "Close-by"
    //       ) {
    //         achievedAmount += Math.round(obj.generatedReceivedAmount / 2);
    //       } else {
    //         achievedAmount += Math.round(obj.generatedReceivedAmount);
    //       }
    //     });
    //   }
    // });
    return achievedAmount + Math.round(remainingAmount) - expanse;
  };

  const functionCalculateYesterdayRevenue = () => {
    let achievedAmount = 0;
    let remainingAmount = 0;
    const boom = new Date();
    const today = new Date(boom);
    today.setDate(boom.getDate() - 1);


    // Set hours, minutes, and seconds to zero
    redesignedData.map((mainBooking) => {
      if (new Date(mainBooking.bookingDate).toLocaleDateString() === today.toLocaleDateString()) {

        if (mainBooking.bdeName === mainBooking.bdmName) {
          achievedAmount = achievedAmount + Math.round(mainBooking.generatedReceivedAmount);
        } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
          achievedAmount = achievedAmount + Math.round(mainBooking.generatedReceivedAmount) / 2;
        } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
          if (mainBooking.bdeName === data.ename) {
            achievedAmount = achievedAmount + Math.round(mainBooking.generatedReceivedAmount);
          }
        }
      } else if (mainBooking.remainingPayments.length !== 0) {
        mainBooking.remainingPayments.map((remainingObj) => {
          if (new Date(remainingObj.paymentDate).toLocaleDateString() === today.toLocaleDateString()) {
            const findService = mainBooking.services.find((services) => services.serviceName === remainingObj.serviceName)
            const tempAmount = findService.withGST ? Math.round(remainingObj.receivedPayment) / 1.18 : Math.round(remainingObj.receivedPayment);
            if (mainBooking.bdeName === mainBooking.bdmName) {
              remainingAmount += Math.round(tempAmount);
            } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
              remainingAmount += Math.round(tempAmount) / 2;
            } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
              if (mainBooking.bdeName === data.ename) {
                remainingAmount += Math.round(tempAmount);
              }
            }
          }
        })
      }
      mainBooking.moreBookings.map((moreObject) => {
        if (new Date(moreObject.bookingDate).toLocaleDateString() === today.toLocaleDateString()) {

          if (moreObject.bdeName === moreObject.bdmName) {
            achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount);
          } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
            achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount) / 2;
          } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
            if (moreObject.bdeName === data.ename) {
              achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount);
            }
          }

        } else if (moreObject.remainingPayments.length !== 0) {

          moreObject.remainingPayments.map((remainingObj) => {
            if (new Date(remainingObj.paymentDate).toLocaleDateString() === today.toLocaleDateString()) {

              const findService = moreObject.services.find((services) => services.serviceName === remainingObj.serviceName)
              const tempAmount = findService.withGST ? Math.round(remainingObj.receivedPayment) / 1.18 : Math.round(remainingObj.receivedPayment);
              if (moreObject.bdeName === moreObject.bdmName) {
                remainingAmount += Math.round(tempAmount);
              } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
                remainingAmount += Math.round(tempAmount) / 2;
              } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
                if (moreObject.bdeName === data.ename) {
                  remainingAmount += Math.round(tempAmount);
                }
              }
            }
          })
        }
      })
    })

    // const todayData = redesignedData.filter(obj => new Date(obj.bookingDate).toLocaleDateString() === today.toLocaleDateString());

    // todayData.forEach((obj) => {
    //   if (obj.moreBookings.length === 0) {
    //     if (obj.bdeName !== obj.bdmName && obj.bdmType === "Close-by") {
    //       achievedAmount += Math.round(obj.receivedAmount / 2);
    //     } else {
    //       achievedAmount += Math.round(obj.receivedAmount);
    //     }
    //   } else {
    //     if (obj.bdeName !== obj.bdmName && obj.bdmType === "Close-by") {
    //       achievedAmount += Math.round(obj.receivedAmount / 2);
    //     } else {
    //       achievedAmount += Math.round(obj.receivedAmount);
    //     }
    //     obj.moreBookings.forEach((booking) => {
    //       if (
    //         booking.bdeName !== booking.bdmName &&
    //         booking.bdmType === "Close-by"
    //       ) {
    //         achievedAmount += Math.round(obj.receivedAmount / 2);
    //       } else {
    //         achievedAmount += Math.round(obj.receivedAmount);
    //       }
    //     });
    //   }
    // });
    return achievedAmount + Math.round(remainingAmount)
  };
  const functionCalculatePendingRevenue = () => {

    let remainingAmount = 0;
    const today = new Date();

    redesignedData.map((mainBooking) => {

      if (mainBooking.remainingPayments.length !== 0) {
        mainBooking.remainingPayments.map((remainingObj) => {
          if (new Date(remainingObj.paymentDate).toLocaleDateString() === today.toLocaleDateString()) {
            const findService = mainBooking.services.find((services) => services.serviceName === remainingObj.serviceName)
            const tempAmount = findService.withGST ? Math.round(remainingObj.receivedPayment) / 1.18 : Math.round(remainingObj.receivedPayment);
            if (mainBooking.bdeName === mainBooking.bdmName) {
              remainingAmount += Math.round(tempAmount);
            } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
              remainingAmount += Math.round(tempAmount) / 2;
            } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
              if (mainBooking.bdeName === data.ename) {
                remainingAmount += Math.round(tempAmount);
              }
            }
          }
        })
      }
      mainBooking.moreBookings.map((moreObject) => {
        if (moreObject.remainingPayments.length !== 0) {

          moreObject.remainingPayments.map((remainingObj) => {
            if (new Date(remainingObj.paymentDate).toLocaleDateString() === today.toLocaleDateString()) {

              const findService = moreObject.services.find((services) => services.serviceName === remainingObj.serviceName)
              const tempAmount = findService.withGST ? Math.round(remainingObj.receivedPayment) / 1.18 : Math.round(remainingObj.receivedPayment);
              if (moreObject.bdeName === moreObject.bdmName) {
                remainingAmount += Math.round(tempAmount);
              } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
                remainingAmount += Math.round(tempAmount) / 2;
              } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
                if (moreObject.bdeName === data.ename) {
                  remainingAmount += Math.round(tempAmount);
                }
              }
            }
          })
        }
      })






    })
    return remainingAmount

  };

  // console.log(followData
  //   .filter(obj => obj.bdeName === data.ename)
  //   .reduce((total, obj) => total + obj.totalPayment, 0))

  // console.log(followDataToday
  //   .filter(obj => obj.bdeName === data.ename)
  //   .reduce((total, obj) => total + obj.totalPayment, 0))

  // console.log("followData", followData.filter(obj => obj.bdeName === data.ename))

  // console.log("followDataToday", followDataToday.filter(obj => obj.bdeName === data.ename))



  const currentYear = new Date().getFullYear();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonth = monthNames[new Date().getMonth()];

  function functionCalculateGeneratedRevenue(isBdm) {

    let generatedRevenue = 0;
    const requiredObj = moreEmpData.filter((obj) => formatDateNow(obj.bdmStatusChangeDate) === new Date().toISOString().slice(0, 10) && (obj.bdmAcceptStatus === "Accept") && obj.Status === "Matured");
    requiredObj.forEach((object) => {
      const newObject = isBdm ? redesignedData.find(value => value["Company Name"] === object["Company Name"] && value.bdmName === data.ename) : redesignedData.find(value => value["Company Name"] === object["Company Name"] && value.bdeName === data.ename);
      if (newObject) {
        generatedRevenue = generatedRevenue + newObject.generatedReceivedAmount;
      }

    });

    return generatedRevenue;
    //  const generatedRevenue =  redesignedData.reduce((total, obj) => total + obj.receivedAmount, 0);
    //  console.log("This is generated Revenue",requiredObj);

  }


  function functionCalculateGeneratedTotalRevenue(isBdm) {
    let generatedRevenue = 0;
    // const requiredObj = moreEmpData.filter((obj) => (obj.bdmAcceptStatus === "Accept") && obj.Status === "Matured");
    // requiredObj.forEach((object) => {
    //   const newObject = isBdm ? redesignedData.find(value => value["Company Name"] === object["Company Name"] && value.bdmName === data.ename) : redesignedData.find(value => value["Company Name"] === object["Company Name"] && value.bdeName === data.ename);
    //   if (newObject) {
    //     generatedRevenue = generatedRevenue + newObject.generatedReceivedAmount;
    //   }

    // });



    return generatedRevenue;
    //  const generatedRevenue =  redesignedData.reduce((total, obj) => total + obj.receivedAmount, 0);
    //  console.log("This is generated Revenue",requiredObj);

  }

  function functionGetLastBookingDate() {
    // Filter objects based on bdeName
    let tempBookingDate = null;
    // Filter objects based on bdeName
    redesignedData.map((mainBooking) => {

      if (monthNames[new Date(mainBooking.bookingDate).getMonth()] === currentMonth) {

        const bookingDate = new Date(mainBooking.bookingDate);
        tempBookingDate = bookingDate > tempBookingDate ? bookingDate : tempBookingDate;

      }
      mainBooking.moreBookings.map((moreObject) => {
        if (monthNames[new Date(moreObject.bookingDate).getMonth()] === currentMonth) {

          const bookingDate = new Date(moreObject.bookingDate);
          tempBookingDate = bookingDate > tempBookingDate ? bookingDate : tempBookingDate;

        }
      })


    })
    return tempBookingDate ? formatDateFinal(tempBookingDate) : "No Booking";



    // Initialize variable to store the latest booking date
    // let lastBookingDate = null;
    // const finalData = redesignedData.filter((obj) => (monthNames[new Date(obj.bookingDate).getMonth()] === currentMonth))

    // // Iterate through filtered data
    // finalData.forEach((obj) => {
    //   if (obj.moreBookings && obj.moreBookings.length > 0) {
    //     // If moreBookings exist, find the latest bookingDate
    //     const latestBookingDate = obj.moreBookings.reduce(
    //       (latestDate, booking) => {
    //         const bookingDate = new Date(booking.bookingDate);
    //         return bookingDate > latestDate ? bookingDate : latestDate;
    //       },
    //       new Date(0)
    //     ); // Initialize with minimum date

    //     // Update lastBookingDate if latestBookingDate is later
    //     if (latestBookingDate > lastBookingDate || !lastBookingDate) {
    //       lastBookingDate = latestBookingDate;
    //     }
    //   } else {
    //     // If no moreBookings, directly consider bookingDate
    //     const bookingDate = new Date(obj.bookingDate);
    //     if (bookingDate > lastBookingDate || !lastBookingDate) {
    //       lastBookingDate = bookingDate;
    //     }
    //   }
    // });

    // // Return the formatted date string or an empty string if lastBookingDate is null
    // return lastBookingDate ? formatDateFinal(lastBookingDate) : "N/A";
  }

  const functionGetAmount = () => {
    if (data.length === 0) {
      return 0; // Return 0 if data is falsy
    }

    const object = data;
    const targetDetails = object.targetDetails;

    if (targetDetails.length === 0) {
      return 0; // Return 0 if targetDetails array is empty
    }

    const foundObject = targetDetails.find(
      (item) => Math.round(item.year) === currentYear && item.month === currentMonth
    );

    if (!foundObject) {
      return 0; // Return 0 if no matching object is found
    }

    const amount = Math.round(foundObject.amount);
    totalTargetAmount += amount; // Increment totalTargetAmount by amount


    return amount;
  };

  //console.log("filtered" , filteredBooking)
  const functionCalculateMaturedLeads = () => {
    let count = 0;
    const maturedObj = empData.filter(partObj => partObj.Status === "Matured");
    const calculatedObj = maturedObj.map(obj => {
      if (obj.ename === obj.maturedBdmName) {
        count++;
      } else {
        count += 0.5;
      }
    });

    // Join the calculatedObj array with commas to get a string with numeric values
    return count;
  };


  // ---------------------------------------------------------------------------filter for bdm function--------------------------------------

  const [selectedMonthOption, setSelectedMonthOption] = useState("")
  const [selectedMonthOptionForBdm, setSelectedMonthOptionForBdm] = useState("")

  const monthOptions = [
    { value: 'current_month', label: 'Current Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'total', label: 'Total' }
  ];

  const filterTeamLeadsDataByMonth = (teamData, followData, selectedMonthOption) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let filteredTeamData = [];
    let filteredFollowData = [];

    switch (selectedMonthOption) {
      case 'current_month':
        filteredTeamData = teamData.filter(obj => {
          const objDate = new Date(obj.bdeForwardDate);
          return objDate.getMonth() === currentMonth && objDate.getFullYear() === currentYear;
        });
        filteredFollowData = followDataFilter.filter(obj => {
          const objDate = new Date(obj.estPaymentDate);
          return objDate.getMonth() === currentMonth && objDate.getFullYear() === currentYear;
        });
        setRedesignedData(permanentFormData.filter(obj => new Date(obj.bookingDate).getMonth() === currentMonth && new Date(obj.bookingDate).getFullYear() === currentYear))
        break;
      case 'last_month':
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = lastMonth === 11 ? currentYear - 1 : currentYear;
        filteredTeamData = teamData.filter(obj => {
          const objDate = new Date(obj.bdeForwardDate);
          return objDate.getMonth() === lastMonth && objDate.getFullYear() === lastMonthYear;
        });
        filteredFollowData = followDataFilter.filter(obj => {
          const objDate = new Date(obj.estPaymentDate);
          return objDate.getMonth() === lastMonth && objDate.getFullYear() === lastMonthYear;
        })
        setRedesignedData(permanentFormData.filter(obj => new Date(obj.bookingDate).getMonth() === lastMonth && new Date(obj.bookingDate).getFullYear() === lastMonthYear))
        break;
      case 'total':
        filteredTeamData = teamData;
        filteredFollowData = followData;
        setRedesignedData(permanentFormData)
        break;
      default:
        filteredTeamData = teamData;
        filteredFollowData = followData;
        break;
    }

    return { filteredTeamData, filteredFollowData };
  };

  const handleChangeForBdm = (selectedOption) => {
    console.log(selectedOption);
    setSelectedMonthOptionForBdm(selectedOption.value);

    if (selectedOption === "current_month" || selectedOption === "last_month") {
      const { filteredTeamData, filteredFollowData } = filterTeamLeadsDataByMonth(teamLeadsData, followDataFilter, selectedOption);
      setTeamData(filteredTeamData);
      setFollowData(filteredFollowData);
    } else {
      // Handle 'total' case
      // If 'total', no need to filter, so you can directly set the team data
      setTeamData(teamLeadsData);
      setFollowData(followDataFilter);
    }
  }


  const filterMoreEmpDataDataByMonth = (tempData, followDataFilter, selectedMonthOption) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let filteredMoreEmpData = [];
    let filteredFollowData = [];

    switch (selectedMonthOption) {
      case 'current_month':
        filteredMoreEmpData = tempData.filter(obj => {
          const objDate = new Date(obj.bdeForwardDate);
          return objDate.getMonth() === currentMonth && objDate.getFullYear() === currentYear;
        });
        filteredFollowData = followDataFilter.filter(obj => {
          const objDate = new Date(obj.estPaymentDate);
          return objDate.getMonth() === currentMonth && objDate.getFullYear() === currentYear;
        });
        break;
      case 'last_month':
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = lastMonth === 11 ? currentYear - 1 : currentYear;
        filteredMoreEmpData = tempData.filter(obj => {
          const objDate = new Date(obj.bdeForwardDate);
          return objDate.getMonth() === lastMonth && objDate.getFullYear() === lastMonthYear;
        });
        filteredFollowData = followDataFilter.filter(obj => {
          const objDate = new Date(obj.estPaymentDate);
          return objDate.getMonth() === lastMonth && objDate.getFullYear() === lastMonthYear
        })
        break;
      case 'total':
        filteredMoreEmpData = tempData;
        filteredFollowData = followDataFilter;
        break;
      default:
        filteredMoreEmpData = tempData;
        filteredFollowData = followDataFilter;
        break;
    }

    return { filteredMoreEmpData, filteredFollowData };
  };

  const handleChange = (selectedOption) => {
    console.log(selectedOption);
    setSelectedMonthOptionForBdm(selectedOption.value);

    if (selectedOption === "current_month" || selectedOption === "last_month") {
      const { filteredMoreEmpData, filteredFollowData } = filterMoreEmpDataDataByMonth(tempData, followDataFilter, selectedOption);
      setmoreEmpData(filteredMoreEmpData);
      setFollowData(filteredFollowData);
    } else {
      // Handle 'total' case
      // If 'total', no need to filter, so you can directly set the team data
      setmoreEmpData(tempData);
      setFollowData(followDataFilter);
    }
  }

  const handleFilterFollowDataToday = (isBdm) => {
    const filterFollowDataForwarded = isBdm ? followDataToday.filter((company) => company.bdmName !== data.ename && company.caseType === "Forwarded") : followDataToday.filter((company) => company.caseType === "Forwarded")
    const filterFollowDataRecieved = isBdm ? followDataToday.filter((company) => company.bdmName !== data.ename && company.caseType === "Recieved") : followDataToday.filter((company) => company.caseType === "Recieved")
    const totalPaymentForwarded = filterFollowDataForwarded.reduce((total, obj) => total + obj.totalPayment, 0)
    const totalPaymentRecieved = filterFollowDataRecieved.reduce((total, obj) => total + obj.totalPayment / 2, 0)
    const finalPayment = totalPaymentForwarded + totalPaymentRecieved

    // console.log(filterFollowDataForwarded , filterFollowDataRecieved)
    // console.log(totalPaymentForwarded , totalPaymentRecieved)
    // console.log(finalPayment)

    return finalPayment.toLocaleString();
  }
  const handleFilterFollowData = (isBdm) => {
    const filterFollowDataForwarded = isBdm ? followData.filter((company) => company.bdmName !== data.ename && company.caseType === "Forwarded") : followData.filter((company) => company.caseType === "Forwarded")
    const filterFollowDataRecieved = isBdm ? followData.filter((company) => company.bdmName !== data.ename && company.caseType === "Recieved") : followData.filter((company) => company.caseType === "Recieved")
    const totalPaymentForwarded = filterFollowDataForwarded.reduce((total, obj) => total + obj.totalPayment, 0)
    const totalPaymentRecieved = filterFollowDataRecieved.reduce((total, obj) => total + obj.totalPayment / 2, 0)
    const finalPayment = totalPaymentForwarded + totalPaymentRecieved
    // console.log(totalPaymentForwarded, totalPaymentRecieved)
    // console.log(finalPayment)
    // console.log(filterFollowDataForwarded, filterFollowDataRecieved)

    return finalPayment.toLocaleString();
  }

  const handleFilterFollowDataTodayRecievedCase = () => {

    const filterFollowDataRecieved = followDataToday.filter((company) => company.bdmName === data.ename && company.caseType === "Recieved")
    const totalPaymentRecieved = filterFollowDataRecieved.reduce((total, obj) => total + obj.totalPayment / 2, 0)
    const finalPayment = totalPaymentRecieved
    //console.log(finalPayment)
    //console.log( filterFollowDataRecieved)

    return finalPayment.toLocaleString();
  }

  const handleFilterFollowDataRecievedCase = () => {

    const filterFollowDataRecieved = followData.filter((company) => company.bdmName === data.ename && company.caseType === "Recieved")
    const totalPaymentRecieved = filterFollowDataRecieved.reduce((total, obj) => total + obj.totalPayment / 2, 0)
    const finalPayment = totalPaymentRecieved
    //console.log(finalPayment)
    //console.log( filterFollowDataRecieved)

    return finalPayment.toLocaleString();
  }

  //console.log(followData)

  //console.log(selectedMonthOptionForBdm)

  // Shows today's projection pop-up :
  const [shouldShowCollection, setShouldShowCollection] = useState(false);
  const [currentDate, setCurrentDate] = useState(getCurrentDate());
  // useEffect(() => {
  //   const checkAndShowCollection = () => {
  //     const designation = localStorage.getItem('designation');
  //     const loginTime = new Date(localStorage.getItem('loginTime'));
  //     const loginDate = localStorage.getItem('loginDate');

  //     const currentDateTime = new Date(); // Current date and time in local time

  //     // Extract current hour and minute
  //     const currentHour = currentDateTime.getHours();
  //     // console.log("Current hour is :", currentHour);

  //     // Get current date in YYYY-MM-DD format
  //     const newCurrentDate = getCurrentDate();

  //     // Check if there is an old collectionShown flag and remove it if the date has passed
  //     for (let i = 0; i < localStorage.length; i++) {
  //       const key = localStorage.key(i);
  //       if (key.startsWith(`${userId}_`) && key.endsWith('_collectionShown')) {
  //         const storedDate = key.split('_')[1];
  //         if (storedDate !== newCurrentDate) {
  //           localStorage.removeItem(key);
  //         }
  //       }
  //     }

  //     // Check conditions to show the collection pop-up
  //     if (
  //       designation === 'Sales Executive' &&
  //       loginDate === newCurrentDate && // Check if it's the same login date
  //       currentHour >= 10 &&
  //       !localStorage.getItem(`${userId}_${newCurrentDate}_collectionShown`)
  //     ) {
  //       setShouldShowCollection(true);
  //       localStorage.setItem(`${userId}_${newCurrentDate}_collectionShown`, 'true'); // Set the flag to prevent showing again for this userId on this date
  //     }
  //   };

  //   const updateDateAndCheckCollection = () => {
  //     const newCurrentDate = getCurrentDate();
  //     if (newCurrentDate !== currentDate) {
  //       setCurrentDate(newCurrentDate);
  //     }
  //     checkAndShowCollection();
  //   };

  //   checkAndShowCollection(); // Call the function initially

  //   // Set an interval to check every minute
  //   const intervalId = setInterval(updateDateAndCheckCollection, 60000); // 60000 ms = 1 minute

  //   // Cleanup interval on component unmount
  //   return () => clearInterval(intervalId);
  // }, [userId, currentDate]); // Trigger when userId or currentDate changes

  // Function to get current date in YYYY-MM-DD format
  function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  //Auto logout functionality :
  useEffect(() => {
    // Function to check token expiry and initiate logout if expired
    const checkTokenExpiry = () => {
      const token = localStorage.getItem("newtoken");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000; // Get current time in seconds
          if (decoded.exp < currentTime) {
            handleLogout();
          } else {
            // Token not expired, continue session
            const timeToExpire = decoded.exp - currentTime;
            console.log(`Token expires in ${timeToExpire} seconds`);
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
    // localStorage.removeItem("designation");
    // localStorage.removeItem("loginTime");
    // localStorage.removeItem("loginDate");
    window.location.replace("/"); // Redirect to login page
  };


  return (
    <div className="admin-dashboard">
      {shouldShowCollection && <TodaysCollection empId={userId} secretKey={secretKey} />}
      {/* <Header id={data._id} name={data.ename} empProfile={data.profilePhoto && data.profilePhoto.length !== 0 && data.profilePhoto[0].filename} gender={data.gender} designation={data.newDesignation} data={data} />
      <EmpNav userId={userId} bdmWork={data.bdmWork} /> */}
      <div className="page-wrapper employess-new-dashboard">
        <div className="Dash-Main mt-3">
          <div className="container-xl">
            <div className="row">
              <div className="col-sm-12 col-md-12 col-lg-12">
                {/* sales report */}
                <div className="row">
                  <div className="col-sm-12 col-md-12 col-lg-12">
                    <EmployeeSalesReport data={data} followData={followData} redesignedData={redesignedData} moreEmpData={moreEmpData} />
                  </div>
                </div>
                {/* Lead reports */}
                <div className="row mt-2 mb-4">
                  {<>
                    <div className="col-sm-4 col-md-4 col-lg-4 mt-3">
                      <EmployeePerformance redesignedData={redesignedData} data={data} />
                    </div>
                    <div className="col-sm-4 col-md-4 col-lg-4 mt-3 Performance_Report_w d-none">
                      <EmployeePerformanceReport redesignedData={redesignedData} data={data} />
                      {/* <div className="dash-card">
                      <div className="dash-card-head d-flex align-items-center justify-content-between">
                        <h2 className="m-0">Performance Report</h2>
                      </div>
                      <div className="dash-card-body">
                        <div className="table table-responsive dash  m-0" style={{maxHeight:'231px'}}>
                          <table className="table table-vcenter top_5_table table-nowrap dash-strip">
                            <thead>
                              <tr className="tr-sticky">
                                <th>Month</th>
                                <th>Target</th>
                                <th>Achievement</th>
                                <th>Ratio</th>
                                <th>Result</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td><b>Jun-24</b></td>
                                <td>₹ 60,000</td>
                                <td>₹ 35,030 </td>
                                <td>40%</td>
                                <td>Poor</td>
                              </tr>
                              <tr>
                                <td><b>May-24</b></td>
                                <td>₹ 60,000</td>
                                <td>₹ 35,030 </td>
                                <td>60%</td>
                                <td>Below Average</td>
                              </tr>
                              <tr>
                                <td><b>Apr-24</b></td>
                                <td>₹ 60,000</td>
                                <td>₹ 35,030 </td>
                                <td>74%</td>
                                <td>Average</td>
                              </tr>
                              <tr>
                                <td><b>Mar-24</b></td>
                                <td>₹ 60,000</td>
                                <td>₹ 35,030 </td>
                                <td>99%</td>
                                <td>Good</td>
                              </tr>
                              <tr>
                                <td><b>Feb-24</b></td>
                                <td>₹ 60,000</td>
                                <td>₹ 35,030 </td>
                                <td>149%</td>
                                <td>Excellent</td>
                              </tr>
                              <tr>
                                <td><b>Jan-24</b></td>
                                <td>₹ 60,000</td>
                                <td>₹ 35,030 </td>
                                <td>199%</td>
                                <td>Extraordinary</td>
                              </tr>
                              <tr>
                                <td><b>Dec-23</b></td>
                                <td>₹ 60,000</td>
                                <td>₹ 35,030 </td>
                                <td>251%</td>
                                <td>Exceptional</td>
                              </tr>
                              <tr>
                                <td><b>Nov-23</b></td>
                                <td>₹ 60,000</td>
                                <td>₹ 35,030 </td>
                                <td>249%</td>
                                <td>Outstanding</td>
                              </tr>
                            </tbody>
                            <tfoot>
                              <tr style={{position:"sticky",bottom:'0px',padding:'6px 6px'}}>
                                <td><b>12 Mon</b></td>
                                <td>₹ 60,000</td>
                                <td>₹ 35,030 </td>
                                <td>249%</td>
                                <td>Outstanding</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div> */}
                    </div>
                  </>}
                  {/* calling data report */}
                  <div className="col-sm-4 col-md-4 col-lg-4 mt-3">
                    <EmployeeTopSellingServices redesignedData={redesignedData} ename={data.ename} />
                  </div>
                  {/* <div className="col-sm-4 col-md-4 col-lg-4 mt-3">
                    <EmployeeCallingReport />
                  </div>
                  <div className="col-sm-4 col-md-4 col-lg-4 mt-3">
                    <EmployeeForwardedReport moreEmpData={moreEmpData} />
                  </div> */}
                  {data.length !== 0 && (<div className="col-sm-4 col-md-4 col-lg-4  mt-3">
                    <EmployeeCallLogs employeeData={data} />
                  </div>)}
                  <div className="col-sm-4 col-md-4 col-lg-4  mt-3">
                    <CurrentMonthLeadsReport employeeData={data} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Drawer for Follow Up Projection  */}
      <div>
        <Drawer
          style={{ top: "50px" }}
          anchor="right"
          open={openProjection}
          onClose={closeProjection}
        >
          <div style={{ width: "31em" }} className="container-xl">
            <div
              className="d-flex justify-content-between align-items-center"
              style={{ margin: "10px 0px" }}
            >
              <h1
                style={{ marginBottom: "0px", fontSize: "20px" }}
                className="title"
              >
                Projection Form
              </h1>
              <div>
                <IconButton
                  onClick={() => {
                    setIsEditProjection(true);
                  }}
                >
                  {bdeNameProjection === enameProjection && (<EditIcon
                    color="grey"
                    style={{ width: "17px", height: "17px" }}
                  ></EditIcon>)}
                </IconButton>
                <IconButton>
                  <IoClose
                    onClick={closeProjection}
                    style={{ width: "17px", height: "17px" }}
                  />
                </IconButton>
              </div>
            </div>
            <hr style={{ margin: "0px" }} />
            <div className="body-projection">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h1
                    title={projectingCompany}
                    style={{
                      fontSize: "14px",
                      textShadow: "none",
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
                <strong>Offered Services :</strong>
                <div className="services mb-3">
                  <Select
                    // styles={{
                    //   customStyles,
                    //   container: (provided) => ({
                    //     border: "1px solid #ffb900",
                    //     borderRadius: "5px",
                    //   }),
                    // }}
                    isMulti
                    options={options}
                    placeholder="Select Services..."
                    isDisabled={!isEditProjection}
                    onChange={(selectedOptions) => {
                      setSelectedValues(
                        selectedOptions.map((option) => option.value)
                      );
                    }}
                    value={selectedValues.map((value) => ({
                      value,
                      label: value,
                    }))}
                  />
                </div>
              </div>
              <div className="label">
                <strong>
                  Offered Prices (With GST)
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
                  Expected Price (With GST){" "}
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
                <strong>Last Follow Up Date: </strong>
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
                <strong>Payment Expected on :</strong>
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
                <strong>Remarks :</strong>
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
                  style={{ width: "100%" }}
                  type="submit"
                  class="btn btn-primary mb-3"
                  onClick={handleProjectionSubmit}
                  disabled={!isEditProjection}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </Drawer>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
