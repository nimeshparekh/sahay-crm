import React, { useState } from 'react';
import axios from 'axios';
import { Button, Dialog, DialogContent, DialogTitle, IconButton,DialogActions } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { FaWhatsapp } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";

const NSWSMobileNo = ({ companyName, serviceName, nswsMobileNo ,refreshData , mainStatus}) => {
    const [email, setEmail] = useState(nswsMobileNo);
    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const [openEmailPopup, setOpenEmailPopup] = useState(false);

    const handleSubmitNSWSEmail = async () => {
        try {
            const response = await axios.post(`${secretKey}/rm-services/post-save-nswsphoneno`, {
                companyName,
                serviceName,
                email
            });
            if (response.status === 200) {
                // Swal.fire(
                //     'Email Added!',
                //     'The email has been successfully added.',
                //     'success'
                // );
                refreshData();
                setOpenEmailPopup(false); // Close the popup on success
            }
        } catch (error) {
            console.error("Error saving email:", error.message); // Log only the error message
        }
    };

    const handleCloseEmailPopUp = () => {
              setOpenEmailPopup(false)
    };

    return (
        <div>
            <div className="d-flex align-items-center justify-content-center wApp">
                <div className={'d-flex align-items-center justify-content-between'}>
                    <div
                        className="My_Text_Wrap"
                        title={nswsMobileNo}
                    >
                        {nswsMobileNo}
                    </div>
                    <button className='td_add_remarks_btn ml-1'
                        onClick={() => {  setOpenEmailPopup(true)  }}>
                        <FaPencilAlt/>
                    </button>
                </div>
                <a
                    href={`https://wa.me/${nswsMobileNo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        marginLeft: "10px",
                        lineHeight: "14px",
                        fontSize: "14px",
                    }}
                    ><FaWhatsapp />
                </a>
            </div>
          
            <Dialog
                className='My_Mat_Dialog'
                open={openEmailPopup}
                onClose={handleCloseEmailPopUp}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                <h3 className='m-0'>{companyName}</h3>
                </DialogTitle>
                <DialogContent>
                    <div className="card-footer">
                        <div className="remarks-input">
                            <input
                                type='email'
                                placeholder="Enter NSWS Phone No"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions className='p-0'>
                    <Button onClick={handleCloseEmailPopUp}
                        variant="contained"
                        color="error"
                        style={{ width: "100%",borderRadius:"0px" }} className='m-0'>Close</Button>
                    
                    <Button
                        onClick={handleSubmitNSWSEmail}
                        variant="contained"
                        color="primary"
                        style={{ width: "100%",borderRadius:"0px" }}
                        className='m-0'
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </div>

    );
};

export default NSWSMobileNo;
