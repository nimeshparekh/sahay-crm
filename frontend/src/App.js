import "./App.css";
import { BrowserRouter, Routes, Navigate, Route } from "react-router-dom";
import { useState } from "react";
import EmployeeLogin from "./components/EmployeeLogin";
import ConveertedLeads from "./components/ConveertedLeads";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
// Admin Panel Imports
//import Dashboard from "./admin/Dashboard";
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminEmployeeProfile from "./admin/AdminEmployeeProfile.jsx";
import Dashboard from "./admin/DashboardReportComponents/Dashboard.js";
import LoginAdmin from "./admin/LoginAdmin";
import EmployeeParticular from "./admin/EmployeeParticular";
import Employees from "./admin/Employees";
import Leads from "./admin/Leads";
import ShowNotification from "./admin/ShowNotification";
//import BookingsAdmin from "./admin/BookingsAdmin.jsx";
//import BookingsForm from "./admin/BookingsForm.jsx";
import CompanyParticular from "./admin/CompanyParticular.jsx";
//import NewLeads from "./admin/NewLeads.jsx";
import RedesignedForm from "./admin/RedesignedForm.jsx";
import StausInfo from "./admin/StausInfo.js";
import BookingList from "./admin/BookingList.jsx";
import Team from './admin/Team.js'
import NewEmployee from "./admin/NewEmployee.js";
import Services from "./admin/ServicesandSchemes/Services.jsx";
import AdminEmployeeLeads from "./admin/AdminEmployeeLeads.jsx";
import AdminEmployeeTeamLeads from "./admin/AdminEmployeeTeamLeads.jsx";
import TestLeads from "./admin/TestLeads.jsx";
import EmployeeInterestedCompanies from "./admin/EmployeeInterestestedCompanies.jsx";
import EmployeeFolowUpCompanies from "./admin/EmployeeFolowUpCompanies.jsx";

// Employee/BDE/BDM Panel Imports 
import EmployeeLayout from "./employeeComp/EmployeeLayout.jsx";
import EmployeeDashboard from "./employeeComp/EmployeeDashboard.jsx";
import EmployeePanel from "./employeeComp/EmployeePanel";
import EmployeePanelCopy from "./employeeComp/EmployeePanelCopy.jsx";
import EmployeeTeamLeads from "./employeeComp/EmployeeTeamLeads.jsx";
import EmployeeTeamLeadsCopy from "./employeeComp/EmployeeTeamLeadsCopy.jsx";
import EmployeeMaturedBookings from "./employeeComp/EmployeeMaturedBookings.jsx";
import EmployeeReports from "./employeeComp/EmployeeReports.jsx";
import EmployeeProfile from "./employeeComp/EmployeeProfile.jsx";
import EmployeeShowNotification from "./employeeComp/EmployeeShowNotification.jsx";
import EmployeeAssets from "./employeeComp/EmployeeAssets.jsx";
import CompanyProfile from "./components/CompanyProfile.jsx";

// Floor Manager Imports
import FloorManagerLayout from "./BDM/Dashboard/FloorManagerLayout.jsx";
import BDMLogin from "./BDM/Login/BDMLogin.jsx";
import BdmDashboard from "./BDM/Dashboard/BdmDashboard.jsx";
import BdmLeads from "./BDM/Dashboard/BdmLeads/BdmLeads.js";
import BdmTeamLeads from "./BDM/Dashboard/BdmTeamLeads/BdmTeamLeads";
import BdmBookings from "./BDM/Dashboard/BdmBookings.jsx";
import FloorManagerProfile from "./BDM/Dashboard/FloorManagerProfile.jsx";

// Admin Head/RM of Certification Imports
import AdminHeadLayout from "./RM-CERTIFICATION/RM-CERT-COMPONENTS/AdminHeadLayout.jsx";
import RMofCertification from "./RM-CERTIFICATION/RM-CERT-LOGIN/RMofCertification.jsx";
import RmCertificationDashboard from "./RM-CERTIFICATION/RM-CERT-DASHBOARD/RmCertificationDashboard.jsx";
import RMofFundingLogin from "./RM-FUNDING/RM-FUNDING-LOGIN/RMofFundingLogin.jsx";
import RMofFundingDashboard from "./RM-FUNDING/RM-FUNDING-DASHBOARD/RMofFundingDashboard.jsx";
import RmofCertificationBookings from "./RM-CERTIFICATION/RM-CERT-BOOKINGS/RmofCertificationBookings.jsx";
import RmofCertificationMyBookings from "./RM-CERTIFICATION/RM-CERT-BOOKINGS/RmofCertificationMyBookings.jsx";
import Received_booking_box from "./RM-CERTIFICATION/RM-CERT-Process/Received_booking_box.jsx";
import AdminHeadProfile from "./RM-CERTIFICATION/RM-CERT-COMPONENTS/AdminHeadProfile.jsx";

// Admin Executive Imports
import AdminExecutiveLayout from "./AdminExecutive/Components/AdminExecutiveLayout.jsx";
import AdminExecutiveLogin from "./AdminExecutive/Login/AdminExecutiveLogin.jsx";
import AdminExecutiveDashboard from "./AdminExecutive/Dashboard/AdminExecutiveDashboard.jsx";
import AdminExecutiveRecievedBox from "./AdminExecutive/RecievedBookingBox/AdminExecutiveRecievedBox.jsx";
import AdminExecutiveMyBookings from "./AdminExecutive/AdminExecutiveBookings/AdminExecutiveMyBookings.jsx";
import AdminExecutiveProfile from "./AdminExecutive/Components/AdminExecutiveProfile.jsx";

// Hr Panel Imports
import HrLayout from "./Hr_panel/Components/HrLayout.jsx";
import HrLogin from "./Hr_panel/Login/HrLogin.jsx";
import HrDashboard from "./Hr_panel/Dashboard/HrDashboard.jsx";
import HrEmployees from "./Hr_panel/Components/HrEmployees.jsx";
import HorizontalNonLinearStepper from "./Hr_panel/Components/AddEmployees/AddEmployee.jsx";
import HREditEmployee from "./Hr_panel/Components/EditEmployee/HREditEmployee.jsx";
import Attendance from "./Hr_panel/Components/Attendance/Attendance.jsx";
//import Employee from "./Hr_panel/Components/EmployeeView.jsx";
import EmployeeView from "./Hr_panel/Components/EmployeeView.jsx";
import EmployeeSalaryView from "./Hr_panel/Components/Attendance/EmployeeSalaryView.jsx";
import HrManagerProfile from "./Hr_panel/Components/HrManagerProfile.jsx";

// Recruiter Panel Imports
import RecruiterLayout from "./RecruiterPanel/Components/RecruiterLayout.jsx";
import RecruiterLogin from "./RecruiterPanel/Login/RecruiterLogin.jsx";
import ApplicationForm from "./RecruiterPanel/ApplicationForm/ApplicationForm.jsx";
import RecruiterDashboard from "./RecruiterPanel/Dashboard/RecruiterDashboard.jsx";
import RecruiterBox from "./RecruiterPanel/TabPanels/RecruiterBox.jsx";

// Data Analyst Imports
import DataAnalystLayout from "./DataManager/Components/ExtraComponents/DataAnalystLayout.jsx";
import DataManagerLogin from "./DataManager/DataMangerLogin/DataManagerLogin.jsx";
import DataManagerDashboard from "./DataManager/Dashboard/DataManagerDashboard.jsx";
import ManagerBookings from "./DataManager/Dashboard/ManageLeads/ManagerBookings.jsx";
import ManageLeads from "./DataManager/Dashboard/ManageLeads/ManageLeads.jsx";
import DataManager_Employees from './DataManager/Dashboard/Employees/DataManager_Employees.jsx'
import EmployeeLeads from "./DataManager/Dashboard/EmployeeLeads/EmployeeLeads.jsx";
import CompanyParticular_Datamanager from "./DataManager/Dashboard/ManageLeads/CompanyParticular_Datamanager.jsx";
import NotificationDM from "./DataManager/Dashboard/ManageLeads/NotificationDM.jsx";
import EmployeeStatusInfo from "./DataManager/Components/EmployeeStatusInfo/EmployeeStatusInfo.jsx";
import DatamanagerDashboard from "./DataManager/Dashboard/Dashboard/DatamanagerDashboard.jsx";
import DatamanagerEmployeeTeamLeads from "./DataManager/Dashboard/DatamanagerEmployeeTeamLeads/DatamanagerEmployeeTeamLeads.jsx";
import DatamanagerNewEmployee from "./DataManager/Dashboard/Employees/DatamanagerNewEmployee.jsx";
import ExpenseReport from "./DataManager/Dashboard/Expense/ExpenseReport.jsx";
import DataAnalystProfile from "./DataManager/Components/ExtraComponents/DataAnalystProfile.jsx";

// Relationship Manager Imports
import RelationshipManagerLayout from "./RelationshipManager/Components/RelationshipManagerLayout.jsx";
import RelationshipManagerLogin from "./RelationshipManager/Login/RelationshipManagerLogin.jsx";
import RelationshipManagerDashboard from "./RelationshipManager/Dashboard/RelationshipManagerDashboard.jsx";
import RelationshipManagerBookings from "./RelationshipManager/Bookings/RelationshipManagerBookings.jsx";
import RelationshipManagerMyBookings from "./RelationshipManager/Bookings/RelationshipManagerMyBookings.jsx";

// Graphic Designer Imports
import GraphicDesignerLayout from "./GraphicDesigner/Components/GraphicDesignerLayout.jsx";
import GraphicDesignerLogin from "./GraphicDesigner/Login/GraphicDesignerLogin.jsx";
import GraphicDesignerDashboard from "./GraphicDesigner/Dashboard/GraphicDesignerDashboard.jsx";
import GraphicDesignerBookings from "./GraphicDesigner/Bookings/GraphicDesignerBookings.jsx";
import GraphicDesignerMyBookings from "./GraphicDesigner/Bookings/GraphicDesignerMyBookings.jsx";

// Content Writer Imports
import ContentWriterLayout from "./ContentWriter/Components/ContentWriterLayout.jsx";
import ContentWriterLogin from "./ContentWriter/Login/ContentWriterLogin.jsx";
import ContentWriterDashboard from "./ContentWriter/Dashboard/ContentWriterDashboard.jsx";
import ContentWriterBookings from "./ContentWriter/Bookings/ContentWriterBookings.jsx";
import ContentWriterMyBookings from "./ContentWriter/Bookings/ContentWriterMyBookings.jsx";

// Finance Analyst Imports
import FinanceAnalystLayout from "./FinanceAnalyst/Components/FinanceAnalystLayout.jsx";
import FinanceAnalystLogin from "./FinanceAnalyst/Login/FinanceAnalystLogin.jsx";
import FinanceAnalystDashboard from "./FinanceAnalyst/Dashboard/FinanceAnalystDashboard.jsx";

// Customer Panel Imports
import CustomerLogin from "./Customer-Panel/CustomerLogin.jsx";
import CustomerDashboard from "./Customer-Panel/CustomerDashboard.jsx";
// import BasicForm from "./Client-Basic-Info/BasicForm.jsx";

// Extra Imports
import Dashboard_processing from "./Processing/Dashboard_processing";
import LoginDetails from "./components/LoginDetails";
import ProcessingLogin from "./components/ProcessingLogin";
import Bookings from "./Processing/Bookings.jsx";
import Form from "./Processing/Form.jsx";
import Nodata from "./Processing/Nodata.jsx";
import Analysis_dashboard from "./Processing/Analysis_dashboard.jsx";
import Bellicon_processing from "./Processing/style_processing/Bellicon_processing.js";
import DrawerComponent from "./components/Drawer.js";
import NotFound from "./NotFound.js";
import MaterialUIPickers from "./components/MaterialUIPickers.js";
//import CompanyDetails from "./Processing/CompanyDetails.jsx";
import "../src/assets/v2_style.css"
import "../src/assets/hover.css"
import "../src/assets/sales_new_style.css"
import BookingsTableView from "./admin/BookingsTableView.jsx";
import AdminUploadQuestions from "./admin/AdminUploadQuestions.jsx";
import AdminReportPanel from "./admin/AdminReportPanel.jsx";
import VicePresidentLayout from "./BDM/Dashboard/VicePresidentLayout.jsx";
import Service from "./admin/Service/Service.jsx";

function App() {

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [processingTokenn, setProcessingToken] = useState(localStorage.getItem("processingToken") || null);
  const [newtoken, setnewToken] = useState(localStorage.getItem("newtoken") || null);
  const [managerToken, setManagerToken] = useState(localStorage.getItem("managerToken") || null)
  const [bdmToken, setBdmToken] = useState(localStorage.getItem("bdmToken") || null)
  const [relationshipManagerToken, setRelationshipManagerToken] = useState(localStorage.getItem("relationshipManagerToken") || null)
  const [graphicDesignerToken, setGraphicDesignerToken] = useState(localStorage.getItem("graphicDesignerToken") || null)
  const [contentWriterToken, setContentWriterToken] = useState(localStorage.getItem("contentWriterToken") || null)
  const [financeAnalystToken, setFinanceAnalystToken] = useState(localStorage.getItem("financeAnalystToken") || null)
  const [rmofcertificationToken, setrmofcertificationToken] = useState(localStorage.getItem("rmofcertificationToken" || null))
  const [adminExecutiveToken, setAdminExecutiveToken] = useState(localStorage.getItem("adminExecutiveToken" || null))
  const [rmoffundingToken, setrmoffundingToken] = useState(localStorage.getItem("rmoffundingToken" || null))
  const [hrToken, setHrToken] = useState(localStorage.getItem("hrToken") || null)
  const [recruiterToken, setRecruiterToken] = useState(localStorage.getItem("recruiterToken") || null)
  
  return (
    <div className="App">
      <BrowserRouter>
        <ToastContainer /> {/* Add ToastContainer here */}
        <Routes>

          {/* --------------------------------------------------Path for BDE/BDM---------------------------------------------------------- */}
          <Route path="/" element={<EmployeeLogin setnewToken={setnewToken} />} />
          {/* <Route path="/employee-data/:userId" element={newtoken ? <EmployeePanel /> : <Navigate to="/" />} ></Route>
          <Route path="/employee-dashboard/:userId" element={newtoken ? <EmployeeDashboard /> : <Navigate to="/" />}></Route>
          <Route path="/employee-team-leads/:userId" element={newtoken ? <EmployeeTeamLeads /> : <Navigate to="/" />}></Route>
          <Route path="/employee-bookings/:userId" element={newtoken ? <EmployeeMaturedBookings /> : <Navigate to="/" />}></Route>
          <Route path='/employee-reports/:userId' element={newtoken ? <EmployeeReports /> : <Navigate to='/' />}></Route>
          <Route path='/employee-profile-details/:userId' element={newtoken ? <EmployeeProfile /> : <Navigate to='/' />}></Route>
          <Route path='/employee/show-notification/:userId' element={newtoken ? <EmployeeShowNotification /> : <Navigate to='/' />}></Route>
          <Route path='/employee-assets/:userId' element={newtoken ? <EmployeeAssets /> : <Navigate to='/' />}></Route> */}

          {/* Wrap all employee-related routes with EmployeeLayout */}
          <Route element={newtoken ? <EmployeeLayout /> : <Navigate to="/" />}>
            <Route path="/employee-dashboard/:userId" element={<EmployeeDashboard />} />
            {/* <Route path="/employee-data/:userId" element={<EmployeePanel />} /> */}
            <Route path="/employee-data/:userId" element={<EmployeePanelCopy fordesignation="salesexecutive" />} />
            {/* <Route path="/employee-team-leads-old/:userId" element={<EmployeeTeamLeads />} /> */}
            <Route path="/employee-team-leads/:userId" element={<EmployeeTeamLeadsCopy />} />
            <Route path="/employee-bookings/:userId" element={<EmployeeMaturedBookings />} />
            <Route path="/employee-reports/:userId" element={<EmployeeReports />} />
            {/* <Route path="/employee-assets/:userId" element={<EmployeeAssets />} /> */}
            <Route path="/employee-profile-details/:userId" element={<EmployeeProfile />} />
            <Route path="/employee/show-notification/:userId" element={<EmployeeShowNotification />} />
            <Route path="company-profile/:userId" element={<CompanyProfile />} />
          </Route>

          {/* --------------------------------------------------Path for Customer-Panel---------------------------------------------------------- */}
          {/* <Route path="/client/basic-form" element={<BasicForm />} /> */}
          <Route path='/customer/login' element={<CustomerLogin />} />
          <Route path='/customer/dashboard/:email' element={<CustomerDashboard />} />

          {/* --------------------------------------------------floor-manager components---------------------------------------------------------- */}
          <Route path="/floormanager/login" element={<BDMLogin setBdmToken={setBdmToken} isVicePresident={false} />} />
          <Route path="/vicePresident/login" element={<BDMLogin setBdmToken={setBdmToken} isVicePresident={true} />} />
          {/* <Route path="/floormanager/dashboard/:userId" element={<BdmDashboard />}></Route>
          <Route path="/floormanager/leads/:userId" element={<BdmLeads />}></Route>
          <Route path="/floormanager/teamleads/:userId" element={<BdmTeamLeads />}></Route>
          <Route path="/floormanager/bookings/:userId" element={<BdmBookings />}></Route>
          <Route path="/floormanager-profile-details/:userId" element={<FloorManagerProfile />} /> */}
          <Route element={bdmToken ? <FloorManagerLayout isVicePresident={false} /> : <Navigate to="/floormanager/login" />}>
            <Route path="/floormanager/dashboard/:userId" element={<BdmDashboard />} isVicePresident={false} />
            {/* <Route path="/floormanager/leads/:userId" element={<BdmLeads />} /> */}
            <Route path="/floormanager/leads/:userId" element={<EmployeePanelCopy fordesignation="floormanager" isVicePresident={false} />} />
            {/* <Route path="/floormanager/teamleads/:userId" element={<BdmTeamLeads />} /> */}
            <Route path="/floormanager/teamleads/:userId" element={<EmployeeTeamLeadsCopy isVicePresident={false} />} />
            <Route path="/floormanager/bookings/:userId" element={<BdmBookings isVicePresident={false} />} />
            <Route path="/floormanager-profile-details/:userId" element={<FloorManagerProfile isVicePresident={false} />} />
          </Route>

          <Route element={bdmToken ? <VicePresidentLayout isVicePresident={true} /> : <Navigate to="/vicePresident/login" />}>
            <Route path="/vicePresident/dashboard/:userId" element={<BdmDashboard />} isVicePresident={true} />
            {/* <Route path="/floormanager/leads/:userId" element={<BdmLeads />} /> */}
            <Route path="/vicePresident/leads/:userId" element={<EmployeePanelCopy fordesignation="floormanager" isVicePresident={true} />} />
            {/* <Route path="/floormanager/teamleads/:userId" element={<BdmTeamLeads />} /> */}
            <Route path="/vicePresident/teamleads/:userId" element={<EmployeeTeamLeadsCopy isVicePresident={true} />} />
            <Route path="/vicePresident/bookings/:userId" element={<BdmBookings isVicePresident={true} />} />
            <Route path="/vicePresident/:userId" element={<FloorManagerProfile isVicePresident={true} />} />
          </Route>

          {/* --------------------------------------------------Admin Head/rm-certification components---------------------------------------------------------- */}
          <Route path='/adminhead/login' element={<RMofCertification setrmofcertificationToken={setrmofcertificationToken} />} />
          {/* <Route path='/adminhead/dashboard/:userId' element={<RmCertificationDashboard />} />
          <Route path='/adminhead/bookings/:userId' element={<RmofCertificationBookings />} />
          <Route path='/adminhead/mybookings/:userId' element={<RmofCertificationMyBookings />} />
          <Route path='/adminhead/received-booking-box/:userId' element={<Received_booking_box />} />
          <Route path="/adminhead-profile-details/:userId" element={<AdminHeadProfile />} />
          <Route path='/rmoffunding/login-rmoffunding' element={<RMofFundingLogin setrmoffundingToken={setrmoffundingToken} />} />
          <Route path='/rmoffunding/dashboard-rmoffunding/:userId' element={<RMofFundingDashboard />} /> */}
          <Route element={rmofcertificationToken ? <AdminHeadLayout /> : <Navigate to="/adminhead/login" />}>
            <Route path='/adminhead/dashboard/:userId' element={<RmCertificationDashboard />} />
            <Route path='/adminhead/bookings/:userId' element={<RmofCertificationBookings />} />
            <Route path='/adminhead/mybookings/:userId' element={<RmofCertificationMyBookings />} />
            <Route path='/adminhead/received-booking-box/:userId' element={<Received_booking_box />} />
            <Route path="/adminhead-profile-details/:userId" element={<AdminHeadProfile />} />
            <Route path='/rmoffunding/login-rmoffunding' element={<RMofFundingLogin setrmoffundingToken={setrmoffundingToken} />} />
            <Route path='/rmoffunding/dashboard-rmoffunding/:userId' element={<RMofFundingDashboard />} />
          </Route>


          {/* --------------------------------------------------admin executive components---------------------------------------------------------- */}
          <Route path='/adminexecutive/login' element={<AdminExecutiveLogin setAdminExecutiveToken={setAdminExecutiveToken} />} />
          {/* <Route path='/adminexecutive/dashboard/:userId' element={<AdminExecutiveDashboard />} />
          <Route path='/adminexecutive/received-booking-box/:userId' element={<AdminExecutiveRecievedBox />} />
          <Route path='/adminexecutive/mybookings/:userId' element={<AdminExecutiveMyBookings />} />
          <Route path="/adminexecutive-profile-details/:userId" element={<AdminExecutiveProfile />} /> */}
          <Route element={adminExecutiveToken ? <AdminExecutiveLayout /> : <Navigate to="/adminexecutive/login" />}>
            <Route path='/adminexecutive/dashboard/:userId' element={<AdminExecutiveDashboard />} />
            <Route path='/adminexecutive/received-booking-box/:userId' element={<AdminExecutiveRecievedBox />} />
            <Route path='/adminexecutive/mybookings/:userId' element={<AdminExecutiveMyBookings />} />
            <Route path="/adminexecutive-profile-details/:userId" element={<AdminExecutiveProfile />} />
          </Route>

          {/* -------------------adminHead----------------------data analyst components--------------------------------------- */}
          <Route path="/dataanalyst/login" element={<DataManagerLogin setManagerToken={setManagerToken} />} />
          {/* <Route path='/dataanalyst/dashboard/:userId/' element={<DatamanagerDashboard />} />
          <Route path="/dataanalyst/manageleads" element={<ManageLeads />} ></Route>
          <Route path="/datamanager/leads/:companyId" element={<CompanyParticular_Datamanager />} />
          <Route path="/dataanalyst/employees" element={<DataManager_Employees />}></Route>
          <Route path="/dataanalyst/newEmployees" element={<DatamanagerNewEmployee />}></Route>
          <Route path="/dataanalyst/employeeLeads/:id" element={<EmployeeLeads />}></Route>
          <Route path="/dataanalyst/bookings" element={<ManagerBookings />}></Route>
          <Route path="/dataanalyst/expensereport" element={<ExpenseReport />}></Route>
          <Route path="/dataanalyst-profile-details/:userId" element={<DataAnalystProfile />} />
          <Route path="/dataanalyst/notification" element={<NotificationDM />}></Route>
          <Route path="/employeereportdatamanager/:ename/:status" element={<EmployeeStatusInfo />} />
          <Route path="/datamanager/datamanagerside-employeeteamleads/:id" element={<DatamanagerEmployeeTeamLeads />} /> */}
          <Route element={managerToken ? <DataAnalystLayout /> : <Navigate to="/dataanalyst/login" />}>
            <Route path='/dataanalyst/dashboard/:userId/' element={<DatamanagerDashboard />} />
            <Route path="/dataanalyst/manageleads" element={<ManageLeads />} />
            <Route path="/datamanager/leads/:companyId" element={<CompanyParticular_Datamanager />} />
            <Route path="/dataanalyst/employees" element={<DataManager_Employees />} />
            <Route path="/dataanalyst/newEmployees" element={<DatamanagerNewEmployee />} />
            {/* <Route path="/dataanalyst/employeeLeads/:id" element={<EmployeeLeads />} /> */}
            <Route path="/dataanalyst/employeeLeads/:id" element={<EmployeePanelCopy fordesignation="datamanager" />} />
            {/* <Route path="/dataanalyst/employeeteamleads/:id" element={<DatamanagerEmployeeTeamLeads />} /> */}
            <Route path="/dataanalyst/employeeteamleads/:userId" element={<EmployeeTeamLeadsCopy designation="datamanager" />} />
            <Route path="/dataanalyst/bookings" element={<ManagerBookings />} />
            <Route path="/dataanalyst/expensereport" element={<ExpenseReport />} />
            <Route path="/dataanalyst-profile-details/" element={<DataAnalystProfile />} />
            <Route path="/dataanalyst/notification" element={<NotificationDM />} />
            <Route path="/dataanalyst/tabelView" element={<BookingsTableView isComingFromDataManager={true} />} />
            <Route path="/employeereportdatamanager/:ename/:status" element={<EmployeeStatusInfo />} />
          </Route>

          {/* ---------------------------------------admin  components--------------------------------------- */}
          <Route path="/converted-leads/:userId/" element={newtoken ? <ConveertedLeads /> : <Navigate to="/employeelogin" />}></Route>
          <Route path="/md/login" element={<LoginAdmin setToken={setToken} />} />


          <Route element={token ? <AdminLayout /> : <Navigate to="/md/login" />} >
            <Route path="/md/dashboard" element={<Dashboard />} />
            <Route path="/md/employees" element={<Employees />} />
            <Route path="/md/user" element={<NewEmployee />} />
            {/* <Route path="/md/employees/:id" element={<EmployeeParticular />} /> */}
            <Route path="/md/employees/:id" element={<EmployeePanelCopy fordesignation="admin" />} />
            {/* <Route path="/md/employeeleads/:id" element={<AdminEmployeeTeamLeads />} /> */}
            <Route path="/md/employeeleads/:userId" element={<EmployeeTeamLeadsCopy designation="admin" />} />
            <Route path="/md/employees/:id/login-details" element={<LoginDetails />} />
            <Route path="/md/leads" element={<TestLeads />} />
            <Route path="/md/leads/:companyId" element={<CompanyParticular />} />
            <Route path="/md/bookings" element={<BookingList />} />
            <Route path="/md/bookings/tabelView" element={<BookingsTableView isComingFromDataManager={false} />} />
            <Route path="/md/uploadQuestions" element={<AdminUploadQuestions />} />
            <Route path="/md/notification" element={<ShowNotification />} />
            <Route path="/md/bookings/Addbookings" element={<RedesignedForm />} />
            <Route path="/md/reportPanel" element={<AdminReportPanel />} />
            {/* <Route path="/md/servicesandschemes" element={<Services />} /> */}
            <Route path="/md/servicesandschemes" element={<Service />} />
            <Route path="/md/employeeProfileView/:userId" element={<AdminEmployeeProfile />} />
            <Route path="/md/deletedEmployeeProfileView/:userId" element={<AdminEmployeeProfile />} />
          </Route>


          {/* <Route path="*" element={<NotFound />} /> */}

          {/**********************************************  HR-Panel-Portal   *******************************************************/}
          <Route path="/hr/login" element={<HrLogin setHrToken={setHrToken} />} />
          <Route element={hrToken ? <HrLayout /> : <Navigate to="/hr/login" />}>
            <Route path="/hr/dashboard" element={<HrDashboard />} />
            {/* <Route path="/hr/employees/" element={<NewEmployees />} /> */}
            <Route path="/hr/employees" element={<HrEmployees />} />
            <Route path="/hr/add/employee" element={<HorizontalNonLinearStepper />} />
            <Route path="/hr/edit/employee/:empId" element={<HREditEmployee />} />
            <Route path="/hr/employees/attendance" element={<Attendance />} />
            <Route path='hr-employee-profile-details/:userId' element={<EmployeeView />} />
            <Route path='hr-deleted-employee-profile-details/:userId' element={<EmployeeView />} />
            <Route path='/hr/employees/salarypage' element={<EmployeeSalaryView />} />
            <Route path="/hr-profile-details" element={<HrManagerProfile />} />
          </Route>

          {/**********************************************  RecruiterPanel  *******************************************************/}
          <Route path="/recruiter/login" element={<RecruiterLogin setRecruiterToken={setRecruiterToken} />} />
          <Route path="/recruiter/appynowform" element={<ApplicationForm />} />
          {/* <Route path="/recruiter/dashboard/:userId" element={<RecruiterDashboard />} />
          <Route path="/recruiter/employeesbox/:userId" element={<RecruiterBox />} /> */}
          <Route element={recruiterToken ? <RecruiterLayout /> : <Navigate to="/recruiter/login" />}>
            <Route path="/recruiter/dashboard/:userId" element={<RecruiterDashboard />} />
            <Route path="/recruiter/employeesbox/:userId" element={<RecruiterBox />} />
            <Route path="/recruiter-profile-details/:userId" element={<FloorManagerProfile />} />
          </Route>


          {/**********************************************  relationship manager panel  ********************************************/}
          <Route path="/relationship-manager/login" element={<RelationshipManagerLogin setRelationshipManagerToken={setRelationshipManagerToken} />} />
          <Route element={relationshipManagerToken ? <RelationshipManagerLayout /> : <Navigate to="/relationship-manager/login" />}>
            <Route path="/relationship-manager/dashboard/:userId" element={<RelationshipManagerDashboard />} />
            <Route path="/relationship-manager/received-booking-box/:userId" element={<RelationshipManagerBookings />} />
            <Route path="/relationship-manager/mybookings/:userId" element={<RelationshipManagerMyBookings />} />
            <Route path="/relationship-manager-profile-details/:userId" element={<FloorManagerProfile />} />
          </Route>

          {/**********************************************  graphic designer panel  ********************************************/}
          <Route path="/graphic-designer/login" element={<GraphicDesignerLogin setGraphicDesignerToken={setGraphicDesignerToken} />} />
          <Route element={graphicDesignerToken ? <GraphicDesignerLayout /> : <Navigate to="/graphic-designer/login" />}>
            <Route path="/graphic-designer/dashboard/:userId" element={<GraphicDesignerDashboard />} />
            <Route path="/graphic-designer/received-booking-box/:userId" element={<GraphicDesignerBookings />} />
            <Route path="/graphic-designer/mybookings/:userId" element={<GraphicDesignerMyBookings />} />
            <Route path="/graphic-designer-profile-details/:userId" element={<FloorManagerProfile />} />
          </Route>

          {/**********************************************  content writer panel  ********************************************/}
          <Route path="/content-writer/login" element={<ContentWriterLogin setContentWriterToken={setContentWriterToken} />} />
          <Route element={contentWriterToken ? <ContentWriterLayout /> : <Navigate to="/content-writer/login" />}>
            <Route path="/content-writer/dashboard/:userId" element={<ContentWriterDashboard />} />
            <Route path="/content-writer/received-booking-box/:userId" element={<ContentWriterBookings />} />
            <Route path="/content-writer/mybookings/:userId" element={<ContentWriterMyBookings />} />
            <Route path="/content-writer-profile-details/:userId" element={<FloorManagerProfile />} />
          </Route>

          {/**********************************************  finance analyst panel  ********************************************/}
          <Route path="/finance-analyst/login" element={<FinanceAnalystLogin setFinanceAnalystToken={setFinanceAnalystToken} />} />
          <Route element={financeAnalystToken ? <FinanceAnalystLayout /> : <Navigate to="/finance-analyst/login" />}>
            <Route path="/finance-analyst/dashboard/:userId" element={<FinanceAnalystDashboard />} />
            <Route path="/finance-analyst-profile-details/:userId" element={<FloorManagerProfile />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;