import React, { useState } from "react";
// import { pdfuploader } from "../documents/pdf1.pdf";
import { Link } from "react-router-dom";


// Other imports...

// Other imports...
const formatDate = (inputDate) => {
  const date = new Date(inputDate);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Note: Month is zero-based
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const CompanyDetailsAdmin = ({ company }) => {
  const [pdfUrl, setPdfUrl] = useState(""); // Add this state variable
  const [formOpen, setformOpen] = useState(false); // Add this state variable
  const secretKey = process.env.REACT_APP_SECRET_KEY;

  const handleViewPdf = () => {
    const pathname = company.otherDocs[0];
    console.log(pathname);
    window.open(`${secretKey}/pdf/${pathname}`, "_blank");
  };

  // const handleViewPDF = async () => {
  //   // Replace 'http://localhost:3001/api/pdf' with the actual API endpoint serving your PDF
  //   // const pdfUrl = 'http://localhost:3001/api/pdf';
  //   // window.open(pdfUrl, '_blank', 'toolbar=0,location=0,menubar=0');
  //   try {
  //     const response = await axios.get(`${secretKey}/pdf/${company.otherDocs}`);
  //   } catch (error) {
  //     console.error("Error fetching data:", error.message);
  //   }
  // };

  return (
    <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3 class="card-title">Booking Details</h3>
            <Link to='/admin/bookings/Addbookings'>
              <button
                className="btn btn-primary">
                Add Booking
              </button>
            </Link></div>
      <div className="card-body cmpy-d-body">
        {company ? (
          <div className="datagrid">
            {Object.entries(company)
              .filter(
                ([key, value]) => key !== "_id" && (value || value === "")
              ) // Exclude "id" field and empty/undefined values
              .map(
                ([key, value]) =>
                  // Render only if both key and value are present
                  value && (
                    <div className="datagrid-item" key={key}>
                      <div className="datagrid-title">{key}</div>
                      <div className="datagrid-content">
                        {key === "bookingDate" || key === "incoDate"
                          ? formatDate(value)
                          : value}
                      </div>
                    </div>
                  )
              )}
            {/* Add the "View PDF" button */}
            <div className="datagrid-item">
              <div className="datagrid-title">Actions</div>
              {/* <div className="datagrid-content">
                <button className="btn btn-primary" onClick={handleViewPDF}>
                  View PDF
                </button>
              </div> */}
              <div className="datagrid-content">
                  <button className="btn btn-primary" onClick={handleViewPdf}>
                    View PDF
                  </button>
              </div>
            </div>
          </div>
        ) : (
          <p>Select a company from the list to view details.</p>
        )}
      </div>
    </div>
  );
};

export default CompanyDetailsAdmin;
