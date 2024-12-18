import React, { useState, useEffect } from "react";
import "../../dist/css/tabler.min.css?1684106062";
import "../../dist/css/tabler-payments.min.css?1684106062";
import "../../dist/css/tabler-vendors.min.css?1684106062";
import "../../dist/css/demo.min.css?1684106062";
import axios from 'axios';

const DscLetterStatusAdHead = ({
  companyName,
  serviceName,
  mainStatus,
  subStatus,
  letterStatus,
  refreshData,
}) => {
  // State to manage the selected status and the corresponding CSS class
  const [status, setStatus] = useState(letterStatus);
  const [statusClass, setStatusClass] = useState('created-status');
  const secretKey = process.env.REACT_APP_SECRET_KEY;

  // Function to handle the dropdown item click
  const handleStatusChange = async(newStatus, statusClass) => {
    setStatus(newStatus);
    setStatusClass(`${statusClass}-status`);

    try {
      let response;
      if (mainStatus === "Process") {
        response = await axios.post(`${secretKey}/rm-services/update-letter-rmcert`, {
          companyName,
          serviceName,
          letterStatus: newStatus
        });
      } else if (mainStatus === "Defaulter") {
        response = await axios.post(`${secretKey}/rm-services/update-letter-update-letter-rmcert`, {
          companyName,
          serviceName,
          letterStatus: newStatus
        });
      } else if (mainStatus === "Approved") {
        response = await axios.post(`${secretKey}/rm-services/update-letter-update-letter-rmcert`, {
          companyName,
          serviceName,
          letterStatus: newStatus
        });
      }  else if (mainStatus === "Hold") {
        response = await axios.post(`${secretKey}/rm-services/update-letter-adminexecutive`, {
          companyName,
          serviceName,
          letterStatus: newStatus
        });
        //console.log("statuschange", contentStatus, companyName, serviceName)
      }

      refreshData();
      console.log("Status updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating status:", error.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Draft Pending":
        return "untouched_status";
      case "Draft Sent":
        return "cdbp-status";
      case "Letter Received":
        return "clnt_no_repond_status";
      case "Draft Done - Not Sent":
        return "support-status";
      default:
        return "";
    }
  };

  useEffect(() => {
    setStatusClass(getStatusClass(letterStatus));
  }, [letterStatus]);




  return (
    <section className="rm_status_dropdown">
       <select
        className={(mainStatus === "Approved") ? "disabled sec-indu-select sec-indu-select-white" : `form-select sec-indu-select ${status === "" ? "sec-indu-select-white" : "sec-indu-select-gray"}`}
        //className={`form-select sec-indu-select ${status === "" ? "sec-indu-select-white" : "sec-indu-select-gray"}`}
        aria-labelledby="dropdownMenuButton1"
        onChange={(e) => handleStatusChange(e.target.value)}
        value={letterStatus}
      >
        <option value="" disabled>Select Letter Status</option>
        <option value="Draft Pending">Draft Pending</option>
        <option value="Draft Sent">Draft Sent</option>
        <option value="Letter Received">Letter Received</option>
        <option value="Draft Done - Not Sent">Draft Done - Not Sent</option>
      </select>
    </section>
  );
};

export default DscLetterStatusAdHead;
