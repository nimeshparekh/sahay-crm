import React, { useEffect, useState } from "react";
import axios from 'axios';
import RecruiterHeader from "../Components/RecuiterHeader";
import RecuiterNavbar from "../Components/RecuiterNavbar";
import io from 'socket.io-client';
import RecruiterApplicantReport from "./RecruiterApplicantReport";
import RecruiterSelectdReport from "./RecruiterSelectedReport";
import RecruiterInterviewDate from "../ExtraComponents/RecruiterInterviewDate";
import RecruiterInterviewReport from "./RecruiterInterviewReport";


function RecruiterDashboard() {

  const recruiterUserId = localStorage.getItem("recruiterUserId")
  const [employeeData, setEmployeeData] = useState([])
  const secretKey = process.env.REACT_APP_SECRET_KEY;
  const [currentDataLoading, setCurrentDataLoading] = useState(false)
  const [rmServicesData, setRmServicesData] = useState([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDocumentsGeneral, setTotalDocumentsGeneral] = useState(0);
  const [totalDocumentsUnderReview, setTotalDocumentsUnderReview] = useState(0);
  const [totalDocumentsOnHold, setTotalDocumentsOnHold] = useState(0);
  const [totalDocumentsDisqualified, setTotalDocumentsDisqualified] = useState(0);
  const [totalDocumentsRejected, settotalDocumentsRejected] = useState(0);
  const [totalDocumentsSelected, settotalDocumentsSelected] = useState(0);
  const [noOfFilteredData, setnoOfFilteredData] = useState(0);
  const [showNoOfFilteredData, setShowNoOfFilteredData] = useState(true);
  const [openCompanyTaskComponent, setOpenCompanyTaskComponent] = useState(false)
  const [completeEmployeeInfo, setcompleteEmployeeInfo] = useState([])

  useEffect(() => {
    document.title = `Recruiter-Sahay-CRM`;
  }, []);

  useEffect(() => {
    const socket = secretKey === "http://localhost:3001/api" ? io("http://localhost:3001") : io("wss://startupsahay.in", {
      secure: true, // Use HTTPS
      path: '/socket.io',
      reconnection: true,
      transports: ['websocket'],
    });

    socket.on("recruiter-general-status-updated", (res) => {
      fetchRMServicesData(search)
    });
    socket.on("recruiter-application-submitted", (res) => {
      fetchRMServicesData(search)
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  const fetchData = async () => {
    try {
      const response = await axios.get(`${secretKey}/employee/einfo`);
      // Set the retrieved data in the state
      const tempData = response.data;
      //console.log(tempData)
      const userData = tempData.find((item) => item._id === recruiterUserId);
      //console.log(userData)
      setEmployeeData(userData);
      setcompleteEmployeeInfo(tempData);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };
  function formatDatePro(inputDate) {
    const date = new Date(inputDate);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  }


  const fetchRMServicesData = async (searchQuery = "", page = 1) => {
    try {
      setCurrentDataLoading(true);
      const response = await axios.get(`${secretKey}/recruiter/recruiter-data-dashboard`);
      const {
        data,
        totalPages,
        totalDocumentsGeneral,
        totalDocumentsUnderReview,
        totalDocumentsOnHold,
        totalDocumentsDisqualified,
        totalDocumentsRejected,
        totalDocumentsSelected,


      } = response.data;
     

      // If it's a search query, replace the data; otherwise, append for pagination
      if (page === 1) {
        // This is either the first page load or a search operation
        setRmServicesData(data);
      } else {
        // This is a pagination request
        setRmServicesData(prevData => [...prevData, ...data]);
      }
      setTotalDocumentsUnderReview(totalDocumentsUnderReview)
      setTotalDocumentsGeneral(totalDocumentsGeneral)
      setTotalDocumentsOnHold(totalDocumentsOnHold)
      setTotalDocumentsDisqualified(totalDocumentsDisqualified)
      settotalDocumentsRejected(totalDocumentsRejected)
      settotalDocumentsSelected(totalDocumentsSelected)

      setTotalPages(totalPages); // Update total pages
    } catch (error) {
      console.error("Error fetching data", error.message);
    } finally {
      setCurrentDataLoading(false);
    }
  };


  useEffect(() => {
    fetchRMServicesData("", page); // Fetch data initially
  }, [employeeData]);

  useEffect(() => {
    fetchRMServicesData(search, page); // Fetch data when search query changes
  }, [search]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value); // Update search query state
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="admin-dashboard">
      {/* <RecruiterHeader id={employeeData._id}
        name={employeeData.ename}
        empProfile={employeeData.profilePhoto && employeeData.profilePhoto.length !== 0 && employeeData.profilePhoto[0].filename}
        gender={employeeData.gender}
        designation={employeeData.newDesignation} />
      <RecuiterNavbar recruiterUserId={recruiterUserId} /> */}
      {/* --------------------------------------TABLE-------------------------------------- */}
      <RecruiterApplicantReport
        recruiterData={rmServicesData} />
      <RecruiterSelectdReport
        recruiterData={rmServicesData} />
      <RecruiterInterviewReport
        recruiterData={rmServicesData} />


    </div>


  )
}

export default RecruiterDashboard;