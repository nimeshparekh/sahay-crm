// import React, { useState } from "react";
// import './style_processing/main_processing.css';
// import DeleteIcon from "@mui/icons-material/Delete";
// import Swal from 'sweetalert2';
// import {
//   IconButton,
// } from "@mui/material";

// function CompanyList({ companies, onCompanyClick }) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedField, setSelectedField] = useState("companyName");
//   const [companyClasses, setCompanyClasses] = useState({});
//   const [searchDisplay, setSearchDisplay] = useState(true); // State to manage the search field display
//   const [dateRangeDisplay, setDateRangeDisplay] = useState(false); // State to manage the date range field display
//   const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

//   const formatDatelatest = (inputDate) => {
//     const date = new Date(inputDate);
//     const day = date.getDate().toString().padStart(2, '0');
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   const handleCompanyClick = (company) => {
//     setCompanyClasses(prevClasses => ({
//       [company]: "list-group-item list-group-item-action active"
//     }));
//     onCompanyClick(company);
//   };

//   const handleFieldChange = (value) => {
//     setSelectedField(value);
//     if (value === 'companyName' || value === "bdeName" || value === "services") {
//       setSearchDisplay(true);
//       setDateRangeDisplay(false);
//     } else if (value === 'bookingDate') {
//       setSearchDisplay(true);
//       setDateRangeDisplay(true);
//     } else {
//       setSearchDisplay(false);
//       setDateRangeDisplay(false);
//     }
//   };

//   const FilteredData = companies.filter((company) => {
//     const fieldValue = company[selectedField];
//     const searchTermLower = searchTerm.toLowerCase();

//     if (selectedField === "companyName" || selectedField === "bdeName" || selectedField === "services") {
//       let fieldValueLower = '';
//       if (selectedField === "services") {
//         fieldValueLower = Array.isArray(fieldValue) ? fieldValue.map(service => service.trim().toLowerCase()) : [];
//       } else {
//         fieldValueLower = typeof fieldValue === 'string' ? fieldValue.toLowerCase() : '';
//       }
//       if (Array.isArray(fieldValueLower)) {
//         return fieldValueLower.some(service => service.includes(searchTermLower));
//       } else {
//         return fieldValueLower.includes(searchTermLower);
//       }
//     }else if (selectedField === "bookingDate") {
//       const dateMatch = dateRange.startDate && dateRange.endDate ?
//         new Date(company.bookingDate) >= new Date(dateRange.startDate) &&
//         new Date(company.bookingDate) <= new Date(dateRange.endDate) :
//         true;
//       return dateMatch && fieldValue; // Include dateMatch along with fieldValue
//     } 
//     return true;
//   });

//   const secretKey = process.env.REACT_APP_SECRET_KEY;

//   const handleDelete = (companyId, companyName) => {
//     const ename = localStorage.getItem("username");

//     Swal.fire({
//       title: `Are you sure you want to request deletion for ${companyName}?`,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#3085d6',
//       cancelButtonColor: '#d33',
//       confirmButtonText: 'Yes, request deletion!'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         const date = new Date().toLocaleDateString();
//         const time = new Date().toLocaleTimeString();
//         const deleteRequestData = {
//           companyName,
//           companyId,
//           time,
//           date,
//           request: false,
//           ename
//         };

//         fetch(`${secretKey}/deleterequestbybde`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(deleteRequestData),
//         })
//           .then(response => {
//             if (response.ok) {
//               Swal.fire(
//                 'Success!',
//                 'Delete request details stored successfully',
//                 'success'
//               );
//             } else {
//               Swal.fire(
//                 'Error!',
//                 'Failed to store delete request details',
//                 'error'
//               );
//             }
//           })
//           .catch(error => {
//             console.error('Error during delete request:', error);
//           });
//       }
//     });
//   };

//   return (
//     <div className="card">
//       <div className="card-header search-date-header">
//         <div className="d-flex justify-content-between align-items-center searchfields gap-5 w-100">
//           <div className="input-icon d-flex align-items-center justify-content-start w-100">
//             <select className="form-select"
//               value={selectedField}
//               onChange={(e) => handleFieldChange(e.target.value)}
//             >
//               <option value="companyName">Company Name</option>
//               <option value="bdeName">Bde Name</option>
//               <option value="services">Services</option>
//               <option value="bookingDate">Booking Date</option>
//             </select>
//           </div>
//           {searchDisplay && (
//             <div className="input-icon w-100 d-flex align-items-center justify-content-between">
//               <span className="input-icon-addon">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="icon"
//                   width="24"
//                   height="24"
//                   viewBox="0 0 24 24"
//                   strokeWidth="2"
//                   stroke="currentColor"
//                   fill="none"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
//                   <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
//                   <path d="M21 21l-6 -6"></path>
//                 </svg>
//               </span>
//               <input
//                 type="text"
//                 value={searchTerm}
//                 className="form-control"
//                 placeholder="Search…"
//                 aria-label="Search in website"
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//           )}
//         </div>

//        {dateRangeDisplay && (<div className="input-icon d-flex align-items-center justify-content-between w-100 mt-2">
//           <div>
//             <input
//               type="date"
//               value={dateRange.startDate}
//               className="form-control"
//               onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
//             />
//           </div>
//           <div>
//             <span className="date-range-separator">to</span>
//           </div>
//           <div>
//             <input
//               type="date"
//               value={dateRange.endDate}
//               className="form-control"
//               onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
//             />
//           </div>
//         </div>)}
//       </div>

//       <div className="list-group list-group-flush list-group-hoverable cmpy-list-body cursor-pointer">
//         {FilteredData.map((company, index) => (
//           <div className={companyClasses[company.companyName] || "list-group-item list-group-item-action"} key={index}>
//             <div className="align-items-center" onClick={() => handleCompanyClick(company.companyName)}>
//               <div className="p-booking-Cname d-flex align-items-center">
//                 <h4 className="m-0" title={company.companyName}>
//                   {company.companyName}
//                 </h4>
//                 <IconButton onClick={() => handleDelete(company._id, company.companyName)}>
//                   <DeleteIcon
//                     style={{
//                       width: "16px",
//                       height: "16px",
//                       color: "#bf0b0b",
//                     }}
//                   >
//                     Delete
//                   </DeleteIcon>
//                 </IconButton>
//               </div>
//               <div className="d-flex justify-content-between aligns-items-center mt-1">
//                 <div className="time">
//                   <label className="m-0">{company.bookingTime && (
//                     <p className="m-0">{company.bookingTime}</p>)}</label>
//                 </div>
//                 <div className="bookingdate">
//                   <label className="m-0">
//                     {company.bookingDate && (
//                       <p className="m-0">{formatDatelatest(company.bookingDate)}</p>
//                     )}
//                   </label>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default CompanyList;



import React, { useState } from "react";
import './style_processing/main_processing.css';
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import Swal from 'sweetalert2';
import {
  IconButton,
} from "@mui/material";

function CompanyList({ companies, onCompanyClick }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState("companyName");
  const [companyClasses, setCompanyClasses] = useState({});
  const [searchDisplay, setSearchDisplay] = useState(true); // State to manage the search field display
  const [dateRangeDisplay, setDateRangeDisplay] = useState(false); // State to manage the date range field display
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  const formatDatelatest = (inputDate) => {
    const date = new Date(inputDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
   

  const handleCompanyClick = (company , companyId) => {

    setCompanyClasses(prevClasses => ({
      [company]: "list-group-item list-group-item-action active"
    }));
    onCompanyClick(company);

   
  // Make a PUT request to mark the company as read
  axios.put(`${secretKey}/read/${company}`)
    .then((response) => {
      // Handle success if needed
      console.log('Company marked as read:', response.data);

      // Update the local state or trigger any necessary UI updates
      // ...
    })
    .catch((error) => {
      // Handle error if needed
      console.error('Error marking company as read:', error);
    });
};


const handleFieldChange = (value) => {
  setSelectedField(value);
  if (value === 'companyName' || value === "bdeName" || value === "services") {
    setSearchDisplay(true);
    setDateRangeDisplay(false);
  } else if (value === 'bookingDate') {
    setSearchDisplay(true);
    setDateRangeDisplay(true);
  } else {
    setSearchDisplay(false);
    setDateRangeDisplay(false);
  }
};

const FilteredData = companies.filter((company) => {
  const fieldValue = company[selectedField];
  const searchTermLower = searchTerm.toLowerCase();

  if (selectedField === "companyName" || selectedField === "bdeName" || selectedField === "services") {
    let fieldValueLower = '';
    if (selectedField === "services") {
      fieldValueLower = Array.isArray(fieldValue) ? fieldValue.map(service => service.trim().toLowerCase()) : [];
    } else {
      fieldValueLower = typeof fieldValue === 'string' ? fieldValue.toLowerCase() : '';
    }
    if (Array.isArray(fieldValueLower)) {
      return fieldValueLower.some(service => service.includes(searchTermLower));
    } else {
      return fieldValueLower.includes(searchTermLower);
    }
  } else if (selectedField === "bookingDate") {
    const dateMatch = dateRange.startDate && dateRange.endDate ?
      new Date(company.bookingDate) >= new Date(dateRange.startDate) &&
      new Date(company.bookingDate) <= new Date(dateRange.endDate) :
      true;
    return dateMatch && fieldValue; // Include dateMatch along with fieldValue
  }
  return true;
});

const secretKey = process.env.REACT_APP_SECRET_KEY;



const handleDelete = (companyId, companyName) => {
  const ename = localStorage.getItem("username");

  Swal.fire({
    title: `Are you sure you want to request deletion for ${companyName}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, request deletion!'
  }).then((result) => {
    if (result.isConfirmed) {
      const date = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();
      const deleteRequestData = {
        companyName,
        companyId,
        time,
        date,
        request: false,
        ename
      };

      fetch(`${secretKey}/deleterequestbybde`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteRequestData),
      })
        .then(response => {
          if (response.ok) {
            Swal.fire(
              'Success!',
              'Delete request details stored successfully',
              'success'
            );
          } else {
            Swal.fire(
              'Error!',
              'Failed to store delete request details',
              'error'
            );
          }
        })
        .catch(error => {
          console.error('Error during delete request:', error);
        });
    }
  });
};

return (
  <div className="card">
    <div className="card-header search-date-header">
      <div className="d-flex justify-content-between align-items-center searchfields gap-5 w-100">
        <div className="input-icon d-flex align-items-center justify-content-start w-100">
          <select className="form-select"
            value={selectedField}
            onChange={(e) => handleFieldChange(e.target.value)}
          >
            <option value="companyName">Company Name</option>
            <option value="bdeName">Bde Name</option>
            <option value="services">Services</option>
            <option value="bookingDate">Booking Date</option>
          </select>
        </div>
        {searchDisplay && (
          <div className="input-icon w-100 d-flex align-items-center justify-content-between">
            <span className="input-icon-addon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                <path d="M21 21l-6 -6"></path>
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              className="form-control"
              placeholder="Search…"
              aria-label="Search in website"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      {dateRangeDisplay && (<div className="input-icon d-flex align-items-center justify-content-between w-100 mt-2">
        <div>
          <input
            type="date"
            value={dateRange.startDate}
            className="form-control"
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          />
        </div>
        <div>
          <span className="date-range-separator">to</span>
        </div>
        <div>
          <input
            type="date"
            value={dateRange.endDate}
            className="form-control"
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          />
        </div>
      </div>)}
    </div>

    <div className="list-group list-group-flush list-group-hoverable cmpy-list-body cursor-pointer">
      {FilteredData.map((company, index) => (
        <div
          className={`${companyClasses[company.companyName] || "list-group-item list-group-item-action"}`}
          key={index}
          style={{ backgroundColor: company.read === false && "#eaeaea" }}
        >
          <div className="align-items-center" onClick={() => handleCompanyClick(company.companyName , company._id)}>
            <div className="p-booking-Cname d-flex align-items-center">
              <h4 className="m-0" title={company.companyName}>
                {company.companyName}
              </h4>
              <IconButton onClick={() => handleDelete(company._id, company.companyName)}>
                <DeleteIcon
                  style={{
                    width: "16px",
                    height: "16px",
                    color: "#bf0b0b",
                  }}
                >
                  Delete
                </DeleteIcon>
              </IconButton>
            </div>
            <div className="d-flex justify-content-between aligns-items-center mt-1">
              <div className="time">
                <label className="m-0">{company.bookingTime && (
                  <p className="m-0">{company.bookingTime}</p>)}</label>
              </div>
              <div className="bookingdate">
                <label className="m-0">
                  {company.bookingDate && (
                    <p className="m-0">{formatDatelatest(company.bookingDate)}</p>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
}

export default CompanyList;









































