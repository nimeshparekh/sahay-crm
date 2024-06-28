import React from "react";
import Header from "../Components/Header/Header";
import Navbar from "../Components/Navbar/Navbar";

import "../../assets/styles.css";
import "../../assets/table.css";
// import EmployeeTable from "../../";
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { GrDocumentStore } from "react-icons/gr";
import { AiOutlineTeam } from "react-icons/ai";
import { GoPerson } from "react-icons/go";
import { MdOutlinePersonPin } from "react-icons/md";
// import Employee from './Employees.js'
// import Team from './Team.js'
// import DeletedEmployeePanel from "./DeletedEmployeePanel.jsx";
import { AiOutlineUserDelete } from "react-icons/ai";








function NewEmployees() {
    // const secretKey = process.env.REACT_APP_SECRET_KEY;




    function CustomTabPanel(props) {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 3 }}>
                        <Typography>{children}</Typography>
                    </Box>
                )}
            </div>
        );
    }

    CustomTabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
    };

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };


    return (
        <div>
            <Header />
            <Navbar number={1} />
            <div className="page-wrapper">
                <div className="container-xl">
                    <div className="card mt-3">
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                <Tab label={
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <MdOutlinePersonPin style={{ height: "24px", width: "19px", marginRight: "5px" }} />
                                        <span style={{fontSize:"12px"}}>Employee List</span>
                                    </div>
                                } {...a11yProps(0)} />
                                 <Tab
                                    label={
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            {/* <AiOutlineUserDelete style={{ height: "24px", width: "19px", marginRight: "5px" }} /> */}
                                            {/* <span style={{fontSize:"12px"}}>Deleted Employees List</span> */}
                                        </div>
                                    }
                                    {...a11yProps(1)}
                                />
                                {/* <Tab
                                    label={
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <AiOutlineTeam style={{ height: "24px", width: "19px", marginRight: "5px" }} />
                                            <span style={{fontSize:"12px"}}>Teams</span>
                                        </div>
                                    }
                                    {...a11yProps(1)}
                                /> */}
                            </Tabs>
                        </Box>
                        <CustomTabPanel value={value} index={0}>
                            {/* <Employee /> */}
                        </CustomTabPanel>
                         <CustomTabPanel value={value} index={1}>
                            {/* <DeletedEmployeePanel/> */}
                        </CustomTabPanel>
                        {/* <CustomTabPanel value={value} index={1}>
                            <Team/>
                        </CustomTabPanel> */}
                    </div>
                </div>
            </div>
         

        </div>
    );
}

export default NewEmployees;
