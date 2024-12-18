import React, { useState, useEffect } from "react";
import "../../dist/css/tabler.min.css?1684106062";
import "../../dist/css/tabler-payments.min.css?1684106062";
import "../../dist/css/tabler-vendors.min.css?1684106062";
import "../../dist/css/demo.min.css?1684106062";
import axios from 'axios';



const ContentWriterDropdown = ({ mainStatus, writername, subStatus, setNewSubStatus, companyName, serviceName, refreshData }) => {
  const [status, setStatus] = useState(writername);
  const [statusClass, setStatusClass] = useState("e_task_assign");
  const secretKey = process.env.REACT_APP_SECRET_KEY;


  const handleStatusChange = async (newStatus, statusClass) => {
    setStatus(newStatus);
    setStatusClass(statusClass);
    try {
      let response;
      if (mainStatus === "Process") {
        response = await axios.post(`${secretKey}/rm-services/update-contentwriter-rmofcertification`, {
          companyName,
          serviceName,
          contentWriter: newStatus
        });
      } else if (mainStatus === "Submitted") {
        response = await axios.post(`${secretKey}/rm-services/update-contentwriter-rmofcertification`, {
          companyName,
          serviceName,
          contentWriter: newStatus
        });
      } else if (mainStatus === "Defaulter") {
        response = await axios.post(`${secretKey}/rm-services/update-contentwriter-rmofcertification`, {
          companyName,
          serviceName,
          contentWriter: newStatus
        });
      } else if (mainStatus === "Approved") {
        response = await axios.post(`${secretKey}/rm-services/update-contentwriter-rmofcertification`, {
          companyName,
          serviceName,
          contentWriter: newStatus
        });
      } else if (mainStatus === "Hold") {
        response = await axios.post(`${secretKey}/rm-services/update-contentwriter-rmofcertification`, {
          companyName,
          serviceName,
          contentWriter: newStatus
        });
      }else if (mainStatus === "Ready To Submit") {
        response = await axios.post(`${secretKey}/rm-services/update-contentwriter-rmofcertification`, {
          companyName,
          serviceName,
          contentWriter: newStatus
        });
      }

      refreshData();
      //console.log("Writer updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating status:", error.message);
    }

  };


  //console.log("mainStatus" , mainStatus)

  return (
    <section className="rm_status_dropdown">
      <div className={mainStatus === "Approved" ? "disabled" :`dropdown custom-dropdown status_dropdown ${statusClass}`}>
        <button
          className="btn dropdown-toggle w-100 d-flex align-items-center justify-content-between status__btn"
          type="button"
          id="dropdownMenuButton1"
          data-bs-toggle="dropdown" // Bootstrap data attribute to toggle dropdown
          aria-expanded="false"
        >
          {status}
        </button>
        <ul className="dropdown-menu status_change" aria-labelledby="dropdownMenuButton1">
        <li>
            <a
              className="dropdown-item"
              onClick={() => handleStatusChange("RonakKumar", "e_task_assign")}
              href="#"
            >
              RonakKumar
            </a>
          </li>
          {/* <li>
            <a
              className="dropdown-item"
              onClick={() => handleStatusChange("Drashti Thakkar", "e_task_assign")}
              href="#"
            >
              Drashti Thakkar
            </a>
          </li> */}
           <li>
            <a
              className="dropdown-item"
              onClick={() => handleStatusChange("Kajal Patel", "e_task_assign")}
              href="#"
            >
              Kajal Patel
            </a>
          </li>
          <li>
            <a
              className="dropdown-item"
              onClick={() => handleStatusChange("Not Applicable", "e_task_assign")}
              href="#"
            >
              Not Applicable
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default ContentWriterDropdown;