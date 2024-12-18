import React, { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
//import CloseIcon from "@mui/icons-material/Close";
// import EditIcon from "@mui/icons-material/Edit";
// import IconEye from "@mui/icons-material/Visibility"; // This is the 'View' icon in MUI
import Swal from "sweetalert2";
import DeleteIcon from "@mui/icons-material/Delete";
import debounce from "lodash/debounce";
import axios from "axios";
import { MdOutlineEdit } from "react-icons/md";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { IoMdClose } from "react-icons/io";

function AdminRemarksDialog({
  companyID,
  companyStatus,
  currentRemarks,
  secretKey,
  companyName
}) {
  const [openRemarks, openchangeRemarks] = useState(false);
  const [filteredRemarks, setFilteredRemarks] = useState([]);

  // Fetch remarks history for the specific company
  const fetchRemarksHistory = async () => {
    try {
      const response = await axios.get(
        `${secretKey}/remarks/remarks-history-complete/${companyID}`
      );
      setFilteredRemarks(response.data);
    } catch (error) {
      console.error("Error fetching remarks history:", error);
    }
  };

  //console.log("filetredRearks", filteredRemarks);

  const functionopenpopupremarks = async (companyID) => {
    await fetchRemarksHistory();
    openchangeRemarks(true);
  };

  const closepopupRemarks = () => {
    openchangeRemarks(false);
    setFilteredRemarks([]);
  };

  function formatDateTimeForYesterday(dateInput) {
    const createdAt = new Date(dateInput);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Check if the date is today
    if (createdAt.toDateString() === today.toDateString()) {
      return createdAt.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }); // Time in 12-hour format
    }
    // Check if the date is yesterday
    else if (createdAt.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    // If it's older than yesterday, return the date
    else {
      return createdAt.toLocaleDateString();
    }
  }

  return (
    <div>
      <div
        style={{ width: "100px" }}
        className="d-flex align-items-center justify-content-between"
      >
        <p className="rematkText text-wrap m-0">
          {currentRemarks ? currentRemarks : "No Remarks Added"}
        </p>
        <div
          onClick={() => {
            functionopenpopupremarks();
          }}
          style={{ cursor: "pointer" }}
        >
          <MdOutlineRemoveRedEye
            style={{
              width: "14px",
              height: "14px",
              color: "#d6a10c",
              cursor: "pointer",
              marginLeft: "4px",
            }}
          />
        </div>
      </div>
      <Dialog
        className="My_Mat_Dialog"
        open={openRemarks}
        onClose={closepopupRemarks}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
        <span style={{ fontSize: "14px" }}>{companyName} Remarks</span>
          <button
            style={{
              background: "none",
              border: "0px transparent",
              float: "right",
            }}
            onClick={closepopupRemarks}
          >
            <IoMdClose
              style={{
                height: "36px",
                width: "32px",
                color: "grey",
              }}
            />
          </button>
        </DialogTitle>
        <DialogContent>
          <div className="remarks-content">
            {/* Check if there are any remarks */}
            {/* //{console.log("filetees", filteredRemarks[0]?.remarks)} */}
            {filteredRemarks[0]?.remarks?.length > 0 ||
            filteredRemarks[0]?.serviceWiseRemarks?.length > 0 ? (
              <>
                {/* Display remarks sorted in descending order */}
                {filteredRemarks[0]?.remarks.slice().map((historyItem) => {
                  //console.log("Remarks History Item:", historyItem); // Log historyItem to see what is inside
                  return (
                    <div className="col-sm-12" key={historyItem._id}>
                      <div className="card RemarkCard position-relative">
                        <div className="d-flex justify-content-between">
                          <div className="remark-card-innerText">
                            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                              {historyItem.remarks || historyItem.bdmRemarks}
                            </pre>
                          </div>
                        </div>

                        <div className="d-flex card-dateTime justify-content-between">
                          <div className="date">
                          {formatDateTimeForYesterday(historyItem.addedOn)}
                            {/* {new Date(
                              historyItem.createdAt
                            ).toLocaleDateString()}{" "}
                            ||
                            {new Date(
                              historyItem.createdAt
                            ).toLocaleTimeString()} */}
                          </div>
                          <div className="date">
                            By: {historyItem.employeeName}(
                            {historyItem.designation})
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Display service-wise remarks sorted in descending order */}
                {filteredRemarks[0]?.serviceWiseRemarks.map((serviceItem) => {
                  //.log("Service-Wise Remarks Item:", serviceItem); // Log serviceItem to see what is inside
                  return (
                    <div className="col-sm-12" key={serviceItem._id}>
                      <div className="card RemarkCard position-relative">
                        <div className="d-flex justify-content-between">
                          <div className="remark-card-innerText">
                            <div style={{ fontSize: "9px" }}>
                              Service: {serviceItem.serviceName}
                            </div>
                            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{serviceItem.remarks}</pre>
                          </div>
                        </div>

                        <div className="d-flex card-dateTime justify-content-between">
                          <div className="date">
                            {formatDateTimeForYesterday(serviceItem.addedOn)}
                            {/* {new Date(serviceItem.createdAt).toLocaleDateString()}{" "}
                            ||{new Date(serviceItem.createdAt).toLocaleTimeString()} */}
                          </div>
                          <div className="date">
                            By: {serviceItem.employeeName}({serviceItem.designation})
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center overflow-hidden">
                No Remarks History
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminRemarksDialog;
