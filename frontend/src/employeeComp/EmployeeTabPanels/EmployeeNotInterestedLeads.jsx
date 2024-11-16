import React, { useState, useEffect, useRef } from 'react';
import { LuHistory } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import ClipLoader from "react-spinners/ClipLoader";
import { GoArrowLeft } from "react-icons/go";
import { GoArrowRight } from "react-icons/go";
import Nodata from '../../components/Nodata';
import RemarksDialog from '../ExtraComponents/RemarksDialog';
import EmployeeStatusChange from '../ExtraComponents/EmployeeStatusChange';
import RedesignedForm from '../../admin/RedesignedForm';
import AddLeadForm from '../../admin/AddLeadForm';
import FilterableComponentEmployee from "../ExtraComponents/FilterableComponentEmployee";
import { BsFilter } from "react-icons/bs";
import { FaFilter } from "react-icons/fa";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';



function EmployeeNotInterestedLeads({
    notInterestedLeads,
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
    designation,
    fordesignation,
    setSelectedRows,
    handleCheckboxChange,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    selectedRows,
    bdenumber,
    filteredData,
    filterMethod,
    completeGeneralData,
    dataToFilter,
    setNotInterestedData,
    setNotInterestedDataCount,
    setFilteredData,
    activeFilterField,
    setActiveFilterField,
    activeFilterFields,
    setActiveFilterFields,
}) {

    const [companyName, setCompanyName] = useState("");
    const [maturedCompanyName, setMaturedCompanyName] = useState("");
    const [companyEmail, setCompanyEmail] = useState("");
    const [companyInco, setCompanyInco] = useState(null);
    const [companyNumber, setCompanyNumber] = useState(0);
    const [companyId, setCompanyId] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    //const [editFormOpen, setEditFormOpen] = useState(false);
    const [addFormOpen, setAddFormOpen] = useState(false);
    const [deletedEmployeeStatus, setDeletedEmployeeStatus] = useState(false)
    const [newBdeName, setNewBdeName] = useState("")
    const [nowToFetch, setNowToFetch] = useState(false);
    const [openBacdrop, setOpenBacdrop] = useState(false)

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

    // ----------------filter component----------------------
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    // const [activeFilterFields, setActiveFilterFields] = useState([]); // New state for active filter fields
    // const [activeFilterField, setActiveFilterField] = useState(null);
    const [error, setError] = useState('');
    const [noOfAvailableData, setnoOfAvailableData] = useState(0);
    const [filterPosition, setFilterPosition] = useState({ top: 10, left: 5 });
    const [isScrollLocked, setIsScrollLocked] = useState(false)
    const fieldRefs = useRef({});
    const filterMenuRef = useRef(null); // Ref for the filter menu container
    // const [filteredData, setFilteredData] = useState([]);

    const handleFilter = (newData) => {
        setFilteredData(newData)
        setNotInterestedData(newData);
        setNotInterestedDataCount(newData.length);
    };

    const handleFilterClick = (field) => {
        if (activeFilterField === field) {
            setShowFilterMenu(!showFilterMenu);
            setIsScrollLocked(!showFilterMenu);
        } else {
            setActiveFilterField(field);
            setShowFilterMenu(true);
            setIsScrollLocked(true);

            // const rect = fieldRefs.current[field].getBoundingClientRect();
            // setFilterPosition({ top: rect.bottom, left: rect.left });
        }
    };
    const isActiveField = (field) => activeFilterFields.includes(field);

    // console.log("activeFilterFieldsInterested", activeFilterFields)
    // console.log("filterField" , activeFilterField)
    // console.log("notInterestedLeads", notInterestedLeads)
    // console.log("filteredData", filteredData)
    // console.log("dataToFilter", dataToFilter)
    // console.log("completeGeneralData", completeGeneralData)

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

    return (
        <div className="sales-panels-main" onMouseUp={handleMouseUp}>
            {openBacdrop && (<Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={openBacdrop}
                onClick={() => setOpenBacdrop(false)}>
                <CircularProgress color="inherit" />
            </Backdrop>)}
            {!formOpen && !addFormOpen && (
                <>
                    <div className="table table-responsive e-Leadtable-style m-0">
                        <table className="table table-vcenter table-nowrap" style={{ width: "2200px" }}>
                            <thead>
                                <tr className="tr-sticky">
                                    {(fordesignation === "admin" || fordesignation === "datamanager") &&
                                        (
                                            <th className='AEP-sticky-left-1'>
                                                <label className='table-check'>
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            selectedRows && notInterestedLeads && selectedRows.length === notInterestedLeads.length
                                                        }
                                                        onChange={(e) => handleCheckboxChange("all", e)}
                                                    />
                                                    <span class="table_checkmark"></span>
                                                </label>
                                            </th>
                                        )}
                                    <th className={(fordesignation === "admin" || fordesignation === "datamanager") ? "AEP-sticky-left-2" : "rm-sticky-left-1 "}>Sr. No</th>
                                    <th className={(fordesignation === "admin" || fordesignation === "datamanager") ? "AEP-sticky-left-3" : "rm-sticky-left-2 "}>
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
                                                        activeTab={"NotInterested"}
                                                        data={notInterestedLeads}
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
                                                        activeTab={"NotInterested"}
                                                        data={notInterestedLeads}
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
                                                        activeTab={"NotInterested"}
                                                        data={notInterestedLeads}
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
                                    <th>BDE Remarks</th>
                                    {designation !== "Sales Manager" && (
                                        <>
                                            <th>
                                                <div className='d-flex align-items-center justify-content-center position-relative'>
                                                    <div ref={el => fieldRefs.current['bdmAcceptStatus'] = el}>
                                                        BDM Forwarded
                                                    </div>

                                                    <div className='RM_filter_icon'>
                                                        {isActiveField('bdmAcceptStatus') ? (
                                                            <FaFilter onClick={() => handleFilterClick("bdmAcceptStatus")} />
                                                        ) : (
                                                            <BsFilter onClick={() => handleFilterClick("bdmAcceptStatus")} />
                                                        )}
                                                    </div>

                                                    {/* ---------------------filter component--------------------------- */}
                                                    {showFilterMenu && activeFilterField === 'bdmAcceptStatus' && (
                                                        <div
                                                            ref={filterMenuRef}
                                                            className="filter-menu"
                                                            style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                                                        >
                                                            <FilterableComponentEmployee
                                                                noofItems={setnoOfAvailableData}
                                                                allFilterFields={setActiveFilterFields}
                                                                filteredData={filteredData}
                                                                activeTab={"NotInterested"}
                                                                data={notInterestedLeads}
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
                                                    <div ref={el => fieldRefs.current['bdmName'] = el}>
                                                        BDM Name
                                                    </div>

                                                    <div className='RM_filter_icon'>
                                                        {isActiveField('bdmName') ? (
                                                            <FaFilter onClick={() => handleFilterClick("bdmName")} />
                                                        ) : (
                                                            <BsFilter onClick={() => handleFilterClick("bdmName")} />
                                                        )}
                                                    </div>

                                                    {/* ---------------------filter component--------------------------- */}
                                                    {showFilterMenu && activeFilterField === 'bdmName' && (
                                                        <div
                                                            ref={filterMenuRef}
                                                            className="filter-menu"
                                                            style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                                                        >
                                                            <FilterableComponentEmployee
                                                                noofItems={setnoOfAvailableData}
                                                                allFilterFields={setActiveFilterFields}
                                                                filteredData={filteredData}
                                                                activeTab={"NotInterested"}
                                                                data={notInterestedLeads}
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
                                                    <div ref={el => fieldRefs.current['bdmStatus'] = el}>
                                                        BDM Status
                                                    </div>

                                                    <div className='RM_filter_icon'>
                                                        {isActiveField('bdmStatus') ? (
                                                            <FaFilter onClick={() => handleFilterClick("bdmStatus")} />
                                                        ) : (
                                                            <BsFilter onClick={() => handleFilterClick("bdmStatus")} />
                                                        )}
                                                    </div>

                                                    {/* ---------------------filter component--------------------------- */}
                                                    {showFilterMenu && activeFilterField === 'bdmStatus' && (
                                                        <div
                                                            ref={filterMenuRef}
                                                            className="filter-menu"
                                                            style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                                                        >
                                                            <FilterableComponentEmployee
                                                                noofItems={setnoOfAvailableData}
                                                                allFilterFields={setActiveFilterFields}
                                                                filteredData={filteredData}
                                                                activeTab={"NotInterested"}
                                                                data={notInterestedLeads}
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
                                            <th>BDM Remarks</th>
                                        </>
                                    )}
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
                                                        activeTab={"NotInterested"}
                                                        data={notInterestedLeads}
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
                                                        activeTab={"NotInterested"}
                                                        data={notInterestedLeads}
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
                                                        activeTab={"NotInterested"}
                                                        data={notInterestedLeads}
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
                                                        activeTab={"NotInterested"}
                                                        data={notInterestedLeads}
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
                                                        activeTab={"NotInterested"}
                                                        data={notInterestedLeads}
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
                                </tr>
                            </thead>
                            {
                                isLoading ? (
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
                                        {notInterestedLeads && notInterestedLeads.map((company, index) => (
                                            <tr key={company._id}

                                                style={{ border: "1px solid #ddd" }}
                                                onMouseDown={() => handleMouseDown(company._id)} // Start drag selection
                                                onMouseOver={() => handleMouseEnter(company._id)} // Continue drag selection
                                                onMouseUp={handleMouseUp} // End drag selection
                                                id={selectedRows && selectedRows.includes(company._id) ? 'selected_admin' : ''} // Highlight selected rows
                                            >
                                                {(fordesignation === "admin" || fordesignation === "datamanager") && (
                                                    <td
                                                        className='AEP-sticky-left-1'
                                                        style={{
                                                            position: "sticky",
                                                            left: 0,
                                                            zIndex: 1,
                                                            background: "white",
                                                        }}>
                                                        <label className='table-check'>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedRows && selectedRows.includes(
                                                                    company._id
                                                                )}
                                                                onChange={(e) =>
                                                                    handleCheckboxChange(company._id, e)
                                                                }
                                                                onMouseUp={handleMouseUp}
                                                            />
                                                            <span class="table_checkmark"></span>
                                                        </label>
                                                    </td>
                                                )}
                                                <td className={(fordesignation === "admin" || fordesignation === "datamanager") ? "AEP-sticky-left-2" : "rm-sticky-left-1 "}>{startIndex + index + 1}</td>
                                                <td className={(fordesignation === "admin" || fordesignation === "datamanager") ? "AEP-sticky-left-3" : "rm-sticky-left-2 "}>{company["Company Name"]}</td>
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
                                                            handleShowCallHistory(
                                                                company["Company Name"],
                                                                company["Company Number"],
                                                                bdenumber,
                                                                company.bdmName

                                                            );
                                                            // setShowCallHistory(true);
                                                            // setClientNumber(company["Company Number"]);
                                                        }}
                                                        style={{
                                                            cursor: "pointer",
                                                            width: "15px",
                                                            height: "15px",
                                                        }}
                                                        color="grey"
                                                    />
                                                </td>

                                                <td>
                                                    {(fordesignation === "admin" || fordesignation === "datamanager") ? (<div
                                                        className={company.Status === "Not Interested" ? "dfault_notinterested-status" :
                                                            company.Status === "Junk" ? "dfault_junk-status" :
                                                                null}>
                                                        {company.Status}
                                                    </div>) : (
                                                        <EmployeeStatusChange
                                                            key={`${company["Company Name"]}-${index}`}
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
                                                            isDeletedEmployeeCompany={company.isDeletedEmployeeCompany}
                                                            setFormOpen={setFormOpen}
                                                            setAddFormOpen={setAddFormOpen}
                                                            cemail={company["Company Email"]}
                                                            cindate={company["Incorporation Date"]}
                                                            cnum={company["Company Number"]}
                                                            ename={company.ename}
                                                            bdmAcceptStatus={company.bdmAcceptStatus}
                                                            setOpenBacdrop={setOpenBacdrop}
                                                        />)}
                                                </td>
                                                <td>
                                                    <div
                                                        key={company._id} className='d-flex align-items-center justify-content-between w-100'  >
                                                        <p
                                                            className="rematkText text-wrap m-0"
                                                            title={company.Remarks}
                                                        >
                                                            {!company["Remarks"]
                                                                ? "No Remarks"
                                                                : company.Remarks}
                                                        </p>
                                                        <RemarksDialog
                                                            key={`${company["Company Name"]}-${index}`} // Using index or another field to create a unique key
                                                            currentCompanyName={company["Company Name"]}
                                                            //remarksHistory={remarksHistory} // pass your remarks history data
                                                            companyId={company._id}
                                                            remarksKey="remarks" // Adjust this based on the type of remarks (general or bdm)
                                                            isEditable={company.bdmAcceptStatus !== "Accept"} // Allow editing if status is not "Accept"
                                                            bdmAcceptStatus={company.bdmAcceptStatus}
                                                            companyStatus={company.Status}
                                                            secretKey={secretKey}
                                                            //fetchRemarksHistory={fetchRemarksHistory}
                                                            bdeName={company.ename}
                                                            refetch={refetch}
                                                            mainRemarks={company.Remarks}
                                                            fordesignation={fordesignation}

                                                        />
                                                    </div>
                                                </td>
                                                {designation !== "Sales Manager" && (<>
                                                    <td>
                                                        {company.bdmAcceptStatus !== "NotForwarded" ? "Yes" : "No"}
                                                    </td>
                                                    <td>{company.bdmAcceptStatus !== "NotForwarded" ? company.bdmName : "-"}</td>
                                                    <td>{company.bdmAcceptStatus !== "NotForwarded" ? company.Status : "-"}</td>
                                                    <td>{company.bdmAcceptStatus !== "NotForwarded" ?
                                                        <div key={company._id}
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                                width: "100px",
                                                            }}>
                                                            <p
                                                                className="rematkText text-wrap m-0"
                                                                title={company.remarks}
                                                            >
                                                                {!company.bdmRemarks
                                                                    ? "No Remarks"
                                                                    : company.bdmRemarks}
                                                            </p>
                                                            <RemarksDialog
                                                                key={`${company["Company Name"]}-${index}`} // Using index or another field to create a unique key
                                                                currentCompanyName={company["Company Name"]}
                                                                //filteredRemarks={filteredRemarks}
                                                                companyId={company._id}
                                                                remarksKey="bdmRemarks" // For BDM remarks
                                                                isEditable={false} // Disable editing
                                                                secretKey={secretKey}
                                                                //fetchRemarksHistory={fetchRemarksHistory}
                                                                bdeName={company.ename}
                                                                fetchNewData={refetch}
                                                                bdmName={company.bdmName}
                                                                bdmAcceptStatus={company.bdmAcceptStatus}
                                                                companyStatus={company.Status}
                                                                mainRemarks={company.Remarks}
                                                                fordesignation={fordesignation}

                                                            //remarksHistory={remarksHistory} // pass your remarks history data
                                                            />
                                                        </div> : "-"}</td>
                                                </>)}
                                                <td>
                                                    {formatDateNew(
                                                        company["Company Incorporation Date  "]
                                                    )}
                                                </td>
                                                <td>{company["City"]}</td>
                                                <td>{company["State"]}</td>
                                                <td>{company["Company Email"]}</td>
                                                <td>{formatDateNew(company["AssignDate"])}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                )}
                            {notInterestedLeads && notInterestedLeads.length === 0 && !isLoading && (
                                <tbody>
                                    <tr>
                                        <td colSpan="11" className="p-2 particular">
                                            <Nodata />
                                        </td>
                                    </tr>
                                </tbody>
                            )}
                        </table>
                    </div>
                    {notInterestedLeads && notInterestedLeads.length !== 0 && (
                        <div className="pagination d-flex align-items-center justify-content-center w-100">
                            <div>
                                <button className='btn-pagination' onClick={prevPage} disabled={currentPage === 0}>
                                    <GoArrowLeft />
                                </button>
                            </div>
                            <div className='ml-3 mr-3'>
                                Page {currentPage + 1} of {totalPages}
                            </div>
                            <div>
                                <button className='btn-pagination' onClick={nextPage} disabled={currentPage >= totalPages - 1}>
                                    <GoArrowRight />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
            {formOpen && (
                <>
                    <RedesignedForm
                        // matured={true}
                        // companysId={companyId}
                        setDataStatus={setdataStatus}
                        setFormOpen={setFormOpen}
                        companysName={companyName}
                        companysEmail={companyEmail}
                        companyNumber={companyNumber}
                        setNowToFetch={setNowToFetch}
                        companysInco={companyInco}
                        employeeName={ename}
                        employeeEmail={email}
                    />
                </>
            )}
            {addFormOpen && (
                <>
                    {" "}
                    <AddLeadForm
                        employeeEmail={email}
                        newBdeName={newBdeName}
                        isDeletedEmployeeCompany={deletedEmployeeStatus}
                        setFormOpen={setAddFormOpen}
                        companysName={companyName}
                        setNowToFetch={setNowToFetch}
                        setDataStatus={setdataStatus}
                        employeeName={ename}
                    />
                </>
            )}
        </div>
    );
}

export default EmployeeNotInterestedLeads;