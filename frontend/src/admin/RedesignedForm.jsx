import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import Header from "./Header";
import Navbar from "./Navbar";
import StepButton from "@mui/material/StepButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import pdfimg from "../static/my-images/pdf.png";
import Swal from "sweetalert2";
import img from "../static/my-images/image.png";
import wordimg from "../static/my-images/word.png";
import excelimg from "../static/my-images/excel.png";
import PdfImageViewer from "../Processing/PdfViewer";
import { IconX } from "@tabler/icons-react";

import axios from "axios";
const secretKey = process.env.REACT_APP_SECRET_KEY;
const steps = [
  "Basic Company Informations",
  "Booking Details",
  "Services And Payments",
  "Payment Summery",
  "Final",
];

const defaultService = {
  serviceName: "",
  withDSC: false,
  totalPaymentWOGST: "",
  totalPaymentWGST: "",
  withGST: false,
  paymentTerms: "Full Advanced",
  firstPayment: 0,
  secondPayment: 0,
  thirdPayment: 0,
  fourthPayment: 0,
  paymentRemarks: "No payment remarks",
  paymentCount: 2,
};

export default function RedesignedForm({ companysName , companysEmail, companyNumber ,  companysInco }) {
  const [totalServices, setTotalServices] = useState(1);
  const defaultLeadData = {
    "Company Name": companysName ? companysName : "",
    "Company Number": companyNumber ? companyNumber : 0 ,
    "Company Email": companysEmail ? companysEmail : "",
    panNumber: "",
    gstNumber: "",
    incoDate: companysInco ? companysInco : "",
    bdeName: "",
    bdmName: "",
    bookingDate: "",
    bookingSource: "",
    numberOfServices: 0,
    services: [],
    caCase: false,
    caName: "",
    caEmail: "",
    caCommission: "",
    paymentMethod: "",
    paymentReceipt: [],
    extraNotes: "",
    otherDocs: [],
    totalAmount: 0,
    receivedAmount: 0,
    pendingAmount: 0,
  };
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  const [selectedValues, setSelectedValues] = useState("");

  const [leadData, setLeadData] = useState(defaultLeadData);
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${secretKey}/redesigned-leadData/${companysName}`
      );
      const data = response.data.find(
        (item) => item["Company Name"] === companysName
      );
      console.log("Fetched Data:" , data);
      if (data.Step1Status === true && data.Step2Status === false) {
        setLeadData({
          ...leadData,
          "Company Name": data["Company Name"],
          "Company Email": data["Company Email"],
          "Company Number": data["Company Number"],
          incoDate: data.incoDate,
          panNumber: data.panNumber,
          gstNumber: data.gstNumber,
          Step1Status: data.Step1Status
        });
        setCompleted({ 0: true });
        setActiveStep(1);
      } else if (data.Step2Status === true && data.Step3Status === false) {
        setSelectedValues(data.bookingSource);
        setLeadData({
          ...leadData,
          "Company Name": data["Company Name"],
          "Company Email": data["Company Email"],
          "Company Number": data["Company Number"],
          incoDate: data.incoDate,
          panNumber: data.panNumber,
          gstNumber: data.gstNumber,
          bdeName: data.bdeName,
          bdeEmail: data.bdeEmail,
          bdmName: data.bdmName,
          bdmEmail: data.bdmEmail,
          bookingDate: data.bookingDate,
          bookingSource: data.bookingSource,
          Step1Status: data.Step1Status,
          Step2Status: data.Step2Status
        });
        setCompleted({ 0: true, 1: true });
        setActiveStep(2);
      } else if (data.Step3Status === true && data.Step4Status === false) {
        
        setSelectedValues(data.bookingSource);
        setLeadData({
          ...leadData,
          "Company Name": data["Company Name"],
          "Company Email": data["Company Email"],
          "Company Number": data["Company Number"],
          incoDate: data.incoDate,
          panNumber: data.panNumber,
          gstNumber: data.gstNumber,
          bdeName: data.bdeName,
          bdeEmail: data.bdeEmail,
          bdmName: data.bdmName,
          bdmEmail: data.bdmEmail,
          bookingDate: data.bookingDate,
          bookingSource: data.bookingSource,
          services: data.services,
          totalAmount: data.services.reduce(
            (total, service) => total + service.totalPaymentWGST,
            0
          ),
          receivedAmount: data.services.reduce(
            (total, service) =>
              service.paymentTerms === "Full Advanced"
                ? total + service.totalPaymentWGST
                : total + service.firstPayment,
            0
          ),
          pendingAmount: data.services.reduce(
            (total, service) =>
              service.paymentTerms === "Full Advanced"
                ? total + 0
                : total + service.totalPaymentWGST - service.firstPayment,
            0
          ),
          caCase: data.caCase,
          caName: data.caName,
          caEmail: data.caEmail,
          caNumber: data.caNumber,
          Step1Status: data.Step1Status,
          Step2Status: data.Step2Status,
          Step3Status:data.Step3Status
        });
        setTotalServices(data.services.length);
        setCompleted({ 0: true, 1: true, 2: true });
        setActiveStep(3);
        
      } else if (data.Step4Status === true) {
        setSelectedValues(data.bookingSource);
        setLeadData({
          ...leadData,
          "Company Name": data["Company Name"],
          "Company Email": data["Company Email"],
          "Company Number": data["Company Number"],
          incoDate: data.incoDate,
          panNumber: data.panNumber,
          gstNumber: data.gstNumber,
          bdeName: data.bdeName,
          bdeEmail: data.bdeEmail,
          bdmName: data.bdmName,
          bdmEmail: data.bdmEmail,
          bookingDate: data.bookingDate,
          bookingSource: data.bookingSource,
          services: data.services,
          totalAmount: data.services.reduce(
            (total, service) => total + service.totalPaymentWGST,
            0
          ),
          receivedAmount: data.services.reduce(
            (total, service) =>
              service.paymentTerms === "Full Advanced"
                ? total + service.totalPaymentWGST
                : total + service.firstPayment,
            0
          ),
          pendingAmount: data.services.reduce(
            (total, service) =>
              service.paymentTerms === "Full Advanced"
                ? total + 0
                : total + service.totalPaymentWGST - service.firstPayment,
            0
          ),
          caCase: data.caCase,
          caName: data.caName,
          caEmail: data.caEmail,
          caNumber: data.caNumber,
          paymentMethod: data.paymentMethod,
          paymentReceipt: data.paymentReceipt,
          extraNotes: data.extraNotes,
          totalAmount: data.totalAmount,
          receivedAmount: data.receivedAmount,
          pendingAmount: data.pendingAmount,
          otherDocs: data.otherDocs,
          Step1Status: data.Step1Status,
          Step2Status: data.Step2Status,
          Step3Status:data.Step3Status,
          Step4Status:data.Step4Status,
        });
        setTotalServices(data.services.length);
        setCompleted({ 0: true, 1: true, 2: true, 3: true });
        setActiveStep(4);
      }else if (data.Step5Status === true){
        setSelectedValues(data.bookingSource);
        setLeadData({
          ...leadData,
          "Company Name": data["Company Name"],
          "Company Email": data["Company Email"],
          "Company Number": data["Company Number"],
          incoDate: data.incoDate,
          panNumber: data.panNumber,
          gstNumber: data.gstNumber,
          bdeName: data.bdeName,
          bdeEmail: data.bdeEmail,
          bdmName: data.bdmName,
          bdmEmail: data.bdmEmail,
          bookingDate: data.bookingDate,
          bookingSource: data.bookingSource,
          services: data.services,
          totalAmount: data.services.reduce(
            (total, service) => total + service.totalPaymentWGST,
            0
          ),
          receivedAmount: data.services.reduce(
            (total, service) =>
              service.paymentTerms === "Full Advanced"
                ? total + service.totalPaymentWGST
                : total + service.firstPayment,
            0
          ),
          pendingAmount: data.services.reduce(
            (total, service) =>
              service.paymentTerms === "Full Advanced"
                ? total + 0
                : total + service.totalPaymentWGST - service.firstPayment,
            0
          ),
          caCase: data.caCase,
          caName: data.caName,
          caEmail: data.caEmail,
          caNumber: data.caNumber,
          paymentMethod: data.paymentMethod,
          paymentReceipt: data.paymentReceipt,
          extraNotes: data.extraNotes,
          totalAmount: data.totalAmount,
          receivedAmount: data.receivedAmount,
          pendingAmount: data.pendingAmount,
          otherDocs: data.otherDocs,
          Step1Status: data.Step1Status,
          Step2Status: data.Step2Status,
          Step3Status:data.Step3Status,
          Step4Status:data.Step4Status,
        });
        setTotalServices(data.services.length);
        setCompleted({ 0: true, 1: true, 2: true, 3: true , 4:true });
        setActiveStep(5);
      }

      console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
    console.log("Fetch After Component Mount" , leadData)
  }, []);
  useEffect(() => {
    // Create new services array based on totalServices
    const newServices = Array.from({ length: totalServices }, () => ({
      ...defaultService,
    }));
    setLeadData((prevState) => ({ ...prevState, services: newServices }));
    console.log("Fetch After changing Services" , leadData)
  }, [totalServices, defaultService]);
  useEffect(() => {
    setTimeout(() => {
      const newServices = Array.from({ length: totalServices }, () => ({
        ...defaultService,
      }));
      setLeadData((prevState) => ({ ...prevState, services: newServices }));
      fetchData();
      console.log("Fetch After 1 second" , leadData)
    }, 1000);
  }, []);

  const totalSteps = () => {
    return steps.length;
  };

  const completedSteps = () => {
    return Object.keys(completed).length;
  };
  const isLastStep = () => {
    return activeStep === totalSteps() - 1;
  };

  const allStepsCompleted = () => {
    return completedSteps() === totalSteps();
  };
  


  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
    setActiveStep(newActiveStep);

  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  function formatDate(inputDate) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = new Date(inputDate).toLocaleDateString(
      "en-US",
      options
    );
    return formattedDate;
  }
  const getOrdinal = (number) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const lastDigit = number % 10;
    const suffix = suffixes[lastDigit <= 3 ? lastDigit : 0];
    return `${number}${suffix}`;
  };
  const handleViewPdfReciepts = (paymentreciept) => {
    const pathname = paymentreciept;
    //console.log(pathname);
    window.open(`${secretKey}/recieptpdf/${pathname}`, "_blank");
  };

  const handleViewPdOtherDocs = (pdfurl) => {
    const pathname = pdfurl;
    console.log(pathname);
    window.open(`${secretKey}/otherpdf/${pathname}`, "_blank");
  };
  const handleStep = (step) => () => {
    setActiveStep(step);
  };
  
  const handleComplete = async () => {
    try {
      const formData = new FormData();
      const newCompleted = completed;
      newCompleted[activeStep] = true;

      setCompleted(newCompleted);

      // Prepare the data to send to the backend
      let dataToSend = {
        ...leadData,
        Step1Status: true,
      };

      if (activeStep === 1) {
        dataToSend = {
          ...dataToSend,
          Step2Status: true,
          bookingSource: selectedValues,
        };
      } else if (activeStep === 2) {
        const totalAmount = leadData.services.reduce((acc, curr) => acc + curr.totalPaymentWOGST, 0)
        const receivedAmount = leadData.services.reduce((acc, curr) => {
          return curr.paymentTerms === "Full Advanced" ? acc + curr.totalPaymentWOGST : acc + curr.firstPayment;
        }, 0);
        const pendingAmount = totalAmount - receivedAmount;
        dataToSend = {
          ...dataToSend,
          Step2Status: true,
          Step3Status: true,
          totalAmount:totalAmount ,
          receivedAmount:receivedAmount,
          pendingAmount:pendingAmount

          
        };
      } else if (activeStep === 3) {
        dataToSend = {
          ...dataToSend,
          Step3Status: true,
          Step4Status: true,
        };
      } else if (activeStep === 4) {
        dataToSend = {
          ...dataToSend,
          Step3Status: true,
          Step4Status: true,
          Step5Status: true
        };
      }
      // console.log(activeStep, dataToSend);
      Object.keys(dataToSend).forEach((key) => {
        if (key === "services") {
          // Handle services separately as it's an array
          dataToSend.services.forEach((service, index) => {
            Object.keys(service).forEach((prop) => {
              formData.append(`services[${index}][${prop}]`, service[prop]);
            });
          });
        } else if (key === "otherDocs" && leadData.otherDocs) {
          for (let i = 0; i < leadData.otherDocs.length; i++) {
            formData.append("otherDocs", leadData.otherDocs[i]);
          }
        } else if (key === "paymentReceipt" && leadData.paymentReceipt) {
          console.log(
            "Payment Receipt to be appended:",
            leadData.paymentReceipt[0]
          );

          formData.append("paymentReceipt", leadData.paymentReceipt[0]);
        } else {
          formData.append(key, dataToSend[key]);
        }
      });
      if (activeStep === 4) {
        dataToSend = {
          ...leadData,
          paymentReceipt: leadData.paymentReceipt
            ? leadData.paymentReceipt
            : null,
        };
        try {
          const response = await axios.post(
            `${secretKey}/redesigned-final-leadData/${companysName}`,
            leadData
          );

          console.log(response.data);
          Swal.fire({
            icon: 'success',
            title: 'Form Submitted',
            text: 'Your form has been submitted successfully!',
          });
          // Handle response data as needed
        } catch (error) {
          console.error("Error uploading data:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'There was an error submitting the form. Please try again later.',
          });
          // Handle error
        }
      } else {
        try {
          const response = await axios.post(
            `${secretKey}/redesigned-leadData/${companysName}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

         
          // Handle response data as needed
        } catch (error) {
          console.error("Error uploading data:", error);
          // Handle error
        }
      }

      fetchData();


      // Log the response from the backend

      handleNext();
    } catch (error) {
      console.error("Error sending data to backend:", error);
      // Handle error if needed
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
  };


  console.log(leadData.Step1Status , "Boom");
  const renderServices = () => {
    const services = [];
 
    if (leadData.services.length === Number(totalServices)) {
      for (let i = 0; i < totalServices; i++) {
        services.push(  
          <div key={i} className="servicesFormCard mt-3">
            {/* <div className="services_No">
              1
        </div> */}
            <div className="d-flex align-items-center">
              <div className="selectservices-label mr-2">
                <label for="">Select Service:</label>
              </div>
              <div className="selectservices-label-selct">
                <select
                  className="form-select mt-1"
                  id={`Service-${i}`}
                  value={leadData.services[i].serviceName}
                  onChange={(e) => {
                    setLeadData((prevState) => ({
                      ...prevState,
                      services: prevState.services.map((service, index) =>
                        index === i
                          ? { ...service, serviceName: e.target.value }
                          : service
                      ),
                    }));
                  }}
                  disabled={
                    completed[activeStep] === true
                  }
                >
                  <option value="" disabled selected>
                    Select Service Name
                  </option>
                  <option value="Start Up Certificate">
                    Startup certificate
                  </option>
                  <option value="Boom">Boom</option>
                  <option value="Baaam">Baaam</option>
                  <option value="vooooo">voooo</option>
                </select>
              </div>
              {leadData.services[i].serviceName === "Start Up Certificate" && (
                <div className="ml-2">
                  <div class="form-check m-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="dsc"
                      value="0"
                      checked={leadData.services[i].withDSC}
                      onChange={(e) => {
                        setLeadData((prevState) => ({
                          ...prevState,
                          services: prevState.services.map((service, index) =>
                            index === i
                              ? { ...service, withDSC: !service.withDSC }
                              : service
                          ),
                        }));
                      }}
                      readOnly={
                        completed[activeStep] === true
                      }
                    />
                    <label class="form-check-label" for="dsc">
                      WITH DSC
                    </label>
                  </div>
                </div>
              )}
            </div>
            <hr className="mt-3 mb-3"></hr>
            <div className="row align-items-center mt-2">
              <div className="col-sm-8">
                <label class="form-label">Total Amount</label>
                <div className="d-flex align-items-center">
                  <div class="input-group total-payment-inputs mb-2">
                    <input
                      type="number"
                      class="form-control "
                      placeholder="Enter Amount"
                      id={`Amount-${i}`}
                      value={leadData.services[i].totalPaymentWOGST}
                      onChange={(e) => {
                        setLeadData((prevState) => ({
                          ...prevState,
                          services: prevState.services.map((service, index) =>
                            index === i
                              ? {
                                  ...service,
                                  totalPaymentWOGST: e.target.value,
                                  totalPaymentWGST:
                                    service.withGST === true
                                      ? Number(e.target.value) +
                                        Number(e.target.value * 0.18)
                                      : e.target.value,
                                }
                              : service
                          ),
                        }));
                      }}
                      readOnly={
                        completed[activeStep] === true
                      }
                    />
                    <button class="btn" type="button">
                      ₹
                    </button>
                  </div>
                  <div class="form-check ml-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="GST"
                      value="0"
                      checked={leadData.services[i].withGST}
                      onChange={(e) => {
                        setLeadData((prevState) => ({
                          ...prevState,
                          services: prevState.services.map((service, index) =>
                            index === i
                              ? {
                                  ...service,
                                  withGST: !service.withGST,
                                  totalPaymentWGST:
                                    service.withGST === false
                                      ? Number(
                                          service.totalPaymentWOGST * 0.18
                                        ) + Number(service.totalPaymentWOGST)
                                      : service.totalPaymentWOGST,
                                }
                              : service
                          ),
                        }));
                      }}
                      readOnly={
                        completed[activeStep] === true
                      }
                    />
                    <label class="form-check-label" for="GST">
                      WITH GST (18%)
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="form-group">
                  <label class="form-label">Total Amount With GST</label>
                  <div class="input-group mb-2">
                    <input
                      type="text"
                      className={
                        parseInt(leadData.services[i].firstPayment) +
                          parseInt(leadData.services[i].secondPayment) +
                          parseInt(leadData.services[i].thirdPayment) +
                          parseInt(leadData.services[i].fourthPayment) !==
                          parseInt(leadData.services[i].totalPaymentWGST) &&
                        leadData.services[i].paymentTerms !== "Full Advanced"
                          ? "form-control error-border"
                          : "form-control"
                      }
                      placeholder="Search for…"
                      id={`Amount-${i}`}
                      value={leadData.services[i].totalPaymentWGST}
                      disabled

                    />
                    <button class="btn" type="button">
                      ₹
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-sm-12">
                <label className="form-label">Payment Terms</label>
              </div>
              <div className="full-time col-sm-12">
                <label className="form-check form-check-inline col">
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`radio-name-${i}`}
                    value="Full Advanced"
                    checked={
                      leadData.services[i].paymentTerms === "Full Advanced"
                    }
                    onChange={(e) => {
                      setLeadData((prevState) => ({
                        ...prevState,
                        services: prevState.services.map((service, index) =>
                          index === i
                            ? {
                                ...service,
                                paymentTerms: e.target.value,
                              }
                            : service
                        ),
                      }));
                    }}
                    disabled={
                      completed[activeStep] === true
                    }
                  />
                  <span className="form-check-label">Full Advanced</span>
                </label>
                <label className="form-check form-check-inline col">
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`radio-name-${i}`}
                    value="two-part"
                    checked={leadData.services[i].paymentTerms === "two-part"}
                    onChange={(e) => {
                      setLeadData((prevState) => ({
                        ...prevState,
                        services: prevState.services.map((service, index) =>
                          index === i
                            ? {
                                ...service,
                                paymentTerms: e.target.value,
                                paymentCount: 2,
                              }
                            : service
                        ),
                      }));
                    }}
                    disabled={
                      completed[activeStep] === true
                    }
                  />

                  <span className="form-check-label">Part Payment</span>
                </label>
              </div>
            </div>
            {leadData.services[i].paymentTerms === "two-part" && (
              <div className="row mt-2">
                <div className="col-sm-3">
                  <div className="form-group">
                    <label class="form-label">First Payment</label>
                    <div class="input-group mb-2">
                      <input
                        type="number"
                        class="form-control"
                        placeholder="Enter First Payment"
                        value={leadData.services[i].firstPayment}
                        onChange={(e) => {
                          setLeadData((prevState) => ({
                            ...prevState,
                            services: prevState.services.map((service, index) =>
                              index === i
                                ? {
                                    ...service,
                                    firstPayment: e.target.value,
                                    secondPayment:
                                      service.paymentCount === 2
                                        ? service.totalPaymentWGST -
                                          e.target.value
                                        : service.secondPayment,
                                  }
                                : service
                            ),
                          }));
                        }}
                        readOnly={
                          completed[activeStep] === true
                        }
                      />
                      <button class="btn" type="button">
                        ₹
                      </button>
                    </div>
                  </div>
                </div>
                {leadData.services[i].paymentCount > 1 && (
                  <div className="col-sm-3">
                    <div className="form-group">
                      <label class="form-label">Second Payment</label>
                      <div class="input-group mb-2">
                        <input
                          type="text"
                          class="form-control"
                          placeholder="Search for…"
                          value={leadData.services[i].secondPayment}
                          onChange={(e) => {
                            setLeadData((prevState) => ({
                              ...prevState,
                              services: prevState.services.map(
                                (service, index) =>
                                  index === i
                                    ? {
                                        ...service,
                                        secondPayment: e.target.value,
                                        thirdPayment:
                                          service.paymentCount === 3
                                            ? service.totalPaymentWGST -
                                              service.firstPayment -
                                              e.target.value
                                            : service.thirdPayment,
                                      }
                                    : service
                              ),
                            }));
                          }}
                          readOnly={leadData.services[i].paymentCount === 2}
                        />
                        <button class="btn" type="button">
                          ₹
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {leadData.services[i].paymentCount > 2 && (
                  <div className="col-sm-3">
                    <div className="form-group">
                      <label class="form-label">Third Payment</label>
                      <div class="input-group mb-2">
                        <input
                          type="text"
                          class="form-control"
                          placeholder="Search for…"
                          value={leadData.services[i].thirdPayment}
                          onChange={(e) => {
                            setLeadData((prevState) => ({
                              ...prevState,
                              services: prevState.services.map(
                                (service, index) =>
                                  index === i
                                    ? {
                                        ...service,
                                        thirdPayment: e.target.value,
                                        fourthPayment:
                                          service.paymentCount === 4
                                            ? service.totalPaymentWGST -
                                              service.firstPayment -
                                              service.secondPayment -
                                              e.target.value
                                            : service.fourthPayment,
                                      }
                                    : service
                              ),
                            }));
                          }}
                          readOnly={leadData.services[i].paymentCount === 3}
                        />
                        <button class="btn" type="button">
                          ₹
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {leadData.services[i].paymentCount > 3 && (
                  <div className="col-sm-3">
                    <div className="form-group">
                      <label class="form-label">Fourth Payment</label>
                      <div class="input-group mb-2">
                        <input
                          type="text"
                          class="form-control"
                          placeholder="Search for…"
                          value={leadData.services[i].fourthPayment}
                          onChange={(e) => {
                            setLeadData((prevState) => ({
                              ...prevState,
                              services: prevState.services.map(
                                (service, index) =>
                                  index === i
                                    ? {
                                        ...service,
                                        fourthPayment: e.target.value,
                                      }
                                    : service
                              ),
                            }));
                          }}
                          readOnly={leadData.services[i].paymentCount === 4}
                        />
                        <button class="btn" type="button">
                          ₹
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  disabled={leadData.services[i].paymentCount === 4}
                  onClick={(e) => {
                    setLeadData((prevState) => ({
                      ...prevState,
                      services: prevState.services.map((service, index) =>
                        index === i
                          ? {
                              ...service,
                              paymentCount: service.paymentCount + 1,
                              firstPayment: 0,
                              secondPayment: 0,
                              thirdPayment: 0,
                              fourthPayment: 0,
                            }
                          : service
                      ),
                    }));
                  }}
                  style={{ marginLeft: "5px" }}
                  className="btn btn-primary"
                >
                  <i className="fas fa-plus"></i> +{" "}
                </button>
                <button
                  disabled={leadData.services[i].paymentCount === 2}
                  onClick={(e) => {
                    setLeadData((prevState) => ({
                      ...prevState,
                      services: prevState.services.map((service, index) =>
                        index === i
                          ? {
                              ...service,
                              paymentCount: service.paymentCount - 1,
                              firstPayment: 0,
                              secondPayment: 0,
                              thirdPayment: 0,
                              fourthPayment: 0,
                            }
                          : service
                      ),
                    }));
                  }}
                  style={{ marginLeft: "5px" }}
                  className="btn btn-primary"
                >
                  <i className="fas fa-plus"></i> -{" "}
                </button>
              </div>
            )}

            <div className="col-sm-6 mt-1">
              <div className="form-group ">
                <label className="form-label" for="Company">
                  Payment Remarks
                </label>
                <textarea
                  rows={1}
                  className="form-control "
                  placeholder="Enter Payment Remarks"
                  id={`payment-remarks-${i}`}
                  value={leadData.services.paymentRemarks}
                  onClick={(e) => {
                    setLeadData((prevState) => ({
                      ...prevState,
                      services: prevState.services.map((service, index) =>
                        index === i
                          ? {
                              ...service,
                              paymentRemarks: e.target.value,
                            }
                          : service
                      ),
                    }));
                  }}
                  readOnly={
                    completed[activeStep] === true
                  }
                ></textarea>
              </div>
            </div>
          </div>
        );
      }
    }
    return services;
  };

  console.log("Default Lead Data :", leadData);
  const handleInputChange = (value, id) => {
    setLeadData({ ...leadData, [id]: value });
  };

  const handleRemoveFile = () => {
    setLeadData({ ...leadData, paymentReceipt: null });
  };
  const handleRemoveOtherFile = (index) => {
    setLeadData((prevLeadData) => {
      const updatedDocs = [...prevLeadData.otherDocs];
      updatedDocs.splice(index, 1);
      return {
        ...prevLeadData,
        otherDocs: updatedDocs,
      };
    });
  };

  return (
    <div>
      <div className="container mt-2">
        <div className="card">
          <div className="card-body p-3">
            <Box sx={{ width: "100%" }}>
              <Stepper nonLinear activeStep={activeStep}>
                {steps.map((label, index) => (
                  <Step key={label} completed={completed[index]}>
                    <StepButton
                      color="inherit"
                      onClick={handleStep(index)}
                      className={
                        activeStep === index ? "form-tab-active" : "No-active"
                      }
                      disabled={!completed[index]}
                    >
                      {label}
                    </StepButton>
                  </Step>
                ))}
              </Stepper>
              <div className="steprForm-bg">
                <div className="steprForm">
                  {allStepsCompleted() ? (
                    <React.Fragment>
                      <Typography sx={{ mt: 2, mb: 1 }}>
                        All steps completed - you&apos;re finished
                      </Typography>
                      <Box
                        sx={{ display: "flex", flexDirection: "row", pt: 2 }}
                      >
                        <Box sx={{ flex: "1 1 auto" }} />
                        <Button onClick={handleReset}>Reset</Button>
                      </Box>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      {activeStep === 0 && (
                        <>
                          <div className="step-1">
                            <h2 className="text-center">
                              Step:1 - Company's Basic Informations
                            </h2>
                            <div className="steprForm-inner">
                              <form>
                                <div className="row">
                                  <div className="col-sm-4">
                                    <div className="form-group mt-2 mb-2">
                                      <label for="Company">Company Name:</label>
                                      <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Enter Company Name"
                                        id="Company"
                                        value={leadData["Company Name"]}
                                        onChange={(e) => {
                                          handleInputChange(
                                            e.target.value,
                                            "Company Name"
                                          );
                                        }}
                                        readOnly={
                                          completed[activeStep] === true
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="col-sm-4">
                                    <div className="form-group mt-2 mb-2">
                                      <label for="email">Email Address:</label>
                                      <input
                                        type="email"
                                        className="form-control mt-1"
                                        placeholder="Enter email"
                                        id="email"
                                        value={leadData["Company Email"]}
                                        onChange={(e) => {
                                          handleInputChange(
                                            e.target.value,
                                            "Company Email"
                                          );
                                        }}
                                        readOnly={
                                          completed[activeStep] === true
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="col-sm-4">
                                    <div className="form-group mt-2 mb-2">
                                      <label for="number">Phone No:</label>
                                      <input
                                        type="tel"
                                        className="form-control mt-1"
                                        placeholder="Enter Number"
                                        id="number"
                                        value={leadData["Company Number"]}
                                        onChange={(e) => {
                                          handleInputChange(
                                            e.target.value,
                                            "Company Number"
                                          );
                                        }}
                                        readOnly={
                                          completed[activeStep] === true
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="col-sm-4">
                                    <div className="form-group mt-2 mb-2">
                                      <label for="number">
                                        Incorporation date:
                                      </label>
                                      <input
                                        type="date"
                                        className="form-control mt-1"
                                        placeholder="Incorporation Date"
                                        id="inco-date"
                                        value={leadData.incoDate}
                                        onChange={(e) => {
                                          handleInputChange(
                                            e.target.value,
                                            "incoDate"
                                          );
                                        }}
                                        readOnly={
                                          completed[activeStep] === true
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="col-sm-4">
                                    <div className="form-group mt-2 mb-2">
                                      <label for="pan">Company's PAN:</label>
                                      <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Enter Company's PAN"
                                        id="pan"
                                        value={leadData.panNumber}
                                        onChange={(e) => {
                                          handleInputChange(
                                            e.target.value,
                                            "panNumber"
                                          );
                                        }}
                                        readOnly={
                                          completed[activeStep] === true
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="col-sm-4">
                                    <div className="form-group mt-2 mb-2">
                                      <label for="gst">Company's GST:</label>
                                      <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Enter Company's GST"
                                        id="gst"
                                        value={leadData.gstNumber}
                                        onChange={(e) => {
                                          handleInputChange(
                                            e.target.value,
                                            "gstNumber"
                                          );
                                        }}
                                        readOnly={
                                          completed[activeStep] === true
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              </form>
                            </div>
                          </div>
                        </>
                      )}
                      {activeStep === 1 && (
                        <>
                          <div className="step-2">
                            <h2 className="text-center">
                              Step:2 - Booking Details
                            </h2>
                            <div className="steprForm-inner">
                              <form>
                                <div className="row">
                                  <div className="col-sm-3">
                                    <div className="form-group mt-2 mb-2">
                                      <label for="bdeName">BDE Name:</label>
                                      <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Enter BDE Name"
                                        id="bdeName"
                                        value={leadData.bdeName}
                                        onChange={(e) => {
                                          handleInputChange(
                                            e.target.value,
                                            "bdeName"
                                          );
                                        }}
                                        readOnly={
                                          completed[activeStep] === true
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="col-sm-3">
                                    <div className="form-group mt-2 mb-2">
                                      <label for="BDEemail">
                                        BDE Email Address:
                                      </label>
                                      <input
                                        type="email"
                                        className="form-control mt-1"
                                        placeholder="Enter BDE email"
                                        id="BDEemail"
                                        value={leadData.bdeEmail}
                                        onChange={(e) => {
                                          handleInputChange(
                                            e.target.value,
                                            "bdeEmail"
                                          );
                                        }}
                                        readOnly={
                                          completed[activeStep] === true
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="col-sm-3">
                                    <div className="form-group mt-2 mb-2">
                                      <label for="bdmName">BDM Name:</label>
                                      <input
                                        type="text"
                                        className="form-control mt-1"
                                        placeholder="Enter BDM Name"
                                        id="bdmName"
                                        value={leadData.bdmName}
                                        onChange={(e) => {
                                          handleInputChange(
                                            e.target.value,
                                            "bdmName"
                                          );
                                        }}
                                        readOnly={
                                          completed[activeStep] === true
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="col-sm-3">
                                    <div className="form-group mt-2 mb-2">
                                      <label for="BDMemail">
                                        BDM Email Address:
                                      </label>
                                      <input
                                        type="email"
                                        className="form-control mt-1"
                                        placeholder="Enter BDM email"
                                        id="BDMemail"
                                        value={leadData.bdmEmail}
                                        onChange={(e) => {
                                          handleInputChange(
                                            e.target.value,
                                            "bdmEmail"
                                          );
                                        }}
                                        readOnly={
                                          completed[activeStep] === true
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="col-sm-4">
                                    <div className="form-group mt-2 mb-2">
                                      <label for="booking-date">
                                        Booking Date
                                      </label>
                                      <input
                                        type="date"
                                        className="form-control mt-1"
                                        placeholder="Enter Booking date"
                                        id="booking-date"
                                        value={leadData.bookingDate}
                                        onChange={(e) => {
                                          handleInputChange(
                                            e.target.value,
                                            "bookingDate"
                                          );
                                        }}
                                        readOnly={
                                          completed[activeStep] === true
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="col-sm-4">
                                    <div className="form-group mt-2 mb-2">
                                      <label for="lead-source">
                                        Lead Source:
                                      </label>
                                      <select
                                        value={selectedValues}
                                        onChange={(e) =>
                                          setSelectedValues(e.target.value)
                                        }
                                        className="form-select mt-1"
                                        id="lead-source"
                                        disabled={
                                          completed[activeStep] === true
                                        }
                                      >
                                        <option value="" disabled selected>
                                          Select Lead Source
                                        </option>
                                        <option value="Excel Data">
                                          Excel Data
                                        </option>
                                        <option value="Insta Lead">
                                          Insta Lead
                                        </option>
                                        <option value="Reference">
                                          Reference
                                        </option>
                                        <option value="Existing Client">
                                          Existing Client
                                        </option>
                                        <option value="Lead By Saurav Sir">
                                          Lead By Saurav Sir
                                        </option>
                                        <option value="Other">Other</option>
                                      </select>
                                    </div>
                                  </div>
                                  {selectedValues === "Other" && (
                                    <div className="col-sm-4">
                                      <div className="form-group mt-2 mb-2">
                                        <label for="OtherLeadSource">
                                          Other Lead Source
                                        </label>
                                        <input
                                          type="text"
                                          className="form-control mt-1"
                                          placeholder="Enter Other Lead Source"
                                          id="OtherLeadSource"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </form>
                            </div>
                          </div>
                        </>
                      )}
                      {activeStep === 2 && (
                        <>
                          <div className="step-3">
                            <h2 className="text-center">
                              Step:3 - Services & Payment
                            </h2>
                            <div className="steprForm-inner">
                              <form>
                                <div className="d-flex align-items-center">
                                  <div>
                                    {" "}
                                    <label for="lead-source">
                                      Select No of Services:
                                    </label>
                                  </div>
                                  <div className="ml-2">
                                    <select
                                      className="form-select mt-1"
                                      id="lead-source"
                                      value={totalServices}
                                      onChange={(e) =>
                                        setTotalServices(e.target.value)
                                      }
                                      disabled={completed[activeStep] === true}
                                    >
                                      {[...Array(6 - 1).keys()].map((year) => (
                                        <option key={year} value={1 + year}>
                                          {1 + year}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                {renderServices()}

                                <div className="CA-case mb-1">
                                  <label class="form-label">CA Case</label>
                                  <div className="check-ca-case">
                                    <div class="mb-3">
                                      <div>
                                        <label className="form-check form-check-inline">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="ca-case"
                                            onChange={(e) => {
                                              setLeadData((prevLeadData) => ({
                                                ...prevLeadData,
                                                caCase: e.target.value, // Set the value based on the selected radio button
                                              }));
                                            }}
                                            disabled={
                                              completed[activeStep] === true
                                            }
                                            value="Yes" // Set the value attribute for "Yes"
                                            checked={leadData.caCase === "Yes"} // Check condition based on state
                                          />
                                          <span className="form-check-label">
                                            Yes
                                          </span>
                                        </label>
                                        <label className="form-check form-check-inline">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="ca-case"
                                            onChange={(e) => {
                                              setLeadData((prevLeadData) => ({
                                                ...prevLeadData,
                                                caCase: e.target.value, // Set the value based on the selected radio button
                                              }));
                                            }}
                                            disabled={
                                              completed[activeStep] === true
                                            }
                                            value="No" // Set the value attribute for "No"
                                            checked={leadData.caCase === "No"} // Check condition based on state
                                          />
                                          <span className="form-check-label">
                                            No
                                          </span>
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  {leadData.caCase === "Yes" && (
                                    <div className="ca-details row">
                                      <div className="ca-number col">
                                        <label className="form-label">
                                          Enter CA's Number
                                        </label>
                                        <input
                                          type="number"
                                          name="ca-number"
                                          id="ca-number"
                                          placeholder="Enter CA's Number"
                                          className="form-control"
                                          onChange={(e) => {
                                            setLeadData((prevLeadData) => ({
                                              ...prevLeadData,
                                              caNumber: e.target.value, // Set the value based on the selected radio button
                                            }));
                                          }}
                                          readOnly={
                                            completed[activeStep] === true
                                          }
                                        />
                                      </div>
                                      <div className="ca-email col">
                                        <label className="form-label">
                                          Enter CA's Email
                                        </label>
                                        <div className="ca-email2">
                                          <input
                                            type="text"
                                            name="ca-email"
                                            id="ca-email"
                                            placeholder="Enter CA's Email Address"
                                            className="form-control"
                                            onChange={(e) => {
                                              setLeadData((prevLeadData) => ({
                                                ...prevLeadData,
                                                caEmail: e.target.value, // Set the value based on the selected radio button
                                              }));
                                            }}
                                            readOnly={
                                              completed[activeStep] === true
                                            }
                                          />
                                        </div>
                                      </div>

                                      <div className="ca-commision col">
                                        <label className="form-label">
                                          Enter CA's Commission
                                        </label>
                                        <input
                                          type="text"
                                          name="ca-commision"
                                          id="ca-commision"
                                          placeholder="Enter CA's Commision- If any"
                                          className="form-control"
                                          onChange={(e) => {
                                            setLeadData((prevLeadData) => ({
                                              ...prevLeadData,
                                              caCommission: e.target.value, // Set the value based on the selected radio button
                                            }));
                                          }}
                                          readOnly={
                                            completed[activeStep] === true
                                          }
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </form>
                            </div>
                          </div>
                        </>
                      )}
                      {activeStep === 3 && (
                        <>
                          <div className="step-4">
                            <h2 className="text-center">
                              Step:4 - Payment Summery
                            </h2>
                            <div className="steprForm-inner">
                              <form>
                                <div className="row">
                                  <div className="col-sm-12">
                                    <span className="notes">
                                      Note: Total Selected Services is{" "}
                                      <b>{leadData.services.length}</b>.
                                    </span>
                                  </div>
                                  <div className="col-sm-4 mt-3">
                                    <div className="form-group">
                                      <label class="form-label">
                                        Total Payment
                                      </label>
                                      <div class="input-group mb-2">
                                        <input
                                          type="number"
                                          class="form-control"
                                          placeholder="Total Payment"
                                          value={leadData.services.reduce(
                                            (total, service) =>
                                              total +
                                              Number(service.totalPaymentWGST),
                                            0
                                          )}
                                          readOnly
                                        />
                                        <button class="btn" type="button">
                                          ₹
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-sm-4 mt-3">
                                    <div className="form-group">
                                      <label class="form-label">
                                        Received Payment
                                      </label>
                                      <div class="input-group">
                                        <input
                                          type="number"
                                          class="form-control"
                                          placeholder="Received Payment"
                                          value={leadData.services.reduce(
                                            (total, service) =>
                                              service.paymentTerms ===
                                              "Full Advanced"
                                                ? total +
                                                  Number(
                                                    service.totalPaymentWGST
                                                  )
                                                : total +
                                                  Number(service.firstPayment),
                                            0
                                          )}
                                          readOnly
                                        />
                                        <button class="btn" type="button">
                                          ₹
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-sm-4 mt-3">
                                    <div className="form-group">
                                      <label class="form-label">
                                        Pending Payment
                                      </label>
                                      <div class="input-group mb-2">
                                        <input
                                          type="number"
                                          class="form-control"
                                          placeholder="Pending Payment"
                                          value={leadData.services.reduce(
                                            (total, service) =>
                                              service.paymentTerms ===
                                              "Full Advanced"
                                                ? total + 0
                                                : total +
                                                  Number(
                                                    service.totalPaymentWGST
                                                  ) -
                                                  Number(service.firstPayment),
                                            0
                                          )}
                                          readOnly
                                        />
                                        <button class="btn" type="button">
                                          ₹
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-sm-6 mt-2">
                                    <div className="form-group mt-2 mb-2">
                                      <label
                                        className="form-label"
                                        for="Payment Receipt"
                                      >
                                        Upload Payment Reciept
                                      </label>
                                      <input
                                        type="file"
                                        className="form-control mt-1"
                                        id="Company"
                                        onChange={(e) => {
                                          // Update the state with the selected files
                                          setLeadData((prevLeadData) => ({
                                            ...prevLeadData,
                                            paymentReceipt: [
                                              ...(prevLeadData.paymentReceipt ||
                                                []),
                                              ...e.target.files,
                                            ],
                                          }));
                                        }}
                                        disabled={
                                          completed[activeStep] === true
                                        }
                                        multi
                                      ></input>
                                    </div>
                                  </div>

                                  <div className="col-sm-6 mt-2">
                                    <div class="form-group mt-2 mb-2">
                                      <label class="form-label">
                                        Payment Method
                                      </label>
                                      <select
                                        class="form-select mb-3"
                                        id="select-emails"
                                        fdprocessedid="iey9wm"
                                        value={leadData.paymentMethod}
                                        onChange={(e) => {
                                          handleInputChange(
                                            e.target.value,
                                            "paymentMethod"
                                          );
                                        }}
                                        disabled={
                                          completed[activeStep] === true
                                        }
                                      >
                                        <option value="" disabled="">
                                          Select Payment Option
                                        </option>
                                        <option value="ICICI Bank">
                                          ICICI Bank
                                        </option>
                                        <option value="SRK Seedfund(Non GST)/IDFC first Bank">
                                          SRK Seedfund(Non GST)/IDFC first Bank
                                        </option>
                                        <option value="STARTUP SAHAY SERVICES/ADVISORY(Non GST)/ IDFC First Bank">
                                          STARTUP SAHAY SERVICES/ADVISORY(Non
                                          GST)/ IDFC First Bank
                                        </option>
                                        <option value="Razorpay">
                                          Razorpay
                                        </option>
                                        <option value="PayU">PayU</option>
                                        <option value="Other">Other</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-sm-6 mt-2">
                                    <div className="form-group">
                                      <label
                                        className="form-label"
                                        for="remarks"
                                      >
                                        Any Extra Remarks
                                      </label>
                                      <textarea
                                        rows={1}
                                        className="form-control mt-1"
                                        placeholder="Enter Extra Remarks"
                                        id="Extra Remarks"
                                        value={leadData.extraNotes}
                                        onChange={(e) => {
                                          handleInputChange(
                                            e.target.value,
                                            "extraNotes"
                                          );
                                        }}
                                        readOnly={
                                          completed[activeStep] === true
                                        }
                                      ></textarea>
                                    </div>
                                  </div>
                                  <div className="col-sm-6 mt-2">
                                    <div className="form-group">
                                      <label className="form-label" for="docs">
                                        Upload Additional Docs
                                      </label>
                                      <input
                                        type="file"
                                        onChange={(e) => {
                                          // Update the state with the selected files
                                          setLeadData((prevLeadData) => ({
                                            ...prevLeadData,
                                            otherDocs: [
                                              ...(prevLeadData.otherDocs || []),
                                              ...e.target.files,
                                            ],
                                          }));
                                        }}
                                        disabled={
                                          completed[activeStep] === true
                                        }
                                        className="form-control mt-1"
                                        id="docs"
                                        multiple
                                      />
                                      {leadData.otherDocs &&
                                        leadData.otherDocs.length > 0 && (
                                          <div className="uploaded-filename-main d-flex flex-wrap">
                                            {leadData.otherDocs.map(
                                              (file, index) => (
                                                <div
                                                  className="uploaded-fileItem d-flex align-items-center"
                                                  key={index}
                                                >
                                                  <p className="m-0">
                                                    {file.name !== undefined
                                                      ? file.name
                                                      : file.filename}
                                                  </p>
                                                  <button
                                                    className="fileItem-dlt-btn"
                                                    onClick={() =>
                                                      handleRemoveOtherFile(
                                                        index
                                                      )
                                                    }
                                                    disabled={
                                                      completed[activeStep] ===
                                                      true
                                                    }
                                                  >
                                                    <IconX className="close-icon" />
                                                  </button>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              </form>
                            </div>
                          </div>
                        </>
                      )}
                      {activeStep === 4 && (
                        <>
                          <div className="step-3">
                            <h2 className="text-center">
                              Step:5 - Booking Preview
                            </h2>
                            <div className="steprForm-inner">
                              <div className="stepOnePreview">
                                <div className="d-flex align-items-center">
                                  <div className="services_No">1</div>
                                  <div className="ml-1">
                                    <h3 className="m-0">
                                      Company's Basic Informations
                                    </h3>
                                  </div>
                                </div>
                                <div className="servicesFormCard mt-3">
                                  <div className="row m-0">
                                    <div className="col-sm-3 p-0">
                                      <div className="form-label-name">
                                        <b>Compnay name</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data">
                                        {leadData["Company Name"]}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row m-0">
                                    <div className="col-sm-3 p-0">
                                      <div className="form-label-name">
                                        <b>Email Address:</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data">
                                        {leadData["Company Email"]}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row m-0">
                                    <div className="col-sm-3 p-0">
                                      <div className="form-label-name">
                                        <b>Phone No:</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data">
                                        {leadData["Company Number"]}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row m-0">
                                    <div className="col-sm-3 p-0">
                                      <div className="form-label-name">
                                        <b>Incorporation date:</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data">
                                        {formatDate(leadData.incoDate)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row m-0">
                                    <div className="col-sm-3 p-0">
                                      <div className="form-label-name">
                                        <b>Company's PAN:</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data">
                                        {leadData.panNumber ? leadData.panNumber : "-"}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row m-0">
                                    <div className="col-sm-3 p-0">
                                      <div className="form-label-name">
                                        <b>Company's GST:</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data">
                                        {leadData.gstNumber ? leadData.gstNumber : "-"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="stepTWOPreview">
                                <div className="d-flex align-items-center mt-3">
                                  <div className="services_No">2</div>
                                  <div className="ml-1">
                                    <h3 className="m-0">Booking Details</h3>
                                  </div>
                                </div>
                                <div className="servicesFormCard mt-3">
                                  <div className="row m-0">
                                    <div className="col-sm-3 p-0">
                                      <div className="form-label-name">
                                        <b>BDE Name:</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data">
                                        {leadData.bdeName}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row m-0">
                                    <div className="col-sm-3 p-0">
                                      <div className="form-label-name">
                                        <b>BDE Email</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data">
                                        {leadData.bdeEmail}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row m-0">
                                    <div className="col-sm-3 p-0">
                                      <div className="form-label-name">
                                        <b>BDM Name</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data">
                                        {leadData.bdmName}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row m-0">
                                    <div className="col-sm-3 p-0">
                                      <div className="form-label-name">
                                        <b>BDM Email</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data">
                                        {leadData.bdmEmail}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row m-0">
                                    <div className="col-sm-3 p-0">
                                      <div className="form-label-name">
                                        <b>Booking Date</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data">
                                        {leadData.bookingDate}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row m-0">
                                    <div className="col-sm-3 p-0">
                                      <div className="form-label-name">
                                        <b>Lead Source</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data">
                                        {leadData.bookingSource !== ""
                                          ? leadData.bookingSource
                                          : "-"}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row m-0">
                                    <div className="col-sm-3 p-0">
                                      <div className="form-label-name">
                                        <b>Other Lead Source</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data">
                                        {leadData.bookingSource !== ""
                                          ? leadData.bookingSource
                                          : "-"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="stepThreePreview">
                                <div className="d-flex align-items-center mt-3">
                                  <div className="services_No">3</div>
                                  <div className="ml-1">
                                    <h3 className="m-0">
                                      Services And Payment Details
                                    </h3>
                                  </div>
                                </div>
                                <div className="servicesFormCard mt-3">
                                  <div className="row m-0">
                                    <div className="col-sm-3 p-0">
                                      <div className="form-label-name">
                                        <b>Total Selected Services</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data">
                                        {totalServices}
                                      </div>
                                    </div>
                                  </div>
                                  {leadData.services.map((obj, index) => (
                                    <div className="parServicesPreview mt-3">
                                      <div className="row m-0">
                                        <div className="col-sm-3 p-0">
                                          <div className="form-label-name">
                                            <b>
                                              {getOrdinal(index + 1)} Services
                                              Name
                                            </b>
                                          </div>
                                        </div>
                                        <div className="col-sm-9 p-0">
                                          <div className="form-label-data">
                                            {obj.serviceName}
                                          </div>
                                        </div>
                                      </div>
                                      {/* <!-- Optional --> */}
                                      {obj.serviceName ===
                                        "Start Up Certificate" && (
                                        <div className="row m-0">
                                          <div className="col-sm-3 p-0">
                                            <div className="form-label-name">
                                              <b>With DSC</b>
                                            </div>
                                          </div>
                                          <div className="col-sm-9 p-0">
                                            <div className="form-label-data">
                                              {obj.withDSC === true
                                                ? "Yes"
                                                : "No"}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      {/* total amount */}
                                      <div className="row m-0">
                                        <div className="col-sm-3 p-0">
                                          <div className="form-label-name">
                                            <b>Total Amount</b>
                                          </div>
                                        </div>
                                        <div className="col-sm-9 p-0">
                                          <div className="form-label-data">
                                            {obj.totalPaymentWGST !== undefined
                                              ? obj.totalPaymentWGST
                                              : "0"}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="row m-0">
                                        <div className="col-sm-3 p-0">
                                          <div className="form-label-name">
                                            <b>With GST</b>
                                          </div>
                                        </div>
                                        <div className="col-sm-9 p-0">
                                          <div className="form-label-data">
                                            {obj.withGST === true
                                              ? "Yes"
                                              : "No"}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="row m-0">
                                        <div className="col-sm-3 p-0">
                                          <div className="form-label-name">
                                            <b>Payment Terms</b>
                                          </div>
                                        </div>
                                        <div className="col-sm-9 p-0">
                                          <div className="form-label-data">
                                            {obj.paymentTerms}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="row m-0">
                                        <div className="col-sm-3 p-0">
                                          <div className="form-label-name">
                                            <b>First Payment</b>
                                          </div>
                                        </div>
                                        <div className="col-sm-9 p-0">
                                          <div className="form-label-data">
                                            {obj.firstPayment}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="row m-0">
                                        <div className="col-sm-3 p-0">
                                          <div className="form-label-name">
                                            <b>Second Payment</b>
                                          </div>
                                        </div>
                                        <div className="col-sm-9 p-0">
                                          <div className="form-label-data">
                                            {obj.secondPayment}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="row m-0">
                                        <div className="col-sm-3 p-0">
                                          <div className="form-label-name">
                                            <b>Third Payment</b>
                                          </div>
                                        </div>
                                        <div className="col-sm-9 p-0">
                                          <div className="form-label-data">
                                            {obj.thirdPayment}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="row m-0">
                                        <div className="col-sm-3 p-0">
                                          <div className="form-label-name">
                                            <b>Fourth Payment</b>
                                          </div>
                                        </div>
                                        <div className="col-sm-9 p-0">
                                          <div className="form-label-data">
                                            {obj.fourthPayment}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="row m-0">
                                        <div className="col-sm-3 p-0">
                                          <div className="form-label-name">
                                            <b>Notes</b>
                                          </div>
                                        </div>
                                        <div className="col-sm-9 p-0">
                                          <div className="form-label-data">
                                            {obj.paymentRemarks !== ""
                                              ? obj.paymentRemarks
                                              : "-"}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                  {/* total amount */}
                                </div>
                              </div>
                              <div className="stepThreePreview">
                                <div className="d-flex align-items-center mt-3">
                                  <div className="services_No">4</div>
                                  <div className="ml-1">
                                    <h3 className="m-0">Payment Summary</h3>
                                  </div>
                                </div>
                                <div className="servicesFormCard mt-3">
                                  <div className="row m-0">
                                    <div className="col-sm-4">
                                      <div className="row">
                                        <div className="col-sm-4 p-0">
                                          <div className="form-label-name">
                                            <b>Total Payment</b>
                                          </div>
                                        </div>
                                        <div className="col-sm-8 p-0">
                                          <div className="form-label-data">
                                            ₹ {leadData.totalAmount}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-sm-4">
                                      <div className="row">
                                        <div className="col-sm-5 p-0">
                                          <div className="form-label-name">
                                            <b>Received Paymnet</b>
                                          </div>
                                        </div>
                                        <div className="col-sm-7 p-0">
                                          <div className="form-label-data">
                                            ₹ {leadData.receivedAmount}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-sm-4">
                                      <div className="row">
                                        <div className="col-sm-4 p-0">
                                          <div className="form-label-name">
                                            <b>Pending Payment</b>
                                          </div>
                                        </div>
                                        <div className="col-sm-8 p-0">
                                          <div className="form-label-data">
                                            ₹ {leadData.pendingAmount}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row m-0">
                                    <div className="col-sm-3 align-self-stretc p-0">
                                      <div className="form-label-name h-100">
                                        <b>Upload Payment Receipt</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data">
                                        <div
                                          className="UploadDocPreview"
                                          onClick={() => {
                                            handleViewPdfReciepts(
                                              leadData.paymentReceipt[0].filename ? leadData.paymentReceipt[0].filename : leadData.paymentReceipt[0].name
                                            );
                                          }}
                                        >
                                          {leadData.paymentReceipt[0].filename ? (

                                            <>
                                              <div className="docItemImg">
                                                <img
                                                  src={
                                                    leadData.paymentReceipt[0].filename.endsWith('.pdf') ? pdfimg : img
                                                  }
                                                ></img>
                                              </div>
                                              <div
                                                className="docItemName wrap-MyText"
                                                title={
                                                  leadData.paymentReceipt[0].filename.split(
                                                    "-"
                                                  )[1]
                                                }
                                              >
                                                {
                                                  leadData.paymentReceipt[0].filename.split(
                                                    "-"
                                                  )[1]
                                                }
                                              </div>
                                            </>
                                          ) : (
                                            <>
                                            <div className="docItemImg">
                                              <img
                                                 src={
                                                  leadData.paymentReceipt[0].name.endsWith('.pdf') ? pdfimg : img
                                                }
                                              ></img>
                                            </div>
                                            <div
                                              className="docItemName wrap-MyText"
                                              title={
                                                leadData.paymentReceipt[0].name.split(
                                                  "-"
                                                )[1]
                                              }
                                            >
                                              {
                                                leadData.paymentReceipt[0].name.split(
                                                  "-"
                                                )[1]
                                              }
                                            </div>
                                          </>
                                          ) }
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row m-0">
                                    <div className="col-sm-3 p-0">
                                      <div className="form-label-name">
                                        <b>Payment Method</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data">
                                        {leadData.paymentMethod}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row m-0">
                                    <div className="col-sm-3 p-0">
                                      <div className="form-label-name">
                                        <b>Extra Remarks</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data">
                                        {leadData.extraNotes}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row m-0">
                                    <div className="col-sm-3 align-self-stretc p-0">
                                      <div className="form-label-name h-100">
                                        <b>Additional Docs</b>
                                      </div>
                                    </div>
                                    <div className="col-sm-9 p-0">
                                      <div className="form-label-data d-flex flex-wrap">
                                        { leadData.otherDocs.map((val) => (
                                          val.filename ? (
                                            <>
                                            <div
                                            className="UploadDocPreview"
                                            onClick={() => {
                                              handleViewPdOtherDocs(
                                                val.filename
                                              );
                                            }}
                                          >
                                            <div className="docItemImg">
                                              <img
                                                  src={
                                                    val.filename.endsWith('.pdf') ? pdfimg : img
                                                  }
                                              ></img>
                                            </div>
                                          </div>
                                            </>
                                          ) : (
                                            <>
                                            <div
                                            className="UploadDocPreview"
                                            onClick={() => {
                                              handleViewPdOtherDocs(
                                                val.name
                                              );
                                            }}
                                          >
                                            <div className="docItemImg">
                                              <img
                                                 src={
                                                  val.name.endsWith('.pdf') ? pdfimg : img
                                                }
                                              ></img>
                                            </div>
                                          </div>
                                            </>
                                          )
                                          
                                        ))}

                                        {/* <div className="UploadDocPreview">
                                          <div className="docItemImg">
                                            <img src={img}></img>
                                          </div>
                                          <div
                                            className="docItemName wrap-MyText"
                                            title="logo.png"
                                          >
                                            logo.png
                                          </div>
                                        </div>
                                        <div className="UploadDocPreview">
                                          <div className="docItemImg">
                                            <img src={wordimg}></img>
                                          </div>
                                          <div
                                            className="docItemName wrap-MyText"
                                            title=" information.word"
                                          >
                                            information.word
                                          </div>
                                        </div>
                                        <div className="UploadDocPreview">
                                          <div className="docItemImg">
                                            <img src={excelimg}></img>
                                          </div>
                                          <div
                                            className="docItemName wrap-MyText"
                                            title="financials.csv"
                                          >
                                            financials.csv
                                          </div>
                                        </div> */}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      <Box
                        sx={{ display: "flex", flexDirection: "row", pt: 2 }}
                      >
                        <Button
                          color="inherit"
                          variant="contained"
                          disabled={activeStep === 0}
                          onClick={handleBack}
                          sx={{ mr: 1 }}
                        >
                          Back
                        </Button>
                        <Box sx={{ flex: "1 1 auto" }} />
                        <Button
                          onClick={handleNext}
                          variant="contained"
                          sx={{ mr: 1 }}
                          disabled={!leadData['Step' + (activeStep + 1) + 'Status']}                          
                        >
                          Next
                        </Button>
                        {activeStep !== steps.length &&
                          (completed[activeStep] ? (
                            <>
                              <Button
                                onClick={() => {
                                  setCompleted({ activeStep: false });
                                }}
                                variant="contained"
                                sx={{ mr: 1 }}
                              >
                                Edit
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={handleComplete}
                              variant="contained"
                            >
                              {completedSteps() === totalSteps() - 1
                                ? "Finish"
                                : "Save Draft"}
                            </Button>
                          ))}
                      </Box>
                    </React.Fragment>
                  )}
                </div>
              </div>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}
