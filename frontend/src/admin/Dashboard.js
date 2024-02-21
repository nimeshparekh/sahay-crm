import React, { useEffect, useState } from 'react';
import Navbar from "./Navbar";
import Header from "./Header";
import axios from 'axios';
import Nodata from '../components/Nodata';
import "../assets/styles.css";
// import LoginAdmin from "./LoginAdmin";

function Dashboard() {
  const [recentUpdates, setRecentUpdates] = useState([]);
  const secretKey = process.env.REACT_APP_SECRET_KEY;
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Make a GET request to fetch recent updates data
        const response = await axios.get(`${secretKey}/recent-updates`);
        // Set the retrieved data in the state
        setRecentUpdates(response.data);
      } catch (error) {
        console.error("Error fetching recent updates:", error.message);
      }
    };

    // Call the fetchData function when the component mounts
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (date, time) => {
    const currentDate = new Date().toLocaleDateString();
    const pm = time.toLowerCase().includes('pm')? true : false
    const currentDateTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
    if (date === currentDate) {
      const [hour, minute, second] = time.split(/:| /).map(Number);
      const formattedHour = pm ? hour+12 : hour 
      const formattedTime = `${formattedHour}:${minute}`;
      return formattedTime;
    } else if (date === currentDate - 1) {
      return 'Yesterday';
    } else {
      return date;
    }
  };
  
  
  
  return (
    <div>
      <Header />
      <Navbar />
      <div className="page-wrapper">
        <div className="page-header d-print-none">
          <div className="container-xl">
            <div className="page-title">
              <h1>Dashboard</h1>
            </div>
            <div className="row">
              <div className="col-sm-4 card recent-updates m-2">
                <div className="card-header">
                  <h2>Recent Updates</h2>
                </div>
                <div className="card-body">
                  {recentUpdates.length!==0 ? recentUpdates.map((obj)=>(
                      <div className="row update-card ">
                      <div className="col">
                        <div className="text-truncate">
                          <strong>
                            {obj.title}
                          </strong>
                        </div>
                        <div className="text-muted"> {formatTime(obj.date, obj.time)}</div>
                      </div>
                      <div className="col-auto align-self-center">
                        <div className="badge bg-primary"></div>
                      </div>
                    </div>
                  ))  : <div>
                    <Nodata/>
                    </div>}
                </div>
              </div>
              <div className="col card todays-booking m-2">
                <div className="card-header">
                  <h2>Today's Booking</h2>
                </div>
                <div className="card-body">
                  <div className="row"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
