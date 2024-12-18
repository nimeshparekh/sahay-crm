import React, { useRef, useState, useEffect } from 'react'
import { debounce } from "lodash";
import { useTheme } from '@mui/material/styles';
import axios from "axios";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Calendar from "@mui/icons-material/Event";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { SingleInputDateRangeField } from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import moment from "moment";
import { StaticDateRangePicker } from "@mui/x-date-pickers-pro/StaticDateRangePicker";
import dayjs from "dayjs";
import { IoClose } from "react-icons/io5";
import Nodata from '../../components/Nodata';
//import { options } from "../components/Options.js";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { BsFilter } from "react-icons/bs";
import { FaFilter } from "react-icons/fa";
import ClipLoader from "react-spinners/ClipLoader";
import confetti from 'canvas-confetti';
import FilterTableThisMonthBooking from './FilterableTableThisMonthBooking';

function EmployeesThisMonthBooking() {
    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const [employeeData, setEmployeeData] = useState([])
    const [employeeDataFilter, setEmployeeDataFilter] = useState([])
    const [employeeInfo, setEmployeeInfo] = useState([])
    const [completeEmployeeInfo, setCompleteEmployeeInfo] = useState([])
    const [monthBookingPerson, setMonthBookingPerson] = useState([])
    const [uniqueBDE, setUniqueBDE] = useState([]);
    const [redesignedData, setRedesignedData] = useState([]);
    const [companyData, setCompanyData] = useState([]);
    const [bookingStartDate, setBookingStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [bookingEndDate, setBookingEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
    const [generalStartDate, setGeneralStartDate] = useState(new Date());
    const [generalEndDate, setGeneralEndDate] = useState(new Date());
    const [searchBookingBde, setSearchBookingBde] = useState("")
    const [bdeResegnedData, setBdeRedesignedData] = useState([])
    const [initialDate, setInitialDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [loading, setLoading] = useState(false)
    const [newSortType, setNewSortType] = useState({
        maturedcase: "none",
        targetamount: "none",
        achievedamount: "none",
        targetratio: "none",
        lastbookingdate: "none",
        totalAmount: "none",
        totalAdvanceAchieved: "none",
        advancePaymentDate: "none",
        remainingTotal: "none",
        remainingRecieved: "none",
        remainingPaymentDate: "none"
    });
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [filteredData, setFilteredData] = useState(employeeData);
    const [filterField, setFilterField] = useState("")
    const filterMenuRef = useRef(null); // Ref for the filter menu container
    const [activeFilterField, setActiveFilterField] = useState(null);
    const [filterPosition, setFilterPosition] = useState({ top: 10, left: 5 });
    const fieldRefs = useRef({});
    const [noOfAvailableData, setnoOfAvailableData] = useState(0)
    const [activeFilterFields, setActiveFilterFields] = useState([]); // New state for active filter fields
    const [completeRedesignedData, setCompleteRedesignedData] = useState([])
    const [redesignedDataFilter, setRedesignedDataFilter] = useState([])



    //-----------------------dateformats-------------------------------------
    function formatDateFinal(timestamp) {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function formatDateMonth(timestamp) {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    //----------------------fetching employee info----------------------------------------
    const fetchEmployeeInfo = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${secretKey}/employee/einfo`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            setEmployeeData(data.filter((employee) => employee.designation === "Sales Executive" || employee.designation === "Sales Manager"));
            setEmployeeDataFilter(data.filter((employee) => employee.designation === "Sales Executive" || employee.designation === "Sales Manager"));
            setEmployeeInfo(data.filter((employee) => employee.designation === "Sales Executive" || employee.designation === "Sales Manager"));
            setCompleteEmployeeInfo(data.filter((employee) => employee.designation === "Sales Executive" || employee.designation === "Sales Manager"));
        } catch (error) {
            console.error('Error Fetching Employee Data ', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (redesignedData.length !== 0) {
            setEmployeeData(employeeDataFilter.sort((a, b) => functionCalculateOnlyAchieved(b.ename) - functionCalculateOnlyAchieved(a.ename)));
        }

    }, [redesignedData])

    const debounceDelay = 300;
    //const debouncedFetchEmployeeInfo = debounce(fetchEmployeeInfo, debounceDelay);

    const uniqueBDEobjects =
        employeeData.length !== 0 &&
        uniqueBDE.size !== 0 &&
        employeeData.filter((obj) => Array.from(uniqueBDE).includes(obj.ename));

    useEffect(() => {
        fetchEmployeeInfo()
        fetchRedesignedBookings()
    }, [])

    //------------------------------fetching redesigned data-------------------------------------------------------------
    const fetchRedesignedBookings = async () => {
        try {
            setLoading(true)
            const response = await axios.get(
                `${secretKey}/bookings/redesigned-final-leadData`
            );
            const bookingsData = response.data;
            setBdeRedesignedData(response.data);

            const getBDEnames = new Set();
            bookingsData.forEach((obj) => {
                // Check if the bdeName is already in the Set

                if (!getBDEnames.has(obj.bdeName)) {
                    // If not, add it to the Set and push the object to the final array
                    getBDEnames.add(obj.bdeName);
                }
            });
            setUniqueBDE(getBDEnames);
            setRedesignedData(bookingsData);
            setCompleteRedesignedData(bookingsData)
            setRedesignedDataFilter(bookingsData)
        } catch (error) {
            console.log("Error Fetching Bookings Data", error);
        } finally {
            setLoading(false)
        }
    };

    // ------------------------------------------------------- Redesigned Total Bookings Functions ------------------------------------------------------------------
    let totalMaturedCount = 0;
    const [MaturedCount, setMaturedCount] = useState(0);
    let totalTargetAmount = 0;
    let totalAchievedAmount = 0;
    const currentYear = initialDate.getFullYear();
    const filteredDate = new Date(bookingStartDate);
    const filteredYear = filteredDate.getFullYear();
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const currentMonth = monthNames[initialDate.getMonth()];
    const filteredMonth = monthNames[filteredDate.getMonth()]




    const functionCalculateGeneralMatured = () => {
        const tempStartDate = new Date(generalStartDate);
        const tempEndDate = new Date(generalEndDate);
        tempStartDate.setHours(0, 0, 0, 0);
        tempEndDate.setHours(0, 0, 0, 0);

        let totalCount = 0;
        redesignedData.map((mainBooking) => {
            let date = new Date(mainBooking.bookingDate);

            date.setHours(0, 0, 0, 0);



            let condition = (tempStartDate <= date && tempEndDate >= date)

            if (condition) {

                totalCount += 1;
            }
            mainBooking.moreBookings.length !== 0 && mainBooking.moreBookings.map((moreObject) => {
                let date = new Date(moreObject.bookingDate);
                date.setHours(0, 0, 0, 0);
                let condition2 = tempStartDate <= date && tempEndDate >= date
                if (condition2) {

                    totalCount += 1;
                }
            })

        })

        return totalCount;
    }
    const functionCalculateGeneralRevenue = () => {
        let totalCount = 0;
        const todayDate = new Date();
        const tempStartDate = new Date(generalStartDate);
        const tempEndDate = new Date(generalEndDate);
        tempStartDate.setHours(0, 0, 0, 0);
        tempEndDate.setHours(0, 0, 0, 0);
        redesignedData.map((mainBooking) => {
            let date = new Date(mainBooking.bookingDate);
            date.setHours(0, 0, 0, 0);
            let condition = tempStartDate <= date && tempEndDate >= date
            if (condition) {
                totalCount += Math.floor(mainBooking.receivedAmount);
            }
            else if (mainBooking.remainingPayments.length !== 0) {
                mainBooking.remainingPayments.map((remainingObj) => {
                    let date2 = new Date(remainingObj.paymentDate);
                    date2.setHours(0, 0, 0, 0);
                    let conditionMore = tempStartDate <= date2 && tempEndDate >= date2
                    if (conditionMore) {
                        totalCount += Math.floor(remainingObj.receivedPayment);
                    }

                })

            }
            mainBooking.moreBookings.length !== 0 && mainBooking.moreBookings.map((moreObject) => {
                let date = new Date(moreObject.bookingDate);
                date.setHours(0, 0, 0, 0);
                let condition2 = tempStartDate <= date && tempEndDate >= date
                if (condition2) {
                    totalCount += Math.floor(moreObject.receivedAmount);
                } else if (moreObject.remainingPayments.length !== 0) {
                    moreObject.remainingPayments.map((remainingObj) => {
                        let date2 = new Date(remainingObj.paymentDate);
                        date2.setHours(0, 0, 0, 0);
                        let conditionMore = tempStartDate <= date2 && tempEndDate >= date2
                        if (conditionMore) {
                            totalCount += Math.floor(remainingObj.receivedPayment);
                        }

                    })

                }
            })

        })

        return totalCount;
    }
    const functionCalculateGeneralRemaining = () => {
        let totalCount = 0;
        const todayDate = new Date();
        const tempStartDate = new Date(generalStartDate);
        const tempEndDate = new Date(generalEndDate);
        tempStartDate.setHours(0, 0, 0, 0);
        tempEndDate.setHours(0, 0, 0, 0);
        redesignedData.map((mainBooking) => {

            if (mainBooking.remainingPayments.length !== 0) {
                mainBooking.remainingPayments.map((remainingObj) => {
                    let date = new Date(remainingObj.paymentDate);
                    date.setHours(0, 0, 0, 0);
                    let condition = tempStartDate <= date && tempEndDate >= date
                    if (condition) {
                        totalCount += Math.floor(remainingObj.receivedPayment);
                    }

                })

            }
            mainBooking.moreBookings.length !== 0 && mainBooking.moreBookings.map((moreObject) => {
                if (moreObject.remainingPayments.length !== 0) {
                    moreObject.remainingPayments.map((remainingObj) => {
                        let date2 = new Date(remainingObj.paymentDate);
                        date2.setHours(0, 0, 0, 0);
                        let conditionMore = tempStartDate <= date2 && tempEndDate >= date2
                        if (conditionMore) {
                            totalCount += Math.floor(remainingObj.receivedPayment);
                        }

                    })

                }
            })

        })

        return totalCount;
    }
    const functionCalculateGeneralAdvanced = () => {
        let totalCount = 0;
        const todayDate = new Date();
        const tempStartDate = new Date(generalStartDate);
        const tempEndDate = new Date(generalEndDate);
        tempStartDate.setHours(0, 0, 0, 0);
        tempEndDate.setHours(0, 0, 0, 0);
        redesignedData.map((mainBooking) => {
            let date = new Date(mainBooking.bookingDate);
            date.setHours(0, 0, 0, 0);

            let condition = tempStartDate <= date && tempEndDate >= date
            if (condition) {
                mainBooking.services.forEach((service) => {
                    if (service.paymentTerms === "Full Advanced") {
                        totalCount += Math.floor(service.totalPaymentWGST);
                    } else {
                        totalCount += Math.floor(service.firstPayment);
                    }
                })
            }

            mainBooking.moreBookings.length !== 0 && mainBooking.moreBookings.map((moreObject) => {
                let date = new Date(moreObject.bookingDate);
                date.setHours(0, 0, 0, 0);
                let condition2 = tempStartDate <= date && tempEndDate >= date
                if (condition2) {
                    moreObject.services.forEach((service) => {
                        if (service.paymentTerms === "Full Advanced") {
                            totalCount += Math.floor(service.totalPaymentWGST);
                        } else {
                            totalCount += Math.floor(service.firstPayment);
                        }
                    })
                }
            })

        })

        return totalCount;
    }




    const functionCalculateMatured = (bdeName) => {
        const cleanString = (str) => {
            return str.replace(/\u00A0/g, ' ').trim();
        };

        let maturedCount = 0;

        redesignedData.map((mainBooking) => {
            const bookingDate = new Date(mainBooking.bookingDate);
            const startDate = new Date(bookingStartDate);
            const endDate = new Date(bookingEndDate);
            bookingDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);

            const isSameDayMonthYear = (date1, date2) => {
                return (
                    date1.getDate() === date2.getDate() &&
                    date1.getMonth() === date2.getMonth() &&
                    date1.getFullYear() === date2.getFullYear()
                );
            };

            if (bookingDate >= startDate && bookingDate <= endDate || (isSameDayMonthYear(bookingDate, startDate) && isSameDayMonthYear(bookingDate, endDate))) {
                if (cleanString(mainBooking.bdeName) === cleanString(bdeName) || cleanString(mainBooking.bdmName) === cleanString(bdeName)) {
                    if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
                        maturedCount = maturedCount + 1;
                    } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
                        maturedCount = maturedCount + 0.5;
                    } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Supported-by") {
                        if (cleanString(mainBooking.bdeName) === cleanString(bdeName)) {
                            maturedCount = maturedCount + 1;
                        }
                    }
                }
            }

            mainBooking.moreBookings.map((moreObject) => {
                const moreBookingDate = new Date(moreObject.bookingDate);
                moreBookingDate.setHours(0, 0, 0, 0);
                if ((moreBookingDate >= startDate && moreBookingDate <= endDate) || (isSameDayMonthYear(moreBookingDate, startDate) && isSameDayMonthYear(moreBookingDate, endDate))) {
                    if (cleanString(moreObject.bdeName) === cleanString(bdeName) || cleanString(moreObject.bdmName) === cleanString(bdeName)) {
                        if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
                            maturedCount = maturedCount + 1;
                        } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
                            maturedCount = maturedCount + 0.5;
                        } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Supported-by") {
                            if (cleanString(moreObject.bdeName) === cleanString(bdeName)) {
                                maturedCount = maturedCount + 1;
                            }
                        }
                    }
                }
            });
        });

        totalMaturedCount = totalMaturedCount + maturedCount;

        return maturedCount;
    };
    const functionOnlyCalculateMatured = (bdeName) => {
        const cleanString = (str) => {
            return str.replace(/\u00A0/g, ' ').trim();
        };

        let maturedCount = 0;

        redesignedData.map((mainBooking) => {
            const bookingDate = new Date(mainBooking.bookingDate);
            const startDate = new Date(bookingStartDate);
            const endDate = new Date(bookingEndDate);
            bookingDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);

            const isSameDayMonthYear = (date1, date2) => {
                return (
                    date1.getDate() === date2.getDate() &&
                    date1.getMonth() === date2.getMonth() &&
                    date1.getFullYear() === date2.getFullYear()
                );
            };

            if (bookingDate >= startDate && bookingDate <= endDate || (isSameDayMonthYear(bookingDate, startDate) && isSameDayMonthYear(bookingDate, endDate))) {
                if (cleanString(mainBooking.bdeName) === cleanString(bdeName) || cleanString(mainBooking.bdmName) === cleanString(bdeName)) {
                    if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
                        maturedCount = maturedCount + 1;
                    } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
                        maturedCount = maturedCount + 0.5;
                    } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Supported-by") {
                        if (cleanString(mainBooking.bdeName) === cleanString(bdeName)) {
                            maturedCount = maturedCount + 1;
                        }
                    }
                }
            }

            mainBooking.moreBookings.map((moreObject) => {
                const moreBookingDate = new Date(moreObject.bookingDate);
                moreBookingDate.setHours(0, 0, 0, 0);
                if ((moreBookingDate >= startDate && moreBookingDate <= endDate) || (isSameDayMonthYear(moreBookingDate, startDate) && isSameDayMonthYear(moreBookingDate, endDate))) {
                    if (cleanString(moreObject.bdeName) === cleanString(bdeName) || cleanString(moreObject.bdmName) === cleanString(bdeName)) {
                        if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
                            maturedCount = maturedCount + 1;
                        } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
                            maturedCount = maturedCount + 0.5;
                        } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Supported-by") {
                            if (cleanString(moreObject.bdeName) === cleanString(bdeName)) {
                                maturedCount = maturedCount + 1;
                            }
                        }
                    }
                }
            });
        });

        return maturedCount;
    };


    // const functionCalculateAchievedAmount = (bdeName) => {
    //     let achievedAmount = 0;
    //     let remainingAmount = 0;
    //     let expanse = 0;
    //     let remainingExpense = 0;
    //     let remainingMoreExpense = 0;
    //     let add_caCommision = 0;


    //     redesignedData.map((mainBooking) => {

    //         const bookingDate = new Date(mainBooking.bookingDate);
    //         const startDate = new Date(bookingStartDate);
    //         const endDate = new Date(bookingEndDate);
    //         bookingDate.setHours(0, 0, 0, 0);
    //         startDate.setHours(0, 0, 0, 0);
    //         endDate.setHours(0, 0, 0, 0);

    //         const isSameDayMonthYear = (date1, date2) => {
    //             return (
    //                 date1.getDate() === date2.getDate() &&
    //                 date1.getMonth() === date2.getMonth() &&
    //                 date1.getFullYear() === date2.getFullYear()
    //             );
    //         };
    //         if (bookingDate >= startDate && bookingDate <= endDate || (isSameDayMonthYear(bookingDate, startDate) && isSameDayMonthYear(bookingDate, endDate))) {
    //             if (mainBooking.bdeName === bdeName || mainBooking.bdmName === bdeName) {

    //                 if (mainBooking.bdeName === mainBooking.bdmName) {
    //                     achievedAmount = achievedAmount + Math.floor(mainBooking.generatedReceivedAmount);
    //                     mainBooking.services.map(serv => {
    //                         // console.log(serv.expanse , bdeName ,"this is services");
    //                         let expanseDate = null
    //                         if (serv.expanse) {
    //                             expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

    //                             expanseDate.setHours(0, 0, 0, 0);
    //                             const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                             expanse = condition ? expanse + serv.expanse : expanse;
    //                         }
    //                     });
    //                     if (mainBooking.caCase === "Yes") {
    //                         add_caCommision += parseInt(mainBooking.caCommission);
    //                     }

    //                 } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
    //                     achievedAmount = achievedAmount + Math.floor(mainBooking.generatedReceivedAmount) / 2;
    //                     mainBooking.services.map(serv => {
    //                         // console.log(serv.expanse , bdeName ,"this is services");
    //                         let expanseDate = null
    //                         if (serv.expanse) {
    //                             expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

    //                             expanseDate.setHours(0, 0, 0, 0);
    //                             const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                             expanse = condition ? expanse + serv.expanse / 2 : expanse;
    //                         }
    //                     });
    //                     if (mainBooking.caCase === "Yes") {
    //                         add_caCommision += parseInt(mainBooking.caCommission) / 2;
    //                     }

    //                 } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
    //                     if (mainBooking.bdeName === bdeName) {
    //                         achievedAmount += Math.floor(mainBooking.generatedReceivedAmount);
    //                         mainBooking.services.map(serv => {
    //                             // console.log(serv.expanse , bdeName ,"this is services");
    //                             let expanseDate;
    //                             if (serv.expanse) {
    //                                 expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

    //                                 expanseDate.setHours(0, 0, 0, 0);
    //                                 const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                                 expanse = condition ? expanse + serv.expanse : expanse;
    //                             }
    //                         });
    //                         if (mainBooking.caCase === "Yes") {
    //                             add_caCommision += parseInt(mainBooking.caCommission);
    //                         }
    //                     }
    //                 }
    //             }

    //         } else if (mainBooking.remainingPayments.length !== 0) {
    //             if (mainBooking.remainingPayments.some(item => new Date(item.paymentDate) >= startDate && new Date(item.paymentDate) <= endDate) && (mainBooking.bdeName === bdeName || mainBooking.bdmName === bdeName)) {
    //                 mainBooking.services.forEach(serv => {
    //                     if (serv.expanseDate && new Date(serv.expanseDate) >= startDate && new Date(serv.expanseDate) <= endDate) {
    //                         if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
    //                             remainingExpense += serv.expanse / 2;
    //                         } else if (mainBooking.bdeName === mainBooking.bdmName) {
    //                             remainingExpense += serv.expanse;
    //                         } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Support-by" && mainBooking.bdemName === bdeName) {
    //                             remainingExpense += serv.expanse;
    //                         }
    //                     }
    //                 });
    //             }

    //             // mainBooking.services.map(serv => {
    //             //     // console.log(serv.expanse , bdeName ,"this is services");
    //             //     let expanseDate;
    //             //     // if (mainBooking["Company Name"] === "DANITUM HEALTHTECH PRIVATE LIMITED") {
    //             //     //     console.log("Ye wali company He:", bdeName, tempAmount)
    //             //     // }
    //             //     if (serv.expanse) {
    //             //         expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
    //             //         expanseDate.setHours(0, 0, 0, 0);
    //             //         const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //             //         if (mainBooking["Company Name"] === "DANITUM HEALTHTECH PRIVATE LIMITED") {
    //             //             console.log("Ye wali compan:", bdeName, serv.expanse, serv.expanseDate, condition)
    //             //         }
    //             //         remainingExpense = condition ? serv.expanse : remainingExpense;
    //             //         console.log(remainingExpense)

    //             //     }
    //             // });
    //             mainBooking.remainingPayments.map((remainingObj) => {
    //                 const moreBookingDate = new Date(remainingObj.paymentDate);

    //                 moreBookingDate.setHours(0, 0, 0, 0);



    //                 if (((moreBookingDate >= startDate && moreBookingDate <= endDate) || (isSameDayMonthYear(moreBookingDate, startDate) && isSameDayMonthYear(moreBookingDate, endDate))) && (mainBooking.bdeName === bdeName || mainBooking.bdmName === bdeName)) {
    //                     const findService = mainBooking.services.find((services) => services.serviceName === remainingObj.serviceName)
    //                     const tempAmount = findService.withGST ? Math.floor(remainingObj.receivedPayment) / 1.18 : Math.floor(remainingObj.receivedPayment);
    //                     if (mainBooking.bdeName === mainBooking.bdmName) {

    //                         remainingAmount += Math.floor(tempAmount);


    //                     } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
    //                         remainingAmount += Math.floor(tempAmount) / 2;
    //                         // mainBooking.services.map(serv => {
    //                         //     // console.log(serv.expanse , bdeName ,"this is services");
    //                         //     let expanseDate = null
    //                         //     if (serv.expanse) {
    //                         //         expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : moreBookingDate;
    //                         //         expanseDate.setHours(0, 0, 0, 0);
    //                         //         const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                         //         remainingExpense = condition ? serv.expanse / 2 : remainingExpense;
    //                         //     }
    //                         // });
    //                     } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
    //                         if (mainBooking.bdeName === bdeName) {
    //                             remainingAmount += Math.floor(tempAmount);
    //                             // mainBooking.services.map(serv => {
    //                             //     // console.log(serv.expanse , bdeName ,"this is services");
    //                             //     let expanseDate = null
    //                             //     if (serv.expanse) {
    //                             //         expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : moreBookingDate;
    //                             //         expanseDate.setHours(0, 0, 0, 0);
    //                             //         const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                             //         remainingExpense = condition ? serv.expanse : remainingExpense;
    //                             //     }
    //                             // });
    //                         }
    //                     }
    //                 }
    //             })
    //         }
    //         mainBooking.moreBookings.length !== 0 && mainBooking.moreBookings.map((moreObject) => {
    //             const moreBookingDate = new Date(moreObject.bookingDate);
    //             moreBookingDate.setHours(0, 0, 0, 0);

    //             if ((moreBookingDate >= startDate && moreBookingDate <= endDate) || (isSameDayMonthYear(moreBookingDate, startDate) && isSameDayMonthYear(moreBookingDate, endDate))) {
    //                 if (moreObject.bdeName === bdeName || moreObject.bdmName === bdeName) {
    //                     if (moreObject.bdeName === moreObject.bdmName) {
    //                         achievedAmount = achievedAmount + Math.floor(moreObject.generatedReceivedAmount);
    //                         moreObject.services.map(serv => {
    //                             // console.log(serv.expanse , bdeName ,"this is services");
    //                             let expanseDate = null
    //                             if (serv.expanse) {
    //                                 expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

    //                                 expanseDate.setHours(0, 0, 0, 0);
    //                                 const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                                 expanse = condition ? expanse + serv.expanse : expanse;
    //                             }
    //                         });
    //                         if (moreObject.caCase === "Yes") {
    //                             add_caCommision += parseInt(moreObject.caCommission);
    //                         }
    //                     } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
    //                         achievedAmount = achievedAmount + Math.floor(moreObject.generatedReceivedAmount) / 2;
    //                         moreObject.services.map(serv => {
    //                             // console.log(serv.expanse , bdeName ,"this is services");
    //                             let expanseDate = null
    //                             if (serv.expanse) {
    //                                 expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

    //                                 expanseDate.setHours(0, 0, 0, 0);
    //                                 const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                                 expanse = condition ? expanse + serv.expanse / 2 : expanse;
    //                             }
    //                         });
    //                         if (moreObject.caCase === "Yes") {
    //                             add_caCommision += parseInt(moreObject.caCommission) / 2;
    //                         }
    //                     } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
    //                         if (moreObject.bdeName === bdeName) {
    //                             achievedAmount += Math.floor(moreObject.generatedReceivedAmount);
    //                             moreObject.services.map(serv => {
    //                                 // console.log(serv.expanse , bdeName ,"this is services");
    //                                 let expanseDate = null
    //                                 if (serv.expanse) {
    //                                     expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

    //                                     expanseDate.setHours(0, 0, 0, 0);
    //                                     const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                                     expanse = condition ? expanse + serv.expanse : expanse;
    //                                 }
    //                             });
    //                             if (moreObject.caCase === "Yes") {
    //                                 add_caCommision += parseInt(moreObject.caCommission);
    //                             }
    //                         }
    //                     }
    //                 }
    //             } else if (moreObject.remainingPayments.length !== 0) {
    //                 if (moreObject.remainingPayments.some(item => new Date(item.paymentDate) >= startDate && new Date(item.paymentDate) <= endDate) && (moreObject.bdeName === bdeName || moreObject.bdmName === bdeName)) {
    //                     moreObject.services.forEach(serv => {
    //                         if (serv.expanseDate && new Date(serv.expanseDate) >= startDate && new Date(serv.expanseDate) <= endDate) {
    //                             if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
    //                                 remainingMoreExpense += serv.expanse / 2;
    //                             } else if (moreObject.bdeName === moreObject.bdmName) {
    //                                 remainingMoreExpense += serv.expanse;
    //                             } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Support-by" && moreObject.bdemName === bdeName) {
    //                                 remainingMoreExpense += serv.expanse;
    //                             }
    //                         }

    //                     });
    //                 }

    //                 moreObject.remainingPayments.map((remainingObj) => {
    //                     const moreRemainingDate = new Date(remainingObj.paymentDate);
    //                     moreRemainingDate.setHours(0, 0, 0, 0);
    //                     if (((moreRemainingDate >= startDate && moreRemainingDate <= endDate) || (isSameDayMonthYear(moreRemainingDate, startDate) && isSameDayMonthYear(moreRemainingDate, endDate))) && (moreObject.bdeName === bdeName || moreObject.bdmName === bdeName)) {

    //                         const findService = moreObject.services.find((services) => services.serviceName === remainingObj.serviceName)
    //                         const tempAmount = findService.withGST ? Math.floor(remainingObj.receivedPayment) / 1.18 : Math.floor(remainingObj.receivedPayment);
    //                         if (moreObject.bdeName === moreObject.bdmName) {
    //                             remainingAmount += Math.floor(tempAmount);

    //                         } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
    //                             remainingAmount += Math.floor(tempAmount) / 2;

    //                         } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
    //                             if (moreObject.bdeName === bdeName) {
    //                                 remainingAmount += Math.floor(tempAmount);
    //                             }
    //                         }
    //                     }
    //                 })
    //             }
    //         })

    //     })


    //     expanse = expanse + remainingExpense + remainingMoreExpense + add_caCommision;
    //     totalAchievedAmount = totalAchievedAmount + achievedAmount + Math.floor(remainingAmount) - expanse;
    //     console.log("totalAchivedAmount", totalAchievedAmount)
    //     return achievedAmount + Math.floor(remainingAmount) - expanse;
    // };
    // const functionCalculateOnlyAchieved = (bdeName) => {
    //     let achievedAmount = 0;
    //     let remainingAmount = 0;
    //     let expanse = 0;
    //     let remainingExpense = 0;
    //     let remainingMoreExpense = 0;
    //     let add_caCommision = 0;

    //     redesignedData.map((mainBooking) => {
    //         const bookingDate = new Date(mainBooking.bookingDate);
    //         const startDate = new Date(bookingStartDate);
    //         const endDate = new Date(bookingEndDate);
    //         bookingDate.setHours(0, 0, 0, 0);
    //         startDate.setHours(0, 0, 0, 0);
    //         endDate.setHours(0, 0, 0, 0);
    //         const isSameDayMonthYear = (date1, date2) => {
    //             return (
    //                 date1.getDate() === date2.getDate() &&
    //                 date1.getMonth() === date2.getMonth() &&
    //                 date1.getFullYear() === date2.getFullYear()
    //             );
    //         };
    //         if (bookingDate >= startDate && bookingDate <= endDate || (isSameDayMonthYear(bookingDate, startDate) && isSameDayMonthYear(bookingDate, endDate))) {
    //             if (mainBooking.bdeName === bdeName || mainBooking.bdmName === bdeName) {
    //                 if (mainBooking.bdeName === mainBooking.bdmName) {
    //                     achievedAmount = achievedAmount + Math.floor(mainBooking.generatedReceivedAmount);
    //                     mainBooking.services.map(serv => {
    //                         // console.log(serv.expanse , bdeName ,"this is services");
    //                         let expanseDate = null
    //                         if (serv.expanse) {
    //                             expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
    //                             expanseDate.setHours(0, 0, 0, 0);
    //                             const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                             expanse = condition ? expanse + serv.expanse : expanse;
    //                         }
    //                     });
    //                     if (mainBooking.caCase === "Yes") {
    //                         add_caCommision += parseInt(mainBooking.caCommission);
    //                     }

    //                 } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
    //                     achievedAmount = achievedAmount + Math.floor(mainBooking.generatedReceivedAmount) / 2;
    //                     mainBooking.services.map(serv => {
    //                         // console.log(serv.expanse , bdeName ,"this is services");
    //                         let expanseDate = null
    //                         if (serv.expanse) {
    //                             expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

    //                             expanseDate.setHours(0, 0, 0, 0);
    //                             const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                             expanse = condition ? expanse + serv.expanse / 2 : expanse;
    //                         }
    //                     });
    //                     if (mainBooking.caCase === "Yes") {
    //                         add_caCommision += parseInt(mainBooking.caCommission) / 2;
    //                     }

    //                 } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
    //                     if (mainBooking.bdeName === bdeName) {
    //                         achievedAmount += Math.floor(mainBooking.generatedReceivedAmount);
    //                         mainBooking.services.map(serv => {
    //                             // console.log(serv.expanse , bdeName ,"this is services");
    //                             let expanseDate;
    //                             if (serv.expanse) {
    //                                 expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

    //                                 expanseDate.setHours(0, 0, 0, 0);
    //                                 const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                                 expanse = condition ? expanse + serv.expanse : expanse;
    //                             }
    //                         });
    //                         if (mainBooking.caCase === "Yes") {
    //                             add_caCommision += parseInt(mainBooking.caCommission);
    //                         }

    //                     }
    //                 }
    //             }

    //         } else if (mainBooking.remainingPayments.length !== 0) {
    //             if (mainBooking.remainingPayments.some(item => new Date(item.paymentDate) >= startDate && new Date(item.paymentDate) <= endDate) && (mainBooking.bdeName === bdeName || mainBooking.bdmName === bdeName)) {
    //                 mainBooking.services.forEach(serv => {
    //                     if (serv.expanseDate && new Date(serv.expanseDate) >= startDate && new Date(serv.expanseDate) <= endDate) {
    //                         if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
    //                             remainingExpense += serv.expanse / 2;
    //                         } else if (mainBooking.bdeName === mainBooking.bdmName) {
    //                             remainingExpense += serv.expanse;
    //                         } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Support-by" && mainBooking.bdemName === bdeName) {
    //                             remainingExpense += serv.expanse;
    //                         }
    //                     }
    //                 });
    //             }
    //             // mainBooking.services.map(serv => {
    //             //     // console.log(serv.expanse , bdeName ,"this is services");
    //             //     let expanseDate;
    //             //     // if (mainBooking["Company Name"] === "DANITUM HEALTHTECH PRIVATE LIMITED") {
    //             //     //     console.log("Ye wali company He:", bdeName, tempAmount)
    //             //     // }
    //             //     if (serv.expanse) {
    //             //         expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
    //             //         expanseDate.setHours(0, 0, 0, 0);
    //             //         const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //             //         if (mainBooking["Company Name"] === "DANITUM HEALTHTECH PRIVATE LIMITED") {
    //             //             console.log("Ye wali compan:", bdeName, serv.expanse, serv.expanseDate, condition)
    //             //         }
    //             //         remainingExpense = condition ? serv.expanse : remainingExpense;
    //             //         console.log(remainingExpense)

    //             //     }
    //             // });
    //             mainBooking.remainingPayments.map((remainingObj) => {
    //                 const moreBookingDate = new Date(remainingObj.paymentDate);

    //                 moreBookingDate.setHours(0, 0, 0, 0);



    //                 if (((moreBookingDate >= startDate && moreBookingDate <= endDate) || (isSameDayMonthYear(moreBookingDate, startDate) && isSameDayMonthYear(moreBookingDate, endDate))) && (mainBooking.bdeName === bdeName || mainBooking.bdmName === bdeName)) {
    //                     const findService = mainBooking.services.find((services) => services.serviceName === remainingObj.serviceName)
    //                     const tempAmount = findService.withGST ? Math.floor(remainingObj.receivedPayment) / 1.18 : Math.floor(remainingObj.receivedPayment);
    //                     if (mainBooking.bdeName === mainBooking.bdmName) {

    //                         remainingAmount += Math.floor(tempAmount);


    //                     } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
    //                         remainingAmount += Math.floor(tempAmount) / 2;
    //                         // mainBooking.services.map(serv => {
    //                         //     // console.log(serv.expanse , bdeName ,"this is services");
    //                         //     let expanseDate = null
    //                         //     if (serv.expanse) {
    //                         //         expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : moreBookingDate;
    //                         //         expanseDate.setHours(0, 0, 0, 0);
    //                         //         const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                         //         remainingExpense = condition ? serv.expanse / 2 : remainingExpense;
    //                         //     }
    //                         // });
    //                     } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
    //                         if (mainBooking.bdeName === bdeName) {
    //                             remainingAmount += Math.floor(tempAmount);
    //                             // mainBooking.services.map(serv => {
    //                             //     // console.log(serv.expanse , bdeName ,"this is services");
    //                             //     let expanseDate = null
    //                             //     if (serv.expanse) {
    //                             //         expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : moreBookingDate;
    //                             //         expanseDate.setHours(0, 0, 0, 0);
    //                             //         const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                             //         remainingExpense = condition ? serv.expanse : remainingExpense;
    //                             //     }
    //                             // });
    //                         }
    //                     }
    //                 }
    //             })
    //         }
    //         mainBooking.moreBookings.length !== 0 && mainBooking.moreBookings.map((moreObject) => {
    //             const moreBookingDate = new Date(moreObject.bookingDate);
    //             moreBookingDate.setHours(0, 0, 0, 0);

    //             if ((moreBookingDate >= startDate && moreBookingDate <= endDate) || (isSameDayMonthYear(moreBookingDate, startDate) && isSameDayMonthYear(moreBookingDate, endDate))) {
    //                 if (moreObject.bdeName === bdeName || moreObject.bdmName === bdeName) {
    //                     if (moreObject.bdeName === moreObject.bdmName) {
    //                         achievedAmount = achievedAmount + Math.floor(moreObject.generatedReceivedAmount);
    //                         moreObject.services.map(serv => {
    //                             // console.log(serv.expanse , bdeName ,"this is services");
    //                             let expanseDate = null
    //                             if (serv.expanse) {
    //                                 expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

    //                                 expanseDate.setHours(0, 0, 0, 0);
    //                                 const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                                 expanse = condition ? expanse + serv.expanse : expanse;
    //                             }
    //                         });
    //                         if (moreObject.caCase === "Yes") {
    //                             add_caCommision += parseInt(moreObject.caCommission);
    //                         }
    //                     } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
    //                         achievedAmount = achievedAmount + Math.floor(moreObject.generatedReceivedAmount) / 2;
    //                         moreObject.services.map(serv => {
    //                             // console.log(serv.expanse , bdeName ,"this is services");
    //                             let expanseDate = null
    //                             if (serv.expanse) {
    //                                 expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

    //                                 expanseDate.setHours(0, 0, 0, 0);
    //                                 const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                                 expanse = condition ? expanse + serv.expanse / 2 : expanse;
    //                             }
    //                         });
    //                         if (moreObject.caCase === "Yes") {
    //                             add_caCommision += parseInt(moreObject.caCommission) / 2;
    //                         }
    //                     } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
    //                         if (moreObject.bdeName === bdeName) {
    //                             achievedAmount += Math.floor(moreObject.generatedReceivedAmount);
    //                             moreObject.services.map(serv => {
    //                                 // console.log(serv.expanse , bdeName ,"this is services");
    //                                 let expanseDate = null
    //                                 if (serv.expanse) {
    //                                     expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

    //                                     expanseDate.setHours(0, 0, 0, 0);
    //                                     const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                                     expanse = condition ? expanse + serv.expanse : expanse;
    //                                 }
    //                             });
    //                             if (moreObject.caCase === "Yes") {
    //                                 add_caCommision += parseInt(moreObject.caCommission);
    //                             }
    //                         }
    //                     }
    //                 }
    //             } else if (moreObject.remainingPayments.length !== 0) {
    //                 if (moreObject.remainingPayments.some(item => new Date(item.paymentDate) >= startDate && new Date(item.paymentDate) <= endDate) && (moreObject.bdeName === bdeName || moreObject.bdmName === bdeName)) {
    //                     moreObject.services.forEach(serv => {
    //                         if (serv.expanseDate && new Date(serv.expanseDate) >= startDate && new Date(serv.expanseDate) <= endDate) {
    //                             if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
    //                                 remainingMoreExpense += serv.expanse / 2;
    //                             } else if (moreObject.bdeName === moreObject.bdmName) {
    //                                 remainingMoreExpense += serv.expanse;
    //                             } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Support-by" && moreObject.bdemName === bdeName) {
    //                                 remainingMoreExpense += serv.expanse;
    //                             }
    //                         }

    //                     });
    //                 }

    //                 moreObject.remainingPayments.map((remainingObj) => {
    //                     const moreRemainingDate = new Date(remainingObj.paymentDate);
    //                     moreRemainingDate.setHours(0, 0, 0, 0);
    //                     if (((moreRemainingDate >= startDate && moreRemainingDate <= endDate) || (isSameDayMonthYear(moreRemainingDate, startDate) && isSameDayMonthYear(moreRemainingDate, endDate))) && (moreObject.bdeName === bdeName || moreObject.bdmName === bdeName)) {

    //                         const findService = moreObject.services.find((services) => services.serviceName === remainingObj.serviceName)
    //                         const tempAmount = findService.withGST ? Math.floor(remainingObj.receivedPayment) / 1.18 : Math.floor(remainingObj.receivedPayment);
    //                         if (moreObject.bdeName === moreObject.bdmName) {
    //                             remainingAmount += Math.floor(tempAmount);
    //                             // moreObject.services.map(serv => {
    //                             //     // console.log(serv.expanse , bdeName ,"this is services");
    //                             //     let expanseDate = null
    //                             //     if (serv.expanse) {
    //                             //         expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : moreRemainingDate;
    //                             //         expanseDate.setHours(0, 0, 0, 0);
    //                             //         const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                             //         remainingMoreExpense = condition ? serv.expanse : remainingMoreExpense;
    //                             //     }
    //                             // });
    //                         } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
    //                             remainingAmount += Math.floor(tempAmount) / 2;
    //                             // moreObject.services.map(serv => {
    //                             //     // console.log(serv.expanse , bdeName ,"this is services");
    //                             //     let expanseDate = null
    //                             //     if (serv.expanse) {
    //                             //         expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : moreRemainingDate;
    //                             //         expanseDate.setHours(0, 0, 0, 0);
    //                             //         const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                             //         remainingMoreExpense = condition ? serv.expanse / 2 : remainingMoreExpense;
    //                             //     }
    //                             // });
    //                         } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
    //                             if (moreObject.bdeName === bdeName) {
    //                                 remainingAmount += Math.floor(tempAmount);
    //                                 // moreObject.services.map(serv => {
    //                                 //     // console.log(serv.expanse , bdeName ,"this is services");
    //                                 //     let expanseDate = null
    //                                 //     if (serv.expanse) {
    //                                 //         expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : moreRemainingDate;
    //                                 //         expanseDate.setHours(0, 0, 0, 0);
    //                                 //         const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
    //                                 //         remainingMoreExpense = condition ? serv.expanse : remainingMoreExpense;
    //                                 //     }
    //                                 // });
    //                             }
    //                         }
    //                     }
    //                 })
    //             }
    //         })

    //     })

    //     expanse = expanse + remainingExpense + remainingMoreExpense + add_caCommision;
    //     return achievedAmount + Math.floor(remainingAmount) - expanse;
    // }
    const functionCalculateAchievedAmount = (bdeName) => {
        let achievedAmount = 0;
        let remainingAmount = 0;
        let expanse = 0;
        let remainingExpense = 0;
        let remainingMoreExpense = 0;
        let add_caCommision = 0;
        const cleanString = (str) => (str ? str.replace(/\s+/g, '').toLowerCase() : '');

        redesignedData.map((mainBooking) => {

            const bookingDate = new Date(mainBooking.bookingDate);
            const startDate = new Date(bookingStartDate);
            const endDate = new Date(bookingEndDate);
            bookingDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            const isSameDayMonthYear = (date1, date2) => {
                return (
                    date1.getDate() === date2.getDate() &&
                    date1.getMonth() === date2.getMonth() &&
                    date1.getFullYear() === date2.getFullYear()
                );
            };
            if (bookingDate >= startDate && bookingDate <= endDate || (isSameDayMonthYear(bookingDate, startDate) && isSameDayMonthYear(bookingDate, endDate))) {
                if (cleanString(mainBooking.bdeName) === cleanString(bdeName) || cleanString(mainBooking.bdmName) === cleanString(bdeName)) {
                    //console.log("Ye add hone ja raha :" ,bdeName, Math.floor(mainBooking.generatedReceivedAmount)/2 )
                    if (mainBooking.bdeName === mainBooking.bdmName) {
                        //achievedAmount = achievedAmount + Math.floor(mainBooking.generatedReceivedAmount);
                        mainBooking.services.map(serv => {
                            if (serv.paymentTerms === "Full Advanced") {
                                achievedAmount = achievedAmount + serv.totalPaymentWOGST;
                                console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, serv.totalPaymentWOGST, achievedAmount)

                            } else {
                                if (serv.withGST) {
                                    achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18);
                                    console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, Math.round(serv.firstPayment), achievedAmount)

                                } else {
                                    achievedAmount = achievedAmount + Math.round(serv.firstPayment);
                                    console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, Math.round(serv.firstPayment), achievedAmount)

                                }
                            }

                            // console.log(serv.expanse , bdeName ,"this is services");
                            let expanseDate = null
                            if (serv.expanse) {
                                //console.log("Ye add hone ja raha expanse :", mainBooking['Company Name'], bdeName, serv.expanse)
                                expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

                                expanseDate.setHours(0, 0, 0, 0);
                                const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                expanse = condition ? expanse + serv.expanse : expanse;
                            }
                        });
                        if (mainBooking.caCase === "Yes") {
                            console.log("Ye add hone ja raha commision :", mainBooking['Company Name'], bdeName, mainBooking.caCommission)
                            add_caCommision += parseInt(mainBooking.caCommission);
                        }


                    } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
                        //console.log("Ye add hone ja raha :" ,bdeName, Math.floor(mainBooking.generatedReceivedAmount)/2 )
                        //achievedAmount = achievedAmount + Math.floor(mainBooking.generatedReceivedAmount) / 2;
                        mainBooking.services.map(serv => {
                            if (serv.paymentTerms === "Full Advanced") {
                                achievedAmount = achievedAmount + serv.totalPaymentWOGST / 2;
                                console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, serv.totalPaymentWOGST , achievedAmount)

                            } else {
                                if (serv.withGST) {

                                    achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18) / 2;
                                    console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, Math.round(serv.firstPayment) , achievedAmount)

                                } else {
                                    achievedAmount = achievedAmount + Math.round(serv.firstPayment) / 2;
                                    console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, Math.round(serv.firstPayment),achievedAmount)

                                }
                            }
                            // console.log(serv.expanse , bdeName ,"this is services");
                            let expanseDate = null
                            if (serv.expanse) {
                                //console.log("Ye add hone ja raha expanse :", mainBooking['Company Name'], bdeName, serv.expanse)

                                expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

                                expanseDate.setHours(0, 0, 0, 0);
                                const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                expanse = condition ? expanse + serv.expanse / 2 : expanse;
                            }
                        });
                        if (mainBooking.caCase === "Yes") {
                            //console.log("Ye add hone ja raha commision :", mainBooking['Company Name'], bdeName, mainBooking.caCommission)

                            add_caCommision += parseInt(mainBooking.caCommission) / 2;
                        }

                    } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Supported-by") {
                        if (mainBooking.bdeName === bdeName) {
                            //console.log("Ye add hone ja raha :" ,mainBooking["Company Name"] ,  bdeName , Math.floor(mainBooking.generatedReceivedAmount) )
                            //achievedAmount += Math.floor(mainBooking.generatedReceivedAmount);
                            mainBooking.services.map(serv => {
                                if (serv.paymentTerms === "Full Advanced") {
                                    achievedAmount = achievedAmount + serv.totalPaymentWOGST;
                                    console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, serv.totalPaymentWOGST , achievedAmount)

                                } else {
                                    if (serv.withGST === undefined || serv.withGST === true) {
                                        achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18);
                                        console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, Math.round(serv.firstPayment) , achievedAmount)

                                    } else {
                                        achievedAmount = achievedAmount + Math.round(serv.firstPayment);
                                        console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, Math.round(serv.firstPayment) , achievedAmount)

                                    }
                                }
                                //console.log(serv.expanse , bdeName ,"this is services");
                                let expanseDate;
                                if (serv.expanse) {
                                    //console.log("Ye add hone ja raha expanse :", mainBooking['Company Name'], bdeName, serv.expanse)
                                    expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
                                    expanseDate.setHours(0, 0, 0, 0);
                                    const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                    expanse = condition ? expanse + serv.expanse : expanse;
                                }
                            });
                            if (mainBooking.caCase === "Yes") {
                                //console.log("Ye add hone ja raha commision :", mainBooking['Company Name'], bdeName, mainBooking.caCommission)
                                add_caCommision += parseInt(mainBooking.caCommission);
                            }
                        }
                    }
                }

            }
            if (mainBooking.remainingPayments.length !== 0) {
                mainBooking.remainingPayments.map((remainingObj) => {
                    const remainingPaymentDate = new Date(remainingObj.paymentDate);
                    remainingPaymentDate.setHours(0, 0, 0, 0);
                    if (((remainingPaymentDate >= startDate && remainingPaymentDate <= endDate) || (isSameDayMonthYear(remainingPaymentDate, startDate) && isSameDayMonthYear(remainingPaymentDate, endDate))) && (mainBooking.bdeName === bdeName || mainBooking.bdmName === bdeName) && (new Date(remainingObj.paymentDate).getMonth() !== new Date(mainBooking.bookingDate).getMonth() && new Date(remainingObj.paymentDate).getFullYear() !== new Date(mainBooking.bookingDate).getFullYear())) {
                        mainBooking.services.forEach(serv => {
                            if (serv.expanseDate && new Date(serv.expanseDate) >= startDate && new Date(serv.expanseDate) <= endDate) {
                                if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
                                    remainingExpense += serv.expanse / 2;
                                } else if (mainBooking.bdeName === mainBooking.bdmName) {
                                    remainingExpense += serv.expanse;
                                } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by" && mainBooking.bdeName === bdeName) {
                                    remainingExpense += serv.expanse;
                                }
                            }
                        });
                    }
                });
                mainBooking.remainingPayments.map((remainingObj) => {
                    const moreBookingDate = new Date(remainingObj.paymentDate);
                    moreBookingDate.setHours(0, 0, 0, 0);
                    if (((moreBookingDate >= startDate && moreBookingDate <= endDate) || (isSameDayMonthYear(moreBookingDate, startDate) && isSameDayMonthYear(moreBookingDate, endDate))) && (mainBooking.bdeName === bdeName || mainBooking.bdmName === bdeName)) {
                        const findService = mainBooking.services.find((services) => services.serviceName === remainingObj.serviceName);
                        if (findService) { // Check if findService is defined
                            console.log("findService1", findService, mainBooking["Company Name"])
                            const tempAmount = findService.withGST ? Math.floor(remainingObj.receivedPayment) / 1.18 : Math.floor(remainingObj.receivedPayment);
                            //console.log("yahan add ho rha remianing amount", mainBooking["Company Name"], tempAmount)
                            if (mainBooking.bdeName === mainBooking.bdmName) {
                                remainingAmount += Math.floor(tempAmount);
                            } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
                                remainingAmount += Math.floor(tempAmount) / 2;
                            } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
                                if (mainBooking.bdeName === bdeName) {
                                    remainingAmount += Math.floor(tempAmount);
                                }
                            }
                        } else {
                            console.warn(`Service with name ${remainingObj.serviceName} not found for booking ${mainBooking["Company Name"]}`);
                        }
                    }
                })
            }
            mainBooking.moreBookings.length !== 0 && mainBooking.moreBookings.map((moreObject) => {
                const moreBookingDate = new Date(moreObject.bookingDate);
                moreBookingDate.setHours(0, 0, 0, 0);
                if ((moreBookingDate >= startDate && moreBookingDate <= endDate) || (isSameDayMonthYear(moreBookingDate, startDate) && isSameDayMonthYear(moreBookingDate, endDate))) {
                    if (cleanString(moreObject.bdeName) === cleanString(bdeName) || cleanString(moreObject.bdmName) === cleanString(bdeName)) {
                        if (moreObject.bdeName === moreObject.bdmName) {
                            //console.log("Ye add hone ja raha more booking:",mainBooking["Company Name"], bdeName , Math.floor(moreObject.generatedReceivedAmount) )
                            //achievedAmount = achievedAmount + Math.floor(moreObject.generatedReceivedAmount);
                            moreObject.services.map(serv => {
                                //console.log(serv.expanse , bdeName ,"this is services",mainBooking["Company Name"]);
                                if (serv.paymentTerms === "Full Advanced") {
                                    achievedAmount = achievedAmount + serv.totalPaymentWOGST;
                                    console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, serv.totalPaymentWOGST , achievedAmount)

                                } else {

                                    if (serv.withGST) {
                                        // console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, Math.round(serv.firstPayment))

                                        achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18);
                                      console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, Math.round(serv.firstPayment) , achievedAmount)

                                    } else {
                                        achievedAmount = achievedAmount + Math.round(serv.firstPayment);
                                    console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, Math.round(serv.firstPayment) , achievedAmount)

                                    }
                                }
                                let expanseDate = null
                                if (serv.expanse) {
                                    //console.log("Ye add hone ja raha expanse :", mainBooking['Company Name'], bdeName, serv.expanse)
                                    expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
                                    expanseDate.setHours(0, 0, 0, 0);
                                    const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                    expanse = condition ? expanse + serv.expanse : expanse;
                                    //console.log("Ye add hone ja raha expanse :", mainBooking['Company Name'] ,bdeName ,serv.expanse )

                                }
                            });
                            if (moreObject.caCase === "Yes") {
                                add_caCommision += parseInt(moreObject.caCommission);
                            }
                        } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
                            //console.log("Ye add hone ja raha :", bdeName, Math.floor(moreObject.generatedReceivedAmount) / 2)
                            //achievedAmount = achievedAmount + Math.floor(moreObject.generatedReceivedAmount) / 2;
                            moreObject.services.map(serv => {
                                if (serv.paymentTerms === "Full Advanced") {

                                    achievedAmount = achievedAmount + serv.totalPaymentWOGST / 2;
                                    console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, serv.totalPaymentWOGST , achievedAmount)

                                } else {
                                    if (serv.withGST) {

                                        achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18) / 2;
                                        console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, Math.round(serv.firstPayment) , achievedAmount)

                                    } else {
                                        achievedAmount = achievedAmount + Math.round(serv.firstPayment) / 2;
                                        console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, Math.round(serv.firstPayment) , achievedAmount)

                                    }
                                }
                                console.log(serv.expanse, bdeName, "this is services");
                                let expanseDate = null
                                if (serv.expanse) {
                                    //console.log("Ye add hone ja raha expanse :", mainBooking['Company Name'], bdeName, serv.expanse)

                                    expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

                                    expanseDate.setHours(0, 0, 0, 0);
                                    const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                    expanse = condition ? expanse + serv.expanse / 2 : expanse;
                                }
                            });
                            if (moreObject.caCase === "Yes") {
                                //console.log("Ye add hone ja raha commision :", mainBooking['Company Name'], bdeName, mainBooking.caCommission)

                                add_caCommision += parseInt(moreObject.caCommission) / 2;
                            }
                        } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Supported-by") {
                            if (cleanString(moreObject.bdeName) === cleanString(bdeName)) {
                                // console.log("Ye add hone ja raha :", bdeName, Math.floor(moreObject.generatedReceivedAmount))
                                //achievedAmount += Math.floor(moreObject.generatedReceivedAmount);
                                moreObject.services.map(serv => {
                                    if (serv.paymentTerms === "Full Advanced") {
                                        achievedAmount = achievedAmount + serv.totalPaymentWOGST;
                                        console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, serv.totalPaymentWOGST , achievedAmount)

                                    } else {
                                        if (serv.withGST) {

                                            achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18);
                                            console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, Math.round(serv.firstPayment) , achievedAmount)

                                        } else {
                                            achievedAmount = achievedAmount + Math.round(serv.firstPayment);
                                            console.log("Ye add hone ja raha :", mainBooking['Company Name'], bdeName, Math.round(serv.firstPayment) , achievedAmount)

                                        }
                                    }
                                    //console.log(serv.expanse , bdeName ,"this is services");
                                    let expanseDate = null
                                    if (serv.expanse) {
                                        //console.log("Ye add hone ja raha expanse :", mainBooking['Company Name'], bdeName, serv.expanse)

                                        expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

                                        expanseDate.setHours(0, 0, 0, 0);
                                        const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                        expanse = condition ? expanse + serv.expanse : expanse;
                                    }
                                });
                                if (moreObject.caCase === "Yes") {
                                    //console.log("Ye add hone ja raha commision :", mainBooking['Company Name'], bdeName, mainBooking.caCommission)

                                    add_caCommision += parseInt(moreObject.caCommission);
                                }
                            }
                        }
                    }
                }
                if (moreObject.remainingPayments.length !== 0) {
                    moreObject.remainingPayments.forEach(item => {
                        if (new Date(item.paymentDate) >= startDate && new Date(item.paymentDate) <= endDate && (moreObject.bdeName === bdeName || moreObject.bdmName === bdeName)) {
                            moreObject.services.forEach(serv => {
                                if (serv.expanseDate && new Date(serv.expanseDate) >= startDate && new Date(serv.expanseDate) <= endDate && (new Date(item.paymentDate).getMonth() !== new Date(moreObject.bookingDate).getMonth() && new Date(item.paymentDate).getFullYear() !== new Date(moreObject.bookingDate).getFullYear())) {
                                    if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
                                        remainingExpense += serv.expanse / 2;
                                    } else if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
                                        remainingExpense += serv.expanse;
                                    } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Supported-by" && moreObject.bdemName === bdeName) {
                                        remainingExpense += serv.expanse;
                                    }
                                }
                            });
                        }
                    });
                    moreObject.remainingPayments.map((remainingObj) => {
                        const moreRemainingDate = new Date(remainingObj.paymentDate);
                        moreRemainingDate.setHours(0, 0, 0, 0);
                        if (((moreRemainingDate >= startDate && moreRemainingDate <= endDate) || (isSameDayMonthYear(moreRemainingDate, startDate) && isSameDayMonthYear(moreRemainingDate, endDate))) && (moreObject.bdeName === bdeName || moreObject.bdmName === bdeName)) {
                            const findService = moreObject.services.find((services) => services.serviceName === remainingObj.serviceName)
                            console.log("findService2", findService, mainBooking["Company Name"])
                            if (findService) {
                                const tempAmount = findService.withGST ? Math.floor(remainingObj.receivedPayment) / 1.18 : Math.floor(remainingObj.receivedPayment);
                                // console.log("yahan add ho rha remianing amount more booking", mainBooking["Company Name"], tempAmount)
                                if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
                                    remainingAmount += Math.floor(tempAmount);
                                    //console.log("yahan add ho rha remianing amount more booking", mainBooking["Company Name"], remainingAmount)

                                } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
                                    remainingAmount += Math.floor(tempAmount) / 2;
                                   // console.log("yahan add ho rha remianing amount more booking", mainBooking["Company Name"], remainingAmount)

                                } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Supported-by") {
                                    if (cleanString(moreObject.bdeName) === cleanString(bdeName)) {
                                        remainingAmount += Math.floor(tempAmount);
                                    }
                                }
                            } else {
                                console.warn(`Service with name ${remainingObj.serviceName} not found for booking ${mainBooking["Company Name"]}`);
                            }

                        }
                    })
                }
            })
        });
        const currentDate = new Date();

        const finalexpanse = expanse + remainingExpense + remainingMoreExpense + add_caCommision;
        totalAchievedAmount = totalAchievedAmount + achievedAmount + Math.floor(remainingAmount) - finalexpanse;
        const consoleAchievedAmount = achievedAmount + Math.floor(remainingAmount) - finalexpanse
        console.log("BDE :", bdeName, achievedAmount, remainingAmount, expanse, remainingExpense, remainingMoreExpense, add_caCommision)
        //console.log("check krna", bdeName, achievedAmount, Math.floor(remainingAmount), finalexpanse , totalAchievedAmount)
        return consoleAchievedAmount;
    };

    const functionCalculateOnlyAchieved = (bdeName) => {
        let achievedAmount = 0;
        let remainingAmount = 0;
        let expanse = 0;
        let remainingExpense = 0;
        let remainingMoreExpense = 0;
        let add_caCommision = 0;
        const cleanString = (str) => (str ? str.replace(/\s+/g, '').toLowerCase() : '');
        redesignedData.map((mainBooking) => {
            const bookingDate = new Date(mainBooking.bookingDate);
            const startDate = new Date(bookingStartDate);
            const endDate = new Date(bookingEndDate);
            bookingDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            const isSameDayMonthYear = (date1, date2) => {
                return (
                    date1.getDate() === date2.getDate() &&
                    date1.getMonth() === date2.getMonth() &&
                    date1.getFullYear() === date2.getFullYear()
                );
            };
            if (bookingDate >= startDate && bookingDate <= endDate || (isSameDayMonthYear(bookingDate, startDate) && isSameDayMonthYear(bookingDate, endDate))) {
                if (cleanString(mainBooking.bdeName) === cleanString(bdeName) || cleanString(mainBooking.bdmName) === cleanString(bdeName)) {
                    if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
                        //achievedAmount = achievedAmount + Math.floor(mainBooking.generatedReceivedAmount);
                        mainBooking.services.map(serv => {
                            // console.log(serv.expanse , bdeName ,"this is services");
                            if (serv.paymentTerms === "Full Advanced") {
                                achievedAmount = achievedAmount + serv.totalPaymentWOGST;
                            } else {
                                if (serv.withGST) {
                                    achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18);
                                } else {
                                    achievedAmount = achievedAmount + Math.round(serv.firstPayment);
                                }
                            }
                            let expanseDate = null
                            if (serv.expanse) {
                                expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
                                expanseDate.setHours(0, 0, 0, 0);
                                const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                expanse = condition ? expanse + serv.expanse : expanse;
                            }
                        });
                        if (mainBooking.caCase === "Yes") {
                            add_caCommision += parseInt(mainBooking.caCommission);
                        }

                    } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
                        //achievedAmount = achievedAmount + Math.floor(mainBooking.generatedReceivedAmount) / 2;
                        mainBooking.services.map(serv => {
                            // console.log(serv.expanse , bdeName ,"this is services");
                            if (serv.paymentTerms === "Full Advanced") {
                                achievedAmount = achievedAmount + serv.totalPaymentWOGST / 2;
                            } else {
                                if (serv.withGST) {
                                    achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18) / 2;
                                } else {
                                    achievedAmount = achievedAmount + Math.round(serv.firstPayment) / 2;
                                }
                            }
                            let expanseDate = null
                            if (serv.expanse) {
                                expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

                                expanseDate.setHours(0, 0, 0, 0);
                                const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                expanse = condition ? expanse + serv.expanse / 2 : expanse;
                            }
                        });
                        if (mainBooking.caCase === "Yes") {
                            add_caCommision += parseInt(mainBooking.caCommission) / 2;
                        }

                    } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Supported-by") {
                        if (cleanString(mainBooking.bdeName) === cleanString(bdeName)) {
                            //achievedAmount += Math.floor(mainBooking.generatedReceivedAmount);
                            mainBooking.services.map(serv => {
                                // console.log(serv.expanse , bdeName ,"this is services");
                                if (serv.paymentTerms === "Full Advanced") {
                                    achievedAmount = achievedAmount + serv.totalPaymentWOGST;
                                } else {
                                    if (serv.withGST) {
                                        achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18);
                                    } else {
                                        achievedAmount = achievedAmount + Math.round(serv.firstPayment);
                                    }
                                }
                                let expanseDate;
                                if (serv.expanse) {
                                    expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

                                    expanseDate.setHours(0, 0, 0, 0);
                                    const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                    expanse = condition ? expanse + serv.expanse : expanse;
                                }
                            });
                            if (mainBooking.caCase === "Yes") {
                                add_caCommision += parseInt(mainBooking.caCommission);
                            }

                        }
                    }
                }

            }
            if (mainBooking.remainingPayments.length !== 0) {
                if (mainBooking.remainingPayments.some(item => new Date(item.paymentDate) >= startDate && new Date(item.paymentDate) <= endDate) && (mainBooking.bdeName === bdeName || mainBooking.bdmName === bdeName)) {
                    mainBooking.services.forEach(serv => {
                        if (serv.expanseDate && new Date(serv.expanseDate) >= startDate && new Date(serv.expanseDate) <= endDate) {
                            if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
                                remainingExpense += serv.expanse / 2;
                            } else if (mainBooking.bdeName === mainBooking.bdmName) {
                                remainingExpense += serv.expanse;
                            } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Support-by" && mainBooking.bdemName === bdeName) {
                                remainingExpense += serv.expanse;
                            }
                        }
                    });
                }
                mainBooking.remainingPayments.map((remainingObj) => {
                    const moreBookingDate = new Date(remainingObj.paymentDate);

                    moreBookingDate.setHours(0, 0, 0, 0);



                    if (((moreBookingDate >= startDate && moreBookingDate <= endDate) || (isSameDayMonthYear(moreBookingDate, startDate) && isSameDayMonthYear(moreBookingDate, endDate))) && (mainBooking.bdeName === bdeName || mainBooking.bdmName === bdeName)) {
                        const findService = mainBooking.services.find((services) => services.serviceName === remainingObj.serviceName);
                        //console.log("findService3" , findService , mainBooking["Company Name"])
                        if (findService) { // Check if findService is defined
                            const tempAmount = findService.withGST ? Math.floor(remainingObj.receivedPayment) / 1.18 : Math.floor(remainingObj.receivedPayment);

                            if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
                                remainingAmount += Math.floor(tempAmount);
                            } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
                                remainingAmount += Math.floor(tempAmount) / 2;
                            } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Supported-by") {
                                if (cleanString(mainBooking.bdeName) === cleanString(bdeName)) {
                                    remainingAmount += Math.floor(tempAmount);
                                }
                            }
                        } else {
                            console.warn(`Service with name ${remainingObj.serviceName} not found for booking ${mainBooking["Company Name"]}`);
                        }
                    }

                })
            }
            mainBooking.moreBookings.length !== 0 && mainBooking.moreBookings.map((moreObject) => {
                const moreBookingDate = new Date(moreObject.bookingDate);
                moreBookingDate.setHours(0, 0, 0, 0);

                if ((moreBookingDate >= startDate && moreBookingDate <= endDate) || (isSameDayMonthYear(moreBookingDate, startDate) && isSameDayMonthYear(moreBookingDate, endDate))) {
                    if (cleanString(moreObject.bdeName) === cleanString(bdeName) || cleanString(moreObject.bdmName) === cleanString(bdeName)) {
                        if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
                            //achievedAmount = achievedAmount + Math.floor(moreObject.generatedReceivedAmount);
                            moreObject.services.map(serv => {
                                // console.log(serv.expanse , bdeName ,"this is services");
                                if (serv.paymentTerms === "Full Advanced") {
                                    achievedAmount = achievedAmount + serv.totalPaymentWOGST;
                                } else {
                                    if (serv.withGST) {
                                        achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18);
                                    } else {
                                        achievedAmount = achievedAmount + Math.round(serv.firstPayment);
                                    }
                                }
                                let expanseDate = null
                                if (serv.expanse) {
                                    expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

                                    expanseDate.setHours(0, 0, 0, 0);
                                    const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                    expanse = condition ? expanse + serv.expanse : expanse;
                                }
                            });
                            if (moreObject.caCase === "Yes") {
                                add_caCommision += parseInt(moreObject.caCommission);
                            }
                        } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
                            //achievedAmount = achievedAmount + Math.floor(moreObject.generatedReceivedAmount) / 2;
                            moreObject.services.map(serv => {
                                // console.log(serv.expanse , bdeName ,"this is services");
                                if (serv.paymentTerms === "Full Advanced") {
                                    achievedAmount = achievedAmount + serv.totalPaymentWOGST / 2;
                                } else {
                                    if (serv.withGST) {
                                        achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18) / 2;
                                    } else {
                                        achievedAmount = achievedAmount + Math.round(serv.firstPayment) / 2;
                                    }
                                }
                                let expanseDate = null
                                if (serv.expanse) {
                                    expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

                                    expanseDate.setHours(0, 0, 0, 0);
                                    const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                    expanse = condition ? expanse + serv.expanse / 2 : expanse;
                                }
                            });
                            if (moreObject.caCase === "Yes") {
                                add_caCommision += parseInt(moreObject.caCommission) / 2;
                            }
                        } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Supported-by") {
                            if (cleanString(moreObject.bdeName) === cleanString(bdeName)) {
                                //achievedAmount += Math.floor(moreObject.generatedReceivedAmount);
                                moreObject.services.map(serv => {
                                    // console.log(serv.expanse , bdeName ,"this is services");
                                    if (serv.paymentTerms === "Full Advanced") {
                                        achievedAmount = achievedAmount + serv.totalPaymentWOGST;
                                    } else {
                                        if (serv.withGST) {
                                            achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18);
                                        } else {
                                            achievedAmount = achievedAmount + Math.round(serv.firstPayment);
                                        }
                                    }
                                    let expanseDate = null
                                    if (serv.expanse) {
                                        expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

                                        expanseDate.setHours(0, 0, 0, 0);
                                        const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                        expanse = condition ? expanse + serv.expanse : expanse;
                                    }
                                });
                                if (moreObject.caCase === "Yes") {
                                    add_caCommision += parseInt(moreObject.caCommission);
                                }
                            }
                        }
                    }
                }
                if (moreObject.remainingPayments.length !== 0) {
                    if (moreObject.remainingPayments.some(item => new Date(item.paymentDate) >= startDate && new Date(item.paymentDate) <= endDate) && (moreObject.bdeName === bdeName || moreObject.bdmName === bdeName)) {
                        moreObject.services.forEach(serv => {
                            if (serv.expanseDate && new Date(serv.expanseDate) >= startDate && new Date(serv.expanseDate) <= endDate) {
                                if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
                                    remainingMoreExpense += serv.expanse / 2;
                                } else if (moreObject.bdeName === moreObject.bdmName) {
                                    remainingMoreExpense += serv.expanse;
                                } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Support-by" && moreObject.bdemName === bdeName) {
                                    remainingMoreExpense += serv.expanse;
                                }
                            }

                        });
                    }

                    moreObject.remainingPayments.map((remainingObj) => {
                        const moreRemainingDate = new Date(remainingObj.paymentDate);
                        moreRemainingDate.setHours(0, 0, 0, 0);
                        if (((moreRemainingDate >= startDate && moreRemainingDate <= endDate) || (isSameDayMonthYear(moreRemainingDate, startDate) && isSameDayMonthYear(moreRemainingDate, endDate))) && (moreObject.bdeName === bdeName || moreObject.bdmName === bdeName)) {

                            const findService = moreObject.services.find((services) => services.serviceName === remainingObj.serviceName)
                            //console.log("findService4" , findService , mainBooking["Company Name"])
                            const tempAmount = findService.withGST ? Math.floor(remainingObj.receivedPayment) / 1.18 : Math.floor(remainingObj.receivedPayment);
                            if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
                                remainingAmount += Math.floor(tempAmount);
                                // moreObject.services.map(serv => {
                                //     // console.log(serv.expanse , bdeName ,"this is services");
                                //     let expanseDate = null
                                //     if (serv.expanse) {
                                //         expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : moreRemainingDate;
                                //         expanseDate.setHours(0, 0, 0, 0);
                                //         const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                //         remainingMoreExpense = condition ? serv.expanse : remainingMoreExpense;
                                //     }
                                // });
                            } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
                                remainingAmount += Math.floor(tempAmount) / 2;
                                // moreObject.services.map(serv => {
                                //     // console.log(serv.expanse , bdeName ,"this is services");
                                //     let expanseDate = null
                                //     if (serv.expanse) {
                                //         expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : moreRemainingDate;
                                //         expanseDate.setHours(0, 0, 0, 0);
                                //         const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                //         remainingMoreExpense = condition ? serv.expanse / 2 : remainingMoreExpense;
                                //     }
                                // });
                            } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Supported-by") {
                                if (cleanString(moreObject.bdeName) === cleanString(bdeName)) {
                                    remainingAmount += Math.floor(tempAmount);
                                    // moreObject.services.map(serv => {
                                    //     // console.log(serv.expanse , bdeName ,"this is services");
                                    //     let expanseDate = null
                                    //     if (serv.expanse) {
                                    //         expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : moreRemainingDate;
                                    //         expanseDate.setHours(0, 0, 0, 0);
                                    //         const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                    //         remainingMoreExpense = condition ? serv.expanse : remainingMoreExpense;
                                    //     }
                                    // });
                                }
                            }
                        }
                    })
                }
            })

        })

        expanse = expanse + remainingExpense + remainingMoreExpense + add_caCommision;
        return achievedAmount + Math.floor(remainingAmount) - expanse;
    }

    const functionCalculateTotalRevenue = (bdeName) => {
        let achievedAmount = 0;
        let remainingAmount = 0;
        let expanse = 0;
        const filterOne = new Date(bookingStartDate).getDate() === new Date().getDate() && new Date(bookingEndDate).getDate() === new Date().getDate();

        if (filterOne) {
            redesignedData.map((mainBooking) => {

                if (monthNames[new Date(mainBooking.bookingDate).getMonth()] === currentMonth) {
                    if (mainBooking.bdeName === bdeName || mainBooking.bdmName === bdeName) {

                        if (mainBooking.bdeName === mainBooking.bdmName) {
                            achievedAmount = achievedAmount + Math.floor(mainBooking.receivedAmount);
                            mainBooking.services.map(serv => {
                                // console.log(serv.expanse , bdeName ,"this is services");
                                expanse = serv.expanse ? expanse + serv.expanse : expanse;
                            });
                        } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
                            achievedAmount = achievedAmount + Math.floor(mainBooking.receivedAmount) / 2;
                            mainBooking.services.map(serv => {
                                expanse = serv.expanse ? expanse + serv.expanse / 2 : expanse;
                            })
                        } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
                            if (mainBooking.bdeName === bdeName) {
                                achievedAmount += Math.floor(mainBooking.receivedAmount);
                                mainBooking.services.map(serv => {

                                    expanse = serv.expanse ? expanse + serv.expanse : expanse;
                                })
                            }
                        }
                    }

                } else if (mainBooking.remainingPayments.length !== 0) {
                    mainBooking.remainingPayments.map((remainingObj) => {
                        if (monthNames[new Date(remainingObj.paymentDate).getMonth()] === currentMonth && (mainBooking.bdeName === bdeName || mainBooking.bdmName === bdeName)) {

                            const tempAmount = Math.floor(remainingObj.receivedPayment);
                            if (mainBooking.bdeName === mainBooking.bdmName) {
                                remainingAmount += Math.floor(tempAmount);
                            } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
                                remainingAmount += Math.floor(tempAmount) / 2;
                            } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
                                if (mainBooking.bdeName === bdeName) {
                                    remainingAmount += Math.floor(tempAmount);
                                }
                            }
                        }
                    })
                }
                mainBooking.moreBookings.map((moreObject) => {
                    if (monthNames[new Date(moreObject.bookingDate).getMonth()] === currentMonth) {
                        if (moreObject.bdeName === bdeName || moreObject.bdmName === bdeName) {
                            if (moreObject.bdeName === moreObject.bdmName) {
                                achievedAmount = achievedAmount + Math.floor(moreObject.receivedAmount);
                                moreObject.services.map(serv => {
                                    expanse = serv.expanse ? expanse + serv.expanse : expanse;
                                })
                            } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
                                achievedAmount = achievedAmount + Math.floor(moreObject.receivedAmount) / 2;
                                moreObject.services.map(serv => {
                                    expanse = serv.expanse ? expanse + serv.expanse / 2 : expanse;
                                })
                            } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
                                if (moreObject.bdeName === bdeName) {
                                    achievedAmount += Math.floor(moreObject.receivedAmount);
                                    moreObject.services.map(serv => {
                                        expanse = serv.expanse ? expanse + serv.expanse : expanse;
                                    })
                                }
                            }
                        }
                    } else if (moreObject.remainingPayments.length !== 0) {

                        moreObject.remainingPayments.map((remainingObj) => {
                            if (monthNames[new Date(remainingObj.paymentDate).getMonth()] === currentMonth && (moreObject.bdeName === bdeName || moreObject.bdmName === bdeName)) {


                                const tempAmount = Math.floor(remainingObj.receivedPayment);
                                if (moreObject.bdeName === moreObject.bdmName) {
                                    remainingAmount += Math.floor(tempAmount);
                                } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
                                    remainingAmount += Math.floor(tempAmount) / 2;
                                } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
                                    if (moreObject.bdeName === bdeName) {
                                        remainingAmount += Math.floor(tempAmount);
                                    }
                                }
                            }
                        })
                    }
                })
            })
        } else {
            redesignedData.map((mainBooking) => {

                if (new Date(mainBooking.bookingDate) >= new Date(bookingStartDate) && new Date(mainBooking.bookingDate) <= new Date(bookingEndDate) || new Date(mainBooking.bookingDate).getDate() == new Date(bookingStartDate).getDate() && new Date(mainBooking.bookingDate).getDate() == new Date(bookingEndDate).getDate()) {
                    if (mainBooking.bdeName === bdeName || mainBooking.bdmName === bdeName) {

                        if (mainBooking.bdeName === mainBooking.bdmName) {
                            achievedAmount = achievedAmount + Math.floor(mainBooking.receivedAmount);

                            mainBooking.services.map(serv => {
                                // console.log(serv.expanse , bdeName ,"this is services");
                                expanse = serv.expanse ? expanse + serv.expanse : expanse;
                            });
                        } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
                            achievedAmount = achievedAmount + Math.floor(mainBooking.receivedAmount) / 2;
                            mainBooking.services.map(serv => {
                                expanse = serv.expanse ? expanse + serv.expanse / 2 : expanse;
                            })
                        } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
                            if (mainBooking.bdeName === bdeName) {
                                achievedAmount += Math.floor(mainBooking.receivedAmount);
                                mainBooking.services.map(serv => {

                                    expanse = serv.expanse ? expanse + serv.expanse : expanse;
                                })
                            }
                        }
                    }

                } else if (mainBooking.remainingPayments.length !== 0) {
                    mainBooking.remainingPayments.map((remainingObj) => {
                        if (((new Date(remainingObj.paymentDate) >= new Date(bookingStartDate) && new Date(remainingObj.paymentDate) <= new Date(bookingEndDate)) || (new Date(remainingObj.paymentDate).getDate() == new Date(bookingStartDate).getDate() && new Date(remainingObj.paymentDate).getDate() == new Date(bookingEndDate).getDate())) && (mainBooking.bdeName === bdeName || mainBooking.bdmName === bdeName)) {

                            const tempAmount = Math.floor(remainingObj.receivedPayment);
                            if (mainBooking.bdeName === mainBooking.bdmName) {
                                remainingAmount += Math.floor(tempAmount);
                            } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
                                remainingAmount += Math.floor(tempAmount) / 2;
                            } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
                                if (mainBooking.bdeName === bdeName) {
                                    remainingAmount += Math.floor(tempAmount);
                                }
                            }
                        }
                    })
                }
                mainBooking.moreBookings.map((moreObject) => {
                    if ((new Date(moreObject.bookingDate) >= new Date(bookingStartDate) && new Date(moreObject.bookingDate) <= new Date(bookingEndDate)) || (new Date(moreObject.bookingDate).getDate() == new Date(bookingStartDate).getDate() && new Date(moreObject.bookingDate).getDate() == new Date(bookingEndDate).getDate())) {
                        if (moreObject.bdeName === bdeName || moreObject.bdmName === bdeName) {
                            if (moreObject.bdeName === moreObject.bdmName) {
                                achievedAmount = achievedAmount + Math.floor(moreObject.receivedAmount);
                                moreObject.services.map(serv => {
                                    expanse = serv.expanse ? expanse + serv.expanse : expanse;
                                })
                            } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
                                achievedAmount = achievedAmount + Math.floor(moreObject.receivedAmount) / 2;
                                moreObject.services.map(serv => {
                                    expanse = serv.expanse ? expanse + serv.expanse / 2 : expanse;
                                })
                            } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
                                if (moreObject.bdeName === bdeName) {
                                    achievedAmount += Math.floor(moreObject.receivedAmount);
                                    moreObject.services.map(serv => {
                                        expanse = serv.expanse ? expanse + serv.expanse : expanse;
                                    })
                                }
                            }
                        }
                    } else if (moreObject.remainingPayments.length !== 0) {

                        moreObject.remainingPayments.map((remainingObj) => {
                            if (((new Date(remainingObj.paymentDate) >= new Date(bookingStartDate) && new Date(remainingObj.paymentDate) <= new Date(bookingEndDate)) || (new Date(remainingObj.paymentDate).getDate() == new Date(bookingStartDate).getDate() && new Date(remainingObj.paymentDate).getDate() == new Date(bookingEndDate).getDate())) && (moreObject.bdeName === bdeName || moreObject.bdmName === bdeName)) {

                                const tempAmount = Math.floor(remainingObj.receivedPayment);
                                if (moreObject.bdeName === moreObject.bdmName) {
                                    remainingAmount += Math.floor(tempAmount);
                                } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
                                    remainingAmount += Math.floor(tempAmount) / 2;
                                } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
                                    if (moreObject.bdeName === bdeName) {
                                        remainingAmount += Math.floor(tempAmount);
                                    }
                                }
                            }
                        })
                    }
                })
            })
        }

        return achievedAmount + Math.floor(remainingAmount);
    }

    const Filterby = "This Month"

    //     return achievedAmount + Math.floor(remainingAmount) - expanse;
    // };
    const functionCalculateAdvanceCollected = (data) => {
        let achievedAmount = 0;
        let remainingAmount = 0;
        let expanse = 0;
        const today = new Date();


        redesignedData.map((mainBooking) => {
            let condition = false;
            switch (Filterby) {
                case 'Today':
                    condition = (new Date(mainBooking.bookingDate).toLocaleDateString() === today.toLocaleDateString())
                    break;
                case 'Last Month':
                    condition = (new Date(mainBooking.bookingDate).getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1))
                    break;
                case 'This Month':
                    condition = (new Date(mainBooking.bookingDate).getMonth() === today.getMonth())
                    break;
                default:
                    break;
            }
            if (condition && (mainBooking.bdeName === data.ename || mainBooking.bdmName === data.ename)) {
                mainBooking.services.forEach(service => {
                    if (service.paymentTerms === "Full Advanced") {
                        if (mainBooking.bdeName === mainBooking.bdmName) {
                            achievedAmount += Math.floor(service.totalPaymentWGST)
                        } else if ((mainBooking.bdeName !== mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
                            achievedAmount += Math.floor(service.totalPaymentWGST) / 2
                        } else if ((mainBooking.bdeName !== mainBooking.bdmName) && mainBooking.bdmType === "Supported-by") {
                            if (mainBooking.bdeName === data.ename) {
                                achievedAmount += Math.floor(service.totalPaymentWGST)
                            }
                        }
                    } else {
                        const payment = Math.floor(service.firstPayment)
                        if (mainBooking.bdeName === mainBooking.bdmName) {

                            achievedAmount += Math.floor(payment);
                        } else if ((mainBooking.bdeName !== mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {

                            achievedAmount += Math.floor(payment) / 2;
                        } else if ((mainBooking.bdeName !== mainBooking.bdmName) && mainBooking.bdmType === "Supported-by") {
                            if (mainBooking.bdeName === data.ename) {
                                achievedAmount += Math.floor(payment)
                            }
                        }
                    }
                });
                // if (mainBooking.bdeName === mainBooking.bdmName) {
                //     achievedAmount = achievedAmount + Math.floor(mainBooking.generatedReceivedAmount);
                //     mainBooking.services.map(serv => {
                //         expanse = serv.expanse ? expanse + serv.expanse : expanse;
                //     })
                // } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
                //     achievedAmount = achievedAmount + Math.floor(mainBooking.generatedReceivedAmount) / 2;
                //     mainBooking.services.map(serv => {
                //         expanse = serv.expanse ? expanse + serv.expanse / 2 : expanse;
                //     })
                // } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
                //     if (mainBooking.bdeName === data.ename) {
                //         achievedAmount = achievedAmount + Math.floor(mainBooking.generatedReceivedAmount);
                //         mainBooking.services.map(serv => {
                //             expanse = serv.expanse ? expanse + serv.expanse : expanse;
                //         })
                //     }
                // }
            }
            mainBooking.moreBookings.map((moreObject) => {
                let condition = false;
                switch (Filterby) {
                    case 'Today':
                        condition = (new Date(moreObject.bookingDate).toLocaleDateString() === today.toLocaleDateString())
                        break;
                    case 'Last Month':
                        condition = (new Date(moreObject.bookingDate).getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1))
                        break;
                    case 'This Month':
                        condition = (new Date(moreObject.bookingDate).getMonth() === today.getMonth())
                        break;
                    default:
                        break;
                }
                if (condition && (moreObject.bdeName === data.ename || moreObject.bdmName === data.ename)) {
                    moreObject.services.forEach(service => {
                        if (service.paymentTerms === "Full Advanced") {
                            if (moreObject.bdeName === moreObject.bdmName) {
                                achievedAmount += Math.floor(service.totalPaymentWGST)
                            } else if ((moreObject.bdeName !== moreObject.bdmName) && moreObject.bdmType === "Close-by") {
                                achievedAmount += Math.floor(service.totalPaymentWGST) / 2
                            } else if ((moreObject.bdeName !== moreObject.bdmName) && moreObject.bdmType === "Supported-by") {
                                if (moreObject.bdeName === data.ename) {
                                    achievedAmount += Math.floor(service.totalPaymentWGST)
                                }
                            }
                        } else {
                            const payment = Math.floor(service.firstPayment)
                            if (mainBooking.bdeName === mainBooking.bdmName) {

                                achievedAmount += Math.floor(payment);
                            } else if ((mainBooking.bdeName !== mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {

                                achievedAmount += Math.floor(payment) / 2;
                            } else if ((mainBooking.bdeName !== mainBooking.bdmName) && mainBooking.bdmType === "Supported-by") {
                                if (mainBooking.bdeName === data.ename) {
                                    achievedAmount += Math.floor(payment)
                                }
                            }
                        }
                    });

                    // if (moreObject.bdeName === moreObject.bdmName) {
                    //     achievedAmount = achievedAmount + Math.floor(moreObject.generatedReceivedAmount);
                    //     moreObject.services.map(serv => {
                    //         expanse = serv.expanse ? expanse + serv.expanse : expanse;
                    //     })
                    // } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
                    //     achievedAmount = achievedAmount + Math.floor(moreObject.generatedReceivedAmount) / 2;
                    //     moreObject.services.map(serv => {
                    //         expanse = serv.expanse ? expanse + serv.expanse / 2 : expanse;
                    //     })
                    // } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
                    //     if (moreObject.bdeName === data.ename) {
                    //         achievedAmount = achievedAmount + Math.floor(moreObject.generatedReceivedAmount);
                    //         moreObject.services.map(serv => {
                    //             expanse = serv.expanse ? expanse + serv.expanse : expanse;
                    //         })
                    //     }
                    // }

                }
            })


        })


        return achievedAmount;
    };

    const functionGetAmount = (object) => {
        const thisDate = new Date(bookingStartDate);
        const thisYear = thisDate.getFullYear();
        const thisMonth = monthNames[thisDate.getMonth()];

        if (object.targetDetails.length !== 0) {
            const foundObject = object.targetDetails.find(
                (item) =>
                    Math.floor(item.year) === thisYear && item.month === thisMonth
            );
            totalTargetAmount =
                foundObject &&
                Math.floor(totalTargetAmount) + Math.floor(foundObject.amount);

            return foundObject ? foundObject.amount : 0;
        } else {
            return 0;
        }
    };
    const functionGetOnlyAmount = (object) => {
        const thisDate = new Date(bookingStartDate);
        const thisYear = thisDate.getFullYear();
        const thisMonth = monthNames[thisDate.getMonth()];
        if (object.targetDetails.length !== 0) {
            const foundObject = object.targetDetails.find(
                (item) =>
                    Math.floor(item.year) === thisYear && item.month === thisMonth
            );
            if (object.ename === "Swapnil Gurjar") {
                //console.log("foundObject", foundObject)
            }

            return foundObject ? foundObject.amount : 0;
        } else {
            return 0;
        }
    };

    // function functionGetLastBookingDate(bdeName = "Vishnu Suthar") {
    //     let tempBookingDate = null;
    //     const cleanString = (str) => (str ? str.replace(/\s+/g, '').toLowerCase() : '');
    //     // Filter objects based on bdeName
    //     redesignedData.map((mainBooking) => {
    //         if (monthNames[new Date(mainBooking.bookingDate).getMonth()] === currentMonth) {
    //             if (cleanString(mainBooking.bdeName) === cleanString(bdeName) || cleanString(mainBooking.bdmName) === cleanString(bdeName)) {
    //                 const bookingDate = new Date(mainBooking.bookingDate);
    //                 tempBookingDate = bookingDate > tempBookingDate ? bookingDate : tempBookingDate;
    //                 console.log("tempBookingDate" , mainBooking["Company Name"] , tempBookingDate , mainBooking.bdeName)
    //             }
    //         }
    //         mainBooking.moreBookings.map((moreObject) => {
    //             if (monthNames[new Date(moreObject.bookingDate).getMonth()] === currentMonth) {
    //                 if (cleanString(moreObject.bdeName) === cleanString(bdeName) || cleanString(moreObject.bdmName) === cleanString(bdeName)) {
    //                     const bookingDate = new Date(moreObject.bookingDate);
    //                     tempBookingDate = bookingDate > tempBookingDate ? bookingDate : tempBookingDate;
    //                     console.log("tempBookingDate" , mainBooking["Company Name"] , tempBookingDate ,moreObject.bdeName)
    //                 }
    //             }
    //         })
    //     })


    //     return tempBookingDate ? formatDateFinal(tempBookingDate) : "No Booking";
    // }

    function functionGetLastBookingDate(bdeName) {
        let tempBookingDate = null;
        const cleanString = (str) => (str ? str.replace(/\s+/g, '').toLowerCase() : '');
        const currentYear = new Date().getFullYear(); // Get the current year

        // Filter objects based on bdeName
        redesignedData.map((mainBooking) => {
            const mainBookingDate = new Date(mainBooking.bookingDate);
            const mainBookingYear = mainBookingDate.getFullYear();
            const mainBookingMonth = monthNames[mainBookingDate.getMonth()];

            if (mainBookingMonth === currentMonth && mainBookingYear === currentYear) {
                if (cleanString(mainBooking.bdeName) === cleanString(bdeName) || cleanString(mainBooking.bdmName) === cleanString(bdeName)) {
                    tempBookingDate = mainBookingDate > tempBookingDate ? mainBookingDate : tempBookingDate;
                    //console.log("tempBookingDate", mainBooking["Company Name"], tempBookingDate, mainBooking.bdeName);
                }
            }

            mainBooking.moreBookings.map((moreObject) => {
                const moreObjectDate = new Date(moreObject.bookingDate);
                const moreObjectYear = moreObjectDate.getFullYear();
                const moreObjectMonth = monthNames[moreObjectDate.getMonth()];

                if (moreObjectMonth === currentMonth && moreObjectYear === currentYear) {
                    if (cleanString(moreObject.bdeName) === cleanString(bdeName) || cleanString(moreObject.bdmName) === cleanString(bdeName)) {
                        tempBookingDate = moreObjectDate > tempBookingDate ? moreObjectDate : tempBookingDate;
                        //console.log("tempBookingDate", mainBooking["Company Name"], tempBookingDate, moreObject.bdeName);
                    }
                }
            });
        });

        return tempBookingDate ? formatDateFinal(tempBookingDate) : "No Booking";
    }


    let generatedTotalRevenue = 0;






    //-------------------this months booking bde search filter---------------------------


    const filterSearchThisMonthBookingBde = (searchTerm) => {
        setEmployeeData(employeeDataFilter.filter((obj) => obj.ename.toLowerCase().includes(searchTerm.toLowerCase())))
    }
    const debouncedFilterSearchThisMonthBookingBde = debounce(filterSearchThisMonthBookingBde, 100)

    //--------------------------------date range filter function---------------------------------
    const numberFormatOptions = {
        style: "currency",
        currency: "INR", // Use the currency code for Indian Rupee (INR)
        minimumFractionDigits: 0, // Minimum number of fraction digits (adjust as needed)
        maximumFractionDigits: 2, // Maximum number of fraction digits (adjust as needed)
    };
    const shortcutsItems = [
        {
            label: "This Week",
            getValue: () => {
                const today = dayjs();
                return [today.startOf("week"), today.endOf("week")];
            },
        },
        {
            label: "Last Week",
            getValue: () => {
                const today = dayjs();
                const prevWeek = today.subtract(7, "day");
                return [prevWeek.startOf("week"), prevWeek.endOf("week")];
            },
        },
        {
            label: "Last 7 Days",
            getValue: () => {
                const today = dayjs();
                return [today.subtract(7, "day"), today];
            },
        },
        {
            label: "Current Month",
            getValue: () => {
                const today = dayjs();
                return [today.startOf("month"), today.endOf("month")];
            },
        },
        { label: "Reset", getValue: () => [null, null] },
    ];

    const handleGeneralCollectionDateRange = (values) => {
        if (values[1]) {
            const startDate = values[0].format('MM/DD/YYYY')
            const endDate = values[1].format('MM/DD/YYYY')
            setGeneralStartDate(startDate);
            setGeneralEndDate(endDate);
        }
    }
    const handleThisMonthBookingDateRange = (values) => {
        if (values[1]) {
            const startDate = values[0].format('MM/DD/YYYY')
            const endDate = values[1].format('MM/DD/YYYY')
            setBookingStartDate(startDate);
            setBookingEndDate(endDate);
        }

        // setInitialDate(new Date(values[0].format('MM/DD/YYYY')))
        const fileteredData = redesignedData.filter((product) => {
            const productDate = formatDateMonth(product.bookingDate);
            if (startDate === endDate) {
                return productDate === startDate;

            } else if (startDate !== endDate) {
                return (
                    new Date(productDate) >= new Date(startDate) &&
                    new Date(productDate) <= new Date(endDate)
                )
            } else {
                return false;
            }
        })
    }




    //--------------------------multiple employee selection filter function------------------------------------
    const options = employeeDataFilter.map((obj) => obj.ename);

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    function getStyles(name, personName, theme) {
        return {
            fontWeight:
                personName.indexOf(name) === -1
                    ? theme.typography.fontWeightRegular
                    : theme.typography.fontWeightMedium,
        };
    }

    const theme = useTheme();

    const handleSelectThisMonthBookingEmployees = (selectedEmployeeNames) => {

        const filteredForwardEmployeeData = employeeDataFilter.filter((company) => selectedEmployeeNames.includes(company.ename));

        //console.log("filtetred", filteredForwardEmployeeData)
        if (filteredForwardEmployeeData.length > 0) {

            setEmployeeData(filteredForwardEmployeeData);
        } else if (filteredForwardEmployeeData.length === 0) {
            setEmployeeData(employeeDataFilter)
        }

    };

    // ----------------------------sorting functions---------------------------------
    const [finalEmployeeData, setFinalEmployeeData] = useState([])
    const handleSortMaturedCases = (sortByForwarded) => {

        setNewSortType((prevData) => ({
            ...prevData,
            recievedcase:
                prevData.maturedcase === 'ascending'
                    ? 'descending'
                    : prevData.maturedcase === 'descending'
                        ? 'none'
                        : 'ascending',
        }));

        switch (sortByForwarded) {
            case 'ascending':
                //console.log("yahan chala ascending");
                const companyDataAscending = {};
                // teamLeadsData.forEach((company) => {
                //     if (company.bdmName) {
                //         companyDataAscending[company.bdmName] = (companyDataAscending[company.bdmName] || 0) + 1;
                //     }
                // });
                employeeData.sort((a, b) => {
                    const countA = Math.floor(functionOnlyCalculateMatured(a.ename)) || 0;
                    const countB = Math.floor(functionOnlyCalculateMatured(b.ename)) || 0;
                    return countA - countB;
                });
                break; // Add break statement here

            case 'descending':
                //console.log("yahan chala descending");
                const companyDataDescending = {};
                // teamLeadsData.forEach((company) => {
                //     if (company.bdmName) {
                //         companyDataDescending[company.bdmName] = (companyDataDescending[company.bdmName] || 0) + 1;
                //     }
                // });
                employeeData.sort((a, b) => {
                    const countA = functionOnlyCalculateMatured(a.ename) || 0;
                    const countB = functionOnlyCalculateMatured(b.ename) || 0;
                    return countB - countA;
                });
                break; // Add break statement here

            case "none":
                //console.log("yahan chala none");
                // if (finalEmployeeData.length > 0) {
                //     // Restore to previous state
                //     setForwardEmployeeData(finalEmployeeData);
                // }
                if (finalEmployeeData.length > 0) {
                    // Restore to previous state
                    setEmployeeData(finalEmployeeData);
                }
                break; // Add break statement here
            default:
                break;
        }
    };
    const handleSortAchievedAmount = (sortByForwarded) => {
        //console.log(sortByForwarded, "case");
        setNewSortType((prevData) => ({
            ...prevData,
            achievedamount:
                prevData.achievedamount === 'ascending'
                    ? 'descending'
                    : prevData.achievedamount === 'descending'
                        ? 'none'
                        : 'ascending',
        }));

        switch (sortByForwarded) {
            case 'ascending':
                //console.log("yahan chala ascending");
                const companyDataAscending = {};
                // teamLeadsData.forEach((company) => {
                //     if (company.bdmName) {
                //         companyDataAscending[company.bdmName] = (companyDataAscending[company.bdmName] || 0) + 1;
                //     }
                // });

                employeeData.sort((a, b) => {
                    const countA = Math.floor(functionCalculateOnlyAchieved(a.ename)) || 0;
                    //console.log(countA, "a")
                    const countB = Math.floor(functionCalculateOnlyAchieved(b.ename)) || 0;
                    //console.log(countB, "b")
                    return countA - countB;
                });
                break; // Add break statement here

            case 'descending':
                //console.log("yahan chala descending");
                const companyDataDescending = {};
                // teamLeadsData.forEach((company) => {
                //     if (company.bdmName) {
                //         companyDataDescending[company.bdmName] = (companyDataDescending[company.bdmName] || 0) + 1;
                //     }
                // });
                employeeData.sort((a, b) => {
                    const countA = Math.floor(functionCalculateOnlyAchieved(a.ename)) || 0;
                    const countB = Math.floor(functionCalculateOnlyAchieved(b.ename)) || 0;
                    return countB - countA;
                });
                break; // Add break statement here

            case "none":
                //console.log("yahan chala none");
                if (finalEmployeeData.length > 0) {
                    // Restore to previous state
                    setEmployeeData(finalEmployeeData);
                }
                break; // Add break statement here
            default:
                break;
        }
    };
    const handleSortTargetAmount = (sortByForwarded) => {
        //console.log(sortByForwarded, "case");
        setNewSortType((prevData) => ({
            ...prevData,
            targetamount:
                prevData.targetamount === 'ascending'
                    ? 'descending'
                    : prevData.targetamount === 'descending'
                        ? 'none'
                        : 'ascending',
        }));

        switch (sortByForwarded) {
            case 'ascending':
                //console.log("yahan chala ascending");
                const companyDataAscending = {};
                // teamLeadsData.forEach((company) => {
                //     if (company.bdmName) {
                //         companyDataAscending[company.bdmName] = (companyDataAscending[company.bdmName] || 0) + 1;
                //     }
                // });

                employeeData.sort((a, b) => {
                    const countA = Math.floor(functionGetOnlyAmount(a)) || 0;
                    //console.log(countA, "a")
                    const countB = Math.floor(functionGetOnlyAmount(b)) || 0;
                    //console.log(countB, "b")
                    return countA - countB;
                });
                break; // Add break statement here

            case 'descending':
                //console.log("yahan chala descending");
                const companyDataDescending = {};
                // teamLeadsData.forEach((company) => {
                //     if (company.bdmName) {
                //         companyDataDescending[company.bdmName] = (companyDataDescending[company.bdmName] || 0) + 1;
                //     }
                // });
                employeeData.sort((a, b) => {
                    const countA = Math.floor(functionGetOnlyAmount(a)) || 0;
                    const countB = Math.floor(functionGetOnlyAmount(b)) || 0;
                    return countB - countA;
                });
                break; // Add break statement here

            case "none":
                //console.log("yahan chala none");
                if (finalEmployeeData.length > 0) {
                    // Restore to previous state
                    setEmployeeData(finalEmployeeData);
                }
                break; // Add break statement here
            default:
                break;
        }
    };
    const handleSortRatio = (sortByForwarded) => {
        //console.log(sortByForwarded, "case");
        setNewSortType((prevData) => ({
            ...prevData,
            targetratio:
                prevData.targetratio === 'ascending'
                    ? 'descending'
                    : prevData.targetratio === 'descending'
                        ? 'none'
                        : 'ascending',
        }));

        switch (sortByForwarded) {
            case 'ascending':
                //console.log("yahan chala ascending");
                const companyDataAscending = {};
                // teamLeadsData.forEach((company) => {
                //     if (company.bdmName) {
                //         companyDataAscending[company.bdmName] = (companyDataAscending[company.bdmName] || 0) + 1;
                //     }
                // });

                employeeData.sort((a, b) => {
                    const countA = Math.floor(functionCalculateOnlyAchieved(a.ename)) / Math.floor(functionGetOnlyAmount(a)) || 0;

                    const countB = Math.floor(functionCalculateOnlyAchieved(b.ename)) / Math.floor(functionGetOnlyAmount(b)) || 0;

                    return countA - countB;
                });
                break; // Add break statement here

            case 'descending':
                //console.log("yahan chala descending");
                const companyDataDescending = {};
                // teamLeadsData.forEach((company) => {
                //     if (company.bdmName) {
                //         companyDataDescending[company.bdmName] = (companyDataDescending[company.bdmName] || 0) + 1;
                //     }
                // });

                employeeData.sort((a, b) => {
                    const countA = Math.floor(functionCalculateOnlyAchieved(a.ename)) / Math.floor(functionGetOnlyAmount(a)) || 0;

                    const countB = Math.floor(functionCalculateOnlyAchieved(b.ename)) / Math.floor(functionGetOnlyAmount(b)) || 0;

                    return countB - countA;
                });
                break; // Add break statement here

            case "none":
                //console.log("yahan chala none");
                if (finalEmployeeData.length > 0) {
                    // Restore to previous state
                    setEmployeeData(finalEmployeeData);
                }
                break; // Add break statement here
            default:
                break;
        }
    };
    useEffect(() => {
        setFinalEmployeeData([...employeeData]); // Store original state of employeeData
    }, [employeeData]);


    //  ----------------------------------------------------------- Celebration buttons hadi ----------------------------------------------------------------
    const defaults = {
        disableForReducedMotion: true,
    };

    function confettiExplosion(origin) {
        fire(0.25, { spread: 140, startVelocity: 55, origin });
        fire(0.2, { spread: 140, origin });
        fire(0.35, { spread: 120, decay: 0.91, origin });
        fire(0.1, { spread: 140, startVelocity: 25, decay: 0.92, origin });
        fire(0.1, { spread: 140, startVelocity: 45, origin });
    }

    function fire(particleRatio, opts) {
        confetti(
            Object.assign({}, defaults, opts, {
                particleCount: Math.floor(200 * particleRatio),
            })
        );
    }


    const soundRef = useRef(null); // useRef for optional sound element

    useEffect(() => {
        const sound = soundRef.current;
        if (sound) {
            // Preload the sound only once on component mount
            sound.load();
        }
    }, [soundRef]); // Dependency array for sound preloading

    const handleClick = () => {
        const rect = buttonRef.current.getBoundingClientRect();
        const center = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
        const origin = {
            x: center.x / window.innerWidth,
            y: center.y / window.innerHeight,
        };

        if (soundRef.current) {
            soundRef.current.currentTime = 0;
            soundRef.current.play();
        }
        confettiExplosion(origin);
    };

    const buttonRef = useRef(null);

    // console.log('Employee data :', employeeData);

    //  ---------------------------------------------- For Creating Remaining Payments Array   ------------------------------------------------
    const [remainingPaymentObject, setRemainingPaymentObject] = useState([]);
    const [remainingRecievedObject, setRemainingRecievedObject] = useState([]);
    const [completeRemainingPaymentObject, setCompleteRemainingPaymentObject] = useState([]);
    const [isDateSelectedInRemainingPayment, setIsDateSelectedInRemainingPayment] = useState(false);
    const [filteredDataFromDateInRemainingPayment, setFilteredDataFromDateInRemainingPayment] = useState([]);
    const [isSearchedInRemainingPayment, setIsSearchedInRemainingPayment] = useState(false);
    const [filteredDataFromSearchInRemainingPayment, setFilteredDataFromSearchInRemainingPayment] = useState([]);
    const [selectedDateRangeInRemainingPayment, setSelectedDateRangeInRemainingPayment] = useState([null, null]);
    const [searchCompanyServiceNameInRemainingPayments, setSearchCompanyServiceNameInRemainingPayments] = useState("");
    const [fullRemainingPaymentObject, setFullRemainingPaymentObject] = useState([]);

    const today = new Date();
    const thisYear = today.getFullYear();
    const thisMonth = today.getMonth();

    useEffect(() => {
        const remainingMainObject = [];
        redesignedData.forEach((mainObj) => {
            if (mainObj.remainingPayments.length !== 0) {
                mainObj.remainingPayments.forEach((payment) => {
                    const paymentDate = new Date(payment.paymentDate);
                    fullRemainingPaymentObject.push({
                        "Company Name": mainObj["Company Name"],
                        bdeName: mainObj.bdeName,
                        bdmName: mainObj.bdmName,
                        totalPayment: payment.totalPayment,
                        receivedPayment: payment.receivedPayment,
                        pendingPayment: payment.pendingPayment,
                        paymentDate: payment.paymentDate,
                        serviceName: payment.serviceName
                    });
                });
            }

            mainObj.moreBookings.forEach((moreObject) => {
                if (moreObject.remainingPayments.length !== 0) {
                    moreObject.remainingPayments.forEach((payment) => {
                        const paymentDate = new Date(payment.paymentDate);
                        fullRemainingPaymentObject.push({
                            "Company Name": mainObj["Company Name"],
                            bdeName: moreObject.bdeName,
                            bdmName: moreObject.bdmName,
                            totalPayment: payment.totalPayment,
                            receivedPayment: payment.receivedPayment,
                            pendingPayment: payment.pendingPayment,
                            paymentDate: payment.paymentDate,
                            serviceName: payment.serviceName
                        });
                    });
                }
            });
        });

        const currentMonthData = fullRemainingPaymentObject.filter(payment => {
            const paymentDate = new Date(payment.paymentDate);
            return paymentDate.getFullYear() === thisYear && paymentDate.getMonth() === thisMonth;
        });

        setRemainingPaymentObject(currentMonthData.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)));
        setRemainingRecievedObject(currentMonthData.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)));
        setCompleteRemainingPaymentObject(fullRemainingPaymentObject.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)));
        setFullRemainingPaymentObject(currentMonthData);
        // setRemainingPaymentObjectFilter(remainingMainObject)
        // console.log("Remaining payments :", remainingMainObject);
    }, [redesignedData, thisMonth, thisYear]);

    // Sorting Remaining Total
    const handleSortRemainingTotal = (type) => {
        const data = (isDateSelectedInRemainingPayment || isSearchedInRemainingPayment) ? remainingPaymentObject : fullRemainingPaymentObject;
        let sortedData = [...data];
        // console.log("Sorted data :", sortedData);

        if (type === "ascending") {
            const ascendingSort = sortedData.sort((a, b) => a.totalPayment - b.totalPayment);
            // console.log("Ascending remaining total :", ascendingSort);
        } else if (type === "descending") {
            const descendingSort = sortedData.sort((a, b) => b.totalPayment - a.totalPayment);
            // console.log("Descending remaining total :", descendingSort);
        } else if (type === "none") {
            const data = (isDateSelectedInRemainingPayment || isSearchedInRemainingPayment) ? filteredDataFromSearchInRemainingPayment : fullRemainingPaymentObject;
            // console.log("None is :", data);
        }
        setRemainingPaymentObject(sortedData);
    };

    // Sorting Remaining Recieved
    const handleSortRemainingReceived = (type) => {
        const data = (isDateSelectedInRemainingPayment || isSearchedInRemainingPayment) ? remainingPaymentObject : fullRemainingPaymentObject;
        let sortedData = [...data];
        // console.log("Sorted data :", sortedData);

        if (type === "ascending") {
            const ascendingSort = sortedData.sort((a, b) => a.receivedPayment - b.receivedPayment);
            // console.log("Ascending remaining received :", ascendingSort);
        } else if (type === "descending") {
            const descendingSort = sortedData.sort((a, b) => b.receivedPayment - a.receivedPayment);
            // console.log("Descending remaining received :", descendingSort);
        } else if (type === "none") {
            const data = (isDateSelectedInRemainingPayment || isSearchedInRemainingPayment) ? filteredDataFromSearchInRemainingPayment : fullRemainingPaymentObject;
            // console.log("None is :", data);
        }
        setRemainingPaymentObject(sortedData);
    };

    // Sorting Remaining Payment Date
    const handleSortPaymentDateInRemainingPayments = (type) => {
        const data = (isDateSelectedInRemainingPayment || isSearchedInRemainingPayment) ? remainingPaymentObject : fullRemainingPaymentObject;
        let sortedData = [...data];
        // console.log("Sorted data :", sortedData);

        if (type === "ascending") {
            const ascendingSort = sortedData.sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));
            // console.log("Ascending payment date :", ascendingSort);
        } else if (type === "descending") {
            const descendingSort = sortedData.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
            // console.log("Descending payment date :", descendingSort);
        } else if (type === "none") {
            const data = (isDateSelectedInRemainingPayment || isSearchedInRemainingPayment) ? filteredDataFromSearchInRemainingPayment : fullRemainingPaymentObject;
            // console.log("None is :", data);
        }
        setRemainingPaymentObject(sortedData);
    };

    // Filter using branch in Remaining Payments
    // const handleBranchFilterInRemainingPayments = (branchName) => {
    //     console.log("Branch name is:", branchName);

    //     // Filter employees by branch name
    //     let bdeNames = employeeData.filter((employee) => employee.branchOffice === branchName).map(employee => employee.ename);
    //     console.log("BDE names:", bdeNames);

    //     // Filter remaining payments by matching names
    //     let filterRemainingPaymentObject = remainingPaymentObjectFilter.filter(payment => bdeNames.includes(payment.bdeName));
    //     console.log("Filtered object is:", filterRemainingPaymentObject);

    //     setRemainingPaymentObject(filterRemainingPaymentObject);
    // };

    // Searching Service and Company name in Remaining Payments
    const searchInRemainingPayments = (searchValue) => {
        setSearchCompanyServiceNameInRemainingPayments(searchValue);

        const data = isDateSelectedInRemainingPayment ? filteredDataFromDateInRemainingPayment : fullRemainingPaymentObject;
        let searchResult = data.filter(item =>
            item['Company Name'].toLowerCase().includes(searchValue.toLowerCase()) ||
            item.serviceName.toLowerCase().includes(searchValue.toLowerCase())
        );

        if (searchValue.length === 0) {
            const currentMonthData = fullRemainingPaymentObject.filter(payment => {
                const paymentDate = new Date(payment.paymentDate);
                return paymentDate.getFullYear() === thisYear && paymentDate.getMonth() === thisMonth;
            });
            searchResult = isDateSelectedInRemainingPayment ? filteredDataFromDateInRemainingPayment : currentMonthData;
        }

        setIsSearchedInRemainingPayment(searchValue.length > 0);
        setFilteredDataFromSearchInRemainingPayment(searchResult);
        setRemainingPaymentObject(searchResult);
    };

    // Filtering data from seleted date range in Remaining Payments
    const handleDateRangeInRemainingPayments = (values) => {
        const [start, end] = values;

        if (!start || !end) {
            //console.log("One of the dates is null or undefined.");
            setRemainingPaymentObject(completeRemainingPaymentObject);
            setIsDateSelectedInRemainingPayment(false);
            setFilteredDataFromDateInRemainingPayment([]);
            return;
        }

        const startDate = new Date(start);
        // console.log("Start Date is :", startDate);

        const endDate = new Date(end);
        // console.log("End Date is :", endDate);
        endDate.setHours(23, 59, 59, 999);

        setSelectedDateRangeInRemainingPayment([startDate, endDate]);

        const filteredData = completeRemainingPaymentObject.filter(item => {
            const paymentDate = new Date(item.paymentDate);
            return paymentDate >= startDate && paymentDate <= endDate;
        });

        setIsDateSelectedInRemainingPayment(true);
        setFilteredDataFromDateInRemainingPayment(filteredData);

        const searchResult = isSearchedInRemainingPayment ? filteredData.filter(item =>
            item['Company Name'].toLowerCase().includes(searchCompanyServiceNameInRemainingPayments.toLowerCase()) ||
            item.serviceName.toLowerCase().includes(searchCompanyServiceNameInRemainingPayments.toLowerCase())
        ) : filteredData;

        setFilteredDataFromSearchInRemainingPayment(searchResult);
        setRemainingPaymentObject(searchResult);
    };


    //  ---------------------------------------------   Exporting Booking function  ---------------------------------------------

    const handleExportBookings = async () => {
        const tempData = [];
        const filteredEmpData = employeeData.filter(
            (item) =>
                item.targetDetails.length !== 0 &&
                item.targetDetails.find(
                    (target) =>
                        target.year === currentYear.toString() &&
                        target.month === currentMonth.toString()
                )
        )
        filteredEmpData.forEach((obj, index) => {
            const tempObj = {
                SrNo: index + 1,
                employeeName: obj.ename,
                branchOffice: obj.branchOffice,
                maturedCases: functionOnlyCalculateMatured(obj.ename),
                targetAmount: functionGetOnlyAmount(obj),
                achievedAmount: functionCalculateOnlyAchieved(obj.ename),
                targetAchievedRatio: ((functionCalculateOnlyAchieved(obj.ename) / functionGetOnlyAmount(obj)) * 100),
                lastbookingdate: functionGetLastBookingDate(obj.ename)
            }

            tempData.push(tempObj);
        });

        const response = await axios.post(
            `${secretKey}/bookings/export-this-bookings`,
            {
                tempData
            }
        );
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "ThisMonthBooking.csv");
        document.body.appendChild(link);
        link.click();
    }


    //-----------------------------function for advance payment table-------------------------------
    const [advancePaymentObject, setAdvancePaymentObject] = useState([]);
    const [totalPaymentObject, setTotalPaymentObject] = useState([]);
    const [completeAdvancePaymentObject, setCompleteAdvancePaymentObject] = useState([]);
    const [isDateSelectedInAdvancePayment, setIsDateSelectedInAdvancePayment] = useState(false);
    const [filteredDataFromDateInAdvancePayment, setFilteredDataFromDateInAdvancePayment] = useState([]);
    const [isSearchedInAdvancePayment, setIsSearchedInAdvancePayment] = useState(false);
    const [filteredDataFromSearchInAdvancePayment, setFilteredDataFromSearchInAdvancePayment] = useState([]);
    const [selectedDateRangeInAdvancePayment, setSelectedDateRangeInAdvancePayment] = useState([null, null]);
    const [searchCompanyServiceNameInAdvancePayments, setSearchCompanyServiceNameInAdvancePayments] = useState("");
    const [fullAdvancePaymentObject, setFullAdvancePaymentObject] = useState([]);

    useEffect(() => {
        const newAdvancePaymentObject = [];
        redesignedData.forEach((mainObj) => {
            mainObj.services.forEach((service) => {
                if (service.paymentTerms === 'Full Advanced' || service.paymentTerms === "two-part") {
                    fullAdvancePaymentObject.push({
                        "Company Name": mainObj["Company Name"],
                        serviceName: service.serviceName,
                        bdeName: mainObj.bdeName,
                        bdmName: mainObj.bdmName,
                        totalPayment: service.totalPaymentWGST,
                        totalAdvanceRecieved: service.paymentTerms === 'Full Advanced' ? service.totalPaymentWGST : service.firstPayment,
                        paymentDate: mainObj.bookingDate
                    });
                }
            });

            mainObj.moreBookings.forEach((moreObject) => {
                moreObject.services.forEach((service) => {
                    if (service.paymentTerms === 'Full Advanced' || service.paymentTerms === "two-part") {
                        fullAdvancePaymentObject.push({
                            "Company Name": mainObj["Company Name"],
                            serviceName: service.serviceName,
                            bdeName: moreObject.bdeName,
                            bdmName: moreObject.bdmName,
                            totalPayment: service.totalPaymentWGST,
                            totalAdvanceRecieved: service.paymentTerms === 'Full Advanced' ? service.totalPaymentWGST : service.firstPayment,
                            paymentDate: moreObject.bookingDate
                        });
                    }
                });
            });
        });


        const currentMonthData = fullAdvancePaymentObject.filter(payment => {
            const paymentDate = new Date(payment.paymentDate);
            return paymentDate.getFullYear() === thisYear && paymentDate.getMonth() === thisMonth;
        });

        setAdvancePaymentObject(currentMonthData.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)));
        setTotalPaymentObject(currentMonthData.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)));
        setCompleteAdvancePaymentObject(fullAdvancePaymentObject.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)));
        setFullAdvancePaymentObject(currentMonthData);
        // setAdvancePaymentObjectFilter(newAdvancePaymentObject);
        // console.log("Advance Payment :", newAdvancePaymentObject);
    }, [redesignedData, thisMonth, thisYear]);

    // Sorting Total Amount
    const handleSortTotalAmount = (type) => {
        const data = (isDateSelectedInAdvancePayment || isSearchedInAdvancePayment) ? advancePaymentObject : fullAdvancePaymentObject;
        let sortedData = [...data];
        // console.log("Sorted data :", sortedData);

        if (type === "ascending") {
            const ascendingSort = sortedData.sort((a, b) => a.totalPayment - b.totalPayment);
            // console.log("Ascending total amount :", ascendingSort);
        } else if (type === "descending") {
            sortedData.sort((a, b) => b.totalPayment - a.totalPayment);
            // console.log("Descending total amount :", descendingSort);
        } else if (type === "none") {
            const data = (isDateSelectedInAdvancePayment || isSearchedInAdvancePayment) ? filteredDataFromSearchInAdvancePayment : fullAdvancePaymentObject;
            // console.log("None is :", data);
        }
        setAdvancePaymentObject(sortedData);
    };

    // Sorting Total Advanced Achieved
    const handleSortTotalAdvanceAchieved = (type) => {
        const data = (isDateSelectedInAdvancePayment || isSearchedInAdvancePayment) ? advancePaymentObject : fullAdvancePaymentObject;
        let sortedData = [...data];
        // console.log("Sorted data :", sortedData);

        if (type === "ascending") {
            const ascendingSort = sortedData.sort((a, b) => a.totalAdvanceRecieved - b.totalAdvanceRecieved);
            // console.log("Ascending total advanced achieved :" , ascendingSort);
        } else if (type === "descending") {
            const descendingSort = sortedData.sort((a, b) => b.totalAdvanceRecieved - a.totalAdvanceRecieved);
            // console.log("Descending total advanced achieved :" , descendingSort);
        } else if (type === "none") {
            const data = (isDateSelectedInAdvancePayment || isSearchedInAdvancePayment) ? filteredDataFromSearchInAdvancePayment : fullAdvancePaymentObject;
            // console.log("None is :", data);
        }
        setAdvancePaymentObject(sortedData);
    };

    // Sorting Advance Payment Date
    const handleSortPaymentDateInAdvancePayments = (type) => {
        const data = (isDateSelectedInAdvancePayment || isSearchedInAdvancePayment) ? advancePaymentObject : fullAdvancePaymentObject;
        let sortedData = [...data];
        // console.log("Sorted data :", sortedData);

        if (type === "ascending") {
            const ascendingSort = sortedData.sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));
            // console.log("Ascending payment date :", ascendingSort);
        } else if (type === "descending") {
            const descendingSort = sortedData.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
            // console.log("Descending payment date :", descendingSort);
        } else if (type === "none") {
            const data = (isDateSelectedInAdvancePayment || isSearchedInAdvancePayment) ? filteredDataFromSearchInAdvancePayment : fullAdvancePaymentObject;
            // console.log("None is :", data);
        }
        setAdvancePaymentObject(sortedData);
    };

    // Filter using brach in Advance Payments
    // const handleBranchFilterInAdvancePayments = (branchName) => {
    //     console.log("Branch name is:", branchName);

    // Filter employees by branch name
    //     let bdeNames = employeeData.filter((employee) => employee.branchOffice === branchName).map(employee => employee.ename);
    //     console.log("BDE names:", bdeNames);

    // Filter remaining payments by matching names
    //     let filterAdvancePaymentObject = advancePaymentObjectFilter.filter(payment => bdeNames.includes(payment.bdeName));
    //     console.log("Filtered object is:", filterAdvancePaymentObject);

    //     setAdvancePaymentObject(filterAdvancePaymentObject);
    // };

    // Searching Service and Company name in Advance Payments
    const searchInAdvancePayments = (searchValue) => {
        setSearchCompanyServiceNameInAdvancePayments(searchValue);

        const data = isDateSelectedInAdvancePayment ? filteredDataFromDateInAdvancePayment : fullAdvancePaymentObject;
        let searchResult = data.filter(item =>
            item['Company Name'].toLowerCase().includes(searchValue.toLowerCase()) ||
            item.serviceName.toLowerCase().includes(searchValue.toLowerCase())
        );

        if (searchValue.length === 0) {
            const currentMonthData = fullAdvancePaymentObject.filter(payment => {
                const paymentDate = new Date(payment.paymentDate);
                return paymentDate.getFullYear() === thisYear && paymentDate.getMonth() === thisMonth;
            });
            searchResult = isDateSelectedInAdvancePayment ? filteredDataFromDateInAdvancePayment : currentMonthData;
        }

        setIsSearchedInAdvancePayment(searchValue.length > 0);
        setFilteredDataFromSearchInAdvancePayment(searchResult);
        setAdvancePaymentObject(searchResult);
    };

    // Filtering data from seleted date range in Advance Payments
    const handleDateRangeInAdvancePayments = (values) => {
        const [start, end] = values;

        if (!start || !end) {
            //console.log("One of the dates is null or undefined.");
            setAdvancePaymentObject(completeAdvancePaymentObject);
            setIsDateSelectedInAdvancePayment(false);
            setFilteredDataFromDateInAdvancePayment([]);
            return;
        }

        const startDate = new Date(start);
        // console.log("Start Date is :", startDate);

        const endDate = new Date(end);
        // console.log("End Date is :", endDate);
        endDate.setHours(23, 59, 59, 999);

        setSelectedDateRangeInAdvancePayment([startDate, endDate]);

        const filteredData = completeAdvancePaymentObject.filter(item => {
            const paymentDate = new Date(item.paymentDate);
            return paymentDate >= startDate && paymentDate <= endDate;
        });

        setIsDateSelectedInAdvancePayment(true);
        setFilteredDataFromDateInAdvancePayment(filteredData);

        const searchResult = isSearchedInAdvancePayment ? filteredData.filter(item =>
            item['Company Name'].toLowerCase().includes(searchCompanyServiceNameInAdvancePayments.toLowerCase()) ||
            item.serviceName.toLowerCase().includes(searchCompanyServiceNameInAdvancePayments.toLowerCase())
        ) : filteredData;

        setFilteredDataFromSearchInAdvancePayment(searchResult);
        setAdvancePaymentObject(searchResult);
    };

    // console.log("Is date selected :", isDateSelectedInAdvancePayment);


    // ------------------------------------filter functions-------------------------
    const handleFilter = (newData) => {
        setFilteredData(newData)
        setEmployeeData(newData);
    };


    const handleFilterClick = (field) => {
        if (activeFilterField === field) {
            setShowFilterMenu(!showFilterMenu);

        } else {
            setActiveFilterField(field);
            setShowFilterMenu(true);
            const rect = fieldRefs.current[field].getBoundingClientRect();
            setFilterPosition({ top: rect.bottom, left: rect.left });
        }
    };
    const isActiveField = (field) => activeFilterFields.includes(field);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const handleClickOutside = (event) => {
                if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                    setShowFilterMenu(false);

                }
            };
            document.addEventListener('mousedown', handleClickOutside);

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, []);


    return (
        <div>
            {/*------------------------------------------------------ Bookings Dashboard ------------------------------------------------------------ */}

            <div className="employee-dashboard mt-2">
                <div className="card mb-2">
                    <div className="card-header employeedashboard d-flex align-items-center justify-content-between p-1">
                        <div className="dashboard-title">
                            <h2 className="m-0 pl-1">
                                Collection Report
                            </h2>
                        </div>
                        <div className="filter-booking d-flex align-items-center">
                            <label htmlFor="date-filter">Filter By :</label>
                            <div className="date-filter mr-1">

                                <select className='form-select' name="date-filter" id="date-filter-admin" onChange={(e) => {
                                    switch (e.target.value) {
                                        case "Today":
                                            const today = new Date();
                                            setGeneralStartDate(today);
                                            setGeneralEndDate(today);
                                            break;
                                        case "This Month":
                                            const now = new Date();
                                            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                                            const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                                            setGeneralStartDate(startOfThisMonth);
                                            setGeneralEndDate(endOfThisMonth);
                                            break;
                                        case "Last Month":
                                            const thisTime = new Date();
                                            const startOfLastMonth = new Date(thisTime.getFullYear(), thisTime.getMonth() - 1, 1);
                                            const endOfLastMonth = new Date(thisTime.getFullYear(), thisTime.getMonth(), 0);
                                            setGeneralStartDate(startOfLastMonth);
                                            setGeneralEndDate(endOfLastMonth);
                                            break;


                                        default:
                                            break;
                                    }
                                }}>
                                    <option value="Today">Today</option>
                                    <option value="This Month">This Month</option>
                                    <option value="Last Month">Last Month</option>
                                </select>
                            </div>
                            <div className="date-range-filter">
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs} >
                                    <DemoContainer
                                        components={["SingleInputDateRangeField"]} sx={{
                                            padding: '0px',
                                            with: '220px'
                                        }}  >
                                        <DateRangePicker className="form-control my-date-picker form-control-sm p-0"
                                            onChange={(values) => {
                                                const startDateEmp = moment(values[0]).format(
                                                    "DD/MM/YYYY"
                                                );
                                                const endDateEmp = moment(values[1]).format(
                                                    "DD/MM/YYYY"
                                                );
                                                handleGeneralCollectionDateRange(values); // Call handleSelect with the selected values
                                            }}
                                            slots={{ field: SingleInputDateRangeField }}
                                            slotProps={{
                                                shortcuts: {
                                                    items: shortcutsItems,
                                                },
                                                actionBar: { actions: [] },
                                                textField: {
                                                    InputProps: { endAdornment: <Calendar /> },
                                                },
                                            }}
                                            calendars={1}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="row mt-1">
                            <div className="col">
                                <div className="dash-card-1">
                                    <div className="dash-card-1-head">No. of Bookings</div>
                                    <div className="dash-card-1-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="dash-card-1-num clr-1ac9bd">
                                                {functionCalculateGeneralMatured()}

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="dash-card-1">
                                    <div className="dash-card-1-head">Total Revenue</div>
                                    <div className="dash-card-1-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="dash-card-1-num clr-1cba19">
                                                ₹{
                                                    functionCalculateGeneralRevenue().toLocaleString()
                                                }/-
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="dash-card-1">
                                    <div className="dash-card-1-head">Advanced Collected</div>
                                    <div className="dash-card-1-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="dash-card-1-num clr-ffb900">
                                                ₹{functionCalculateGeneralAdvanced().toLocaleString()
                                                }/-

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="dash-card-1">
                                    <div className="dash-card-1-head">Remaining Collection</div>
                                    <div className="dash-card-1-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="dash-card-1-num clr-4299e1">
                                                ₹{functionCalculateGeneralRemaining().toLocaleString()}/-
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* --------------------------------  This Month Bookings  ---------------------------------------------- */}
                <div className="card todays-booking totalbooking" id="totalbooking"   >

                    <div className="card-header employeedashboard d-flex align-items-center justify-content-between p-1">

                        <div className="dashboard-title">
                            <h2 className="m-0 pl-1">
                                This Month's Bookings
                            </h2>
                        </div>
                        <div className="filter-booking d-flex align-items-center">
                            <div className="filter-booking mr-1 d-flex align-items-center" >
                                <div className="export-data">
                                    <button className="btn btn-primary mr-1" onClick={handleExportBookings}>
                                        Export CSV
                                    </button>
                                </div>
                                {/* <div className="filter-title d-none">
                                    <h2 className="m-0 mr-2">
                                        {" "}
                                        Filter Branch : {"  "}
                                    </h2>
                                </div> */}
                                {/* <div className="filter-main ml-2 d-none">
                                    <select
                                        className="form-select"
                                        id={`branch-filter`}
                                        onChange={(e) => {
                                            if (e.target.value === "none") {
                                                setEmployeeData(employeeDataFilter)
                                            } else {
                                                setEmployeeData(employeeDataFilter.filter(obj => obj.branchOffice === e.target.value))
                                            }

                                        }}
                                    >
                                        <option value="" disabled selected>
                                            Select Branch
                                        </option>

                                        <option value={"Gota"}>Gota</option>
                                        <option value={"Sindhu Bhawan"}>
                                            Sindhu Bhawan
                                        </option>
                                        <option value={"none"}>None</option>
                                    </select>
                                </div> */}
                            </div>
                            <div class='input-icon mr-1'>
                                <span class="input-icon-addon">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                                        <path d="M21 21l-6 -6"></path>
                                    </svg>
                                </span>
                                <input
                                    value={searchBookingBde}
                                    onChange={(e) => {
                                        setSearchBookingBde(e.target.value)
                                        debouncedFilterSearchThisMonthBookingBde(e.target.value)
                                    }}
                                    className="form-control"
                                    placeholder="Enter BDE Name..."
                                    type="text"
                                    name="bdeName-search"
                                    id="bdeName-search" />
                            </div>
                            <div className="data-filter">
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs} >
                                    <DemoContainer
                                        components={["SingleInputDateRangeField"]} sx={{
                                            padding: '0px',
                                            with: '220px'
                                        }}  >
                                        <DateRangePicker className="form-control my-date-picker form-control-sm p-0"
                                            onChange={(values) => {
                                                const startDateEmp = moment(values[0]).format(
                                                    "DD/MM/YYYY"
                                                );
                                                const endDateEmp = moment(values[1]).format(
                                                    "DD/MM/YYYY"
                                                );
                                                handleThisMonthBookingDateRange(values); // Call handleSelect with the selected values
                                            }}
                                            slots={{ field: SingleInputDateRangeField }}
                                            slotProps={{
                                                shortcuts: {
                                                    items: shortcutsItems,
                                                },
                                                actionBar: { actions: [] },
                                                textField: {
                                                    InputProps: { endAdornment: <Calendar /> },
                                                },
                                            }}
                                            calendars={1}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </div>
                            {/* <div>
                                <FormControl sx={{ ml: 1, minWidth: 200 }}>
                                    <InputLabel id="demo-select-small-label">Select Employee</InputLabel>
                                    <Select
                                        className="form-control my-date-picker my-mul-select form-control-sm p-0"
                                        labelId="demo-multiple-name-label"
                                        id="demo-multiple-name"
                                        multiple
                                        value={monthBookingPerson}
                                        onChange={(event) => {
                                            setMonthBookingPerson(event.target.value)
                                            handleSelectThisMonthBookingEmployees(event.target.value)
                                        }}
                                        input={<OutlinedInput label="Name" />}
                                        MenuProps={MenuProps}
                                    >
                                        {options.map((name) => (
                                            <MenuItem
                                                key={name}
                                                value={name}
                                                style={getStyles(name, monthBookingPerson, theme)}
                                            >
                                                {name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div> */}
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="tbl-scroll" style={{ width: "100%", height: "500px" }}>
                            <table className="table-vcenter table-nowrap admin-dash-tbl w-100" style={{ maxHeight: "400px" }}>
                                <thead className="admin-dash-tbl-thead">
                                    <tr  >
                                        <th>SR.NO</th>
                                        <th>
                                            <div className='d-flex align-items-center justify-content-center position-relative'>
                                                <div ref={el => fieldRefs.current['ename'] = el}>
                                                    BDE/BDM Name
                                                </div>
                                                <div className='RM_filter_icon' style={{ color: "black" }}>
                                                    {isActiveField('ename') ? (
                                                        <FaFilter onClick={() => handleFilterClick("ename")} />
                                                    ) : (
                                                        <BsFilter onClick={() => handleFilterClick("ename")} />
                                                    )}
                                                </div>
                                                {/* ---------------------filter component--------------------------- */}
                                                {showFilterMenu && activeFilterField === 'ename' && (
                                                    <div
                                                        ref={filterMenuRef}
                                                        className="filter-menu"
                                                        style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                                                    >
                                                        <FilterTableThisMonthBooking
                                                            //noofItems={setnoOfAvailableData}
                                                            allFilterFields={setActiveFilterFields}
                                                            filteredData={filteredData}
                                                            //activeTab={"None"}
                                                            employeeData={employeeData}
                                                            redesignedData={redesignedData}
                                                            data={employeeData}
                                                            filterField={activeFilterField}
                                                            onFilter={handleFilter}
                                                            completeData={completeEmployeeInfo}
                                                            showingMenu={setShowFilterMenu}
                                                            dataForFilter={employeeInfo}
                                                            bookingStartDate={bookingStartDate}
                                                            bookingEndDate={bookingEndDate}
                                                            initialDate={initialDate}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                        <th>
                                            <div className='d-flex align-items-center justify-content-center position-relative'>
                                                <div ref={el => fieldRefs.current['branchOffice'] = el}>
                                                    BRANCH
                                                </div>
                                                <div className='RM_filter_icon' style={{ color: "black" }}>
                                                    {isActiveField('branchOffice') ? (
                                                        <FaFilter onClick={() => handleFilterClick("branchOffice")} />
                                                    ) : (
                                                        <BsFilter onClick={() => handleFilterClick("branchOffice")} />
                                                    )}
                                                </div>
                                                {/* ---------------------filter component--------------------------- */}
                                                {showFilterMenu && activeFilterField === 'branchOffice' && (
                                                    <div
                                                        ref={filterMenuRef}
                                                        className="filter-menu"
                                                        style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                                                    >
                                                        <FilterTableThisMonthBooking
                                                            //noofItems={setnoOfAvailableData}
                                                            allFilterFields={setActiveFilterFields}
                                                            filteredData={filteredData}
                                                            //activeTab={"None"}
                                                            employeeData={employeeData}
                                                            redesignedData={redesignedData}
                                                            data={employeeData}
                                                            filterField={activeFilterField}
                                                            onFilter={handleFilter}
                                                            completeData={completeEmployeeInfo}
                                                            showingMenu={setShowFilterMenu}
                                                            dataForFilter={employeeInfo}
                                                            bookingStartDate={bookingStartDate}
                                                            bookingEndDate={bookingEndDate}
                                                            initialDate={initialDate}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                        {/* <th style={{ cursor: "pointer" }}
                                            onClick={(e) => {
                                                let updatedSortType;
                                                if (newSortType.maturedcase === "ascending") {
                                                    updatedSortType = "descending";
                                                } else if (newSortType.maturedcase === "descending") {
                                                    updatedSortType
                                                        = "none";
                                                } else {
                                                    updatedSortType = "ascending";
                                                }
                                                setNewSortType((prevData) => ({
                                                    ...prevData,
                                                    maturedcase: updatedSortType,
                                                }));
                                                handleSortMaturedCases(updatedSortType);
                                            }}><div className="d-flex align-items-center justify-content-between">
                                                <div>MATURED CASES</div>
                                                <div className="short-arrow-div">
                                                    <ArrowDropUpIcon className="up-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.maturedcase === "descending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                    <ArrowDropDownIcon className="down-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.maturedcase === "ascending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                </div>
                                            </div></th> */}
                                        <th>
                                            <div className='d-flex align-items-center justify-content-center position-relative'>
                                                <div ref={el => fieldRefs.current['maturedcases'] = el}>
                                                    MATURED CASES
                                                </div>
                                                <div className='RM_filter_icon' style={{ color: "black" }}>
                                                    {isActiveField('maturedcases') ? (
                                                        <FaFilter onClick={() => handleFilterClick("maturedcases")} />
                                                    ) : (
                                                        <BsFilter onClick={() => handleFilterClick("maturedcases")} />
                                                    )}
                                                </div>
                                                {/* ---------------------filter component--------------------------- */}
                                                {showFilterMenu && activeFilterField === 'maturedcases' && (
                                                    <div
                                                        ref={filterMenuRef}
                                                        className="filter-menu"
                                                        style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                                                    >
                                                        <FilterTableThisMonthBooking
                                                            //noofItems={setnoOfAvailableData}
                                                            allFilterFields={setActiveFilterFields}
                                                            filteredData={filteredData}
                                                            //activeTab={"None"}
                                                            employeeData={employeeData}
                                                            redesignedData={redesignedData}
                                                            data={employeeData}
                                                            filterField={activeFilterField}
                                                            onFilter={handleFilter}
                                                            completeData={completeEmployeeInfo}
                                                            showingMenu={setShowFilterMenu}
                                                            dataForFilter={employeeInfo}
                                                            bookingStartDate={bookingStartDate}
                                                            bookingEndDate={bookingEndDate}
                                                            initialDate={initialDate}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                        {/* <th style={{ cursor: "pointer" }}
                                            onClick={(e) => {
                                                let updatedSortType;
                                                if (newSortType.targetamount === "ascending") {
                                                    updatedSortType = "descending";
                                                } else if (newSortType.targetamount === "descending") {
                                                    updatedSortType
                                                        = "none";
                                                } else {
                                                    updatedSortType = "ascending";
                                                }
                                                setNewSortType((prevData) => ({
                                                    ...prevData,
                                                    targetamount: updatedSortType,
                                                }));
                                                handleSortTargetAmount(updatedSortType);
                                            }}><div className="d-flex align-items-center justify-content-between">
                                                <div>TARGET</div>
                                                <div className="short-arrow-div">
                                                    <ArrowDropUpIcon className="up-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.targetamount === "descending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                    <ArrowDropDownIcon className="down-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.targetamount === "ascending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                </div>
                                            </div></th> */}
                                        <th>
                                            <div className='d-flex align-items-center justify-content-center position-relative'>
                                                <div ref={el => fieldRefs.current['target'] = el}>
                                                    TARGET
                                                </div>
                                                <div className='RM_filter_icon' style={{ color: "black" }}>
                                                    {isActiveField('target') ? (
                                                        <FaFilter onClick={() => handleFilterClick("target")} />
                                                    ) : (
                                                        <BsFilter onClick={() => handleFilterClick("target")} />
                                                    )}
                                                </div>
                                                {/* ---------------------filter component--------------------------- */}
                                                {showFilterMenu && activeFilterField === 'target' && (
                                                    <div
                                                        ref={filterMenuRef}
                                                        className="filter-menu"
                                                        style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                                                    >
                                                        <FilterTableThisMonthBooking
                                                            //noofItems={setnoOfAvailableData}
                                                            allFilterFields={setActiveFilterFields}
                                                            filteredData={filteredData}
                                                            //activeTab={"None"}
                                                            employeeData={employeeData}
                                                            redesignedData={redesignedData}
                                                            data={employeeData}
                                                            filterField={activeFilterField}
                                                            onFilter={handleFilter}
                                                            completeData={completeEmployeeInfo}
                                                            showingMenu={setShowFilterMenu}
                                                            dataForFilter={employeeInfo}
                                                            bookingStartDate={bookingStartDate}
                                                            bookingEndDate={bookingEndDate}
                                                            initialDate={initialDate}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                        {/* <th style={{ cursor: "pointer" }}
                                            onClick={(e) => {
                                                let updatedSortType;
                                                if (newSortType.achievedamount === "ascending") {
                                                    updatedSortType = "descending";
                                                } else if (newSortType.achievedamount === "descending") {
                                                    updatedSortType
                                                        = "none";
                                                } else {
                                                    updatedSortType = "ascending";
                                                }
                                                setNewSortType((prevData) => ({
                                                    ...prevData,
                                                    achievedamount: updatedSortType,
                                                }));
                                                handleSortAchievedAmount(updatedSortType);
                                            }}>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>ACHIEVED</div>
                                                <div className="short-arrow-div">
                                                    <ArrowDropUpIcon className="up-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.achievedamount === "descending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                    <ArrowDropDownIcon className="down-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.achievedamount === "ascending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </th> */}
                                        <th>
                                            <div className='d-flex align-items-center justify-content-center position-relative'>
                                                <div ref={el => fieldRefs.current['achieved'] = el}>
                                                    ACHIEVED
                                                </div>
                                                <div className='RM_filter_icon' style={{ color: "black" }}>
                                                    {isActiveField('achieved') ? (
                                                        <FaFilter onClick={() => handleFilterClick("achieved")} />
                                                    ) : (
                                                        <BsFilter onClick={() => handleFilterClick("achieved")} />
                                                    )}
                                                </div>
                                                {/* ---------------------filter component--------------------------- */}
                                                {showFilterMenu && activeFilterField === 'achieved' && (
                                                    <div
                                                        ref={filterMenuRef}
                                                        className="filter-menu"
                                                        style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                                                    >
                                                        <FilterTableThisMonthBooking
                                                            //noofItems={setnoOfAvailableData}
                                                            allFilterFields={setActiveFilterFields}
                                                            filteredData={filteredData}
                                                            //activeTab={"None"}
                                                            employeeData={employeeData}
                                                            redesignedData={redesignedData}
                                                            data={employeeData}
                                                            filterField={activeFilterField}
                                                            onFilter={handleFilter}
                                                            completeData={completeEmployeeInfo}
                                                            showingMenu={setShowFilterMenu}
                                                            dataForFilter={employeeInfo}
                                                            bookingStartDate={bookingStartDate}
                                                            bookingEndDate={bookingEndDate}
                                                            initialDate={initialDate}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                        {/* <th style={{ cursor: "pointer" }}
                                            onClick={(e) => {
                                                let updatedSortType;
                                                if (newSortType.targetratio === "ascending") {
                                                    updatedSortType = "descending";
                                                } else if (newSortType.targetratio === "descending") {
                                                    updatedSortType
                                                        = "none";
                                                } else {
                                                    updatedSortType = "ascending";
                                                }
                                                setNewSortType((prevData) => ({
                                                    ...prevData,
                                                    targetratio: updatedSortType,
                                                }));
                                                handleSortRatio(updatedSortType);
                                            }}><div className="d-flex align-items-center justify-content-between">
                                                <div>ACHIEVED RATIO</div>
                                                <div className="short-arrow-div">
                                                    <ArrowDropUpIcon className="up-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.targetratio === "descending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                    <ArrowDropDownIcon className="down-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.targetratio === "ascending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                </div>
                                            </div></th> */}
                                        <th>
                                            <div className='d-flex align-items-center justify-content-center position-relative'>
                                                <div ref={el => fieldRefs.current['achievedratio'] = el}>
                                                    ACHIEVED RATIO
                                                </div>
                                                <div className='RM_filter_icon' style={{ color: "black" }}>
                                                    {isActiveField('achievedratio') ? (
                                                        <FaFilter onClick={() => handleFilterClick("achievedratio")} />
                                                    ) : (
                                                        <BsFilter onClick={() => handleFilterClick("achievedratio")} />
                                                    )}
                                                </div>
                                                {/* ---------------------filter component--------------------------- */}
                                                {showFilterMenu && activeFilterField === 'achievedratio' && (
                                                    <div
                                                        ref={filterMenuRef}
                                                        className="filter-menu"
                                                        style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                                                    >
                                                        <FilterTableThisMonthBooking
                                                            //noofItems={setnoOfAvailableData}
                                                            allFilterFields={setActiveFilterFields}
                                                            filteredData={filteredData}
                                                            //activeTab={"None"}
                                                            employeeData={employeeData}
                                                            redesignedData={redesignedData}
                                                            data={employeeData}
                                                            filterField={activeFilterField}
                                                            onFilter={handleFilter}
                                                            completeData={completeEmployeeInfo}
                                                            showingMenu={setShowFilterMenu}
                                                            dataForFilter={employeeInfo}
                                                            bookingStartDate={bookingStartDate}
                                                            bookingEndDate={bookingEndDate}
                                                            initialDate={initialDate}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                        {/*<th style={{ cursor: "pointer" }}
                                            onClick={(e) => {
                                                let updatedSortType;
                                                if (newSortType.lastbookingdate === "ascending") {
                                                    updatedSortType = "descending";
                                                } else if (newSortType.lastbookingdate === "descending") {
                                                    updatedSortType
                                                        = "none";
                                                } else {
                                                    updatedSortType = "ascending";
                                                }
                                                setNewSortType((prevData) => ({
                                                    ...prevData,
                                                    lastbookingdate: updatedSortType,
                                                }));
                                                handleSortMaturedCases(updatedSortType);
                                            }}>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>LAST BOOKING DATE</div>
                                                <div className="short-arrow-div">
                                                    <ArrowDropUpIcon className="up-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.lastbookingdate === "descending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                    <ArrowDropDownIcon className="down-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.lastbookingdate === "ascending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            </th>*/}
                                        <th>
                                            <div className='d-flex align-items-center justify-content-center position-relative'>
                                                <div ref={el => fieldRefs.current['lastbookingdate'] = el}>
                                                    LAST BOOKING DATE
                                                </div>
                                                <div className='RM_filter_icon' style={{ color: "black" }}>
                                                    {isActiveField('lastbookingdate') ? (
                                                        <FaFilter onClick={() => handleFilterClick("lastbookingdate")} />
                                                    ) : (
                                                        <BsFilter onClick={() => handleFilterClick("lastbookingdate")} />
                                                    )}
                                                </div>
                                                {/* ---------------------filter component--------------------------- */}
                                                {showFilterMenu && activeFilterField === 'lastbookingdate' && (
                                                    <div
                                                        ref={filterMenuRef}
                                                        className="filter-menu"
                                                        style={{ top: `${filterPosition.top}px`, left: `${filterPosition.left}px` }}
                                                    >
                                                        <FilterTableThisMonthBooking
                                                            //noofItems={setnoOfAvailableData}
                                                            allFilterFields={setActiveFilterFields}
                                                            filteredData={filteredData}
                                                            //activeTab={"None"}
                                                            employeeData={employeeData}
                                                            redesignedData={redesignedData}
                                                            data={employeeData}
                                                            filterField={activeFilterField}
                                                            onFilter={handleFilter}
                                                            completeData={completeEmployeeInfo}
                                                            showingMenu={setShowFilterMenu}
                                                            dataForFilter={employeeInfo}
                                                            bookingStartDate={bookingStartDate}
                                                            bookingEndDate={bookingEndDate}
                                                            initialDate={initialDate}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                {loading ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan="12">
                                                <div className="LoaderTDSatyle">
                                                    <ClipLoader
                                                        color="lightgrey"
                                                        loading
                                                        size={30}
                                                        aria-label="Loading Spinner"
                                                        data-testid="loader"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    uniqueBDEobjects ? (
                                        <>
                                            <tbody>
                                                {employeeData &&
                                                    employeeData
                                                        .filter(
                                                            (item) =>

                                                                item.targetDetails && item.targetDetails.length !== 0 &&
                                                                item.targetDetails.find(
                                                                    (target) =>
                                                                        target.year === filteredYear.toString() &&
                                                                        target.month === filteredMonth.toString()
                                                                )
                                                        )
                                                        .map((obj, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{obj.ename}</td>
                                                                <td>{obj.branchOffice}</td>
                                                                <td>{functionCalculateMatured(obj.ename)}</td>
                                                                <td>₹ {Math.floor(functionGetAmount(obj)).toLocaleString()}</td>
                                                                <td>₹ {Math.floor(functionCalculateAchievedAmount(obj.ename)).toLocaleString()}</td>
                                                                <td>{((functionCalculateOnlyAchieved(obj.ename) / functionGetOnlyAmount(obj)) * 100).toFixed(2)} %</td>
                                                                <td>{functionGetLastBookingDate(obj.ename)}</td>
                                                            </tr>
                                                        ))}
                                            </tbody>
                                            <tfoot className="admin-dash-tbl-tfoot">
                                                <tr>
                                                    <td colSpan={2}>Total:</td>
                                                    <td>-</td>
                                                    <td>{totalMaturedCount}</td>
                                                    <td>₹ {Math.floor(totalTargetAmount).toLocaleString()}</td>
                                                    <td>₹ {Math.floor(totalAchievedAmount).toLocaleString()}</td>
                                                    <td>{((totalAchievedAmount / totalTargetAmount) * 100).toFixed(2)} %</td>
                                                    <td>-</td>
                                                </tr>
                                            </tfoot>
                                        </>
                                    ) : (
                                        <tbody>
                                            <tr>
                                                <td className="particular" colSpan={9}>
                                                    <Nodata />
                                                </td>
                                            </tr>
                                        </tbody>
                                    )
                                )}
                            </table>
                        </div>
                    </div>
                </div>

                {/* ---------------------------------  Advanced Collected Bookings --------------------------------------- */}
                <div className="card todays-booking mt-2 totalbooking" id="remaining-booking" >
                    <div className="card-header employeedashboard d-flex align-items-center justify-content-between p-1">
                        <div className="dashboard-title">
                            <h2 className="m-0 pl-1">
                                Advance Payments
                            </h2>
                        </div>
                        <div className="filter-booking d-flex align-items-center">
                            <div className="filter-booking mr-1 d-flex align-items-center" >
                                {/* <div className="export-data">
                                    <button className="btn btn-link" onClick={handleExportBookings}>
                                        Export CSV
                                    </button>
                                </div> */}
                                {/* <div className="filter-title">
                                    <h2 className="m-0 mr-2">
                                        {" "}
                                        Filter Branch : {"  "}
                                    </h2>
                                </div> */}
                                {/* <div className="filter-main ml-2">
                                    <select
                                        className="form-select"
                                        id={`branch-filter`}
                                        onChange={(e) => handleBranchFilterInAdvancePayments(e.target.value)}
                                    >
                                        <option value="" disabled selected>
                                            Select Branch
                                        </option>

                                        <option value={"Gota"}>Gota</option>
                                        <option value={"Sindhu Bhawan"}>
                                            Sindhu Bhawan
                                        </option>
                                        <option value={"none"}>None</option>
                                    </select>
                                </div> */}
                            </div>
                            <div class='input-icon mr-1'>
                                <span class="input-icon-addon">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                                        <path d="M21 21l-6 -6"></path>
                                    </svg>
                                </span>
                                <input
                                    value={searchCompanyServiceNameInAdvancePayments}
                                    onChange={(e) => searchInAdvancePayments(e.target.value)}
                                    className="form-control"
                                    placeholder="Search..."
                                    type="text"
                                    name="advancePaymentCompany/Service-search"
                                    id="advancePaymentCompany/Service-search" />
                            </div>
                            <div className="data-filter">
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs} >
                                    <DemoContainer
                                        components={["SingleInputDateRangeField"]} sx={{
                                            padding: '0px',
                                            with: '220px'
                                        }}  >
                                        <DateRangePicker
                                            className="form-control my-date-picker form-control-sm p-0"
                                            onChange={handleDateRangeInAdvancePayments}
                                            slots={{ field: SingleInputDateRangeField }}
                                            slotProps={{
                                                shortcuts: {
                                                    items: shortcutsItems,
                                                },
                                                actionBar: { actions: [] },
                                                textField: {
                                                    InputProps: { endAdornment: <Calendar /> },
                                                },
                                            }}
                                            calendars={1}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </div>
                            {/* <div>
                                <FormControl sx={{ ml: 1, minWidth: 200 }}>
                                    <InputLabel id="demo-select-small-label">Select Employee</InputLabel>
                                    <Select
                                        className="form-control my-date-picker my-mul-select form-control-sm p-0"
                                        labelId="demo-multiple-name-label"
                                        id="demo-multiple-name"
                                        multiple
                                        value={monthBookingPerson}
                                        onChange={(event) => {
                                            setMonthBookingPerson(event.target.value)
                                            handleSelectThisMonthBookingEmployees(event.target.value)
                                        }}
                                        input={<OutlinedInput label="Name" />}
                                        MenuProps={MenuProps}
                                    >
                                        {options.map((name) => (
                                            <MenuItem
                                                key={name}
                                                value={name}
                                                style={getStyles(name, monthBookingPerson, theme)}
                                            >
                                                {name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div> */}
                        </div>

                    </div>
                    <div className="card-body">
                        <div className="row tbl-scroll">
                            <table className="table-vcenter table-nowrap admin-dash-tbl" style={{ maxHeight: "400px" }}>
                                <thead className="admin-dash-tbl-thead">
                                    <tr  >
                                        <th>SR.NO</th>
                                        <th>COMPANY NAME</th>
                                        <th>SERVICE NAME</th>

                                        <th>BDE NAME</th>
                                        <th>BDM NAME</th>
                                        <th style={{ cursor: "pointer" }}
                                            onClick={(e) => {
                                                let updatedSortType;
                                                if (newSortType.totalAmount === "ascending") {
                                                    updatedSortType = "descending";
                                                } else if (newSortType.totalAmount === "descending") {
                                                    updatedSortType
                                                        = "none";
                                                } else {
                                                    updatedSortType = "ascending";
                                                }
                                                setNewSortType((prevData) => ({
                                                    ...prevData,
                                                    totalAmount: updatedSortType,
                                                }));
                                                handleSortTotalAmount(updatedSortType);
                                            }}><div className="d-flex align-items-center justify-content-between">
                                                <div>TOTAL AMOUNT</div>
                                                <div className="short-arrow-div">
                                                    <ArrowDropUpIcon className="up-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.totalAmount === "descending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                    <ArrowDropDownIcon className="down-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.totalAmount === "ascending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </th>
                                        <th style={{ cursor: "pointer" }}
                                            onClick={(e) => {
                                                let updatedSortType;
                                                if (newSortType.totalAdvanceAchieved === "ascending") {
                                                    updatedSortType = "descending";
                                                } else if (newSortType.totalAdvanceAchieved === "descending") {
                                                    updatedSortType
                                                        = "none";
                                                } else {
                                                    updatedSortType = "ascending";
                                                }
                                                setNewSortType((prevData) => ({
                                                    ...prevData,
                                                    totalAdvanceAchieved: updatedSortType,
                                                }));
                                                handleSortTotalAdvanceAchieved(updatedSortType);
                                            }}><div className="d-flex align-items-center justify-content-between">
                                                <div>TOTAL ADVANCE ACHIEVED</div>
                                                <div className="short-arrow-div">
                                                    <ArrowDropUpIcon className="up-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.totalAdvanceAchieved === "descending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                    <ArrowDropDownIcon className="down-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.totalAdvanceAchieved === "ascending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                </div>
                                            </div></th>
                                        <th style={{ cursor: "pointer" }}
                                            onClick={(e) => {
                                                let updatedSortType;
                                                if (newSortType.advancePaymentDate === "ascending") {
                                                    updatedSortType = "descending";
                                                } else if (newSortType.advancePaymentDate === "descending") {
                                                    updatedSortType
                                                        = "none";
                                                } else {
                                                    updatedSortType = "ascending";
                                                }
                                                setNewSortType((prevData) => ({
                                                    ...prevData,
                                                    advancePaymentDate: updatedSortType,
                                                }));
                                                handleSortPaymentDateInAdvancePayments(updatedSortType);
                                            }}>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>PAYMENT DATE</div>
                                                <div className="short-arrow-div">
                                                    <ArrowDropUpIcon className="up-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.advancePaymentDate === "descending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                    <ArrowDropDownIcon className="down-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.advancePaymentDate === "ascending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                </div>
                                            </div></th>
                                    </tr>
                                </thead>
                                {loading ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan="12">
                                                <div className="LoaderTDSatyle">
                                                    <ClipLoader
                                                        color="lightgrey"
                                                        loading
                                                        size={30}
                                                        aria-label="Loading Spinner"
                                                        data-testid="loader"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    advancePaymentObject.length !== 0 ? (
                                        <>
                                            <tbody>
                                                {advancePaymentObject.map((obj, index) => (
                                                    <>
                                                        <tr key={index} >
                                                            <th>{index + 1}</th>
                                                            <th>{obj["Company Name"]}</th>
                                                            <th>{obj.serviceName}</th>
                                                            <th>{obj.bdeName}</th>
                                                            <th>{obj.bdmName}</th>
                                                            <th>
                                                                <div>₹ {Math.round(obj.totalPayment).toLocaleString()}</div>
                                                            </th>
                                                            <th>
                                                                <div>₹ {Math.round(obj.totalAdvanceRecieved).toLocaleString()}</div>
                                                            </th>
                                                            <th>
                                                                {formatDateFinal(obj.paymentDate)}
                                                            </th>
                                                        </tr>
                                                    </>
                                                ))}

                                            </tbody>
                                            <tfoot className="admin-dash-tbl-tfoot">
                                                <tr>
                                                    <td colSpan={2}>Total:</td>
                                                    <td>{advancePaymentObject.length}</td>
                                                    <td>-</td>
                                                    <td>-</td>
                                                    <td>₹ {advancePaymentObject.length !== 0 ? (Math.round(advancePaymentObject.reduce((total, curr) => total + curr.totalPayment, 0))).toLocaleString() : 0}</td>
                                                    <td>₹ {advancePaymentObject.length !== 0 ? (Math.round(advancePaymentObject.reduce((total, curr) => total + curr.totalAdvanceRecieved, 0))).toLocaleString() : 0}</td>
                                                    <td>-</td>
                                                </tr>
                                            </tfoot>
                                        </>
                                    ) : (
                                        <tbody>
                                            <tr>
                                                <td className="particular" colSpan={9}>
                                                    <Nodata />
                                                </td>
                                            </tr>
                                        </tbody>
                                    )
                                )}

                            </table>
                        </div>
                    </div>
                </div>

                {/* ---------------------------------  Remaining Payments Bookings --------------------------------------- */}
                <div className="card todays-booking mt-2 totalbooking" id="remaining-booking"   >

                    <div className="card-header employeedashboard d-flex align-items-center justify-content-between p-1">

                        <div className="dashboard-title">
                            <h2 className="m-0 pl-1">
                                Remaining Payments
                            </h2>
                        </div>
                        <div className="filter-booking d-flex align-items-center">
                            <div className="filter-booking mr-1 d-flex align-items-center" >
                                {/* <div className="export-data">
                                    <button className="btn btn-link" onClick={handleExportBookings}>
                                        Export CSV
                                    </button>
                                </div> */}
                                {/* <div className="filter-title">
                                    <h2 className="m-0 mr-2">
                                        {" "}
                                        Filter Branch : {"  "}
                                    </h2>
                                </div> */}
                                {/* <div className="filter-main ml-2">
                                    <select
                                        className="form-select"
                                        id={`branch-filter`}
                                        onChange={(e) => handleBranchFilterInRemainingPayments(e.target.value)}
                                    >
                                        <option value="" disabled selected>
                                            Select Branch
                                        </option>

                                        <option value={"Gota"}>Gota</option>
                                        <option value={"Sindhu Bhawan"}>
                                            Sindhu Bhawan
                                        </option>
                                        <option value={"none"}>None</option>
                                    </select>
                                </div> */}
                            </div>
                            <div class='input-icon mr-1'>
                                <span class="input-icon-addon">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                                        <path d="M21 21l-6 -6"></path>
                                    </svg>
                                </span>
                                <input
                                    value={searchCompanyServiceNameInRemainingPayments}
                                    onChange={(e) => searchInRemainingPayments(e.target.value)}
                                    className="form-control"
                                    placeholder="Search..."
                                    type="text"
                                    name="remainingPaymentCompany/Service-search"
                                    id="remainingPaymentCompany/Service-search" />
                            </div>
                            <div className="data-filter">
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs} >
                                    <DemoContainer
                                        components={["SingleInputDateRangeField"]} sx={{
                                            padding: '0px',
                                            with: '220px'
                                        }}  >
                                        <DateRangePicker
                                            className="form-control my-date-picker form-control-sm p-0"
                                            onChange={handleDateRangeInRemainingPayments}
                                            slots={{ field: SingleInputDateRangeField }}
                                            slotProps={{
                                                shortcuts: {
                                                    items: shortcutsItems,
                                                },
                                                actionBar: { actions: [] },
                                                textField: {
                                                    InputProps: { endAdornment: <Calendar /> },
                                                },
                                            }}
                                            calendars={1}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </div>
                            {/* <div>
                                <FormControl sx={{ ml: 1, minWidth: 200 }}>
                                    <InputLabel id="demo-select-small-label">Select Employee</InputLabel>
                                    <Select
                                        className="form-control my-date-picker my-mul-select form-control-sm p-0"
                                        labelId="demo-multiple-name-label"
                                        id="demo-multiple-name"
                                        multiple
                                        value={monthBookingPerson}
                                        onChange={(event) => {
                                            setMonthBookingPerson(event.target.value)
                                            handleSelectThisMonthBookingEmployees(event.target.value)
                                        }}
                                        input={<OutlinedInput label="Name" />}
                                        MenuProps={MenuProps}
                                    >
                                        {options.map((name) => (
                                            <MenuItem
                                                key={name}
                                                value={name}
                                                style={getStyles(name, monthBookingPerson, theme)}
                                            >
                                                {name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div> */}
                        </div>

                    </div>
                    <div className="card-body">
                        <div className="row tbl-scroll">
                            <table className="table-vcenter table-nowrap admin-dash-tbl" style={{ maxHeight: "400px" }}>
                                <thead className="admin-dash-tbl-thead">
                                    <tr  >
                                        <th>SR.NO</th>
                                        <th>COMPANY NAME</th>
                                        <th>SERVICE NAME</th>

                                        <th>BDE NAME</th>
                                        <th>BDM NAME</th>
                                        <th style={{ cursor: "pointer" }}
                                            onClick={(e) => {
                                                let updatedSortType;
                                                if (newSortType.remainingTotal === "ascending") {
                                                    updatedSortType = "descending";
                                                } else if (newSortType.remainingTotal === "descending") {
                                                    updatedSortType
                                                        = "none";
                                                } else {
                                                    updatedSortType = "ascending";
                                                }
                                                setNewSortType((prevData) => ({
                                                    ...prevData,
                                                    remainingTotal: updatedSortType,
                                                }));
                                                handleSortRemainingTotal(updatedSortType);
                                            }}><div className="d-flex align-items-center justify-content-between">
                                                <div>REMAINING TOTAL</div>
                                                <div className="short-arrow-div">
                                                    <ArrowDropUpIcon className="up-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.remainingTotal === "descending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                    <ArrowDropDownIcon className="down-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.remainingTotal === "ascending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </th>
                                        <th style={{ cursor: "pointer" }}
                                            onClick={(e) => {
                                                let updatedSortType;
                                                if (newSortType.remainingRecieved === "ascending") {
                                                    updatedSortType = "descending";
                                                } else if (newSortType.remainingRecieved === "descending") {
                                                    updatedSortType
                                                        = "none";
                                                } else {
                                                    updatedSortType = "ascending";
                                                }
                                                setNewSortType((prevData) => ({
                                                    ...prevData,
                                                    remainingRecieved: updatedSortType,
                                                }));
                                                handleSortRemainingReceived(updatedSortType);
                                            }}><div className="d-flex align-items-center justify-content-between">
                                                <div>REMAINING RECEIVED</div>
                                                <div className="short-arrow-div">
                                                    <ArrowDropUpIcon className="up-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.remainingRecieved === "descending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                    <ArrowDropDownIcon className="down-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.remainingRecieved === "ascending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </th>
                                        <th style={{ cursor: "pointer" }}
                                            onClick={(e) => {
                                                let updatedSortType;
                                                if (newSortType.remainingPaymentDate === "ascending") {
                                                    updatedSortType = "descending";
                                                } else if (newSortType.remainingPaymentDate === "descending") {
                                                    updatedSortType
                                                        = "none";
                                                } else {
                                                    updatedSortType = "ascending";
                                                }
                                                setNewSortType((prevData) => ({
                                                    ...prevData,
                                                    remainingPaymentDate: updatedSortType,
                                                }));
                                                handleSortPaymentDateInRemainingPayments(updatedSortType);
                                            }}>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>PAYMENT DATE</div>
                                                <div className="short-arrow-div">
                                                    <ArrowDropUpIcon className="up-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.remainingPaymentDate === "descending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                    <ArrowDropDownIcon className="down-short-arrow"
                                                        style={{
                                                            color:
                                                                newSortType.remainingPaymentDate === "ascending"
                                                                    ? "black"
                                                                    : "#9d8f8f",
                                                        }}
                                                    />
                                                </div>
                                            </div></th>
                                    </tr>
                                </thead>
                                {loading ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan="12">
                                                <div className="LoaderTDSatyle">
                                                    <ClipLoader
                                                        color="lightgrey"
                                                        loading
                                                        size={30}
                                                        aria-label="Loading Spinner"
                                                        data-testid="loader"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    remainingPaymentObject.length !== 0 ? (
                                        <>
                                            <tbody>
                                                {remainingPaymentObject.map((obj, index) => (
                                                    <>
                                                        <tr  >
                                                            <th>{index + 1}</th>
                                                            <th>{obj["Company Name"]}</th>
                                                            <th>{obj.serviceName}</th>
                                                            <th>{obj.bdeName}</th>
                                                            <th>{obj.bdmName}</th>
                                                            <th>
                                                                <div>₹ {Math.round(obj.totalPayment).toLocaleString()}</div>
                                                            </th>
                                                            <th>
                                                                <div>₹ {Math.round(obj.receivedPayment).toLocaleString()}</div>
                                                            </th>
                                                            <th>
                                                                {formatDateFinal(obj.paymentDate)}
                                                            </th>
                                                        </tr>
                                                    </>
                                                ))}

                                            </tbody>
                                            <tfoot className="admin-dash-tbl-tfoot">
                                                <tr>
                                                    <td colSpan={2}>Total:</td>
                                                    <td>-</td>
                                                    <td>-</td>
                                                    <td>{remainingPaymentObject.length}</td>
                                                    <td>₹ {remainingPaymentObject.length !== 0 ? (Math.round(remainingPaymentObject.reduce((total, curr) => total + curr.totalPayment, 0))).toLocaleString() : 0}</td>
                                                    <td>₹ {remainingPaymentObject.length !== 0 ? (Math.round(remainingPaymentObject.reduce((total, curr) => total + curr.receivedPayment, 0))).toLocaleString() : 0}</td>
                                                    {/* <td>₹ {remainingPaymentObject.length !== 0 ? (remainingPaymentObject.reduce((total, curr) => total + curr.pendingPayment, 0)).toLocaleString() : 0}</td> */}
                                                    <td>-</td>
                                                </tr>
                                            </tfoot>
                                        </>
                                    ) : (
                                        <tbody>
                                            <tr>
                                                <td className="particular" colSpan={9}>
                                                    <Nodata />
                                                </td>
                                            </tr>
                                        </tbody>
                                    )
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmployeesThisMonthBooking