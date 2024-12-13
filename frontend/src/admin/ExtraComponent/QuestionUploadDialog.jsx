import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Radio,
    RadioGroup,
    FormControlLabel,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { MdOutlineFileUpload } from "react-icons/md";
import { SiGoogledocs } from "react-icons/si";
import { MdDelete } from "react-icons/md";
import { AiOutlineDownload } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import Swal from "sweetalert2"

function QuestionUploadDialog({ dialogOpen, handleDialogToggle, completeData }) {
    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const [uploadMethod, setUploadMethod] = useState("form");
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        question: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correctOption: "",
        rightResponse: "",
        wrongResponse: "",
        slot: "",
    });
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [slotOptions, setSlotOptions] = useState(["slot 1", "slot 2"]);
    useEffect(() => {
        if (completeData && completeData.length > 0) {
            // Get the highest slot index
            const latestSlotIndex = Math.max(...completeData.map((slot) => slot.slotIndex));
            setSlotOptions([`slot ${latestSlotIndex}`, `slot ${latestSlotIndex + 1}`]);
        } else {
            // Default slots
            setSlotOptions(["slot 1", "slot 2"]);
        }
    }, [completeData]);
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear the error for the field when the user types
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDragEnter = () => {
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        setFile(droppedFile);
    };

    const handleRemoveFile = () => {
        setFile(null);
    };

    const validateForm = () => {
        let validationErrors = {};
        if (!formData.question) validationErrors.question = "Question is required.";
        if (!formData.option1) validationErrors.option1 = "Option 1 is required.";
        if (!formData.option2) validationErrors.option2 = "Option 2 is required.";
        if (!formData.option3) validationErrors.option3 = "Option 3 is required.";
        if (!formData.option4) validationErrors.option4 = "Option 4 is required.";
        if (formData.correctOption === "") validationErrors.correctOption = "Correct option is required.";
        if (!formData.rightResponse) validationErrors.rightResponse = "Right response is required.";
        if (!formData.wrongResponse) validationErrors.wrongResponse = "Wrong response is required.";
        if (!formData.slot) validationErrors.slot = "Slot is required.";
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Swal.fire({
                title: "Incomplete Form",
                text: "Please fill all mandatory fields before submitting.",
                icon: "warning",
                confirmButtonText: "Okay",
            });
            return;
        }
        try {
            let response;
            if (uploadMethod === "form") {
                let options = [formData.option1, formData.option2, formData.option3, formData.option4];
                // Transforming formData to match backend schema
                const payload = {
                    question: formData.question,
                    options: [formData.option1, formData.option2, formData.option3, formData.option4],
                    correctOption: options[parseInt(formData.correctOption, 10)], // Store value instead of index
                    rightResponse: formData.rightResponse,
                    wrongResponse: formData.wrongResponse,
                    slot: formData.slot,
                };

                response = await axios.post(`${secretKey}/question_related_api/post_form_data`, payload);
            } else if (uploadMethod === "excel") {
                const excelData = new FormData();
                excelData.append("file", file);
                excelData.append("slot", formData.slot); // Append slot to the form data
                response = await axios.post(`${secretKey}/question_related_api/upload-excel`, excelData);
            }

            // Show success alert
            Swal.fire({
                title: "Success!",
                text: "Questions uploaded successfully!",
                icon: "success",
                confirmButtonText: "Great!",
            });
            handleDialogToggle();
            setErrors({});
            setFormData({
                question: "",
                option1: "",
                option2: "",
                option3: "",
                option4: "",
                correctOption: "",
                rightResponse: "",
                wrongResponse: "",
                slot: "",
            })
        } catch (error) {
            console.error("Error:", error);
            Swal.fire({
                title: "Error",
                text: error.response.data.message || "Error uploading question. Please try again.",
                icon: "error",
                confirmButtonText: "Retry",
            });
        }
    };


    return (
        <Dialog
            className="My_Mat_Dialog"
            open={dialogOpen}
            onClose={handleDialogToggle}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                style: {
                    display: "flex",
                    flexDirection: "column",
                    height: "auto",
                },
            }}
        >
            <DialogTitle>
                <div className="d-flex justify-content-between align-items-center">
                    <div>Upload Questions</div>
                    <div>
                        <button
                            onClick={handleDialogToggle}
                            className="btn btn-link"
                            style={{ fontSize: "20px", padding: "0" }}
                        >
                            <IoClose />
                        </button>
                    </div>
                </div>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <RadioGroup
                            row
                            value={uploadMethod}
                            onChange={(e) => setUploadMethod(e.target.value)}
                        >
                            <FormControlLabel value="form" control={<Radio />} label="Form" />
                            <FormControlLabel value="excel" control={<Radio />} label="Excel" />
                        </RadioGroup>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth size="small">
                            <Select
                                name="slot"
                                value={formData.slot}
                                onChange={handleFormChange}
                            >
                                {slotOptions.map((slot, index) => (
                                    <MenuItem key={index} value={slot}>
                                        {slot}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.slot && <Typography color="error">{errors.slot}</Typography>}
                        </FormControl>
                    </Grid>
                    {uploadMethod === "form" && (
                        <>
                            <Grid item xs={12}>
                                <TextField
                                    label="Question"
                                    name="question"
                                    value={formData.question}
                                    onChange={handleFormChange}
                                    fullWidth
                                    size="small"
                                    error={!!errors.question}
                                    helperText={errors.question}
                                />
                            </Grid>
                            {[1, 2, 3, 4].map((num) => (
                                <Grid item xs={6} key={num}>
                                    <TextField
                                        label={`Option ${num}`}
                                        name={`option${num}`}
                                        value={formData[`option${num}`]}
                                        onChange={handleFormChange}
                                        fullWidth
                                        size="small"
                                        error={!!errors[`option${num}`]}
                                        helperText={errors[`option${num}`]}
                                    />
                                </Grid>
                            ))}
                            <Grid item xs={12}>
                                <Typography>Mark Correct Option</Typography>
                                <RadioGroup
                                    row
                                    value={formData.correctOption}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, correctOption: e.target.value }))
                                    }
                                >
                                    {[0, 1, 2, 3].map((index) => (
                                        <FormControlLabel
                                            key={index}
                                            value={`${index}`}
                                            control={<Radio />}
                                            label={`Option ${index + 1}`}
                                        />
                                    ))}
                                </RadioGroup>
                                {errors.correctOption && (
                                    <Typography color="error">{errors.correctOption}</Typography>
                                )}
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Right Response"
                                    name="rightResponse"
                                    value={formData.rightResponse}
                                    onChange={handleFormChange}
                                    fullWidth
                                    size="small"
                                    error={!!errors.rightResponse}
                                    helperText={errors.rightResponse}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Wrong Response"
                                    name="wrongResponse"
                                    value={formData.wrongResponse}
                                    onChange={handleFormChange}
                                    fullWidth
                                    size="small"
                                    error={!!errors.wrongResponse}
                                    helperText={errors.wrongResponse}
                                />
                            </Grid>
                        </>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions className="d-flex w-100 m-0 mt-1">
                <Button
                    style={{ border: "none", borderRadius: "0px" }}
                    className="btn btn-danger w-50 m-0"
                    color="error"
                    variant="contained"
                    onClick={handleDialogToggle}
                >
                    Cancel
                </Button>
                <Button
                    style={{ border: "none", borderRadius: "0px" }}
                    className="btn btn-primary w-50 m-0"
                    color="primary"
                    variant="contained"
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default QuestionUploadDialog;
