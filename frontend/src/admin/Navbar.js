import React from "react";
import "../dist/css/tabler.min.css?1684106062";
import "../dist/css/tabler-flags.min.css?1684106062";
import "../dist/css/tabler-payments.min.css?1684106062";
import "../dist/css/tabler-vendors.min.css?1684106062";
import "../dist/css/demo.min.css?1684106062";
import { Link, useLocation } from "react-router-dom";
import { GrDocumentStore } from "react-icons/gr";
import { BsFillPersonVcardFill } from "react-icons/bs";
import { BiBookContent } from "react-icons/bi";
import { AiOutlineTeam } from "react-icons/ai";
import { MdOutlineMedicalServices } from "react-icons/md";


function Navbar() {
  // const active = number;
  const location = useLocation();
  const adminName = localStorage.getItem("adminName")
  return (
    <div>
      <header className="navbar-expand-md">
        <div className="collapse navbar-collapse" id="navbar-menu">
          <div className="navbar">
            <div className="container-xl">
              <ul className="navbar-nav">
                <li
                  className={
                    location.pathname === "/md/dashboard" ? "nav-item active" : "nav-item"
                  }
                >
                  <Link
                    style={{ textDecoration: "none", color: "black" }}
                    to="/md/dashboard"
                  >
                    <a className="nav-link" href="./">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        {/* <!-- Download SVG icon from http://tabler-icons.io/i/home --> */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          fill="none"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
                          <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
                          <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
                        </svg>
                      </span>
                      <span className="nav-link-title">Dashboard</span>
                    </a>
                  </Link>
                </li>
                <li
                  className={
                    location.pathname.startsWith("/md/user")
                      ? "nav-item active"
                      : "nav-item"
                  }>
                  <Link
                    style={{ textDecoration: "none", color: "black" }}
                    to="/md/user"
                  >
                    <a className="nav-link" href="./">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        <BsFillPersonVcardFill style={{ width: "19px", height: "23px" }} />
                      </span>

                      <span className="nav-link-title active"> Employees </span>
                    </a>
                  </Link>
                </li>
                {(adminName === "Krunal Pithadia" || adminName === "Nimesh" || adminName === "Ronak Kumar" || adminName === "Aakash" || adminName === "shivangi" || adminName === "Karan" || adminName === "Pratik") &&
                  <li
                    className={
                      location.pathname === "/md/leads"
                        ? "nav-item active"
                        : "nav-item"
                    }
                  >
                    <Link
                      style={{ textDecoration: "none", color: "black" }}
                      to="/md/leads"
                    >
                      <a className="nav-link" href="./">
                        <span className="nav-link-icon d-md-none d-lg-inline-block">
                          <GrDocumentStore style={{ height: "22px", width: "15px" }} />
                        </span>
                        <span className="nav-link-title"> Leads</span>
                      </a>
                    </Link>
                  </li>}
                <li
                  className={
                    location.pathname === "/md/bookings"
                      ? "nav-item active"
                      : "nav-item"
                  }
                >
                  <Link
                    style={{ textDecoration: "none", color: "black" }}
                    to="/md/bookings"
                  >
                    <a className="nav-link" href="./">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        <BiBookContent style={{ height: "24px", width: "19px" }} />
                      </span>
                      <span className="nav-link-title">Bookings</span>
                    </a>
                  </Link>
                </li>
                {(adminName === "Nimesh" || adminName === "Ronak Kumar" || adminName === "shivangi" || adminName === "Karan"|| adminName === "Pratik") && <li
                  className={
                    location.pathname === "/md/uploadQuestions"
                      ? "nav-item active"
                      : "nav-item"
                  }
                >
                  <Link
                    style={{ textDecoration: "none", color: "black" }}
                    to="/md/uploadQuestions"
                  >
                    <a className="nav-link" href="./">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        <GrDocumentStore style={{ height: "22px", width: "15px" }} />
                      </span>
                      <span className="nav-link-title">Questions</span>
                    </a>
                  </Link>
                </li>}
                {(adminName === "Nimesh" || adminName === "Ronak Kumar" || adminName === "shivangi" || adminName === "Karan" || adminName === "Pratik") && <li
                  className={
                    location.pathname === "/md/reportPanel"
                      ? "nav-item active"
                      : "nav-item"
                  }
                >
                  <Link
                    style={{ textDecoration: "none", color: "black" }}
                    to="/md/reportPanel"
                  >
                    <a className="nav-link" href="./">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        <GrDocumentStore style={{ height: "22px", width: "15px" }} />
                      </span>
                      <span className="nav-link-title">Reports</span>
                    </a>
                  </Link>
                </li>}
                {(adminName === "Nimesh" || adminName === "Ronak Kumar" || adminName === "shivangi" || adminName === "Karan" || adminName === "Pratik") && <li
                  className={
                    location.pathname === "/md/servicesandschemes"
                      ? "nav-item active"
                      : "nav-item"
                  }
                >
                  <Link
                    style={{ textDecoration: "none", color: "black" }}
                    to="/md/servicesandschemes"
                  >
                    <a className="nav-link" href="./">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        <GrDocumentStore style={{ height: "22px", width: "15px" }} />
                      </span>
                      <span className="nav-link-title">Schemes and Services</span>
                    </a>
                  </Link>
                </li>}
              </ul>

            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Navbar;
