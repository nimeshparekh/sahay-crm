import React from "react";
import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";
import "../dist/css/tabler.min.css?1684106062";
import "../dist/css/tabler-flags.min.css?1684106062";
import "../dist/css/tabler-payments.min.css?1684106062";
import "../dist/css/tabler-vendors.min.css?1684106062";
import "../dist/css/demo.min.css?1684106062";

function ProcessingLogin({ setProcessingToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // e.preventDefault();
  // const response = await fetch('http://62.72.56.202:3001/login');
  // const userData = await response.json();
  // console.log(username);
  // const matchedUser = userData.find(user => user.email === username && user.password === password);
  // console.log(matchedUser);
  // if(matchedUser){
  //   // localStorage.setItem('isLoggedIn', 'true');
  //   sessionStorage.setItem('isLoggedIn', 'true');
  //   onLogin();
  // }
  // else{
  //   window.alert("Incorrect email or password")
  // }
  // console.log("button clicked")
  const secretKey = process.env.REACT_APP_SECRET_KEY;
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${secretKey}/processingLogin`, {
        username,
        password,
      });

      const { processingToken } = response.data;
      
      setProcessingToken(processingToken);
      localStorage.setItem("processingToken", processingToken);
     Swal.fire("Processing Login Successfull");
     
    } catch (error) {
      console.error("Login failed:", error.message);
      setErrorMessage("Incorrect Credentials!");
    }
  };

  return (
    <div>
      <div className="page page-center">
        <div className="container container-tight py-4">
          <div className="text-center mb-4">
            <a href="." className="navbar-brand navbar-brand-autodark">
              <img src="./static/logo.svg" height="36" alt="" />
            </a>
          </div>
          <div className="card card-md login-card">
            <div className="card-body">
              <h2 className="h2 text-center mb-4">Processing Login</h2>
              <form action="./" method="get" autocomplete="off" novalidate>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    onChange={(e) => {
                      setUsername(e.target.value);
                    }}
                    type="email"
                    className="form-control"
                    placeholder="Email or Phone Number"
                    autocomplete="off"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">
                    Password
                    <span className="form-label-description">
                      <a href="./forgot-password.html">I forgot password</a>
                    </span>
                  </label>
                  <div className="input-group input-group-flat">
                    <input
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Your password"
                      autoComplete="off"
                    />
                    <span className="input-group-text">
                      <a
                        href="#"
                        className="link-secondary"
                        title="Show password"
                        data-bs-toggle="tooltip"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                          <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                        </svg>
                      </a>
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "center", color: "red" }}>
                  <span>{errorMessage}</span>
                </div>

                <div className="form-footer">
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="btn btn-primary w-100"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProcessingLogin;
