import React from "react";
import "../../../dist/css/tabler.min.css?1684106062";
import "../../../dist/css/tabler-flags.min.css?1684106062";
import "../../../dist/css/tabler-payments.min.css?1684106062";
import "../../../dist/css/tabler-vendors.min.css?1684106062";
import "../../../dist/css/demo.min.css?1684106062";
import { Link, useLocation } from "react-router-dom";
import { GrDocumentStore } from "react-icons/gr";
import { BsFillPersonVcardFill } from "react-icons/bs";
import { FaWallet } from "react-icons/fa";
import dashboardicon from '../../../dist/img/dashboardicon/dashboardico0n.jpg'


function Navbar() {
  // const active = number;
  const location = useLocation();
  //console.log(name, designation)
  
  const datamanagerUserId = localStorage.getItem("dataManagerUserId")
  
  return (
    <div>
      <header className="navbar-expand-md">
        <div className="collapse navbar-collapse" id="navbar-menu">
          <div className="navbar">
            <div className="container-xl p-0">
              <ul className="navbar-nav">
                
                <li className="nav-item"
                class = {
                  location.pathname === `/dataanalyst/dashboard/${datamanagerUserId}` ? "nav-item active" : "nav-item"
                }>
                  <Link
                    style={{ textDecoration: "none", color: "black" }}
                     to={{
                      pathname : `/dataanalyst/dashboard/${datamanagerUserId}`
                     }}
                   
                  >
                    <a className="nav-link" href="./">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        <img src={dashboardicon} style={{opacity:"0.5"}}/>
                      </span>
                      <span className="nav-link-title">Dashboard</span>
                    </a>
                  </Link>
                </li>

                <li className="nav-item"
                  class={
                    location.pathname === "/dataanalyst/manageleads" ? "nav-item active" : "nav-item"
                  }>
                  <Link
                    style={{ textDecoration: "none", color: "black" }}
                    to={{
                      pathname: `/dataanalyst/manageleads`,
                    }}
                  >
                    <a className="nav-link" href="./">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        <GrDocumentStore style={{height:"22px" , width:"15px"}} />
                      </span>
                      <span className="nav-link-title">Manage Leads</span>
                    </a>
                  </Link>
                </li>

                <li
                  className={
                    location.pathname.startsWith("/dataanalyst/newEmployees")
                      ? "nav-item active"
                      : "nav-item"
                  }>
                  <Link
                    style={{ textDecoration: "none", color: "black" }}
                    to="/dataanalyst/newEmployees"
                  >
                    <a className="nav-link" href="./">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        <BsFillPersonVcardFill style={{width:"19px" , height:"23px"}} />
                      </span>
                      <span className="nav-link-title active"> Employees </span>
                    </a>
                  </Link>
                </li>

                <li
                  className={
                    location.pathname.startsWith("/dataanalyst/bookings")
                      ? "nav-item active"
                      : "nav-item"
                  }>
                  <Link
                    style={{ textDecoration: "none", color: "black" }}
                    to="/dataanalyst/bookings"
                  >
                    <a className="nav-link" href="./">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        <BsFillPersonVcardFill style={{width:"19px" , height:"23px"}} />
                      </span>
                      <span className="nav-link-title active"> Bookings </span>
                    </a>
                  </Link>
                </li>

                <li
                  className={
                    location.pathname.startsWith("/dataanalyst/expensereport")
                      ? "nav-item active"
                      : "nav-item"
                  }>
                  <Link
                    style={{ textDecoration: "none", color: "black" }}
                    to="/dataanalyst/expensereport"
                  >
                    <a className="nav-link" href="./">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        <FaWallet style={{width:"19px" , height:"23px"}} />
                      </span>
                      <span className="nav-link-title active"> Expense Report </span>
                    </a>
                  </Link>
                </li>

              </ul>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Navbar;