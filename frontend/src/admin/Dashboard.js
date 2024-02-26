import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Header from "./Header";
import axios from "axios";
import Nodata from "../components/Nodata";
import "../assets/styles.css";
import { IconButton } from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';

import AnnouncementIcon from "@mui/icons-material/Announcement";
// import LoginAdmin from "./LoginAdmin";

function Dashboard() {
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [bookingObject, setBookingObject] = useState([]);
  const [filteredBooking, setFilteredBooking] = useState([]);
  const [dateRange, setDateRange] = useState("by-today");
  const [showUpdates, setShowUpdates] = useState(false);
  const secretKey = process.env.REACT_APP_SECRET_KEY;
  const formatDate = (inputDate) => {
    const date = new Date(inputDate);
    const convertedDate = date.toLocaleDateString();
    return convertedDate;
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Make a GET request to fetch recent updates data
        const response = await axios.get(`${secretKey}/recent-updates`);
        // Set the retrieved data in the state
        setRecentUpdates(response.data);
      } catch (error) {
        console.error("Error fetching recent updates:", error.message);
      }
    };

    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${secretKey}/companies`);
        const today = new Date().toLocaleDateString();
        const data = response.data.companies;

        const filteredData = data.filter((company) => {
          // Assuming bookingDate is in the format of a string representing a date (e.g., "YYYY-MM-DD")
          const companyDate = formatDate(company.bookingDate);
          console.log(companyDate, today);
          return companyDate === today;
        });

        setBookingObject(data);
        setFilteredBooking(filteredData);
        console.log(filteredData);
      } catch (error) {
        console.error("Error Fetching Booking Details", error.message);
      }
    };

    // Call the fetchData function when the component mounts
    fetchData();
    fetchCompanies();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uniqueBdeNames = new Set();

  const formatTime = (date, time) => {
    const currentDate = new Date().toLocaleDateString();
    const pm = time.toLowerCase().includes("pm") ? true : false;
    const currentDateTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (date === currentDate) {
      const [hour, minute, second] = time.split(/:| /).map(Number);
      const formattedHour = pm ? hour + 12 : hour;
      const formattedTime = `${formattedHour}:${minute}`;
      return formattedTime;
    } else if (date === currentDate - 1) {
      return "Yesterday";
    } else {
      return date;
    }
  };
  const changeUpdate = () => {
    setShowUpdates(!showUpdates);
  };

  const handleChangeDate = (filter) => {
    setDateRange(filter);
    const today = new Date(); // Current date

    if (filter === "by-week") {
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // Date 7 days ago

      const newfilteredData = bookingObject.filter((company) => {
        const companyDate = new Date(company.bookingDate);
        return companyDate >= lastWeek && companyDate <= today;
      });
      setFilteredBooking(newfilteredData);
    } else if (filter === "by-month") {
      const lastMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate()
      ); // Date 1 month ago

      const newfilteredData = bookingObject.filter((company) => {
        const companyDate = new Date(company.bookingDate);
        return companyDate >= lastMonth && companyDate <= today;
      });
      setFilteredBooking(newfilteredData);
    } else if (filter === "by-year") {
      const lastYear = new Date(
        today.getFullYear() - 1,
        today.getMonth(),
        today.getDate()
      ); // Date 1 year ago

      const newfilteredData = bookingObject.filter((company) => {
        const companyDate = new Date(company.bookingDate);
        return companyDate >= lastYear && companyDate <= today;
      });
      setFilteredBooking(newfilteredData);
    } else if (filter === "by-today") {
      const newfilteredData = bookingObject.filter((company) => {
        const companyDate = new Date(company.bookingDate);
        return companyDate.toLocaleDateString() === today.toLocaleDateString();
      });
      setFilteredBooking(newfilteredData);
    }
  };
  const finalFilteredData = [];

  filteredBooking.forEach((obj) => {
    // Check if the bdeName is already in the Set
    console.log(obj.bdeName, uniqueBdeNames);
    if (!uniqueBdeNames.has(obj.bdeName)) {
      // If not, add it to the Set and push the object to the final array
      uniqueBdeNames.add(obj.bdeName);
      finalFilteredData.push(obj);
    }
  });
  const [expandedRow, setExpandedRow] = useState(null);

  const handleRowClick = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  // Now finalFilteredData contains an array of objects with unique bdeNames

  return (
    <div>
      <Header />
      <Navbar />
      <div className="page-wrapper">
        <div className="recent-updates-icon">
          <IconButton
            style={{ backgroundColor: "#ffb900", color: "white" }}
            onClick={changeUpdate}
          >
            <AnnouncementIcon />
          </IconButton>
        </div>
        <div className="page-header d-print-none">
          <div className="container-xl">
            <div className="row">
              <div
                style={{ display: showUpdates ? "block" : "none" }}
                className="col-sm-4 card recent-updates m-2"
              >
                <div className="card-header">
                  <h2>Recent Updates</h2>
                </div>

                <div className="card-body">
                  {recentUpdates.length !== 0 ? (
                    recentUpdates.map((obj) => (
                      <div className="row update-card ">
                        <div className="col">
                          <div className="text-truncate">
                            <strong>{obj.title}</strong>
                          </div>
                          <div className="text-muted">
                            {" "}
                            {formatTime(obj.date, obj.time)}
                          </div>
                        </div>
                        <div className="col-auto align-self-center">
                          <div className="badge bg-primary"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>
                      <Nodata />
                    </div>
                  )}
                </div>
              </div>
              <div className="col card todays-booking m-2">
                <div className="card-header d-flex justify-content-between ">
                  <div className="heading">
                    <h2>Total Booking</h2>
                  </div>
                  <div className="filter d-flex align-items-center">
                    <strong>Filter By :</strong>
                    <div className="filter-by">
                      <select
                        value={dateRange}
                        onChange={(e) => {
                          handleChangeDate(e.target.value);
                        }}
                        name="filter-by"
                        id="filter-by"
                        className="form-select"
                      >
                        <option value="by-today" selected>
                          today
                        </option>
                        <option value="by-week">Week</option>
                        <option value="by-month">Month</option>
                        <option value="by-year">Year</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div
                    className="row"
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
                      className="table-vcenter table-nowrap"
                    >
                      <thead>
                        <tr>
                          <th>SR.NO</th>
                          <th>BDE NAME</th>
                          <th>MATURED CASES</th>
                          <th>NUM OF UNIQUE SERVICES OFFERED</th>
                          <th>TOTAL PAYMENT</th>
                          <th>RECEIVED PAYMENT</th>
                          <th>PENDING PAYMENT</th>
                          {expandedRow !== null && (
                            <>
                              <th>50/50 CASE</th>
                              <th>CLOSED/SUPPORTED BY</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      {finalFilteredData.length !== 0 ? (
                        <>
                          <tbody>
                            {finalFilteredData.map((obj, index) => (
                              <>
                                <tr>
                                  <td>{index + 1}</td>
                                  <td>{obj.bdeName}</td>
                                  <td style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center"
                                  }}>
                                    {filteredBooking.filter((data) => {
                                      return (
                                        data.bdeName === obj.bdeName &&
                                        data.bdeName === obj.bdmName
                                      );
                                    }).length +
                                      filteredBooking.filter((data) => {
                                        return (
                                          data.bdeName === obj.bdeName &&
                                          data.bdeName !== obj.bdmName
                                        );
                                      }).length /
                                        2}{" "}
                                    <div>
                                      <IconButton  onClick={() => handleRowClick(index)}>
                                  <AddCircleIcon/>
                                      </IconButton>
                                      
                                    </div>
                                  </td>

                                  <td>
                                    {
                                      filteredBooking
                                        .filter(
                                          (data) => data.bdeName === obj.bdeName
                                        ) // Filter objects with bdeName same as myName
                                        .reduce((totalServices, obj) => {
                                          // Use reduce to calculate the total number of services
                                          return (
                                            totalServices +
                                            (obj.services && obj.services[0]
                                              ? obj.services[0]
                                                  .split(",")
                                                  .map((service) =>
                                                    service.trim()
                                                  ).length
                                              : 0)
                                          );
                                        }, 0) // Initialize totalServices as 0
                                    }
                                  </td>
                                  <td> {
    filteredBooking
      .filter((data) => data.bdeName === obj.bdeName) // Filter objects with bdeName same as myName
      .reduce((totalPayments, obj1) => { // Use reduce to calculate the total of totalPayments
        return totalPayments + (obj1.totalPayment ? obj1.totalPayment : 0);
      }, 0) // Initialize totalPayments as 0
  }</td>
                                  <td>  
                                    {obj.paymentTerms === "Full Advanced"
                                      ? obj.totalPayment
                                      : obj.firstPayment}
                                  </td>
                                  <td>
                                    {obj.paymentTerms === "Full Advanced"
                                      ? 0
                                      : obj.totalPayment - obj.firstPayment}
                                  </td>
                                  {/* <td>
                                    {obj.bdeName !== obj.bdmName ? "Yes" : "No"}
                                  </td>
                                  <td>
                                    {obj.bdeName !== obj.bdmName
                                      ? obj.bdmType === "closeby"
                                        ? `Closed by ${obj.bdmName}`
                                        : `Supported by ${obj.bdmName}`
                                      : "Self Closed"}
                                  </td> */}
                                </tr>
                                {expandedRow === index &&
                                  filteredBooking
                                    .filter(
                                      (data) => data.bdeName === obj.bdeName
                                    )
                                    .map((mainObj, index) => (
                                      <tr>
                                        <td>{`${expandedRow + 1}(${
                                          index + 1
                                        })`}</td>
                                        <td>{mainObj.bdeName}</td>
                                        <td>
                                          {mainObj.bdeName !== mainObj.bdmName
                                            ? 0.5
                                            : 1}
                                        </td>
                                        <td>
                                          {" "}
                                          {
                                            mainObj.services[0]
                                              .split(",")
                                              .map((service) => service.trim())
                                              .length
                                          }
                                        </td>
                                        <td> {mainObj.totalPayment} </td>
                                        <td>
                                          {" "}
                                          {mainObj.firstPayment !== 0
                                            ? mainObj.firstPayment
                                            : mainObj.totalPayment}{" "}
                                        </td>
                                        <td>
                                          {" "}
                                          {mainObj.firstPayment !== 0
                                            ? mainObj.totalPayment -
                                              mainObj.firstPayment
                                            : 0}{" "}
                                        </td>
                                        <td>
                                          {mainObj.bdeName !== mainObj.bdmName
                                            ? "Yes"
                                            : "No"}
                                        </td>
                                        <td>
                                          {mainObj.bdeName !== mainObj.bdmName
                                            ? mainObj.bdmType === "closeby"
                                              ? `Closed by ${obj.bdmName}`
                                              : `Supported by ${obj.bdmName}`
                                            : "Self Closed"}
                                        </td>
                                      </tr>
                                    ))}
                              </>
                            ))}
                          </tbody>

                          <tfoot>
                            <tr>
                              <td colSpan={2}>
                                Total:{finalFilteredData.length}
                              </td>

                              <td>
                                {filteredBooking.filter((data) => {
                                  return data.bdeName === data.bdmName;
                                }).length +
                                  filteredBooking.filter((data) => {
                                    return data.bdeName !== data.bdmName;
                                  }).length /
                                    2}
                              </td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </>
                      ) : (
                        <tbody>
                          <tr>
                            <td className="particular" colSpan={9}>
                              <Nodata />
                            </td>
                          </tr>
                        </tbody>
                      )}
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
