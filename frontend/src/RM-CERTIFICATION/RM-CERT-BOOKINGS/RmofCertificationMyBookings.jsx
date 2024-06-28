import React, { useState, useEffect, useSyncExternalStore } from "react";
import RmofCertificationHeader from "../RM-CERT-COMPONENTS/RmofCertificationHeader";
import RmCertificationNavbar from "../RM-CERT-COMPONENTS/RmCertificationNavbar";
import axios from 'axios';
import { IoFilterOutline } from "react-icons/io5";
import ClipLoader from "react-spinners/ClipLoader";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";



function RmofCertificationMyBookings() {
    const rmCertificationUserId = localStorage.getItem("rmCertificationUserId")
    const [employeeData, setEmployeeData] = useState([])
    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const [currentDataLoading, setCurrentDataLoading] = useState(false)
    const [isFilter, setIsFilter] = useState(false)
    const [rmServicesData, setRmServicesData] = useState([])




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


    console.log(rmServicesData)



    return (
        <div>
            <RmofCertificationHeader name={employeeData.ename} designation={employeeData.designation} />
            <RmCertificationNavbar rmCertificationUserId={rmCertificationUserId} />
            <div className="page-wrapper">
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
                                                <th>Sr.No</th>
                                                <th>Company Name</th>
                                                <th>Company Number</th>
                                                <th>Company Email</th>
                                                <th>PAN NUMBER</th>
                                                <th>BDE NAME</th>
                                                <th>BDE EMAIL</th>
                                                <th>BDM NAME</th>
                                                <th>BDM TYPE</th>
                                                <th>BOOKING DATE</th>
                                                <th>PAYMENT METHOD</th>
                                                <th>CA CASE</th>
                                                <th>CA NUMBER</th>
                                                <th>CA EMAIL</th>
                                                <th>SERVICE NAME</th>
                                                <th>TOTAL PAYMENT WITHOUT GST</th>
                                                <th>TOTAL PAYMENT WITH GST</th>
                                                <th>WITH GST</th>
                                                <th>FIRST PAYMENT</th>
                                                <th>SECOND PAYMENT</th>
                                                <th>THIRD PAYMENT</th>
                                                <th>FOURTH PAYMENT</th>
                                                <th>SECOND PAYMENT REMARKS</th>
                                                <th>THIRD PAYMENT REMARKS</th>
                                                <th>FOURTH PAYMENT REMARKS</th>
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
                                                        style={{ border: "1px solid #ddd", lineHeight: "20px" }}
                                                    >
                                                        <td style={{ lineHeight: "30px" }}>{index + 1}</td>
                                                        <td>{obj["Company Name"]}</td>
                                                        <td>{obj["Company Number"]}</td>
                                                        <td>{obj["Company Email"]}</td>
                                                        <td>{obj.panNumber}</td>
                                                        <td>{obj.bdeName}</td>
                                                        <td>{obj.bdeEmail}</td>
                                                        <td>{obj.bdmName}</td>
                                                        <td>{obj.bdmType}</td>
                                                        <td>{obj.bookingDate}</td>
                                                        <td>{obj.paymentMethod}</td>
                                                        <td>{obj.caCase}</td>
                                                        <td>{obj.caNumber}</td>
                                                        <td>{obj.caEmail}</td>
                                                        <td>{obj.serviceName}</td>
                                                        <td>{obj.totalPaymentWOGST}</td>
                                                        <td>{obj.totalPaymentWGST}</td>
                                                        <td>{obj.withGST ? 'Yes' : 'No'}</td>
                                                        <td>{obj.firstPayment}</td>
                                                        <td>{obj.secondPayment}</td>
                                                        <td>{obj.thirdPayment}</td>
                                                        <td>{obj.fourthPayment}</td>
                                                        <td>{obj.secondRemarks}</td>
                                                        <td>{obj.thirdRemarks}</td>
                                                        <td>{obj.fourthRemarks}</td>
                                                        <div
                                                            onClick={() =>
                                                                handleDeleteRmBooking(
                                                                    obj["Company Name"],
                                                                    obj.serviceName
                                                                )
                                                            }
                                                            style={{marginLeft:"30px"}}
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
                            {/* {(!isFilter || !isSearching)  && data.length === 0  && !currentDataLoading && (
                                <table>
                                    <tbody>
                                        <tr>
                                            <td colSpan="13" className="p-2 particular">
                                                <Nodata />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            )}
                            {(isFilter || isSearching) && dataStatus === 'Unassigned' && unAssignedData.length === 0  && !currentDataLoading && (
                                <table>
                                    <tbody>
                                        <tr>
                                            <td colSpan="13" className="p-2 particular">
                                                <Nodata />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            )}
                             {(isFilter || isSearching) && dataStatus === 'Assigned' && assignedData.length === 0  && !currentDataLoading && (
                                <table>
                                    <tbody>
                                        <tr>
                                            <td colSpan="13" className="p-2 particular">
                                                <Nodata />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            )} */}
                            {/* {data.length !== 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between", margin: "10px" }} className="pagination">
                                    <button style={{ background: "none", border: "0px transparent" }} onClick={handlePreviousPage} disabled={currentPage === 1}>
                                        <IconChevronLeft />
                                    </button>
                                    <span>Page {currentPage} /{totalCount}</span>
                                    <button style={{ background: "none", border: "0px transparent" }} onClick={handleNextPage} disabled={data.length < itemsPerPage}>
                                        <IconChevronRight />
                                    </button>
                                </div>
                            )} */}
                            {/* {(data.length !== 0 || ((isFilter || isSearching) && (assignedData.length !== 0 || unAssignedData.length !== 0))) && (
                                <div style={{ display: "flex", justifyContent: "space-between", margin: "10px" }} className="pagination">
                                    <button style={{ background: "none", border: "0px transparent" }} onClick={handlePreviousPage} disabled={currentPage === 1}>
                                        <IconChevronLeft />
                                    </button>
                                    {(isFilter || isSearching) && dataStatus === 'Assigned' && <span>Page {currentPage} / {Math.ceil(totalCompaniesAssigned / 500)}</span>}
                                    {(isFilter || isSearching) && dataStatus === 'Unassigned' && <span>Page {currentPage} / {Math.ceil(totalCompaniesUnassigned / 500)}</span>}
                                    {(!isFilter && !isSearching) && <span>Page {currentPage} / {totalCount}</span>}
                                    <button style={{ background: "none", border: "0px transparent" }} onClick={handleNextPage} disabled={
                                        ((isFilter || isSearching) && dataStatus === 'Assigned' && assignedData.length < itemsPerPage) ||
                                        ((isFilter || isSearching) && dataStatus === 'Unassigned' && unAssignedData.length < itemsPerPage) ||
                                        ((!isFilter || !isSearching) && data.length < itemsPerPage)
                                    }>
                                        <IconChevronRight />
                                    </button>
                                </div>
                            )} */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RmofCertificationMyBookings