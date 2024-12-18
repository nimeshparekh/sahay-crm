import React, { useState, useEffect } from "react";
import "../../dist/css/tabler.min.css?1684106062";
import "../../dist/css/tabler-payments.min.css?1684106062";
import "../../dist/css/tabler-vendors.min.css?1684106062";
import "../../dist/css/demo.min.css?1684106062";
import axios from 'axios';

const DscTypeDropdown = ({
  companyName,
  serviceName,
  mainStatus,
  subStatus,
  dscType,
  refreshData,
}) => {
  // State to manage the selected status and the corresponding CSS class
  const [status, setStatus] = useState(dscType);
  const [statusClass, setStatusClass] = useState('created-status');
  const secretKey = process.env.REACT_APP_SECRET_KEY;

  // Function to handle the dropdown item click
  const handleStatusChange = async (newStatus, statusClass) => {
    setStatus(newStatus);
    setStatusClass(`${statusClass}-status`);

    try {
      let response;
      if (mainStatus === "Process") {
        response = await axios.post(`${secretKey}/rm-services/update-dscType-adminexecutive`, {
          companyName,
          serviceName,
          dscType: newStatus
        });
      } else if (mainStatus === "Defaulter") {
        response = await axios.post(`${secretKey}/rm-services/update-dscType-adminexecutive`, {
          companyName,
          serviceName,
          dscType: newStatus
        });
      } else if (mainStatus === "Approved") {
        response = await axios.post(`${secretKey}/rm-services/update-dscType-adminexecutive`, {
          companyName,
          serviceName,
          dscType: newStatus
        });
      } else if (mainStatus === "Hold") {
        response = await axios.post(`${secretKey}/rm-services/update-dscType-adminexecutive`, {
          companyName,
          serviceName,
          dscType: newStatus
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
      case "Only Signature":
        return "untouched_status";
      case "Only Encryption":
        return "cdbp-status";
      case "Combo":
        return "clnt_no_repond_status";
      default:
        return "";
    }
  };

  useEffect(() => {
    setStatusClass(getStatusClass(dscType));
  }, [dscType]);




  return (
    <section className="rm_status_dropdown">
      <select
        className={(mainStatus === "Approved" || mainStatus === "Application Submitted") ? "disabled sec-indu-select sec-indu-select-white" : `form-select sec-indu-select ${status === "" ? "sec-indu-select-white" : "sec-indu-select-gray"}`}
        //className={`form-select sec-indu-select ${status === "" ? "sec-indu-select-white" : "sec-indu-select-gray"}`}
        aria-labelledby="dropdownMenuButton1"
        onChange={(e) => handleStatusChange(e.target.value)}
        value={status === "Not Applicable" ? "" : status}
        //disabled={status === "Not Applicable"}
      >
        <option value="" disabled>Select DSC Type</option>
        <option value="Only Signature">Only Signature</option>
        <option value="Only Encryption">Only Encryption</option>
        <option value="Combo">Combo</option>
      </select>
    </section>
  );
};

export default DscTypeDropdown;
