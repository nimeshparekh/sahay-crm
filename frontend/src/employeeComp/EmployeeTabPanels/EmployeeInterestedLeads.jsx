import React, { useState, useEffect, useRef } from "react";
import { LuHistory } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import ClipLoader from "react-spinners/ClipLoader";
import { GoArrowLeft } from "react-icons/go";
import { GoArrowRight } from "react-icons/go";
import Nodata from "../../components/Nodata";
import RemarksDialog from "../ExtraComponents/RemarksDialog";
import EmployeeStatusChange from "../ExtraComponents/EmployeeStatusChange";
import RedesignedForm from "../../admin/RedesignedForm";
import AddLeadForm from "../../admin/AddLeadForm";
import NewProjectionDialog from "../ExtraComponents/NewProjectionDialog";
import EmployeeNextFollowDate from "../ExtraComponents/EmployeeNextFollowUpDate";
import CallHistory from "../CallHistory";
import ProjectionDialog from "../ExtraComponents/ProjectionDialog";
import BdmMaturedCasesDialogBox from "../BdmMaturedCasesDialogBox";
import { MdOutlineWorkHistory } from "react-icons/md";
import EmployeeInterestedInformationDialog from "../ExtraComponents/EmployeeInterestedInformationDialog";
import { FaEye } from "react-icons/fa";
import AdminRemarksDialog from "../../admin/ExtraComponent/AdminRemarksDialog";
import { IconButton } from "@mui/material";
import { RiEditCircleFill } from "react-icons/ri";
import { width } from "@mui/system";
import FilterableComponentEmployee from "../ExtraComponents/FilterableComponentEmployee";
import { BsFilter } from "react-icons/bs";
import { FaFilter } from "react-icons/fa";
import { TiArrowForward } from "react-icons/ti";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import Tooltip from "@mui/material/Tooltip";

function EmployeeInterestedLeads({
  interestedData,
  isLoading,
  refetch,
  formatDateNew,
  startIndex,
  endIndex,
  totalPages,
  setCurrentPage,
  currentPage,
  secretKey,
  dataStatus,
  setdataStatus,
  ename,
  email,
  handleShowCallHistory,
  fetchProjections,
  projectionData,
  handleOpenFormOpen,
  designation,
  fordesignation,
  setSelectedRows,
  handleCheckboxChange,
  handleMouseDown,
  handleMouseEnter,
  handleMouseUp,
  selectedRows,
  userId,
  bdenumber,
  filteredData,
  filterMethod,
  completeGeneralData,
  dataToFilter,
  setInterestedData,
  setInterestedDataCount,
  setFilteredData,
  activeFilterField,
  setActiveFilterField,
  activeFilterFields,
  setActiveFilterFields,
  cleanString,
  calculateAgeFromDate

}) {
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyStatus, setCompanyStatus] = useState("");
  const [companyNumber, setCompanyNumber] = useState(0);
  const [companyEmail, setCompanyEmail] = useState("");
  const [maturedCompanyName, setMaturedCompanyName] = useState("");
  const [companyInco, setCompanyInco] = useState(null);
  // const [formOpen, setFormOpen] = useState(false);
  // //const [editFormOpen, setEditFormOpen] = useState(false);
  // const [addFormOpen, setAddFormOpen] = useState(false);
  const [deletedEmployeeStatus, setDeletedEmployeeStatus] = useState(false);
  const [newBdeName, setNewBdeName] = useState("");
  const [nowToFetch, setNowToFetch] = useState(false);
  const [showForwardToBdmPopup, setShowForwardToBdmPopup] = useState(false);
  const [showNewAddProjection, setShowNewAddProjection] = useState(false);
  const [viewProjection, setViewProjection] = useState(false);
  const [isProjectionEditable, setIsProjectionEditable] = useState(false);
  const [projectionDataToBeFilled, setProjectionDataToBeFilled] = useState({});
  const [viewedForParticularCompany, setViewedForParticularCompany] = useState(false);
  const [openBacdrop, setOpenBacdrop] = useState(false)
  const handleCloseBdmPopup = () => {
    setShowForwardToBdmPopup(false);
  };

  const handleCloseNewProjection = () => {
    setShowNewAddProjection(false);
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
      refetch(); // Trigger a refetch when the page changes
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
      refetch(); // Trigger a refetch when the page changes
    }
  };

  const modalId = `modal-${companyName.replace(/\s+/g, '')}`; // Generate a unique modal ID



  // ----------------filter component----------------------
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  //const [activeFilterFields, setActiveFilterFields] = useState([]); // New state for active filter fields
  const [error, setError] = useState('');
  const [noOfAvailableData, setnoOfAvailableData] = useState(0);
  //const [activeFilterField, setActiveFilterField] = useState(null);
  const [filterPosition, setFilterPosition] = useState({ top: 10, left: 5 });
  const [isScrollLocked, setIsScrollLocked] = useState(false)
  const fieldRefs = useRef({});
  const filterMenuRef = useRef(null); // Ref for the filter menu container
  //const [dataToFilter, setDataToFilter] = useState([]);
  //const [filteredData, setFilteredData] = useState([]);

  const handleFilter = (newData) => {
    setFilteredData(newData)
    setInterestedData(newData);
    setInterestedDataCount(newData.length);
  };

 

  const handleFilterClick = async (field) => {
    // if (filteredData.length === 0) {
    //   try {
    //     const response = await axios.get(
    //       `${secretKey}/company-data/employees-interested/${cleanString(ename)}`, // Backend API endpoint
    //       {
    //         params: {
    //           limit: 500, // Adjust the limit as required
    //           // search: searchQuery, // Pass the search query if applicable
    //         },
    //       }
    //     );

    //     const { interestedData } = response.data;
    //     console.log("interestedData", interestedData)
    //     // setDataToFilter(interestedData);
    //     setDataToFilter(interestedData); // Update data based on the response
    //   } catch (error) {
    //     console.error("Error fetching Interested data:", error);
    //     // Handle error appropriately
    //   }

    // }

    if (activeFilterField === field) {
      setShowFilterMenu(!showFilterMenu);
      setIsScrollLocked(!showFilterMenu);
    } else {
      setActiveFilterField(field);
      setShowFilterMenu(true);
      setIsScrollLocked(true);

      const rect = fieldRefs.current[field].getBoundingClientRect();
      setFilterPosition({ top: rect.bottom, left: rect.left });
    }
  };

  const isActiveField = (field) => activeFilterFields.includes(field);

  // console.log("activeFilterFieldsInterested", activeFilterFields);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const handleClickOutside = (event) => {
        if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
          setShowFilterMenu(false);
          // setIsScrollLocked(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, []);

  // ----------------call history data-----------------------------
  const [callHistoryMap, setCallHistoryMap] = useState()

  // Date Setup for API
  const today = new Date();
  const todayStartDate = new Date(today);
  const todayEndDate = new Date(today);

  // Set end timestamp to current date at 13:00 (1 PM) UTC
  todayEndDate.setUTCHours(13, 0, 0, 0);

  // Set start timestamp to 6 months before the current date at 04:00 (4 AM) UTC
  todayStartDate.setMonth(todayStartDate.getMonth() - 5);
  todayStartDate.setUTCHours(4, 0, 0, 0);

  // Convert to Unix timestamps (seconds since epoch)
  const startTimestamp = Math.floor(todayStartDate.getTime() / 1000);
  const endTimestamp = Math.floor(todayEndDate.getTime() / 1000);

  // useEffect(() => {
  //   const fetchAndSaveCallHistory = async () => {
  //     console.log("Fetching and processing call history...");

  //     try {
  //       const apiKey = process.env.REACT_APP_API_KEY; // Ensure this is set in your .env file
  //       const url = "https://api1.callyzer.co/v2/call-log/history";

  //       // Extract company numbers from generalData
  //       const companyNumbers = interestedData?.map((company) => String(company["Company Number"]));

  //       if (!companyNumbers || companyNumbers.length === 0) {
  //         console.warn("No company numbers available for fetching call history.");
  //         return;
  //       }

  //       const body = {
  //         call_from: startTimestamp,
  //         call_to: endTimestamp,
  //         call_types: ["Missed", "Rejected", "Incoming", "Outgoing"],
  //         client_numbers: companyNumbers,
  //       };

  //       // Fetch call history from the API
  //       const response = await fetch(url, {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${apiKey}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(body),
  //       });

  //       if (!response.ok) {
  //         const errorData = await response.json();
  //         throw new Error(`Error: ${response.status} - ${errorData.message || response.statusText}`);
  //       }

  //       const callHistoryData = await response.json();
  //       console.log("Fetched call history data:", callHistoryData.result);

  //       // Match call history with companies
  //       const callHistoryMap = {};
  //       callHistoryData?.result.forEach((call) => {
  //         const number = call.client_number;

  //         console.log("Processing call for client_number:", number);

  //         const matchedCompany = interestedData?.find((company) => {
  //           const companyNumber = String(company["Company Number"] || "").trim().toLowerCase();
  //           const clientNumber = String(number || "").trim().toLowerCase();
  //           return companyNumber === clientNumber;
  //         });

  //         if (matchedCompany) {
  //           if (!callHistoryMap[number]) {
  //             callHistoryMap[number] = [];
  //           }
  //           callHistoryMap[number].push(call);
  //         }
  //       });

  //       console.log("callHistoryMap:", callHistoryMap);

  //       // Save matched call history to database
  //       const updatedGeneralData = await Promise.all(
  //         interestedData.map(async (company) => {
  //           const companyNumber = String(company["Company Number"]);
  //           const callHistoryForCompany = callHistoryMap[companyNumber] || [];

  //           // Save to the database if there is call history
  //           if (callHistoryForCompany.length > 0) {
  //             try {
  //               await axios.post(`${secretKey}/remarks/save-client-call-history`, {
  //                 client_number: companyNumber,
  //                 callHistoryData: callHistoryForCompany,
  //               });
  //               console.log(`Call history for company ${companyNumber} saved successfully.`);
  //             } catch (err) {
  //               console.error(`Error saving call history for ${companyNumber}:`, err.response?.data || err.message);
  //             }
  //           } else {
  //             console.log(`No call history to save for company ${companyNumber}.`);
  //           }

  //           // Update local busyData with call history
  //           return {
  //             ...company,
  //             callHistoryData: callHistoryForCompany,
  //           };
  //         })
  //       );

  //       // Update the generalData state with enriched data
  //       setInterestedData(updatedGeneralData);

  //       console.log("All call history saved successfully.");
  //     } catch (err) {
  //       console.error("Error fetching and saving call history:", err);
  //     }
  //   };

  //   fetchAndSaveCallHistory();
  // }, [interestedData]);

  console.log("interestedData", interestedData);
  // console.log("filterField", activeFilterField);
  // console.log("activeFilterFieldsInterested", activeFilterFields);
  // console.log("companyId", companyId)


  return (
    <div className="sales-panels-main no-select" onMouseUp={handleMouseUp}>
      {openBacdrop && (<Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBacdrop}
        onClick={() => setOpenBacdrop(false)}>
        <CircularProgress color="inherit" />
      </Backdrop>)}
      <>
        <div className="table table-responsive e-Leadtable-style m-0">
          <table
            className="table table-vcenter table-nowrap"
            style={{ width: "2200px" }}
          >
            <thead>
              <tr className="tr-sticky">
                {(fordesignation === "admin" || fordesignation === "datamanager") && (
                  <th className="AEP-sticky-left-1">
                    <label className="table-check">
                      <input
                        type="checkbox"
                        checked={
                          selectedRows && interestedData && (selectedRows.length === interestedData.length)
                        }
                        onChange={(e) => handleCheckboxChange("all", e)}
                      />
                      <span class="table_checkmark"></span>
                    </label>
                  </th>
                )}
                <th
                  className={
                    (fordesignation === "admin" || fordesignation === "datamanager")
                      ? "AEP-sticky-left-2"
                      : "rm-sticky-left-1"
                  }
                >
                  Sr. No
                </th>
                <th
                  className={
                    (fordesignation === "admin" || fordesignation === "datamanager")
                      ? "AEP-sticky-left-3"
                      : "rm-sticky-left-2"
                  }
                >
                  <div className='d-flex align-items-center justify-content-center position-relative'>
                    <div ref={el => fieldRefs.current['Company Name'] = el}>
                      Company Name
                    </div>

                    <div className='RM_filter_icon'>
                      {isActiveField('Company Name') ? (
                        <FaFilter onClick={() => handleFilterClick("Company Name")} />
                      ) : (
                        <BsFilter onClick={() => handleFilterClick("Company Name")} />
                      )}
                    </div>

                    {/* ---------------------filter component--------------------------- */}
                    {showFilterMenu && activeFilterField === 'Company Name' && (
                      <div
                        ref={filterMenuRef}
                        className="filter-menu"
                        style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                      >
                        <FilterableComponentEmployee
                          noofItems={setnoOfAvailableData}
                          allFilterFields={setActiveFilterFields}
                          filteredData={filteredData}
                          activeTab={"Interested"}
                          data={interestedData}
                          filterField={activeFilterField}
                          onFilter={handleFilter}
                          completeData={completeGeneralData}
                          showingMenu={setShowFilterMenu}
                          dataForFilter={dataToFilter}
                          refetch={refetch}

                        />
                      </div>
                    )}
                  </div>
                </th>
                <th>
                  <div className='d-flex align-items-center justify-content-center position-relative'>
                    <div ref={el => fieldRefs.current['Company Number'] = el}>
                      Company No
                    </div>
                    <div className='RM_filter_icon'>
                      {isActiveField('Company Number') ? (
                        <FaFilter onClick={() => handleFilterClick("Company Number")} />
                      ) : (
                        <BsFilter onClick={() => handleFilterClick("Company Number")} />
                      )}
                    </div>

                    {/* ---------------------filter component--------------------------- */}
                    {showFilterMenu && activeFilterField === 'Company Number' && (
                      <div
                        ref={filterMenuRef}
                        className="filter-menu"
                        style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                      >
                        <FilterableComponentEmployee
                          noofItems={setnoOfAvailableData}
                          allFilterFields={setActiveFilterFields}
                          filteredData={filteredData}
                          activeTab={"Interested"}
                          data={interestedData}
                          filterField={activeFilterField}
                          onFilter={handleFilter}
                          completeData={completeGeneralData}
                          showingMenu={setShowFilterMenu}
                          dataForFilter={dataToFilter}
                          refetch={refetch}
                        />
                      </div>
                    )}
                  </div>
                </th>
                <th>Call History</th>
                <th>
                  <div className='d-flex align-items-center justify-content-center position-relative'>
                    <div ref={el => fieldRefs.current['Status'] = el}>
                      Status
                    </div>

                    <div className='RM_filter_icon'>
                      {isActiveField('Status') ? (
                        <FaFilter onClick={() => handleFilterClick("Status")} />
                      ) : (
                        <BsFilter onClick={() => handleFilterClick("Status")} />
                      )}
                    </div>

                    {/* ---------------------filter component--------------------------- */}
                    {showFilterMenu && activeFilterField === 'Status' && (
                      <div
                        ref={filterMenuRef}
                        className="filter-menu"
                        style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                      >
                        <FilterableComponentEmployee
                          noofItems={setnoOfAvailableData}
                          allFilterFields={setActiveFilterFields}
                          filteredData={filteredData}
                          activeTab={"Interested"}
                          data={interestedData}
                          filterField={activeFilterField}
                          onFilter={handleFilter}
                          completeData={completeGeneralData}
                          showingMenu={setShowFilterMenu}
                          dataForFilter={dataToFilter}
                          refetch={refetch}
                        />
                      </div>
                    )}
                  </div>
                </th>
                <th>Remarks</th>
                <th>
                  <div className='d-flex align-items-center justify-content-center position-relative'>
                    <div ref={el => fieldRefs.current['bdeNextFollowUpDate'] = el}>
                      Next FollowUp Date
                    </div>

                    <div className='RM_filter_icon'>
                      {isActiveField('bdeNextFollowUpDate') ? (
                        <FaFilter onClick={() => handleFilterClick("bdeNextFollowUpDate")} />
                      ) : (
                        <BsFilter onClick={() => handleFilterClick("bdeNextFollowUpDate")} />
                      )}
                    </div>

                    {/* ---------------------filter component--------------------------- */}
                    {showFilterMenu && activeFilterField === 'bdeNextFollowUpDate' && (
                      <div
                        ref={filterMenuRef}
                        className="filter-menu"
                        style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                      >
                        <FilterableComponentEmployee
                          noofItems={setnoOfAvailableData}
                          allFilterFields={setActiveFilterFields}
                          filteredData={filteredData}
                          activeTab={"Interested"}
                          data={interestedData}
                          filterField={activeFilterField}
                          onFilter={handleFilter}
                          completeData={completeGeneralData}
                          showingMenu={setShowFilterMenu}
                          dataForFilter={dataToFilter}
                          refetch={refetch}
                        />
                      </div>
                    )}
                  </div>
                </th>
                <th>
                  <div className='d-flex align-items-center justify-content-center position-relative'>
                    <div ref={el => fieldRefs.current['Company Incorporation Date  '] = el}>
                      Incorporation Date
                    </div>

                    <div className='RM_filter_icon'>
                      {isActiveField('Company Incorporation Date  ') ? (
                        <FaFilter onClick={() => handleFilterClick("Company Incorporation Date  ")} />
                      ) : (
                        <BsFilter onClick={() => handleFilterClick("Company Incorporation Date  ")} />
                      )}
                    </div>

                    {/* ---------------------filter component--------------------------- */}
                    {showFilterMenu && activeFilterField === 'Company Incorporation Date  ' && (
                      <div
                        ref={filterMenuRef}
                        className="filter-menu"
                        style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                      >
                        <FilterableComponentEmployee
                          noofItems={setnoOfAvailableData}
                          allFilterFields={setActiveFilterFields}
                          filteredData={filteredData}
                          activeTab={"Interested"}
                          data={interestedData}
                          filterField={activeFilterField}
                          onFilter={handleFilter}
                          completeData={completeGeneralData}
                          showingMenu={setShowFilterMenu}
                          dataForFilter={dataToFilter}
                          refetch={refetch}
                        />
                      </div>
                    )}
                  </div>
                </th>
                <th>
                  <div className='d-flex align-items-center justify-content-center position-relative'>
                    <div ref={el => fieldRefs.current['City'] = el}>
                      City
                    </div>
                    <div className='RM_filter_icon'>
                      {isActiveField('City') ? (
                        <FaFilter onClick={() => handleFilterClick("City")} />
                      ) : (
                        <BsFilter onClick={() => handleFilterClick("City")} />
                      )}
                    </div>

                    {/* ---------------------filter component--------------------------- */}
                    {showFilterMenu && activeFilterField === 'City' && (
                      <div
                        ref={filterMenuRef}
                        className="filter-menu"
                        style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                      >
                        <FilterableComponentEmployee
                          noofItems={setnoOfAvailableData}
                          allFilterFields={setActiveFilterFields}
                          filteredData={filteredData}
                          activeTab={"Interested"}
                          data={interestedData}
                          filterField={activeFilterField}
                          onFilter={handleFilter}
                          completeData={completeGeneralData}
                          showingMenu={setShowFilterMenu}
                          dataForFilter={dataToFilter}
                          refetch={refetch}
                        />
                      </div>
                    )}
                  </div>
                </th>
                <th>
                  <div className='d-flex align-items-center justify-content-center position-relative'>
                    <div ref={el => fieldRefs.current['State'] = el}>
                      State
                    </div>

                    <div className='RM_filter_icon'>
                      {isActiveField('State') ? (
                        <FaFilter onClick={() => handleFilterClick("State")} />
                      ) : (
                        <BsFilter onClick={() => handleFilterClick("State")} />
                      )}
                    </div>

                    {/* ---------------------filter component--------------------------- */}
                    {showFilterMenu && activeFilterField === 'State' && (
                      <div
                        ref={filterMenuRef}
                        className="filter-menu"
                        style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                      >
                        <FilterableComponentEmployee
                          noofItems={setnoOfAvailableData}
                          allFilterFields={setActiveFilterFields}
                          filteredData={filteredData}
                          activeTab={"Interested"}
                          data={interestedData}
                          filterField={activeFilterField}
                          onFilter={handleFilter}
                          completeData={completeGeneralData}
                          showingMenu={setShowFilterMenu}
                          dataForFilter={dataToFilter}
                          refetch={refetch}
                        />
                      </div>
                    )}
                  </div>
                </th>
                <th>
                  <div className='d-flex align-items-center justify-content-center position-relative'>
                    <div ref={el => fieldRefs.current['Company Email'] = el}>
                      Company Email
                    </div>

                    <div className='RM_filter_icon'>
                      {isActiveField('Company Email') ? (
                        <FaFilter onClick={() => handleFilterClick("Company Email")} />
                      ) : (
                        <BsFilter onClick={() => handleFilterClick("Company Email")} />
                      )}
                    </div>

                    {/* ---------------------filter component--------------------------- */}
                    {showFilterMenu && activeFilterField === 'Company Email' && (
                      <div
                        ref={filterMenuRef}
                        className="filter-menu"
                        style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                      >
                        <FilterableComponentEmployee
                          noofItems={setnoOfAvailableData}
                          allFilterFields={setActiveFilterFields}
                          filteredData={filteredData}
                          activeTab={"Interested"}
                          data={interestedData}
                          filterField={activeFilterField}
                          onFilter={handleFilter}
                          completeData={completeGeneralData}
                          showingMenu={setShowFilterMenu}
                          dataForFilter={dataToFilter}
                          refetch={refetch}
                        />
                      </div>
                    )}
                  </div>
                </th>
                <th>
                  <div className='d-flex align-items-center justify-content-center position-relative'>
                    <div ref={el => fieldRefs.current['AssignDate'] = el}>
                      Assign Date
                    </div>

                    <div className='RM_filter_icon'>
                      {isActiveField('AssignDate') ? (
                        <FaFilter onClick={() => handleFilterClick("AssignDate")} />
                      ) : (
                        <BsFilter onClick={() => handleFilterClick("AssignDate")} />
                      )}
                    </div>

                    {/* ---------------------filter component--------------------------- */}
                    {showFilterMenu && activeFilterField === 'AssignDate' && (
                      <div
                        ref={filterMenuRef}
                        className="filter-menu"
                        style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                      >
                        <FilterableComponentEmployee
                          noofItems={setnoOfAvailableData}
                          allFilterFields={setActiveFilterFields}
                          filteredData={filteredData}
                          activeTab={"Interested"}
                          data={interestedData}
                          filterField={activeFilterField}
                          onFilter={handleFilter}
                          completeData={completeGeneralData}
                          showingMenu={setShowFilterMenu}
                          dataForFilter={dataToFilter}
                          refetch={refetch}
                        />
                      </div>
                    )}
                  </div>
                </th>
                <th className="rm-sticky-action">Action</th>
                {/* <th>Add Projection</th>
                                {designation !== "Sales Manager" || fordesignation !== "admin" && (<th>Forward To Bdm</th>)} */}
              </tr>
            </thead>
            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan="11">
                    <div className="LoaderTDSatyle w-100">
                      <ClipLoader
                        color="lightgrey"
                        loading={true}
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
                {interestedData && interestedData.map((company, index) => {
               
                  console.log("companycheckinghere" , company)
                  console.log("type" , typeof(bdenumber))
               
                  return (
                    <tr
                      key={company._id}
                      style={{ border: "1px solid #ddd" }}
                      onMouseDown={() => handleMouseDown(company._id)} // Start drag selection
                      onMouseOver={() => handleMouseEnter(company._id)} // Continue drag selection
                      onMouseUp={handleMouseUp} // End drag selection
                      id={
                        selectedRows && selectedRows.includes(company._id) ? "selected_admin" : ""
                      } // Highlight selected rows
                    >
                      {(fordesignation === "admin" || fordesignation === "datamanager") && (
                        <td
                          className="AEP-sticky-left-1"
                          style={{
                            position: "sticky",
                            left: 0,
                            zIndex: 1,
                            background: "white",
                          }}
                        >
                          <label className="table-check">
                            <input
                              type="checkbox"
                              checked={selectedRows && selectedRows.includes(company._id)}
                              onChange={(e) => handleCheckboxChange(company._id, e)}
                              onMouseUp={handleMouseUp}
                            />
                            <span class="table_checkmark"></span>
                          </label>
                        </td>
                      )}
                      <td
                        className={
                          (fordesignation === "admin" || fordesignation === "datamanager")
                            ? "AEP-sticky-left-2"
                            : "rm-sticky-left-1 "
                        }
                      >
                        {startIndex + index + 1}
                      </td>
                      <td style={{ width: 'fit-content' }}
                        className={
                          (fordesignation === "admin" || fordesignation === "datamanager")
                            ? "AEP-sticky-left-3"
                            : "rm-sticky-left-2 "
                        }
                      >
                        {company["Company Name"]}
                      </td>
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
                        <LuHistory
                          onClick={() => {
                            // Check if call history is available and contains relevant data
                            const filteredCallHistory = (company.clientCallHistory || company.callHistoryData || []).filter(
                              (call) =>
                                call.emp_number === bdenumber || call.emp_name?.trim().toLowerCase() === company.bdmName?.trim().toLowerCase()
                            );

                            if (filteredCallHistory.length > 0) {
                              handleShowCallHistory(
                                company["Company Name"],
                                company["Company Number"],
                                bdenumber,
                                company.bdmName,
                                company.bdmAcceptStatus,
                                company.bdeForwardDate,
                                filteredCallHistory
                              );
                            }
                          }}
                          style={{
                            cursor:
                              (company.clientCallHistory || company.callHistoryData)?.some(
                                (call) =>
                                  call.emp_number === bdenumber || call.emp_name?.trim().toLowerCase() === company.bdmName?.trim().toLowerCase()
                              )
                                ? "pointer"
                                : "not-allowed",
                            width: "15px",
                            height: "15px",
                            opacity:
                              (company.clientCallHistory || company.callHistoryData)?.some(
                                (call) =>
                                  call.emp_number === bdenumber || call.emp_name?.trim().toLowerCase() === company.bdmName?.trim().toLowerCase()
                              )
                                ? 1
                                : 0.5, // Visual feedback for disabled state
                          }}
                          color={
                            (company.clientCallHistory || company.callHistoryData)?.some(
                              (call) =>
                                call.emp_number === bdenumber || call.emp_name?.trim().toLowerCase() === company.bdmName?.trim().toLowerCase()
                            )
                              ? "#fbb900" : "#000000"// Change color based on availability
                          }
                        />
                      </td>
                      <td style={{ width: "150px" }}>
                        <div className="d-flex align-items-center justify-content-between">
                          {(fordesignation === "admin" || fordesignation === "datamanager") ? (
                            <div
                              className={company.Status === "Interested" ? "dfault_interested-status" :
                                company.Status === "FollowUp" ? "dfault_followup-status" :
                                  null}>
                              {company.Status}
                            </div>) : (
                            <EmployeeStatusChange
                              key={company._id}
                              companyName={company && company["Company Name"]}
                              companyStatus={company.Status}
                              id={company._id}
                              refetch={refetch}
                              mainStatus={dataStatus}
                              setCompanyName={setCompanyName}
                              setCompanyEmail={setCompanyEmail}
                              setCompanyInco={setCompanyInco}
                              setCompanyId={setCompanyId}
                              setCompanyNumber={setCompanyNumber}
                              setDeletedEmployeeStatus={setDeletedEmployeeStatus}
                              setNewBdeName={setNewBdeName}
                              isDeletedEmployeeCompany={
                                company.isDeletedEmployeeCompany
                              }
                              cemail={company["Company Email"]}
                              cindate={company["Incorporation Date"]}
                              cnum={company["Company Number"]}
                              ename={ename}
                              bdmAcceptStatus={company.bdmAcceptStatus}
                              handleFormOpen={handleOpenFormOpen}
                              setOpenBacdrop={setOpenBacdrop}
                              previousStatus={company.previousStatusToUndo}
                            />
                          )}
                          <div
                            className={
                              (company.interestedInformation === null || company.interestedInformation.length === 0)
                                ? (company.Status === "Interested"
                                  ? "intersted-history-btn disabled"
                                  : company.Status === "FollowUp"
                                    ? "followup-history-btn disabled"
                                    : "")
                                : (company.Status === "Interested"
                                  ? "intersted-history-btn"
                                  : company.Status === "FollowUp"
                                    ? "followup-history-btn"
                                    : "")
                            }
                          >

                            <FaEye
                              key={company._id}
                              style={{ border: "transparent", background: "none" }}
                              data-bs-toggle="modal"
                              data-bs-target={`#${`modal-${company["Company Name"].replace(/\s+/g, '')}`}-info`}
                              title="Interested Information"
                            //disabled={!company.interestedInformation}
                            />

                            <EmployeeInterestedInformationDialog
                              key={company._id}
                              modalId={`modal-${company["Company Name"].replace(/\s+/g, '')}-info`}
                              companyName={company["Company Name"]}
                              interestedInformation={company.interestedInformation} // Pass the interested information here
                              refetch={refetch}
                              ename={ename}
                              secretKey={secretKey}
                              status={company.Status}
                              companyStatus={company.Status}
                              forView={true}
                              fordesignation={fordesignation}

                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div
                          key={company._id}
                          className="d-flex align-items-center justify-content-between w-100"
                        >

                          {(fordesignation === "admin" || fordesignation === "datamanager") ? (<>

                            <AdminRemarksDialog
                              key={`${company["Company Name"]}-${index}`}
                              currentRemarks={company.Remarks}
                              companyID={company._id}
                              companyStatus={company.Status}
                              secretKey={secretKey} />
                          </>

                          ) :
                            (<>

                              <p
                                className="rematkText text-wrap m-0"
                                title={company.Remarks}
                              >
                                {!company["Remarks"] ? "No Remarks" : company.Remarks}
                              </p>
                              <RemarksDialog
                                key={company._id}
                                currentCompanyName={company["Company Name"]}
                                //remarksHistory={remarksHistory} // pass your remarks history data
                                companyId={company._id}
                                remarksKey="remarks" // Adjust this based on the type of remarks (general or bdm)
                                isEditable={company.bdmAcceptStatus !== "Accept"} // Allow editing if status is not "Accept"
                                bdmAcceptStatus={company.bdmAcceptStatus}
                                companyStatus={company.Status}
                                secretKey={secretKey}
                                //fetchRemarksHistory={fetchRemarksHistory}
                                bdeName={ename}
                                bdmName={company.bdmName}
                                refetch={refetch}
                                mainRemarks={company.Remarks}
                                designation={designation}
                                fordesignation={fordesignation}
                              />
                            </>)}
                        </div>
                      </td>
                      <td>
                        <EmployeeNextFollowDate
                          key={company._id}
                          id={company._id}
                          nextFollowDate={company.bdeNextFollowUpDate}
                          refetch={refetch}
                          status={company.Status}
                        />
                      </td>
                      <td>
                        <Tooltip
                          title={`Age: ${calculateAgeFromDate(company["Company Incorporation Date  "])}`}
                          arrow
                        >
                          <span>
                            {formatDateNew(company["Company Incorporation Date  "])}
                          </span>
                        </Tooltip>
                      </td>
                      <td>{company["City"]}</td>
                      <td>{company["State"]}</td>
                      <td>{company["Company Email"]}</td>
                      <td>{formatDateNew(company["AssignDate"])}</td>
                      <td className="rm-sticky-action">
                        <div className="d-flex align-items-center justify-content-between">
                          {projectionData && projectionData
                            .sort((a, b) => new Date(b.projectionDate) - new Date(a.projectionDate)) // Sort by projectionDate in descending order
                            .some((item) => item.companyName === company["Company Name"]) ? (
                            <IconButton
                              onClick={() => {
                                // Find the latest projection for the specified company after sorting
                                const matchedItem = projectionData
                                  .sort((a, b) => new Date(b.projectionDate) - new Date(a.projectionDate))
                                  .find((item) => item.companyName === company["Company Name"]);

                                const paymentDate = new Date(matchedItem.estPaymentDate).setHours(0, 0, 0, 0);
                                const currentDate = new Date().setHours(0, 0, 0, 0);

                                // Check if payment date is before the current date
                                if (paymentDate >= currentDate) {
                                  setIsProjectionEditable((fordesignation === "admin" || fordesignation === "datamanager") ? false : true);  // Enable edit mode
                                  setViewProjection((fordesignation === "admin" || fordesignation === "datamanager") ? true : false); // Open new projection dialog with disabled fields when designation is admin or datamanager
                                  setShowNewAddProjection(true);  // Open new projection dialog
                                  setProjectionDataToBeFilled(matchedItem); // Set matched item in the state
                                  // console.log("Projection data to be updated :", matchedItem);
                                  setViewedForParticularCompany(false)
                                  setCompanyId(company._id)
                                } else {
                                  setIsProjectionEditable(false); // Disable edit mode
                                  (fordesignation === "admin" || fordesignation === "datamanager") && setViewProjection(true); // Open new projection dialog with disabled fields whose payment date is passed
                                  setShowNewAddProjection(true);  // Open new projection dialog
                                  setProjectionDataToBeFilled(fordesignation === "admin" || fordesignation === "datamanager" ? matchedItem : company); // Set matched item in the state
                                  setViewedForParticularCompany(true)
                                  setCompanyId(company._id)
                                  // console.log("Projection data to be viewed :", matchedItem);
                                }
                              }}
                            >
                              <RiEditCircleFill
                                color={projectionData.find((item) => item.companyName === company["Company Name"] && new Date(item.estPaymentDate).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0))
                                  ? "#fbb900"
                                  : (fordesignation === "admin" || fordesignation === "datamanager") ? "#fbb900" : "grey"}
                                style={{
                                  width: "17px",
                                  height: "17px",
                                }}
                                title={(fordesignation === "admin" || fordesignation === "datamanager") ? "View Projection"
                                  : projectionData.find((item) => item.companyName === company["Company Name"] && new Date(item.estPaymentDate).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0))
                                    ? "Update Projection" : "Add Projection"}
                              />
                            </IconButton>
                          ) : (
                            <IconButton
                              onClick={() => {
                                setViewedForParticularCompany(true)
                                setIsProjectionEditable(false); // Not opened in editing mode
                                setShowNewAddProjection(true);  // Open new projection dialog
                                setViewProjection(false); // Open new projection dialog with enabled fields
                                setProjectionDataToBeFilled(company); // Send whole company data when no match found
                                // console.log("Projection data to be added :", company);
                              }}
                              disabled={fordesignation === "admin" || fordesignation === "datamanager"}
                            >
                              <RiEditCircleFill
                                color={(fordesignation === "admin" || fordesignation === "datamanager") ? "lightgrey" : "grey"}
                                style={{
                                  width: "17px",
                                  height: "17px",
                                }}
                                title={(fordesignation === "admin" || fordesignation === "datamanager") ? "View Projection" : "Add Projection"}
                              />
                            </IconButton>
                          )}
                          {
                            ((fordesignation !== "admin" && fordesignation !== "datamanager") && designation !== "Sales Manager") && (
                              <TiArrowForward onClick={() => {
                                setShowForwardToBdmPopup(true);
                                setCompanyId(company._id);
                                setCompanyName(company["Company Name"]);
                                setCompanyStatus(company.Status);
                              }}
                                style={{
                                  cursor: "pointer",
                                  width: "17px",
                                  height: "17px",
                                }}
                                title="Forward To BDM"
                                color="grey"
                              />
                            )}
                        </div>
                      </td>
                    </tr>

                  )

                })}

              </tbody>
            )}
            {interestedData && interestedData.length === 0 && !isLoading && (
              <tbody>
                <tr>
                  <td colSpan="14" className="p-2 particular">
                    <Nodata />
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
        {interestedData && interestedData.length !== 0 && (
          <div className="pagination d-flex align-items-center justify-content-center w-100">
            <div>
              <button
                className="btn-pagination"
                onClick={prevPage}
                disabled={currentPage === 0}
              >
                <GoArrowLeft />
              </button>
            </div>
            <div className="ml-3 mr-3">
              Page {currentPage + 1} of {totalPages}
            </div>
            <div>
              <button
                className="btn-pagination"
                onClick={nextPage}
                disabled={currentPage >= totalPages - 1}
              >
                <GoArrowRight />
              </button>
            </div>

            {showNewAddProjection && (
              <NewProjectionDialog
                open={showNewAddProjection}
                closepopup={handleCloseNewProjection}
                projectionData={projectionDataToBeFilled}
                isProjectionEditable={isProjectionEditable}
                viewProjection={viewProjection}
                fetchNewProjection={fetchProjections}
                employeeName={ename}
                viewedForParticularCompany={viewedForParticularCompany}
                setViewedForParticularCompany={setViewedForParticularCompany}
                editableCompanyId={companyId}
                setEditableCompanyId={setCompanyId}
              />
            )}

            {showForwardToBdmPopup && (
              <BdmMaturedCasesDialogBox
                open={showForwardToBdmPopup}
                closepopup={handleCloseBdmPopup}
                key={companyId}
                currentData={interestedData}
                forwardedCompany={companyName}
                forwardCompanyId={companyId}
                forwardedStatus={companyStatus}
                forwardedEName={ename}
                bdeOldStatus={companyStatus}
                bdmNewAcceptStatus={"Pending"}
                fetchNewData={refetch}
                forwardingPerson={"sales executive"}
              />
            )}
          </div>
        )}
      </>

    </div>
  );
}

export default EmployeeInterestedLeads;