import React, { useState, useEffect } from 'react';
import Header from '../Components/Header/Header.jsx'
import Navbar from '../Components/Navbar/Navbar.jsx';
import { useParams } from "react-router-dom";
import axios from 'axios';
import Nodata from '../../components/Nodata.jsx';
import { MdModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { IoAdd } from "react-icons/io5";
import CloseIcon from "@mui/icons-material/Close";
import { IconX } from "@tabler/icons-react";
import EditableMoreBooking from '../../admin/EditableMoreBooking.jsx';
import AddLeadForm from '../../admin/AddLeadForm.jsx';
import pdfimg from "../../static/my-images/pdf.png"
import { FcList } from "react-icons/fc";
import wordimg from "../../static/my-images/word.png";
import RemainingAmnt from "../../static/my-images/money.png";
import Swal from "sweetalert2";
import { Button, Dialog, DialogContent, DialogTitle, IconButton, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import PdfImageViewerAdmin from '../../admin/PdfViewerAdmin.jsx';

function BdmBookings() {

  const { userId } = useParams();
  const secretKey = process.env.REACT_APP_SECRET_KEY;
  const frontendKey = process.env.REACT_APP_FRONTEND_KEY;
  // console.log(userId);

  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [fetch, setFetch] = useState(false);

  useEffect(() => {
    document.title = `Floor-Manager-Sahay-CRM`;
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${secretKey}/employee/einfo`);
      // Set the retrieved data in the state
      const tempData = response.data;
      //console.log("tempData:", tempData); // Log tempData to check its content
      const userData = response.data.find((item) => item._id === userId);
      //console.log("userData:", userData); // Log userData to check if it's null or contains the expected data
      setData(userData);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  // console.log("data:", data); // Log data to see if it's updated after fetching

  useEffect(() => {
    fetchData();
  }, [userId]);

  const [formData, setFormData] = useState([]);
  const [openBooking, setOpenBooking] = useState(false);
  const [infiniteBooking, setInfiniteBooking] = useState([]);
  const [activeIndexBooking, setActiveIndexBooking] = useState(0);

  const fetchRedesignedFormData1 = async () => {
    try {
      const response = await axios.get(`${secretKey}/bookings/redesigned-final-leadData`);
      const sortedData = response.data.sort((a, b) => {
        const dateA = new Date(a.lastActionDate);
        const dateB = new Date(b.lastActionDate);
        return dateB - dateA; // Sort in descending order
      });
      const redesignedData = sortedData.filter((obj) => obj.bdeName === data.ename || obj.bdmName === data.ename || (obj.moreBookings.length !== 0 && obj.moreBookings.some((boom) => boom.bdeName === data.ename || boom.bdmName === data.ename)));
      setFormData(redesignedData);
      setInfiniteBooking(redesignedData);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  useEffect(() => {
    fetchRedesignedFormData1();
  }, [data.ename]);

  useEffect(() => {
    setFormData(infiniteBooking.filter((obj) => obj["Company Name"].toLowerCase().includes(searchText.toLowerCase())));
  }, [searchText]);

  const [currentCompanyName, setCurrentCompanyName] = useState("");

  useEffect(() => {
    if (currentCompanyName === "") {
      setCurrentLeadform(formData[0]);
      setActiveIndexBooking(1);
    } else {
      setCurrentLeadform(formData.find(obj => obj["Company Name"] === currentCompanyName));
    }
  }, [formData]);

  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [sendingIndex, setSendingIndex] = useState(0);
  const [open, openchange] = useState(false);
  const [EditBookingOpen, setEditBookingOpen] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [currentLeadform, setCurrentLeadform] = useState(null);
  const [nowToFetch, setNowToFetch] = useState(false);
  //const [bookingIndex, setbookingIndex] = useState(-1);
  const [openOtherDocs, setOpenOtherDocs] = useState(false);
  const [companyName, setCompanyName] = useState("");

  function formatDatePro(inputDate) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = new Date(inputDate).toLocaleDateString("en-US", options);
    return formattedDate;
  }

  const formatTime = (dateString) => {
    //const dateString = "Sat Jun 29 2024 15:15:12 GMT+0530 (India Standard Time)";
    const date = new Date(dateString);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;

    const strTime = `${hours}:${minutes} ${ampm}`;
    return strTime;
  };

  const calculateTotalAmount = (obj) => {
    let total = Number(obj.totalAmount);
    if (obj.moreBookings && obj.moreBookings.length > 0) {
      total += obj.moreBookings.reduce((acc, booking) => acc + Number(booking.totalAmount), 0);
    }
    return total.toFixed(2);
  };

  const calculateReceivedAmount = (obj) => {
    let received = Number(obj.receivedAmount);
    if (obj.moreBookings && obj.moreBookings.length > 0) {
      received += obj.moreBookings.reduce((acc, booking) => acc + Number(booking.receivedAmount), 0);
    }
    return received.toFixed(2);
  };

  const calculatePendingAmount = (obj) => {
    let pending = Number(obj.pendingAmount);
    if (obj.moreBookings && obj.moreBookings.length > 0) {
      pending += obj.moreBookings.reduce((acc, booking) => acc + Number(booking.pendingAmount), 0);
    }
    return pending.toFixed(2);
  };

  const getOrdinal = (number) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const lastDigit = number % 10;
    const suffix = suffixes[lastDigit <= 3 ? lastDigit : 0];
    return `${number}${suffix}`;
  };

  // console.log("currentLeadForm", currentLeadform)

  const handleRequestDelete = async (Id, companyID, companyName, index) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to send a delete request. Are you sure you want to proceed?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, proceed!",
      cancelButtonText: "No, cancel",
    });

    if (confirmDelete.isConfirmed) {
      try {
        const sendingData = {
          companyName,
          Id,
          companyID,
          time: new Date().toLocaleTimeString(),
          date: new Date().toLocaleDateString(),
          ename: data.ename,
          bookingIndex: index // Replace 'Your Ename Value' with the actual value
        };

        // const response = await fetch(`${secretKey}/deleterequestbybde`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify(sendingData),
        // });

        const response = await axios.post(`${secretKey}/requests/deleterequestbybde`, sendingData);
        Swal.fire({ title: "Delete Request Sent", icon: "success" });
        // Log the response message
      } catch (error) {
        Swal.fire({ title: "Request Already Exists!", icon: "error" });
        console.error("Error creating delete request:", error);
        // Handle the error as per your application's requirements
      }
    } else {
      console.log("No, cancel");
    }
  };

  const [currentForm, setCurrentForm] = useState(null);
  const [bookingIndex, setBookingIndex] = useState(0);
  const [editMoreOpen, setEditMoreOpen] = useState(false);

  const handleEditClick = async (company, index) => {
    try {
      const response = await axios.get(`${secretKey}/bookings/redesigned-final-leadData`);
      const data = response.data.find((obj) => obj.company === company);
      setCurrentForm(data);
      setBookingIndex(index)
      setEditMoreOpen(true)
      // setOpenBooking(true);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const handleOpenEditForm = () => {
    setOpenBooking(false);
    setEditMoreOpen(true);
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

  const [selectedDocuments, setSelectedDocuments] = useState([]);

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

  const handleotherdocsAttachment = async () => {
    try {
      const files = selectedDocuments;
      // console.log(files);

      if (files.length === 0) {
        // No files selected
        return;
      }

      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("otherDocs", files[i]);
      }
      // console.log(currentLeadform["Company Name"], sendingIndex);
      setCurrentCompanyName(currentLeadform["Company Name"])

      const response = await axios.post(`${secretKey}/bookings/uploadotherdocsAttachment/${currentLeadform["Company Name"]}/${sendingIndex}`, formData);
      Swal.fire({
        title: "Success!",
        html: `<small> File Uploaded successfully </small>`,
        icon: "success",
      });
      setSelectedDocuments([]);
      setOpenOtherDocs(false);
      fetchRedesignedFormData1();
    } catch (error) {
      Swal.fire({
        title: "Error uploading file",
        icon: "error",
      });
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div>
      {/* <Header id={data._id} name={data.ename} empProfile={data.profilePhoto && data.profilePhoto.length !== 0 && data.profilePhoto[0].filename} gender={data.gender} designation={data.newDesignation} />
      <Navbar userId={userId} /> */}
      {!bookingFormOpen && !EditBookingOpen && !addFormOpen && !editMoreOpen && (
        <div className="booking-list-main">
          <div className="booking_list_Filter">
            <div className="container-xl">
              <div className="row justify-content-between">
                <div className="col-2">
                  <div class="my-2 my-md-0 flex-grow-1 flex-md-grow-0 order-first order-md-last">
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
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container-xl">
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
                      {formData.length !== 0 && formData.map((obj, index) => (
                        <div className={currentLeadform && currentLeadform["Company Name"] === obj["Company Name"]
                          ? "bookings_Company_Name activeBox"
                          : "bookings_Company_Name"
                        } onClick={() => {
                          const allBookings = [obj, ...obj.moreBookings];

                          // Find the latest booking by comparing booking dates
                          const latestBooking = allBookings.reduce((latest, current) => {
                            const latestDate = new Date(latest.bookingDate);
                            const currentDate = new Date(current.bookingDate);
                            return currentDate > latestDate ? current : latest;
                          });
                          // console.log(latestBooking);
                          setFetch(true);
                          setCurrentLeadform(formData.find((data) => data["Company Name"] === obj["Company Name"]));
                          setActiveIndexBooking(allBookings.indexOf(latestBooking) + 1); // This will now set the active index to the latest booking
                        }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="b_cmpny_name cName-text-wrap">
                              {obj["Company Name"]}
                            </div>
                            <div className="b_cmpny_time">
                              {formatDatePro(obj.moreBookings && obj.moreBookings.length !== 0
                                ? obj.moreBookings[obj.moreBookings.length - 1].bookingDate // Get the latest bookingDate from moreBookings
                                : obj.bookingDate   // Use obj.bookingDate if moreBookings is empty or not present
                              )}
                            </div>
                          </div>

                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <div className="b_Services_name d-flex flex-wrap">
                              {(obj.services.length !== 0 ||
                                (obj.moreBookings && obj.moreBookings.length !== 0)) &&
                                [...obj.services, ...(obj.moreBookings || []).map((booking) => booking.services)]
                                  .flat()
                                  .slice(0, 3) // Limit to first 3 services
                                  .map((service, index, array) => (
                                    <>
                                      <div className="sname mb-1" key={service.serviceId}>
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
                                <div className="b_Services_multipal_services" title="Multipal Bookings">
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
                                Receive: ₹ {parseInt(calculateReceivedAmount(obj)).toLocaleString()}
                              </div>
                              <div className="amount pending_amount_bg">
                                Pending: ₹ {parseInt(calculatePendingAmount(obj)).toLocaleString()}
                              </div>
                            </div>
                            <div className="b_BDE_name">
                              {obj.bdeName}
                            </div>
                          </div>
                        </div>
                      ))}

                      {formData.length === 0 && (
                        <div className="d-flex align-items-center justify-content-center" style={{ height: "inherit" }}>
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
                          {currentLeadform && Object.keys(currentLeadform).length !== 0
                            ? currentLeadform["Company Name"]
                            : formData && formData.length !== 0 ? formData[0]["Company Name"] : "-"}
                        </div>
                        <div className="bookings_add_more" title="Add More Booking" onClick={() => setAddFormOpen(true)}>
                          <FaPlus />
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
                                    {currentLeadform && Object.keys(currentLeadform).length !== 0
                                      ? currentLeadform["Company Name"]
                                      : formData && formData.length !== 0 ? formData[0]["Company Name"] : "-"}
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
                                    {currentLeadform && Object.keys(currentLeadform).length !== 0
                                      ? currentLeadform["Company Email"]
                                      : formData && formData.length !== 0 ? formData[0]["Company Email"] : "-"}
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
                                    {currentLeadform && Object.keys(currentLeadform).length !== 0
                                      ? currentLeadform["Company Number"]
                                      : formData && formData.length !== 0 ? formData[0]["Company Number"] : "-"}
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
                                    {currentLeadform && formatDatePro(Object.keys(currentLeadform).length !== 0
                                      ? currentLeadform.incoDate
                                      : formData && formData.length !== 0 ? formData[0].incoDate : "-"
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
                                    {currentLeadform && Object.keys(currentLeadform).length !== 0
                                      ? currentLeadform.panNumber
                                      : formData && formData.length !== 0 ? formData[0].panNumber : "-"}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* <div className="col-lg-3 col-sm-6 p-0 align-self-stretch">
                              <div class="row m-0 h-100">
                                <div class="col-sm-4 align-self-stretch p-0">
                                  <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                    GST
                                  </div>
                                </div>
                                <div class="col-sm-8 align-self-stretch p-0">
                                  <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                    {currentLeadform &&
                                    Object.keys(currentLeadform).length !== 0
                                      ? currentLeadform.gstNumber
                                      : leadFormData &&
                                        leadFormData.length !== 0
                                      ? leadFormData[0].gstNumber
                                      : "-"}
                                  </div>
                                </div>
                              </div>
                            </div> */}
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
                                    ₹ {calculateTotalAmount(currentLeadform)}
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
                                    ₹ {calculateReceivedAmount(currentLeadform)}
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
                                    ₹ {calculatePendingAmount(currentLeadform)}
                                  </div>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* --------If Multipal Booking (Bookign heading) ---------*/}
                      <div className="rm_all_bkng_right mt-3">
                        <ul className="nav nav-tabs rm_bkng_items align-items-center">

                          {currentLeadform && currentLeadform.moreBookings && currentLeadform.moreBookings.length !== 0 ? (
                            <>
                              <li className="nav-item rm_bkng_item_no">
                                <a className={activeIndexBooking === 1 ? "nav-link active" : "nav-link"}
                                  data-bs-toggle="tab" href="#Booking_1" onClick={() => setActiveIndexBooking(1)}>
                                  Booking 1
                                </a>
                              </li>

                              {currentLeadform.moreBookings.map((obj, index) => (
                                <li key={index} className="nav-item rm_bkng_item_no">
                                  <a className={index + 2 === activeIndexBooking ? "nav-link active" : "nav-link"}
                                    data-bs-toggle="tab" href={`#Booking_${index + 2}`} onClick={() => setActiveIndexBooking(index + 2)}>
                                    Booking {index + 2}
                                  </a>
                                </li>
                              )
                              )}

                              {activeIndexBooking === 1 && currentLeadform.bookingPublishDate ? (
                                <li className="nav-item rm_bkng_item_no ms-auto">
                                  <div className="rm_bkng_item_no nav-link clr-ff8800">
                                    <span style={{ color: "#797373", marginRight: "2px" }}>
                                      {"Publish On : "}
                                    </span>
                                    {formatDatePro(currentLeadform.bookingPublishDate)}{" "} at{" "} {formatTime(currentLeadform.bookingPublishDate)}
                                  </div>
                                </li>
                              ) : (
                                currentLeadform.moreBookings && currentLeadform.moreBookings.map((obj, index) =>
                                  index + 2 === activeIndexBooking && obj.bookingPublishDate && (
                                    <li key={index} className="nav-item rm_bkng_item_no ms-auto">
                                      <div className="rm_bkng_item_no nav-link clr-ff8800">
                                        <span style={{ color: "#797373", marginRight: "2px" }}>
                                          {"Publish On : "}
                                        </span>
                                        {formatDatePro(obj.bookingPublishDate)}{" "}at{" "}{formatTime(obj.bookingPublishDate)}
                                      </div>
                                    </li>
                                  ))
                              )}
                            </>
                          ) : (
                            <>
                              <li className="nav-item rm_bkng_item_no">
                                <a className={activeIndexBooking === 1 ? "nav-link active" : "nav-link"}
                                  data-bs-toggle="tab" href="#Booking_1" onClick={() => setActiveIndexBooking(1)}>
                                  Booking 1
                                </a>
                              </li>

                              <li className="nav-item rm_bkng_item_no ms-auto">
                                <div className="rm_bkng_item_no nav-link clr-ff8800">
                                  <span style={{ color: "#797373", marginRight: "2px" }}>
                                    {"Publish On : "}
                                  </span>
                                  {currentLeadform && currentLeadform.bookingPublishDate
                                    ? `${formatDatePro(currentLeadform.bookingPublishDate)} at ${formatTime(currentLeadform.bookingPublishDate)}`
                                    : "No Date Available"}
                                </div>
                              </li>
                            </>
                          )}
                        </ul>

                        <div className="tab-content rm_bkng_item_details">
                          {/* -------- Booking Details ---------*/}
                          {currentLeadform && (
                            <div className={`tab-pane fade rm_bkng_item_detail_inner ${activeIndexBooking === 1 ? "show active" : ""}`} id="Booking_1">
                              <div className="mul-booking-card mt-2">

                                {/* -------- Step 2 ---------*/}
                                <div className="mb-2 mul-booking-card-inner-head d-flex justify-content-between">
                                  <b>Booking Details:</b>
                                  <div className="Services_Preview_action d-flex">
                                    <div className="Services_Preview_action_edit mr-1" onClick={() => handleEditClick(currentLeadform._id, 0)}>
                                      <MdModeEdit />
                                    </div>
                                    <div className="Services_Preview_action_delete"
                                      onClick={() =>
                                        handleRequestDelete(currentLeadform._id, currentLeadform.company, currentLeadform["Company Name"], 0)
                                      }
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
                                              {currentLeadform && currentLeadform.bdeName}
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
                                              {currentLeadform && currentLeadform.bdeEmail}
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
                                                <i>{currentLeadform && currentLeadform.bdmType === "Close-by" ? "Closed-by" : "Supported-by"}</i>
                                              </span>{" "}
                                              {currentLeadform && currentLeadform.bdmName}
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
                                              {currentLeadform && currentLeadform.bdmEmail}
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
                                              {currentLeadform && currentLeadform.bookingDate}
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
                                              {currentLeadform && (currentLeadform.bookingSource === "Other"
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
                                              {currentLeadform && currentLeadform.services.length}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {currentLeadform && currentLeadform.services.map((obj, index) => (
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
                                                {obj.withDSC && obj.serviceName === "Start-Up India Certificate" && "With DSC"}
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
                                                ₹{" "}{parseInt(obj.totalPaymentWGST).toLocaleString()}{" "}{"("}
                                                {obj.totalPaymentWGST !== obj.totalPaymentWOGST ? "With GST" : "Without GST"}{")"}
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
                                                Payment Terms
                                              </div>
                                            </div>
                                            <div class="col-sm-8 align-self-stretch p-0">
                                              <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                {obj.paymentTerms === "two-part" ? "Part Payment" : "Full Advanced"}
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="col-lg-6 col-sm-6 p-0">
                                          <div class="row m-0">
                                            <div class="col-sm-4 align-self-stretch p-0">
                                              <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                Notes
                                              </div>
                                            </div>
                                            <div class="col-sm-8 align-self-stretch p-0">
                                              <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={obj.paymentRemarks ? obj.paymentRemarks : "N/A"}>
                                                {obj.paymentRemarks ? obj.paymentRemarks : "N/A"}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {obj.expanse !== 0 && obj.expanse && (
                                        <div className="row m-0 bdr-btm-eee">
                                          <div className="col-lg-6 col-sm-2 p-0">
                                            <div class="row m-0">
                                              <div class="col-sm-4 align-self-stretch p-0">
                                                <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                  Expense
                                                </div>
                                              </div>
                                              <div class="col-sm-8 align-self-stretch p-0">
                                                <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                  - ₹{" "}{obj.expanse ? obj.expanse.toLocaleString() : "N/A"}
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
                                        </div>
                                      )}

                                      <div className="row m-0 bdr-btm-eee">
                                        {obj.firstPayment !== 0 && (
                                          <div className="col-lg-6 col-sm-6 p-0">
                                            <div class="row m-0">
                                              <div class="col-sm-4 align-self-stretch p-0">
                                                <div class="booking_inner_dtl_h h-100">
                                                  First payment
                                                </div>
                                              </div>
                                              <div class="col-sm-8 align-self-stretch p-0">
                                                <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                  ₹{" "}{parseInt(obj.firstPayment).toLocaleString()}
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
                                                  ₹ {parseInt(obj.secondPayment).toLocaleString()}{"("}
                                                  {isNaN(new Date(obj.secondPaymentRemarks))
                                                    ? obj.secondPaymentRemarks
                                                    : "On " + obj.secondPaymentRemarks + ")"}
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
                                                  ₹{" "}{parseInt(obj.thirdPayment).toLocaleString()}{"("}
                                                  {isNaN(new Date(obj.thirdPaymentRemarks))
                                                    ? obj.thirdPaymentRemarks
                                                    : "On " + obj.thirdPaymentRemarks + ")"}
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
                                                  ₹{" "}{parseInt(obj.fourthPayment).toLocaleString()}{"("}
                                                  {isNaN(new Date(obj.fourthPaymentRemarks))
                                                    ? obj.fourthPaymentRemarks
                                                    : "On " + obj.fourthPaymentRemarks + ")"}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Remaining Payment Viwe Sections */}
                                    {currentLeadform.remainingPayments.length !== 0 && currentLeadform.remainingPayments.some((boom) => boom.serviceName === obj.serviceName) &&
                                      <div className="my-card-body accordion" id={`accordionExample${index}`}>
                                        <div class="accordion-item bdr-none">

                                          <div id={`headingOne${index}`} className="pr-10 accordion-header">
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
                                            {currentLeadform.remainingPayments.length !== 0 && currentLeadform.remainingPayments.filter(boom => boom.serviceName === obj.serviceName).map((paymentObj, index) =>
                                              paymentObj.serviceName === obj.serviceName ? (
                                                <div class="accordion-body bdr-none p-0">
                                                  <div>
                                                    <div className="row m-0 bdr-btm-eee bdr-top-eee">
                                                      <div className="col-lg-12 col-sm-6 p-0 align-self-stretc bg-fffafa">
                                                        <div class="booking_inner_dtl_h h-100 d-flex align-items-center justify-content-between">
                                                          <div>
                                                            {currentLeadform.remainingPayments.length !== 0 && (() => {
                                                              if (index === 0) return "Second ";
                                                              else if (index === 1) return "Third ";
                                                              else if (index === 2) return "Fourth ";
                                                              return ""; // Return default value if none of the conditions match
                                                            })()}
                                                            Remaining Payment
                                                          </div>
                                                          <div>
                                                            {"(" + formatDatePro(paymentObj.publishDate ? paymentObj.publishDate : paymentObj.paymentDated) + ")"}
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>

                                                    <div className="row m-0 bdr-btm-eee">
                                                      <div className="col-lg-2 col-sm-6 p-0 align-self-stretc">
                                                        <div class="row m-0 h-100">
                                                          <div class="col-sm-5 align-self-stretc p-0">
                                                            <div class="booking_inner_dtl_h h-100">
                                                              Amount
                                                            </div>
                                                          </div>
                                                          <div class="col-sm-7 align-self-stretc p-0">
                                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                              ₹{" "}{paymentObj.receivedPayment.toLocaleString()}
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>

                                                      <div className="col-lg-2 col-sm-6 p-0 align-self-stretc">
                                                        <div class="row m-0 h-100">
                                                          <div class="col-sm-5 align-self-stretc p-0">
                                                            <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                              Pending
                                                            </div>
                                                          </div>
                                                          <div class="col-sm-7 align-self-stretc p-0">
                                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                              ₹{" "}{currentLeadform.remainingPayments.length !== 0 && (() => {
                                                                const filteredPayments = currentLeadform.remainingPayments.filter((pay) => pay.serviceName === obj.serviceName);
                                                                const filteredLength = filteredPayments.length;
                                                                if (index === 0) return parseInt(obj.totalPaymentWGST) - parseInt(obj.firstPayment) - parseInt(paymentObj.receivedPayment);
                                                                else if (index === 1) return parseInt(obj.totalPaymentWGST) - parseInt(obj.firstPayment) - parseInt(paymentObj.receivedPayment) - parseInt(filteredPayments[0].receivedPayment);
                                                                else if (index === 2) return parseInt(currentLeadform.pendingAmount);
                                                                return ""; // Return default value if none of the conditions match
                                                              })()}
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
                                                              {formatDatePro(paymentObj.paymentDate)}
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>

                                                    <div className="row m-0 bdr-btm-eee">
                                                      <div className="col-lg-5 col-sm-6 p-0 align-self-stretc">
                                                        <div class="row m-0 h-100">
                                                          <div class="col-sm-5 align-self-stretc p-0">
                                                            <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                              Payment Method
                                                            </div>
                                                          </div>
                                                          <div class="col-sm-7 align-self-stretc p-0">
                                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={paymentObj.paymentMethod}>
                                                              {paymentObj.paymentMethod}
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>

                                                      <div className="col-lg-3 col-sm-4 p-0 align-self-stretc">
                                                        <div class="row m-0 h-100">
                                                          <div class="col-sm-6 align-self-stretc p-0">
                                                            <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                              Extra Remarks
                                                            </div>
                                                          </div>
                                                          <div class="col-sm-6 align-self-stretc p-0">
                                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={paymentObj.extraRemarks}>
                                                              {paymentObj.extraRemarks}
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
                                              {currentLeadform && currentLeadform.caCase}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {currentLeadform && currentLeadform.caCase !== "No" && (
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
                                                {currentLeadform && currentLeadform.caNumber}
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
                                                {currentLeadform && currentLeadform.caEmail}
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
                                                ₹{" "}{currentLeadform && currentLeadform.caCommission}
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
                                      <div className="col-lg-4 col-sm-6 p-0 align-self-stretch">
                                        <div class="row m-0 h-100">
                                          <div class="col-sm-5 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                              Total Amount
                                            </div>
                                          </div>
                                          <div class="col-sm-7 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                              ₹{" "} {currentLeadform && parseInt(currentLeadform.totalAmount).toLocaleString()}
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
                                              ₹{" "}{currentLeadform && parseInt(currentLeadform.receivedAmount).toLocaleString()}
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
                                              ₹{" "}{currentLeadform && parseInt(currentLeadform.pendingAmount).toLocaleString()}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="row m-0 bdr-btm-eee">
                                      <div className="col-lg-6 col-sm-6 p-0 align-self-stretch">
                                        <div class="row m-0 h-100">
                                          <div class="col-sm-4 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_h h-100">
                                              Payment Method
                                            </div>
                                          </div>
                                          <div class="col-sm-8 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={currentLeadform && currentLeadform.paymentMethod}>
                                              {currentLeadform && currentLeadform.paymentMethod}
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
                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={currentLeadform && currentLeadform.extraNotes}>
                                              {currentLeadform && currentLeadform.extraNotes}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {currentLeadform && (currentLeadform.paymentReceipt.length !== 0 || currentLeadform.otherDocs !== 0) && (
                                  <>
                                    <div className="mb-2 mt-3 mul-booking-card-inner-head">
                                      <b>Payment Receipt and Additional Documents:</b>
                                    </div>

                                    <div className="row">
                                      {currentLeadform.paymentReceipt.length !== 0 && (
                                        <div className="col-sm-2 mb-1">
                                          <div className="booking-docs-preview">
                                            <div className="booking-docs-preview-img"
                                              onClick={() =>
                                                handleViewPdfReciepts(currentLeadform.paymentReceipt[0].filename, currentLeadform["Company Name"])
                                              }
                                            >
                                              {currentLeadform && currentLeadform.paymentReceipt[0] && (currentLeadform.paymentReceipt[0].filename.endsWith(".pdf") ? (
                                                <PdfImageViewerAdmin
                                                  type="paymentrecieptpdf"
                                                  path={currentLeadform.paymentReceipt[0].filename}
                                                  companyName={currentLeadform["Company Name"]}
                                                />
                                              ) : currentLeadform.paymentReceipt[0].filename.endsWith(".png") ||
                                                currentLeadform.paymentReceipt[0].filename.endsWith(".jpg") ||
                                                currentLeadform.paymentReceipt[0].filename.endsWith(".jpeg") ? (
                                                <img
                                                  src={`${secretKey}/bookings/recieptpdf/${currentLeadform["Company Name"]}/${currentLeadform.paymentReceipt[0].filename}`}
                                                  alt="Receipt Image"
                                                />
                                              ) : (
                                                <img src={wordimg} alt="Default Image" />
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

                                      {currentLeadform.remainingPayments.length !== 0 && currentLeadform.remainingPayments.some((obj) => obj.paymentReceipt.length !== 0) &&
                                        currentLeadform.remainingPayments.map((remainingObject, index) => remainingObject.paymentReceipt.length !== 0 && (
                                          <div className="col-sm-2 mb-1" key={index}>
                                            <div className="booking-docs-preview">
                                              <div className="booking-docs-preview-img"
                                                onClick={() =>
                                                  handleViewPdfReciepts(remainingObject.paymentReceipt[0].filename, currentLeadform["Company Name"])
                                                }
                                              >
                                                {remainingObject.paymentReceipt[0].filename.toLowerCase().endsWith(".pdf") ? (
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
                                        )}

                                      {currentLeadform && currentLeadform.otherDocs.map((obj) => (
                                        <div className="col-sm-2 mb-1">
                                          <div className="booking-docs-preview">

                                            <div className="booking-docs-preview-img"
                                              onClick={() =>
                                                handleViewPdOtherDocs(obj.filename, currentLeadform["Company Name"])
                                              }
                                            >
                                              {obj.filename.endsWith(".pdf") ? (
                                                <PdfImageViewerAdmin
                                                  type="pdf"
                                                  path={obj.filename}
                                                  companyName={currentLeadform["Company Name"]}
                                                />
                                              ) : (
                                                <img
                                                  src={`${secretKey}/bookings/otherpdf/${currentLeadform["Company Name"]}/${obj.filename}`}
                                                  alt={pdfimg}
                                                ></img>
                                              )}
                                            </div>

                                            <div className="booking-docs-preview-text">
                                              <p className="booking-img-name-txtwrap text-wrap m-auto m-0 text-wrap m-auto m-0" title={obj.originalname}>
                                                {obj.originalname}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}

                                      <div className="col-sm-2 mb-1">
                                        <div className="booking-docs-preview" title="Upload More Documents">
                                          <div className="upload-Docs-BTN"
                                            onClick={() => {
                                              setOpenOtherDocs(true);
                                              setSendingIndex(0);
                                            }}
                                          >
                                            <IoAdd />
                                          </div>
                                        </div>
                                      </div>

                                      <Dialog fullWidth maxWidth="sm" open={openOtherDocs} onClose={closeOtherDocsPopup}>
                                        <DialogTitle>
                                          Upload Your Attachments
                                          <IconButton onClick={closeOtherDocsPopup} style={{ float: "right" }}>
                                            <CloseIcon color="primary"></CloseIcon>
                                          </IconButton>{" "}
                                        </DialogTitle>
                                        <DialogContent>
                                          <div className="maincon">

                                            <div style={{ justifyContent: "space-between" }} className="con1 d-flex">
                                              <div style={{ paddingTop: "9px" }} className="uploadcsv">
                                                <label style={{ margin: "0px 0px 6px 0px" }} htmlFor="attachmentfile">
                                                  Upload Files
                                                </label>
                                              </div>
                                            </div>

                                            <div style={{ margin: "5px 0px 0px 0px" }} className="form-control">
                                              <input
                                                type="file"
                                                name="attachmentfile"
                                                id="attachmentfile"
                                                onChange={(e) => handleOtherDocsUpload(e.target.files)}
                                                multiple
                                              />
                                              {selectedDocuments && selectedDocuments.length > 0 && (
                                                <div className="uploaded-filename-main d-flex flex-wrap">
                                                  {selectedDocuments.map((file, index) => (
                                                    <div className="uploaded-fileItem d-flex align-items-center" key={index}>
                                                      <p className="m-0">
                                                        {file.name}
                                                      </p>
                                                      <button className="fileItem-dlt-btn" onClick={() => handleRemoveFile(index)}>
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

                                        <button className="btn btn-primary" onClick={handleotherdocsAttachment}>
                                          Submit
                                        </button>
                                      </Dialog>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {/* ------------------------------------------ Multiple Booking Section Starts here ----------------------------- */}
                          {currentLeadform && currentLeadform.moreBookings.length !== 0 && currentLeadform.moreBookings.map((objMain, index) => (
                            <>
                              <div key={index + 2} className={`tab-pane fade rm_bkng_item_detail_inner ${activeIndexBooking === index + 2 ? "show active" : ""}`} id={`Booking_${index + 2}`}>

                                <div className="mul-booking-card mt-2">
                                  {/* -------- Step 2 ---------*/}
                                  <div className="mb-2 mul-booking-card-inner-head d-flex justify-content-between">
                                    <b>Booking Details:</b>
                                    <div className="Services_Preview_action d-flex">
                                      <div className="Services_Preview_action_edit mr-2" onClick={() => handleEditClick(currentLeadform._id, index + 1)}>
                                        <MdModeEdit />
                                      </div>
                                      <div onClick={() => handleRequestDelete(currentLeadform._id, currentLeadform.company, currentLeadform["Company Name"], index + 1)} className="Services_Preview_action_delete">
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
                                                {objMain.bookingSource === "Other" ? objMain.otherBookingSource : objMain.bookingSource}
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
                                                  {getOrdinal(index + 1)} Services Name
                                                </div>
                                              </div>
                                              <div class="col-sm-8 align-self-stretch p-0">
                                                <div class="booking_inner_dtl_b bdr-left-eee h-100 services-name">
                                                  {obj.serviceName}{" "}
                                                  {obj.withDSC && obj.serviceName === "Start Up Certificate" && "With DSC"}
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
                                                  ₹{" "}{parseInt(obj.totalPaymentWGST).toLocaleString()}{"("}
                                                  {obj.totalPaymentWGST !== obj.totalPaymentWOGST ? "With GST" : "Without GST"}{")"}
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

                                          <div className="col-lg-6 col-sm-6 p-0">
                                            <div class="row m-0">
                                              <div class="col-sm-4 align-self-stretch p-0">
                                                <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                  Notes
                                                </div>
                                              </div>
                                              <div class="col-sm-8 align-self-stretch p-0">
                                                <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={obj.paymentRemarks ? obj.paymentRemarks : "N/A"}>
                                                  {obj.paymentRemarks ? obj.paymentRemarks : "N/A"}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="row m-0 bdr-btm-eee">
                                          {obj.firstPayment !== 0 && (
                                            <div className="col-lg-6 col-sm-6 p-0">
                                              <div class="row m-0">
                                                <div class="col-sm-4 align-self-stretch p-0">
                                                  <div class="booking_inner_dtl_h h-100">
                                                    First payment
                                                  </div>
                                                </div>
                                                <div class="col-sm-8 align-self-stretch p-0">
                                                  <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                    ₹{" "} {parseInt(obj.firstPayment).toLocaleString()}/-
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
                                                    ₹ {parseInt(obj.secondPayment).toLocaleString()}/- {"("}
                                                    {isNaN(new Date(obj.secondPaymentRemarks))
                                                      ? obj.secondPaymentRemarks
                                                      : "On " + obj.secondPaymentRemarks + ")"}
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
                                                    ₹{" "}{parseInt(obj.thirdPayment).toLocaleString()}/- {"("}
                                                    {isNaN(new Date(obj.thirdPaymentRemarks))
                                                      ? obj.thirdPaymentRemarks
                                                      : "On " + obj.thirdPaymentRemarks + ")"}
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
                                                    ₹{" "}{parseInt(obj.fourthPayment).toLocaleString()}{" "}/- {"("}
                                                    {isNaN(new Date(obj.fourthPaymentRemarks))
                                                      ? obj.fourthPaymentRemarks
                                                      : "On " + obj.fourthPaymentRemarks + ")"}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {objMain.remainingPayments.length !== 0 && objMain.remainingPayments.some((boom) => boom.serviceName === obj.serviceName) && (
                                        <div className="my-card-body accordion" id={`accordionExample${index}`}>
                                          <div class="accordion-item bdr-none">

                                            <div id={`headingOne${index}`} className="pr-10 accordion-header">
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
                                              {objMain.remainingPayments.length !== 0 && objMain.remainingPayments
                                                .filter((boom) => boom.serviceName === obj.serviceName)
                                                .map((paymentObj, index) => paymentObj.serviceName === obj.serviceName ? (
                                                  <div class="accordion-body bdr-none p-0">
                                                    <div>
                                                      <div className="row m-0 bdr-btm-eee bdr-top-eee">
                                                        <div className="col-lg-12 col-sm-6 p-0 align-self-stretc bg-fffafa">
                                                          <div class="booking_inner_dtl_h h-100 d-flex align-items-center justify-content-between">

                                                            <div>
                                                              {objMain.remainingPayments.length !== 0 && (() => {
                                                                if (index === 0) return "Second ";
                                                                else if (index === 1) return "Third ";
                                                                else if (index === 2) return "Fourth ";
                                                                else if (index > 2) return "Other ";
                                                                return ""; // Return default value if none of the conditions match
                                                              })()}
                                                              Remaining Payment
                                                            </div>

                                                            <div className="d-flex align-items-center">
                                                              <div>
                                                                {"(" + formatDatePro(paymentObj.publishDate ? paymentObj.publishDate : paymentObj.paymentDate) + ")"}
                                                              </div>
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
                                                                ₹{" "}{paymentObj.receivedPayment.toLocaleString()}
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
                                                                ₹{" "}{objMain.remainingPayments.length !== 0 && (() => {
                                                                  const filteredPayments = objMain.remainingPayments.filter((pay) => pay.serviceName === obj.serviceName);
                                                                  const filteredLength = filteredPayments.length;
                                                                  if (index === 0) return (Math.round(obj.totalPaymentWGST) - Math.round(obj.firstPayment) - Math.round(paymentObj.receivedPayment));
                                                                  else if (index === 1) return (Math.round(obj.totalPaymentWGST) - Math.round(obj.firstPayment) - Math.round(paymentObj.receivedPayment) - Math.round(filteredPayments[0].receivedPayment));
                                                                  else if (index === 2) return Math.round(objMain.pendingAmount);
                                                                  return ""; // Return default value if none of the conditions match
                                                                })()}
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
                                                                {formatDatePro(paymentObj.paymentDate)}
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
                                                              <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={paymentObj.paymentMethod}>
                                                                {paymentObj.paymentMethod}
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
                                                              <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={paymentObj.extraRemarks}>
                                                                {paymentObj.extraRemarks}
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
                                        </div>
                                      )}
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
                                                ₹{" "}{parseInt(objMain.totalAmount).toLocaleString()}</div>
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
                                                ₹{" "}{parseInt(objMain.receivedAmount).toLocaleString()}</div>
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
                                                ₹{" "}{parseInt(objMain.pendingAmount).toLocaleString()}
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
                                              <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title="{objMain.extraNotes}">
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
                                            <div className="booking-docs-preview-img"
                                              onClick={() =>
                                                handleViewPdfReciepts(objMain.paymentReceipt[0].filename, currentLeadform["Company Name"])
                                              }
                                            >
                                              {objMain.paymentReceipt[0].filename.endsWith(".pdf") ? (
                                                <PdfImageViewerAdmin
                                                  type="paymentrecieptpdf"
                                                  path={objMain.paymentReceipt[0].filename}
                                                  companyName={currentLeadform["Company Name"]}
                                                />
                                              ) : (
                                                <img
                                                  src={`${secretKey}/bookings/recieptpdf/${currentLeadform["Company Name"]}/${objMain.paymentReceipt[0].filename}`}
                                                  alt={"MyImg"}
                                                ></img>
                                              )}
                                            </div>
                                            <div className="booking-docs-preview-text">
                                              <p className="booking-img-name-txtwrap text-wrap m-auto m-0">
                                                Receipt.pdf
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                    {objMain.otherDocs.map((obj) => (
                                      <div className="col-sm-2 mb-1">
                                        <div className="booking-docs-preview">
                                          <div className="booking-docs-preview-img"
                                            onClick={() =>
                                              handleViewPdOtherDocs(obj.filename, currentLeadform["Company Name"])
                                            }
                                          >
                                            {obj.filename.endsWith(".pdf") ? (
                                              <PdfImageViewerAdmin
                                                type="pdf"
                                                path={obj.filename}
                                                companyName={currentLeadform["Company Name"]}
                                              />
                                            ) : (
                                              <img
                                                src={`${secretKey}/bookings/otherpdf/${currentLeadform["Company Name"]}/${obj.filename}`}
                                                alt={pdfimg}
                                              ></img>
                                            )}
                                          </div>
                                          <div className="booking-docs-preview-text">
                                            <p className="booking-img-name-txtwrap text-wrap m-auto m-0" title={obj.originalname}>
                                              {obj.originalname}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}

                                    <div className="col-sm-2 mb-1">
                                      <div className="booking-docs-preview" title="Upload More Documents">
                                        <div className="upload-Docs-BTN"
                                          onClick={() => {
                                            setOpenOtherDocs(true);
                                            setSendingIndex(index + 1);
                                          }}
                                        >
                                          <IoAdd />
                                        </div>
                                      </div>
                                    </div>

                                    <Dialog maxWidth="sm" open={openOtherDocs} onClose={closeOtherDocsPopup} fullWidth>
                                      <DialogTitle>
                                        Upload Your Attachments
                                        <IconButton onClick={closeOtherDocsPopup} style={{ float: "right" }}>
                                          <CloseIcon color="primary"></CloseIcon>
                                        </IconButton>{" "}
                                      </DialogTitle>

                                      <DialogContent>
                                        <div className="maincon">
                                          <div style={{ justifyContent: "space-between" }} className="con1 d-flex">
                                            <div style={{ paddingTop: "9px" }} className="uploadcsv">
                                              <label style={{ margin: "0px 0px 6px 0px" }} htmlFor="attachmentfile">
                                                Upload Files
                                              </label>
                                            </div>
                                          </div>

                                          <div style={{ margin: "5px 0px 0px 0px" }} className="form-control">
                                            <input
                                              type="file"
                                              name="attachmentfile"
                                              id="attachmentfile"
                                              onChange={(e) => handleOtherDocsUpload(e.target.files)}
                                              multiple // Allow multiple files selection
                                            />
                                            {selectedDocuments && selectedDocuments.length > 0 && (
                                              <div className="uploaded-filename-main d-flex flex-wrap">
                                                {selectedDocuments.map((file, index) => (
                                                  <div className="uploaded-fileItem d-flex align-items-center" key={index}>
                                                    <p className="m-0">
                                                      {file.name}
                                                    </p>
                                                    <button className="fileItem-dlt-btn" onClick={() => handleRemoveFile(index)}>
                                                      <IconX className="close-icon" />
                                                    </button>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </DialogContent>

                                      <button className="btn btn-primary" onClick={handleotherdocsAttachment}>
                                        Submit
                                      </button>
                                    </Dialog>
                                  </div>
                                </div>
                              </div>
                            </>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editMoreOpen && bookingIndex !== -1 && (
        <EditableMoreBooking
          setFormOpen={setEditMoreOpen}
          bookingIndex={bookingIndex}
          //isAdmin={isAdmin}
          setNowToFetch={setNowToFetch}
          companysName={currentLeadform["Company Name"]}
          companysEmail={currentLeadform["Company Email"]}
          companyNumber={currentLeadform["Company Number"]}
          companysInco={currentLeadform.incoDate}
          employeeName={currentLeadform.bdeName}
          employeeEmail={currentLeadform.bdeEmail}
        />
      )}

      {addFormOpen && (
        <AddLeadForm
          employeeEmail={currentLeadform.email}
          employeeName={currentLeadform.bdeName}
          setFormOpen={setAddFormOpen}
          companysName={currentLeadform["Company Name"]}
          setNowToFetch={setNowToFetch}
          bdmName={currentLeadform.bdmName}
          bdmEmail={currentLeadform.bdmEmail}
          isBDM={true}
        />
      )}

      <Dialog maxWidth="sm" open={openBooking} fullWidth
        onClose={() => {
          setOpenBooking(false);
          setCurrentForm(null);
        }}
      >
        <DialogTitle>
          Choose Booking{" "}
          <IconButton style={{ float: "right" }}
            onClick={() => {
              setOpenBooking(false);
              setCurrentForm(null);
            }}
          >
            <CloseIcon color="primary"></CloseIcon>
          </IconButton>{" "}
        </DialogTitle>

        <DialogContent>
          <div className="bookings-content">
            <div className="open-bookings d-flex align-items-center justify-content-around">
              <div className="booking-1">
                <label for="open-bookings "> Booking 1 </label>
                <input
                  onChange={() => setBookingIndex(0)}
                  className="form-check-input ml-1"
                  type="radio"
                  name="open-bookings"
                  id="open-bookings-1"
                />
              </div>

              {currentForm && currentForm.moreBookings.map((obj, index) => (
                <div className="booking-2">
                  <label for="open-bookings"> Booking {index + 2} </label>
                  <input
                    onChange={() => setBookingIndex(index + 1)}
                    className="form-check-input ml-1"
                    type="radio"
                    name="open-bookings"
                    id={`open-booking-${index + 2}`}
                  />
                </div>
              ))}
            </div>

            <div className="open-bookings-footer mt-2 d-flex justify-content-center">
              <button onClick={handleOpenEditForm} style={{ textAlign: "center" }} className="btn btn-primary">
                Confirm Booking
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BdmBookings;