import * as React from 'react';
import { useState, useEffect } from 'react'
import axios from 'axios'
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
//import Bell from './Bell';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { useParams } from "react-router-dom";

export default function RecruiterNotification({ name, designation }) {
  const secretKey = process.env.REACT_APP_SECRET_KEY;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);


  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const { userId } = useParams();
  const navigate = useNavigate();

  const [data, setdata] = useState([])
  const [employeeData, setEmployeeData] = useState([])
  const { recruiterUserId } = useParams();
  const { recruiterToken } = useParams();

  const fetchEmployeeData = async () => {

    try {
      const response = await axios.get(`${secretKey}/employee/einfo`);
      const data = response.data.filter(item => item.ename === name);
      setEmployeeData(data);
    } catch (error) {
      console.error("Error fetching employee data", error);
    }
  }

  React.useEffect(() => {
    fetchEmployeeData();
  }, [recruiterUserId]);



  const handleLogout = () => {
    const currentPage = window.location.pathname;
    // Clear the token from local storage based on the current page
    localStorage.removeItem("recuiterToken");
    navigate("/recruiter/login");

  };
  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>

        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          navigate(`/recruiter-profile-details/${userId}`);
          handleClose();
        }}>
          <Avatar /> Profile
        </MenuItem>

        {/* <MenuItem onClick={handleClose}>
          <Avatar /> My account
        </MenuItem> */}

        {/* <Divider /> */}

        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>

      </Menu>
    </React.Fragment>
  );
}