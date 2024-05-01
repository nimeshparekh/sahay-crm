import React, { useState, useEffect } from "react";
import Header from "../../Components/Header/Header.jsx";
import Navbar from "../../Components/Navbar/Navbar.jsx";
import AdminBookingForm from "../../../admin/AdminBookingForm.jsx";
import axios from "axios";
import Swal from "sweetalert2";
import PdfImageViewerAdmin from "../../../admin/PdfViewerAdmin.jsx";
import pdfimg from "../../../static/my-images/pdf.png";
import { FcList } from "react-icons/fc";
import wordimg from "../../../static/my-images/word.png";
import Nodata from "../../../components/Nodata.jsx";
import { MdModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import EditableMoreBooking from "../../../admin/EditableMoreBooking.jsx";
import AddLeadForm from "../../../admin/AddLeadForm.jsx";
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
} from "@mui/material";

function ManagerBookings() {
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [sendingIndex, setSendingIndex] = useState(0);
  const [EditBookingOpen, setEditBookingOpen] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [openRemainingPayment, setOpenRemainingPayment] = useState(false);
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
  const [data, setData] = useState([]);
  const [companyName, setCompanyName] = "";
  const secretKey = process.env.REACT_APP_SECRET_KEY;
  const isAdmin = true;
  const fetchDatadebounce = async () => {
    try {
      // Set isLoading to true while fetching data
      //setIsLoading(true);
      //setCurrentDataLoading(true)

      const response = await axios.get(`${secretKey}/leads`);

      // Set the retrieved data in the state
      setData(response.data);
      //setmainData(response.data.filter((item) => item.ename === "Not Alloted"));

      // Set isLoading back to false after data is fetched
      //setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error.message);
      // Set isLoading back to false if an error occurs
      //setIsLoading(false);
    } finally {
      setCurrentDataLoading(false);
    }
  };
  useEffect(() => {
    if (currentCompanyName === "") {
      setCurrentLeadform(leadFormData[0]);
    } else {
      setCurrentLeadform(
        leadFormData.find((obj) => obj["Company Name"] === currentCompanyName)
      );
    }
  }, [leadFormData]);

  useEffect(() => {
    setLeadFormData(
      infiniteBooking.filter((obj) =>
        obj["Company Name"].toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText]);

  const fetchRedesignedFormData = async () => {
    try {
      const response = await axios.get(
        `${secretKey}/redesigned-final-leadData`
      );
      const sortedData = response.data.reverse(); // Reverse the order of data

      setInfiniteBooking(sortedData);
      setLeadFormData(sortedData); // Set both states with the sorted data
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  useEffect(() => {
    fetchRedesignedFormData();
  }, [nowToFetch]);

  useEffect(() => {
    // if (data.companyName) {
    //   console.log("Company Found");
    fetchDatadebounce();
    fetchRedesignedFormData();
    // } else {
    //   console.log("No Company Found");
    // }
  }, []);

  const functionOpenBookingForm = () => {
    setBookingFormOpen(true);
    //setCompanyName(data.companyName)
  };
  const calculateTotalAmount = (obj) => {
    let total = Number(obj.totalAmount);
    if (obj.moreBookings && obj.moreBookings.length > 0) {
      total += obj.moreBookings.reduce(
        (acc, booking) => acc + Number(booking.totalAmount),
        0
      );
    }
    return total.toFixed(2);
  };

  const calculateReceivedAmount = (obj) => {
    let received = Number(obj.receivedAmount);
    if (obj.moreBookings && obj.moreBookings.length > 0) {
      received += obj.moreBookings.reduce(
        (acc, booking) => acc + Number(booking.receivedAmount),
        0
      );
    }
    return received.toFixed(2);
  };

  const calculatePendingAmount = (obj) => {
    let pending = Number(obj.pendingAmount);
    if (obj.moreBookings && obj.moreBookings.length > 0) {
      pending += obj.moreBookings.reduce(
        (acc, booking) => acc + Number(booking.pendingAmount),
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
    window.open(`${secretKey}/recieptpdf/${companyName}/${pathname}`, "_blank");
  };

  const handleViewPdOtherDocs = (pdfurl, companyName) => {
    const pathname = pdfurl;
    console.log(pathname);
    window.open(`${secretKey}/otherpdf/${companyName}/${pathname}`, "_blank");
  };
  const dataManagerName = localStorage.getItem("dataManagerName");
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
          `${secretKey}/redesigned-delete-particular-booking/${company}/${id}`,
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
        fetch(`${secretKey}/redesigned-delete-booking/${company}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            if (response.ok) {
              Swal.fire("Success!", "Booking Deleted", "success");
              fetchRedesignedFormData();
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
      setCurrentCompanyName(currentLeadform["Company Name"]);
      const response = await fetch(
        `${secretKey}/uploadotherdocsAttachment/${currentLeadform["Company Name"]}/${sendingIndex}`,
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
        fetchRedesignedFormData();
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
  return (
    <div>
      <Header name={dataManagerName} />
      <Navbar name={dataManagerName} />
      {!bookingFormOpen && !EditBookingOpen && !addFormOpen && (
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
                <div className="col-6">
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-primary mr-1" disabled>
                      Import CSV
                    </button>
                    <button className="btn btn-primary mr-1" disabled>
                      Export CSV
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => functionOpenBookingForm()}
                    >
                      Add Booking
                    </button>
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

                              {obj.moreBookings.length !== 0 && (
                                <div
                                  className="b_Services_multipal_services"
                                  title="Multipal Bookings"
                                >
                                  <FcList />
                                </div>
                              )}
                            </div>
                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <div className="b_Services_amount d-flex">
                                <div className="amount total_amount_bg">
                                  Total: ₹ {calculateTotalAmount(obj)}
                                </div>
                                <div className="amount receive_amount_bg">
                                  Receive: ₹ {calculateReceivedAmount(obj)}
                                </div>
                                <div className="amount pending_amount_bg">
                                  Pending: ₹ {calculatePendingAmount(obj)}
                                </div>
                              </div>
                              <div className="b_BDE_name">{obj.bdeName}</div>
                            </div>
                          </div>
                        ))}
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
                          className="bookings_add_more"
                          title="Add More Booking"
                          onClick={() => setAddFormOpen(true)}
                        >
                          <FaPlus />
                        </div>
                      </div>
                    </div>
                    <div className="booking-deatils-body">
                      {/* --------Basic Information Which is Common For all bookingdd  ---------*/}
                      <div className="my-card mt-2">
                        <div className="my-card-head">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              Basic Informations
                            </div>
                            <div>
                              Total Services: 4
                            </div>
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
                            <div className="col-lg-3 col-sm-6 p-0 align-self-stretch">
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
                            <div className="col-lg-2 col-sm-6 p-0 align-self-stretch">
                              <div class="row m-0 h-100">
                                <div class="col-sm-5 align-self-stretch p-0">
                                  <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                    PAN
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
                            <div className="col-lg-3 col-sm-6 p-0 align-self-stretch">
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
                            </div>
                          </div>
                          <div className="row m-0 bdr-btm-eee">
                            <div className="col-lg-4 col-sm-6 p-0">
                              <div class="row m-0">
                                <div class="col-sm-4 align-self-stretc p-0">
                                    <div class="booking_inner_dtl_h h-100">Total</div>
                                </div>
                                <div class="col-sm-8 align-self-stretc p-0">
                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee">₹ 2,00,000</div>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-4 col-sm-6 p-0">
                              <div class="row m-0">
                                <div class="col-sm-4 align-self-stretc p-0">
                                    <div class="booking_inner_dtl_h bdr-left-eee h-100">Received</div>
                                </div>
                                <div class="col-sm-8 align-self-stretc p-0">
                                    <div class="booking_inner_dtl_b bdr-left-eee h-100">₹ 50,000</div>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-4 col-sm-6 p-0">
                              <div class="row m-0">
                                <div class="col-sm-4 align-self-stretc p-0">
                                    <div class="booking_inner_dtl_h bdr-left-eee h-100">Pending</div>
                                </div>
                                <div class="col-sm-8 align-self-stretc p-0">
                                    <div class="booking_inner_dtl_b bdr-left-eee h-100">₹ 50,000</div>
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
                              className="Services_Preview_action_edit mr-1"
                              onClick={() => {
                                setbookingIndex(0);
                                setEditBookingOpen(true);
                              }}
                            >
                              <MdModeEdit />
                            </div>
                            <div
                              onClick={() =>
                                handleDeleteBooking(currentLeadform.company)
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
                                            <div>
                                              <button className="btn btn-link btn-small">+ Expanse</button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="row m-0 bdr-btm-eee">
                                  <div className="col-lg-5 col-sm-5 p-0">
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
                                  <div className="col-lg-5 col-sm-5 p-0">
                                    <div class="row m-0">
                                      <div class="col-sm-3 align-self-stretch p-0">
                                        <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                          Notes
                                        </div>
                                      </div>
                                      <div class="col-sm-9 align-self-stretch p-0">
                                        <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                          {obj.paymentRemarks
                                            ? obj.paymentRemarks
                                            : "N/A"}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-lg-2 col-sm-2 p-0">
                                    <div class="row m-0">
                                      <div class="col-sm-6 align-self-stretch p-0">
                                        <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                          Expanses
                                        </div>
                                      </div>
                                      <div class="col-sm-6 align-self-stretch p-0">
                                        <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                          - ₹ 500
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
                                                  new Date(obj.secondPaymentRemarks)
                                                )
                                                  ? obj.secondPaymentRemarks
                                                  : "On " +
                                                    obj.secondPaymentRemarks +
                                                    ")"}
                                                {")"}
                                              </div>
                                              <div>
                                                <div className="add-remaining-amnt" title="Add Remaining Payment">+</div>
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
                                                  new Date(obj.thirdPaymentRemarks)
                                                )
                                                  ? obj.thirdPaymentRemarks
                                                  : "On " +
                                                    obj.thirdPaymentRemarks +
                                                    ")"}
                                              </div>
                                              <div>
                                                <div className="add-remaining-amnt" title="Add Remaining Payment">+</div>
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
                                                  new Date(obj.fourthPaymentRemarks)
                                                )
                                                  ? obj.fourthPaymentRemarks
                                                  : "On " +
                                                    obj.fourthPaymentRemarks +
                                                    ")"}
                                              </div>
                                              <div>
                                                <div className="add-remaining-amnt" title="Add Remaining Payment">+</div>
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
                              <div className="my-card-body accordion" id="accordionExample">
                                <div class="accordion-item bdr-none">
                                  <div id="headingOne accordion-header" className="pr-10">
                                    <div className="row m-0 bdr-btm-eee accordion-button p-0" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                      <div className="w-95 p-0">
                                        <div className="booking_inner_dtl_h h-100">
                                          <div>Remaining Payment </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                    <div class="accordion-body bdr-none p-0">
                                      <div>
                                        <div className="row m-0 bdr-btm-eee bdr-top-eee"> 
                                          <div className="col-lg-12 col-sm-6 p-0 align-self-stretc bg-fffafa">
                                            <div class="booking_inner_dtl_h h-100 d-flex align-items-center justify-content-between">
                                              <div>
                                                Second Remaining Payment
                                              </div>
                                              <div>
                                                2/12/2023
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="row m-0 bdr-btm-eee"> 
                                          <div className="col-lg-2 col-sm-6 p-0 align-self-stretc">
                                            <div class="row m-0 h-100">
                                              <div class="col-sm-5 align-self-stretc p-0">
                                                  <div class="booking_inner_dtl_h h-100">Amount</div>
                                              </div>
                                              <div class="col-sm-7 align-self-stretc p-0">
                                                  <div class="booking_inner_dtl_b bdr-left-eee h-100">₹ 50,000</div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="col-lg-2 col-sm-6 p-0 align-self-stretc">
                                            <div class="row m-0 h-100">
                                              <div class="col-sm-5 align-self-stretc p-0">
                                                  <div class="booking_inner_dtl_h bdr-left-eee h-100">Pending</div>
                                              </div>
                                              <div class="col-sm-7 align-self-stretc p-0">
                                                  <div class="booking_inner_dtl_b bdr-left-eee h-100">₹ 50,000</div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="col-lg-5 col-sm-6 p-0 align-self-stretc">
                                            <div class="row m-0 h-100">
                                              <div class="col-sm-5 align-self-stretc p-0">
                                                  <div class="booking_inner_dtl_h h-100 bdr-left-eee">Payment Method</div>
                                              </div>
                                              <div class="col-sm-7 align-self-stretc p-0">
                                                  <div class="booking_inner_dtl_b h-100 bdr-left-eee">ICICI Bank</div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="col-lg-3 col-sm-4 p-0 align-self-stretc">
                                            <div class="row m-0 h-100">
                                              <div class="col-sm-6 align-self-stretc p-0">
                                                  <div class="booking_inner_dtl_h h-100 bdr-left-eee">Extra Remarks</div>
                                              </div>
                                              <div class="col-sm-6 align-self-stretc p-0">
                                                  <div class="booking_inner_dtl_b h-100 bdr-left-eee">no</div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="row m-0 bdr-btm-eee bdr-top-eee"> 
                                          <div className="col-lg-12 col-sm-6 p-0 align-self-stretc bg-fffafa">
                                            <div class="booking_inner_dtl_h h-100 d-flex align-items-center justify-content-between">
                                              <div>
                                                Third Remaining Payment
                                              </div>
                                              <div>
                                                2/12/2023
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="row m-0 bdr-btm-eee"> 
                                          <div className="col-lg-2 col-sm-6 p-0 align-self-stretc">
                                            <div class="row m-0 h-100">
                                              <div class="col-sm-5 align-self-stretc p-0">
                                                  <div class="booking_inner_dtl_h h-100">Amount</div>
                                              </div>
                                              <div class="col-sm-7 align-self-stretc p-0">
                                                  <div class="booking_inner_dtl_b bdr-left-eee h-100">₹ 50,000</div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="col-lg-2 col-sm-6 p-0 align-self-stretc">
                                            <div class="row m-0 h-100">
                                              <div class="col-sm-5 align-self-stretc p-0">
                                                  <div class="booking_inner_dtl_h bdr-left-eee h-100">Pending</div>
                                              </div>
                                              <div class="col-sm-7 align-self-stretc p-0">
                                                  <div class="booking_inner_dtl_b bdr-left-eee h-100">₹ 50,000</div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="col-lg-5 col-sm-6 p-0 align-self-stretc">
                                            <div class="row m-0 h-100">
                                              <div class="col-sm-5 align-self-stretc p-0">
                                                  <div class="booking_inner_dtl_h h-100 bdr-left-eee">Payment Method</div>
                                              </div>
                                              <div class="col-sm-7 align-self-stretc p-0">
                                                  <div class="booking_inner_dtl_b h-100 bdr-left-eee">ICICI Bank</div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="col-lg-3 col-sm-4 p-0 align-self-stretc">
                                            <div class="row m-0 h-100">
                                              <div class="col-sm-6 align-self-stretc p-0">
                                                  <div class="booking_inner_dtl_h h-100 bdr-left-eee">Extra Remarks</div>
                                              </div>
                                              <div class="col-sm-6 align-self-stretc p-0">
                                                  <div class="booking_inner_dtl_b h-100 bdr-left-eee">no</div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
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
                            <div className="row m-0 bdr-btm-eee">
                              <div className="col-lg-4 col-sm-6 p-0 align-self-stretch">
                                <div class="row m-0 h-100">
                                  <div class="col-sm-5 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_h h-100">
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
                              <div className="col-lg-4 col-sm-6 p-0 align-self-stretch">
                                <div class="row m-0 h-100">
                                  <div class="col-sm-5 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                      Pending Amount
                                    </div>
                                  </div>
                                  <div class="col-sm-7 align-self-stretch p-0">
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
                                    <div class="booking_inner_dtl_h h-100">
                                      Payment Method
                                    </div>
                                  </div>
                                  <div class="col-sm-8 align-self-stretch p-0">
                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee">
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
                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                      {currentLeadform &&
                                        currentLeadform.extraNotes}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {currentLeadform &&
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
                                          (currentLeadform.paymentReceipt[0].filename.endsWith(
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
                                              src={`${secretKey}/recieptpdf/${currentLeadform["Company Name"]}/${currentLeadform.paymentReceipt[0].filename}`}
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
                                          {obj.filename.endsWith(".pdf") ? (
                                            <PdfImageViewerAdmin
                                              type="pdf"
                                              path={obj.filename}
                                              companyName={
                                                currentLeadform["Company Name"]
                                              }
                                            />
                                          ) : (
                                            <img
                                              src={`${secretKey}/otherpdf/${currentLeadform["Company Name"]}/${obj.filename}`}
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
                                {/* ---------- Upload Documents From Preview -----------*/}
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
                            </>
                          )}
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
                                              <i>Support By</i>
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
                                                <div>
                                                  <button className="btn btn-link btn-small">+ Expanse</button>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="row m-0 bdr-btm-eee">
                                      <div className="col-lg-5 col-sm-6 p-0">
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
                                      <div className="col-lg-5 col-sm-6 p-0">
                                        <div class="row m-0">
                                          <div class="col-sm-3 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                              Notes
                                            </div>
                                          </div>
                                          <div class="col-sm-9 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                              {obj.paymentRemarks
                                                ? obj.paymentRemarks
                                                : "N/A"}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-lg-2 col-sm-2 p-0">
                                        <div class="row m-0">
                                          <div class="col-sm-6 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                              Expanses
                                            </div>
                                          </div>
                                          <div class="col-sm-6 align-self-stretch p-0">
                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                              - ₹ 500
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
                                                  <div>
                                                    <div className="add-remaining-amnt" title="Add Remaining Payment">+</div>
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
                                                  <div>
                                                    <div className="add-remaining-amnt" title="Add Remaining Payment">+</div>
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
                                                  <div>
                                                    <div className="add-remaining-amnt" title="Add Remaining Payment">+</div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
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
                                          <div class="booking_inner_dtl_b h-100 bdr-left-eee">
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
                                          <div class="booking_inner_dtl_b h-100 bdr-left-eee">
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
                                          {objMain.paymentReceipt[0].filename.endsWith(
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
                                              src={`${secretKey}/recieptpdf/${currentLeadform["Company Name"]}/${objMain.paymentReceipt[0].filename}`}
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
                                      <div
                                        className="booking-docs-preview-img"
                                        onClick={() =>
                                          handleViewPdOtherDocs(
                                            obj.filename,
                                            currentLeadform["Company Name"]
                                          )
                                        }
                                      >
                                        {obj.filename.endsWith(".pdf") ? (
                                          <PdfImageViewerAdmin
                                            type="pdf"
                                            path={obj.filename}
                                            companyName={
                                              currentLeadform["Company Name"]
                                            }
                                          />
                                        ) : (
                                          <img
                                            src={`${secretKey}/otherpdf/${currentLeadform["Company Name"]}/${obj.filename}`}
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
          </div>
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
          />
        </>
      )}
      <Dialog
        open={openRemainingPayment}
        onClose={() => setOpenRemainingPayment(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <div className="d-flex align-items-center justify-content-between">
            <div className="remaining-payment-heading">
              <h2 className="m-0"> Remaining Payment</h2>
            </div>
            <div className="remaining-payment-close">
              <IconButton onClick={() => setOpenRemainingPayment(false)}>
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="container">
            <div className="row mb-1">
              <div className="col-sm-6">
              <label htmlFor="remaining-service-name" className="form-label">Service Name :</label>
                <div className="col">
                  <select name="remaining-service-name" id="remaining-service-name" className="form-select">
                    <option value="" selected disabled >Select Service :</option>
                    <option value="" >Service 1</option>
                    <option value="" >Service 2</option>
                    <option value="" >Service 3</option>
                  </select>
               
                </div>
             
             
              </div>
              <div className="col-sm-6">
              <label htmlFor="remaining-payment-proper" className="form-label">Remaining Payment :</label>
                <div className="col">
                  <input type="number" className="form-control" name="remaining-payment-proper" id="remaining-payment-proper" placeholder="Remaining Payment" />
                </div>

              </div>
              
            </div>
            <div className="row mt-2">
              <div className="col-sm-6">
              <label htmlFor="remaining-paymentmethod" className="form-label">Payment Method :</label>
                <div className="col">
                  <select name="remaining-paymentmethod" id="remaining-paymentmethod" className="form-select">
                    <option value="" selected disabled >Select Payment Method :</option>
                    <option value="" >Service 1</option>
                    <option value="" >Service 2</option>
                    <option value="" >Service 3</option>
                  </select>
               
                </div>
             
             
              </div>
              <div className="col-sm-6">
                <div className="col">
                <label htmlFor="remaining-paymentmethod"><b>Upload Receipt :</b></label>
                </div>
                <div className="col form-control">
                 <input type="file" name="upload-remaining-receipt" id="upload-remaining-receipt" />
               
                </div>
             
             
              </div>
              
              
            </div>

            <div className="row mt-2">
            <div className="mb-3">
  <label htmlFor="remainingControlTextarea1" className="form-label">Any Remarks</label>
  <textarea className="form-control" id="remainingControlTextarea1" rows="3" placeholder="Write your remarks here..."></textarea>
</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ManagerBookings;
