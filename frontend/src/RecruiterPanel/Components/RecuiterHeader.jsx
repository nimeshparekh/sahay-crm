
import React, { useEffect, useState } from "react";
import "../../dist/css/tabler.min.css?1684106062";
import "../../dist/css/tabler-flags.min.css?1684106062";
import "../../dist/css/tabler-payments.min.css?1684106062";
import "../../dist/css/tabler-vendors.min.css?1684106062";
import "../../dist/css/demo.min.css?1684106062";
import myImage from "../../static/mainLogo.png";
import Avatar from '@mui/material/Avatar';
import MaleEmployee from "../../static/EmployeeImg/office-man.png";
import FemaleEmployee from "../../static/EmployeeImg/woman.png";
import { SnackbarProvider, enqueueSnackbar, MaterialDesignContent } from 'notistack';
import notification_audio from "../../assets/media/notification_tone.mp3";
import ReportComplete from "../../components/ReportComplete.jsx";
import RecruiterBell from "./RecruiterBell.jsx";
import RecruiterNotification from "./RecruiterNotification.jsx";
import axios from "axios";
import io from 'socket.io-client';

function RecruiterHeader({ id, name, empProfile, gender, designation }) {

    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const [socketID, setSocketID] = useState("");

    useEffect(() => {
        const socket = secretKey === "http://localhost:3001/api" ? io("http://localhost:3001") : io("wss://startupsahay.in", {
            secure: true, // Use HTTPS
            path: '/socket.io',
            reconnection: true,
            transports: ['websocket'],
        });

        socket.on("connect", () => {
            //console.log("Socket connected with ID:", socket.id);
            console.log('Connection Successful to socket io')
            setSocketID(socket.id);
        });

        // Listen for the 'welcome' event from the server
        // socket.on("adminexecutive-letter-updated", (res) => {
        //   console.log("socketchala" , res.updatedDocument)
        //   if(res.updatedDocument){
        //     enqueueSnackbar(`Letter Status updated for ${res.updatedDocument["Company Name"]}`, 
        //       { variant: "reportComplete" , 
        //         persist:true 
        //       });

        //     const audioplayer = new Audio(notification_audio);
        //     audioplayer.play();
        //   }
        // });
        return () => {
            socket.disconnect();
        };
    }, []);

    const activeStatus = async () => {
        if (id && socketID) {
            try {
                console.log("Request is sending for" + socketID + " " + id)
                const response = await axios.put(`${secretKey}/employee/online-status/${id}/${socketID}`);
                //console.log(response.data); // Log response for debugging
                return response.data; // Return response data if needed
            } catch (error) {
                console.error("Error:", error);
                throw error; // Throw error for handling in the caller function
            }
        } else {
            console.log(id, socketID, "This is it")
        }
    };

    useEffect(() => {
        const checkAndRunActiveStatus = () => {
            if (id) {
                activeStatus();
            } else {
                const intervalId = setInterval(() => {
                    if (id) {
                        activeStatus();
                        clearInterval(intervalId);
                    }
                }, 1000);
                return () => clearInterval(intervalId); // Cleanup interval on unmount
            }
        };

        const timerId = setTimeout(() => {
            checkAndRunActiveStatus();
        }, 2000);

        return () => {
            clearTimeout(timerId);
        };
    }, [socketID, id]);

    return (
        <div>
            <header className="navbar navbar-expand-md d-print-none">
                <div className="container-xl">
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbar-menu"
                        aria-controls="navbar-menu"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <h1 className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
                        <img
                            src={myImage}
                            width="110"
                            height="32"
                            alt="Start-Up Sahay"
                            className="navbar-brand-image"
                        />
                    </h1>

                    <div style={{ display: "flex", alignItems: "center" }} className="navbar-nav flex-row order-md-last">
                        <RecruiterBell name={name} />
                        {empProfile ? <Avatar src={`${secretKey}/employee/fetchProfilePhoto/${id}/${encodeURIComponent(empProfile)}`}
                            className="My-Avtar" sx={{ width: 36, height: 36 }} />
                            : <Avatar
                                src={gender === "Male" ? MaleEmployee : FemaleEmployee}
                                className="My-Avtar" sx={{ width: 36, height: 36 }} />
                        }

                        <div className="nav-item dropdown">
                            <button
                                className="nav-link d-flex lh-1 text-reset p-0"
                                data-bs-toggle="dropdown"
                                aria-label="Open user menu"
                            >
                                <div className="d-xl-block ps-2">
                                    <div style={{ textAlign: "left" }}>{name ? name : "Username"}</div>
                                    <div style={{ textAlign: "left" }} className="mt-1 small text-muted">
                                        {designation ? designation : "HR-Recruiter"}
                                    </div>
                                </div>
                            </button>

                            <div className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                                <a href="#" className="dropdown-item">
                                    Status
                                </a>
                                <a href="#" className="dropdown-item">
                                    Profile
                                </a>
                                <a href="#" className="dropdown-item">
                                    Feedback
                                </a>
                                <div className="dropdown-divider"></div>
                                <a href="#" className="dropdown-item">
                                    Settings
                                </a>
                                <a href="#" className="dropdown-item">
                                    Logout
                                </a>
                            </div>
                        </div>

                        <RecruiterNotification name={name} designation={designation} />

                    </div>
                </div>
            </header>

            <SnackbarProvider Components={{
                reportComplete: ReportComplete
            }} iconVariant={{
                success: '✅',
                error: '✖️',
                warning: '⚠️',
                info: 'ℹ️',
            }} maxSnack={3}>
            </SnackbarProvider>
        </div>
    );
}

export default RecruiterHeader;