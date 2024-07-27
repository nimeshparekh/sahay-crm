import React, { useState, useEffect } from "react";
import "../../dist/css/tabler.min.css?1684106062";
import "../../dist/css/tabler-payments.min.css?1684106062";
import "../../dist/css/tabler-vendors.min.css?1684106062";
import "../../dist/css/demo.min.css?1684106062";
import axios from 'axios';



const StatusDropdown = ({ mainStatus, subStatus, setNewSubStatus, companyName, serviceName }) => {
  const [status, setStatus] = useState(subStatus);
  const [statusClass, setStatusClass] = useState("created-status");
  const secretKey = process.env.REACT_APP_SECRET_KEY;


  const handleStatusChange = async (newStatus, statusClass) => {
    setStatus(newStatus);
    setStatusClass(statusClass);
    setNewSubStatus(newStatus);

    try {
      let response;
      if (mainStatus === "General") {
        response = await axios.post(`${secretKey}/rm-services/update-substatus-rmofcertification`, {
          companyName,
          serviceName,
          subCategoryStatus: newStatus,
          mainCategoryStatus: "Process"
        });
      } else if (mainStatus === "Process") {
        if (newStatus === "Submitted") {
          response = await axios.post(`${secretKey}/rm-services/update-substatus-rmofcertification`, {
            companyName,
            serviceName,
            subCategoryStatus: newStatus,
            mainCategoryStatus: "Submitted"
          });
        } else if (newStatus === "Defaulter") {
          response = await axios.post(`${secretKey}/rm-services/update-substatus-rmofcertification`, {
            companyName,
            serviceName,
            subCategoryStatus: newStatus,
            mainCategoryStatus: "Defaulter"
          });
        } else {
          response = await axios.post(`${secretKey}/rm-services/update-substatus-rmofcertification`, {
            companyName,
            serviceName,
            subCategoryStatus: newStatus,
            mainCategoryStatus: "Process"
          });
        }
      } else if (mainStatus === "Submitted") {
        if (newStatus === "Approved") {
          response = await axios.post(`${secretKey}/rm-services/update-substatus-rmofcertification`, {
            companyName,
            serviceName,
            subCategoryStatus: newStatus,
            mainCategoryStatus: "Approved"
          });
        } else if (newStatus === "Defaulter") {
          response = await axios.post(`${secretKey}/rm-services/update-substatus-rmofcertification`, {
            companyName,
            serviceName,
            subCategoryStatus: newStatus,
            mainCategoryStatus: "Defaulter"
          });
        } else {
          response = await axios.post(`${secretKey}/rm-services/update-substatus-rmofcertification`, {
            companyName,
            serviceName,
            subCategoryStatus: newStatus,
            mainCategoryStatus: "Submitted"
          });
        }
      }else if (mainStatus === "Defaulter") {
        if (newStatus === "Working") {
          response = await axios.post(`${secretKey}/rm-services/update-substatus-rmofcertification`, {
            companyName,
            serviceName,
            subCategoryStatus: newStatus,
            mainCategoryStatus: "Defaulter"
          });
        }  
      }

      console.log("Status updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating status:", error.message);
    }
  };


  //console.log("mainStatus" , mainStatus)

  return (
    <section className="rm_status_dropdown">
      <div className={`dropdown custom-dropdown status_dropdown ${statusClass}`}>
        <button
          className="btn dropdown-toggle w-100 d-flex align-items-center justify-content-between status__btn"
          type="button"
          id="dropdownMenuButton1"
          data-bs-toggle="dropdown" // Bootstrap data attribute to toggle dropdown
          aria-expanded="false"
        >
          {status}
        </button>
        {mainStatus === "General" ? (
          <ul className="dropdown-menu status_change" aria-labelledby="dropdownMenuButton1">
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Untouched", "created-status")}
                href="#"
              >
                Untouched
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Call Done Brief Pending", "support-status")}
                href="#"
              >
                Call Done Brief Pending
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Client Not Responding", "inprogress-status")}
                href="#"
              >
                Client Not Responding
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Documents Pending", "docs-pending")}
                href="#"
              >
                Documents Pending
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Need To Call", "rejected-status")}
                href="#"
              >
                Need To Call
              </a>
            </li>
          </ul>
        ) : mainStatus === "Process" ? (
          <ul className="dropdown-menu status_change" aria-labelledby="dropdownMenuButton1">
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Call Done Brief Pending", "support-status")}
                href="#"
              >
                Call Done Brief Pending
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Client Not Responding", "inprogress-status")}
                href="#"
              >
                Client Not Responding
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Documents Pending", "docs-pending")}
                href="#"
              >
                Documents Pending
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Ready To Submit", "rejected-status")}
                href="#"
              >
                Ready To Submit
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Submitted", "rejected-status")}
                href="#"
              >
                Submitted
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Working", "finished-status")}
                href="#"
              >
                Working
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Defaulter", "finished-status")}
                href="#"
              >
                Defaulter
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Need To Call", "rejected-status")}
                href="#"
              >
                Need To Call
              </a>
            </li>
          </ul>
        ) : mainStatus === "Submitted" ? (
          <ul className="dropdown-menu status_change" aria-labelledby="dropdownMenuButton1">
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Submitted", "rejected-status")}
                href="#"
              >
                Submitted
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Incomplete", "inprogress-status")}
                href="#"
              >
                Incomplete
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Approved", "docs-pending")}
                href="#"
              >
                Approved
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("2nd Time Submitted", "rejected-status")}
                href="#"
              >
                2nd Time Submitted
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("3rd Time Submitted", "finished-status")}
                href="#"
              >
                3rd Time Submitted
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Rejected", "rejected-status")}
                href="#"
              >
                Rejected
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Defaulter", "rejected-status")}
                href="#"
              >
                Defaulter
              </a>
            </li>
          </ul>
        ) : mainStatus === "Defaulter" && (
          <ul className="dropdown-menu status_change" aria-labelledby="dropdownMenuButton1">
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Working", "rejected-status")}
                href="#"
              >
                Working
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                onClick={() => handleStatusChange("Defaulter", "rejected-status")}
                href="#"
              >
                Defaulter
              </a>
            </li>
          </ul>
        )}


      </div>
    </section>
  );
};

export default StatusDropdown;