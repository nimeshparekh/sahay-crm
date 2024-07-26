import React, { useState, useEffect, useSyncExternalStore } from "react";
import RmofCertificationHeader from "../RM-CERT-COMPONENTS/RmofCertificationHeader";
import RmCertificationNavbar from "../RM-CERT-COMPONENTS/RmCertificationNavbar";
import axios from 'axios';
import { IoFilterOutline } from "react-icons/io5";
import ClipLoader from "react-spinners/ClipLoader";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import '../../assets/table.css';
import '../../assets/styles.css';
import dummyImg from "../../static/EmployeeImg/office-man.png";
import { Link } from "react-router-dom";
import { useIsFocusVisible } from "@mui/material";
import RmofCertificationCompanyTaskManage from "./RmofCertificationCompanyTaskManage";
import { FaRegEye } from "react-icons/fa";
import { CiUndo } from "react-icons/ci";
import { FaWhatsapp } from "react-icons/fa";
import StatusDropdown from "../Extra-Components/status-dropdown";
import DscStatusDropdown from "../Extra-Components/dsc-status-dropdown";

function RmofCertificationMyBookings() {
    const rmCertificationUserId = localStorage.getItem("rmCertificationUserId")
    const [employeeData, setEmployeeData] = useState([])
    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const [currentDataLoading, setCurrentDataLoading] = useState(false)
    const [isFilter, setIsFilter] = useState(false)
    const [rmServicesData, setRmServicesData] = useState([])

    useEffect(() => {
        document.title = `RMOFCERT-Sahay-CRM`;
    }, []);


    const fetchData = async () => {
        try {
            const response = await axios.get(`${secretKey}/employee/einfo`);
            // Set the retrieved data in the state
            const tempData = response.data;
            console.log(tempData)
            const userData = tempData.find((item) => item._id === rmCertificationUserId);
            console.log(userData)
            setEmployeeData(userData);
        } catch (error) {
            console.error("Error fetching data:", error.message);
        }
    };

    const fetchRMServicesData = async () => {
        try {
            setCurrentDataLoading(true)
            const response = await axios.get(`${secretKey}/rm-services/rm-sevicesgetrequest`)
            setRmServicesData(response.data)
            //console.log(response.data)
        } catch (error) {
            console.error("Error fetching data", error.message)
        } finally {
            setCurrentDataLoading(false)
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchRMServicesData()

    }, [employeeData])

    const handleDeleteRmBooking = async (companyName, serviceName) => {
        // Display confirmation dialog using SweetAlert
        const confirmDelete = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${serviceName} for ${companyName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        });

        // Proceed with deletion if user confirms
        if (confirmDelete.isConfirmed) {
            try {
                // Send delete request to backend
                const response = await axios.delete(`${secretKey}/rm-services/delete-rm-services`, {
                    data: { companyName, serviceName }
                });

                console.log(response.data);
                Swal.fire('Deleted!', 'The record has been deleted.', 'success');
                fetchData();
                // Handle UI updates or further actions after deletion
            } catch (error) {
                console.error("Error Deleting Company", error.message);
                Swal.fire('Error!', 'Failed to delete the record.', 'error');
                // Handle error scenario, e.g., show an error message or handle error state
            }
        } else {
            // Handle cancel or dismiss scenario if needed
            Swal.fire('Cancelled', 'Delete operation cancelled.', 'info');
        }
    };


    console.log("servicesdata", rmServicesData)

    //---------date format------------------------

    function formatDatePro(inputDate) {
        const options = { year: "numeric", month: "long", day: "numeric" };
        const formattedDate = new Date(inputDate).toLocaleDateString(
            "en-US",
            options
        );
        return formattedDate;
    }

    function formatDate(dateString){
         dateString = "2024-07-26"
        const [year , month , date] = dateString.split('-');
        return `${date}/${month}/${year}`
    }
   


    const mycustomloop = Array(20).fill(null); // Create an array with 10 elements
    const [openCompanyTaskComponent, setOpenCompanyTaskComponent] = useState(false)

    return (
        <div>
            <RmofCertificationHeader name={employeeData.ename} designation={employeeData.designation} />
            <RmCertificationNavbar rmCertificationUserId={rmCertificationUserId} />
            <div className="page-wrapper d-none">
                <div className="page-header d-print-none">
                    <div className="container-xl">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="btn-group" role="group" aria-label="Basic example">
                                    <button type="button"
                                        className={isFilter ? 'btn mybtn active' : 'btn mybtn'}
                                    //onClick={() => setOpenFilterDrawer(true)}
                                    >
                                        <IoFilterOutline className='mr-1' /> Filter
                                    </button>
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
                                        // value={searchText}
                                        // onChange={(e) => {
                                        //     setSearchText(e.target.value);
                                        //     handleFilterSearch(e.target.value)
                                        //     //setCurrentPage(0);
                                        // }}
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
                <div className="page-body">
                    <div className="container-xl">
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
                                                {/* <th>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.length === allIds.length && selectedRows.length !== 0}
                                                        onChange={() => handleCheckboxChange("all")}
                                                        defaultChecked={false}
                                                    />
                                                </th> */}
                                                <th className="th-sticky">Sr.No</th>
                                                <th className="th-sticky1">Company Name</th>
                                                <th>Company Number</th>
                                                <th>SERVICE NAME</th>
                                                {/* <th>Company Email</th>
                                                <th>PAN NUMBER</th> */}
                                                <th>BDE NAME</th>
                                                {/* <th>BDE EMAIL</th> */}
                                                <th>BDM NAME</th>
                                                <th>BDM TYPE</th>
                                                <th>BOOKING DATE</th>
                                                {/* <th>PAYMENT METHOD</th> */}
                                                <th>CA CASE</th>
                                                <th>CA NUMBER</th>
                                                {/* <th>CA EMAIL</th> */}
                                                <th>WITH GST</th>
                                                <th>TOTAL PAYMENT WITHOUT GST</th>
                                                <th>TOTAL PAYMENT WITH GST</th>
                                                {/* <th>FIRST PAYMENT</th>
                                                <th>SECOND PAYMENT</th>
                                                <th>THIRD PAYMENT</th>
                                                <th>FOURTH PAYMENT</th>
                                                <th>SECOND PAYMENT REMARKS</th>
                                                <th>THIRD PAYMENT REMARKS</th>
                                                <th>FOURTH PAYMENT REMARKS</th> */}
                                                <th>Delete Service</th>
                                            </tr>
                                        </thead>
                                        {currentDataLoading ? (
                                            <tbody>
                                                <tr>
                                                    <td colSpan="14" >
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
                                            </tbody>
                                        ) : (
                                            <tbody>
                                                {rmServicesData.length !== 0 && rmServicesData.map((obj, index) => (
                                                    <tr
                                                        key={index}
                                                        //className={selectedRows.includes(company._id) ? "selected" : ""}
                                                        style={{ border: "1px solid #ddd" }}
                                                    >
                                                        <td className="td-sticky">{index + 1}</td>
                                                        <td className="td-sticky1">{obj["Company Name"]}</td>
                                                        <td>{obj["Company Number"]}</td>
                                                        <td>{obj.serviceName}</td>
                                                        {/* <td>{obj["Company Email"]}</td>
                                                        <td>{obj.panNumber}</td> */}
                                                        <td>{obj.bdeName}</td>
                                                        {/* <td>{obj.bdeEmail}</td> */}
                                                        <td>{obj.bdmName}</td>
                                                        <td>{obj.bdmType}</td>
                                                        <td>{obj.bookingDate}</td>
                                                        {/* <td>{obj.paymentMethod}</td> */}
                                                        <td>{obj.caCase}</td>
                                                        <td>{obj.caNumber}</td>
                                                        {/* <td>{obj.caEmail}</td> */}
                                                        <td>{obj.withGST ? 'Yes' : 'No'}</td>
                                                        <td>{obj.totalPaymentWOGST}</td>
                                                        <td>{obj.totalPaymentWGST}</td>
                                                        {/* <td>{obj.firstPayment}</td>
                                                        <td>{obj.secondPayment}</td>
                                                        <td>{obj.thirdPayment}</td>
                                                        <td>{obj.fourthPayment}</td>
                                                        <td>{obj.secondRemarks}</td>
                                                        <td>{obj.thirdRemarks}</td>
                                                        <td>{obj.fourthRemarks}</td> */}
                                                        <div
                                                            onClick={() =>
                                                                handleDeleteRmBooking(
                                                                    obj["Company Name"],
                                                                    obj.serviceName
                                                                )
                                                            }
                                                            style={{ marginLeft: "30px" }}
                                                            className="Services_Preview_action_delete mt-1"
                                                        >
                                                            <MdDelete />
                                                        </div>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        )}
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {!openCompanyTaskComponent &&
                <div className="page-wrapper">
                    <div className="page-header rm_Filter m-0">
                        <div className="container-xl">
                            <div className="d-flex">
                                <div className="btn-group" role="group" aria-label="Basic example">
                                    <button type="button" className="btn mybtn"  >
                                        <IoFilterOutline className='mr-1' /> Filter
                                    </button>
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
                    <div className="page-body rm_Dtl_box m-0">
                        <div className="container-xl mt-2">
                            <div className="my-tab card-header">
                                <ul class="nav nav-tabs rm_task_section_navtabs nav-fill p-0">
                                    <li class="nav-item rm_task_section_navitem">
                                        <a class="nav-link active" data-bs-toggle="tab" href="#General">
                                            <div className="d-flex align-items-center justify-content-between w-100">
                                                <div className="rm_txt_tsn">
                                                    General
                                                </div>
                                                <div className="rm_tsn_bdge">
                                                    {rmServicesData ? rmServicesData.length : 0}
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li class="nav-item rm_task_section_navitem">
                                        <a class="nav-link" data-bs-toggle="tab" href="#InProcess">
                                            <div className="d-flex align-items-center justify-content-between w-100">
                                                <div className="rm_txt_tsn">
                                                    In Process
                                                </div>
                                                <div className="rm_tsn_bdge">
                                                    10
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li class="nav-item rm_task_section_navitem">
                                        <a class="nav-link" data-bs-toggle="tab" href="#Submited">
                                            <div className="d-flex align-items-center justify-content-between w-100">
                                                <div className="rm_txt_tsn">
                                                    Submited
                                                </div>
                                                <div className="rm_tsn_bdge">
                                                    10
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li class="nav-item rm_task_section_navitem">
                                        <a class="nav-link" data-bs-toggle="tab" href="#Approved">
                                            <div className="d-flex align-items-center justify-content-between w-100">
                                                <div className="rm_txt_tsn">
                                                    Approved
                                                </div>
                                                <div className="rm_tsn_bdge">
                                                    10
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li class="nav-item rm_task_section_navitem">
                                        <a class="nav-link" data-bs-toggle="tab" href="#Hold">
                                            <div className="d-flex align-items-center justify-content-between w-100">
                                                <div className="rm_txt_tsn">
                                                    Hold
                                                </div>
                                                <div className="rm_tsn_bdge">
                                                    10
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li class="nav-item rm_task_section_navitem">
                                        <a class="nav-link" data-bs-toggle="tab" href="#Defaulter">
                                            <div className="d-flex align-items-center justify-content-between w-100">
                                                <div className="rm_txt_tsn">
                                                    Defaulter
                                                </div>
                                                <div className="rm_tsn_bdge">
                                                    10
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div class="tab-content card-body">
                                <div class="tab-pane active" id="General">
                                    <div className="RM-my-booking-lists">
                                        <div className="table table-responsive table-style-3 m-0">
                                            <table className="table table-vcenter table-nowrap rm_table">
                                                <thead>
                                                    <tr className="tr-sticky">
                                                        <th className="rm-sticky-left-1">Sr.No</th>
                                                        <th className="rm-sticky-left-2">Booking Date</th>
                                                        <th className="rm-sticky-left-3">Company Name</th>
                                                        <th>Company Number</th>
                                                        <th>Company Email</th>
                                                        <th>CA Number</th>
                                                        <th>Service Name</th>
                                                        <th>Status</th>
                                                        <th>Remark</th>
                                                        <th>DSC Applicable</th>
                                                        <th>BDE Name</th>
                                                        <th>BDM name</th>
                                                        <th>Total Payment</th>
                                                        <th>received Payment</th>
                                                        <th>Pending Payment</th>
                                                        <th className="rm-sticky-action">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {rmServicesData && rmServicesData.length !== 0 && rmServicesData.map((obj, index) => (
                                                        <tr key={index}>
                                                            <td className="rm-sticky-left-1"><div className="rm_sr_no">{index + 1}</div></td>
                                                            <td className="rm-sticky-left-2">{formatDate(obj.bookingDate)}</td>
                                                            <td className="rm-sticky-left-3"><b>{obj["Company Name"]}</b></td>
                                                            <td>
                                                                <div className="d-flex align-items-center justify-content-center wApp">
                                                                    <div>{obj["Company Number"]}</div>
                                                                    <a style={{ marginLeft: '10px', lineHeight: '14px', fontSize: '14px' }}>
                                                                        <FaWhatsapp />
                                                                    </a>
                                                                </div>
                                                            </td>
                                                            <td>{obj["Company Email"]}</td>
                                                            <td>{obj.caCase === "Yes" ? obj.caNumber : "Not Applicable"}</td>
                                                            <td><b>{obj.serviceName}</b></td>
                                                            <td>
                                                                <div><StatusDropdown /></div>
                                                            </td>
                                                            <td>test remarks</td>
                                                            <td>{obj.withDSC ? "Yes" : "No"}</td>
                                                            <td>
                                                                <div className="d-flex align-items-center justify-content-center">
                                                                    {/* <div className="tbl-pro-img">
                                                                <img src={dummyImg}></img>
                                                            </div> */}
                                                                    <div>{obj.bdeName}</div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex align-items-center justify-content-center">
                                                                    {/* <div className="tbl-pro-img">
                                                                <img src={dummyImg}></img>
                                                            </div> */}
                                                                    <div>{obj.bdmName}</div>
                                                                </div>
                                                            </td>
                                                            <td>₹ {obj.totalPaymentWGST}/-</td>
                                                            <td>₹ {obj.firstPayment ? obj.firstPayment : obj.totalPaymentWGST}/-</td>
                                                            <td>₹ {obj.firstPayment ? (obj.totalPaymentWGST - obj.firstPayment) : 0}/-</td>
                                                            <td className="rm-sticky-action"><button className="action-btn action-btn-primary" onClick={() => setOpenCompanyTaskComponent(true)}><FaRegEye /></button>
                                                                <button className="action-btn action-btn-danger ml-1"><CiUndo /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div class="tab-pane" id="InProcess">
                                    <div className="RM-my-booking-lists">
                                        <div className="table table-responsive table-style-3 m-0">
                                            <table className="table table-vcenter table-nowrap rm_table_inprocess">
                                                <thead>
                                                    <tr className="tr-sticky">
                                                        <th className="rm-sticky-left-1">Sr.No</th>
                                                        <th className="rm-sticky-left-2">Booking Date</th>
                                                        <th className="rm-sticky-left-3">Company Name</th>
                                                        <th>Company Number</th>
                                                        <th>Company Email</th>
                                                        <th>CA Number</th>
                                                        <th>Service Name</th>
                                                        <th>Status</th>
                                                        <th>Remark</th>
                                                        <th>DSC Applicable</th>
                                                        <th>DSC Status</th>
                                                        <th>Content Writer</th>
                                                        <th>Content Status</th>
                                                        <th>Brochure Designer</th>
                                                        <th>Brochure Status</th>
                                                        <th>NSWS Email Id</th>
                                                        <th>NSWS Password</th>
                                                        <th>NSWS Email ID</th>
                                                        <th>NSWS Password</th>
                                                        <th>BDE Name</th>
                                                        <th>BDM name</th>
                                                        <th>Total Payment</th>
                                                        <th>received Payment</th>
                                                        <th>Pending Payment</th>
                                                        <th className="rm-sticky-action">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mycustomloop.map((_, index) => (
                                                        <tr>
                                                            <td className="rm-sticky-left-1"><div className="rm_sr_no">1</div></td>
                                                            <td className="rm-sticky-left-2">20/02/2024</td>
                                                            <td className="rm-sticky-left-3"><b>India Private Limited</b></td>
                                                            <td>
                                                                <div className="d-flex align-items-center justify-content-center wApp">
                                                                    <div>9924283530</div>
                                                                    <a style={{ marginLeft: '10px', lineHeight: '14px', fontSize: '14px' }}>
                                                                        <FaWhatsapp />
                                                                    </a>
                                                                </div>
                                                            </td>
                                                            <td>nimesh@incscale.in</td>
                                                            <td>Not Applicable</td>
                                                            <td><b>Start-up India Certificate</b></td>
                                                            <td>
                                                                <div><StatusDropdown /></div>
                                                            </td>
                                                            <td>test remarks</td>
                                                            <td>Yes</td>
                                                            <td>
                                                                <div><DscStatusDropdown /></div>
                                                            </td>
                                                            <td>Content Writer</td>
                                                            <td>Content Status</td>
                                                            <td>Brochure Designer</td>
                                                            <td>Brochure Status</td>
                                                            <td>NSWS Email Id</td>
                                                            <td>NSWS Password</td>
                                                            <td>NSWS Email ID</td>
                                                            <td>NSWS Password</td>
                                                            <td>
                                                                <div className="d-flex align-items-center justify-content-center">
                                                                    {/* <div className="tbl-pro-img">
                                                                <img src={dummyImg}></img>
                                                            </div> */}
                                                                    <div> Vishal Gohel</div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex align-items-center justify-content-center">
                                                                    {/* <div className="tbl-pro-img">
                                                                <img src={dummyImg}></img>
                                                            </div> */}
                                                                    <div> Vishnu  Suthar</div>
                                                                </div>
                                                            </td>
                                                            <td>₹ 8,000/-</td>
                                                            <td>₹ 3,000/-</td>
                                                            <td>₹ 5,000/-</td>
                                                            <td className="rm-sticky-action"><button className="action-btn action-btn-primary" onClick={() => setOpenCompanyTaskComponent(true)}><FaRegEye /></button>
                                                                <button className="action-btn action-btn-danger ml-1"><CiUndo /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div class="tab-pane" id="Submited">

                                </div>
                                <div class="tab-pane" id="Approved">

                                </div>
                                <div class="tab-pane" id="Hold">

                                </div>
                                <div class="tab-pane" id="Defaulter">

                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
            {openCompanyTaskComponent &&
                <>
                    <RmofCertificationCompanyTaskManage />
                </>}
        </div>
    )
}

export default RmofCertificationMyBookings