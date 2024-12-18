import React, { useState, useEffect, useSyncExternalStore } from "react";
import RmofCertificationHeader from "../RM-CERT-COMPONENTS/RmofCertificationHeader";
import RmCertificationNavbar from "../RM-CERT-COMPONENTS/RmCertificationNavbar";
import AdminBookingForm from "../../admin/AdminBookingForm";
import axios from "axios";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import PdfImageViewerAdmin from "../../admin/PdfViewerAdmin";
import pdfimg from "../../static/my-images/pdf.png";
import { FcList } from "react-icons/fc";
import wordimg from "../../static/my-images/word.png";
import RemainingAmnt from "../../static/my-images/money.png";
import Nodata from "../../components/Nodata.jsx";
import { MdModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import EditableMoreBooking from "../../admin/EditableMoreBooking";
import AddLeadForm from "../../admin/AddLeadForm.jsx";
import { FaPlus } from "react-icons/fa6";
import { IoAdd } from "react-icons/io5";
import CloseIcon from "@mui/icons-material/Close";
import { IconX } from "@tabler/icons-react";
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
  useIsFocusVisible,
} from "@mui/material";
import { FaList } from "react-icons/fa6";
import { FaTableCellsLarge } from "react-icons/fa6";
import { MdOutlineSwapHoriz } from "react-icons/md";
import { MdOutlineAddCircle } from "react-icons/md";
import OutlinedInput from '@mui/material/OutlinedInput'
//import MenuItem from '@mui/material/MenuItem';
//import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
//import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import RMofCertificationListViewBookings from "./RMofCertificationListViewBookings.jsx";
import '../../assets/table.css';
import '../../assets/styles.css';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { IoFilterOutline } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
import { Drawer, colors } from "@mui/material";
import { options } from '../../components/Options.js'

function RmofCertificationBookings() {
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [sendingIndex, setSendingIndex] = useState(0);
  const [open, openchange] = useState(false);
  const [EditBookingOpen, setEditBookingOpen] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [infiniteBooking, setInfiniteBooking] = useState([]);
  const [bookingIndex, setbookingIndex] = useState(-1);
  const [currentCompanyName, setCurrentCompanyName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [nowToFetch, setNowToFetch] = useState(false);
  const [leadFormData, setLeadFormData] = useState([]);
  const [currentLeadform, setCurrentLeadform] = useState(null);
  const [currentDataLoading, setCurrentDataLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [openPaymentReceipt, setOpenPaymentReceipt] = useState(false);
  const [openOtherDocs, setOpenOtherDocs] = useState(false);
  const [mainDataSwap, setMainDataSwap] = useState([])
  const [data, setData] = useState([]);
  const [companyName, setCompanyName] = "";
  const [openTableView, setOpenTableView] = useState(true)
  const [openListView, setOpenListView] = useState(false)
  const itemsPerPage = 10;
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false)
  const [isFilter, setIsFilter] = useState(false)
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false)
  const [newEmpData, setNewEmpData] = useState([])


  const secretKey = process.env.REACT_APP_SECRET_KEY;
  const isAdmin = true;

  useEffect(() => {
    document.title = `AdminHead-Sahay-CRM`;
  }, []);

  const defaultLeadData = {
    "Company Name": "",
    "Company Number": 0,
    "Company Email": "",
    panNumber: "",
    bdeName: "",
    bdeEmail: "",
    bdmName: "",
    bdmType: "Close-by",
    bookingDate: "",
    paymentMethod: "",
    caCase: false,
    caNumber: 0,
    caEmail: "",
    serviceName: "",
    totalPaymentWOGST: 0,
    totalPaymentWGST: 0,
    withGST: "",
    firstPayment: 0,
    secondPayment: 0,
    thirdPayment: 0,
    fourthPayment: 0,
    secondPaymentRemarks: "",
    thirdPaymentRemarks: "",
    fourthPaymentRemarks: "",
  };

  const fetchDatadebounce = async () => {
    try {
      const response = await axios.get(`${secretKey}/company-data/leads`);
      // Set the retrieved data in the state
      setData(response.data);

    } catch (error) {
      console.error("Error fetching data:", error.message);

    } finally {
      setCurrentDataLoading(false);
    }
  };
  useEffect(() => {
    if (currentCompanyName === "") {
      setCurrentLeadform(leadFormData[0]);
    } else {
      setCurrentLeadform(leadFormData.find(obj => obj["Company Name"] === currentCompanyName));
    }
  }, [leadFormData]);

  const rmCertificationUserId = localStorage.getItem("rmCertificationUserId")


  const [employeeData, setEmployeeData] = useState([])
  const [bdmList, setBdmList] = useState([])

  const fetchData = async () => {
    try {
      const response = await axios.get(`${secretKey}/employee/einfo`);
      // Set the retrieved data in the state
      const tempData = response.data;
      console.log(tempData)
      const userData = tempData.find((item) => item._id === rmCertificationUserId);
      console.log(userData)
      setEmployeeData(userData);
      setNewEmpData(tempData.filter(obj => obj.designation === "Sales Executive" && !obj.bdmWork))
      setBdmList(tempData.filter(obj => obj.designation === 'Sales Manager' || obj.bdmWork))
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);




  const fetchRedesignedFormData = async (page) => {
    try {
      const response = await axios.get(
        `${secretKey}/rm-services/redesigned-final-leadData-test?page=${page}&limit=${itemsPerPage}`
      );
      // const sortedData = response.data.sort((a, b) => {
      //   const dateA = new Date(a.lastActionDate);
      //   const dateB = new Date(b.lastActionDate);
      //   return dateB - dateA; // Sort in descending order
      // });
      setInfiniteBooking(response.data.data);
      setLeadFormData(response.data.data);
      setMainDataSwap(response.data.data)
      setTotalCount(response.data.totalCount);
      setTotalPages(response.data.totalPages);// Set both states with the sorted data
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  console.log("totalCount", totalCount)
  console.log("totalPages", totalPages)

  useEffect(() => {
    if (!isSearching || !isFilter) {
      fetchRedesignedFormData(1);
    }

  }, [nowToFetch]);

  useEffect(() => {
    if (!isSearching) {
      if (isFilter) {
        handleFilterData(currentPage, itemsPerPage);
      } else {
        fetchDatadebounce();
        fetchRedesignedFormData(currentPage);
      }
    } else {
      handleFilterData(currentPage, itemsPerPage);
    }
  }, [currentPage, isSearching, isFilter]);

  const handleFetchBookingsDataForPagination = (event, value) => {
    console.log(value)
    setCurrentPage(value);
  };

 

  const handleFilterSearch = async (searchText) => {
    setCurrentDataLoading(true);
    setIsSearching(true);
    try {
      const response = await axios.get(`${secretKey}/rm-services/search-booking-data`, {
        params: {
          searchText,
          currentPage,
          itemsPerPage
        }
      });
      if (!searchText.trim()) {
        setIsSearching(false);
        fetchRedesignedFormData(currentPage);
      } else {
        console.log("response:-", response.data);
        if (response.data.length !== 0) {
          setLeadFormData(response.data.data)
        }
        setCurrentPage(1);
      }
    } catch (error) {
      console.log("Error fetching data", error);
    } finally {
      setCurrentDataLoading(false);
    }
  };


  // console.log("currentPage", currentPage)
  // console.log("leadFormData", leadFormData)

  const functionOpenBookingForm = () => {
    setBookingFormOpen(true);
    //setCompanyName(data.companyName)
  };
  const frontendKey = process.env.REACT_APP_FRONTEND_KEY;
  const functionopenpopup = () => {
    openchange(true);
  };

  const closepopup = () => {
    openchange(false);


  };
  const calculateTotalAmount = (obj) => {
    let total = parseInt(obj.totalAmount);
    if (obj.moreBookings && obj.moreBookings.length > 0) {
      total += obj.moreBookings.reduce(
        (acc, booking) => acc + parseInt(booking.totalAmount),
        0
      );
    }
    return total.toFixed(2);
  };

  const calculateReceivedAmount = (obj) => {
    let received = parseInt(obj.receivedAmount);
    if (obj.moreBookings && obj.moreBookings.length > 0) {
      received += obj.moreBookings.reduce(
        (acc, booking) => acc + parseInt(booking.receivedAmount),
        0
      );
    }
    return received.toFixed(2);
  };

  const calculatePendingAmount = (obj) => {
    let pending = parseInt(obj.pendingAmount);
    if (obj.moreBookings && obj.moreBookings.length > 0) {
      pending += obj.moreBookings.reduce(
        (acc, booking) => acc + parseInt(booking.pendingAmount),
        0
      );
    }
    return pending.toFixed(2);
  };
  function formatDatePro(inputDate) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = new Date(inputDate).toLocaleDateString(
      "en-US",
      options
    );
    return formattedDate;
  }
  const getOrdinal = (number) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const lastDigit = number % 10;
    const suffix = suffixes[lastDigit <= 3 ? lastDigit : 0];
    return `${number}${suffix}`;
  };
  const handleViewPdfReciepts = (paymentreciept, companyName) => {
    const pathname = paymentreciept;
    //console.log(pathname);
    window.open(`${secretKey}/bookings/recieptpdf/${companyName}/${pathname}`, "_blank");
  };

  const handleViewPdOtherDocs = (pdfurl, companyName) => {
    const pathname = pdfurl;
    console.log(pathname);
    window.open(`${secretKey}/bookings/otherpdf/${companyName}/${pathname}`, "_blank");
  };

  // ------------------------------------------------- Delete booking ----------------------------------------------

  const handleDeleteBooking = async (company, id) => {
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete the booking?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    });

    if (confirmation.isConfirmed) {
      if (id) {
        fetch(
          `${secretKey}/bookings/redesigned-delete-particular-booking/${company}/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
          .then((response) => {
            if (response.ok) {
              Swal.fire("Success!", "Booking Deleted", "success");
            } else {
              Swal.fire("Error!", "Failed to Delete Booking", "error");
            }
          })
          .catch((error) => {
            console.error("Error during delete request:", error);
          });
      } else {
        fetch(`${secretKey}/bookings/redesigned-delete-booking/${company}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            if (response.ok) {
              Swal.fire("Success!", "Booking Deleted", "success");
              fetchRedesignedFormData(1);
            } else {
              Swal.fire("Error!", "Failed to Delete Company", "error");
            }
          })
          .catch((error) => {
            console.error("Error during delete request:", error);
          });
      }
    } else if (confirmation.dismiss === Swal.DismissReason.cancel) {
      console.log("Cancellation or closed without confirming");
    }
  };

  // ----------------------------------------- Upload documents Section -----------------------------------------------------

  const handleOtherDocsUpload = (updatedFiles) => {
    setSelectedDocuments((prevSelectedDocuments) => {
      return [...prevSelectedDocuments, ...updatedFiles];
    });
  };

  const handleRemoveFile = (index) => {
    setSelectedDocuments((prevSelectedDocuments) => {
      // Create a copy of the array of selected documents
      const updatedDocuments = [...prevSelectedDocuments];
      // Remove the document at the specified index
      updatedDocuments.splice(index, 1);
      // Return the updated array of selected documents
      return updatedDocuments;
    });
  };

  const closeOtherDocsPopup = () => {
    setOpenOtherDocs(false);
  };

  const handleFileInputChange = (event) => {
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

        const formattedJsonData = jsonData
          .slice(1) // Exclude the first row (header)
          .map((row) => ({
            "Sr. No": row[0],
            "Company Name": row[1],
            "Company Email": row[2],
            "Company Number": row[3],
            "incoDate": formatDateFromExcel(row[4]),
            "panNumber": row[5],
            "gstNumber": row[6],
            "bdeName": row[7],
            "bdeEmail": row[8],
            "bdmName": row[9],
            "bdmEmail": row[10], // Assuming the date is in column 'E' (0-based)
            "bdmType": row[11],
            "bookingDate": formatDateFromExcel(row[12]),
            "leadSource": row[13],
            "otherLeadSource": row[14],
            "1serviceName": row[15],
            "1TotalAmount": row[16],
            "1GST": row[17],
            "1PaymentTerms": row[18],
            "1FirstPayment": row[19],
            "1SecondPayment": row[20],
            "1ThirdPayment": row[21],
            "1FourthPayment": row[22],
            "1PaymentRemarks": row[23],
            // -------------- 2nd Service --------------------------------
            "2serviceName": row[24],
            "2TotalAmount": row[25],
            "2GST": row[26],
            "2PaymentTerms": row[27],
            "2FirstPayment": row[28],
            "2SecondPayment": row[29],
            "2ThirdPayment": row[30],
            "2FourthPayment": row[31],
            "2PaymentRemarks": row[32],
            // ----------------------- 3rd Service ---------------------------------
            "3serviceName": row[33],
            "3TotalAmount": row[34],
            "3GST": row[35],
            "3PaymentTerms": row[36],
            "3FirstPayment": row[37],
            "3SecondPayment": row[38],
            "3ThirdPayment": row[39],
            "3FourthPayment": row[40],
            "3PaymentRemarks": row[41],
            // ----------------------- 4th Service --------------------------------------
            "4serviceName": row[42],
            "4TotalAmount": row[43],
            "4GST": row[44],
            "4PaymentTerms": row[45],
            "4FirstPayment": row[46],
            "4SecondPayment": row[47],
            "4ThirdPayment": row[48],
            "4FourthPayment": row[49],
            "4PaymentRemarks": row[50],
            // ----------------------   5th Service  --------------------------------------
            "5serviceName": row[51],
            "5TotalAmount": row[52],
            "5GST": row[53],
            "5PaymentTerms": row[54],
            "5FirstPayment": row[55],
            "5SecondPayment": row[56],
            "5ThirdPayment": row[57],
            "5FourthPayment": row[58],
            "5PaymentRemarks": row[59],
            "caCase": row[60],
            "caNumber": row[61],
            "caEmail": row[62],
            "caCommission": row[63],
            "totalPayment": row[64],
            "receivedPayment": row[65],
            "pendingPayment": row[66],
            "paymentMethod": row[67],
            "extraRemarks": row[68],
          }));
        const newFormattedData = formattedJsonData.filter((obj) => {
          return obj["Company Name"] !== "" && obj["Company Name"] !== null && obj["Company Name"] !== undefined;
        });
        setExcelData(newFormattedData);

      };

      reader.readAsArrayBuffer(file);
    } else if (file.type === "text/csv") {
      // CSV file
      const parsedCsvData = parseCsv(file);
      console.log("everything is good")

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

  const handleSubmitImport = async () => {
    if (excelData.length !== 0) {
      try {
        const response = await axios.post(`${secretKey}/bookings/redesigned-importData`, excelData);
        Swal.fire("Success", "Bookings Uploaded Successfully", "success");
        fetchRedesignedFormData(1);
        closepopup();

      } catch (error) {
        console.error("Error importing data:", error);
        Swal.fire("Error", "Failed to Upload Data", "error");
      }
    } else {
      Swal.fire('Upload Data First', '', 'warning')
    }

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


    return formattedDate;
  }
  const handleotherdocsAttachment = async () => {
    try {
      const files = selectedDocuments;
      console.log(files);

      if (files.length === 0) {
        // No files selected
        return;
      }

      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("otherDocs", files[i]);
      }
      console.log(formData);
      setCurrentCompanyName(currentLeadform["Company Name"])
      const response = await fetch(
        `${secretKey}/bookings/uploadotherdocsAttachment/${currentLeadform["Company Name"]}/${sendingIndex}`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (response.ok) {
        Swal.fire({
          title: "Success!",
          html: `<small> File Uploaded successfully </small>
        `,
          icon: "success",
        });
        setSelectedDocuments([]);
        setOpenOtherDocs(false);
        fetchRedesignedFormData(1);


      } else {
        Swal.fire({
          title: "Error uploading file",

          icon: "error",
        });
        console.error("Error uploading file");
      }
    } catch (error) {
      Swal.fire({
        title: "Error uploading file",
        icon: "error",
      });
      console.error("Error uploading file:", error);
    }
  };

  //-------------- swap services function ----------
  const [openServicesPopup, setOpenServicesPopup] = useState(false)
  const [selectServices, setSelectServices] = useState([]);
  const [serviceNames, setServiceNames] = useState([])
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedCompanyName, setSelectedCompanyName] = useState("")
  const [dataToSend, setDataToSend] = useState(defaultLeadData)
  const [selectedCompanyData, setSelectedCompanyData] = useState([])

  const handleCloseServicesPopup = () => {
    setOpenServicesPopup(false)
    setSelectedServices([])
    setSelectedCompanyName("")
    setSelectedCompanyData([])
    setDataToSend(defaultLeadData)
  }

  const handleOpenServices = (companyName) => {
    // Filter the mainDataSwap array to get the companies that match the provided companyName
    setSelectedCompanyName(companyName)
    const selectedServices = mainDataSwap
      .filter((company) => company["Company Name"] === companyName)
      .flatMap((company) => {
        if (company.moreBookings.length !== 0) {
          return [
            ...company.services,
            ...company.moreBookings.flatMap((item) => item.services),
          ];
        } else {
          return company.services || [];
        }
      });
    //console.log("new slecetd", selectedServices)
    // Map through the selected services to get the service names
    const servicesNames = selectedServices.map((service) => service.serviceName);
    // Log the selected services and service names
    setServiceNames(servicesNames)
  };


  const handleCheckboxChange = (service) => {
    setSelectedServices(prevSelected =>
      prevSelected.includes(service)
        ? prevSelected.filter(item => item !== service)
        : [...prevSelected, service]
    );
  };


  const handleSubmitServicesToSwap = async () => {
    // Check if selectedCompanyData is defined
    if (!selectedCompanyData) {
      console.error(`Company with name '${selectedCompanyName}' not found in mainDataSwap.`);
      return;
    }
    const combinedServices = [
      ...(selectedCompanyData.services || []),
      ...(selectedCompanyData.moreBookings.flatMap((item) => item.services) || [])
    ];

    console.log("combined", combinedServices)
    // Initialize an array to store objects for each selected service
    const dataToSend = [];

    // Iterate through selectedServices (which contain only service names)
    selectedServices.forEach(serviceName => {
      // Find the detailed service object in selectedCompanyData.services
      const serviceData = combinedServices.find(service => service.serviceName === serviceName);

      // Check if serviceData is found
      if (serviceData) {
        // Create an object with the required fields from selectedCompanyData and serviceData
        const serviceToSend = {
          "Company Name": selectedCompanyData["Company Name"],
          "Company Number": selectedCompanyData["Company Number"],
          "Company Email": selectedCompanyData["Company Email"],
          panNumber: selectedCompanyData.panNumber,
          bdeName: selectedCompanyData.bdeName,
          bdeEmail: selectedCompanyData.bdeEmail || '', // Make sure to handle optional fields if they are not always provided
          bdmName: selectedCompanyData.bdmName,
          bdmType: selectedCompanyData.bdmType || 'Close-by', // Default value if not provided
          bookingDate: selectedCompanyData.bookingDate,
          paymentMethod: selectedCompanyData.paymentMethod || '', // Make sure to handle optional fields if they are not always provided
          caCase: selectedCompanyData.caCase || false, // Default to false if not provided
          caNumber: selectedCompanyData.caNumber || 0, // Default to 0 if not provided
          caEmail: selectedCompanyData.caEmail || '', // Make sure to handle optional fields if they are not always provided
          serviceName: serviceData.serviceName,
          totalPaymentWOGST: serviceData.totalPaymentWOGST || 0, // Default to 0 if not provided
          totalPaymentWGST: serviceData.totalPaymentWGST || 0,
          withGST: serviceData.withGST, // Default to 0 if not provided
          firstPayment: serviceData.firstPayment || 0, // Default to 0 if not provided
          secondPayment: serviceData.secondPayment || 0, // Default to 0 if not provided
          thirdPayment: serviceData.thirdPayment || 0, // Default to 0 if not provided
          fourthPayment: serviceData.fourthPayment || 0,
          secondPaymentRemarks: serviceData.secondPaymentRemarks || "",
          thirdPaymentRemarks: serviceData.thirdPaymentRemarks || "",
          fourthPaymentRemarks: serviceData.fourthPaymentRemarks || "", // Default to 0 if not provided
          bookingPublishDate: serviceData.bookingPublishDate || '', // Placeholder for bookingPublishDate, can be set if available
        };

        // Push the created object to dataToSend array
        dataToSend.push(serviceToSend);
      } else {
        console.error(`Service with name '${serviceName}' not found in selected company data.`);
      }
    });

    if (dataToSend.length !== 0) {
      try {
        const response = await axios.post(`${secretKey}/rm-services/post-rmservicesdata`, {
          dataToSend: dataToSend  // Ensure dataToSend is correctly formatted
        });
        console.log(response.data);
        if (response.data.successEntries === 0) {
          Swal.fire("Please Select Unique Services")
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            html: `Bookings Uploaded Successfully<br><br>Successful Entries: ${response.data.successEntries}<br>Failed Entries: ${response.data.failedEntries}`
          });
        }
        handleCloseServicesPopup()
      } catch (error) {
        console.error("Error sending data:", error.message);
        Swal.fire("Error", "Failed to upload bookings", error.message);
      }
    } else {
      console.log("No data to send.");
    }
    // Assuming setDataToSend updates state to store dataToSend array
    setDataToSend(dataToSend);
    // Assuming handleSendDataToMyBookings updates or sends dataToSend somewhere
  }

  const handleViewTable = () => {
    setOpenTableView(true)
    setOpenListView(false)
  }

  const handleViewList = () => {
    setOpenListView(true)
    setOpenTableView(false)
  }

  // const handleFetchBookingsDataForPagination = () => {
  //   console.log("thodi der se chalyenge")

  // }

  // console.log("listView", openListView)
  // console.log("tableView", openTableView)

  //-------------------filter functions-------------------------
  const [selectedServiceName, setSelectedServiceName] = useState("")
  const [selectedBdeName, setSelectedBdeName] = useState("")
  const [selectedBdmName, setselectedBdmName] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [selectedDate, setSelectedDate] = useState(0)
  const [bookingDate, setBookingDate] = useState(null)
  const [openBacdrop, setOpenBacdrop] = useState(false)
  const [monthIndex, setMonthIndex] = useState(0)
  const [filteredData, setFilteredData] = useState([])
  const [bookingPublishDate, setBookingPublishDate] = useState(null)
  //const [selectedBdmName, setselectedBdmName] = useState(second)


  const functionCloseFilterDrawer = () => {
    setOpenFilterDrawer(false)
  }

  const currentYear = new Date().getFullYear();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: currentYear - 1990 }, (_, index) => currentYear - index);
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
      const bookingDate = `${selectedYear}-${formattedMonth}-${formattedDate}`;
      setBookingDate(bookingDate);
    }
  }, [selectedYear, selectedMonth, selectedDate]);

  const handleFilterData = async (page = 1, limit = itemsPerPage) => {
    try {
      setIsFilter(true)
      setOpenBacdrop(true)
      const response = await axios.get(`${secretKey}/rm-services/filter-rmofcertification-bookings/`, {
        params: {
          selectedServiceName,
          selectedBdeName,
          selectedBdmName,
          selectedYear,
          monthIndex,
          bookingDate,
          bookingPublishDate,
          page,
          limit,
        }
      });
      console.log("response:-" , response.data)
      if (!selectedServiceName &&
        !selectedBdeName &&
        !selectedBdmName &&
        !selectedYear &&
        !monthIndex &&
        !bookingDate &&
        !bookingPublishDate) {
        // If search query is empty, reset data to mainData
        setIsFilter(false);
        fetchRedesignedFormData(currentPage)
        setOpenBacdrop(false)
      } else {
        
        setOpenBacdrop(false)
        setFilteredData(response.data.data)
        setLeadFormData(response.data.data)
        setTotalPages(response.data.totalPages)
        setCurrentPage(response.data.currentPage)
        setOpenFilterDrawer(false)
      }
    } catch (error) {
      console.log("Error filterinf data", error)
    }

  }
  

  const handleClearFilter = () => {
    setIsFilter(false);
    setSelectedBdeName("")
    setselectedBdmName("")
    setBookingDate(null)
    setBookingPublishDate(null)
    setSelectedYear('')
    setMonthIndex(0)
    setSelectedMonth('')
    setSelectedDate(0)
    setFilteredData([])
    fetchRedesignedFormData(currentPage)
  }

  console.log("leadFormdATAS" , leadFormData)
  console.log("filteredData" , filteredData)
  console.log(selectedYear, selectedMonth, selectedDate)
  console.log(bookingDate)
  console.log(selectedServiceName)
  //console.log("options", options)


  return (
    <div>
      {/* <RmofCertificationHeader name={employeeData.ename} designation={employeeData.designation} />
      <RmCertificationNavbar rmCertificationUserId={rmCertificationUserId} /> */}

      {!bookingFormOpen && !EditBookingOpen && !addFormOpen && (
        <div className="booking-list-main">
          <div className="booking_list_Filter">
            <div className="container-xl">
              <div className="row justify-content-between">
                <div className="col-2">
                  <div class="my-2 my-md-0 flex-grow-1 flex-md-grow-0 order-first order-md-last d-flex">
                    <div class="input-icon">
                      <span class="input-icon-addon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="icon"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          fill="none"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path
                            stroke="none"
                            d="M0 0h24v24H0z"
                            fill="none"
                          ></path>
                          <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                          <path d="M21 21l-6 -6"></path>
                        </svg>
                      </span>
                      <input
                        type="text"
                        value={searchText}
                        class="form-control"
                        placeholder="Search Company"
                        aria-label="Search in website"
                        onChange={(e) => {
                          setSearchText(e.target.value)
                          handleFilterSearch(e.target.value)
                        }}
                      />
                    </div>
                    <div className="btn-group ml-1" role="group" aria-label="Basic example">
                      <button type="button" className={isFilter ? 'btn mybtn active' : 'btn mybtn'} onClick={() => setOpenFilterDrawer(true)} >
                        <IoFilterOutline className='mr-1' /> Filter
                      </button>
                    </div>
                  </div>
                </div>
                <div className="col-6 d-flex">
                  <div className="list-gird-main ms-auto">
                    <div className="listgrridradio_main d-flex align-items-center">
                      <div className="custom_radio">
                        <input type="radio" name="rGroup" value="1" id="r1" checked={openTableView} />
                        <label class="custom_radio-alias" for="r1">
                          <FaTableCellsLarge onClick={() => { handleViewTable() }} />
                        </label>
                      </div>
                      <div className="custom_radio">
                        <input type="radio" name="rGroup" value="2" id="r2" checked={openListView} />
                        <label class="custom_radio-alias" for="r2">
                          <FaList onClick={() => handleViewList()} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {openTableView && <div className="container-xl">
            <div className="booking_list_Dtl_box">
              <div className="row m-0">
                {/* --------booking list left Part---------*/}
                <div className="col-4 p-0">
                  <div className="booking-list-card">
                    <div className="booking-list-heading">
                      <div className="d-flex justify-content-between">
                        <div className="b_dtl_C_name">Booking List</div>
                      </div>
                    </div>
                    <div className="booking-list-body">
                      {leadFormData.length !== 0 &&
                        leadFormData.map((obj, index) => (
                          <div
                            className={
                              currentLeadform &&
                                currentLeadform["Company Name"] ===
                                obj["Company Name"]
                                ? "bookings_Company_Name activeBox"
                                : "bookings_Company_Name"
                            }
                            onClick={() =>
                              setCurrentLeadform(
                                leadFormData.find(
                                  (data) =>
                                    data["Company Name"] === obj["Company Name"]
                                )
                              )
                            }
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="b_cmpny_name cName-text-wrap">
                                {obj["Company Name"]}
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <div className="b_Services_multipal_services mr-1"
                                  title="Swap Services">
                                  <MdOutlineSwapHoriz 
                                  onClick={() => (
                                    setOpenServicesPopup(true),
                                    setSelectedCompanyData(leadFormData.find(company => company["Company Name"] === obj["Company Name"])),
                                    handleOpenServices(
                                      obj["Company Name"],
                                    )

                                  )} 
                                  />
                                </div>
                                <div className="b_cmpny_time">
                                  {
                                    formatDatePro(
                                      obj.moreBookings &&
                                        obj.moreBookings.length !== 0
                                        ? obj.moreBookings[
                                          obj.moreBookings.length - 1
                                        ].bookingDate // Get the latest bookingDate from moreBookings
                                        : obj.bookingDate
                                    ) // Use obj.bookingDate if moreBookings is empty or not present
                                  }
                                </div>
                              </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <div className="b_Services_name d-flex flex-wrap">
                                {(obj.services.length !== 0 ||
                                  (obj.moreBookings &&
                                    obj.moreBookings.length !== 0)) &&
                                  [
                                    ...obj.services,
                                    ...(obj.moreBookings || []).map(
                                      (booking) => booking.services
                                    ),
                                  ]
                                    .flat()
                                    .slice(0, 3) // Limit to first 3 services
                                    .map((service, index, array) => (
                                      <>
                                        <div
                                          className="sname mb-1"
                                          key={service.serviceId}
                                        >
                                          {service.serviceName}
                                        </div>

                                        {index === 2 &&
                                          Math.max(
                                            obj.services.length +
                                            obj.moreBookings.length -
                                            3,
                                            0
                                          ) !== 0 && (
                                            <div className="sname mb-1">
                                              {`+${Math.max(
                                                obj.services.length +
                                                obj.moreBookings.length -
                                                3,
                                                0
                                              )}`}
                                            </div>
                                          )}
                                      </>
                                    ))}
                              </div>
                              <div className="d-flex align-items-center justify-content-between">
                                {(obj.remainingPayments.length !== 0 || obj.moreBookings.some((moreObj) => moreObj.remainingPayments.length !== 0)) &&
                                  <div className="b_Service_remaining_receive" title="remaining Payment Received">
                                    <img src={RemainingAmnt}></img>
                                  </div>}
                                {obj.moreBookings.length !== 0 && (
                                  <div
                                    className="b_Services_multipal_services"
                                    title="Multipal Bookings"
                                  >
                                    <FcList />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <div className="b_Services_amount d-flex">
                                <div className="amount total_amount_bg">
                                  Total: ₹ {parseInt(calculateTotalAmount(obj)).toLocaleString()}
                                </div>
                                <div className="amount receive_amount_bg">
                                  Received: ₹ {parseInt(calculateReceivedAmount(obj)).toLocaleString()}
                                </div>
                                <div className="amount pending_amount_bg">
                                  Pending: ₹ {parseInt(calculatePendingAmount(obj)).toLocaleString()}
                                </div>
                              </div>
                              <div className="b_BDE_name">{obj.bdeName}</div>
                            </div>
                          </div>
                        ))}
                      <div className="d-flex align-items-center justify-content-center">
                        <Stack spacing={2}>
                          <Pagination
                            count={totalPages}
                            size="small"
                            defaultPage={1}
                            onChange={handleFetchBookingsDataForPagination} />
                        </Stack>
                      </div>
                      {leadFormData.length === 0 && (
                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{ height: "inherit" }}
                        >
                          <Nodata />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* --------booking Details Right Part---------*/}
                <div className="col-8 p-0">
                  <div className="booking-deatils-card">
                    <div className="booking-deatils-heading">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="b_dtl_C_name">
                          {currentLeadform &&
                            Object.keys(currentLeadform).length !== 0
                            ? currentLeadform["Company Name"]
                            : leadFormData && leadFormData.length !== 0
                              ? leadFormData[0]["Company Name"]
                              : "-"}
                        </div>
                        <div
                          //className="bookings_add_more"
                          title="Add More Booking"
                          onClick={() => setAddFormOpen(true)}
                        >
                          {/* <FaPlus /> */}
                        </div>
                      </div>
                    </div>
                    <div className="booking-deatils-body">
                      {/* --------Basic Information Which is Common For all bookingdd  ---------*/}
                      <div className="my-card mt-2">
                        <div className="my-card-head">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>Basic Informations</div>
                            <div>Total Services: {currentLeadform && currentLeadform.services.length}</div>
                          </div>
                        </div>
                        <div className="my-card-body">
                          <div className="row m-0 bdr-btm-eee">
                            <div className="col-lg-6 col-sm-6 p-0 align-self-stretch">
                              <div class="row m-0 h-100">
                                <div class="col-sm-4 align-self-stretch p-0">
                                  <div class="booking_inner_dtl_h h-100">
                                    Company Name
                                  </div>
                                </div>
                                <div class="col-sm-8 align-self-stretch p-0">
                                  <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                    {currentLeadform &&
                                      Object.keys(currentLeadform).length !== 0
                                      ? currentLeadform["Company Name"]
                                      : leadFormData &&
                                        leadFormData.length !== 0
                                        ? leadFormData[0]["Company Name"]
                                        : "-"}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-6 col-sm-6 p-0 align-self-stretch">
                              <div class="row m-0 h-100">
                                <div class="col-sm-4 align-self-stretch p-0">
                                  <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                    Email Address
                                  </div>
                                </div>
                                <div class="col-sm-6 align-self-stretch p-0">
                                  <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                    {currentLeadform &&
                                      Object.keys(currentLeadform).length !== 0
                                      ? currentLeadform["Company Email"]
                                      : leadFormData &&
                                        leadFormData.length !== 0
                                        ? leadFormData[0]["Company Email"]
                                        : "-"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="row m-0 bdr-btm-eee">
                            <div className="col-lg-4 col-sm-6 p-0 align-self-stretch">
                              <div class="row m-0 h-100">
                                <div class="col-sm-6 align-self-stretch p-0">
                                  <div class="booking_inner_dtl_h h-100">
                                    Phone No
                                  </div>
                                </div>
                                <div class="col-sm-6 align-self-stretch p-0">
                                  <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                    {currentLeadform &&
                                      Object.keys(currentLeadform).length !== 0
                                      ? currentLeadform["Company Number"]
                                      : leadFormData &&
                                        leadFormData.length !== 0
                                        ? leadFormData[0]["Company Number"]
                                        : "-"}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-4 col-sm-6 p-0 align-self-stretch">
                              <div class="row m-0 h-100">
                                <div class="col-sm-7 align-self-stretch p-0">
                                  <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                    Incorporation date
                                  </div>
                                </div>
                                <div class="col-sm-5 align-self-stretch p-0">
                                  <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                    {currentLeadform &&
                                      formatDatePro(
                                        Object.keys(currentLeadform).length !==
                                          0
                                          ? currentLeadform.incoDate
                                          : leadFormData &&
                                            leadFormData.length !== 0
                                            ? leadFormData[0].incoDate
                                            : "-"
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-4 col-sm-6 p-0 align-self-stretch">
                              <div class="row m-0 h-100">
                                <div class="col-sm-5 align-self-stretch p-0">
                                  <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                    PAN/GST
                                  </div>
                                </div>
                                <div class="col-sm-7 align-self-stretch p-0">
                                  <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                    {currentLeadform &&
                                      Object.keys(currentLeadform).length !== 0
                                      ? currentLeadform.panNumber
                                      : leadFormData &&
                                        leadFormData.length !== 0
                                        ? leadFormData[0].panNumber
                                        : "-"}
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>
                          <div className="row m-0 bdr-btm-eee">
                            <div className="col-lg-4 col-sm-6 p-0">
                              <div class="row m-0">
                                <div class="col-sm-4 align-self-stretc p-0">
                                  <div class="booking_inner_dtl_h h-100">
                                    Total
                                  </div>
                                </div>
                                <div class="col-sm-8 align-self-stretc p-0">
                                  {currentLeadform && <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                    ₹ {parseInt(calculateTotalAmount(currentLeadform)).toLocaleString()}
                                  </div>}
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-4 col-sm-6 p-0">
                              <div class="row m-0">
                                <div class="col-sm-4 align-self-stretc p-0">
                                  <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                    Received
                                  </div>
                                </div>
                                <div class="col-sm-8 align-self-stretc p-0">
                                  {currentLeadform && <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                    ₹ {parseInt(calculateReceivedAmount(currentLeadform)).toLocaleString()}
                                  </div>}
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-4 col-sm-6 p-0">
                              <div class="row m-0">
                                <div class="col-sm-4 align-self-stretc p-0">
                                  <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                    Pending
                                  </div>
                                </div>
                                <div class="col-sm-8 align-self-stretc p-0">
                                  {currentLeadform && <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                    ₹ {parseInt(calculatePendingAmount(currentLeadform)).toLocaleString()}
                                  </div>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* --------If Multipal Booking (Bookign heading) ---------*/}
                      {currentLeadform &&
                        currentLeadform.moreBookings.length !== 0 && (
                          <div className="row align-items-center m-0 justify-content-between mb-1 mt-3">
                            <div className="mul_booking_heading col-6">
                              <b>Booking 1</b>
                            </div>
                            <div className="mul_booking_date col-6">
                              <b>
                                {formatDatePro(currentLeadform.bookingDate)}
                              </b>
                            </div>
                          </div>
                        )}
                      {/* -------- Booking Details ---------*/}
                      <div className="mul-booking-card mt-2">
                        {/* -------- Step 2 ---------*/}
                        <div className="mb-2 mul-booking-card-inner-head d-flex justify-content-between">
                          <b>Booking Details:</b>
                          <div className="Services_Preview_action d-flex">
                            <div
                              //className="Services_Preview_action_edit mr-1"
                              onClick={() => {
                                setbookingIndex(0);
                                setEditBookingOpen(true);
                              }}
                            >
                              {/* <MdModeEdit /> */}
                            </div>
                            <div
                              onClick={() =>
                                handleDeleteBooking(currentLeadform.company)
                              }
                            //className="Services_Preview_action_delete"
                            >
                              {/* <MdDelete /> */}
                            </div>
                          </div>
                        </div>
                        <div className="my-card">
                          <div className="my-card-body">
                            <div className="row m-0 bdr-btm-eee">
                              <div className="col-lg-4 col-sm-6 p-0">
                                <div class="row m-0">
                                  <div class="col-sm-4 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_h h-100">
                                      BDE Name
                                    </div>
                                  </div>
                                  <div class="col-sm-8 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                      {currentLeadform &&
                                        currentLeadform.bdeName}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-4 col-sm-6 p-0">
                                <div class="row m-0">
                                  <div class="col-sm-4 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                      BDE Email
                                    </div>
                                  </div>
                                  <div class="col-sm-8 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                      {currentLeadform &&
                                        currentLeadform.bdeEmail}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-4 col-sm-6 p-0">
                                <div class="row m-0">
                                  <div class="col-sm-4 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                      BDM Name
                                    </div>
                                  </div>
                                  <div class="col-sm-8 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                      <span>
                                        <i>
                                          {currentLeadform &&
                                            currentLeadform.bdmType}
                                        </i>
                                      </span>{" "}
                                      {currentLeadform &&
                                        currentLeadform.bdmName}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="row m-0 bdr-btm-eee">
                              <div className="col-lg-4 col-sm-6 p-0">
                                <div class="row m-0">
                                  <div class="col-sm-4 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_h h-100">
                                      BDM Email
                                    </div>
                                  </div>
                                  <div class="col-sm-8 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                      {currentLeadform &&
                                        currentLeadform.bdmEmail}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-4 col-sm-6 p-0">
                                <div class="row m-0">
                                  <div class="col-sm-4 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                      Booking Date{" "}
                                    </div>
                                  </div>
                                  <div class="col-sm-8 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                      {currentLeadform &&
                                        currentLeadform.bookingDate}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-4 col-sm-6 p-0">
                                <div class="row m-0">
                                  <div class="col-sm-4 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                      Lead Source
                                    </div>
                                  </div>
                                  <div class="col-sm-8 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                      {currentLeadform &&
                                        (currentLeadform.bookingSource ===
                                          "Other"
                                          ? currentLeadform.otherBookingSource
                                          : currentLeadform.bookingSource)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* -------- Step 3 ---------*/}
                        <div className="mb-2 mt-3 mul-booking-card-inner-head">
                          <b>Services And Payment Details:</b>
                        </div>
                        <div className="my-card">
                          <div className="my-card-body">
                            <div className="row m-0 bdr-btm-eee">
                              <div className="col-lg-6 col-sm-6 p-0">
                                <div class="row m-0">
                                  <div class="col-sm-4 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_h h-100">
                                      No. Of Services
                                    </div>
                                  </div>
                                  <div class="col-sm-8 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                      {currentLeadform &&
                                        currentLeadform.services.length}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {currentLeadform &&
                          currentLeadform.services.map((obj, index) => (
                            <div className="my-card mt-1">
                              <div className="my-card-body">
                                <div className="row m-0 bdr-btm-eee">
                                  <div className="col-lg-6 col-sm-6 p-0">
                                    <div class="row m-0">
                                      <div class="col-sm-4 align-self-stretch p-0">
                                        <div class="booking_inner_dtl_h h-100">
                                          {getOrdinal(index + 1)} Services Name
                                        </div>
                                      </div>
                                      <div class="col-sm-8 align-self-stretch p-0">
                                        <div class="booking_inner_dtl_b bdr-left-eee h-100 services-name">
                                          {obj.serviceName}{" "}
                                          {obj.withDSC &&
                                            obj.serviceName ===
                                            "Start Up Certificate" &&
                                            "With DSC"}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-lg-6 col-sm-6 p-0">
                                    <div class="row m-0">
                                      <div class="col-sm-4 align-self-stretch p-0">
                                        <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                          Total Amount
                                        </div>
                                      </div>
                                      <div class="col-sm-8 align-self-stretch p-0">
                                        <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                          <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                              ₹{" "}
                                              {parseInt(
                                                obj.totalPaymentWGST
                                              ).toLocaleString()}{" "}
                                              {"("}
                                              {obj.totalPaymentWGST !==
                                                obj.totalPaymentWOGST
                                                ? "With GST"
                                                : "Without GST"}
                                              {")"}
                                            </div>

                                            {/* --------------------------------------------------------------   ADD expense Section  --------------------------------------------------- */}


                                            {/* -------------------------------------   Expanse Section Ends Here  -------------------------------------------------- */}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="row m-0 bdr-btm-eee">
                                  <div className="col-lg-6 col-sm-5 p-0">
                                    <div class="row m-0">
                                      <div class="col-sm-4 align-self-stretch p-0">
                                        <div class="booking_inner_dtl_h h-100">
                                          Payment Terms
                                        </div>
                                      </div>
                                      <div class="col-sm-8 align-self-stretch p-0">
                                        <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                          {obj.paymentTerms === "two-part"
                                            ? "Part-Payment"
                                            : "Full Advanced"}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-lg-6 col-sm-5 p-0">
                                    <div class="row m-0">
                                      <div class="col-sm-3 align-self-stretch p-0">
                                        <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                          Notes
                                        </div>
                                      </div>
                                      <div class="col-sm-9 align-self-stretch p-0">
                                        <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={obj.paymentRemarks
                                          ? obj.paymentRemarks
                                          : "N/A"}>
                                          {obj.paymentRemarks
                                            ? obj.paymentRemarks
                                            : "N/A"}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {(obj.expanse !== 0 && obj.expanse) && <div className="row m-0 bdr-btm-eee">
                                  <div className="col-lg-6 col-sm-2 p-0">
                                    <div class="row m-0">
                                      <div class="col-sm-4 align-self-stretch p-0">
                                        <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                          Expense
                                        </div>
                                      </div>
                                      <div class="col-sm-8 align-self-stretch p-0">
                                        <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                          - ₹ {obj.expanse ? (obj.expanse).toLocaleString() : "N/A"}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-lg-6 col-sm-2 p-0">
                                    <div class="row m-0">
                                      <div class="col-sm-4 align-self-stretch p-0">
                                        <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                          expense Date
                                        </div>
                                      </div>
                                      <div class="col-sm-8 align-self-stretch p-0">
                                        <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                          {formatDatePro(obj.expanseDate ? obj.expanseDate : currentLeadform.bookingDate)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>}
                                <div className="row m-0 bdr-btm-eee">
                                  {obj.paymentTerms === "two-part" && (
                                    <div className="col-lg-6 col-sm-6 p-0">
                                      <div class="row m-0">
                                        <div class="col-sm-4 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_h h-100">
                                            First payment
                                          </div>
                                        </div>
                                        <div class="col-sm-8 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                            ₹{" "}
                                            {parseInt(
                                              obj.firstPayment
                                            ).toLocaleString()}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {obj.secondPayment !== 0 && (
                                    <div className="col-lg-6 col-sm-6 p-0">
                                      <div class="row m-0">
                                        <div class="col-sm-4 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                            Second Payment
                                          </div>
                                        </div>
                                        <div class="col-sm-8 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                            <div className="d-flex align-items-center justify-content-between">
                                              <div>
                                                ₹
                                                {parseInt(
                                                  obj.secondPayment
                                                ).toLocaleString()}
                                                {"("}
                                                {isNaN(
                                                  new Date(
                                                    obj.secondPaymentRemarks
                                                  )
                                                )
                                                  ? obj.secondPaymentRemarks
                                                  : "On " +
                                                  obj.secondPaymentRemarks +
                                                  ")"}
                                                {")"}
                                              </div>


                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="row m-0 bdr-btm-eee">
                                  {obj.thirdPayment !== 0 && (
                                    <div className="col-lg-6 col-sm-6 p-0">
                                      <div class="row m-0">
                                        <div class="col-sm-4 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_h h-100">
                                            Third Payment
                                          </div>
                                        </div>
                                        <div class="col-sm-8 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                            <div className="d-flex align-items-center justify-content-between">
                                              <div>
                                                ₹{" "}
                                                {parseInt(
                                                  obj.thirdPayment
                                                ).toLocaleString()}
                                                {"("}
                                                {isNaN(
                                                  new Date(
                                                    obj.thirdPaymentRemarks
                                                  )
                                                )
                                                  ? obj.thirdPaymentRemarks
                                                  : "On " +
                                                  obj.thirdPaymentRemarks +
                                                  ")"}
                                              </div>

                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {obj.fourthPayment !== 0 && (
                                    <div className="col-lg-6 col-sm-6 p-0">
                                      <div class="row m-0">
                                        <div class="col-sm-4 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                            Fourth Payment
                                          </div>
                                        </div>
                                        <div class="col-sm-8 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                            <div className="d-flex align-items-center justify-content-between">
                                              <div>
                                                ₹{" "}
                                                {parseInt(
                                                  obj.fourthPayment
                                                ).toLocaleString()}{" "}
                                                {"("}
                                                {isNaN(
                                                  new Date(
                                                    obj.fourthPaymentRemarks
                                                  )
                                                )
                                                  ? obj.fourthPaymentRemarks
                                                  : "On " +
                                                  obj.fourthPaymentRemarks +
                                                  ")"}
                                              </div>

                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {/* Remaining Payment Viwe Sections */}
                              {currentLeadform.remainingPayments.length !== 0 && currentLeadform.remainingPayments.some((boom) => boom.serviceName === obj.serviceName) &&
                                <div
                                  className="my-card-body accordion"
                                  id={`accordionExample${index}`}
                                >
                                  <div class="accordion-item bdr-none">
                                    <div
                                      id={`headingOne${index}`}
                                      className="pr-10 accordion-header"
                                    >
                                      <div
                                        className="row m-0 bdr-btm-eee accordion-button p-0"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#collapseOne${index}`}
                                        aria-expanded="true"
                                        aria-controls={`collapseOne${index}`}
                                      >
                                        <div className="w-95 p-0">
                                          <div className="booking_inner_dtl_h h-100">
                                            <div>Remaining Payment </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      id={`collapseOne${index}`}
                                      class="accordion-collapse collapse show"
                                      aria-labelledby={`headingOne${index}`}
                                      data-bs-parent="#accordionExample"
                                    // Add a unique key prop for each rendered element
                                    >
                                      {currentLeadform.remainingPayments
                                        .length !== 0 && currentLeadform.remainingPayments.filter(boom => boom.serviceName === obj.serviceName).map(
                                          (paymentObj, index) =>
                                            paymentObj.serviceName ===
                                              obj.serviceName ? (
                                              <div class="accordion-body bdr-none p-0">
                                                <div>
                                                  <div className="row m-0 bdr-btm-eee bdr-top-eee">
                                                    <div className="col-lg-12 col-sm-6 p-0 align-self-stretc bg-fffafa">
                                                      <div class="booking_inner_dtl_h h-100 d-flex align-items-center justify-content-between">
                                                        <div>
                                                          {currentLeadform.remainingPayments.length !== 0 &&
                                                            (() => {

                                                              if (index === 0) return "Second ";
                                                              else if (index === 1) return "Third ";
                                                              else if (index === 2) return "Fourth ";
                                                              // Add more conditions as needed
                                                              return ""; // Return default value if none of the conditions match
                                                            })()}
                                                          Remaining Payment
                                                        </div>
                                                        <div>
                                                          {"(" + formatDatePro(paymentObj.publishDate ? paymentObj.publishDate : paymentObj.paymentDate) + ")"}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="row m-0 bdr-btm-eee">
                                                    <div className="col-lg-3 col-sm-6 p-0 align-self-stretc">
                                                      <div class="row m-0 h-100">
                                                        <div class="col-sm-5 align-self-stretc p-0">
                                                          <div class="booking_inner_dtl_h h-100">
                                                            Amount
                                                          </div>
                                                        </div>
                                                        <div class="col-sm-7 align-self-stretc p-0">
                                                          <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                            ₹{" "}
                                                            {paymentObj.receivedPayment.toLocaleString()}
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="col-lg-3 col-sm-6 p-0 align-self-stretc">
                                                      <div class="row m-0 h-100">
                                                        <div class="col-sm-5 align-self-stretc p-0">
                                                          <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                            Pending
                                                          </div>
                                                        </div>
                                                        <div class="col-sm-7 align-self-stretc p-0">
                                                          <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                            ₹{" "}
                                                            {currentLeadform.remainingPayments.length !== 0 &&
                                                              (() => {
                                                                const filteredPayments = currentLeadform.remainingPayments.filter(
                                                                  (pay) => pay.serviceName === obj.serviceName
                                                                );

                                                                const filteredLength = filteredPayments.length;
                                                                if (index === 0) return parseInt(obj.totalPaymentWGST) - parseInt(obj.firstPayment) - parseInt(paymentObj.receivedPayment);
                                                                else if (index === 1) return parseInt(obj.totalPaymentWGST) - parseInt(obj.firstPayment) - parseInt(paymentObj.receivedPayment) - parseInt(filteredPayments[0].receivedPayment);
                                                                else if (index === 2) return parseInt(currentLeadform.pendingAmount);
                                                                // Add more conditions as needed
                                                                return ""; // Return default value if none of the conditions match
                                                              })()}
                                                            {/* {index === 0
                                                              ? parseInt(obj.totalPaymentWGST) - parseInt(obj.firstPayment) - parseInt(paymentObj.receivedPayment)
                                                              : index === 1
                                                              ? parseInt(obj.totalPaymentWGST) - parseInt(obj.firstPayment) - parseInt(paymentObj.receivedPayment) - parseInt(currentLeadform.remainingPayments[0].receivedPayment)
                                                              : parseInt(currentLeadform.pendingAmount)} */}
                                                          </div>

                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="col-lg-6 col-sm-6 p-0 align-self-stretc">
                                                      <div class="row m-0 h-100">
                                                        <div class="col-sm-5 align-self-stretc p-0">
                                                          <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                            Payment Date
                                                          </div>
                                                        </div>
                                                        <div class="col-sm-7 align-self-stretc p-0">
                                                          <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" >
                                                            {formatDatePro(
                                                              paymentObj.paymentDate
                                                            )}
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="row m-0 bdr-btm-eee">
                                                    <div className="col-lg-6 col-sm-6 p-0 align-self-stretc">
                                                      <div class="row m-0 h-100">
                                                        <div class="col-sm-5 align-self-stretc p-0">
                                                          <div class="booking_inner_dtl_h h-100">
                                                            Payment Method
                                                          </div>
                                                        </div>
                                                        <div class="col-sm-7 align-self-stretc p-0">
                                                          <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={
                                                            paymentObj.paymentMethod
                                                          }>
                                                            {
                                                              paymentObj.paymentMethod
                                                            }
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="col-lg-6 col-sm-4 p-0 align-self-stretc">
                                                      <div class="row m-0 h-100">
                                                        <div class="col-sm-4 align-self-stretc p-0">
                                                          <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                            Extra Remarks
                                                          </div>
                                                        </div>
                                                        <div class="col-sm-8 align-self-stretc p-0">
                                                          <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={
                                                            paymentObj.extraRemarks
                                                          }>
                                                            {
                                                              paymentObj.extraRemarks
                                                            }
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            ) : null // Render null for elements that don't match the condition
                                        )}
                                    </div>
                                  </div>
                                </div>}
                            </div>
                          ))}
                        {/* -------- CA Case -------- */}
                        <div className="my-card mt-1">
                          <div className="my-card-body">
                            <div className="row m-0 bdr-btm-eee">
                              <div className="col-lg-12 col-sm-6 p-0">
                                <div class="row m-0">
                                  <div class="col-sm-2 align-self-stretc p-0">
                                    <div class="booking_inner_dtl_h h-100">
                                      CA Case
                                    </div>
                                  </div>
                                  <div class="col-sm-10 align-self-stretc p-0">
                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                      {currentLeadform &&
                                        currentLeadform.caCase}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {currentLeadform &&
                              currentLeadform.caCase !== "No" && (
                                <div className="row m-0 bdr-btm-eee">
                                  <div className="col-lg-4 col-sm-6 p-0">
                                    <div class="row m-0">
                                      <div class="col-sm-6 align-self-stretc p-0">
                                        <div class="booking_inner_dtl_h h-100">
                                          CA's Number
                                        </div>
                                      </div>
                                      <div class="col-sm-6 align-self-stretc p-0">
                                        <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                          {currentLeadform &&
                                            currentLeadform.caNumber}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-lg-4 col-sm-6 p-0">
                                    <div class="row m-0">
                                      <div class="col-sm-4 align-self-stretc p-0">
                                        <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                          CA's Email
                                        </div>
                                      </div>
                                      <div class="col-sm-8 align-self-stretc p-0">
                                        <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                          {currentLeadform &&
                                            currentLeadform.caEmail}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-lg-4 col-sm-6 p-0">
                                    <div class="row m-0">
                                      <div class="col-sm-5 align-self-stretc p-0">
                                        <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                          CA's Commission
                                        </div>
                                      </div>
                                      <div class="col-sm-7 align-self-stretc p-0">
                                        <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                          ₹{" "}
                                          {currentLeadform &&
                                            currentLeadform.caCommission}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* -------- Step 4 ---------*/}
                        <div className="mb-2 mt-3 mul-booking-card-inner-head">
                          <b>Payment Summary:</b>
                        </div>

                        <div className="my-card">
                          <div className="my-card-body">
                            {/* {currentLeadform && currentLeadform.remainingPayments.length!==0 && currentLeadform.remainingPayments.map((payObj , index)=>(
                              <div className="row m-0 bdr-btm-eee">
                                <div className="col-lg-1 col-sm-1 p-0 align-self-stretch">
                                  <div class="row m-0 h-100">
                                    <div class="col align-self-stretch p-0">
                                      <div class="booking_inner_dtl_h h-100 text-center">
                                        {index+1}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-lg-4 col-sm-6 p-0 align-self-stretch">
                                  <div class="row m-0 h-100">
                                    <div class="col-sm-5 align-self-stretch p-0">
                                      <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                        Total Amount
                                      </div>
                                    </div>
                                    <div class="col-sm-7 align-self-stretch p-0">
                                      <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                        ₹{" "}
                                        {currentLeadform &&
                                          parseInt(
                                            currentLeadform.totalAmount
                                          ).toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-lg-4 col-sm-6 p-0 align-self-stretch">
                                  <div class="row m-0 h-100">
                                    <div class="col-sm-5 align-self-stretch p-0">
                                      <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                        Received Amount
                                      </div>
                                    </div>
                                  {<div class="col-sm-7 align-self-stretch p-0">
                                      <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                        ₹{" "}
                                        {(parseInt(currentLeadform.receivedAmount) -
          currentLeadform.remainingPayments
            .slice(index, currentLeadform.remainingPayments.length) // Consider objects up to the current index
            .reduce((total, pay) => total + parseInt(pay.receivedPayment), 0)).toLocaleString()}
                                      </div>
                                    </div>}
                                 
                                 
                                  </div>
                                </div>
                                <div className="col-lg-3 col-sm-5 p-0 align-self-stretch">
                                  <div class="row m-0 h-100">
                                    <div class="col-sm-6 align-self-stretch p-0">
                                      <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                        Pending Amount
                                      </div>
                                    </div>
                                    <div class="col-sm-6 align-self-stretch p-0">
                                      <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                        ₹{" "}
                                        {(parseInt(currentLeadform.pendingAmount) +
          currentLeadform.remainingPayments
            .slice(index, currentLeadform.remainingPayments.length) // Consider objects up to the current index
            .reduce((total, pay) => total + parseInt(pay.receivedPayment), 0)).toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )) } */}
                            <div className="row m-0 bdr-btm-eee">
                              {/* <div className="col-lg-1 col-sm-1 p-0 align-self-stretch">
                                <div class="row m-0 h-100">
                                  <div class="col align-self-stretch p-0">
                                    <div class="booking_inner_dtl_h h-100 text-center">
                                      {currentLeadform && (currentLeadform.remainingPayments.length + 1) }
                                    </div>
                                  </div>
                                </div>
                              </div> */}
                              <div className="col-lg-4 col-sm-6 p-0 align-self-stretch">
                                <div class="row m-0 h-100">
                                  <div class="col-sm-5 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                      Total Amount
                                    </div>
                                  </div>
                                  <div class="col-sm-7 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                      ₹{" "}
                                      {currentLeadform &&
                                        parseInt(
                                          currentLeadform.totalAmount
                                        ).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-4 col-sm-6 p-0 align-self-stretch">
                                <div class="row m-0 h-100">
                                  <div class="col-sm-5 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                      Received Amount
                                    </div>
                                  </div>
                                  <div class="col-sm-7 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                      ₹{" "}
                                      {currentLeadform &&
                                        parseInt(
                                          currentLeadform.receivedAmount
                                        ).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-4 col-sm-5 p-0 align-self-stretch">
                                <div class="row m-0 h-100">
                                  <div class="col-sm-6 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                      Pending Amount
                                    </div>
                                  </div>
                                  <div class="col-sm-6 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                      ₹{" "}
                                      {currentLeadform &&
                                        parseInt(
                                          currentLeadform.pendingAmount
                                        ).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="row m-0 bdr-btm-eee">
                              <div className="col-lg-6 col-sm-6 p-0 align-self-stretch">
                                <div class="row m-0 h-100">
                                  <div class="col-sm-4 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_h h-100 ">
                                      Payment Method
                                    </div>
                                  </div>
                                  <div class="col-sm-8 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={currentLeadform &&
                                      currentLeadform.paymentMethod}>
                                      {currentLeadform &&
                                        currentLeadform.paymentMethod}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-6 col-sm-6 p-0 align-self-stretch">
                                <div class="row m-0 h-100">
                                  <div class="col-sm-4 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                      Extra Remarks
                                    </div>
                                  </div>
                                  <div class="col-sm-8 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={currentLeadform &&
                                      currentLeadform.extraNotes}>
                                      {currentLeadform &&
                                        currentLeadform.extraNotes}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* {currentLeadform &&
                          (currentLeadform.paymentReceipt.length !== 0 ||
                            currentLeadform.otherDocs !== 0) && (
                            <>
                              <div className="mb-2 mt-3 mul-booking-card-inner-head">
                                <b>Payment Receipt and Additional Documents:</b>
                              </div>
                              <div className="row">
                                {currentLeadform.paymentReceipt.length !==
                                  0 && (
                                    <div className="col-sm-2 mb-1">
                                      <div className="booking-docs-preview">
                                        <div
                                          className="booking-docs-preview-img"
                                          onClick={() =>
                                            handleViewPdfReciepts(
                                              currentLeadform.paymentReceipt[0]
                                                .filename,
                                              currentLeadform["Company Name"]
                                            )
                                          }
                                        >
                                          {currentLeadform &&
                                            currentLeadform.paymentReceipt[0] &&
                                            (((currentLeadform.paymentReceipt[0].filename).toLowerCase()).endsWith(
                                              ".pdf"
                                            ) ? (
                                              <PdfImageViewerAdmin
                                                type="paymentrecieptpdf"
                                                path={
                                                  currentLeadform
                                                    .paymentReceipt[0].filename
                                                }
                                                companyName={
                                                  currentLeadform["Company Name"]
                                                }
                                              />
                                            ) : currentLeadform.paymentReceipt[0].filename.endsWith(
                                              ".png"
                                            ) ||
                                              currentLeadform.paymentReceipt[0].filename.endsWith(
                                                ".jpg"
                                              ) ||
                                              currentLeadform.paymentReceipt[0].filename.endsWith(
                                                ".jpeg"
                                              ) ? (
                                              <img
                                                src={`${secretKey}/bookings/recieptpdf/${currentLeadform["Company Name"]}/${currentLeadform.paymentReceipt[0].filename}`}
                                                alt="Receipt Image"
                                              />
                                            ) : (
                                              <img
                                                src={wordimg}
                                                alt="Default Image"
                                              />
                                            ))}
                                        </div>
                                        <div className="booking-docs-preview-text">
                                          <p className="booking-img-name-txtwrap text-wrap m-auto m-0">
                                            Receipt
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                {currentLeadform.remainingPayments.length !==
                                  0 &&
                                  currentLeadform.remainingPayments.some(
                                    (obj) => obj.paymentReceipt.length !== 0
                                  ) &&
                                  currentLeadform.remainingPayments.map((remainingObject, index) => (
                                    remainingObject.paymentReceipt.length !== 0 && (
                                      <div className="col-sm-2 mb-1" key={index}>
                                        <div className="booking-docs-preview">
                                          <div
                                            className="booking-docs-preview-img"
                                            onClick={() =>
                                              handleViewPdfReciepts(
                                                remainingObject.paymentReceipt[0].filename,
                                                currentLeadform["Company Name"]
                                              )
                                            }
                                          >
                                            {((remainingObject.paymentReceipt[0].filename).toLowerCase()).endsWith(".pdf") ? (
                                              <PdfImageViewerAdmin
                                                type="paymentrecieptpdf"
                                                path={remainingObject.paymentReceipt[0].filename}
                                                companyName={currentLeadform["Company Name"]}
                                              />
                                            ) : remainingObject.paymentReceipt[0].filename.endsWith(".png") ||
                                              remainingObject.paymentReceipt[0].filename.endsWith(".jpg") ||
                                              remainingObject.paymentReceipt[0].filename.endsWith(".jpeg") ? (
                                              <img
                                                src={`${secretKey}/bookings/recieptpdf/${currentLeadform["Company Name"]}/${remainingObject.paymentReceipt[0].filename}`}
                                                alt="Receipt Image"
                                              />
                                            ) : (
                                              <img src={wordimg} alt="Default Image" />
                                            )}
                                          </div>
                                          <div className="booking-docs-preview-text">
                                            <p className="booking-img-name-txtwrap text-wrap m-auto m-0">
                                              Remaining Payment
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  ))}

                                {currentLeadform &&
                                  currentLeadform.otherDocs.map((obj) => (
                                    <div className="col-sm-2 mb-1">
                                      <div className="booking-docs-preview">
                                        <div
                                          className="booking-docs-preview-img"
                                          onClick={() =>
                                            handleViewPdOtherDocs(
                                              obj.filename,
                                              currentLeadform["Company Name"]
                                            )
                                          }
                                        >
                                          {((obj.filename).toLowerCase()).endsWith(".pdf") ? (
                                            <PdfImageViewerAdmin
                                              type="pdf"
                                              path={obj.filename}
                                              companyName={
                                                currentLeadform["Company Name"]
                                              }
                                            />
                                          ) : (
                                            <img
                                              src={`${secretKey}/bookings/otherpdf/${currentLeadform["Company Name"]}/${obj.filename}`}
                                              alt={pdfimg}
                                            ></img>
                                          )}
                                        </div>
                                        <div className="booking-docs-preview-text">
                                          <p
                                            className="booking-img-name-txtwrap text-wrap m-auto m-0 text-wrap m-auto m-0"
                                            title={obj.originalname}
                                          >
                                            {obj.originalname}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                          
                                <div className="col-sm-2 mb-1">
                                  <div
                                    className="booking-docs-preview"
                                    title="Upload More Documents"
                                  >
                                    <div
                                      className="upload-Docs-BTN"
                                      onClick={() => {
                                        setOpenOtherDocs(true);
                                        setSendingIndex(0);
                                      }}
                                    >
                                      <IoAdd />
                                    </div>
                                  </div>
                                </div>

                                <Dialog
                                  open={openOtherDocs}
                                  onClose={closeOtherDocsPopup}
                                  fullWidth
                                  maxWidth="sm"
                                >
                                  <DialogTitle>
                                    Upload Your Attachments
                                    <IconButton
                                      onClick={closeOtherDocsPopup}
                                      style={{ float: "right" }}
                                    >
                                      <CloseIcon color="primary"></CloseIcon>
                                    </IconButton>{" "}
                                  </DialogTitle>
                                  <DialogContent>
                                    <div className="maincon">
                                      
                                      <div
                                        style={{
                                          justifyContent: "space-between",
                                        }}
                                        className="con1 d-flex"
                                      >
                                        <div
                                          style={{ paddingTop: "9px" }}
                                          className="uploadcsv"
                                        >
                                          <label
                                            style={{
                                              margin: "0px 0px 6px 0px",
                                            }}
                                            htmlFor="attachmentfile"
                                          >
                                            Upload Files
                                          </label>
                                        </div>
                                      </div>
                                      <div
                                        style={{ margin: "5px 0px 0px 0px" }}
                                        className="form-control"
                                      >
                                        <input
                                          type="file"
                                          name="attachmentfile"
                                          id="attachmentfile"
                                          onChange={(e) => {
                                            handleOtherDocsUpload(
                                              e.target.files
                                            );
                                          }}
                                          multiple // Allow multiple files selection
                                        />
                                        {selectedDocuments &&
                                          selectedDocuments.length > 0 && (
                                            <div className="uploaded-filename-main d-flex flex-wrap">
                                              {selectedDocuments.map(
                                                (file, index) => (
                                                  <div
                                                    className="uploaded-fileItem d-flex align-items-center"
                                                    key={index}
                                                  >
                                                    <p className="m-0">
                                                      {file.name}
                                                    </p>
                                                    <button
                                                      className="fileItem-dlt-btn"
                                                      onClick={() =>
                                                        handleRemoveFile(index)
                                                      }
                                                    >
                                                      <IconX className="close-icon" />
                                                    </button>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  </DialogContent>
                                  <button
                                    className="btn btn-primary"
                                    onClick={handleotherdocsAttachment}
                                  >
                                    Submit
                                  </button>
                                </Dialog>
                              </div>
                            </>
                          )} */}
                      </div>

                      {/* ------------------------------------------ Multiple Booking Section Starts here ----------------------------- */}
                      {currentLeadform &&
                        currentLeadform.moreBookings.length !== 0 &&
                        currentLeadform.moreBookings.map((objMain, index) => (
                          <>
                            <div className="row align-items-center m-0 justify-content-between mb-1 mt-3">
                              <div className="mul_booking_heading col-6">
                                <b>Booking {index + 2}</b>
                              </div>
                              <div className="mul_booking_date col-6">
                                <b>{formatDatePro(objMain.bookingDate)}</b>
                              </div>
                            </div>
                            <div className="mul-booking-card mt-2">
                              {/* -------- Step 2 ---------*/}
                              <div className="mb-2 mul-booking-card-inner-head d-flex justify-content-between">
                                <b>Booking Details:</b>
                                <div className="Services_Preview_action d-flex">
                                  <div
                                    className="Services_Preview_action_edit mr-2"
                                    onClick={() => {
                                      setbookingIndex(index + 1);
                                      setEditBookingOpen(true);
                                    }}
                                  >
                                    <MdModeEdit />
                                  </div>
                                  <div
                                    onClick={() =>
                                      handleDeleteBooking(
                                        currentLeadform.company,
                                        objMain._id
                                      )
                                    }
                                    className="Services_Preview_action_delete"
                                  >
                                    <MdDelete />
                                  </div>
                                </div>
                              </div>
                              <div className="my-card">
                                <div className="my-card-body">
                                  <div className="row m-0 bdr-btm-eee">
                                    <div className="col-lg-4 col-sm-6 p-0">
                                      <div class="row m-0">
                                        <div class="col-sm-4 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_h h-100">
                                            BDE Name
                                          </div>
                                        </div>
                                        <div class="col-sm-8 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                            {objMain.bdeName}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-lg-4 col-sm-6 p-0">
                                      <div class="row m-0">
                                        <div class="col-sm-4 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                            BDE Email
                                          </div>
                                        </div>
                                        <div class="col-sm-8 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                            {objMain.bdeEmail}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-lg-4 col-sm-6 p-0">
                                      <div class="row m-0">
                                        <div class="col-sm-4 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                            BDM Name
                                          </div>
                                        </div>
                                        <div class="col-sm-8 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                            <span>
                                              <i>{objMain.bdmType === "Close-by" ? "Closed-by" : "Supported-by"}</i>
                                            </span>{" "}
                                            {objMain.bdmName}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row m-0 bdr-btm-eee">
                                    <div className="col-lg-4 col-sm-6 p-0">
                                      <div class="row m-0">
                                        <div class="col-sm-4 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_h h-100">
                                            BDM Email
                                          </div>
                                        </div>
                                        <div class="col-sm-8 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                            {objMain.bdmEmail}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-lg-4 col-sm-6 p-0">
                                      <div class="row m-0">
                                        <div class="col-sm-4 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                            Booking Date{" "}
                                          </div>
                                        </div>
                                        <div class="col-sm-8 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                            {objMain.bookingDate}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-lg-4 col-sm-6 p-0">
                                      <div class="row m-0">
                                        <div class="col-sm-4 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                            Lead Source
                                          </div>
                                        </div>
                                        <div class="col-sm-8 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                            {objMain.bookingSource === "Other"
                                              ? objMain.otherBookingSource
                                              : objMain.bookingSource}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* -------- Step 3 ---------*/}
                              <div className="mb-2 mt-3 mul-booking-card-inner-head">
                                <b>Services And Payment Details:</b>
                              </div>
                              <div className="my-card">
                                <div className="my-card-body">
                                  <div className="row m-0 bdr-btm-eee">
                                    <div className="col-lg-6 col-sm-6 p-0">
                                      <div class="row m-0">
                                        <div class="col-sm-4 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_h h-100">
                                            No. Of Services
                                          </div>
                                        </div>
                                        <div class="col-sm-8 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                            {objMain.services.length}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {objMain.services.map((obj, index) => (
                                <div className="my-card mt-1">
                                  <div className="my-card-body">
                                    <div className="row m-0 bdr-btm-eee">
                                      <div className="col-lg-6 col-sm-6 p-0">
                                        <div class="row m-0">
                                          <div class="col-sm-4 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_h h-100">
                                              {getOrdinal(index + 1)} Services
                                              Name
                                            </div>
                                          </div>
                                          <div class="col-sm-8 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_b bdr-left-eee h-100 services-name">
                                              {obj.serviceName}{" "}
                                              {obj.withDSC &&
                                                obj.serviceName ===
                                                "Start Up Certificate" &&
                                                "With DSC"}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-lg-6 col-sm-6 p-0">
                                        <div class="row m-0">
                                          <div class="col-sm-4 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                              Total Amount
                                            </div>
                                          </div>
                                          <div class="col-sm-8 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                              <div className="d-flex align-item-center justify-content-between">
                                                <div>
                                                  ₹{" "}
                                                  {parseInt(
                                                    obj.totalPaymentWGST
                                                  ).toLocaleString()}
                                                  {"("}
                                                  {obj.totalPaymentWGST !==
                                                    obj.totalPaymentWOGST
                                                    ? "With GST"
                                                    : "Without GST"}
                                                  {")"}
                                                </div>
                                                {/* --------------------------------------------------------------   ADD expense Section  --------------------------------------------------- */}


                                                {/* -------------------------------------   Expanse Section Ends Here  -------------------------------------------------- */}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="row m-0 bdr-btm-eee">
                                      <div className="col-lg-6 col-sm-5 p-0">
                                        <div class="row m-0">
                                          <div class="col-sm-4 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_h h-100">
                                              Payment Terms
                                            </div>
                                          </div>
                                          <div class="col-sm-8 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                              {obj.paymentTerms}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-lg-6 col-sm-5 p-0">
                                        <div class="row m-0">
                                          <div class="col-sm-3 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                              Notes
                                            </div>
                                          </div>
                                          <div class="col-sm-9 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={obj.paymentRemarks
                                              ? obj.paymentRemarks
                                              : "N/A"}>
                                              {obj.paymentRemarks
                                                ? obj.paymentRemarks
                                                : "N/A"}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {(obj.expanse !== 0 && obj.expanse) && <div className="row m-0 bdr-btm-eee">
                                      <div className="col-lg-6 col-sm-2 p-0">
                                        <div class="row m-0">
                                          <div class="col-sm-4 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                              Expense
                                            </div>
                                          </div>
                                          <div class="col-sm-8 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                              - ₹ {obj.expanse ? (obj.expanse).toLocaleString() : "N/A"}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-lg-6 col-sm-2 p-0">
                                        <div class="row m-0">
                                          <div class="col-sm-4 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                              expense Date
                                            </div>
                                          </div>
                                          <div class="col-sm-8 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                              {formatDatePro(obj.expanseDate ? obj.expanseDate : objMain.bookingDate)}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>}
                                    <div className="row m-0 bdr-btm-eee">
                                      {obj.paymentTerms === "two-part" && (
                                        <div className="col-lg-6 col-sm-6 p-0">
                                          <div class="row m-0">
                                            <div class="col-sm-4 align-self-stretch p-0">
                                              <div class="booking_inner_dtl_h h-100">
                                                First payment
                                              </div>
                                            </div>
                                            <div class="col-sm-8 align-self-stretch p-0">
                                              <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                ₹{" "}
                                                {parseInt(
                                                  obj.firstPayment
                                                ).toLocaleString()}
                                                /-
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      {obj.secondPayment !== 0 && (
                                        <div className="col-lg-6 col-sm-6 p-0">
                                          <div class="row m-0">
                                            <div class="col-sm-4 align-self-stretch p-0">
                                              <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                Second Payment
                                              </div>
                                            </div>
                                            <div class="col-sm-8 align-self-stretch p-0">
                                              <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                <div className="d-flex align-items-center justify-content-between">
                                                  <div>
                                                    ₹
                                                    {parseInt(
                                                      obj.secondPayment
                                                    ).toLocaleString()}
                                                    /- {"("}
                                                    {isNaN(
                                                      new Date(
                                                        obj.secondPaymentRemarks
                                                      )
                                                    )
                                                      ? obj.secondPaymentRemarks
                                                      : "On " +
                                                      obj.secondPaymentRemarks +
                                                      ")"}
                                                  </div>

                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="row m-0 bdr-btm-eee">
                                      {obj.thirdPayment !== 0 && (
                                        <div className="col-lg-6 col-sm-6 p-0">
                                          <div class="row m-0">
                                            <div class="col-sm-4 align-self-stretch p-0">
                                              <div class="booking_inner_dtl_h h-100">
                                                Third Payment
                                              </div>
                                            </div>
                                            <div class="col-sm-8 align-self-stretch p-0">
                                              <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                <div className="d-flex align-items-center justify-content-between">
                                                  <div>
                                                    ₹{" "}
                                                    {parseInt(
                                                      obj.thirdPayment
                                                    ).toLocaleString()}
                                                    /- {"("}
                                                    {isNaN(
                                                      new Date(
                                                        obj.thirdPaymentRemarks
                                                      )
                                                    )
                                                      ? obj.thirdPaymentRemarks
                                                      : "On " +
                                                      obj.thirdPaymentRemarks +
                                                      ")"}
                                                  </div>

                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      {obj.fourthPayment !== 0 && (
                                        <div className="col-lg-6 col-sm-6 p-0">
                                          <div class="row m-0">
                                            <div class="col-sm-4 align-self-stretch p-0">
                                              <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                Fourth Payment
                                              </div>
                                            </div>
                                            <div class="col-sm-8 align-self-stretch p-0">
                                              <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                <div className="d-flex align-items-center justify-content-between">
                                                  <div>
                                                    ₹{" "}
                                                    {parseInt(
                                                      obj.fourthPayment
                                                    ).toLocaleString()}{" "}
                                                    /- {"("}
                                                    {isNaN(
                                                      new Date(
                                                        obj.fourthPaymentRemarks
                                                      )
                                                    )
                                                      ? obj.fourthPaymentRemarks
                                                      : "On " +
                                                      obj.fourthPaymentRemarks +
                                                      ")"}
                                                  </div>

                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {objMain.remainingPayments.length !== 0 && objMain.remainingPayments.some((boom) => boom.serviceName === obj.serviceName) &&
                                    <div
                                      className="my-card-body accordion"
                                      id={`accordionExample${index}`}
                                    >
                                      <div class="accordion-item bdr-none">
                                        <div
                                          id={`headingOne${index}`}
                                          className="pr-10 accordion-header"
                                        >
                                          <div
                                            className="row m-0 bdr-btm-eee accordion-button p-0"
                                            data-bs-toggle="collapse"
                                            data-bs-target={`#collapseOne${index}`}
                                            aria-expanded="true"
                                            aria-controls={`collapseOne${index}`}
                                          >
                                            <div className="w-95 p-0">
                                              <div className="booking_inner_dtl_h h-100 d-flex align-items-center justify-content-between">
                                                <div>Remaining Payment </div>


                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div
                                          id={`collapseOne${index}`}
                                          class="accordion-collapse collapse show"
                                          aria-labelledby={`headingOne${index}`}
                                          data-bs-parent="#accordionExample"
                                        // Add a unique key prop for each rendered element
                                        >
                                          {objMain.remainingPayments
                                            .length !== 0 && objMain.remainingPayments.filter(boom => boom.serviceName === obj.serviceName).map(
                                              (paymentObj, index) =>
                                                paymentObj.serviceName ===
                                                  obj.serviceName ? (
                                                  <div class="accordion-body bdr-none p-0">
                                                    <div>
                                                      <div className="row m-0 bdr-btm-eee bdr-top-eee">
                                                        <div className="col-lg-12 col-sm-6 p-0 align-self-stretc bg-fffafa">
                                                          <div class="booking_inner_dtl_h h-100 d-flex align-items-center justify-content-between">
                                                            <div>
                                                              {objMain.remainingPayments.length !== 0 &&
                                                                (() => {

                                                                  if (index === 0) return "Second ";
                                                                  else if (index === 1) return "Third ";
                                                                  else if (index === 2) return "Fourth ";
                                                                  else if (index > 2) return "Other ";
                                                                  // Add more conditions as needed
                                                                  return ""; // Return default value if none of the conditions match
                                                                })()}
                                                              Remaining Payment
                                                            </div>
                                                            <div className="d-flex align-items-center">
                                                              <div>
                                                                {"(" + formatDatePro(paymentObj.publishDate ? paymentObj.publishDate : paymentObj.paymentDate) + ")"}

                                                              </div>

                                                              {/* {
                                                          objMain.remainingPayments.length - 1 === index && <IconButton onClick={ ()=>functionDeleteRemainingPayment(BookingIndex + 1)} >
                                                            <MdDelete style={{ height: '14px', width: '14px' , color:'#be1e1e' }} />
                                                          </IconButton>
                                                          } */}
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                      <div className="row m-0 bdr-btm-eee">
                                                        <div className="col-lg-3 col-sm-6 p-0 align-self-stretc">
                                                          <div class="row m-0 h-100">
                                                            <div class="col-sm-5 align-self-stretc p-0">
                                                              <div class="booking_inner_dtl_h h-100">
                                                                Amount
                                                              </div>
                                                            </div>
                                                            <div class="col-sm-7 align-self-stretc p-0">
                                                              <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                ₹{" "}
                                                                {paymentObj.receivedPayment.toLocaleString()}
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                        <div className="col-lg-3 col-sm-6 p-0 align-self-stretc">
                                                          <div class="row m-0 h-100">
                                                            <div class="col-sm-5 align-self-stretc p-0">
                                                              <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                Pending
                                                              </div>
                                                            </div>
                                                            <div class="col-sm-7 align-self-stretc p-0">
                                                              <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                ₹{" "}
                                                                {objMain.remainingPayments.length !== 0 &&
                                                                  (() => {
                                                                    const filteredPayments = objMain.remainingPayments.filter(
                                                                      (pay) => pay.serviceName === obj.serviceName
                                                                    );

                                                                    const filteredLength = filteredPayments.length;
                                                                    if (index === 0) return Math.round(obj.totalPaymentWGST) - Math.round(obj.firstPayment) - Math.round(paymentObj.receivedPayment);
                                                                    else if (index === 1) return Math.round(obj.totalPaymentWGST) - Math.round(obj.firstPayment) - Math.round(paymentObj.receivedPayment) - Math.round(filteredPayments[0].receivedPayment);
                                                                    else if (index === 2) return Math.round(objMain.pendingAmount);
                                                                    // Add more conditions as needed
                                                                    return ""; // Return default value if none of the conditions match
                                                                  })()}
                                                                {/* {index === 0
                                                              ? Math.round(obj.totalPaymentWGST) - Math.round(obj.firstPayment) - Math.round(paymentObj.receivedPayment)
                                                              : index === 1
                                                              ? Math.round(obj.totalPaymentWGST) - Math.round(obj.firstPayment) - Math.round(paymentObj.receivedPayment) - Math.round(currentLeadform.remainingPayments[0].receivedPayment)
                                                              : Math.round(currentLeadform.pendingAmount)} */}
                                                              </div>

                                                            </div>
                                                          </div>
                                                        </div>
                                                        <div className="col-lg-6 col-sm-6 p-0 align-self-stretc">
                                                          <div class="row m-0 h-100">
                                                            <div class="col-sm-5 align-self-stretc p-0">
                                                              <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                Payment Date
                                                              </div>
                                                            </div>
                                                            <div class="col-sm-7 align-self-stretc p-0">
                                                              <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap">
                                                                {formatDatePro(
                                                                  paymentObj.paymentDate
                                                                )}
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                      <div className="row m-0 bdr-btm-eee">
                                                        <div className="col-lg-6 col-sm-6 p-0 align-self-stretc">
                                                          <div class="row m-0 h-100">
                                                            <div class="col-sm-5 align-self-stretc p-0">
                                                              <div class="booking_inner_dtl_h h-100">
                                                                Payment Method
                                                              </div>
                                                            </div>
                                                            <div class="col-sm-7 align-self-stretc p-0">
                                                              <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={
                                                                paymentObj.paymentMethod
                                                              }>
                                                                {
                                                                  paymentObj.paymentMethod
                                                                }
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                        <div className="col-lg-6 col-sm-6 p-0 align-self-stretc">
                                                          <div class="row m-0 h-100">
                                                            <div class="col-sm-4 align-self-stretc p-0">
                                                              <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                Extra Remarks
                                                              </div>
                                                            </div>
                                                            <div class="col-sm-8 align-self-stretc p-0">
                                                              <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={
                                                                paymentObj.extraRemarks
                                                              }>
                                                                {
                                                                  paymentObj.extraRemarks
                                                                }
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ) : null // Render null for elements that don't match the condition
                                            )}
                                        </div>
                                      </div>
                                    </div>}
                                </div>
                              ))}

                              {/* -------- CA Case -------- */}
                              <div className="my-card mt-1">
                                <div className="my-card-body">
                                  <div className="row m-0 bdr-btm-eee">
                                    <div className="col-lg-12 col-sm-6 p-0">
                                      <div class="row m-0">
                                        <div class="col-sm-2 align-self-stretc p-0">
                                          <div class="booking_inner_dtl_h h-100">
                                            CA Case
                                          </div>
                                        </div>
                                        <div class="col-sm-10 align-self-stretc p-0">
                                          <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                            {objMain.caCase}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {objMain.caCase !== "No" && (
                                    <div className="row m-0 bdr-btm-eee">
                                      <div className="col-lg-4 col-sm-6 p-0">
                                        <div class="row m-0">
                                          <div class="col-sm-5 align-self-stretc p-0">
                                            <div class="booking_inner_dtl_h h-100">
                                              CA's Number
                                            </div>
                                          </div>
                                          <div class="col-sm-7 align-self-stretc p-0">
                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                              {objMain.caNumber}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-lg-4 col-sm-6 p-0">
                                        <div class="row m-0">
                                          <div class="col-sm-4 align-self-stretc p-0">
                                            <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                              CA's Email
                                            </div>
                                          </div>
                                          <div class="col-sm-8 align-self-stretc p-0">
                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                              {objMain.caEmail}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-lg-4 col-sm-6 p-0">
                                        <div class="row m-0">
                                          <div class="col-sm-5 align-self-stretc p-0">
                                            <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                              CA's Commission
                                            </div>
                                          </div>
                                          <div class="col-sm-7 align-self-stretc p-0">
                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                              ₹ {objMain.caCommission}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* -------- Step 4 ---------*/}
                              <div className="mb-2 mt-3 mul-booking-card-inner-head">
                                <b>Payment Summary:</b>
                              </div>
                              <div className="my-card">
                                <div className="my-card-body">
                                  <div className="row m-0 bdr-btm-eee">
                                    <div className="col-lg-4 col-sm-6 p-0">
                                      <div class="row m-0">
                                        <div class="col-sm-5 align-self-stretchh p-0">
                                          <div class="booking_inner_dtl_h h-100">
                                            Total Amount
                                          </div>
                                        </div>
                                        <div class="col-sm-7 align-self-stretchh p-0">
                                          <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                            ₹{" "}
                                            {parseInt(
                                              objMain.totalAmount
                                            ).toLocaleString()}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-lg-4 col-sm-6 p-0">
                                      <div class="row m-0">
                                        <div class="col-sm-5 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                            Received Amount
                                          </div>
                                        </div>
                                        <div class="col-sm-7 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                            ₹{" "}
                                            {parseInt(
                                              objMain.receivedAmount
                                            ).toLocaleString()}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-lg-4 col-sm-6 p-0">
                                      <div class="row m-0">
                                        <div class="col-sm-5 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                            Pending Amount
                                          </div>
                                        </div>
                                        <div class="col-sm-7 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                            ₹{" "}
                                            {parseInt(
                                              objMain.pendingAmount
                                            ).toLocaleString()}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row m-0 bdr-btm-eee">
                                    <div className="col-lg-6 col-sm-6 p-0">
                                      <div class="row m-0">
                                        <div class="col-sm-4 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_h h-100">
                                            Payment Method
                                          </div>
                                        </div>
                                        <div class="col-sm-8 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={objMain.paymentMethod}>
                                            {objMain.paymentMethod}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-lg-6 col-sm-6 p-0">
                                      <div class="row m-0">
                                        <div class="col-sm-4 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                            Extra Remarks
                                          </div>
                                        </div>
                                        <div class="col-sm-8 align-self-stretch p-0">
                                          <div class="booking_inner_dtl_b h-100 bdr-left-eee" title={objMain.extraNotes}>
                                            {objMain.extraNotes}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="mb-2 mt-3 mul-booking-card-inner-head">
                                <b>Payment Receipt and Additional Documents:</b>
                              </div>

                              <div className="row">
                                {objMain.paymentReceipt &&
                                  objMain.paymentReceipt.length !== 0 && (
                                    <div className="col-sm-2 mb-1">
                                      <div className="booking-docs-preview">
                                        <div
                                          className="booking-docs-preview-img"
                                          onClick={() =>
                                            handleViewPdfReciepts(
                                              objMain.paymentReceipt[0]
                                                .filename,
                                              currentLeadform["Company Name"]
                                            )
                                          }
                                        >
                                          {/* {((objMain.paymentReceipt[0].filename).toLowerCase()).endsWith(
                                            ".pdf"
                                          ) ? (
                                            <PdfImageViewerAdmin
                                              type="paymentrecieptpdf"
                                              path={
                                                objMain.paymentReceipt[0]
                                                  .filename
                                              }
                                              companyName={
                                                currentLeadform["Company Name"]
                                              }
                                            />
                                          ) : (
                                            <img
                                              src={`${secretKey}/bookings/recieptpdf/${currentLeadform["Company Name"]}/${objMain.paymentReceipt[0].filename}`}
                                              alt={"MyImg"}
                                            ></img>
                                          )} */}
                                        </div>
                                        <div className="booking-docs-preview-text">
                                          <p className="booking-img-name-txtwrap text-wrap m-auto m-0">
                                            Receipt.pdf
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                {/* {objMain.otherDocs.map((obj) => (
                                  <div className="col-sm-2 mb-1">
                                    <div className="booking-docs-preview">
                                      <div
                                        className="booking-docs-preview-img"
                                        onClick={() =>
                                          handleViewPdOtherDocs(
                                            obj.filename,
                                            currentLeadform["Company Name"]
                                          )
                                        }
                                      >
                                        {((obj.filename).toLowerCase()).endsWith(".pdf") ? (
                                          <PdfImageViewerAdmin
                                            type="pdf"
                                            path={obj.filename}
                                            companyName={
                                              currentLeadform["Company Name"]
                                            }
                                          />
                                        ) : (
                                          <img
                                            src={`${secretKey}/bookings/otherpdf/${currentLeadform["Company Name"]}/${obj.filename}`}
                                            alt={pdfimg}
                                          ></img>
                                        )}
                                      </div>
                                      <div className="booking-docs-preview-text">
                                        <p
                                          className="booking-img-name-txtwrap text-wrap m-auto m-0"
                                          title={obj.originalname}
                                        >
                                          {obj.originalname}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))} */}

                                <div className="col-sm-2 mb-1">
                                  <div
                                    className="booking-docs-preview"
                                    title="Upload More Documents"
                                  >
                                    <div
                                      className="upload-Docs-BTN"
                                      onClick={() => {
                                        setOpenOtherDocs(true);
                                        setSendingIndex(index + 1);
                                      }}
                                    >
                                      <IoAdd />
                                    </div>
                                  </div>
                                </div>

                                <Dialog
                                  open={openOtherDocs}
                                  onClose={closeOtherDocsPopup}
                                  fullWidth
                                  maxWidth="sm"
                                >
                                  <DialogTitle>
                                    Upload Your Attachments
                                    <IconButton
                                      onClick={closeOtherDocsPopup}
                                      style={{ float: "right" }}
                                    >
                                      <CloseIcon color="primary"></CloseIcon>
                                    </IconButton>{" "}
                                  </DialogTitle>
                                  <DialogContent>
                                    <div className="maincon">
                                      {/* Single file input for multiple documents */}
                                      <div
                                        style={{
                                          justifyContent: "space-between",
                                        }}
                                        className="con1 d-flex"
                                      >
                                        <div
                                          style={{ paddingTop: "9px" }}
                                          className="uploadcsv"
                                        >
                                          <label
                                            style={{
                                              margin: "0px 0px 6px 0px",
                                            }}
                                            htmlFor="attachmentfile"
                                          >
                                            Upload Files
                                          </label>
                                        </div>
                                      </div>
                                      <div
                                        style={{ margin: "5px 0px 0px 0px" }}
                                        className="form-control"
                                      >
                                        <input
                                          type="file"
                                          name="attachmentfile"
                                          id="attachmentfile"
                                          onChange={(e) => {
                                            handleOtherDocsUpload(
                                              e.target.files
                                            );
                                          }}
                                          multiple // Allow multiple files selection
                                        />
                                        {selectedDocuments &&
                                          selectedDocuments.length > 0 && (
                                            <div className="uploaded-filename-main d-flex flex-wrap">
                                              {selectedDocuments.map(
                                                (file, index) => (
                                                  <div
                                                    className="uploaded-fileItem d-flex align-items-center"
                                                    key={index}
                                                  >
                                                    <p className="m-0">
                                                      {file.name}
                                                    </p>
                                                    <button
                                                      className="fileItem-dlt-btn"
                                                      onClick={() =>
                                                        handleRemoveFile(index)
                                                      }
                                                    >
                                                      <IconX className="close-icon" />
                                                    </button>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  </DialogContent>
                                  <button
                                    className="btn btn-primary"
                                    onClick={handleotherdocsAttachment}
                                  >
                                    Submit
                                  </button>
                                </Dialog>
                              </div>
                            </div>
                          </>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>}
        </div>
      )}

      {bookingFormOpen && (
        <>
          <AdminBookingForm
            // matured={true}
            // companysId={companyId}
            //setDataStatus={setdataStatus}
            setFormOpen={setBookingFormOpen}
            //companysName={companyName}
            // companysEmail={companyEmail}
            // companyNumber={companyNumber}
            setNowToFetch={setNowToFetch}
            IamAdmin={true}
          // companysInco={companyInco}
          // employeeName={data.ename}
          // employeeEmail={data.email}
          />
        </>
      )}
      {EditBookingOpen && bookingIndex !== -1 && (
        <>
          <EditableMoreBooking
            setFormOpen={setEditBookingOpen}
            bookingIndex={bookingIndex}
            isAdmin={isAdmin}
            setNowToFetch={setNowToFetch}
            companysName={currentLeadform["Company Name"]}
            companysEmail={currentLeadform["Company Email"]}
            companyNumber={currentLeadform["Company Number"]}
            companysInco={currentLeadform.incoDate}
            employeeName={currentLeadform.bdeName}
            employeeEmail={currentLeadform.bdeEmail}
          />
        </>
      )}
      {addFormOpen && (
        <>
          {" "}
          <AddLeadForm
            setFormOpen={setAddFormOpen}
            companysName={currentLeadform["Company Name"]}
            setNowToFetch={setNowToFetch}
            isAdmin={true}
          />
        </>
      )}

      {openListView && <>
        <RMofCertificationListViewBookings
          bookingsData={leadFormData}
        />
      </>}

      {/* -----------------------------------------------dialog box for adding services ------------------------------------------------------ */}


      <Dialog open={openServicesPopup} onClose={handleCloseServicesPopup} fullWidth maxWidth="xs">
        <DialogTitle>
          Select Services To Swap
          <IconButton onClick={handleCloseServicesPopup} style={{ float: "right" }}>
            <CloseIcon color="primary"></CloseIcon>
          </IconButton>{" "}
        </DialogTitle>
        <DialogContent>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-body">
                <div className="mb-3">
                  {serviceNames.length !== 0 && serviceNames.map((service, index) => (
                    <div key={index}>
                      <input
                        className="mr-1"
                        type="checkbox"
                        id={`service-${index}`}
                        name={service}
                        value={service}
                        //checked={serviceNames.includes(service)}
                        onChange={() => handleCheckboxChange(service)}
                      />
                      <label htmlFor={`service-${index}`}>{service}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        <Button variant="contained" style={{ backgroundColor: "#fbb900" }}
          onClick={handleSubmitServicesToSwap}>
          Submit
        </Button>
      </Dialog>

      {/* //------------------------------drawer for filter-------------------------------------- */}

      <Drawer
        style={{ top: "50px" }}
        anchor="left"
        open={openFilterDrawer}
        onClose={functionCloseFilterDrawer}
      >
        <div style={{ width: "31em" }}>
          <div className="d-flex justify-content-between align-items-center container-xl pt-2 pb-2">
            <h2 className="title m-0">
              Filters
            </h2>
            <div>
              <button style={{ background: "none", border: "0px transparent" }}
                onClick={() => functionCloseFilterDrawer()}
              >
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
                    <label for="exampleFormControlInput1" class="form-label">Service Name</label>
                    <select class="form-select form-select-md" aria-label="Default select example"
                      value={selectedServiceName}
                      onChange={(e) => {
                        setSelectedServiceName(e.target.value)
                      }}
                    >
                      <option selected value='Select Status'>Select Service</option>
                      {options.map((option, index) =>
                        <option key={index} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className='col-sm-12 mt-2'>
                  <div className='d-flex align-items-center justify-content-between'>
                    {/* <div className='form-group w-50 mr-1'>
                      <label for="exampleFormControlInput1" class="form-label">State</label>
                      <select class="form-select form-select-md" aria-label="Default select example"
                        value={selectedState}
                        onChange={(e) => {
                          setSelectedState(e.target.value)
                          setSelectedStateCode(stateList.filter(obj => obj.name === e.target.value)[0]?.isoCode);
                          setSelectedCity(City.getCitiesOfState("IN", stateList.filter(obj => obj.name === e.target.value)[0]?.isoCode))
                          //handleSelectState(e.target.value)
                        }}>
                        <option value=''>State</option>
                        {stateList.length !== 0 && stateList.map((item) => (
                          <option value={item.name}>{item.name}</option>
                        ))}
                      </select>
                    </div> */}
                    {/* <div className='form-group w-50'>
                      <label for="exampleFormControlInput1" class="form-label">City</label>
                      <select class="form-select form-select-md" aria-label="Default select example"
                        value={selectedNewCity}
                        onChange={(e) => {
                          setSelectedNewCity(e.target.value)
                        }}>
                        <option value="">City</option>
                        {selectedCity.lenth !== 0 && selectedCity.map((item) => (
                          <option value={item.name}>{item.name}</option>
                        ))}
                      </select>
                    </div> */}
                  </div>
                </div>
                <div className='col-sm-12 mt-2'>
                  <div className='form-group'>
                    <label for="exampleFormControlInput1" class="form-label">Select BDE</label>
                    <select class="form-select form-select-md" aria-label="Default select example"
                      value={selectedBdeName}
                      onChange={(e) => {
                        setSelectedBdeName(e.target.value)
                      }}
                    >
                      <option value=''>Select BDE</option>
                      {newEmpData && newEmpData.map((item) => (
                        <option value={item.ename}>{item.ename}</option>))}
                    </select>
                  </div>
                </div>
                <div className='col-sm-12 mt-2'>
                  <div className='form-group'>
                    <label for="exampleFormControlInput1" class="form-label">Select BDM</label>
                    <select class="form-select form-select-md" aria-label="Default select example"
                      value={selectedBdmName}
                      onChange={(e) => {
                        setselectedBdmName(e.target.value)
                      }}
                    >
                      <option value=''>Select BDM</option>
                      {bdmList && bdmList.map((item) => (
                        <option value={item.ename}>{item.ename}</option>))}
                    </select>
                  </div>
                </div>
                <div className='col-sm-12 mt-2'>
                  <label class="form-label">Booking Date</label>
                  <div className='row align-items-center justify-content-between'>
                    <div className='col form-group mr-1'>
                      <select class="form-select form-select-md" aria-label="Default select example"
                        value={selectedYear}
                        onChange={(e) => {
                          setSelectedYear(e.target.value)
                        }}>
                        <option value=''>Year</option>
                        {years.length !== 0 && years.map((item) => (
                          <option>{item}</option>
                        ))}
                      </select>
                    </div>
                    <div className='col form-group mr-1'>
                      <select class="form-select form-select-md" aria-label="Default select example"
                        value={selectedMonth}
                        disabled={selectedYear === ""}
                        onChange={(e) => {
                          setSelectedMonth(e.target.value)
                        }}>
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
                        onChange={(e) => setSelectedDate(e.target.value)}>
                        <option value=''>Date</option>
                        {daysInMonth.map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                {/* <div className='col-sm-12 mt-2'>
                  <label class="form-label">Booking Publish Date</label>
                  <div className='row align-items-center justify-content-between'>
                    <div className='col form-group mr-1'>
                      <select class="form-select form-select-md" aria-label="Default select example"
                        value={selectedYear}
                        onChange={(e) => {
                          setSelectedYear(e.target.value)
                        }}>
                        <option value=''>Year</option>
                        {years.length !== 0 && years.map((item) => (
                          <option>{item}</option>
                        ))}
                      </select>
                    </div>
                    <div className='col form-group mr-1'>
                      <select class="form-select form-select-md" aria-label="Default select example"
                        value={selectedMonth}
                        disabled={selectedYear === ""}
                        onChange={(e) => {
                          setSelectedMonth(e.target.value)
                        }}>
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
                        onChange={(e) => setSelectedDate(e.target.value)}>
                        <option value=''>Date</option>
                        {daysInMonth.map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div> */}
                {/* <div className='col-sm-12 mt-2'>
                  <div className='form-group'>
                    <label for="Uploadedby" class="form-label">Uploaded By</label>
                    <input type="text" class="form-control" id="Uploadedby" placeholder="Enter Name"
                    //value={selectedAdminName}
                    // onChange={(e) => {
                    //     setSelectedAdminName(e.target.value)}} 
                    />
                  </div>
                </div> */}
                {/* <div className='col-sm-12 mt-2'>
                  <div className='form-group'>
                    <label for="Uploadon" class="form-label">Uploaded On</label>
                    <input type="date" class="form-control" id="Uploadon"
                      value={selectedUploadedDate}
                      defaultValue={null}
                      placeholder="dd-mm-yyyy"
                    onChange={(e) => setSelectedUploadedDate(e.target.value)} 
                    />
                  </div>
                </div> */}
              </div>
            </div>
          </div>
          <div className="footer-Drawer d-flex justify-content-between align-items-center">
            <button className='filter-footer-btn btn-clear' onClick={handleClearFilter}>Clear Filter</button>
            <button className='filter-footer-btn btn-yellow' onClick={handleFilterData}>Apply Filter</button>
          </div>
        </div>
      </Drawer>


    </div>
  );
}

export default RmofCertificationBookings;
