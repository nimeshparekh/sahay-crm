import React, { useEffect, useState } from "react";
import { VscCallOutgoing } from "react-icons/vsc";
import { VscCallIncoming } from "react-icons/vsc";
import { TbPhoneCall } from "react-icons/tb";
import { HiOutlinePhoneMissedCall } from "react-icons/hi";
import { MdOutlineCallMissedOutgoing } from "react-icons/md";
import { MdTimer } from "react-icons/md";
import { IoCall } from "react-icons/io5";
import { IoBan } from "react-icons/io5";
import { LuUser2 } from "react-icons/lu";

function EmployeeCallLogs({ employeeData }) {
    const [callData, setCallData] = useState(null);

    // ------------------------  Callizer API   -------------------------------------------

    useEffect(() => {
        const fetchEmployeeData = async () => {
            const apiKey = process.env.REACT_APP_API_KEY; // Ensure this is set in your .env file
            const url = 'https://api1.callyzer.co/v2/call-log/employee-summary';

            const body = {
                "call_from": 1691649001,
                "call_to": 1707197072,
                "call_types": ["Missed", "Rejected", "Incoming", "Outgoing"],
                "emp_numbers": [],
                "duration_les_than": 20,
                "emp_tags": [],
                "is_exclude_numbers": true
            }

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });


                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Error: ${response.status} - ${errorData.message || response.statusText}`);
                }

                const data = await response.json();


                setCallData(data.result.find(obj => obj.emp_number
                    === employeeData.number));
            } catch (err) {

                console.log(err)
            }
        };

        fetchEmployeeData();
    }, []);

    console.log(callData);
    return (
        <div>
            {callData && <div className="dash-card" style={{ minHeight: '299px' }}>
                <div className="dash-card-head d-flex align-items-center justify-content-between">
                    <h2 className="m-0">
                        Your Call Report
                    </h2>
                    <div className="dash-select-filter">
                        <select class="form-select form-select-sm my-filter-select"
                            aria-label=".form-select-sm example"
                        >
                            <option value="Today">Today</option>
                            <option value="This Month">This Month</option>
                            <option value="Last Month">Last Month</option>
                        </select>
                    </div>
                </div>

                <div className="dash-card-body">
                    <div className="row">
                        <div className="col-lg-6 mb-1 mt-2">
                            <div className="call-d-card clr-bg-light-ff8800">
                                <div className="call-d-card-head d-flex align-items-center">
                                    <div className="clr-ff8800 mr-1">
                                        <VscCallOutgoing />
                                    </div>
                                    <div className="clr-ff8800">
                                        Outgoing Calls
                                    </div>
                                </div>
                                <div className="call-d-card-body d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <div className="clr-000">{callData.
                                            total_outgoing_calls
                                        } Calls</div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="timer-I">
                                            <MdTimer />
                                        </div>
                                        <div className="clr-000">
                                           {callData.total_outgoing_duration}s
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 mb-1 mt-2">
                            <div className="call-d-card clr-bg-light-1cba19">
                                <div className="call-d-card-head d-flex align-items-center">
                                    <div className="clr-1cba19 mr-1">
                                        <VscCallIncoming />
                                    </div>
                                    <div className="clr-1cba19">
                                        Incoming Calls
                                    </div>
                                </div>
                                <div className="call-d-card-body d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <div className="clr-000">80 Call</div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="timer-I">
                                            <MdTimer />
                                        </div>
                                        <div className="clr-000">
                                            1h 56m 45s
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 mb-1 mt-2">
                            <div className="call-d-card clr-bg-light-e65b5b">
                                <div className="call-d-card-head d-flex align-items-center">
                                    <div className="clr-e65b5b mr-1">
                                        <MdOutlineCallMissedOutgoing />
                                    </div>
                                    <div className="clr-e65b5b">
                                        Missed Calls
                                    </div>
                                </div>
                                <div className="call-d-card-body d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <div className="clr-000">8 Call</div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="timer-I">

                                        </div>
                                        <div className="clr-000">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 mb-1 mt-2">
                            <div className="call-d-card clr-bg-light-a0b1ad">
                                <div className="call-d-card-head d-flex align-items-center">
                                    <div className="clr-a0b1ad mr-1">
                                        <IoBan />
                                    </div>
                                    <div className="clr-a0b1ad">
                                        Rejected Calls
                                    </div>
                                </div>
                                <div className="call-d-card-body d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <div className="clr-000">8 Call</div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="timer-I">

                                        </div>
                                        <div className="clr-000">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 mb-1 mt-2">
                            <div className="call-d-card clr-bg-light-4299e1">
                                <div className="call-d-card-head d-flex align-items-center">
                                    <div className="clr-4299e1 mr-1">
                                        <TbPhoneCall />
                                    </div>
                                    <div className="clr-4299e1">
                                        Total Calls
                                    </div>
                                </div>
                                <div className="call-d-card-body d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <div className="clr-000">8 Call</div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="timer-I">
                                            <MdTimer />
                                        </div>
                                        <div className="clr-000">
                                            1h 56m 45s
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 mb-1 mt-2">
                            <div className="call-d-card clr-bg-light-ffb900">
                                <div className="call-d-card-head d-flex align-items-center">
                                    <div className="clr-ffb900 mr-1">
                                        <LuUser2 />
                                    </div>
                                    <div className="clr-ffb900">
                                        Unique Clients
                                    </div>
                                </div>
                                <div className="call-d-card-body d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <div className="clr-000">290</div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="timer-I">

                                        </div>
                                        <div className="clr-000">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}
        </div>
    )
}

export default EmployeeCallLogs