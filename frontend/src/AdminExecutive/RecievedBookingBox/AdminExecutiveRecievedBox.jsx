import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from "react-router-dom";
import { SlActionRedo } from "react-icons/sl";
import { IoDocumentTextOutline } from "react-icons/io5";
import { options } from '../../components/Options.js';
import Nodata from '../../components/Nodata.jsx';
import { GrClose } from "react-icons/gr";
import { FaCheck } from "react-icons/fa6";
import wordimg from "../../static/my-images/word.png";
import PdfImageViewerAdmin from "../../admin/PdfViewerAdmin.jsx";
import pdfimg from "../../static/my-images/pdf.png";
import Swal from "sweetalert2";
import { IoAdd } from "react-icons/io5";
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    useIsFocusVisible,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import io from 'socket.io-client';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { IconX } from "@tabler/icons-react";
import { TiTrash } from "react-icons/ti";
import AdminExecutiveHeader from '../Components/AdminExecutiveHeader.jsx';
import AdminExecutiveNavbar from '../Components/AdminExecutiveNavbar.jsx';
import AdminExecutiveTrashBox from '../AdminExecutiveBookings/AdminExecutiveTrashBox.jsx';
import RmofCertificationAllBookings from '../../RM-CERTIFICATION/RM-CERT-BOOKINGS/RmofCertificationAllBookings.jsx';

function AdminExecutiveRecievedBox() {
    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const [employeeData, setEmployeeData] = useState([])
    const [openBacdrop, setOpenBacdrop] = useState(false)
    const [currentLeadform, setCurrentLeadform] = useState(null);
    const [searchText, setSearchText] = useState("");
    const defaultLeadData = {
        "Company Name": "",
        "Company Number": 0,
        "Company Email": "",
        panNumber: "",
        bdeName: "",
        bdeEmail: "",
        bdmName: "",
        bdmType: "Close-by",
        bookingDate: "",
        paymentMethod: "",
        caCase: false,
        caNumber: 0,
        caEmail: "",
        serviceName: "",
        totalPaymentWOGST: 0,
        totalPaymentWGST: 0,
        withGST: "",
        withDSC: false,
        paymentTerms: "",
        firstPayment: 0,
        secondPayment: 0,
        thirdPayment: 0,
        fourthPayment: 0,
        secondPaymentRemarks: "",
        thirdPaymentRemarks: "",
        fourthPaymentRemarks: "",
        pendingRecievedPayment: 0,
        pendingRecievedPaymentDate: null,
    };
    const [openAllBooking, setOpenAllBooking] = useState(false);
    const [openTrashBoxPanel, setOpenTrashBoxPanel] = useState(false)


    const adminExecutiveUserId = localStorage.getItem("adminExecutiveUserId")

    //---------date format------------------------

    function formatDatePro(inputDate) {
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

    function numberToWords(n) {
        const words = [
            "Zero", "First", "Second", "Third", "Fourth", "Fifth",
            "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh",
            "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth",
            "seventeenth", "eighteenth", "nineteenth", "twentieth"
        ];

        if (n <= 20) {
            return words[n];
        } else {
            const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
            const unit = n % 10;
            const ten = Math.floor(n / 10);

            return tens[ten] + (unit ? "-" + words[unit] : "");
        }
    }


    const formatTime = (dateString) => {
        //const dateString = "Sat Jun 29 2024 15:15:12 GMT+0530 (India Standard Time)";
        const date = new Date(dateString)
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';

        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;

        const strTime = `${hours}:${minutes} ${ampm}`;
        return strTime;
    }

    useEffect(() => {
        const socket = secretKey === "http://localhost:3001/api" ? io("http://localhost:3001") : io("wss://startupsahay.in", {
            secure: true, // Use HTTPS
            path: '/socket.io',
            reconnection: true,
            transports: ['websocket'],
        });

        socket.on("booking-updated", (res) => {
            fetchRedesignedFormData()
        });

        socket.on("booking-submitted", (res) => {
            fetchRedesignedFormData()
        });

        socket.on("rm-cert-company-taken-back-from-trashbox", (res) => {
            fetchRedesignedFormData()
        });

        socket.on("rm-recievedamount-deleted", (res) => {
            fetchRedesignedFormData()
        });
        socket.on("Remaining_Payment_Added", (res) => {
            fetchRedesignedFormData()
        })


        return () => {
            socket.disconnect();
        };
    }, [employeeData]);


    useEffect(() => {
        document.title = `AdminExecutive-Sahay-CRM`;
    }, []);


    //---------------------fetching employee data---------------------------------------
    const fetchData = async () => {
        //setOpenBacdrop(true)
        try {
            const response = await axios.get(`${secretKey}/employee/einfo`);
            // Set the retrieved data in the state
            const tempData = response.data;
            //.log(tempData)
            const userData = tempData.find((item) => item._id === adminExecutiveUserId);
            //console.log(userData)
            setEmployeeData(userData);
        } catch (error) {
            console.error("Error fetching data:", error.message);
        }
    };


    useEffect(() => {
        fetchData();

    }, []);

    useEffect(() => {
        setLeadFormData(
            redesignedData.filter((obj) =>
                obj["Company Name"].toLowerCase().includes(searchText.toLowerCase()))
        )

    }, [searchText])

    //--------fetching booking data by default date should be operation date of rm portal date-------------------------------
    const [redesignedData, setRedesignedData] = useState([]);
    const [leadFormData, setLeadFormData] = useState([]);
    const [currentCompanyName, setCurrentCompanyName] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeIndexBooking, setActiveIndexBooking] = useState(0)
    const [activeIndexMoreBookingServices, setActiveIndexMoreBookingServices] = useState(0)
    const [completeRedesignedData, setCompleteRedesignedData] = useState([])
    const today = new Date("2024-08-24");
    today.setHours(0, 0, 0, 0); // Set to start of today
    const parseDate = (dateString) => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return new Date(dateString);
        }
        return new Date(dateString);
    };
    // const fetchRedesignedFormData = async (page) => {
    //     const today = new Date("2024-04-09");
    //     today.setHours(0, 0, 0, 0); // Set to start of today
    //     const parseDate = (dateString) => {
    //         // If date is in "YYYY-MM-DD" format, convert it to a Date object
    //         if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    //             return new Date(dateString);
    //         }

    //         // Otherwise, parse the date string with a Date object
    //         return new Date(dateString);
    //     };
    //     setOpenBacdrop(true)
    //     try {
    //         const response = await axios.get(`${secretKey}/bookings/redesigned-final-leadData`);
    //         const data = response.data;

    //         // Filter and sort data based on lastActionDate
    //         const filteredAndSortedData = data
    //             .filter(obj => {
    //                 //const lastActionDate = new Date(item.lastActionDate);
    //                 const mainBookingDate = parseDate(obj.bookingDate);
    //                 mainBookingDate.setHours(0, 0, 0, 0); // Normalize to start of the day

    //                 // Check if any of the moreBookings dates are >= today
    //                 const hasValidMoreBookingsDate = obj.moreBookings && obj.moreBookings.some(booking => {
    //                     const bookingDate = parseDate(booking.bookingDate);
    //                     bookingDate.setHours(0, 0, 0, 0); // Normalize to start of the day
    //                     return bookingDate >= today;
    //                 });

    //                 // Log the condition results

    //                 // Check if the main booking date or any moreBookings date is >= today
    //                 const isDateValid = mainBookingDate >= today || hasValidMoreBookingsDate;

    //                 // Return true if date is valid and visible to RM
    //                 return isDateValid && (obj.isVisibleToAdminExecutive !== false && obj.permanentlDeleteFromAdminExecutive !== true);
    //             })
    //             .sort((a, b) => {
    //                 const dateA = new Date(a.lastActionDate);
    //                 const dateB = new Date(b.lastActionDate);
    //                 return dateB - dateA; // Sort in descending order
    //             });

    //         // Process each document to combine services and filter them
    //         const processedData = filteredAndSortedData.map(item => {
    //             // Combine servicesTakenByRmOfCertification and rmservicestaken for each document
    //             const combinedServices = [
    //                 ...(item.servicesTakenByAdminExecutive || []),
    //                 ...(item.moreBookings || []).flatMap(booking => booking.servicesTakenByAdminExecutive || [])
    //             ];

    //             // Remove duplicates
    //             const uniqueServices = [...new Set(combinedServices)];

    //             return {
    //                 ...item,
    //                 combinedServices: uniqueServices // Add combined services to the document
    //             };
    //         });

    //         // Create an array of filtered service names for each document
    //         const filteredServicesData = filteredAndSortedData.map(item => {
    //             // Extract primary services
    //             const primaryServices = item.services || [];

    //             // Combine services from moreBookings
    //             const moreBookingServices = item.moreBookings
    //                 ? item.moreBookings.flatMap((booking) => booking.services || [])
    //                 : [];

    //             // Combine services
    //             const combinedServices = [
    //                 ...primaryServices,
    //                 ...moreBookingServices
    //             ];

    //             // Filter services based on certificationLabels
    //             const filteredServices = combinedServices.filter((service) =>
    //                 (certificationLabels.includes(service.serviceName))
    //             );


    //             // Map through the filtered services to get service names
    //             return filteredServices.map((service) => service.serviceName);
    //         });

    //         // Find companies that do not match the filteredServices
    //         const nonMatchingCompanies = processedData.filter((item, index) => {
    //             // Find the filtered services for the same index
    //             const filteredServiceNames = filteredServicesData[index];

    //             const noCertificationServices = !(
    //                 item.servicesTakenByAdminExecutive && item.servicesTakenByAdminExecutive.length > 0 ||
    //                 (item.moreBookings && item.moreBookings.some(booking => booking.servicesTakenByAdminExecutive && booking.servicesTakenByAdminExecutive.length > 0))
    //             );

    //             // Compare combinedServices with filteredServiceNames
    //             return !(item.combinedServices.length === filteredServiceNames.length &&
    //                 item.combinedServices.every(service => filteredServiceNames.includes(service))) || noCertificationServices;;
    //         });

    //         const completeData = response.data
    //             .sort((a, b) => {
    //                 const dateA = new Date(a.lastActionDate);
    //                 const dateB = new Date(b.lastActionDate);
    //                 return dateB - dateA; // Sort in descending order
    //             });

    //         // Log or use the non-matching data
    //         //console.log("Non-Matching Companies:", nonMatchingCompanies);

    //         // Set state or use non-matching data as needed
    //         setLeadFormData(nonMatchingCompanies);
    //         setRedesignedData(nonMatchingCompanies);
    //         setCompleteRedesignedData(completeData);
    //     } catch (error) {
    //         console.error("Error fetching data:", error.message);
    //     } finally {
    //         setOpenBacdrop(false)
    //     }
    // };

    const fetchRedesignedFormData = async (page) => {

        setOpenBacdrop(true);
        try {
            const response = await axios.get(`${secretKey}/bookings/redesigned-final-leadData`);
            const data = response.data;

            console.log("Raw Data from API:", data);

            // Filter out documents where shouldDisableButton condition is true
            const validDocuments = data.filter(obj => {
                const combinedServices = [
                    ...(obj.services || []),
                    ...(obj.moreBookings || []).flatMap(booking => booking.services || [])
                ];

                // Log the services and the certification labels for comparison
                console.log("Combined Services for filtering:", combinedServices);
                console.log("Certification Labels:", certificationLabels);

                const shouldDisableButton = !combinedServices.some(service => certificationLabels.some(label => service.serviceName.includes(label)));

                return !shouldDisableButton; // Exclude documents where shouldDisableButton is true
            });

            console.log("Valid Documents after filter:", validDocuments);

            // Filter and sort valid documents based on lastActionDate
            const filteredAndSortedData = validDocuments
                .filter(obj => {
                    const mainBookingDate = parseDate(obj.bookingDate);
                    mainBookingDate.setHours(0, 0, 0, 0); // Normalize to start of the day

                    const hasValidMoreBookingsDate = obj.moreBookings && obj.moreBookings.some(booking => {
                        const bookingDate = parseDate(booking.bookingDate);
                        bookingDate.setHours(0, 0, 0, 0); // Normalize to start of the day
                        return bookingDate >= today;
                    });

                    const isDateValid = mainBookingDate >= today || hasValidMoreBookingsDate;

                    return isDateValid && (obj.isVisibleToAdminExecutive !== false && obj.permanentlDeleteFromAdminExecutive !== true);
                })
                .sort((a, b) => {
                    const dateA = new Date(a.lastActionDate);
                    const dateB = new Date(b.lastActionDate);
                    return dateB - dateA; // Sort in descending order
                });

            console.log("Filtered and Sorted Data:", filteredAndSortedData);

            const processedData = filteredAndSortedData.map(item => {
                const combinedServices = [
                    ...(item.servicesTakenByAdminExecutive || []),
                    ...(item.moreBookings || []).flatMap(booking => booking.servicesTakenByAdminExecutive || [])
                ];

                const uniqueServices = [...new Set(combinedServices)];

                console.log("Processed Services for Company:", uniqueServices);
                return {
                    ...item,
                    combinedServices: uniqueServices
                };
            });

            console.log("Processed Data:", processedData);

            const filteredServicesData = filteredAndSortedData.map(item => {
                const primaryServices = item.services || [];
                const moreBookingServices = item.moreBookings
                    ? item.moreBookings.flatMap((booking) => booking.services || [])
                    : [];

                const combinedServices = [
                    ...primaryServices,
                    ...moreBookingServices
                ];

                // Filter services based on certificationLabels and bookingDate >= today
                const filteredServices = combinedServices.filter((service) => {
                    const serviceBookingDate = item.moreBookings.some(booking =>
                        booking.services.includes(service)
                    ) ? new Date(
                        item.moreBookings.find(booking =>
                            booking.services.includes(service)
                        ).bookingDate
                    ) : new Date(item.bookingDate);

                    serviceBookingDate.setHours(0, 0, 0, 0); // Normalize to start of the day

                    return certificationLabels.includes(service.serviceName) && serviceBookingDate >= today && service.withDSC;
                });

                // Log which services are being compared and filtered
                console.log("Filtered Services for Company:", filteredServices.map((service) => service.serviceName));

                // Map through the filtered services to get service names
                return filteredServices.map((service) => service.serviceName);
            });

            console.log("Filtered Services Data (All Companies):", filteredServicesData);

            const nonMatchingCompanies = processedData.filter((item, index) => {
                const filteredServiceNames = filteredServicesData[index];

                const noCertificationServices = !(
                    item.servicesTakenByAdminExecutive && item.servicesTakenByAdminExecutive.length > 0 ||
                    (item.moreBookings && item.moreBookings.some(booking => booking.servicesTakenByAdminExecutive && booking.servicesTakenByAdminExecutive.length > 0))
                );

                console.log("Comparing Services for Company:", {
                    combinedServices: item.combinedServices,
                    filteredServiceNames,
                    noCertificationServices
                });

                return !(item.combinedServices.length === filteredServiceNames.length &&
                    item.combinedServices.every(service => filteredServiceNames.includes(service))) || noCertificationServices;
            });

            console.log("Non-Matching Companies:", nonMatchingCompanies);

            const completeData = response.data
                .sort((a, b) => {
                    const dateA = new Date(a.lastActionDate);
                    const dateB = new Date(b.lastActionDate);
                    return dateB - dateA;
                });

            setLeadFormData(nonMatchingCompanies);
            setRedesignedData(nonMatchingCompanies);
            setCompleteRedesignedData(completeData);
        } catch (error) {
            console.error("Error fetching data:", error.message);
        } finally {
            setOpenBacdrop(false);
        }
    };


    console.log("leadformdata", leadFormData)





    useEffect(() => {
        fetchRedesignedFormData();
    }, []);

    //-----------------services array-----------------------------

    // const certificationLabels = [
    //     "Start-Up India Certificate",
    //     "MSME/UDYAM Certificate",
    //     "ISO Certificate",
    //     "IEC CODE Certificate",
    //     "BIS Certificate",
    //     "NSIC Certificate",
    //     "FSSAI Certificate",
    //     "APEDA Certificate",
    //     "GST Certificate",
    //     "Company Incorporation",
    //     "Trademark Registration",
    //     "Copyright Registration",
    //     "Patent Registration",
    //     "Organization DSC",
    //     "Director DSC",
    //     "Self Certification",
    //     "GeM"
    // ];

    const dscSubtypes = ["Only Signature", "Only Encryption", "Combo"];
    const validityPeriods = ["1 Year", "2 Year", "3 Year"];

    // 2. Generate all combinations for Organization DSC and Director DSC
    const organizationDSCCombinations = dscSubtypes.flatMap(subtype =>
        validityPeriods.map(validity => `Organization DSC ${subtype} With ${validity} Validity`)
    );

    const directorDSCCombinations = dscSubtypes.flatMap(subtype =>
        validityPeriods.map(validity => `Director DSC ${subtype} With ${validity} Validity`)
    );

    const certificationLabels = [
        "Start-Up India Certificate",
        "Organization DSC",
        "Director DSC",
        ...organizationDSCCombinations,
        ...directorDSCCombinations
    ];

    // 3. Merge with existing certifications
    const certificationLabelsNew = [
        "Start-Up India Certificate",
        "Organization DSC",
        "Director DSC",
        ...organizationDSCCombinations,
        ...directorDSCCombinations
    ];

    // Filter certification options
    const certificationOptions = options.filter(option =>
        certificationLabels.includes(option.label)
    );

    useEffect(() => {
        if (currentCompanyName === "") {
            setCurrentLeadform(leadFormData[0]);
            setActiveIndex(0)
            setActiveIndexBooking(1)
            setActiveIndexMoreBookingServices(0)
        }
    }, [leadFormData]);

    //------- to caluclate total , recieved and pemding amount ---------------------

    function calculateTotalAmount(obj) {
        let total = parseInt(obj.totalAmount);
        if (obj.moreBookings && obj.moreBookings.length > 0) {
            total += obj.moreBookings.reduce(
                (acc, curr) => acc + parseInt(curr.totalAmount),
                0
            )
        }
        return total.toFixed(2)
    }

    function calculateReceivedAmount(obj) {
        let total = parseInt(obj.receivedAmount);
        if (obj.moreBookings && obj.moreBookings.length !== 0) {
            total += obj.moreBookings.reduce(
                (acc, curr) => acc + parseInt(curr.receivedAmount),
                0
            )
        }
        return total.toFixed(2)
    }

    const calculatePendingAmount = (obj) => {
        let pending = parseInt(obj.pendingAmount);
        if (obj.moreBookings && obj.moreBookings.length > 0) {
            pending += obj.moreBookings.reduce(
                (acc, booking) => acc + parseInt(booking.pendingAmount),
                0
            );
        }
        return pending.toFixed(2);
    };

    // ----------------------------------------- Upload documents Section -----------------------------------------------------
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [openOtherDocs, setOpenOtherDocs] = useState(false);
    const [sendingIndex, setSendingIndex] = useState(0);
    const handleOtherDocsUpload = (updatedFiles) => {
        setSelectedDocuments((prevSelectedDocuments) => {
            return [...prevSelectedDocuments, ...updatedFiles];
        });
    };

    const handleRemoveFile = (index) => {
        setSelectedDocuments((prevSelectedDocuments) => {
            // Create a copy of the array of selected documents
            const updatedDocuments = [...prevSelectedDocuments];
            // Remove the document at the specified index
            updatedDocuments.splice(index, 1);
            // Return the updated array of selected documents
            return updatedDocuments;
        });
    };

    const closeOtherDocsPopup = () => {
        setOpenOtherDocs(false);
    };

    const handleotherdocsAttachment = async () => {
        try {
            const files = selectedDocuments;
            //console.log(files);

            if (files.length === 0) {
                // No files selected
                return;
            }

            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append("otherDocs", files[i]);
            }
            console.log(formData);
            setCurrentCompanyName(currentLeadform["Company Name"])
            const response = await fetch(
                `${secretKey}/bookings/uploadotherdocsAttachment/${currentLeadform["Company Name"]}/${sendingIndex}`,
                {
                    method: "POST",
                    body: formData,
                }
            );
            if (response.ok) {
                Swal.fire({
                    title: "Success!",
                    html: `<small> File Uploaded successfully </small>
            `,
                    icon: "success",
                });
                setSelectedDocuments([]);
                setOpenOtherDocs(false);
                fetchRedesignedFormData();


            } else {
                Swal.fire({
                    title: "Error uploading file",

                    icon: "error",
                });
                console.error("Error uploading file");
            }
        } catch (error) {
            Swal.fire({
                title: "Error uploading file",
                icon: "error",
            });
            console.error("Error uploading file:", error);
        }
    };

    //   --------------------documents view function--------------------------

    const handleViewPdfReciepts = (paymentreciept, companyName) => {
        const pathname = paymentreciept;
        //console.log(pathname);
        window.open(`${secretKey}/bookings/recieptpdf/${companyName}/${pathname}`, "_blank");
    };

    const handleViewPdOtherDocs = (pdfurl, companyName) => {
        const pathname = pdfurl;
        //console.log(pathname);
        window.open(`${secretKey}/bookings/otherpdf/${companyName}/${pathname}`, "_blank");
    };

    // -------------------swapping function for rm-------------------

    const [openServicesPopup, setOpenServicesPopup] = useState(false)
    const [selectServices, setSelectServices] = useState([]);
    const [serviceNames, setServiceNames] = useState([])
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedCompanyName, setSelectedCompanyName] = useState("")
    const [dataToSend, setDataToSend] = useState(defaultLeadData)
    const [selectedCompanyData, setSelectedCompanyData] = useState([]);
    const [rmSelectedServiceMainBooking, setrmSelectedServiceMainBooking] = useState([]);
    const [rmSelectedServiceMoreBooking, setRmSelectedServiceMoreBooking] = useState([]);



    const handleCloseServicesPopup = () => {
        setOpenServicesPopup(false)
        setSelectedServices([])
        setSelectedCompanyName("")
        setSelectedCompanyData([])
        setDataToSend(defaultLeadData)
    }

    const [isSwappingAllServices, setIsSwappingAllServices] = useState(false);

    const handleOpenServices = (companyName) => {
        setSelectedCompanyName(companyName);

        const selectedServicesHere = redesignedData
            .filter((company) => company["Company Name"] === companyName)
            .flatMap((company) => {
                const bookingDate = parseDate(company.bookingDate);
                bookingDate.setHours(0, 0, 0, 0); // Normalize to start of the day

                const mainServices = bookingDate >= today ? company.services : [];
                const moreBookingServices = company.moreBookings.flatMap((item) => {
                    const moreBookingDate = parseDate(item.bookingDate);
                    moreBookingDate.setHours(0, 0, 0, 0); // Normalize to start of the day

                    return moreBookingDate >= today ? item.services : [];
                });

                const allServices = [...mainServices, ...moreBookingServices];

                const filteredServices = allServices.filter((service) => {
                    const isServiceTakenByAdminExecutive = company.servicesTakenByAdminExecutive?.includes(service.serviceName);
                    const isServiceTakenInAdminExecutive = company.moreBookings.some((booking) =>
                        booking.servicesTakenByAdminExecutive?.includes(service.serviceName)
                    );

                    return !isServiceTakenByAdminExecutive && !isServiceTakenInAdminExecutive;
                });

                return filteredServices.filter((service) => certificationLabels.includes(service.serviceName) && service.withDSC);
            });

        //console.log("new selected here", selectedServicesHere);

        const servicesNames = selectedServicesHere.map((service) => service.serviceName);
        setServiceNames(servicesNames);

        // Check if all service names are included in certificationLabelsNew
        const allServicesInCertificationLabelsNew = servicesNames.every(serviceName => certificationLabelsNew.includes(serviceName));

        if (allServicesInCertificationLabelsNew) {
            // Prompt user for confirmation before submitting all services
            setSelectedServices(servicesNames);
            setIsSwappingAllServices(true);
        } else {
            // Otherwise, open the services popup
            setOpenServicesPopup(true);
        }
    };

    useEffect(() => {
        if (isSwappingAllServices) {
            handleSubmitServicesToSwap();
            setIsSwappingAllServices(false); // Reset the state
        }
    }, [isSwappingAllServices]);




    //console.log("serviceNames", serviceNames)

    const handleCheckboxChange = (service) => {
        setSelectedServices(prevSelected =>
            prevSelected.includes(service)
                ? prevSelected.filter(item => item !== service)
                : [...prevSelected, service]
        );
    };
    //console.log("selected", selectedServices)
    //console.log("selectedCompanyData", selectedCompanyData)

    const handleSubmitServicesToSwap = async () => {
        // Check if selectedCompanyData is defined
        if (!selectedCompanyData) {
            console.error(`Company with name '${selectedCompanyName}' not found in mainDataSwap.`);
            return;
        }
        //console.log("selectedservices" , selectedServices)
        // console.log("Selected company data :", selectedCompanyData);
        let leadId = selectedCompanyData.company;

        // Default moreBookings to an empty array if it's undefined
        const moreBookings = selectedCompanyData.moreBookings || [];

        const combinedServices = [
            ...(selectedCompanyData.services || []),
            ...moreBookings.flatMap((item) => item.services || [])
        ];

        const primaryServices = selectedCompanyData.services || [];

        const combinedRemainingpaymentsForServices = [
            ...(selectedCompanyData.remainingPayments || []),
            ...moreBookings.flatMap((item) => item.remainingPayments || [])
        ];

        console.log("Remaining Payment Object", combinedRemainingpaymentsForServices)


        // Combine services from selectedCompanyData.moreBookings
        const moreBookingServices = moreBookings.flatMap((item) => item.services || []);

        // Filter services based on certificationLabels
        const filteredPrimaryServices = primaryServices.filter((service) =>
            selectedServices.includes(service.serviceName)
        );
        const filteredMoreBookingServices = moreBookingServices.filter((service) =>
            selectedServices.includes(service.serviceName)
        );

        // Map through the selected services to get the service names
        const primaryServiceNames = filteredPrimaryServices.map((service) => service.serviceName);
        const moreBookingServiceNames = filteredMoreBookingServices.map((service) => service.serviceName);

        // Initialize an array to store objects for each selected service
        const dataToSend = [];

        // Iterate through selectedServices (which contain only service names)
        selectedServices.forEach(serviceName => {
            // Find the detailed service object in combinedServices
            const serviceData = combinedServices.find(service => service.serviceName === serviceName);
            const remainingPaymentData = combinedRemainingpaymentsForServices.filter(service => service.serviceName === serviceName)
            console.log("RemainingPaymentData", remainingPaymentData)
            const totalReceivedPayment = remainingPaymentData.reduce((total, service) => {
                return total + service.receivedPayment;
            }, 0);
            const pendingRecievedPaymentDate = remainingPaymentData.length > 0 ? remainingPaymentData[0].paymentDate : null;
            // Check if serviceData is found
            if (serviceData) {
                // Create an object with the required fields from selectedCompanyData and serviceData
                const serviceToSend = {
                    "Company Name": selectedCompanyData["Company Name"],
                    "Company Number": selectedCompanyData["Company Number"],
                    "Company Email": selectedCompanyData["Company Email"],
                    panNumber: selectedCompanyData.panNumber,
                    bdeName: selectedCompanyData.bdeName,
                    bdeEmail: selectedCompanyData.bdeEmail || '', // Handle optional fields
                    bdmName: selectedCompanyData.bdmName,
                    bdmType: selectedCompanyData.bdmType || 'Close-by', // Default value if not provided
                    bookingDate: selectedCompanyData.bookingDate,
                    paymentMethod: selectedCompanyData.paymentMethod || '', // Handle optional fields
                    caCase: selectedCompanyData.caCase || false, // Default to false if not provided
                    caNumber: selectedCompanyData.caNumber || 0, // Default to 0 if not provided
                    caEmail: selectedCompanyData.caEmail || '', // Handle optional fields
                    serviceName: serviceData.serviceName,
                    totalPaymentWOGST: serviceData.totalPaymentWOGST || 0, // Default to 0 if not provided
                    totalPaymentWGST: serviceData.totalPaymentWGST || 0,
                    withGST: serviceData.withGST,
                    withDSC: serviceData.withDSC || 0,
                    paymentTerms: serviceData.paymentTerms || "", // Default to 0 if not provided
                    firstPayment: serviceData.firstPayment || 0, // Default to 0 if not provided
                    secondPayment: serviceData.secondPayment || 0, // Default to 0 if not provided
                    thirdPayment: serviceData.thirdPayment || 0, // Default to 0 if not provided
                    fourthPayment: serviceData.fourthPayment || 0,
                    secondPaymentRemarks: serviceData.secondPaymentRemarks || "",
                    thirdPaymentRemarks: serviceData.thirdPaymentRemarks || "",
                    fourthPaymentRemarks: serviceData.fourthPaymentRemarks || "",
                    bookingPublishDate: serviceData.bookingPublishDate || '',
                    pendingRecievedPayment: remainingPaymentData ? totalReceivedPayment : 0,
                    pendingRecievedPaymentDate: pendingRecievedPaymentDate,
                    leadId: leadId,
                    addedOn: new Date() // Handle optional fields
                };

                // Push the created object to dataToSend array
                console.log("servicesToSend", serviceToSend)
                dataToSend.push(serviceToSend);
            } else {
                console.error(`Service with name '${serviceName}' not found in selected company data.`);
            }
        });
        console.log("dataToSend", dataToSend)

        if (dataToSend.length !== 0) {
            setOpenBacdrop(true)
            try {
                console.log("dataToSend", dataToSend)
                const responses = await Promise.all([
                    axios.post(`${secretKey}/rm-services/post-adminexecutivedata`, {
                        dataToSend: dataToSend  // Ensure dataToSend is correctly formatted
                    }),
                    axios.post(`${secretKey}/rm-services/postsdminselectedservicestobooking/${selectedCompanyData["Company Name"]}`, {
                        adminServicesMainBooking: primaryServiceNames || [],
                        adminServicesMoreBooking: moreBookingServiceNames || []
                    })
                ]);

                const response = responses[0];
                const response2 = responses[1];

                //console.log("response", response2.data);
                if (response.data.successEntries === 0) {
                    Swal.fire("Please Select Unique Services");
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        //html: `Bookings Uploaded Successfully<br><br>Successful Entries: ${response.data.successEntries}<br>Failed Entries: ${response.data.failedEntries}`
                    });
                }
                fetchRedesignedFormData();
                handleCloseServicesPopup();
            } catch (error) {
                console.error("Error sending data:", error.message);
                Swal.fire("Error", "Failed to upload bookings", error.message);
            } finally {
                setOpenBacdrop(false)
            }
        } else {
            console.log("No data to send.");
        }
        // Assuming setDataToSend updates state to store dataToSend array
        setDataToSend(dataToSend);
        // Assuming handleSendDataToMyBookings updates or sends dataToSend somewhere
    }


    //----------function to remove company from rm panel-----------------------


    const handleDisplayOffToRm = async (companyName, company) => {
        console.log("company", company);

        const shouldDisableButton = ![
            ...company.services,
            ...(company.moreBookings || []).flatMap(booking => booking.services)
        ].some(service => certificationLabels.some(label => service.serviceName.includes(label)));

        console.log("shoulddisablebutton", shouldDisableButton);

        if (shouldDisableButton) {
            // Directly run the response if shouldDisableButton is true
            try {
                const response = await axios.post(`${secretKey}/rm-services/postmethodtoremovecompanyfromadminexecutivepanel/${companyName}`, {
                    displayOfDateForAdminExecutive: new Date()
                });
                // Handle the response
                if (response.status === 200) {
                    fetchRedesignedFormData();
                    Swal.fire(
                        'Removed!',
                        'The company has been removed from RM panel.',
                        'success'
                    );
                }
            } catch (error) {
                console.log("Internal Server Error", error.message);
                Swal.fire(
                    'Error!',
                    'There was an error removing the company from RM panel.',
                    'error'
                );
            }
        } else {
            // Show the Swal confirmation dialog if shouldDisableButton is false
            Swal.fire({
                title: 'Are you sure?',
                text: `Do you want to remove ${companyName} from RM panel?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, remove it!',
                cancelButtonText: 'No, keep it'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const response = await axios.post(`${secretKey}/rm-services/postmethodtoremovecompanyfromadminexecutivepanel/${companyName}`, {

                            displayOfDateForAdminExecutive: new Date()

                        });
                        // Handle the response
                        if (response.status === 200) {
                            fetchRedesignedFormData();
                            Swal.fire(
                                'Removed!',
                                'The company has been removed from RM panel.',
                                'success'
                            );
                        }
                    } catch (error) {
                        console.log("Internal Server Error", error.message);
                        Swal.fire(
                            'Error!',
                            'There was an error removing the company from RM panel.',
                            'error'
                        );
                    }
                }
            });
        }
    };


    //--------------function to disable click-------------------------
    // const shouldDisableButton = ![
    //     ...obj.services,
    //     ...(obj.moreBookings || []).flatMap(booking => booking.services)
    // ].some(service => certificationLabels.some(label => service.serviceName.includes(label)));


    //console.log("rmmainbookingservice", rmSelectedServiceMainBooking)
    //console.log("rmmorebookingservice", rmSelectedServiceMoreBooking)
    // console.log("leadformdata", leadFormData)
    // console.log("currentleadform", currentLeadform)

    const handleCloseBackdrop = () => {
        setOpenBacdrop(false)
    }

    return (
        <div>
            {/* <AdminExecutiveHeader id={employeeData._id} name={employeeData.ename} empProfile={employeeData.profilePhoto && employeeData.profilePhoto.length !== 0 && employeeData.profilePhoto[0].filename} gender={employeeData.gender} designation={employeeData.newDesignation} />
            <AdminExecutiveNavbar adminExecutiveUserId={adminExecutiveUserId} /> */}

            {(!openAllBooking && !openTrashBoxPanel) && (
                <div className="booking-list-main admin-executive">
                    <div className="booking_list_Filter">
                        <div className="container-xl">
                            <div className="row justify-content-between align-items-center">
                                <div className="col-2">
                                    <div class="my-2 my-md-0 flex-grow-1 flex-md-grow-0 order-first order-md-last">
                                        <div class="input-icon">
                                            <span class="input-icon-addon">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    class="icon"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    stroke-width="2"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                >
                                                    <path
                                                        stroke="none"
                                                        d="M0 0h24v24H0z"
                                                        fill="none"
                                                    ></path>
                                                    <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                                                    <path d="M21 21l-6 -6"></path>
                                                </svg>
                                            </span>
                                            <input
                                                type="text"
                                                value={searchText}
                                                class="form-control"
                                                placeholder="Search Company"
                                                aria-label="Search in website"
                                                onChange={(e) => setSearchText(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6 d-flex justify-content-end">
                                    <button className='btn btn-primary mr-1'
                                        onClick={() => setOpenTrashBoxPanel(true)}
                                    >
                                        <TiTrash
                                            style={{
                                                height: "20px",
                                                width: "20px",
                                                marginRight: "5px",
                                                marginLeft: "-4px"
                                            }} />
                                        Trash
                                    </button>
                                    <button className='btn btn-primary'
                                        onClick={() => setOpenAllBooking(true)}
                                    >
                                        All Booking
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="container-xl">
                        <div className="booking_list_Dtl_box">
                            <div className="row m-0">
                                {/* --------booking list left Part---------*/}
                                <div className="col-4 p-0">
                                    <div className="booking-list-card">
                                        <div className="booking-list-heading">
                                            <div className="d-flex justify-content-between">
                                                <div className="b_dtl_C_name">Booking List</div>
                                            </div>
                                        </div>
                                        <div className="booking-list-body">
                                            {leadFormData.length !== 0 && leadFormData.map((obj, index) => (

                                                <div className={
                                                    currentLeadform &&
                                                        currentLeadform["Company Name"] ===
                                                        obj["Company Name"]
                                                        ? "rm_bking_list_box_item activeBox"
                                                        : "rm_bking_list_box_item"
                                                }
                                                    onClick={() => {
                                                        // Combine main booking and more bookings into one array
                                                        const allBookings = [obj, ...obj.moreBookings];

                                                        // Find the latest booking by comparing booking dates
                                                        const latestBooking = allBookings.reduce((latest, current) => {
                                                            const latestDate = new Date(latest.bookingDate);
                                                            const currentDate = new Date(current.bookingDate);
                                                            return currentDate > latestDate ? current : latest;
                                                        });
                                                        console.log(latestBooking)

                                                        // Set current lead form to the clicked object
                                                        setCurrentLeadform(leadFormData.find((data) => data["Company Name"] === obj["Company Name"]));

                                                        // Set active index to the index of the latest booking in the combined array
                                                        setActiveIndexBooking(allBookings.indexOf(latestBooking) + 1); // This will now set the active index to the latest booking
                                                        setActiveIndex(0);
                                                        setActiveIndexMoreBookingServices(0);
                                                    }}
                                                >
                                                    <div className='d-flex justify-content-between align-items-center'>
                                                        <div className='rm_cmpny_name_services'>
                                                            <div className='rm_bking_cmpny_name My_Text_Wrap'>
                                                                {obj["Company Name"]}
                                                            </div>
                                                        </div>
                                                        <div className='d-flex'>
                                                            {(() => {
                                                                const shouldDisableButton = ![
                                                                    ...obj.services,
                                                                    ...(obj.moreBookings || []).flatMap(booking => booking.services)
                                                                ].some(service => {
                                                                    const serviceBookingDate = obj.moreBookings.some(booking =>
                                                                        booking.services.includes(service)
                                                                    )
                                                                        ? new Date(
                                                                            obj.moreBookings.find(booking =>
                                                                                booking.services.includes(service)
                                                                            ).bookingDate
                                                                        )
                                                                        : new Date(obj.bookingDate);

                                                                    serviceBookingDate.setHours(0, 0, 0, 0); // Normalize to start of the day

                                                                    return certificationLabels.some(label => service.serviceName.includes(label)) &&
                                                                        serviceBookingDate >= today &&
                                                                        service.withDSC;
                                                                });
                                                                return (
                                                                    <>
                                                                        {!shouldDisableButton && (
                                                                            <button
                                                                                className={
                                                                                    shouldDisableButton
                                                                                        ? "disabled_rmcert_check btn btn-sm btn-swap-round btn-swap-round-success d-flex align-items-center cursor-pointer-none"
                                                                                        : "btn btn-sm btn-swap-round btn-swap-round-success d-flex align-items-center"
                                                                                }
                                                                                onClick={() => {
                                                                                    setSelectedCompanyData(leadFormData.find(company => company["Company Name"] === obj["Company Name"]));
                                                                                    handleOpenServices(obj["Company Name"]);
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    className={
                                                                                        shouldDisableButton
                                                                                            ? "disabled btn-swap-icon cursor-pointer-none"
                                                                                            : "btn-swap-icon"
                                                                                    }
                                                                                >
                                                                                    <FaCheck />
                                                                                </div>
                                                                            </button>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}



                                                            <button
                                                                className='btn btn-sm btn-swap-round d-flex btn-swap-round-reject align-items-center'
                                                                onClick={() => {
                                                                    handleDisplayOffToRm(
                                                                        obj["Company Name"],
                                                                        obj
                                                                    )
                                                                }}
                                                            >
                                                                <div className='btn-swap-icon'>
                                                                    {/* <SlActionRedo /> */}
                                                                    <GrClose />
                                                                </div>
                                                            </button>
                                                        </div>

                                                    </div>
                                                    <div className='d-flex justify-content-start align-items-center flex-wrap mt-1'>
                                                        {obj.services.length !== 0 || obj.moreBookings.length !== 0 ? (
                                                            [
                                                                ...obj.services,
                                                                ...(obj.moreBookings || []).flatMap(booking => booking.services)
                                                            ].filter(service =>
                                                                certificationLabels.some(label => service.serviceName.includes(label))
                                                            ).map((service, index) => {
                                                                // Determine the booking date for the current service
                                                                const bookingDate = obj.moreBookings.some(booking =>
                                                                    booking.services.includes(service)
                                                                )
                                                                    ? new Date(
                                                                        obj.moreBookings.find(booking =>
                                                                            booking.services.includes(service)
                                                                        ).bookingDate
                                                                    )
                                                                    : new Date(obj.bookingDate);

                                                                bookingDate.setHours(0, 0, 0, 0); // Normalize to start of the day

                                                                // Check if the service is in servicesTakenByRmOfCertification
                                                                const isInMainServices = obj.servicesTakenByAdminExecutive &&
                                                                    obj.servicesTakenByAdminExecutive.includes(service.serviceName);

                                                                // Check if the service is in any moreBookings' servicesTakenIn
                                                                const isInMoreBookingServices = obj.moreBookings.some(booking =>
                                                                    booking.servicesTakenByAdminExecutive && booking.servicesTakenByAdminExecutive.includes(service.serviceName)

                                                                );

                                                                // Determine the className based on conditions
                                                                const className = isInMainServices || isInMoreBookingServices
                                                                    ? 'clr-bg-light-f3f3dd bdr-l-clr-c5c51f clr-f3f3dd'
                                                                    : certificationLabels.some(label => service.serviceName.includes(label)
                                                                        && bookingDate >= today
                                                                        && service.withDSC)
                                                                        ? 'clr-bg-light-4299e1 bdr-l-clr-4299e1 clr-4299e1'
                                                                        : 'clr-bg-light-a0b1ad bdr-l-clr-a0b1ad clr-a0b1ad';

                                                                return (
                                                                    <div
                                                                        key={index}
                                                                        className={`rm_bking_item_serices ${className} My_Text_Wrap mb-1`}
                                                                        title={service.serviceName === 'Start-Up India Certificate' &&
                                                                            service.withDSC
                                                                            ? `${service.serviceName} with DSC`
                                                                            : service.serviceName}
                                                                    >
                                                                        {service.serviceName === 'Start-Up India Certificate' &&
                                                                            service.withDSC
                                                                            ? `${service.serviceName} with DSC`
                                                                            : service.serviceName}
                                                                    </div>
                                                                );
                                                            })
                                                        ) : null}
                                                    </div>
                                                    <div className='d-flex justify-content-between align-items-center mt-1'>
                                                        <div className='rm_bking_time'>
                                                            {formatTime(
                                                                obj.moreBookings && obj.moreBookings.length !== 0 ?
                                                                    obj.moreBookings[obj.moreBookings.length - 1].bookingPublishDate
                                                                    :
                                                                    obj.bookingPublishDate

                                                            )} |  {
                                                                formatDatePro(
                                                                    obj.moreBookings &&
                                                                        obj.moreBookings.length !== 0
                                                                        ? obj.moreBookings[
                                                                            obj.moreBookings.length - 1
                                                                        ].bookingPublishDate // Get the latest bookingDate from moreBookings
                                                                        : obj.bookingPublishDate
                                                                ) // Use obj.bookingDate if moreBookings is empty or not present
                                                            }
                                                            <span className='ml-1'>({numberToWords(activeIndexBooking)} Booking)</span>
                                                        </div>
                                                        <div className='rm_bking_by'>
                                                            By  {obj.bdeName}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {leadFormData.length === 0 && (
                                                <div
                                                    className="d-flex align-items-center justify-content-center"
                                                    style={{ height: "inherit" }}
                                                >
                                                    <Nodata />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* --------booking Details Right Part---------*/}
                                <div className="col-8 p-0">
                                    <div className="booking-deatils-card">
                                        <div className="booking-deatils-heading">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="b_dtl_C_name">{currentLeadform &&
                                                    Object.keys(currentLeadform).length !== 0
                                                    ? currentLeadform["Company Name"]
                                                    : leadFormData && leadFormData.length !== 0
                                                        ? leadFormData[0]["Company Name"]
                                                        : "-"}</div>
                                            </div>
                                        </div>
                                        <div className="booking-deatils-body">
                                            <div class="my-card mt-2">
                                                <div className='my-card-head'>
                                                    <div className='d-flex justify-content-between align-items-center'>
                                                        <div>
                                                            Basic Details
                                                        </div>
                                                        <div className='d-flex justify-content-between align-items-center'>
                                                            <div className='rm_total_bking'>
                                                                Total Booking :
                                                                <b>
                                                                    {Array.isArray(currentLeadform?.moreBookings) && currentLeadform.moreBookings.length !== 0
                                                                        ? currentLeadform.moreBookings.length + 1
                                                                        : 1}
                                                                </b>
                                                            </div>
                                                            <div className='rm_total_services'>
                                                                Total Services :
                                                                <b>
                                                                    {currentLeadform && (currentLeadform.services.length !== 0 || currentLeadform.moreBookings.length !== 0) ? (
                                                                        [
                                                                            ...currentLeadform.services,
                                                                            ...(currentLeadform.moreBookings || []).flatMap(booking => booking.services)
                                                                        ].length
                                                                    ) : null}
                                                                </b>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="my-card-body">
                                                    <div class="row m-0">
                                                        <div class="col-lg-6 col-sm-6 p-0 align-self-stretch">
                                                            <div class="row m-0 h-100 bdr-btm-eee">
                                                                <div class="col-lg-3 align-self-stretch p-0">
                                                                    <div class="booking_inner_dtl_h h-100">
                                                                        Company Name
                                                                    </div>
                                                                </div>
                                                                <div class="col-lg-9 align-self-stretch p-0">
                                                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                        {currentLeadform &&
                                                                            Object.keys(currentLeadform).length !== 0
                                                                            ? currentLeadform["Company Name"]
                                                                            : leadFormData && leadFormData.length !== 0
                                                                                ? leadFormData[0]["Company Name"]
                                                                                : "-"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-lg-6 col-sm-6 p-0 align-self-stretch">
                                                            <div class="row m-0 h-100 bdr-btm-eee">
                                                                <div class="col-lg-3 align-self-stretch p-0">
                                                                    <div class="booking_inner_dtl_h bdr-left-eee h-100">Email Address</div>
                                                                </div>
                                                                <div class="col-lg-9 align-self-stretch p-0">
                                                                    <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                        {currentLeadform &&
                                                                            Object.keys(currentLeadform).length !== 0
                                                                            ? currentLeadform["Company Email"]
                                                                            : leadFormData && leadFormData.length !== 0
                                                                                ? leadFormData[0]["Company Email"]
                                                                                : "-"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="row m-0">
                                                        <div class="col-lg-4 col-sm-6 p-0 align-self-stretch">
                                                            <div class="row m-0 h-100 bdr-btm-eee">
                                                                <div class="col-lg-4 align-self-stretch p-0">
                                                                    <div class="booking_inner_dtl_h h-100">
                                                                        Phone No
                                                                    </div>
                                                                </div>
                                                                <div class="col-lg-8 align-self-stretch p-0">
                                                                    <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                        {currentLeadform &&
                                                                            Object.keys(currentLeadform).length !== 0
                                                                            ? currentLeadform["Company Number"]
                                                                            : leadFormData &&
                                                                                leadFormData.length !== 0
                                                                                ? leadFormData[0]["Company Number"]
                                                                                : "-"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-lg-4 col-sm-6 p-0 align-self-stretch">
                                                            <div class="row m-0 h-100 bdr-btm-eee">
                                                                <div class="col-lg-7 align-self-stretch p-0">
                                                                    <div class="booking_inner_dtl_h bdr-left-eee h-100">Incorporation date</div>
                                                                </div>
                                                                <div class="col-lg-5 align-self-stretch p-0">
                                                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                        {currentLeadform &&
                                                                            formatDatePro(
                                                                                Object.keys(currentLeadform).length !==
                                                                                    0
                                                                                    ? currentLeadform.incoDate
                                                                                    : leadFormData &&
                                                                                        leadFormData.length !== 0
                                                                                        ? leadFormData[0].incoDate
                                                                                        : "-"
                                                                            )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-lg-4 col-sm-12 p-0 align-self-stretch">
                                                            <div class="row m-0 h-100 bdr-btm-eee">
                                                                <div class="col-lg-5 align-self-stretch p-0">
                                                                    <div class="booking_inner_dtl_h bdr-left-eee h-100">PAN/GST</div>
                                                                </div>
                                                                <div class="col-lg-7 align-self-stretch p-0">
                                                                    <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                        {currentLeadform &&
                                                                            Object.keys(currentLeadform).length !== 0
                                                                            ? currentLeadform.panNumber
                                                                            : leadFormData &&
                                                                                leadFormData.length !== 0
                                                                                ? leadFormData[0].panNumber
                                                                                : "-"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="row m-0">
                                                        <div class="col-lg-4 col-sm-6 p-0">
                                                            <div class="row m-0 ">
                                                                <div class="col-lg-4 align-self-stretc p-0">
                                                                    <div class="booking_inner_dtl_h h-100">Total</div>
                                                                </div>
                                                                <div class="col-lg-8 align-self-stretc p-0">
                                                                    {currentLeadform && <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                        ₹ {parseInt(calculateTotalAmount(currentLeadform)).toLocaleString()}
                                                                    </div>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-lg-4 col-sm-6 p-0">
                                                            <div class="row m-0 ">
                                                                <div class="col-lg-4 align-self-stretc p-0">
                                                                    <div class="booking_inner_dtl_h bdr-left-eee h-100">Received</div>
                                                                </div>
                                                                <div class="col-lg-8 align-self-stretc p-0">
                                                                    {currentLeadform && <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                        ₹ {parseInt(calculateReceivedAmount(currentLeadform)).toLocaleString()}
                                                                    </div>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-lg-4 col-sm-6 p-0">
                                                            <div class="row m-0">
                                                                <div class="col-lg-4 align-self-stretc p-0">
                                                                    <div class="booking_inner_dtl_h bdr-left-eee h-100">Pending</div>
                                                                </div>
                                                                <div class="col-lg-8 align-self-stretc p-0">
                                                                    {currentLeadform &&
                                                                        <div class="booking_inner_dtl_b bdr-left-eee h-100">

                                                                            ₹ {parseInt(calculatePendingAmount(currentLeadform)).toLocaleString()}

                                                                        </div>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='rm_all_bkng_right mt-3'>
                                                <ul className="nav nav-tabs rm_bkng_items align-items-center">
                                                    {currentLeadform && currentLeadform.moreBookings && currentLeadform.moreBookings.length !== 0 ? (
                                                        <>
                                                            <li className="nav-item rm_bkng_item_no">
                                                                <a
                                                                    className={activeIndexBooking === 1 ? "nav-link active" : "nav-link"}
                                                                    data-bs-toggle="tab"
                                                                    href="#Booking_1"
                                                                    onClick={() => {
                                                                        setActiveIndex(0);
                                                                        setActiveIndexBooking(1);
                                                                    }}
                                                                >
                                                                    Booking 1
                                                                </a>
                                                            </li>
                                                            {currentLeadform.moreBookings.map((obj, index) => (
                                                                <li key={index} className="nav-item rm_bkng_item_no">
                                                                    <a
                                                                        className={index + 2 === activeIndexBooking ? "nav-link active" : "nav-link"}
                                                                        data-bs-toggle="tab"
                                                                        href={`#Booking_${index + 2}`}
                                                                        onClick={() => {
                                                                            setActiveIndex(0);
                                                                            setActiveIndexMoreBookingServices(0);
                                                                            setActiveIndexBooking(index + 2);
                                                                        }}
                                                                    >
                                                                        Booking {index + 2}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                            {activeIndexBooking === 1 && currentLeadform.bookingPublishDate ? (
                                                                <li className="nav-item rm_bkng_item_no ms-auto">
                                                                    <div className="rm_bkng_item_no nav-link clr-ff8800">
                                                                        <span style={{
                                                                            color: "#797373",
                                                                            marginRight: "2px"
                                                                        }}
                                                                        >{"Publish On : "} </span>
                                                                        {formatDatePro(currentLeadform.bookingPublishDate)} at {formatTime(currentLeadform.bookingPublishDate)}
                                                                    </div>
                                                                </li>
                                                            ) : (
                                                                currentLeadform.moreBookings &&
                                                                currentLeadform.moreBookings.map((obj, index) => (
                                                                    index + 2 === activeIndexBooking && obj.bookingPublishDate && (
                                                                        <li key={index} className="nav-item rm_bkng_item_no ms-auto">
                                                                            <div className="rm_bkng_item_no nav-link clr-ff8800">
                                                                                <span style={{
                                                                                    color: "#797373",
                                                                                    marginRight: "2px"
                                                                                }}
                                                                                >{"Publish On : "} </span>
                                                                                {formatDatePro(obj.bookingPublishDate)} at {formatTime(obj.bookingPublishDate)}
                                                                            </div>
                                                                        </li>
                                                                    )
                                                                ))
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <li className="nav-item rm_bkng_item_no">
                                                                <a
                                                                    className={activeIndexBooking === 1 ? "nav-link active" : "nav-link"}
                                                                    data-bs-toggle="tab"
                                                                    href="#Booking_1"
                                                                    onClick={() => {
                                                                        setActiveIndex(0);
                                                                        setActiveIndexBooking(1);
                                                                    }}
                                                                >
                                                                    Booking 1
                                                                </a>
                                                            </li>
                                                            <li className="nav-item rm_bkng_item_no ms-auto">
                                                                <div className="rm_bkng_item_no nav-link clr-ff8800">
                                                                    <span style={{
                                                                        color: "#797373",
                                                                        marginRight: "2px"
                                                                    }}
                                                                    >{"Publish On : "} </span>
                                                                    {currentLeadform && currentLeadform.bookingPublishDate
                                                                        ? `${formatDatePro(currentLeadform.bookingPublishDate)} at ${formatTime(currentLeadform.bookingPublishDate)}`
                                                                        : 'No Date Available'}
                                                                </div>
                                                            </li>
                                                        </>
                                                    )}
                                                </ul>
                                                <div class="tab-content rm_bkng_item_details">
                                                    {currentLeadform &&
                                                        <div className={`tab-pane fade rm_bkng_item_detail_inner ${activeIndexBooking === 1 ? 'show active' : ''}`} id="Booking_1">
                                                            <div className="mul-booking-card mt-2">
                                                                <div className="mb-2 mul-booking-card-inner-head d-flex justify-content-between">
                                                                    <b>Booking Details:</b>
                                                                </div>
                                                                <div className="my-card">
                                                                    <div className="my-card-body">
                                                                        <div className="row m-0 bdr-btm-eee">
                                                                            <div className="col-lg-4 col-sm-6 p-0">
                                                                                <div class="row m-0">
                                                                                    <div class="col-sm-4 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_h h-100">
                                                                                            BDE Name
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="col-sm-8 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                            {currentLeadform &&
                                                                                                currentLeadform.bdeName}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-lg-4 col-sm-6 p-0">
                                                                                <div class="row m-0">
                                                                                    <div class="col-sm-4 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                            BDE Email
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="col-sm-8 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                            {currentLeadform &&
                                                                                                currentLeadform.bdeEmail}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-lg-4 col-sm-6 p-0">
                                                                                <div class="row m-0">
                                                                                    <div class="col-sm-4 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                            BDM Name
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="col-sm-8 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                            <span>
                                                                                                <i>
                                                                                                    {currentLeadform &&
                                                                                                        currentLeadform.bdmType}
                                                                                                </i>
                                                                                            </span>{" "}
                                                                                            {currentLeadform &&
                                                                                                currentLeadform.bdmName}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="row m-0 bdr-btm-eee">
                                                                            <div className="col-lg-4 col-sm-6 p-0">
                                                                                <div class="row m-0">
                                                                                    <div class="col-sm-4 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_h h-100">
                                                                                            BDM Email
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="col-sm-8 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                            {currentLeadform &&
                                                                                                currentLeadform.bdmEmail}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-lg-4 col-sm-6 p-0">
                                                                                <div class="row m-0">
                                                                                    <div class="col-sm-4 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                                            Booking Date{" "}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="col-sm-8 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                            {currentLeadform &&
                                                                                                currentLeadform.bookingDate}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-lg-4 col-sm-6 p-0">
                                                                                <div class="row m-0">
                                                                                    <div class="col-sm-4 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                            Lead Source
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="col-sm-8 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                            {currentLeadform &&
                                                                                                (currentLeadform.bookingSource ===
                                                                                                    "Other"
                                                                                                    ? currentLeadform.otherBookingSource
                                                                                                    : currentLeadform.bookingSource)}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="mb-2 mt-3 mul-booking-card-inner-head">
                                                                    <b>Services And Payment Details:</b>
                                                                </div>
                                                                <div className="my-card">
                                                                    <div className="my-card-body">
                                                                        <div className="row m-0 bdr-btm-eee">
                                                                            <div className="col-lg-6 col-sm-6 p-0">
                                                                                <div class="row m-0">
                                                                                    <div class="col-sm-4 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_h h-100">
                                                                                            No. Of Services
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="col-sm-8 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                            {currentLeadform &&
                                                                                                currentLeadform.services.length}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {currentLeadform && currentLeadform.services.map((obj, index) => (
                                                                    <div className="my-card mt-1">
                                                                        <div className="my-card-body">
                                                                            <div className="row m-0 bdr-btm-eee">
                                                                                <div className="col-lg-6 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-4 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_h h-100">
                                                                                                {getOrdinal(index + 1)} Services Name
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-8 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_b bdr-left-eee h-100 services-name">
                                                                                                {obj.serviceName}{" "}
                                                                                                {obj.withDSC &&
                                                                                                    obj.serviceName ===
                                                                                                    "Start-Up India Certificate" &&
                                                                                                    "With DSC"}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-lg-6 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-4 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                                                Total Amount
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-8 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                                <div className="d-flex align-items-center justify-content-between">
                                                                                                    <div>
                                                                                                        ₹{" "}
                                                                                                        {parseInt(
                                                                                                            obj.totalPaymentWGST
                                                                                                        ).toLocaleString()}{" "}
                                                                                                        {"("}
                                                                                                        {obj.totalPaymentWGST !==
                                                                                                            obj.totalPaymentWOGST
                                                                                                            ? "With GST"
                                                                                                            : "Without GST"}
                                                                                                        {")"}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="row m-0 bdr-btm-eee">
                                                                                <div className="col-lg-6 col-sm-5 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-4 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_h h-100">
                                                                                                Payment Terms
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-8 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                {obj.paymentTerms === "two-part"
                                                                                                    ? "Part-Payment"
                                                                                                    : "Full Advanced"}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-lg-6 col-sm-5 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-3 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                                                Notes
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-9 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={obj.paymentRemarks
                                                                                                ? obj.paymentRemarks
                                                                                                : "N/A"}>
                                                                                                {obj.paymentRemarks
                                                                                                    ? obj.paymentRemarks
                                                                                                    : "N/A"}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            {/* expanse */}
                                                                            {(obj.expanse !== 0 && obj.expanse) &&
                                                                                <div className="row m-0 bdr-btm-eee">
                                                                                    <div className="col-lg-6 col-sm-2 p-0">
                                                                                        <div class="row m-0">
                                                                                            <div class="col-sm-4 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                                    Expense
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-sm-8 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                    - ₹ {obj.expanse ? (obj.expanse).toLocaleString() : "N/A"}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="col-lg-6 col-sm-2 p-0">
                                                                                        <div class="row m-0">
                                                                                            <div class="col-sm-4 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                                    expense Date
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-sm-8 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                    {formatDatePro(obj.expanseDate ? obj.expanseDate : currentLeadform.bookingDate)}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            }
                                                                            <div className="row m-0 bdr-btm-eee">
                                                                                {obj.paymentTerms === "two-part" && (
                                                                                    <div className="col-lg-6 col-sm-6 p-0">
                                                                                        <div class="row m-0">
                                                                                            <div class="col-sm-4 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_h h-100">
                                                                                                    First payment
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-sm-8 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                    ₹{" "}
                                                                                                    {parseInt(
                                                                                                        obj.firstPayment
                                                                                                    ).toLocaleString()}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                                {obj.secondPayment !== 0 && (
                                                                                    <div className="col-lg-6 col-sm-6 p-0">
                                                                                        <div class="row m-0">
                                                                                            <div class="col-sm-4 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                                                    Second Payment
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-sm-8 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                                    <div className="d-flex align-items-center justify-content-between">
                                                                                                        <div>
                                                                                                            ₹
                                                                                                            {parseInt(
                                                                                                                obj.secondPayment
                                                                                                            ).toLocaleString()}
                                                                                                            {"("}
                                                                                                            {isNaN(
                                                                                                                new Date(
                                                                                                                    obj.secondPaymentRemarks
                                                                                                                )
                                                                                                            )
                                                                                                                ? obj.secondPaymentRemarks
                                                                                                                : "On " +
                                                                                                                obj.secondPaymentRemarks +
                                                                                                                ")"}
                                                                                                            {")"}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="row m-0 bdr-btm-eee">
                                                                                {obj.thirdPayment !== 0 && (
                                                                                    <div className="col-lg-6 col-sm-6 p-0">
                                                                                        <div class="row m-0">
                                                                                            <div class="col-sm-4 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_h h-100">
                                                                                                    Third Payment
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-sm-8 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                                    <div className="d-flex align-items-center justify-content-between">
                                                                                                        <div>
                                                                                                            ₹{" "}
                                                                                                            {parseInt(
                                                                                                                obj.thirdPayment
                                                                                                            ).toLocaleString()}
                                                                                                            {"("}
                                                                                                            {isNaN(
                                                                                                                new Date(
                                                                                                                    obj.thirdPaymentRemarks
                                                                                                                )
                                                                                                            )
                                                                                                                ? obj.thirdPaymentRemarks
                                                                                                                : "On " +
                                                                                                                obj.thirdPaymentRemarks +
                                                                                                                ")"}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                                {obj.fourthPayment !== 0 && (
                                                                                    <div className="col-lg-6 col-sm-6 p-0">
                                                                                        <div class="row m-0">
                                                                                            <div class="col-sm-4 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                                                    Fourth Payment
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-sm-8 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                                    <div className="d-flex align-items-center justify-content-between">
                                                                                                        <div>
                                                                                                            ₹{" "}
                                                                                                            {parseInt(
                                                                                                                obj.fourthPayment
                                                                                                            ).toLocaleString()}{" "}
                                                                                                            {"("}
                                                                                                            {isNaN(
                                                                                                                new Date(
                                                                                                                    obj.fourthPaymentRemarks
                                                                                                                )
                                                                                                            )
                                                                                                                ? obj.fourthPaymentRemarks
                                                                                                                : "On " +
                                                                                                                obj.fourthPaymentRemarks +
                                                                                                                ")"}
                                                                                                        </div>

                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        {/* Remaining Payment View Sections */}
                                                                        {currentLeadform.remainingPayments.length !== 0 && currentLeadform.remainingPayments.some((boom) => boom.serviceName === obj.serviceName) &&
                                                                            <div className="my-card-body accordion" id={`accordionExample${index}`} >
                                                                                <div class="accordion-item bdr-none">
                                                                                    <div id={`headingOne${index}`} className="pr-10 accordion-header">
                                                                                        <div className="row m-0 bdr-btm-eee accordion-button p-0"
                                                                                            data-bs-toggle="collapse" data-bs-target={`#collapseOne${index}`}
                                                                                            aria-expanded="true" aria-controls={`collapseOne${index}`}  >
                                                                                            <div className="w-95 p-0">
                                                                                                <div className="booking_inner_dtl_h h-100">
                                                                                                    <div>Remaining Payment </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div id={`collapseOne${index}`} class="accordion-collapse collapse show" aria-labelledby={`headingOne${index}`}
                                                                                        data-bs-parent="#accordionExample" >
                                                                                        {currentLeadform.remainingPayments
                                                                                            .length !== 0 && currentLeadform.remainingPayments.filter(boom => boom.serviceName === obj.serviceName).map(
                                                                                                (paymentObj, index) => paymentObj.serviceName === obj.serviceName ? (
                                                                                                    <div class="accordion-body bdr-none p-0">
                                                                                                        <div>
                                                                                                            <div className="row m-0 bdr-btm-eee bdr-top-eee">
                                                                                                                <div className="col-lg-12 col-sm-6 p-0 align-self-stretc bg-fffafa">
                                                                                                                    <div class="booking_inner_dtl_h h-100 d-flex align-items-center justify-content-between">
                                                                                                                        <div>
                                                                                                                            {currentLeadform.remainingPayments.length !== 0 &&
                                                                                                                                (() => {

                                                                                                                                    if (index === 0) return "Second ";
                                                                                                                                    else if (index === 1) return "Third ";
                                                                                                                                    else if (index === 2) return "Fourth ";
                                                                                                                                    // Add more conditions as needed
                                                                                                                                    return ""; // Return default value if none of the conditions match
                                                                                                                                })()}
                                                                                                                            Remaining Payment
                                                                                                                        </div>
                                                                                                                        <div>
                                                                                                                            {"(" + formatDatePro(paymentObj.publishDate ? paymentObj.publishDate : paymentObj.paymentDate) + ")"}
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div className="row m-0 bdr-btm-eee">
                                                                                                                <div className="col-lg-3 col-sm-6 p-0 align-self-stretc">
                                                                                                                    <div class="row m-0 h-100">
                                                                                                                        <div class="col-sm-5 align-self-stretc p-0">
                                                                                                                            <div class="booking_inner_dtl_h h-100">
                                                                                                                                Amount
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="col-sm-7 align-self-stretc p-0">
                                                                                                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                                                ₹{" "}
                                                                                                                                {paymentObj.receivedPayment.toLocaleString()}
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                <div className="col-lg-3 col-sm-6 p-0 align-self-stretc">
                                                                                                                    <div class="row m-0 h-100">
                                                                                                                        <div class="col-sm-5 align-self-stretc p-0">
                                                                                                                            <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                                                                Pending
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="col-sm-7 align-self-stretc p-0">
                                                                                                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                                                ₹{" "}
                                                                                                                                {currentLeadform.remainingPayments.length !== 0 &&
                                                                                                                                    (() => {
                                                                                                                                        const filteredPayments = currentLeadform.remainingPayments.filter(
                                                                                                                                            (pay) => pay.serviceName === obj.serviceName
                                                                                                                                        );

                                                                                                                                        const filteredLength = filteredPayments.length;
                                                                                                                                        if (index === 0) return parseInt(obj.totalPaymentWGST) - parseInt(obj.firstPayment) - parseInt(paymentObj.receivedPayment);
                                                                                                                                        else if (index === 1) return parseInt(obj.totalPaymentWGST) - parseInt(obj.firstPayment) - parseInt(paymentObj.receivedPayment) - parseInt(filteredPayments[0].receivedPayment);
                                                                                                                                        else if (index === 2) return parseInt(currentLeadform.pendingAmount);
                                                                                                                                        // Add more conditions as needed
                                                                                                                                        return ""; // Return default value if none of the conditions match
                                                                                                                                    })()}
                                                                                                                                {/* {index === 0
                                                                                                                            ? parseInt(obj.totalPaymentWGST) - parseInt(obj.firstPayment) - parseInt(paymentObj.receivedPayment)
                                                                                                                            : index === 1
                                                                                                                            ? parseInt(obj.totalPaymentWGST) - parseInt(obj.firstPayment) - parseInt(paymentObj.receivedPayment) - parseInt(currentLeadform.remainingPayments[0].receivedPayment)
                                                                                                                            : parseInt(currentLeadform.pendingAmount)} */}
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                <div className="col-lg-6 col-sm-6 p-0 align-self-stretc">
                                                                                                                    <div class="row m-0 h-100">
                                                                                                                        <div class="col-sm-5 align-self-stretc p-0">
                                                                                                                            <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                                                                                Payment Date
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="col-sm-7 align-self-stretc p-0">
                                                                                                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" >
                                                                                                                                {formatDatePro(
                                                                                                                                    paymentObj.paymentDate
                                                                                                                                )}
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div className="row m-0 bdr-btm-eee">
                                                                                                                <div className="col-lg-6 col-sm-6 p-0 align-self-stretc">
                                                                                                                    <div class="row m-0 h-100">
                                                                                                                        <div class="col-sm-5 align-self-stretc p-0">
                                                                                                                            <div class="booking_inner_dtl_h h-100">
                                                                                                                                Payment Method
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="col-sm-7 align-self-stretc p-0">
                                                                                                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={paymentObj.paymentMethod}>
                                                                                                                                {
                                                                                                                                    paymentObj.paymentMethod
                                                                                                                                }
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                <div className="col-lg-6 col-sm-4 p-0 align-self-stretc">
                                                                                                                    <div class="row m-0 h-100">
                                                                                                                        <div class="col-sm-4 align-self-stretc p-0">
                                                                                                                            <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                                                                                Extra Remarks
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="col-sm-8 align-self-stretc p-0">
                                                                                                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={
                                                                                                                                paymentObj.extraRemarks
                                                                                                                            }>
                                                                                                                                {
                                                                                                                                    paymentObj.extraRemarks
                                                                                                                                }
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ) : null // Render null for elements that don't match the condition
                                                                                            )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                ))}
                                                                {/* -------- CA Case -------- */}
                                                                <div className="my-card mt-1">
                                                                    <div className="my-card-body">
                                                                        <div className="row m-0 bdr-btm-eee">
                                                                            <div className="col-lg-12 col-sm-6 p-0">
                                                                                <div class="row m-0">
                                                                                    <div class="col-sm-2 align-self-stretc p-0">
                                                                                        <div class="booking_inner_dtl_h h-100">
                                                                                            CA Case
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="col-sm-10 align-self-stretc p-0">
                                                                                        <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                            {currentLeadform &&
                                                                                                currentLeadform.caCase}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {currentLeadform && currentLeadform.caCase !== "No" && (
                                                                            <div className="row m-0 bdr-btm-eee">
                                                                                <div className="col-lg-4 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-6 align-self-stretc p-0">
                                                                                            <div class="booking_inner_dtl_h h-100">
                                                                                                CA's Number
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-6 align-self-stretc p-0">
                                                                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                {currentLeadform &&
                                                                                                    currentLeadform.caNumber}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-lg-4 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-4 align-self-stretc p-0">
                                                                                            <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                                CA's Email
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-8 align-self-stretc p-0">
                                                                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                {currentLeadform &&
                                                                                                    currentLeadform.caEmail}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-lg-4 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-5 align-self-stretc p-0">
                                                                                            <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                                CA's Commission
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-7 align-self-stretc p-0">
                                                                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                ₹{" "}
                                                                                                {currentLeadform &&
                                                                                                    currentLeadform.caCommission}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {/* -------- Step 4 ---------*/}
                                                                <div className="mb-2 mt-3 mul-booking-card-inner-head">
                                                                    <b>Payment Summary:</b>
                                                                </div>
                                                                <div className="my-card">
                                                                    <div className="my-card-body">
                                                                        <div className="row m-0 bdr-btm-eee">
                                                                            <div className="col-lg-4 col-sm-6 p-0 align-self-stretch">
                                                                                <div class="row m-0 h-100">
                                                                                    <div class="col-sm-5 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                            Total Amount
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="col-sm-7 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                            ₹{" "}
                                                                                            {currentLeadform &&
                                                                                                parseInt(
                                                                                                    currentLeadform.totalAmount
                                                                                                ).toLocaleString()}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-lg-4 col-sm-6 p-0 align-self-stretch">
                                                                                <div class="row m-0 h-100">
                                                                                    <div class="col-sm-5 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                            Received Amount
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="col-sm-7 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                            ₹{" "}
                                                                                            {currentLeadform &&
                                                                                                parseInt(
                                                                                                    currentLeadform.receivedAmount
                                                                                                ).toLocaleString()}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-lg-4 col-sm-5 p-0 align-self-stretch">
                                                                                <div class="row m-0 h-100">
                                                                                    <div class="col-sm-6 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                            Pending Amount
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="col-sm-6 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                            ₹{" "}
                                                                                            {currentLeadform &&
                                                                                                parseInt(
                                                                                                    currentLeadform.pendingAmount
                                                                                                ).toLocaleString()}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="row m-0 bdr-btm-eee">
                                                                            <div className="col-lg-6 col-sm-6 p-0 align-self-stretch">
                                                                                <div class="row m-0 h-100">
                                                                                    <div class="col-sm-4 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_h h-100 ">
                                                                                            Payment Method
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="col-sm-8 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={currentLeadform &&
                                                                                            currentLeadform.paymentMethod}>
                                                                                            {currentLeadform &&
                                                                                                currentLeadform.paymentMethod}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-lg-6 col-sm-6 p-0 align-self-stretch">
                                                                                <div class="row m-0 h-100">
                                                                                    <div class="col-sm-4 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                                            Extra Remarks
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="col-sm-8 align-self-stretch p-0">
                                                                                        <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={currentLeadform &&
                                                                                            currentLeadform.extraNotes}>
                                                                                            {currentLeadform &&
                                                                                                currentLeadform.extraNotes}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {currentLeadform &&
                                                                    (currentLeadform.paymentReceipt.length !== 0 ||
                                                                        currentLeadform.otherDocs !== 0) && (
                                                                        <>
                                                                            <div className="mb-2 mt-3 mul-booking-card-inner-head">
                                                                                <b>Payment Receipt and Additional Documents:</b>
                                                                            </div>
                                                                            <div className="row">
                                                                                {currentLeadform.paymentReceipt.length !==
                                                                                    0 && (
                                                                                        <div className="col-sm-2 mb-1">
                                                                                            <div className="booking-docs-preview">
                                                                                                <div
                                                                                                    className="booking-docs-preview-img"
                                                                                                    onClick={() =>
                                                                                                        handleViewPdfReciepts(
                                                                                                            currentLeadform.paymentReceipt[0]
                                                                                                                .filename,
                                                                                                            currentLeadform["Company Name"]
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    {/* {currentLeadform &&
                                                                                                        currentLeadform.paymentReceipt[0] &&
                                                                                                        (((currentLeadform.paymentReceipt[0].filename).toLowerCase()).endsWith(
                                                                                                            ".pdf"
                                                                                                        ) ? (
                                                                                                            <PdfImageViewerAdmin
                                                                                                                type="paymentrecieptpdf"
                                                                                                                path={
                                                                                                                    currentLeadform
                                                                                                                        .paymentReceipt[0].filename
                                                                                                                }
                                                                                                                companyName={
                                                                                                                    currentLeadform["Company Name"]
                                                                                                                }
                                                                                                            />
                                                                                                        ) : currentLeadform.paymentReceipt[0].filename.endsWith(
                                                                                                            ".png"
                                                                                                        ) ||
                                                                                                            currentLeadform.paymentReceipt[0].filename.endsWith(
                                                                                                                ".jpg"
                                                                                                            ) ||
                                                                                                            currentLeadform.paymentReceipt[0].filename.endsWith(
                                                                                                                ".jpeg"
                                                                                                            ) ? (
                                                                                                            <img
                                                                                                                src={`${secretKey}/bookings/recieptpdf/${currentLeadform["Company Name"]}/${currentLeadform.paymentReceipt[0].filename}`}
                                                                                                                alt="Receipt Image"
                                                                                                            />
                                                                                                        ) : (
                                                                                                            <img
                                                                                                                src={wordimg}
                                                                                                                alt="Default Image"
                                                                                                            />
                                                                                                        ))} */}
                                                                                                    {currentLeadform &&
                                                                                                        currentLeadform.paymentReceipt &&
                                                                                                        currentLeadform.paymentReceipt[0] &&
                                                                                                        currentLeadform.paymentReceipt[0]
                                                                                                            .filename && // Ensure filename exists
                                                                                                        (currentLeadform.paymentReceipt[0].filename
                                                                                                            .toLowerCase()
                                                                                                            .endsWith(".pdf") ? (
                                                                                                            <PdfImageViewerAdmin
                                                                                                                type="paymentrecieptpdf"
                                                                                                                path={
                                                                                                                    currentLeadform
                                                                                                                        .paymentReceipt[0].filename
                                                                                                                }
                                                                                                                companyName={
                                                                                                                    currentLeadform["Company Name"]
                                                                                                                }
                                                                                                            />
                                                                                                        ) : currentLeadform.paymentReceipt[0].filename
                                                                                                            .toLowerCase()
                                                                                                            .endsWith(".png") ||
                                                                                                            currentLeadform.paymentReceipt[0].filename
                                                                                                                .toLowerCase()
                                                                                                                .endsWith(".jpg") ||
                                                                                                            currentLeadform.paymentReceipt[0].filename
                                                                                                                .toLowerCase()
                                                                                                                .endsWith(".jpeg") ? (
                                                                                                            <img
                                                                                                                src={`${secretKey}/bookings/recieptpdf/${currentLeadform["Company Name"]}/${currentLeadform.paymentReceipt[0].filename}`}
                                                                                                                alt="Receipt Image"
                                                                                                            />
                                                                                                        ) : (
                                                                                                            <img
                                                                                                                src={wordimg}
                                                                                                                alt="Default Image"
                                                                                                            />
                                                                                                        ))}
                                                                                                </div>
                                                                                                <div className="booking-docs-preview-text">
                                                                                                    <p className="booking-img-name-txtwrap text-wrap m-auto m-0">
                                                                                                        Receipt
                                                                                                    </p>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                {currentLeadform.remainingPayments.length !==
                                                                                    0 &&
                                                                                    currentLeadform.remainingPayments.some(
                                                                                        (obj) => obj.paymentReceipt.length !== 0
                                                                                    ) &&
                                                                                    currentLeadform.remainingPayments.map((remainingObject, index) => (
                                                                                        remainingObject.paymentReceipt.length !== 0 && (
                                                                                            <div className="col-sm-2 mb-1" key={index}>
                                                                                                <div className="booking-docs-preview">
                                                                                                    <div
                                                                                                        className="booking-docs-preview-img"
                                                                                                        onClick={() =>
                                                                                                            handleViewPdfReciepts(
                                                                                                                remainingObject.paymentReceipt[0].filename,
                                                                                                                currentLeadform["Company Name"]
                                                                                                            )
                                                                                                        }
                                                                                                    >
                                                                                                        {((remainingObject.paymentReceipt[0].filename).toLowerCase()).endsWith(".pdf") ? (
                                                                                                            <PdfImageViewerAdmin
                                                                                                                type="paymentrecieptpdf"
                                                                                                                path={remainingObject.paymentReceipt[0].filename}
                                                                                                                companyName={currentLeadform["Company Name"]}
                                                                                                            />
                                                                                                        ) : remainingObject.paymentReceipt[0].filename.endsWith(".png") ||
                                                                                                            remainingObject.paymentReceipt[0].filename.endsWith(".jpg") ||
                                                                                                            remainingObject.paymentReceipt[0].filename.endsWith(".jpeg") ? (
                                                                                                            <img
                                                                                                                src={`${secretKey}/bookings/recieptpdf/${currentLeadform["Company Name"]}/${remainingObject.paymentReceipt[0].filename}`}
                                                                                                                alt="Receipt Image"
                                                                                                            />
                                                                                                        ) : (
                                                                                                            <img src={wordimg} alt="Default Image" />
                                                                                                        )}
                                                                                                    </div>
                                                                                                    <div className="booking-docs-preview-text">
                                                                                                        <p className="booking-img-name-txtwrap text-wrap m-auto m-0">
                                                                                                            Remaining Payment
                                                                                                        </p>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )
                                                                                    ))}

                                                                                {/* {currentLeadform &&
                                                                                    currentLeadform.otherDocs.map((obj) => (
                                                                                        <div className="col-sm-2 mb-1">
                                                                                            <div className="booking-docs-preview">
                                                                                                <div
                                                                                                    className="booking-docs-preview-img"
                                                                                                    onClick={() =>
                                                                                                        handleViewPdOtherDocs(
                                                                                                            obj.filename,
                                                                                                            currentLeadform["Company Name"]
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    {((obj.filename).toLowerCase()).endsWith(".pdf") ? (
                                                                                                        <PdfImageViewerAdmin
                                                                                                            type="pdf"
                                                                                                            path={obj.filename}
                                                                                                            companyName={
                                                                                                                currentLeadform["Company Name"]
                                                                                                            }
                                                                                                        />
                                                                                                    ) : (
                                                                                                        <img
                                                                                                            src={`${secretKey}/bookings/otherpdf/${currentLeadform["Company Name"]}/${obj.filename}`}
                                                                                                            alt={pdfimg}
                                                                                                        ></img>
                                                                                                    )}
                                                                                                </div>
                                                                                                <div className="booking-docs-preview-text">
                                                                                                    <p
                                                                                                        className="booking-img-name-txtwrap text-wrap m-auto m-0 text-wrap m-auto m-0"
                                                                                                        title={obj.originalname}
                                                                                                    >
                                                                                                        {obj.originalname}
                                                                                                    </p>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))} */}
                                                                                {currentLeadform &&
                                                                                    currentLeadform.otherDocs &&
                                                                                    currentLeadform.otherDocs.map((obj) => (
                                                                                        <div
                                                                                            className="col-sm-2 mb-1"
                                                                                            key={obj.filename}
                                                                                        >
                                                                                            <div className="booking-docs-preview">
                                                                                                <div
                                                                                                    className="booking-docs-preview-img"
                                                                                                    onClick={() =>
                                                                                                        handleViewPdOtherDocs(
                                                                                                            obj.filename,
                                                                                                            currentLeadform["Company Name"]
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    {obj.filename && // Ensure filename exists
                                                                                                        obj.filename
                                                                                                            .toLowerCase()
                                                                                                            .endsWith(".pdf") ? (
                                                                                                        <PdfImageViewerAdmin
                                                                                                            type="pdf"
                                                                                                            path={obj.filename}
                                                                                                            companyName={
                                                                                                                currentLeadform["Company Name"]
                                                                                                            }
                                                                                                        />
                                                                                                    ) : (
                                                                                                        obj.filename && (
                                                                                                            <img
                                                                                                                src={`${secretKey}/bookings/otherpdf/${currentLeadform["Company Name"]}/${obj.filename}`}
                                                                                                                alt={pdfimg}
                                                                                                            />
                                                                                                        )
                                                                                                    )}
                                                                                                </div>
                                                                                                <div className="booking-docs-preview-text">
                                                                                                    <p
                                                                                                        className="booking-img-name-txtwrap text-wrap m-auto m-0"
                                                                                                        title={obj.originalname}
                                                                                                    >
                                                                                                        {obj.originalname}
                                                                                                    </p>
                                                                                                </div>
                                                                                            </div>

                                                                                        </div>
                                                                                    ))}
                                                                                {/* ---------- Upload Documents From Preview -----------*/}
                                                                                <div className="col-sm-2 mb-1">
                                                                                    <div
                                                                                        className="booking-docs-preview"
                                                                                        title="Upload More Documents"
                                                                                    >
                                                                                        <div
                                                                                            className="upload-Docs-BTN"
                                                                                            onClick={() => {
                                                                                                setOpenOtherDocs(true);
                                                                                                setSendingIndex(0);
                                                                                            }}
                                                                                        >
                                                                                            <IoAdd />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <Dialog
                                                                                    open={openOtherDocs}
                                                                                    onClose={closeOtherDocsPopup}
                                                                                    fullWidth
                                                                                    maxWidth="sm"
                                                                                >
                                                                                    <DialogTitle>
                                                                                        Upload Your Attachments
                                                                                        <IconButton
                                                                                            onClick={closeOtherDocsPopup}
                                                                                            style={{ float: "right" }}
                                                                                        >
                                                                                            <CloseIcon color="primary"></CloseIcon>
                                                                                        </IconButton>{" "}
                                                                                    </DialogTitle>
                                                                                    <DialogContent>
                                                                                        <div className="maincon">
                                                                                            {/* Single file input for multiple documents */}
                                                                                            <div
                                                                                                style={{
                                                                                                    justifyContent: "space-between",
                                                                                                }}
                                                                                                className="con1 d-flex"
                                                                                            >
                                                                                                <div
                                                                                                    style={{ paddingTop: "9px" }}
                                                                                                    className="uploadcsv"
                                                                                                >
                                                                                                    <label
                                                                                                        style={{
                                                                                                            margin: "0px 0px 6px 0px",
                                                                                                        }}
                                                                                                        htmlFor="attachmentfile"
                                                                                                    >
                                                                                                        Upload Files
                                                                                                    </label>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div
                                                                                                style={{ margin: "5px 0px 0px 0px" }}
                                                                                                className="form-control"
                                                                                            >
                                                                                                <input
                                                                                                    type="file"
                                                                                                    name="attachmentfile"
                                                                                                    id="attachmentfile"
                                                                                                    onChange={(e) => {
                                                                                                        handleOtherDocsUpload(
                                                                                                            e.target.files
                                                                                                        );
                                                                                                    }}
                                                                                                    multiple // Allow multiple files selection
                                                                                                />
                                                                                                {selectedDocuments &&
                                                                                                    selectedDocuments.length > 0 && (
                                                                                                        <div className="uploaded-filename-main d-flex flex-wrap">
                                                                                                            {selectedDocuments.map(
                                                                                                                (file, index) => (
                                                                                                                    <div
                                                                                                                        className="uploaded-fileItem d-flex align-items-center"
                                                                                                                        key={index}
                                                                                                                    >
                                                                                                                        <p className="m-0">
                                                                                                                            {file.name}
                                                                                                                        </p>
                                                                                                                        <button
                                                                                                                            className="fileItem-dlt-btn"
                                                                                                                            onClick={() =>
                                                                                                                                handleRemoveFile(index)
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
                                                                                    </DialogContent>
                                                                                    <button
                                                                                        className="btn btn-primary"
                                                                                        onClick={handleotherdocsAttachment}
                                                                                    >
                                                                                        Submit
                                                                                    </button>
                                                                                </Dialog>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                            </div>
                                                        </div>}
                                                    {/* ----- More Bookings section --------- */}
                                                    {currentLeadform && currentLeadform.moreBookings && currentLeadform.moreBookings.length !== 0 &&
                                                        currentLeadform.moreBookings.map((obj, index) => (
                                                            <div key={index + 2} className={`tab-pane fade rm_bkng_item_detail_inner ${activeIndexBooking === index + 2 ? 'show active' : ''}`} id={`Booking_${index + 2}`}>
                                                                <div className="mul-booking-card mt-2">
                                                                    {/* -------- Step 2 ---------*/}
                                                                    <div className="mb-2 mul-booking-card-inner-head d-flex justify-content-between">
                                                                        <b>Booking Details:</b>
                                                                    </div>
                                                                    <div className="my-card">
                                                                        <div className="my-card-body">
                                                                            <div className="row m-0 bdr-btm-eee">
                                                                                <div className="col-lg-4 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-4 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_h h-100">
                                                                                                BDE Name
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-8 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                                {currentLeadform.moreBookings &&
                                                                                                    obj.bdeName}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-lg-4 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-4 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                                BDE Email
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-8 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                {currentLeadform.moreBookings &&
                                                                                                    obj.bdeEmail}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-lg-4 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-4 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                                BDM Name
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-8 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                {currentLeadform.moreBookings &&
                                                                                                    obj.bdmName} <i>({currentLeadform.moreBookings && obj.bdmType})</i>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="row m-0 bdr-btm-eee">
                                                                                <div className="col-lg-4 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-4 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_h h-100">
                                                                                                BDM Email
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-8 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                {currentLeadform.moreBookings &&
                                                                                                    obj.bdmEmail}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-lg-4 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-4 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                                                Booking Date
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-8 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                                {formatDatePro(obj.bookingDate)}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-lg-4 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-4 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                                Lead Source
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-8 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                {currentLeadform.mainBookings &&
                                                                                                    (obj.bookingSource ===
                                                                                                        "Other"
                                                                                                        ? obj.otherBookingSource
                                                                                                        : obj.bookingSource)}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {/* -------- Step 3 ---------*/}
                                                                    <div className="mb-2 mt-3 mul-booking-card-inner-head">
                                                                        <b>Services And Payment Details:</b>
                                                                    </div>
                                                                    <div className="my-card">
                                                                        <div className="my-card-body">
                                                                            <div className="row m-0 bdr-btm-eee">
                                                                                <div className="col-lg-6 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-4 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_h h-100">
                                                                                                No. Of Services
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-8 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                                {currentLeadform.moreBookings &&
                                                                                                    obj.services.length}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {obj.services.map((obj, index) => (
                                                                        <div className="my-card mt-1">
                                                                            <div className="my-card-body">
                                                                                <div className="row m-0 bdr-btm-eee">
                                                                                    <div className="col-lg-6 col-sm-6 p-0">
                                                                                        <div class="row m-0">
                                                                                            <div class="col-sm-4 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_h h-100">
                                                                                                    {getOrdinal(index + 1)} Services
                                                                                                    Name
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-sm-8 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_b bdr-left-eee h-100 services-name">
                                                                                                    {obj.serviceName}{" "}
                                                                                                    {obj.withDSC &&
                                                                                                        obj.serviceName ===
                                                                                                        "Start-Up India Certificate" &&
                                                                                                        "With DSC"}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="col-lg-6 col-sm-6 p-0">
                                                                                        <div class="row m-0">
                                                                                            <div class="col-sm-4 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                                                    Total Amount
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-sm-8 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                                    <div className="d-flex align-item-center justify-content-between">
                                                                                                        <div>
                                                                                                            ₹{" "}
                                                                                                            {parseInt(
                                                                                                                obj.totalPaymentWGST
                                                                                                            ).toLocaleString()}
                                                                                                            {"("}
                                                                                                            {obj.totalPaymentWGST !==
                                                                                                                obj.totalPaymentWOGST
                                                                                                                ? "With GST"
                                                                                                                : "Without GST"}
                                                                                                            {")"}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="row m-0 bdr-btm-eee">
                                                                                    <div className="col-lg-6 col-sm-5 p-0">
                                                                                        <div class="row m-0">
                                                                                            <div class="col-sm-4 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_h h-100">
                                                                                                    Payment Terms
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-sm-8 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                    {obj.paymentTerms}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="col-lg-6 col-sm-5 p-0">
                                                                                        <div class="row m-0">
                                                                                            <div class="col-sm-3 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                                                    Notes
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-sm-9 align-self-stretch p-0">
                                                                                                <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={obj.paymentRemarks
                                                                                                    ? obj.paymentRemarks
                                                                                                    : "N/A"}>
                                                                                                    {obj.paymentRemarks
                                                                                                        ? obj.paymentRemarks
                                                                                                        : "N/A"}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                {(obj.expanse !== 0 && obj.expanse) &&
                                                                                    <div className="row m-0 bdr-btm-eee">
                                                                                        <div className="col-lg-6 col-sm-2 p-0">
                                                                                            <div class="row m-0">
                                                                                                <div class="col-sm-4 align-self-stretch p-0">
                                                                                                    <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                                        Expense
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div class="col-sm-8 align-self-stretch p-0">
                                                                                                    <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                        - ₹ {obj.expanse ? (obj.expanse).toLocaleString() : "N/A"}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-lg-6 col-sm-2 p-0">
                                                                                            <div class="row m-0">
                                                                                                <div class="col-sm-4 align-self-stretch p-0">
                                                                                                    <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                                        expense Date
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div class="col-sm-8 align-self-stretch p-0">
                                                                                                    <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                        {formatDatePro(obj.expanseDate ? obj.expanseDate : obj.bookingDate)}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>}
                                                                                <div className="row m-0 bdr-btm-eee">
                                                                                    {obj.paymentTerms === "two-part" && (
                                                                                        <div className="col-lg-6 col-sm-6 p-0">
                                                                                            <div class="row m-0">
                                                                                                <div class="col-sm-4 align-self-stretch p-0">
                                                                                                    <div class="booking_inner_dtl_h h-100">
                                                                                                        First payment
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div class="col-sm-8 align-self-stretch p-0">
                                                                                                    <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                        ₹{" "}
                                                                                                        {parseInt(
                                                                                                            obj.firstPayment
                                                                                                        ).toLocaleString()}
                                                                                                        /-
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                    {obj.secondPayment !== 0 && (
                                                                                        <div className="col-lg-6 col-sm-6 p-0">
                                                                                            <div class="row m-0">
                                                                                                <div class="col-sm-4 align-self-stretch p-0">
                                                                                                    <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                                                        Second Payment
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div class="col-sm-8 align-self-stretch p-0">
                                                                                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                                        <div className="d-flex align-items-center justify-content-between">
                                                                                                            <div>
                                                                                                                ₹
                                                                                                                {parseInt(
                                                                                                                    obj.secondPayment
                                                                                                                ).toLocaleString()}
                                                                                                                /- {"("}
                                                                                                                {isNaN(
                                                                                                                    new Date(
                                                                                                                        obj.secondPaymentRemarks
                                                                                                                    )
                                                                                                                )
                                                                                                                    ? obj.secondPaymentRemarks
                                                                                                                    : "On " +
                                                                                                                    obj.secondPaymentRemarks +
                                                                                                                    ")"}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="row m-0 bdr-btm-eee">
                                                                                    {obj.thirdPayment !== 0 && (
                                                                                        <div className="col-lg-6 col-sm-6 p-0">
                                                                                            <div class="row m-0">
                                                                                                <div class="col-sm-4 align-self-stretch p-0">
                                                                                                    <div class="booking_inner_dtl_h h-100">
                                                                                                        Third Payment
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div class="col-sm-8 align-self-stretch p-0">
                                                                                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                                        <div className="d-flex align-items-center justify-content-between">
                                                                                                            <div>
                                                                                                                ₹{" "}
                                                                                                                {parseInt(
                                                                                                                    obj.thirdPayment
                                                                                                                ).toLocaleString()}
                                                                                                                /- {"("}
                                                                                                                {isNaN(
                                                                                                                    new Date(
                                                                                                                        obj.thirdPaymentRemarks
                                                                                                                    )
                                                                                                                )
                                                                                                                    ? obj.thirdPaymentRemarks
                                                                                                                    : "On " +
                                                                                                                    obj.thirdPaymentRemarks +
                                                                                                                    ")"}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                    {obj.fourthPayment !== 0 && (
                                                                                        <div className="col-lg-6 col-sm-6 p-0">
                                                                                            <div class="row m-0">
                                                                                                <div class="col-sm-4 align-self-stretch p-0">
                                                                                                    <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                                                        Fourth Payment
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div class="col-sm-8 align-self-stretch p-0">
                                                                                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                                        <div className="d-flex align-items-center justify-content-between">
                                                                                                            <div>
                                                                                                                ₹{" "}
                                                                                                                {parseInt(
                                                                                                                    obj.fourthPayment
                                                                                                                ).toLocaleString()}{" "}
                                                                                                                /- {"("}
                                                                                                                {isNaN(
                                                                                                                    new Date(
                                                                                                                        obj.fourthPaymentRemarks
                                                                                                                    )
                                                                                                                )
                                                                                                                    ? obj.fourthPaymentRemarks
                                                                                                                    : "On " +
                                                                                                                    obj.fourthPaymentRemarks +
                                                                                                                    ")"}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            {obj.remainingPayments && obj.remainingPayments.length !== 0 && obj.remainingPayments.some((boom) => boom.serviceName === obj.serviceName) &&
                                                                                <div className="my-card-body accordion" id={`accordionExample${index}`}   >
                                                                                    <div class="accordion-item bdr-none">
                                                                                        <div id={`headingOne${index}`} className="pr-10 accordion-header"  >
                                                                                            <div className="row m-0 bdr-btm-eee accordion-button p-0"
                                                                                                data-bs-toggle="collapse"
                                                                                                data-bs-target={`#collapseOne${index}`}
                                                                                                aria-expanded="true"
                                                                                                aria-controls={`collapseOne${index}`}
                                                                                            >
                                                                                                <div className="w-95 p-0">
                                                                                                    <div className="booking_inner_dtl_h h-100 d-flex align-items-center justify-content-between">
                                                                                                        <div>Remaining Payment </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div
                                                                                            id={`collapseOne${index}`}
                                                                                            class="accordion-collapse collapse show"
                                                                                            aria-labelledby={`headingOne${index}`}
                                                                                            data-bs-parent="#accordionExample"
                                                                                        // Add a unique key prop for each rendered element
                                                                                        >
                                                                                            {obj.remainingPayments
                                                                                                .length !== 0 && obj.remainingPayments.filter(boom => boom.serviceName === obj.serviceName).map(
                                                                                                    (paymentObj, index) =>
                                                                                                        paymentObj.serviceName ===
                                                                                                            obj.serviceName ? (
                                                                                                            <div class="accordion-body bdr-none p-0">
                                                                                                                <div>
                                                                                                                    <div className="row m-0 bdr-btm-eee bdr-top-eee">
                                                                                                                        <div className="col-lg-12 col-sm-6 p-0 align-self-stretc bg-fffafa">
                                                                                                                            <div class="booking_inner_dtl_h h-100 d-flex align-items-center justify-content-between">
                                                                                                                                <div>
                                                                                                                                    {obj.remainingPayments.length !== 0 &&
                                                                                                                                        (() => {

                                                                                                                                            if (index === 0) return "Second ";
                                                                                                                                            else if (index === 1) return "Third ";
                                                                                                                                            else if (index === 2) return "Fourth ";
                                                                                                                                            else if (index > 2) return "Other ";
                                                                                                                                            // Add more conditions as needed
                                                                                                                                            return ""; // Return default value if none of the conditions match
                                                                                                                                        })()}
                                                                                                                                    Remaining Payment
                                                                                                                                </div>
                                                                                                                                <div className="d-flex align-items-center">
                                                                                                                                    <div>
                                                                                                                                        {"(" + formatDatePro(paymentObj.publishDate ? paymentObj.publishDate : paymentObj.paymentDate) + ")"}

                                                                                                                                    </div>

                                                                                                                                    {/* {
                                                                                                                        obj.remainingPayments.length - 1 === index && <IconButton onClick={ ()=>functionDeleteRemainingPayment(BookingIndex + 1)} >
                                                                                                                            <MdDelete style={{ height: '14px', width: '14px' , color:'#be1e1e' }} />
                                                                                                                        </IconButton>
                                                                                                                        } */}
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="row m-0 bdr-btm-eee">
                                                                                                                        <div className="col-lg-3 col-sm-6 p-0 align-self-stretc">
                                                                                                                            <div class="row m-0 h-100">
                                                                                                                                <div class="col-sm-5 align-self-stretc p-0">
                                                                                                                                    <div class="booking_inner_dtl_h h-100">
                                                                                                                                        Amount
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                                <div class="col-sm-7 align-self-stretc p-0">
                                                                                                                                    <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                                                        ₹{" "}
                                                                                                                                        {paymentObj.receivedPayment.toLocaleString()}
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div className="col-lg-3 col-sm-6 p-0 align-self-stretc">
                                                                                                                            <div class="row m-0 h-100">
                                                                                                                                <div class="col-sm-5 align-self-stretc p-0">
                                                                                                                                    <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                                                                        Pending
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                                <div class="col-sm-7 align-self-stretc p-0">
                                                                                                                                    <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                                                        ₹{" "}
                                                                                                                                        {obj.remainingPayments.length !== 0 &&
                                                                                                                                            (() => {
                                                                                                                                                const filteredPayments = obj.remainingPayments.filter(
                                                                                                                                                    (pay) => pay.serviceName === obj.serviceName
                                                                                                                                                );

                                                                                                                                                const filteredLength = filteredPayments.length;
                                                                                                                                                if (index === 0) return Math.round(obj.totalPaymentWGST) - Math.round(obj.firstPayment) - Math.round(paymentObj.receivedPayment);
                                                                                                                                                else if (index === 1) return Math.round(obj.totalPaymentWGST) - Math.round(obj.firstPayment) - Math.round(paymentObj.receivedPayment) - Math.round(filteredPayments[0].receivedPayment);
                                                                                                                                                else if (index === 2) return Math.round(obj.pendingAmount);
                                                                                                                                                // Add more conditions as needed
                                                                                                                                                return ""; // Return default value if none of the conditions match
                                                                                                                                            })()}
                                                                                                                                        {/* {index === 0
                                                                                                                            ? Math.round(obj.totalPaymentWGST) - Math.round(obj.firstPayment) - Math.round(paymentObj.receivedPayment)
                                                                                                                            : index === 1
                                                                                                                            ? Math.round(obj.totalPaymentWGST) - Math.round(obj.firstPayment) - Math.round(paymentObj.receivedPayment) - Math.round(currentLeadform.remainingPayments[0].receivedPayment)
                                                                                                                            : Math.round(currentLeadform.pendingAmount)} */}
                                                                                                                                    </div>

                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div className="col-lg-6 col-sm-6 p-0 align-self-stretc">
                                                                                                                            <div class="row m-0 h-100">
                                                                                                                                <div class="col-sm-5 align-self-stretc p-0">
                                                                                                                                    <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                                                                                        Payment Date
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                                <div class="col-sm-7 align-self-stretc p-0">
                                                                                                                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap">
                                                                                                                                        {formatDatePro(
                                                                                                                                            paymentObj.paymentDate
                                                                                                                                        )}
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="row m-0 bdr-btm-eee">
                                                                                                                        <div className="col-lg-6 col-sm-6 p-0 align-self-stretc">
                                                                                                                            <div class="row m-0 h-100">
                                                                                                                                <div class="col-sm-5 align-self-stretc p-0">
                                                                                                                                    <div class="booking_inner_dtl_h h-100">
                                                                                                                                        Payment Method
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                                <div class="col-sm-7 align-self-stretc p-0">
                                                                                                                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={
                                                                                                                                        paymentObj.paymentMethod
                                                                                                                                    }>
                                                                                                                                        {
                                                                                                                                            paymentObj.paymentMethod
                                                                                                                                        }
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div className="col-lg-6 col-sm-6 p-0 align-self-stretc">
                                                                                                                            <div class="row m-0 h-100">
                                                                                                                                <div class="col-sm-4 align-self-stretc p-0">
                                                                                                                                    <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                                                                                        Extra Remarks
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                                <div class="col-sm-8 align-self-stretc p-0">
                                                                                                                                    <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={
                                                                                                                                        paymentObj.extraRemarks
                                                                                                                                    }>
                                                                                                                                        {
                                                                                                                                            paymentObj.extraRemarks
                                                                                                                                        }
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        ) : null // Render null for elements that don't match the condition
                                                                                                )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            }
                                                                        </div>
                                                                    ))}

                                                                    {/* -------- CA Case -------- */}
                                                                    <div className="my-card mt-1">
                                                                        <div className="my-card-body">
                                                                            <div className="row m-0 bdr-btm-eee">
                                                                                <div className="col-lg-12 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-2 align-self-stretc p-0">
                                                                                            <div class="booking_inner_dtl_h h-100">
                                                                                                CA Case
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-10 align-self-stretc p-0">
                                                                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                                {obj.caCase}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            {obj.caCase !== "No" && (
                                                                                <div className="row m-0 bdr-btm-eee">
                                                                                    <div className="col-lg-4 col-sm-6 p-0">
                                                                                        <div class="row m-0">
                                                                                            <div class="col-sm-5 align-self-stretc p-0">
                                                                                                <div class="booking_inner_dtl_h h-100">
                                                                                                    CA's Number
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-sm-7 align-self-stretc p-0">
                                                                                                <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                    {obj.caNumber}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="col-lg-4 col-sm-6 p-0">
                                                                                        <div class="row m-0">
                                                                                            <div class="col-sm-4 align-self-stretc p-0">
                                                                                                <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                                    CA's Email
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-sm-8 align-self-stretc p-0">
                                                                                                <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                    {obj.caEmail}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="col-lg-4 col-sm-6 p-0">
                                                                                        <div class="row m-0">
                                                                                            <div class="col-sm-5 align-self-stretc p-0">
                                                                                                <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                                    CA's Commission
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-sm-7 align-self-stretc p-0">
                                                                                                <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                    ₹ {obj.caCommission}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* -------- Step 4 ---------*/}
                                                                    <div className="mb-2 mt-3 mul-booking-card-inner-head">
                                                                        <b>Payment Summary:</b>
                                                                    </div>
                                                                    <div className="my-card">
                                                                        <div className="my-card-body">
                                                                            <div className="row m-0 bdr-btm-eee">
                                                                                <div className="col-lg-4 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-5 align-self-stretchh p-0">
                                                                                            <div class="booking_inner_dtl_h h-100">
                                                                                                Total Amount
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-7 align-self-stretchh p-0">
                                                                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee">
                                                                                                ₹{" "}
                                                                                                {parseInt(
                                                                                                    obj.totalAmount
                                                                                                ).toLocaleString()}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-lg-4 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-5 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                                Received Amount
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-7 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                ₹{" "}
                                                                                                {parseInt(
                                                                                                    obj.receivedAmount
                                                                                                ).toLocaleString()}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-lg-4 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-5 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_h bdr-left-eee h-100">
                                                                                                Pending Amount
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-7 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_b bdr-left-eee h-100">
                                                                                                ₹{" "}
                                                                                                {parseInt(
                                                                                                    obj.pendingAmount
                                                                                                ).toLocaleString()}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="row m-0 bdr-btm-eee">
                                                                                <div className="col-lg-6 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-4 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_h h-100">
                                                                                                Payment Method
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-8 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={obj.paymentMethod}>
                                                                                                {obj.paymentMethod}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-lg-6 col-sm-6 p-0">
                                                                                    <div class="row m-0">
                                                                                        <div class="col-sm-4 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_h h-100 bdr-left-eee">
                                                                                                Extra Remarks
                                                                                            </div>
                                                                                        </div>
                                                                                        <div class="col-sm-8 align-self-stretch p-0">
                                                                                            <div class="booking_inner_dtl_b h-100 bdr-left-eee My_Text_Wrap" title={obj.extraNotes}>
                                                                                                {obj.extraNotes}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="mb-2 mt-3 mul-booking-card-inner-head">
                                                                        <b>Payment Receipt and Additional Documents:</b>
                                                                    </div>

                                                                    <div className="row">
                                                                        {obj.paymentReceipt &&
                                                                            obj.paymentReceipt.length !== 0 && (
                                                                                <div className="col-sm-2 mb-1">
                                                                                    <div className="booking-docs-preview">
                                                                                        <div
                                                                                            className="booking-docs-preview-img"
                                                                                            onClick={() =>
                                                                                                handleViewPdfReciepts(
                                                                                                    obj.paymentReceipt[0]
                                                                                                        .filename,
                                                                                                    currentLeadform["Company Name"]
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            {((obj.paymentReceipt[0].filename).toLowerCase()).endsWith(
                                                                                                ".pdf"
                                                                                            ) ? (
                                                                                                <PdfImageViewerAdmin
                                                                                                    type="paymentrecieptpdf"
                                                                                                    path={
                                                                                                        obj.paymentReceipt[0]
                                                                                                            .filename
                                                                                                    }
                                                                                                    companyName={
                                                                                                        currentLeadform["Company Name"]
                                                                                                    }
                                                                                                />
                                                                                            ) : (
                                                                                                <img
                                                                                                    src={`${secretKey}/bookings/recieptpdf/${currentLeadform["Company Name"]}/${obj.paymentReceipt[0].filename}`}
                                                                                                    alt={"MyImg"}
                                                                                                ></img>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="booking-docs-preview-text">
                                                                                            <p className="booking-img-name-txtwrap text-wrap m-auto m-0">
                                                                                                Receipt.pdf
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        {obj.otherDocs.map((obj) => (
                                                                            <div className="col-sm-2 mb-1">
                                                                                <div className="booking-docs-preview">
                                                                                    <div
                                                                                        className="booking-docs-preview-img"
                                                                                        onClick={() =>
                                                                                            handleViewPdOtherDocs(
                                                                                                obj.filename,
                                                                                                currentLeadform["Company Name"]
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        {((obj.filename).toLowerCase()).endsWith(".pdf") ? (
                                                                                            <PdfImageViewerAdmin
                                                                                                type="pdf"
                                                                                                path={obj.filename}
                                                                                                companyName={
                                                                                                    currentLeadform["Company Name"]
                                                                                                }
                                                                                            />
                                                                                        ) : (
                                                                                            <img
                                                                                                src={`${secretKey}/bookings/otherpdf/${currentLeadform["Company Name"]}/${obj.filename}`}
                                                                                                alt={pdfimg}
                                                                                            ></img>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="booking-docs-preview-text">
                                                                                        <p
                                                                                            className="booking-img-name-txtwrap text-wrap m-auto m-0"
                                                                                            title={obj.originalname}
                                                                                        >
                                                                                            {obj.originalname}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}

                                                                        <div className="col-sm-2 mb-1">
                                                                            <div
                                                                                className="booking-docs-preview"
                                                                                title="Upload More Documents"
                                                                            >
                                                                                <div
                                                                                    className="upload-Docs-BTN"
                                                                                    onClick={() => {
                                                                                        setOpenOtherDocs(true);
                                                                                        setSendingIndex(index + 1);
                                                                                    }}
                                                                                >
                                                                                    <IoAdd />
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <Dialog
                                                                            open={openOtherDocs}
                                                                            onClose={closeOtherDocsPopup}
                                                                            fullWidth
                                                                            maxWidth="sm"
                                                                        >
                                                                            <DialogTitle>
                                                                                Upload Your Attachments
                                                                                <IconButton
                                                                                    onClick={closeOtherDocsPopup}
                                                                                    style={{ float: "right" }}
                                                                                >
                                                                                    <CloseIcon color="primary"></CloseIcon>
                                                                                </IconButton>{" "}
                                                                            </DialogTitle>
                                                                            <DialogContent>
                                                                                <div className="maincon">
                                                                                    {/* Single file input for multiple documents */}
                                                                                    <div
                                                                                        style={{
                                                                                            justifyContent: "space-between",
                                                                                        }}
                                                                                        className="con1 d-flex"
                                                                                    >
                                                                                        <div
                                                                                            style={{ paddingTop: "9px" }}
                                                                                            className="uploadcsv"
                                                                                        >
                                                                                            <label
                                                                                                style={{
                                                                                                    margin: "0px 0px 6px 0px",
                                                                                                }}
                                                                                                htmlFor="attachmentfile"
                                                                                            >
                                                                                                Upload Files
                                                                                            </label>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div
                                                                                        style={{ margin: "5px 0px 0px 0px" }}
                                                                                        className="form-control"
                                                                                    >
                                                                                        <input
                                                                                            type="file"
                                                                                            name="attachmentfile"
                                                                                            id="attachmentfile"
                                                                                            onChange={(e) => {
                                                                                                handleOtherDocsUpload(
                                                                                                    e.target.files
                                                                                                );
                                                                                            }}
                                                                                            multiple // Allow multiple files selection
                                                                                        />
                                                                                        {selectedDocuments &&
                                                                                            selectedDocuments.length > 0 && (
                                                                                                <div className="uploaded-filename-main d-flex flex-wrap">
                                                                                                    {selectedDocuments.map(
                                                                                                        (file, index) => (
                                                                                                            <div
                                                                                                                className="uploaded-fileItem d-flex align-items-center"
                                                                                                                key={index}
                                                                                                            >
                                                                                                                <p className="m-0">
                                                                                                                    {file.name}
                                                                                                                </p>
                                                                                                                <button
                                                                                                                    className="fileItem-dlt-btn"
                                                                                                                    onClick={() =>
                                                                                                                        handleRemoveFile(index)
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
                                                                            </DialogContent>
                                                                            <button
                                                                                className="btn btn-primary"
                                                                                onClick={handleotherdocsAttachment}
                                                                            >
                                                                                Submit
                                                                            </button>
                                                                        </Dialog>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* -----------------------------------------------dialog box for adding services ------------------------------------------------------ */}


            <Dialog open={openServicesPopup} onClose={handleCloseServicesPopup} fullWidth maxWidth="xs">
                <DialogTitle>
                    Select Services To Swap
                    <IconButton onClick={handleCloseServicesPopup} style={{ float: "right" }}>
                        <CloseIcon color="primary"></CloseIcon>
                    </IconButton>{" "}
                </DialogTitle>
                <DialogContent>
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-body">
                                <div className="mb-3">
                                    {serviceNames.length !== 0 ? (serviceNames.map((service, index) => (
                                        <div key={index}>
                                            <input
                                                className="mr-1"
                                                type="checkbox"
                                                id={`service-${index}`}
                                                name={service}
                                                value={service}
                                                //checked={serviceNames.includes(service)}
                                                onChange={() => handleCheckboxChange(service)}
                                            />
                                            <label htmlFor={`service-${index}`}>{service}</label>
                                        </div>
                                    ))) :
                                        (<Nodata />)
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <Button variant="contained" style={{ backgroundColor: "#fbb900" }}
                    onClick={handleSubmitServicesToSwap}
                >
                    Submit
                </Button>
            </Dialog>

            {/* --------------------------------backedrop------------------------- */}
            {openBacdrop && (<Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={openBacdrop}
                onClick={handleCloseBackdrop}>
                <CircularProgress color="inherit" />
            </Backdrop>)}

            {openAllBooking && (
                <RmofCertificationAllBookings
                    setOpenAllBookingPanel={setOpenAllBooking}
                    completeData={completeRedesignedData}
                />
            )}
            {openTrashBoxPanel && (
                <AdminExecutiveTrashBox
                    setOpenTrashBox={setOpenTrashBoxPanel}
                    completeData={completeRedesignedData} />
            )}
        </div>
    )
}

export default AdminExecutiveRecievedBox