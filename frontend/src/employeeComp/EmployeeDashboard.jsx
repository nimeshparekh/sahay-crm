import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import EmpNav from "./EmpNav";
import axios from "axios";
import { useParams } from "react-router-dom";

function EmployeeDashboard() {
  const { userId } = useParams();
  const [data, setData] = useState([]);
  const [empData, setEmpData] = useState([]);
  const secretKey = process.env.REACT_APP_SECRET_KEY;
  const formatDate = (inputDate) => {
    const date = new Date(inputDate);
    const convertedDate = date.toLocaleDateString();
    return convertedDate;
  };
  const fetchData = async () => {
    try {
      const response = await axios.get(`${secretKey}/einfo`);
      // Set the retrieved data in the state
      const tempData = response.data;
      const userData = tempData.find((item) => item._id === userId);

      setData(userData);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const fetchEmployeeData = async () => {
    fetch(`${secretKey}/edata-particular/${data.ename}`)
      .then((response) => response.json())
      .then((data) => {
        setEmpData(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    fetchEmployeeData();
  }, [data]);
  const formattedDates =
  empData.length !== 0 &&
  empData.map((data) => formatDate(data.AssignDate));

const uniqueArray = formattedDates && [...new Set(formattedDates)];
console.log(uniqueArray)

  return (
    <div>
      <Header name={data.ename} designation={data.designation} />
      <EmpNav userId={userId} />
      <div className="container-xl mt-2">
        <div className="card">
          <div className="card-header">
            <h2>Your Dashboard</h2>
          </div>
          <div className="card-body">
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
                  marginBottom: "10px",
                }}
                className="table-vcenter table-nowrap"
              >
                <thead stSyle={{ backgroundColor: "grey" }}>
                  <tr
                    style={{
                      backgroundColor: "#ffb900",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    <th
                      style={{
                        lineHeight: "32px",
                      }}
                    >
                      Sr. No
                    </th>
                    <th>Lead Assign Date</th>
                    <th>Untouched</th>
                    <th>Busy</th>
                    <th>Not Picked Up</th>
                    <th>Junk</th>
                    <th>Follow Up</th>
                    <th>Interested</th>
                    <th>Not Interested</th>
                    <th>Matured</th>
                    <th>Total Leads</th>
                  </tr>
                </thead>
                <tbody>
                {uniqueArray &&
                  uniqueArray.map((obj, index) => (
                    <tr key={`row-${index}`}>
                      <td  style={{
                        lineHeight: "32px",
                      }}>{index + 1}</td>
                      <td>{obj}</td>
                      <td>
                        {
                          empData.filter(
                            (partObj) =>
                              formatDate(partObj.AssignDate) === obj &&
                              partObj.Status === "Untouched"
                          ).length
                        }
                      </td>
                      <td>
                        {
                          empData.filter(
                            (partObj) =>
                              formatDate(partObj.AssignDate) === obj &&
                              partObj.Status === "Busy"
                          ).length
                        }
                      </td>
                      <td>
                        {
                          empData.filter(
                            (partObj) =>
                              formatDate(partObj.AssignDate) === obj &&
                              partObj.Status === "Not Picked Up"
                          ).length
                        }
                      </td>
                      <td>
                        {
                          empData.filter(
                            (partObj) =>
                              formatDate(partObj.AssignDate) === obj &&
                              partObj.Status === "Junk"
                          ).length
                        }
                      </td>
                      <td>
                        {
                          empData.filter(
                            (partObj) =>
                              formatDate(partObj.AssignDate) === obj &&
                              partObj.Status === "FollowUp"
                          ).length
                        }
                      </td>
                      <td>
                        {
                          empData.filter(
                            (partObj) =>
                              formatDate(partObj.AssignDate) === obj &&
                              partObj.Status === "Interested"
                          ).length
                        }
                      </td>
                      <td>
                        {
                          empData.filter(
                            (partObj) =>
                              formatDate(partObj.AssignDate) === obj &&
                              partObj.Status === "Not Interested"
                          ).length
                        }
                      </td>
                      <td>
                        {
                          empData.filter(
                            (partObj) =>
                              formatDate(partObj.AssignDate) === obj &&
                              partObj.Status === "Matured"
                          ).length
                        }
                      </td>
                      <td>
                        {
                          empData.filter(
                            (partObj) => formatDate(partObj.AssignDate) === obj
                          ).length
                        }
                      </td>
                    </tr>
                  ))}
            
                </tbody>
                {uniqueArray && (
                <tfoot>
                  <tr style={{ fontWeight: 500 }}>
                    <td style={{lineHeight:'32px'}} colSpan="2">Total</td>
                    <td>
                      {
                        empData.filter(
                          (partObj) => partObj.Status === "Untouched"
                        ).length
                      }
                    </td>
                    <td>
                      {
                        empData.filter(
                          (partObj) => partObj.Status === "Busy"
                        ).length
                      }
                    </td>
                    <td>
                      {
                        empData.filter(
                          (partObj) => partObj.Status === "Not Picked Up"
                        ).length
                      }
                    </td>
                    <td>
                      {
                        empData.filter(
                          (partObj) => partObj.Status === "Junk"
                        ).length
                      }
                    </td>
                    <td>
                      {
                        empData.filter(
                          (partObj) => partObj.Status === "FollowUp"
                        ).length
                      }
                    </td>
                    <td>
                      {
                        empData.filter(
                          (partObj) => partObj.Status === "Interested"
                        ).length
                      }
                    </td>
                    <td>
                      {
                        empData.filter(
                          (partObj) => partObj.Status === "Not Interested"
                        ).length
                      }
                    </td>
                    <td>
                      {
                        empData.filter(
                          (partObj) => partObj.Status === "Matured"
                        ).length
                      }
                    </td>
                    <td>{empData.length}</td>
                  </tr>
                </tfoot>
              )}
              </table>
            </div>
          </div>
        </div>
        
        
      </div>
      
      
    </div>
  );
}

export default EmployeeDashboard;
