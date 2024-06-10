import React, { useRef, useState, useEffect } from 'react'


function EmployeePerformance({redesignedData , data}) {

    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const [employeeData, setEmployeeData] = useState([])
    const [bookingStartDate, setBookingStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [bookingEndDate, setBookingEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
    const [loading, setLoading] = useState(false)
    const [initialDate, setInitialDate] = useState(new Date());
    const currentYear = initialDate.getFullYear();
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

        } catch (error) {
            console.error('Error Fetching Employee Data ', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
     fetchEmployeeInfo()
    }, [])
    
    useEffect(() => {
        if (redesignedData.length !== 0 && employeeData.length !== 0) {
            setEmployeeData(employeeData.sort((a, b) => functionCalculateOnlyAchieved(b.ename) - functionCalculateOnlyAchieved(a.ename)));
        }

    }, [redesignedData])


    // ------------------------------------  function for Calculation  -----------------------------------------

    const functionCalculateOnlyAchieved = (bdeName) => {
        let achievedAmount = 0;
        let remainingAmount = 0;
        let expanse = 0;



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
                if (mainBooking.bdeName === bdeName || mainBooking.bdmName === bdeName) {

                    if (mainBooking.bdeName === mainBooking.bdmName) {
                        achievedAmount = achievedAmount + Math.floor(mainBooking.generatedReceivedAmount);
                        mainBooking.services.map(serv => {
                            // console.log(serv.expanse , bdeName ,"this is services");
                            let expanseDate = null
                            if (serv.expanse) {
                                expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

                                expanseDate.setHours(0, 0, 0, 0);
                                const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                expanse = condition ? expanse + serv.expanse : expanse;
                            }

                        });

                    } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Close-by") {
                        achievedAmount = achievedAmount + Math.floor(mainBooking.generatedReceivedAmount) / 2;
                        mainBooking.services.map(serv => {
                            // console.log(serv.expanse , bdeName ,"this is services");
                            let expanseDate = null
                            if (serv.expanse) {
                                expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

                                expanseDate.setHours(0, 0, 0, 0);
                                const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                expanse = condition ? expanse + serv.expanse / 2 : expanse;
                            }

                        });
                    } else if (mainBooking.bdeName !== mainBooking.bdmName && mainBooking.bdmType === "Supported-by") {
                        if (mainBooking.bdeName === bdeName) {
                            achievedAmount += Math.floor(mainBooking.generatedReceivedAmount);
                            mainBooking.services.map(serv => {
                                // console.log(serv.expanse , bdeName ,"this is services");
                                let expanseDate = null
                                if (serv.expanse) {
                                    expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

                                    expanseDate.setHours(0, 0, 0, 0);
                                    const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                    expanse = condition ? expanse + serv.expanse : expanse;
                                }
                            });
                        }
                    }
                }

            } else if (mainBooking.remainingPayments.length !== 0) {
                mainBooking.remainingPayments.map((remainingObj) => {
                    const moreBookingDate = new Date(remainingObj.paymentDate);

                    moreBookingDate.setHours(0, 0, 0, 0);


                    if (((moreBookingDate >= startDate && moreBookingDate <= endDate) || (isSameDayMonthYear(moreBookingDate, startDate) && isSameDayMonthYear(moreBookingDate, endDate))) && (mainBooking.bdeName === bdeName || mainBooking.bdmName === bdeName)) {
                        const findService = mainBooking.services.find((services) => services.serviceName === remainingObj.serviceName)
                        const tempAmount = findService.withGST ? Math.floor(remainingObj.receivedPayment) / 1.18 : Math.floor(remainingObj.receivedPayment);
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
                const moreBookingDate = new Date(moreObject.bookingDate);
                moreBookingDate.setHours(0, 0, 0, 0);

                if ((moreBookingDate >= startDate && moreBookingDate <= endDate) || (isSameDayMonthYear(moreBookingDate, startDate) && isSameDayMonthYear(moreBookingDate, endDate))) {
                    if (moreObject.bdeName === bdeName || moreObject.bdmName === bdeName) {
                        if (moreObject.bdeName === moreObject.bdmName) {
                            achievedAmount = achievedAmount + Math.floor(moreObject.generatedReceivedAmount);
                            moreObject.services.map(serv => {
                                // console.log(serv.expanse , bdeName ,"this is services");
                                let expanseDate = null
                                if (serv.expanse) {
                                    expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

                                    expanseDate.setHours(0, 0, 0, 0);
                                    const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                    expanse = condition ? expanse + serv.expanse : expanse;
                                }
                            });
                        } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Close-by") {
                            achievedAmount = achievedAmount + Math.floor(moreObject.generatedReceivedAmount) / 2;
                            moreObject.services.map(serv => {
                                // console.log(serv.expanse , bdeName ,"this is services");
                                let expanseDate = null
                                if (serv.expanse) {
                                    expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

                                    expanseDate.setHours(0, 0, 0, 0);
                                    const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                    expanse = condition ? expanse + serv.expanse : expanse;
                                }
                            });
                        } else if (moreObject.bdeName !== moreObject.bdmName && moreObject.bdmType === "Supported-by") {
                            if (moreObject.bdeName === bdeName) {
                                achievedAmount += Math.floor(moreObject.generatedReceivedAmount);
                                moreObject.services.map(serv => {
                                    // console.log(serv.expanse , bdeName ,"this is services");
                                    let expanseDate = null
                                    if (serv.expanse) {
                                        expanseDate = serv.expanseDate ? new Date(serv.expanseDate) : new Date(mainBooking.bookingDate);

                                        expanseDate.setHours(0, 0, 0, 0);
                                        const condition = (expanseDate >= startDate && expanseDate <= endDate || (isSameDayMonthYear(expanseDate, startDate) && isSameDayMonthYear(expanseDate, endDate)))
                                        expanse = condition ? expanse + serv.expanse : expanse;
                                    }
                                });
                            }
                        }
                    }
                } else if (moreObject.remainingPayments.length !== 0) {

                    moreObject.remainingPayments.map((remainingObj) => {
                        const moreRemainingDate = new Date(remainingObj.paymentDate);
                        moreRemainingDate.setHours(0, 0, 0, 0);
                        if (((moreRemainingDate >= startDate && moreRemainingDate <= endDate) || (isSameDayMonthYear(moreRemainingDate, startDate) && isSameDayMonthYear(moreRemainingDate, endDate))) && (moreObject.bdeName === bdeName || moreObject.bdmName === bdeName)) {

                            const findService = moreObject.services.find((services) => services.serviceName === remainingObj.serviceName)
                            const tempAmount = findService.withGST ? Math.floor(remainingObj.receivedPayment) / 1.18 : Math.floor(remainingObj.receivedPayment);
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


        return achievedAmount + Math.floor(remainingAmount) - expanse;
    }
    const functionGetOnlyAmount = (object) => {
        if (object.targetDetails.length !== 0) {
            const foundObject = object.targetDetails.find(
                (item) =>
                    Math.floor(item.year) === currentYear && item.month === currentMonth
            );


            return foundObject ? foundObject.amount : 0;
        } else {
            return 0;
        }
    };

  return (
    <div>
        <div className="dash-card" style={{minHeight:'299px'}}>
                      <div className="dash-card-head">
                          <h2 className="m-0">
                              Top 5 Performer
                          </h2>
                      </div>
                      <div className="dash-card-body table-responsive">
                        <table class="table top_5_table m-0">
                          <thead>
                            <tr>
                              <th>Rank </th>
                              <th>Name</th>
                              <th>Branch</th>
                              <th>Achievement Ratio</th>
                            </tr>
                          </thead>
                         {employeeData.length!==0 && <tbody>

                            <tr className="clr-bg-light-1cba19">
                              <td><div className="ranktd clr-fff clr-bg-1cba19">1</div></td>
                              <td>{employeeData[0].ename === data.ename ? "You" : employeeData[0].ename }</td>
                              <td>{employeeData[0].branchOffice === "Gota" ? "Gota" : "SBR"}</td>
                              <td>{((functionCalculateOnlyAchieved(employeeData[0].ename) / functionGetOnlyAmount(employeeData[0])) * 100).toFixed(2)} %</td>
                            </tr>
                            <tr className="clr-bg-light-ffb900">
                              <td><div className="ranktd clr-bg-ffb900 clr-fff">2</div></td>
                              <td>{employeeData[1].ename === data.ename ? "You" : employeeData[1].ename}</td>
                              <td>{employeeData[1].branchOffice === "Gota" ? "Gota" : "SBR"}</td>
                              <td>{((functionCalculateOnlyAchieved(employeeData[1].ename) / functionGetOnlyAmount(employeeData[1])) * 100).toFixed(2)} %</td>
                            </tr>
                            <tr className="clr-bg-light-00d19d">
                              <td><div className="ranktd  clr-bg-00d19d clr-fff">3</div></td>
                              <td>{employeeData[2].ename === data.ename ? "You" : employeeData[2].ename}</td>
                              <td>{employeeData[2].branchOffice === "Gota" ? "Gota" : "SBR"}</td>
                              <td>{((functionCalculateOnlyAchieved(employeeData[2].ename) / functionGetOnlyAmount(employeeData[2])) * 100).toFixed(2)} %</td>
                            </tr>
                            <tr className="clr-bg-light-e65b5b">
                              <td><div className="ranktd clr-bg-e65b5b clr-fff">4</div></td>
                              <td>{employeeData[3].ename === data.ename ? "You" : employeeData[3].ename}</td>
                              <td>{employeeData[3].branchOffice === "Gota" ? "Gota" : "SBR"}</td>
                              <td>{((functionCalculateOnlyAchieved(employeeData[3].ename) / functionGetOnlyAmount(employeeData[3])) * 100).toFixed(2)} %</td>
                            </tr>
                            <tr className="clr-bg-light-4299e1">
                              <td><div className="ranktd clr-bg-4299e1 clr-fff">5</div></td>
                              <td>{employeeData[4].ename === data.ename ? "You" : employeeData[4].ename}</td>
                              <td>{employeeData[4].branchOffice === "Gota" ? "Gota" : "SBR"}</td>
                              <td>{((functionCalculateOnlyAchieved(employeeData[4].ename) / functionGetOnlyAmount(employeeData[4])) * 100).toFixed(2)} %</td>
                            </tr>
                          </tbody>}
                        </table>
                      </div>
                    </div>
    </div>
  )
}

export default EmployeePerformance