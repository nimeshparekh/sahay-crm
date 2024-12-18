import React, { useState, useEffect } from 'react';
import { GoArrowUp } from "react-icons/go";
import { GoArrowDown } from "react-icons/go";
import { LineChart } from '@mui/x-charts/LineChart';
import GaugeComponent from 'react-gauge-component';
import Box from '@mui/material/Box';



function EmployeeSalesReport({ data, redesignedData, moreEmpData, followData }) {

  //  **************************************   Foprmat dates ********************************************

  function formatDateNow(timestamp) {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }
  function formatDateFinal(timestamp) {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // January is 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  const cleanString = (str) => (str ? str.replace(/\u00A0/g, ' ').replace(/\s+/g, '').toLowerCase() : '');

  //console.log("employeeData", data)


  // ********************************************************************  Declarations ***************************************************************** 

  const [Filterby, setFilterby] = useState("This Month");
  const [showData, setShowData] = useState(false);

  let totalMaturedCount = 0;
  let totalTargetAmount = 0;
  let totalAchievedAmount = 0;


  // ***************************************************************  Functions ***********************************************************

  const functionCalculateMatured = (istrue) => {
    let maturedCount = 0;
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const cleanString = (str) => {
      return str.replace(/\u00A0/g, ' ').trim();
    };

    redesignedData.map((mainBooking) => {
      const bookingDate = new Date(mainBooking.bookingDate);
      let condition = false;

      // Check if the bookingDate is in the current month
      if (Filterby === 'This Month') {
        condition = (bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear);
      }

      if (condition) {
        if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
          maturedCount = maturedCount + 1;
        } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
          maturedCount = maturedCount + 0.5;
        } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Supported-by") {
          if (cleanString(mainBooking.bdeName) === cleanString(data.ename)) {
            maturedCount = maturedCount + 1;
          }
        }
      }

      mainBooking.moreBookings.map((moreObject) => {
        const moreBookingDate = new Date(moreObject.bookingDate);
        let moreCondition = false;

        // Check if the moreBookingDate is in the current month
        if (Filterby === 'This Month') {
          moreCondition = (moreBookingDate.getMonth() === currentMonth && moreBookingDate.getFullYear() === currentYear);
        }

        if (moreCondition) {
          if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
            maturedCount = maturedCount + 1;
          } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
            maturedCount = maturedCount + 0.5;
          } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Supported-by") {
            if (cleanString(moreObject.bdeName) === cleanString(data.ename)) {
              maturedCount = maturedCount + 1;
            }
          }
        }
      });
    });

    totalMaturedCount = totalMaturedCount + maturedCount;
    return maturedCount;
  };

  const functionCalculateAchievedRevenue = (Filterby) => {
    //console.log("yahan chla achieved full function")
    let achievedAmount = 0;
    let remainingAmount = 0;
    let expanse = 0;
    let remainingExpense = 0;
    let remainingMoreExpense = 0;
    let add_caCommision = 0;
    const today = new Date();


    redesignedData.map((mainBooking) => {
      let condition = false;
      switch (Filterby) {
        case 'Today':
          condition = (new Date(mainBooking.bookingDate).toLocaleDateString() === today.toLocaleDateString())
          break;
        case 'Last Month':
          condition = (new Date(mainBooking.bookingDate).getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1)) && (new Date(mainBooking.bookingDate).getFullYear() === today.getFullYear())
          break;
        case 'This Month':
          condition = (new Date(mainBooking.bookingDate).getMonth() === today.getMonth()) && (new Date(mainBooking.bookingDate).getFullYear() === today.getFullYear())
          break;
        default:
          break;
      }
      if (condition && (cleanString(mainBooking.bdeName) === cleanString(data.ename) || cleanString(mainBooking.bdmName) === cleanString(data.ename))) {

        if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
          //achievedAmount = achievedAmount + Math.round(mainBooking.generatedReceivedAmount);
          mainBooking.services.map(serv => {
            if (serv.paymentTerms === "Full Advanced") {
              achievedAmount = achievedAmount + serv.totalPaymentWOGST;
              console.log("Ye add hone ja raha :", mainBooking['Company Name'], serv.totalPaymentWOGST, achievedAmount)

            } else {
              if (serv.withGST) {
                achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18);
                console.log("Ye add hone ja raha :", mainBooking['Company Name'], Math.round(serv.firstPayment), achievedAmount)

              } else {
                achievedAmount = achievedAmount + Math.round(serv.firstPayment);
                console.log("Ye add hone ja raha :", mainBooking['Company Name'], Math.round(serv.firstPayment), achievedAmount)

              }
            }
            // console.log(serv.expanse , bdeName ,"this is services");
            let expanseDate = null
            if (serv.expanse) {
              expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
              expanseDate.setHours(0, 0, 0, 0);
              let expanseCondition = false;
              switch (Filterby) {
                case 'Today':
                  expanseCondition = (new Date(expanseDate).toLocaleDateString() === today.toLocaleDateString())
                  break;
                case 'Last Month':
                  expanseCondition = (new Date(expanseDate).getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1)) && (new Date(expanseDate).getFullYear() === today.getFullYear())
                  break;
                case 'This Month':
                  expanseCondition = (new Date(expanseDate).getMonth() === today.getMonth()) && (new Date(expanseDate).getFullYear() === today.getFullYear())
                  break;
                default:
                  break;
              }
              expanse = expanseCondition ? expanse + serv.expanse : expanse;
            }
          });
          if (mainBooking.caCase === "Yes") {
            add_caCommision += parseInt(mainBooking.caCommission)
          }
        } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
          //achievedAmount = achievedAmount + Math.floor(mainBooking.generatedReceivedAmount) / 2;
          mainBooking.services.map(serv => {
            // console.log(serv.expanse , bdeName ,"this is services");
            if (serv.paymentTerms === "Full Advanced") {
              achievedAmount = achievedAmount + serv.totalPaymentWOGST / 2;
              console.log("Ye add hone ja raha :", mainBooking['Company Name'], serv.totalPaymentWOGST, achievedAmount)

            } else {
              if (serv.withGST) {
                achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18) / 2;
                console.log("Ye add hone ja raha :", mainBooking['Company Name'], Math.round(serv.firstPayment), achievedAmount)

              } else {
                achievedAmount = achievedAmount + Math.round(serv.firstPayment) / 2;
                console.log("Ye add hone ja raha :", mainBooking['Company Name'], Math.round(serv.firstPayment), achievedAmount)

              }
            }
            let expanseDate = null
            expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
            expanseDate.setHours(0, 0, 0, 0);
            if (serv.expanse) {
              let expanseCondition = false;
              switch (Filterby) {
                case 'Today':
                  expanseCondition = (expanseDate.toLocaleDateString() === today.toLocaleDateString())
                  break;
                case 'Last Month':
                  expanseCondition = (expanseDate.getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1)) && (expanseDate.getFullYear() === today.getFullYear())
                  break;
                case 'This Month':
                  expanseCondition = (expanseDate.getMonth() === today.getMonth()) && (expanseDate.getFullYear() === today.getFullYear())
                  break;
                default:
                  break;
              }
              expanse = expanseCondition ? expanse + serv.expanse / 2 : expanse;
            }
          });
          if (mainBooking.caCase === "Yes") {
            add_caCommision += parseInt(mainBooking.caCommission) / 2;
          }
        } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Supported-by") {
          if (cleanString(mainBooking.bdeName) === cleanString(data.ename)) {
            //achievedAmount = achievedAmount + Math.round(mainBooking.generatedReceivedAmount);
            mainBooking.services.map(serv => {
              if (serv.paymentTerms === "Full Advanced") {
                achievedAmount = achievedAmount + serv.totalPaymentWOGST;
                console.log("Ye add hone ja raha :", mainBooking['Company Name'], serv.totalPaymentWOGST, achievedAmount)

              } else {
                if (serv.withGST) {
                  achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18);
                  console.log("Ye add hone ja raha :", mainBooking['Company Name'], Math.round(serv.firstPayment), achievedAmount)

                } else {
                  achievedAmount = achievedAmount + Math.round(serv.firstPayment);
                  console.log("Ye add hone ja raha :", mainBooking['Company Name'], Math.round(serv.firstPayment), achievedAmount)

                }
              }
              // console.log(serv.expanse , bdeName ,"this is services");
              let expanseDate = null
              expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
              expanseDate.setHours(0, 0, 0, 0);
              if (serv.expanse) {
                let expanseCondition = false;
                switch (Filterby) {
                  case 'Today':
                    expanseCondition = (expanseDate.toLocaleDateString() === today.toLocaleDateString())
                    break;
                  case 'Last Month':
                    expanseCondition = (expanseDate.getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1)) && (expanseDate.getFullYear() === today.getFullYear())
                    break;
                  case 'This Month':
                    expanseCondition = (expanseDate.getMonth() === today.getMonth()) && (expanseDate.getFullYear() === today.getFullYear())
                    break;
                  default:
                    break;
                }
                expanse = expanseCondition ? expanse + serv.expanse : expanse;
              }
            });
            if (mainBooking.caCase === "Yes") {
              add_caCommision += parseInt(mainBooking.caCommission);
            }
          }
        }
      }
      if (mainBooking.remainingPayments.length !== 0 && (cleanString(mainBooking.bdeName) === cleanString(data.ename) || cleanString(mainBooking.bdmName) === cleanString(data.ename))) {
        let remainingExpanseCondition = false;
        switch (Filterby) {
          case 'Today':
            remainingExpanseCondition = mainBooking.remainingPayments.some(item => new Date(item.paymentDate).toLocaleDateString() === today.toLocaleDateString())
            break;
          case 'Last Month':
            remainingExpanseCondition = mainBooking.remainingPayments.some(item =>
              new Date(item.paymentDate).getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 1) &&
              new Date(item.paymentDate).getFullYear() === today.getFullYear()
            );
            break;

          case 'This Month':
            remainingExpanseCondition = mainBooking.remainingPayments.some(item =>
              new Date(item.paymentDate).getMonth() === today.getMonth() &&
              new Date(item.paymentDate).getFullYear() === today.getFullYear()
            );
            break;

          default:
            break;
        }

        if (remainingExpanseCondition && Filterby === "This Month") {
          const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
          const endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
          mainBooking.services.forEach(serv => {
            if (serv.expanseDate && new Date(serv.expanseDate) >= startDate && new Date(serv.expanseDate) <= endDate) {
              if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
                remainingExpense += serv.expanse / 2;
              } else if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
                remainingExpense += serv.expanse;
              } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Support-by" && mainBooking.bdemName === cleanString(data.ename)) {
                remainingExpense += serv.expanse;
              }
            }

          });
        }

        mainBooking.remainingPayments.map((remainingObj) => {
          let condition = false;
          switch (Filterby) {
            case 'Today':
              condition = (new Date(remainingObj.paymentDate).toLocaleDateString() === today.toLocaleDateString())
              break;
            case 'Last Month':
              condition = (new Date(remainingObj.paymentDate).getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 1)) &&
                (new Date(remainingObj.paymentDate).getFullYear() === today.getFullYear());
              break;

            case 'This Month':
              condition = (new Date(remainingObj.paymentDate).getMonth() === today.getMonth()) &&
                (new Date(remainingObj.paymentDate).getFullYear() === today.getFullYear());
              break;
            default:
              break;
          }
          if (condition) {
            // Find the service from mainBooking.services
            const findService = mainBooking.services.find(service => service.serviceName === remainingObj.serviceName);
            //console.log("findService", mainBooking["Company Name"], findService)
            // Check if findService is defined
            if (findService) {
              // Calculate the tempAmount based on whether GST is included
              const tempAmount = findService.withGST
                ? Math.round(remainingObj.receivedPayment) / 1.18
                : Math.round(remainingObj.receivedPayment);

              // Update remainingAmount based on conditions
              if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
                remainingAmount += Math.round(tempAmount);
              } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
                remainingAmount += Math.round(tempAmount) / 2;
              } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Supported-by") {
                if (cleanString(mainBooking.bdeName) === cleanString(data.ename)) {
                  remainingAmount += Math.round(tempAmount);
                }
              }
            } else {
              // Optional: Handle the case where findService is undefined
              console.warn(`Service with name ${remainingObj.serviceName} not found.`);
            }
          }
        })
      }

      mainBooking.moreBookings.map((moreObject) => {
        let condition = false;
        switch (Filterby) {
          case 'Today':
            condition = (new Date(moreObject.bookingDate).toLocaleDateString() === today.toLocaleDateString())
            break;
          case 'Last Month':
            condition = (
              new Date(moreObject.bookingDate).getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 1) &&
              new Date(moreObject.bookingDate).getFullYear() === today.getFullYear()
            );
            break;

          case 'This Month':
            condition = (
              new Date(moreObject.bookingDate).getMonth() === today.getMonth() &&
              new Date(moreObject.bookingDate).getFullYear() === today.getFullYear()
            );
            break;
          default:
            break;
        }
        if (condition && (cleanString(moreObject.bdeName) === cleanString(data.ename) || cleanString(moreObject.bdmName) === cleanString(data.ename))) {

          if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
            //achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount);
            moreObject.services.map(serv => {
              if (serv.paymentTerms === "Full Advanced") {
                achievedAmount = achievedAmount + serv.totalPaymentWOGST;
                console.log("Ye add hone ja raha :", mainBooking['Company Name'], serv.totalPaymentWOGST, achievedAmount)

              } else {
                if (serv.withGST) {
                  achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18);
                  console.log("Ye add hone ja raha :", mainBooking['Company Name'], Math.round(serv.firstPayment), achievedAmount)

                } else {
                  achievedAmount = achievedAmount + Math.round(serv.firstPayment);
                  console.log("Ye add hone ja raha :", mainBooking['Company Name'], Math.round(serv.firstPayment), achievedAmount)

                }
              }
              // console.log(serv.expanse , bdeName ,"this is services");
              let expanseDate = null
              expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
              expanseDate.setHours(0, 0, 0, 0);
              if (serv.expanse) {
                let expanseCondition = false;
                switch (Filterby) {
                  case 'Today':
                    expanseCondition = (expanseDate.toLocaleDateString() === today.toLocaleDateString())
                    break;
                  case 'Last Month':
                    expanseCondition = (expanseDate.getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1)) && (expanseDate.getFullYear() === today.getFullYear())
                    break;
                  case 'This Month':
                    expanseCondition = (expanseDate.getMonth() === today.getMonth()) && (expanseDate.getFullYear() === today.getFullYear())
                    break;
                  default:
                    break;
                }
                expanse = expanseCondition ? expanse + serv.expanse : expanse;
              }
            });
            if (moreObject.caCase === "Yes") {
              add_caCommision += parseInt(moreObject.caCommission);
            }
          } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
            //achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount) / 2;
            moreObject.services.map(serv => {
              if (serv.paymentTerms === "Full Advanced") {
                achievedAmount = achievedAmount + serv.totalPaymentWOGST / 2;
                console.log("Ye add hone ja raha :", mainBooking['Company Name'], serv.totalPaymentWOGST, achievedAmount)

              } else {
                if (serv.withGST) {
                  achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18) / 2;
                  console.log("Ye add hone ja raha :", mainBooking['Company Name'], Math.round(serv.firstPayment), achievedAmount)

                } else {
                  achievedAmount = achievedAmount + Math.round(serv.firstPayment) / 2;
                  console.log("Ye add hone ja raha :", mainBooking['Company Name'], Math.round(serv.firstPayment), achievedAmount)

                }
              }
              // console.log(serv.expanse , bdeName ,"this is services");
              let expanseDate = null
              expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
              expanseDate.setHours(0, 0, 0, 0);
              if (serv.expanse) {
                let expanseCondition = false;
                switch (Filterby) {
                  case 'Today':
                    expanseCondition = (expanseDate.toLocaleDateString() === today.toLocaleDateString())
                    break;
                  case 'Last Month':
                    expanseCondition = (expanseDate.getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1)) && (expanseDate.getFullYear() === today.getFullYear())
                    break;
                  case 'This Month':
                    expanseCondition = (expanseDate.getMonth() === today.getMonth()) && (expanseDate.getFullYear() === today.getFullYear())
                    break;
                  default:
                    break;
                }
                expanse = expanseCondition ? expanse + serv.expanse / 2 : expanse;
              }
            });
            if (moreObject.caCase === "Yes") {
              add_caCommision += parseInt(moreObject.caCommission) / 2;
            }
          } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Supported-by") {
            if (cleanString(moreObject.bdeName) === cleanString(data.ename)) {
              //achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount);
              moreObject.services.map(serv => {
                if (serv.paymentTerms === "Full Advanced") {
                  achievedAmount = achievedAmount + serv.totalPaymentWOGST;
                  console.log("Ye add hone ja raha :", mainBooking['Company Name'], serv.totalPaymentWOGST, achievedAmount)

                } else {
                  if (serv.withGST) {
                    achievedAmount = achievedAmount + Math.round(serv.firstPayment / 1.18);
                    console.log("Ye add hone ja raha :", mainBooking['Company Name'], Math.round(serv.firstPayment), achievedAmount)

                  } else {
                    achievedAmount = achievedAmount + Math.round(serv.firstPayment);
                    console.log("Ye add hone ja raha :", mainBooking['Company Name'], Math.round(serv.firstPayment), achievedAmount)

                  }
                }
                // console.log(serv.expanse , bdeName ,"this is services");
                let expanseDate = null
                expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);
                expanseDate.setHours(0, 0, 0, 0);
                if (serv.expanse) {
                  let expanseCondition = false;
                  switch (Filterby) {
                    case 'Today':
                      expanseCondition = (expanseDate.toLocaleDateString() === today.toLocaleDateString())
                      break;
                    case 'Last Month':
                      expanseCondition = (expanseDate.getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1)) && (expanseDate.getFullYear() === today.getFullYear())
                      break;
                    case 'This Month':
                      expanseCondition = (expanseDate.getMonth() === today.getMonth()) && (expanseDate.getFullYear() === today.getFullYear())
                      break;
                    default:
                      break;
                  }
                  expanse = expanseCondition ? expanse + serv.expanse : expanse;
                }
              });
              if (moreObject.caCase === "Yes") {
                add_caCommision += parseInt(moreObject.caCommission);
              }
            }
          }
        }
        if (moreObject.remainingPayments.length !== 0 && (cleanString(moreObject.bdeName) === cleanString(data.ename) || cleanString(moreObject.bdmName) === cleanString(data.ename))) {

          let remainingExpanseCondition = false;
          switch (Filterby) {
            case 'Today':
              remainingExpanseCondition = moreObject.remainingPayments.some(item => new Date(item.paymentDate).toLocaleDateString() === today.toLocaleDateString())
              break;
            case 'Last Month':
              remainingExpanseCondition = moreObject.remainingPayments.some(item =>
                new Date(item.paymentDate).getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 1) &&
                new Date(item.paymentDate).getFullYear() === today.getFullYear()
              );
              break;

            case 'This Month':
              remainingExpanseCondition = moreObject.remainingPayments.some(item =>
                new Date(item.paymentDate).getMonth() === today.getMonth() &&
                new Date(item.paymentDate).getFullYear() === today.getFullYear()
              );
              break;
            default:
              break;
          }

          if (remainingExpanseCondition && Filterby === "This Month") {
            const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
            moreObject.services.forEach(serv => {

              if (serv.expanseDate && new Date(serv.expanseDate) >= startDate && new Date(serv.expanseDate) <= endDate) {
                if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
                  remainingMoreExpense += serv.expanse / 2;
                } else if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
                  remainingMoreExpense += serv.expanse;
                } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Support-by" && moreObject.bdemName === cleanString(data.ename)) {
                  remainingMoreExpense += serv.expanse;
                }
              }

            });
          }

          moreObject.remainingPayments.map((remainingObj) => {
            let condition = false;
            switch (Filterby) {
              case 'Today':
                condition = (new Date(remainingObj.paymentDate).toLocaleDateString() === today.toLocaleDateString())
                break;
              case 'Last Month':
                condition = (new Date(remainingObj.paymentDate).getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 1) &&
                  new Date(remainingObj.paymentDate).getFullYear() === today.getFullYear());
                break;

              case 'This Month':
                condition = (new Date(remainingObj.paymentDate).getMonth() === today.getMonth() &&
                  new Date(remainingObj.paymentDate).getFullYear() === today.getFullYear());
                break;
              default:
                break;
            }
            if (condition) {

              const findService = moreObject.services.find((services) => services.serviceName === remainingObj.serviceName)
              const tempAmount = findService.withGST ? Math.round(remainingObj.receivedPayment) / 1.18 : Math.round(remainingObj.receivedPayment);
              if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
                remainingAmount += Math.round(tempAmount);
              } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
                remainingAmount += Math.round(tempAmount) / 2;
              } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Supported-by") {
                if (cleanString(moreObject.bdeName) === cleanString(data.ename)) {
                  remainingAmount += Math.round(tempAmount);
                }
              }
            }
          })
        }
      })
    })
    console.log("all amounts", achievedAmount, remainingAmount, expanse, remainingExpense, remainingMoreExpense, add_caCommision);
    return achievedAmount + Math.round(remainingAmount) - expanse - remainingExpense - remainingMoreExpense - add_caCommision;
  };




  const functionCalculateAdvanceCollected = () => {
    let achievedAmount = 0;
    let remainingAmount = 0;
    let expanse = 0;
    const today = new Date();
    let add_caCommision = 0;
    const cleanString = (str) => (str ? str.replace(/\s+/g, '').toLowerCase() : '');

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
      if (condition && (cleanString(mainBooking.bdeName) === cleanString(data.ename) || cleanString(mainBooking.bdmName) === cleanString(data.ename))) {

        if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
          achievedAmount = achievedAmount + Math.round(mainBooking.generatedReceivedAmount);
          mainBooking.services.map(serv => {
            expanse = serv.expanse ? expanse + serv.expanse : expanse;
          })
          if (mainBooking.caCase === "Yes") {
            add_caCommision += parseInt(mainBooking.caCommission)
          }
        } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
          achievedAmount = achievedAmount + Math.round(mainBooking.generatedReceivedAmount) / 2;
          mainBooking.services.map(serv => {
            expanse = serv.expanse ? expanse + serv.expanse / 2 : expanse;
          });
          if (mainBooking.caCase === "Yes") {
            add_caCommision += parseInt(mainBooking.caCommission) / 2;
          }
        } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Supported-by") {
          if (cleanString(mainBooking.bdeName) === cleanString(data.ename)) {
            achievedAmount = achievedAmount + Math.round(mainBooking.generatedReceivedAmount);
            mainBooking.services.map(serv => {
              expanse = serv.expanse ? expanse + serv.expanse : expanse;
            });
            if (mainBooking.caCase === "Yes") {
              add_caCommision += parseInt(mainBooking.caCommission);
            }
          }
        }
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
        if (condition && (cleanString(moreObject.bdeName) === cleanString(data.ename) || cleanString(moreObject.bdmName) === cleanString(data.ename))) {

          if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
            achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount);
            moreObject.services.map(serv => {
              expanse = serv.expanse ? expanse + serv.expanse : expanse;
            })
            if (mainBooking.caCase === "Yes") {
              add_caCommision += parseInt(mainBooking.caCommission);
            }
          } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
            achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount) / 2;
            moreObject.services.map(serv => {
              expanse = serv.expanse ? expanse + serv.expanse / 2 : expanse;
            })
            if (mainBooking.caCase === "Yes") {
              add_caCommision += parseInt(mainBooking.caCommission) / 2;
            }
          } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Supported-by") {
            if (cleanString(moreObject.bdeName) === cleanString(data.ename)) {
              achievedAmount = achievedAmount + Math.round(moreObject.generatedReceivedAmount);
              moreObject.services.map(serv => {
                expanse = serv.expanse ? expanse + serv.expanse : expanse;
              })
              if (mainBooking.caCase === "Yes") {
                add_caCommision += parseInt(mainBooking.caCommission);
              }
            }
          }

        }
      })


    })
    return achievedAmount - expanse - add_caCommision;
  };


  const functionCalculateLastMonthRevenue = () => {
    let achievedAmount = 0;
    let remainingAmount = 0;
    let expanse = 0;
    let remainingExpense = 0;
    let remainingMoreExpense = 0;
    let add_caCommision = 0;
    const today = new Date();

    redesignedData.forEach((mainBooking) => {
      const bookingDate = new Date(mainBooking.bookingDate);
      const isLastMonth = (bookingDate.getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 2)) && (bookingDate.getFullYear() === today.getFullYear());

      if (isLastMonth && (cleanString(mainBooking.bdeName) === cleanString(data.ename) || cleanString(mainBooking.bdmName) === cleanString(data.ename))) {
        if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
          achievedAmount += Math.round(mainBooking.generatedReceivedAmount);
          mainBooking.services.forEach((serv) => {
            if (serv.expanse) {
              const expanseDate = new Date(serv.expanseDate || mainBooking.bookingDate);
              expanseDate.setHours(0, 0, 0, 0);
              const isLastMonthExpanse = (new Date(expanseDate).getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 2)) && (new Date(expanseDate).getFullYear() === today.getFullYear());
              expanse = isLastMonthExpanse ? expanse + serv.expanse : expanse;
            }
          });
          if (mainBooking.caCase === "Yes") {
            add_caCommision += parseInt(mainBooking.caCommission);
          }
        } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
          achievedAmount += Math.floor(mainBooking.generatedReceivedAmount) / 2;
          mainBooking.services.forEach((serv) => {
            if (serv.expanse) {
              const expanseDate = new Date(serv.expanseDate || mainBooking.bookingDate);
              expanseDate.setHours(0, 0, 0, 0);
              const isLastMonthExpanse = (new Date(expanseDate).getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 2)) && (new Date(expanseDate).getFullYear() === today.getFullYear());
              expanse = isLastMonthExpanse ? expanse + serv.expanse / 2 : expanse;
            }
          });
          if (mainBooking.caCase === "Yes") {
            add_caCommision += parseInt(mainBooking.caCommission) / 2;
          }
        } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Supported-by" && cleanString(mainBooking.bdeName) === cleanString(data.ename)) {
          achievedAmount += Math.round(mainBooking.generatedReceivedAmount);
          mainBooking.services.forEach((serv) => {
            if (serv.expanse) {
              const expanseDate = new Date(serv.expanseDate || mainBooking.bookingDate);
              expanseDate.setHours(0, 0, 0, 0);
              const isLastMonthExpanse = (new Date(expanseDate).getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 2)) && (new Date(expanseDate).getFullYear() === today.getFullYear());
              expanse = isLastMonthExpanse ? expanse + serv.expanse : expanse;
            }
          });
          if (mainBooking.caCase === "Yes") {
            add_caCommision += parseInt(mainBooking.caCommission);
          }
        }
      } else if (mainBooking.remainingPayments.length !== 0 && (cleanString(mainBooking.bdeName) === cleanString(data.ename) || cleanString(mainBooking.bdmName) === cleanString(data.ename))) {
        const remainingExpanseCondition = mainBooking.remainingPayments.some(item => {
          const paymentDate = new Date(item.paymentDate);
          return paymentDate.getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 2) && paymentDate.getFullYear() === today.getFullYear();
        });

        if (remainingExpanseCondition) {
          const startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1);
          const endDate = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
          mainBooking.services.forEach((serv) => {
            if (serv.expanseDate) {
              const expanseDate = new Date(serv.expanseDate);
              if (expanseDate >= startDate && expanseDate <= endDate) {
                if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
                  remainingExpense += serv.expanse / 2;
                } else if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
                  remainingExpense += serv.expanse;
                } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Support-by" && mainBooking.bdemName === cleanString(data.ename)) {
                  remainingExpense += serv.expanse;
                }
              }
            }
          });
        }

        mainBooking.remainingPayments.forEach((remainingObj) => {
          const paymentDate = new Date(remainingObj.paymentDate);
          const isLastMonthPayment = paymentDate.getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 2) && paymentDate.getFullYear() === today.getFullYear();

          if (isLastMonthPayment) {
            const findService = mainBooking.services.find((services) => cleanString(services.serviceName) === cleanString(remainingObj.serviceName));
            const tempAmount = findService.withGST ? Math.round(remainingObj.receivedPayment) / 1.18 : Math.round(remainingObj.receivedPayment);

            if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
              remainingAmount += Math.round(tempAmount);
            } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
              remainingAmount += Math.round(tempAmount) / 2;
            } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Supported-by" && cleanString(mainBooking.bdeName) === cleanString(data.ename)) {
              remainingAmount += Math.round(tempAmount);
            }
          }
        });
      }

      mainBooking.moreBookings.forEach((moreObject) => {
        const moreBookingDate = new Date(moreObject.bookingDate);
        const isLastMonthMoreBooking = (moreBookingDate.getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 2)) && (moreBookingDate.getFullYear() === today.getFullYear());

        if (isLastMonthMoreBooking && (cleanString(moreObject.bdeName) === cleanString(data.ename) || cleanString(moreObject.bdmName) === cleanString(data.ename))) {
          if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
            achievedAmount += Math.round(moreObject.generatedReceivedAmount);
            moreObject.services.forEach((serv) => {
              if (serv.expanse) {
                const expanseDate = new Date(serv.expanseDate || moreObject.bookingDate);
                expanseDate.setHours(0, 0, 0, 0);
                const isLastMonthExpanse = (expanseDate.getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 2)) && (expanseDate.getFullYear() === today.getFullYear());
                if (isLastMonthExpanse) {
                  expanse += serv.expanse;
                }
              }
            });
            if (moreObject.caCase === "Yes") {
              add_caCommision += parseInt(moreObject.caCommission);
            }
          } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
            achievedAmount += Math.round(moreObject.generatedReceivedAmount) / 2;
            moreObject.services.forEach((serv) => {
              if (serv.expanse) {
                const expanseDate = new Date(serv.expanseDate || moreObject.bookingDate);
                expanseDate.setHours(0, 0, 0, 0);
                const isLastMonthExpanse = (expanseDate.getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 2)) && (expanseDate.getFullYear() === today.getFullYear());
                if (isLastMonthExpanse) {
                  expanse += serv.expanse / 2;
                }
              }
            });
            if (moreObject.caCase === "Yes") {
              add_caCommision += parseInt(moreObject.caCommission) / 2;
            }
          } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Supported-by" && cleanString(moreObject.bdeName) === cleanString(data.ename)) {
            achievedAmount += Math.round(moreObject.generatedReceivedAmount);
            moreObject.services.forEach((serv) => {
              if (serv.expanse) {
                const expanseDate = new Date(serv.expanseDate || moreObject.bookingDate);
                expanseDate.setHours(0, 0, 0, 0);
                const isLastMonthExpanse = (expanseDate.getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 2)) && (expanseDate.getFullYear() === today.getFullYear());
                if (isLastMonthExpanse) {
                  expanse += serv.expanse;
                }
              }
            });
            if (moreObject.caCase === "Yes") {
              add_caCommision += parseInt(moreObject.caCommission);
            }
          }
        }

        if (moreObject.remainingPayments.length !== 0 && (cleanString(moreObject.bdeName) === cleanString(data.ename) || cleanString(moreObject.bdmName) === cleanString(data.ename))) {
          const remainingExpanseCondition = moreObject.remainingPayments.some(item => {
            const paymentDate = new Date(item.paymentDate);
            return paymentDate.getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 2) && paymentDate.getFullYear() === today.getFullYear();
          });

          if (remainingExpanseCondition) {
            const startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1);
            const endDate = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
            moreObject.services.forEach((serv) => {
              if (serv.expanseDate) {
                const expanseDate = new Date(serv.expanseDate);
                if (expanseDate >= startDate && expanseDate <= endDate) {
                  if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
                    remainingMoreExpense += serv.expanse / 2;
                  } else if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
                    remainingMoreExpense += serv.expanse;
                  } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Support-by" && moreObject.bdemName === cleanString(data.ename)) {
                    remainingMoreExpense += serv.expanse;
                  }
                }
              }
            });
          }

          moreObject.remainingPayments.forEach((remainingObj) => {
            const paymentDate = new Date(remainingObj.paymentDate);
            const isLastMonthPayment = paymentDate.getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 2) && paymentDate.getFullYear() === today.getFullYear();

            if (isLastMonthPayment) {
              const findService = moreObject.services.find((services) => cleanString(services.serviceName) === cleanString(remainingObj.serviceName));
              const tempAmount = findService.withGST ? Math.round(remainingObj.receivedPayment) / 1.18 : Math.round(remainingObj.receivedPayment);

              if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
                remainingAmount += Math.round(tempAmount);
              } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
                remainingAmount += Math.round(tempAmount) / 2;
              } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Supported-by" && cleanString(moreObject.bdeName) === cleanString(data.ename)) {
                remainingAmount += Math.round(tempAmount);
              }
            }
          });
        }
      });
    });

    return achievedAmount + Math.round(remainingAmount) - expanse - remainingExpense - remainingMoreExpense - add_caCommision;
  };




  const functionCalculateYesterdayRevenue = () => {
    let achievedAmount = 0;
    let remainingAmount = 0;
    let expanse = 0;
    let remainingExpense = 0;
    let remainingMoreExpense = 0;
    let add_caCommision = 0;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    redesignedData.forEach((mainBooking) => {
      const bookingDate = new Date(mainBooking.bookingDate);
      const isYesterday = bookingDate.toLocaleDateString() === yesterday.toLocaleDateString();

      if (isYesterday && (cleanString(mainBooking.bdeName) === cleanString(data.ename) || cleanString(mainBooking.bdmName) === cleanString(data.ename))) {
        mainBooking.services.forEach(serv => {
          let payment = serv.paymentTerms === "Full Advanced" ? serv.totalPaymentWOGST :
            (serv.withGST ? serv.firstPayment / 1.18 : serv.firstPayment);

          if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
            achievedAmount += payment;
          } else if (mainBooking.bdmType === "Close-by") {
            achievedAmount += payment / 2;
          } else if (mainBooking.bdmType === "Supported-by" && cleanString(mainBooking.bdeName) === cleanString(data.ename)) {
            achievedAmount += payment;
          }

          if (serv.expanse) {
            const expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : bookingDate;
            const isExpanseYesterday = expanseDate.toLocaleDateString() === yesterday.toLocaleDateString();
            if (isExpanseYesterday) {
              if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
                expanse += serv.expanse;
              } else if (mainBooking.bdmType === "Close-by") {
                expanse += serv.expanse / 2;
              } else if (mainBooking.bdmType === "Supported-by" && cleanString(mainBooking.bdeName) === cleanString(data.ename)) {
                expanse += serv.expanse;
              }
            }
          }
        });

        if (mainBooking.caCase === "Yes") {
          add_caCommision += parseInt(mainBooking.caCommission);
          if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName)) {
            add_caCommision /= 2;
          }
        }
      }

      mainBooking.remainingPayments.forEach((remainingObj) => {
        const paymentDate = new Date(remainingObj.paymentDate);
        const isPaymentYesterday = paymentDate.toLocaleDateString() === yesterday.toLocaleDateString();
        if (isPaymentYesterday) {
          const findService = mainBooking.services.find((service) => service.serviceName === remainingObj.serviceName);
          const tempAmount = findService.withGST ? Math.round(remainingObj.receivedPayment / 1.18) : Math.round(remainingObj.receivedPayment);
          if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
            remainingAmount += tempAmount;
          } else if (mainBooking.bdmType === "Close-by") {
            remainingAmount += tempAmount / 2;
          } else if (mainBooking.bdmType === "Supported-by" && cleanString(mainBooking.bdeName) === cleanString(data.ename)) {
            remainingAmount += tempAmount;
          }
        }
      });

      mainBooking.moreBookings.forEach((moreObject) => {
        const moreBookingDate = new Date(moreObject.bookingDate);
        const isMoreBookingYesterday = moreBookingDate.toLocaleDateString() === yesterday.toLocaleDateString();
        if (isMoreBookingYesterday && (cleanString(moreObject.bdeName) === cleanString(data.ename) || cleanString(moreObject.bdmName) === cleanString(data.ename))) {
          moreObject.services.forEach(serv => {
            let payment = serv.paymentTerms === "Full Advanced" ? serv.totalPaymentWOGST :
              (serv.withGST ? serv.firstPayment / 1.18 : serv.firstPayment);

            if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
              achievedAmount += payment;
            } else if (moreObject.bdmType === "Close-by") {
              achievedAmount += payment / 2;
            } else if (moreObject.bdmType === "Supported-by" && cleanString(moreObject.bdeName) === cleanString(data.ename)) {
              achievedAmount += payment;
            }

            if (serv.expanse) {
              const expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : moreBookingDate;
              const isExpanseYesterday = expanseDate.toLocaleDateString() === yesterday.toLocaleDateString();
              if (isExpanseYesterday) {
                if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
                  expanse += serv.expanse;
                } else if (moreObject.bdmType === "Close-by") {
                  expanse += serv.expanse / 2;
                } else if (moreObject.bdmType === "Supported-by" && cleanString(moreObject.bdeName) === cleanString(data.ename)) {
                  expanse += serv.expanse;
                }
              }
            }
          });

          if (moreObject.caCase === "Yes") {
            add_caCommision += parseInt(moreObject.caCommission);
            if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName)) {
              add_caCommision /= 2;
            }
          }
        }
      });

      if (mainBooking.remainingPayments.length !== 0 && (cleanString(mainBooking.bdeName) === cleanString(data.ename) || cleanString(mainBooking.bdmName) === cleanString(data.ename))) {
        const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        mainBooking.services.forEach(serv => {
          if (serv.expanseDate && new Date(serv.expanseDate) >= startDate && new Date(serv.expanseDate) <= endDate) {
            if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
              remainingExpense += serv.expanse / 2;
            } else if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
              remainingExpense += serv.expanse;
            } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Support-by" && mainBooking.bdemName === cleanString(data.ename)) {
              remainingExpense += serv.expanse;
            }
          }
        });
      }
    });

    return achievedAmount + Math.round(remainingAmount) - expanse - remainingExpense - remainingMoreExpense - add_caCommision;
  };



  const functionCalculatePendingRevenue = () => {

    let remainingAmount = 0;
    const today = new Date();


    redesignedData.map((mainBooking) => {

      if (mainBooking.remainingPayments.length !== 0) {
        mainBooking.remainingPayments.map((remainingObj) => {

          let condition = false;
          switch (Filterby) {
            case 'Today':
              condition = (new Date(remainingObj.paymentDate).toLocaleDateString() === today.toLocaleDateString())
              break;
            case 'Last Month':
              condition = (new Date(remainingObj.paymentDate).getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1))
              break;
            case 'This Month':
              condition = (new Date(remainingObj.paymentDate).getMonth() === today.getMonth())
              break;
            default:
              break;
          }
          if (condition) {
            // Find the service from mainBooking.services
            const findService = mainBooking.services.find(service => service.serviceName === remainingObj.serviceName);

            // Check if findService is defined
            if (findService) {
              // Calculate the tempAmount based on whether GST is included
              const tempAmount = findService.withGST
                ? Math.round(remainingObj.receivedPayment) / 1.18
                : Math.round(remainingObj.receivedPayment);

              // Update remainingAmount based on conditions
              if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
                remainingAmount += Math.round(tempAmount);
              } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
                remainingAmount += Math.round(tempAmount) / 2;
              } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Supported-by") {
                if (cleanString(mainBooking.bdeName) === cleanString(data.ename)) {
                  remainingAmount += Math.round(tempAmount);
                }
              }
            } else {
              // Optional: Handle the case where findService is undefined
              console.warn(`Service with name ${remainingObj.serviceName} not found.`);
            }
          }

        })
      }
      mainBooking.moreBookings.map((moreObject) => {
        if (moreObject.remainingPayments.length !== 0) {

          moreObject.remainingPayments.map((remainingObj) => {
            let condition = false;
            switch (Filterby) {
              case 'Today':
                condition = (new Date(remainingObj.paymentDate).toLocaleDateString() === today.toLocaleDateString())
                break;
              case 'Last Month':
                condition = (new Date(remainingObj.paymentDate).getMonth() === (today.getMonth === 0 ? 11 : today.getMonth() - 1))
                break;
              case 'This Month':
                condition = (new Date(remainingObj.paymentDate).getMonth() === today.getMonth())
                break;
              default:
                break;
            }

            if (condition) {
              const findService = moreObject.services.find((services) => services.serviceName === remainingObj.serviceName)
              const tempAmount = findService.withGST ? Math.round(remainingObj.receivedPayment) / 1.18 : Math.round(remainingObj.receivedPayment);
              if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
                remainingAmount += Math.round(tempAmount);
              } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
                remainingAmount += Math.round(tempAmount) / 2;
              } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Supported-by") {
                if (cleanString(moreObject.bdeName) === cleanString(data.ename)) {
                  remainingAmount += Math.round(tempAmount);
                }
              }
            }
          })
        }
      })
    })
    return remainingAmount

  };
  const currentYear = new Date().getFullYear();
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
  const currentMonth = monthNames[new Date().getMonth()];

  function functionCalculateGeneratedRevenue(isBdm) {

    let generatedRevenue = 0;
    const requiredObj = moreEmpData.filter((obj) => formatDateNow(obj.bdmStatusChangeDate) === new Date().toISOString().slice(0, 10) && (obj.bdmAcceptStatus === "Accept") && obj.Status === "Matured");
    requiredObj.forEach((object) => {
      const newObject = isBdm ? redesignedData.find(value => value["Company Name"] === object["Company Name"] && value.bdmName === cleanString(data.ename)) : redesignedData.find(value => value["Company Name"] === object["Company Name"] && value.bdeName === cleanString(data.ename));
      if (newObject) {
        generatedRevenue = generatedRevenue + newObject.generatedReceivedAmount;
      }

    });

    return generatedRevenue;
    //  const generatedRevenue =  redesignedData.reduce((total, obj) => total + obj.receivedAmount, 0);
    //  console.log("This is generated Revenue",requiredObj);

  }


  function functionCalculateGeneratedTotalRevenue(isBdm) {
    let generatedRevenue = 0;
    const requiredObj = moreEmpData.filter((obj) => (obj.bdmAcceptStatus === "Accept") && obj.Status === "Matured");
    requiredObj.forEach((object) => {
      const newObject = isBdm ? redesignedData.find(value => value["Company Name"] === object["Company Name"] && value.bdmName === cleanString(data.ename)) : redesignedData.find(value => value["Company Name"] === object["Company Name"] && value.bdeName === cleanString(data.ename));
      if (newObject) {
        generatedRevenue = generatedRevenue + newObject.generatedReceivedAmount;
      }

    });

    return generatedRevenue;
    //  const generatedRevenue =  redesignedData.reduce((total, obj) => total + obj.receivedAmount, 0);
    //  console.log("This is generated Revenue",requiredObj);

  }

  function functionGetLastBookingDate() {
    // Filter objects based on bdeName
    let tempBookingDate = null;
    // Filter objects based on bdeName
    redesignedData.map((mainBooking) => {
      if (monthNames[new Date(mainBooking.bookingDate).getMonth()] === currentMonth) {
        const bookingDate = new Date(mainBooking.bookingDate);
        tempBookingDate = bookingDate > tempBookingDate ? bookingDate : tempBookingDate;
      }
      mainBooking.moreBookings.map((moreObject) => {
        if (monthNames[new Date(moreObject.bookingDate).getMonth()] === currentMonth) {

          const bookingDate = new Date(moreObject.bookingDate);
          tempBookingDate = bookingDate > tempBookingDate ? bookingDate : tempBookingDate;
        }
      })

    })
    return tempBookingDate ? formatDateFinal(tempBookingDate) : "No Booking";
  }

  const functionCalculateProjections = () => {
    let tempData = [];
    if (Filterby === "Today") {
      tempData = followData.filter((company) => {
        // Assuming you want to filter companies with an estimated payment date for today
        const today = new Date().toISOString().split("T")[0]; // Get today's date in the format 'YYYY-MM-DD'
        return company.estPaymentDate === today;
      });
    } else if (Filterby === "Last Month") {
      tempData = followData.filter((company) => {
        // Assuming you want to filter companies with an estimated payment date for today
        const today = new Date().getMonth(); // Get today's date in the format 'YYYY-MM-DD'
        let month = today;
        if (today === 0) {
          month = 11;
        } else {
          month = today - 1
        }
        return new Date(company.estPaymentDate).getMonth() === month;
      });
    } else if (Filterby === "This Month") {
      tempData = followData.filter((company) => {
        // Assuming you want to filter companies with an estimated payment date for today
        const today = new Date().getMonth(); // Get today's date in the format 'YYYY-MM-DD'
        return new Date(company.estPaymentDate).getMonth() === today;
      });
    }

    const value = tempData.reduce((total, obj) => total + obj.totalPayment, 0);

    return value;
  }

  const functionGetAmount = () => {

    let currentMonth = monthNames[new Date().getMonth()];

    if (Filterby === "Last Month") {
      currentMonth = monthNames[new Date().getMonth() - 1];
    }


    if (data.length === 0) {
      return 0; // Return 0 if data is false
    }

    const object = data;
    const targetDetails = object.targetDetails;

    if (targetDetails.length === 0) {
      return 0; // Return 0 if targetDetails array is empty
    }

    const foundObject = targetDetails.find(
      (item) => Math.round(item.year) === currentYear && item.month === currentMonth
    );

    if (!foundObject) {
      return 0; // Return 0 if no matching object is found
    }

    const amount = Math.round(foundObject.amount);
    totalTargetAmount += amount; // Increment totalTargetAmount by amount


    return amount;
  };
  // const improvement = Filterby === "Today" ? Math.round((functionCalculateAchievedRevenue() / functionGetAmount() * 100) - (functionCalculateYesterdayRevenue() / functionGetAmount() * 100)) :
  //   Math.round((functionCalculateAchievedRevenue() / functionGetAmount() * 100) - (functionCalculateLastMonthRevenue() / functionGetAmount() * 100));

  //-------------function for projection chart----------------------------------
  const [selectedMonthOption, setSelectedMonthOption] = useState("This Month");
  const AchivedData = [5000, 10000, 80000, 5200, 8200, 3200, 4200];
  const [xLabels, setXLabels] = useState([]);
  const [projectionData, setProjectionData] = useState([]);
  const [achievedData, setAchievedData] = useState([]);
  const [newFollowData, setNewFollowData] = useState([]);
  const [displayXLabesl, setDisplayXLabesl] = useState([
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31']);

  const yLabels = [
    '100000',
    '75000',
    '50000',
    '25000',
    '10000',
    '5000',
    '0',
  ];

  const generateDatesTillToday = (period) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const datesArray = [];


    if (selectedMonthOption === 'This Week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Get the start of the week (Monday)
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        datesArray.push(`${date.getMonth() + 1}/${date.getDate()}`);
      }
    } else if (selectedMonthOption === 'This Month') {
      for (let i = 1; i <= currentDay; i++) {
        datesArray.push(`${currentMonth + 1}/${i}`);
      }
    } else if (selectedMonthOption === 'Last Month') {
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = lastMonth === 11 ? currentYear - 1 : currentYear;
      const daysInLastMonth = new Date(lastMonthYear, lastMonth + 1, 0).getDate();

      // Dates of the last month
      for (let i = 1; i <= daysInLastMonth; i++) {
        datesArray.push(`${lastMonth + 1}/${i}`);
      }

      // Dates of the current month up to today

    }

    return datesArray;
  };


  const getProjectionData = (newFollowData, xLabels) => {
    const projectionData = new Array(xLabels.length).fill(0);
    const tempAchievedData = new Array(xLabels.length).fill(0);
    const targetDateStr = '7/27'; // 27-07-2024 in mm/dd format
    const targetYear = 2024; // Specify the year you want to filter by
    const targetMonth = 7; // Specify the month you want to filter by (July)

    const cleanString = (str) => (str ? str.replace(/\u00A0/g, ' ').replace(/\s+/g, '').toLowerCase() : '');

    newFollowData.forEach(item => {
      const paymentDate = new Date(item.estPaymentDate);
      const dateStr = `${paymentDate.getMonth() + 1}/${paymentDate.getDate()}`;
      const index = xLabels.indexOf(dateStr);
      if (index !== -1) {
        projectionData[index] += item.totalPayment;
      }
    });

    redesignedData.forEach(mainBooking => {
      console.log("mainbooking", mainBooking)
      const paymentDate = new Date(mainBooking.bookingDate);
      const bookingYear = paymentDate.getFullYear();
      const bookingMonth = paymentDate.getMonth() + 1; // Months are 0-based
      const dateStr = `${bookingMonth}/${paymentDate.getDate()}`;
      const index = xLabels.indexOf(dateStr);

      if (index !== -1 && bookingYear === targetYear && (cleanString(mainBooking.bdeName) === cleanString(data.ename) || cleanString(mainBooking.bdmName) === cleanString(data.ename))) {
        mainBooking.services.forEach(service => {
          if (service.paymentTerms === "Full Advanced") {
            if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
              console.log("yahan add hua", parseInt(service.totalPaymentWOGST))
              tempAchievedData[index] += parseInt(service.totalPaymentWOGST);
            } else if ((cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName)) && mainBooking.bdmType === "Close-by") {
              console.log("yahan add hua", parseInt(service.totalPaymentWOGST))
              tempAchievedData[index] += parseInt(service.totalPaymentWOGST) / 2;
            } else if ((cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName)) && mainBooking.bdmType === "Supported-by") {
              if (cleanString(mainBooking.bdeName) === cleanString(data.ename)) {
                console.log("yahan add hua", parseInt(service.totalPaymentWOGST))
                tempAchievedData[index] += parseInt(service.totalPaymentWOGST);
              }
            }
          } else {
            const payment = service.withGST ? parseInt(service.firstPayment) / 1.18 : parseInt(service.firstPayment);
            if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
              console.log("yahan add hua", parseInt(payment))
              tempAchievedData[index] += parseInt(payment);
            } else if ((cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName)) && mainBooking.bdmType === "Close-by") {
              console.log("yahan add hua", parseInt(payment), service)
              tempAchievedData[index] += parseInt(payment) / 2;
            } else if ((cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName)) && mainBooking.bdmType === "Supported-by") {
              if (cleanString(mainBooking.bdeName) === cleanString(data.ename)) {
                console.log("yahan add hua", parseInt(payment))
                tempAchievedData[index] += parseInt(payment);
              }
            }
          }
        });
      }

      mainBooking.remainingPayments.length !== 0 && mainBooking.remainingPayments.forEach((rmObject) => {
        const paymentDate = new Date(rmObject.paymentDate);
        const rmYear = paymentDate.getFullYear();
        const rmMonth = paymentDate.getMonth() + 1; // Months are 0-based
        const dateStr = `${rmMonth}/${paymentDate.getDate()}`;
        const index = xLabels.indexOf(dateStr);

        if (index !== -1 && rmYear === targetYear && (cleanString(mainBooking.bdeName) === cleanString(data.ename) || cleanString(mainBooking.bdeName) === cleanString(data.ename))) {
          const serviceObject = mainBooking.services.filter(service => service.serviceName === rmObject.serviceName)[0];
          if (cleanString(mainBooking.bdeName) === cleanString(mainBooking.bdmName)) {
            const payment = serviceObject.withGST ? parseInt(rmObject.receivedPayment) / 1.18 : parseInt(rmObject.receivedPayment);
            tempAchievedData[index] += parseInt(payment);
          } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Close-by") {
            const payment = serviceObject.withGST ? parseInt(rmObject.receivedPayment) / 1.18 : parseInt(rmObject.receivedPayment);
            tempAchievedData[index] += parseInt(payment) / 2;
          } else if (cleanString(mainBooking.bdeName) !== cleanString(mainBooking.bdmName) && mainBooking.bdmType === "Supported-by") {
            if (cleanString(mainBooking.bdeName) === cleanString(data.ename)) {
              const payment = serviceObject.withGST ? parseInt(rmObject.receivedPayment) / 1.18 : parseInt(rmObject.receivedPayment);
              tempAchievedData[index] += parseInt(payment);
            }
          }
        }
      });

      mainBooking.moreBookings.forEach((moreObject) => {
        const paymentDate = new Date(moreObject.bookingDate);
        const moreYear = paymentDate.getFullYear();
        const moreMonth = paymentDate.getMonth() + 1; // Months are 0-based
        const dateStr = `${moreMonth}/${paymentDate.getDate()}`;
        const index = xLabels.indexOf(dateStr);
        if (index !== -1 && moreYear === targetYear && (cleanString(moreObject.bdeName) === cleanString(data.ename) || cleanString(moreObject.bdmName) === cleanString(data.ename))) {
          moreObject.services.forEach(service => {
            if (service.paymentTerms === "Full Advanced") {

              if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
                console.log("yahan add hua", parseInt(service.totalPaymentWOGST))
                tempAchievedData[index] += parseInt(service.totalPaymentWOGST);
              } else if ((cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName)) && moreObject.bdmType === "Close-by") {
                console.log("yahan add hua", parseInt(service.totalPaymentWOGST))
                tempAchievedData[index] += parseInt(service.totalPaymentWOGST) / 2;
              } else if ((cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName)) && moreObject.bdmType === "Supported-by") {
                if (cleanString(moreObject.bdeName) === cleanString(data.ename)) {
                  console.log("yahan add hua", parseInt(service.totalPaymentWOGST))
                  tempAchievedData[index] += parseInt(service.totalPaymentWOGST);
                }
              }
            } else {
              const payment = service.withGST ? parseInt(service.firstPayment) / 1.18 : parseInt(service.firstPayment);
              if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
                console.log("yahan add hua", parseInt(payment))
                tempAchievedData[index] += parseInt(payment);
              } else if ((cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName)) && moreObject.bdmType === "Close-by") {
                console.log("yahan add hua", parseInt(payment))
                tempAchievedData[index] += parseInt(payment) / 2;
              } else if ((cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName)) && moreObject.bdmType === "Supported-by") {
                if (cleanString(moreObject.bdeName) === cleanString(data.ename)) {
                  console.log("yahan add hua", parseInt(payment))
                  tempAchievedData[index] += parseInt(payment);
                }
              }
            }
          });

          moreObject.remainingPayments.length !== 0 && moreObject.remainingPayments.forEach((rmObject) => {
            const paymentDate = new Date(rmObject.paymentDate);
            const rmYear = paymentDate.getFullYear();
            const rmMonth = paymentDate.getMonth() + 1; // Months are 0-based
            const dateStr = `${rmMonth}/${paymentDate.getDate()}`;
            const index = xLabels.indexOf(dateStr);


            if (index !== -1 && rmYear === targetYear && (cleanString(moreObject.bdeName) === cleanString(data.ename) || cleanString(moreObject.bdeName) === cleanString(data.ename))) {
              const serviceObject = moreObject.services.filter(service => service.serviceName === rmObject.serviceName)[0];
              if (cleanString(moreObject.bdeName) === cleanString(moreObject.bdmName)) {
                const payment = serviceObject.withGST ? parseInt(rmObject.receivedPayment) / 1.18 : parseInt(rmObject.receivedPayment);
                tempAchievedData[index] += parseInt(payment);
              } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Close-by") {
                const payment = serviceObject.withGST ? parseInt(rmObject.receivedPayment) / 1.18 : parseInt(rmObject.receivedPayment);
                tempAchievedData[index] += parseInt(payment) / 2;
              } else if (cleanString(moreObject.bdeName) !== cleanString(moreObject.bdmName) && moreObject.bdmType === "Supported-by") {
                if (cleanString(moreObject.bdeName) === cleanString(data.ename)) {
                  const payment = serviceObject.withGST ? parseInt(rmObject.receivedPayment) / 1.18 : parseInt(rmObject.receivedPayment);
                  tempAchievedData[index] += parseInt(payment);
                }
              }
            }
          });
        }
      });
    });
    console.log("tempAchievedData", tempAchievedData)

    setAchievedData(tempAchievedData);

    const achievedDataForSpecificDate = {};
    const specificDateIndex = xLabels.indexOf(targetDateStr);
    if (specificDateIndex !== -1) {
      achievedDataForSpecificDate[targetDateStr] = tempAchievedData[specificDateIndex];
    }

    //console.log(`Achieved Data for ${targetDateStr}:`, achievedDataForSpecificDate);

    return projectionData;
  };

  const normalizeDate = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  //console.log(xLabels)
  useEffect(() => {
    const labels = generateDatesTillToday(selectedMonthOption);
    setXLabels(labels);
    setDisplayXLabesl(labels.map(item => item.split('/')[1]))
    // Filter followData based on selectedMonthOption
    let filteredData = [];
    const today = normalizeDate(new Date());
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    if (selectedMonthOption === 'This Week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0); // Set time to midnight

      filteredData = followData.filter((obj) => {
        const paymentDate = normalizeDate(new Date(obj.estPaymentDate));

        return paymentDate >= startOfWeek && paymentDate <= today && obj.caseType !== 'Recieved';
      });
    } else if (selectedMonthOption === 'This Month') {
      filteredData = followData.filter((obj) => {
        const paymentDate = new Date(obj.estPaymentDate);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear && obj.caseType !== 'Recieved';
      });
    } else if (selectedMonthOption === 'Last Month') {
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = lastMonth === 11 ? currentYear - 1 : currentYear;
      filteredData = followData.filter((obj) => {
        const paymentDate = new Date(obj.estPaymentDate);
        return (
          (paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === lastMonthYear) ||
          (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) &&
          (obj.caseType !== 'Recieved')
        );
      });
    }

    setNewFollowData(filteredData);

    const data = getProjectionData(filteredData, labels);

    setProjectionData(data);

  }, [selectedMonthOption, followData, redesignedData]);

  const calculateImprovement = (Filterby) => {
    let achievedRevenue;
    let comparisonRevenue;

    switch (Filterby) {
      case "Today":
        achievedRevenue = functionCalculateAchievedRevenue("Today");
        comparisonRevenue = functionCalculateYesterdayRevenue();
        break;
      case "Last Month":
        achievedRevenue = functionCalculateAchievedRevenue("Last Month");
        comparisonRevenue = functionCalculateLastMonthRevenue();
        break;
      case "This Month":
        achievedRevenue = functionCalculateAchievedRevenue("This Month");
        comparisonRevenue = functionCalculateAchievedRevenue("Last Month");
        break;
      default:
        return { improvement: 0, arrowImprovement: 0 }; // Handle default case if needed
    }

    const arrowImprovement = (achievedRevenue / comparisonRevenue) * 100;
    const improvement = ((achievedRevenue - comparisonRevenue) / comparisonRevenue) * 100;
    // console.log(achievedRevenue, comparisonRevenue, improvement, arrowImprovement);

    return {
      improvement: parseFloat(improvement.toFixed(2)) || 0,
      arrowImprovement: parseFloat(arrowImprovement.toFixed(2)) || 0
    };
  };

  const calculateMonthsDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return months;
  };

  // Check if the employee has completed 3 months
  const hasCompletedThreeMonths = (joiningDate) => {
    const currentDate = new Date();
    const monthsDifference = calculateMonthsDifference(joiningDate, currentDate);
    return monthsDifference >= 3;
  };

  // Helper function to determine incentive percentage
  const getIncentivePercentage = (filterby) => {
    const targetDate = new Date(2024, 11, 1); // December 2024 (1st day of December)
    const currentDate = new Date(); // Today's date
    let filterDate;

    if (filterby === "This Month") {
      // Set filterDate to the start of the current month
      filterDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    } else if (filterby === "Last Month") {
      // Set filterDate to the start of the last month
      filterDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    } else if (filterby === "Today") {
      // Set filterDate to today
      filterDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    } else {
      // Default to current date if filterby is unrecognized
      filterDate = currentDate;
    }

    console.log("Filter Date:", filterDate, "Target Date:", targetDate);

    // Check if the filterDate is December 2024 or later
    if (filterDate >= targetDate) {
      return 15; // 15% incentive for December 2024 and beyond
    } else {
      return 10; // 10% incentive for months before December 2024
    }
  };


  const { improvement, arrowImprovement } = calculateImprovement(Filterby);


  return (
    <div>
      <div className="dash-card">
        <div className="row">
          {/* sales report data*/}
          <div className="col-sm-5">
            <div className="dash-sales-report-data">
              <div className="dash-srd-head-name">
                <div className="d-flex align-items-top justify-content-between">
                  <div>
                    <h2 className="m-0">Sales Report</h2>
                    <div className="dash-select-filter">
                      <select value={Filterby} onChange={(e) => setFilterby(e.target.value)} class="form-select form-select-sm my-filter-select" aria-label=".form-select-sm example">
                        <option value="Today" >Today</option>
                        <option value="This Month">This Month</option>
                        <option value="Last Month">Last Month</option>
                      </select>
                    </div>
                  </div>
                  <div className="dash-select-filte-show-hide">
                    <div class="form-check form-switch d-flex align-items-center justify-content-center mt-1 mb-0">
                      <label class="form-check-label" for="flexSwitchCheckDefault">Show Numbers</label>
                      <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault" onChange={() => setShowData(!showData)} checked={showData} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="dash-srd-body-data">
                <div className="row">
                  <div className="col-sm-7 p-0">
                    <div className="dsrd-body-data-num">
                      <label className="m-0 dash-Revenue-label">Revenue</label>
                      <h2 className="m-0 dash-Revenue-amnt">₹  {showData ? parseInt(functionCalculateAchievedRevenue(Filterby)).toLocaleString() : "XXXXXX"} /-</h2>
                      <div className="d-flex aling-items-center mt-1">
                        {arrowImprovement > 100 ? <div className="dsrd-Revenue-up-ration d-flex aling-items-center">
                          <GoArrowUp />
                          <div>{improvement} %</div>
                        </div> : <div style={{ backgroundColor: "#ffecec", color: '#c61f1f' }} className="dsrd-Revenue-up-ration d-flex aling-items-center">
                          <GoArrowDown />
                          <div>{Math.abs(improvement)} %</div>
                        </div>}
                        {/* {Filterby !== "Today" ? <div className="dsrd-Revenue-lastmonthfixamnt">
                          vs Last Month: ₹ {showData ? functionCalculateLastMonthRevenue() : "XXXXXX"}
                        </div> : <div className="dsrd-Revenue-lastmonthfixamnt">
                          vs Yesterday's Collection: ₹ {showData ? functionCalculateYesterdayRevenue() : "XXXXXX"}
                        </div>} */}
                        {Filterby === "This Month" && <div className="dsrd-Revenue-lastmonthfixamnt">
                          vs Last Month: ₹ {showData ? parseInt(functionCalculateAchievedRevenue("Last Month")).toLocaleString() : "XXXXXX"}
                        </div>}
                        {Filterby === "Last Month" && <div className="dsrd-Revenue-lastmonthfixamnt">
                          vs Last Month: ₹ {showData ? parseInt(functionCalculateLastMonthRevenue()).toLocaleString() : "XXXXXX"}
                        </div>}
                        {Filterby === "Today" && <div className="dsrd-Revenue-lastmonthfixamnt">
                          vs Yesterday's Collection: ₹ {showData ? parseInt(functionCalculateYesterdayRevenue()).toLocaleString() : "XXXXXX"}
                        </div>}
                      </div>
                      <div className="dsrd-TARGET-INCENTIVE">
                        TARGET - <b>₹ {showData ? functionGetAmount().toLocaleString() : "XXXXX"}</b> |
                        INCENTIVE - <b>₹
                          {showData
                            ? (hasCompletedThreeMonths(data.jdate)
                              ? (functionGetAmount() < functionCalculateAchievedRevenue(Filterby)
                                ? (() => {
                                  const achievedRevenue = functionCalculateAchievedRevenue(Filterby);
                                  const targetAmount = functionGetAmount();
                                  const incentiveRate = getIncentivePercentage(Filterby) / 100; // Pass filterby directly
                                  const incentiveAmount = (achievedRevenue - targetAmount) * incentiveRate;

                                  // Debugging logs
                                  console.log("Achieved Revenue:", achievedRevenue);
                                  console.log("Target Amount:", targetAmount);
                                  console.log("Incentive Rate:", incentiveRate);
                                  console.log("Incentive Amount:", incentiveAmount);

                                  return parseInt(incentiveAmount).toLocaleString();
                                })()
                                : 0)
                              : 0)
                            : "XXXXX"}
                        </b>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-5 p-0">
                    <div>
                      <GaugeComponent
                        width="226.7375030517578"
                        height="178.5768051147461"
                        marginInPercent={{ top: 0.03, bottom: 0.05, left: 0.07, right: 0.07 }}
                        value={Math.round((functionCalculateAchievedRevenue(Filterby) / functionGetAmount() * 100).toFixed(2) > 100 ? 100 : (functionCalculateAchievedRevenue(Filterby) / functionGetAmount() * 100).toFixed(2))}
                        type="radial"
                        labels={{
                          tickLabels: {
                            type: "inner",
                            ticks: [
                              { value: 20 },
                              { value: 40 },
                              { value: 60 },
                              { value: 80 },
                              { value: 100 }
                            ]
                          }
                        }}
                        arc={{
                          colorArray: ['#EA4228', '#5BE12C'],
                          subArcs: [{ limit: 10 }, { limit: 30 }, {}, {}, {}],
                          padding: 0.02,
                          width: 0.1
                        }}
                        pointer={{
                          elastic: true,
                          animationDelay: 0,
                          length: 0.60,
                        }}
                        className="my-speed"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="dash-srd-body-footer">
                <div className="row">
                  <div className="col-sm-4">
                    <div className="dsrd-mini-card bdr-l-clr-1cba19">
                      <div className="dsrd-mini-card-num">
                        {functionCalculateMatured()}
                      </div>
                      <div className="dsrd-mini-card-name">
                        Mature Leads
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="dsrd-mini-card bdr-l-clr-00d19d">
                      <div className="dsrd-mini-card-num">
                        ₹ {showData ? functionCalculateAdvanceCollected().toLocaleString() : "XXXXX"}
                      </div>
                      <div className="dsrd-mini-card-name">
                        Advance collected
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="dsrd-mini-card bdr-l-clr-e65b5b">
                      <div className="dsrd-mini-card-num">
                        ₹ {showData ? functionCalculatePendingRevenue().toLocaleString() : "XXXXX"}
                      </div>
                      <div className="dsrd-mini-card-name">
                        Remaining Collected
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="dsrd-mini-card bdr-l-clr-a0b1ad">
                      <div className="dsrd-mini-card-num">
                        ₹ {showData ? functionCalculateYesterdayRevenue().toLocaleString() : "XXXXX"}
                      </div>
                      <div className="dsrd-mini-card-name">
                        Yesterday Collected
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="dsrd-mini-card bdr-l-clr-ffb900">
                      <div className="dsrd-mini-card-num">
                        ₹ {functionCalculateProjections()}
                      </div>
                      <div className="dsrd-mini-card-name">
                        Projected Amount
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="dsrd-mini-card bdr-l-clr-4299e1">
                      <div className="dsrd-mini-card-num">
                        {functionGetLastBookingDate()}
                      </div>
                      <div className="dsrd-mini-card-name">
                        Last Booking Date
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* sales report chart*/}
          <div className="col-sm-7">
            <div className="dash-sales-report-chart">
              <div className="d-flex justify-content-end">
                <div className="dash-select-filter mt-2">
                  <select class="form-select form-select-sm my-filter-select"
                    aria-label=".form-select-sm example"
                    value={selectedMonthOption}
                    onChange={(e) => setSelectedMonthOption(e.target.value)}>
                    <option value="This Week">This week</option>
                    <option value="This Month" selected>This Month</option>
                    <option value="Last Month">Last Month</option>
                  </select>
                </div>
              </div>
              <Box>
                <LineChart
                  height={320}
                  margin={{ left: 60 }}
                  series={[
                    { data: achievedData, label: 'Achieved', color: '#1cba19', stroke: 2 },
                    { data: projectionData, label: 'Projection', color: '#ffb900', stroke: 3 },
                  ]}
                  xAxis={[{
                    scaleType: 'point', data: displayXLabesl, label: 'Days',
                    axisLine: {
                      stroke: '#eee', // Color for the x-axis line
                      fill: '#ccc'
                    },
                    tick: {
                      stroke: '#eee', // Color for the x-axis ticks
                      fontSize: '10px',
                      fill: '#eee', // Color for the x-axis labels
                    },
                  }]}
                  yAxis={[{
                    data: yLabels,
                    axisLine: {
                      stroke: '#eee !important', // Color for the y-axis line
                    },
                    tick: {
                      stroke: '#eee', // Color for the y-axis ticks
                      fontSize: '10px',
                      fill: '#eee', // Color for the y-axis labels
                    },
                  }]}
                  grid={{ vertical: false, horizontal: true, color: '#eee' }}
                />
              </Box>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeSalesReport