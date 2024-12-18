var express = require("express");
var mongoose = require("mongoose");
var router = express.Router();
const QuestionModel = require("../models/QuestionModel");
const multer = require("multer");
const xlsx = require("xlsx");
const EmployeeQuestionModel = require("../models/EmployeeQuestionModel")
const adminModel = require("../models/Admin");

// Middleware for handling Excel uploads
const upload = multer({ storage: multer.memoryStorage() });

router.post("/post_form_data", async (req, res) => {
    try {
        console.log("Received request body:", req.body);

        const { question, options, correctOption, rightResponse, wrongResponse, slot } = req.body;

        // Validate input
        if (!question || !options || options.length !== 4 || !correctOption || !slot) {
            console.log("Validation failed: Missing required fields.");
            return res.status(400).json({ message: "Missing required fields." });
        }

        // Validate correctOption
        if (!options.includes(correctOption)) {
            console.log(`Validation failed: Correct option '${correctOption}' is not in options`, options);
            return res.status(400).json({ message: "Correct option must match one of the provided options." });
        }

        console.log("Validation successful. Checking for existing question...");

        // Check if question already exists in the slot
        let existingQuestion = await QuestionModel.findOne({
            slotIndex: slot,
            "questions.question": question,
        });

        if (existingQuestion) {
            console.log(`Duplicate question detected in slot '${slot}':`, question);
            return res.status(400).json({ message: "This question already exists in the slot." });
        }

        console.log("Question is unique. Preparing question data...");
        // Trim correctOption for clean formatting
        const trimmedCorrectOption = correctOption.trim();
        // Ensure wrongResponse starts correctly and append correctOption
        let updatedWrongResponse = wrongResponse.trim();

        // Remove ❌ or similar symbols if present
        if (updatedWrongResponse.startsWith("❌")) {
            updatedWrongResponse = updatedWrongResponse.substring(1).trim(); // Remove the cross symbol
        }

        // Check and update the message
        if (updatedWrongResponse.startsWith("Your answer is incorrect.")) {
            updatedWrongResponse = `❌ Your answer is incorrect. The correct answer is **"${trimmedCorrectOption}"**.`;
        } else {
            updatedWrongResponse = `❌ Your answer is incorrect. The correct answer is **"${trimmedCorrectOption}"**.`;
        }
        console.log("wrongResponse", wrongResponse)
        console.log("updatedWrong", updatedWrongResponse)

        // Prepare question data
        const questionData = {
            question,
            options,
            correctOption,
            responses: {
                right: rightResponse,
                wrong: updatedWrongResponse,
            },
        };

        console.log("Prepared question data:", questionData);

        // Find or create the slot
        let slotDocument = await QuestionModel.findOne({ slotIndex: slot });
        console.log("Slot document found:", slotDocument);

        if (!slotDocument) {
            console.log(`Slot '${slot}' not found. Creating new slot...`);
            slotDocument = new QuestionModel({
                slotIndex: slot,
                questions: [questionData],
            });
        } else {
            console.log(`Slot '${slot}' exists. Adding question to slot...`);
            slotDocument.questions.push(questionData);
        }

        console.log("Saving slot document...");
        await slotDocument.save();

        console.log("Slot document saved successfully:", slotDocument);

        res.status(200).json({
            message: "Question added successfully.",
            slot: slotDocument,
        });
    } catch (error) {
        console.error("Error during request processing:", error);
        res.status(500).json({ message: "Internal Server Error.", error: error.message });
    }
});

router.post("/upload-questions_excel", upload.single("file"), async (req, res) => {
    try {
        const { slot } = req.body;

        if (!slot) {
            console.log("Slot not provided.");
            return res.status(400).json({ message: "Slot is required." });
        }

        const file = req.file;
        if (!file) {
            console.log("Excel file not provided.");
            return res.status(400).json({ message: "Excel file is required." });
        }

        // Parse Excel file
        console.log("Parsing Excel file...");
        const workbook = xlsx.read(file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        console.log("Excel data parsed:", data);

        let skippedDuplicates = 0;
        let skippedInvalid = 0;
        const validQuestions = [];

        for (const [index, row] of data.entries()) {
            console.log(`Processing row ${index + 1}:`, row);

            // Map the Excel keys to match expected keys
            const question = row['Question'];
            const option1 = row['Option 1'];
            const option2 = row['Option 2'];
            const option3 = row['Option 3'];
            const option4 = row['Option 4'];
            const correctOption = row['Correct Option'];
            const rightResponse = row['Right Response'];
            const wrongResponse = row['Wrong Response'];

            // Validate fields
            if (!question || !option1 || !option2 || !option3 || !option4 || !correctOption) {
                console.log(`Row ${index + 1} skipped: Missing required fields.`);
                skippedInvalid++;
                continue;
            }

            const options = [option1, option2, option3, option4];
            if (!options.includes(correctOption)) {
                console.log(`Row ${index + 1} skipped: Correct option '${correctOption}' not in options.`, options);
                skippedInvalid++;
                continue;
            }

            // Auto-complete the wrongResponse if it starts with "Your answer is incorrect."
            if (wrongResponse && wrongResponse.trim().startsWith("Your answer is incorrect.")) {
                wrongResponse = `${wrongResponse.trim()} The correct answer is **"${correctOption}"**.`;
                console.log(`Row ${index + 1}: Auto-completed wrong response: ${wrongResponse}`);
            }

            // Check for duplicate questions in the database
            const exists = await QuestionModel.findOne({
                "questions.question": question,
            });
            if (exists) {
                console.log(`Row ${index + 1} skipped: Duplicate question detected.`, question);
                skippedDuplicates++;
                continue;
            }

            console.log(`Row ${index + 1} valid.`);
            validQuestions.push({
                question,
                options,
                correctOption,
                responses: {
                    right: rightResponse,
                    wrong: wrongResponse,
                },
            });
        }

        console.log("Valid questions prepared:", validQuestions);

        // Check if the total valid questions exceed the maximum allowed
        let slotDocument = await QuestionModel.findOne({ slotIndex: slot });
        if (!slotDocument) {
            console.log(`Slot '${slot}' not found. Creating new slot...`);
            slotDocument = new QuestionModel({ slotIndex: slot, questions: [] });
        }

        const currentQuestionCount = slotDocument.questions.length;
        console.log(`Current question count in slot '${slot}':`, currentQuestionCount);

        if (currentQuestionCount + validQuestions.length > 45) {
            console.log(`Cannot add ${validQuestions.length} questions. Slot capacity exceeded.`);
            return res.status(400).json({
                message: `Cannot add ${validQuestions.length} questions. The slot can only hold ${45 - currentQuestionCount} more questions.`,
            });
        }

        // Save valid questions to the slot
        console.log(`Adding ${validQuestions.length} questions to slot '${slot}'...`);
        slotDocument.questions.push(...validQuestions);
        await slotDocument.save();
        console.log(`Questions added successfully to slot '${slot}'.`);

        res.status(200).json({
            message: "Excel uploaded successfully.",
            totalUploaded: validQuestions.length,
            skippedInvalid,
            skippedDuplicates,
        });
    } catch (error) {
        console.error("Error processing Excel upload:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
});

router.get("/gets_all_questionData", async (req, res) => {
    try {
        const response = await QuestionModel.find({});
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
})

// Fetch available slots
// router.get("/available-slots", async (req, res) => {
//     try {
//         const slots = await QuestionModel.find({});
//         const employees = await adminModel.find({}).select("ename email newDesignation _id number").lean();

//         if (employees.length === 0) {
//             return res.status(400).json({ message: "No employees found. Add employees to proceed." });
//         }

//         // Ensure all employees are initialized in EmployeeQuestionModel without duplicates
//         const bulkOperations = [];
//         for (const employee of employees) {
//             bulkOperations.push({
//                 updateOne: {
//                     filter: { email: employee.email }, // Match by email
//                     update: {
//                         $setOnInsert: {
//                             name: employee.ename,
//                             email: employee.email,
//                             number:employee.number,
//                             empId:employee._id,
//                             assignedQuestions: [],
//                         },
//                     },
//                     upsert: true, // Insert only if the document does not exist
//                 },
//             });
//         }

//         // Perform bulk write operation to avoid duplicate entries
//         await EmployeeQuestionModel.bulkWrite(bulkOperations);

//         // Filter slots for availability
//         const availableSlots = await Promise.all(
//             slots.map(async (slot) => {
//                 const questionIds = slot.questions.map((q) => q._id.toString());

//                 const isAvailable = await Promise.all(
//                     employees.map(async (employee) => {
//                         const employeeData = await EmployeeQuestionModel.findOne({ email: employee.email });

//                         const askedQuestions = employeeData?.assignedQuestions
//                             .filter((q) => q.slotId.toString() === slot._id.toString())
//                             .map((q) => q.questionId.toString()) || [];

//                         const unaskedQuestions = questionIds.filter(
//                             (qId) => !askedQuestions.includes(qId)
//                         );

//                         return unaskedQuestions.length > 0;
//                     })
//                 );

//                 return isAvailable.every((status) => status)
//                     ? { label: slot.slotIndex.toUpperCase(), id: slot._id }
//                     : null;
//             })
//         );

//         // Remove null values from the final list of available slots
//         const filteredSlots = availableSlots.filter((slot) => slot !== null);

//         res.status(200).json({ availableSlots: filteredSlots });
//     } catch (error) {
//         console.error("Error fetching available slots:", error);
//         res.status(500).json({ message: "Internal Server Error", error });
//     }
// });

// router.get("/available-slots", async (req, res) => {
//     try {
//         const slots = await QuestionModel.find({});
//         const employees = await adminModel.find({ ename: "Swapnil Dattaa" }).select("ename email newDesignation _id number").lean();

//         if (employees.length === 0) {
//             return res.status(400).json({ message: "No employees found. Add employees to proceed." });
//         }

//         // Ensure all employees are initialized in EmployeeQuestionModel without duplicates
//         const bulkOperations = [];
//         for (const employee of employees) {
//             bulkOperations.push({
//                 updateOne: {
//                     filter: { email: employee.email }, // Match by email
//                     update: {
//                         $setOnInsert: {
//                             name: employee.ename,
//                             email: employee.email,
//                             number: employee.number,
//                             empId: employee._id,
//                             assignedQuestions: [],
//                         },
//                     },
//                     upsert: true, // Insert only if the document does not exist
//                 },
//             });
//         }

//         // Perform bulk write operation to avoid duplicate entries
//         await EmployeeQuestionModel.bulkWrite(bulkOperations);

//         // Fetch EmployeeQuestionModel entries for Swapnil Dattaa
//         const employeeQuestionData = await EmployeeQuestionModel.findOne({ name: "Swapnil Dattaa" });
//         console.log("\nEmployee Question Data for Swapnil Dattaa: ", employeeQuestionData);

//         // Check slot availability for Swapnil Dattaa
//         const employee = employees[0]; // Since we are filtering for one employee
//         const assignedQuestions = employeeQuestionData?.assignedQuestions || [];

//         console.log(`\nEmployee: ${employee.ename}`);
//         console.log(`Assigned Questions for ${employee.ename}: `, assignedQuestions);

//         const availableSlots = slots.map((slot) => {
//             const questionIds = slot.questions.map((q) => q._id.toString()); // All question IDs in the slot
//             console.log(`\nSlot: ${slot.slotIndex}`);
//             console.log(`All Questions in Slot (${slot.slotIndex}): `, questionIds);

//             // Questions already assigned to this employee for the slot
//             const askedQuestions = assignedQuestions
//                 .filter((q) => q.slotId.toString() === slot._id.toString())
//                 .map((q) => q.questionId.toString()); // Convert to string
//             console.log(`Asked Questions for ${employee.ename} in Slot (${slot.slotIndex}): `, askedQuestions);

//             // Check if there are unasked questions for this employee
//             const unaskedQuestions = questionIds.filter((qId) => !askedQuestions.includes(qId));
//             console.log(`Unasked Questions for ${employee.ename} in Slot (${slot.slotIndex}): `, unaskedQuestions);

//             return {
//                 slotId: slot._id,
//                 slotIndex: slot.slotIndex.toUpperCase(),
//                 isAvailable: unaskedQuestions.length > 0, // Slot is available for this employee if unasked questions exist
//             };
//         });

//         console.log(`\nAvailable Slots for ${employee.ename}: `, availableSlots);

//         res.status(200).json({
//             employeeId: employee._id,
//             employeeName: employee.ename,
//             availableSlots: availableSlots.filter((slot) => slot.isAvailable), // Filter available slots for this employee
//         });
//     } catch (error) {
//         console.error("Error fetching available slots:", error);
//         res.status(500).json({ message: "Internal Server Error", error });
//     }
// });

router.get("/available-slots", async (req, res) => {
    try {
        const slots = await QuestionModel.find({});
        const employees = await adminModel.find({}).select("ename email newDesignation _id number").lean();

        if (employees.length === 0) {
            return res.status(400).json({ message: "No employees found. Add employees to proceed." });
        }

        // Ensure all employees are initialized in EmployeeQuestionModel without duplicates
        const bulkOperations = [];
        for (const employee of employees) {
            bulkOperations.push({
                updateOne: {
                    filter: { email: employee.email }, // Match by email
                    update: {
                        $setOnInsert: {
                            name: employee.ename,
                            email: employee.email,
                            number: employee.number,
                            empId: employee._id,
                            assignedQuestions: [],
                        },
                    },
                    upsert: true, // Insert only if the document does not exist
                },
            });
        }

        // Perform bulk write operation to avoid duplicate entries
        await EmployeeQuestionModel.bulkWrite(bulkOperations);

        // Fetch all EmployeeQuestionModel entries
        const employeeQuestionData = await EmployeeQuestionModel.find({});

        // Check slot availability for every employee
        const slotAvailability = employees.map((employee) => {
            const employeeData = employeeQuestionData.find((e) => e.empId.toString() === employee._id.toString());
            const assignedQuestions = employeeData?.assignedQuestions || [];

            const availableSlots = slots.map((slot) => {
                const questionIds = slot.questions.map((q) => q._id.toString());

                const askedQuestions = assignedQuestions
                    .filter((q) => q.slotId.toString() === slot._id.toString())
                    .map((q) => q.questionId.toString());

                const unaskedQuestions = questionIds.filter((qId) => !askedQuestions.includes(qId));

                return {
                    slotId: slot._id,
                    slotIndex: slot.slotIndex.toUpperCase(),
                    isAvailable: unaskedQuestions.length > 0,
                };
            });

            return {
                employeeId: employee._id,
                employeeName: employee.ename,
                availableSlots: availableSlots.filter((slot) => slot.isAvailable), // Only send available slots
            };
        });

        res.status(200).json({ slotAvailability: slotAvailability }); // Send the array directly
    } catch (error) {
        console.error("Error fetching available slots:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
});


router.post("/push-questions", async (req, res) => {
    const socketIO = req.io;
    console.log("Processing push-questions...");
    try {
        const { assignedSlots } = req.body; // Map of employeeId -> slotId
        if (!assignedSlots || Object.keys(assignedSlots).length === 0) {
            return res.status(400).json({ message: "No slots assigned." });
        }

        const employeeIds = Object.keys(assignedSlots); // Extract employee IDs
        const employees = await adminModel.find({ _id: { $in: employeeIds } }); // Fetch employees

        const updates = []; // Array to store save operations

        for (const employee of employees) {
            const slotId = assignedSlots[employee._id.toString()]; // Match slotId with employee
            if (!slotId) {
                console.log(`No slotId assigned for employee: ${employee._id}`);
                continue; // Skip this employee if no slot is assigned
            }

            const slot = await QuestionModel.findById(slotId); // Fetch slot data
            if (!slot) {
                console.log(`Slot not found for slotId: ${slotId}`);
                continue; // Skip if slot doesn't exist
            }

            const employeeData = await EmployeeQuestionModel.findOne({ empId: employee._id }); // Fetch employee data
            if (!employeeData) {
                console.log(`No EmployeeQuestionModel found for employee: ${employee._id}`);
                continue; // Skip if employee data is not found
            }

            // Extract asked questions for this slot
            const askedQuestions = employeeData.assignedQuestions
                .filter((q) => q.slotId.toString() === slotId.toString())
                .map((q) => q.questionId.toString());

            // Get unasked questions
            const unaskedQuestions = slot.questions
                .map((q) => q._id.toString())
                .filter((qId) => !askedQuestions.includes(qId));

            if (unaskedQuestions.length === 0) {
                console.log(`No unasked questions available for employee: ${employee._id} in slot: ${slotId}`);
                continue; // Skip if no new questions are available
            }

            // Assign a random unasked question
            const randomIndex = Math.floor(Math.random() * unaskedQuestions.length);
            const questionToAssign = unaskedQuestions[randomIndex];
            const questionDetails = slot.questions.find((q) => q._id.toString() === questionToAssign);

            // Add question to assignedQuestions
            employeeData.assignedQuestions.push({
                slotIndex: slot.slotIndex,
                slotId: slot._id,
                questionId: questionToAssign,
                question: questionDetails.question,
                options: questionDetails.options,
                correctOption: questionDetails.correctOption,
                responses: questionDetails.responses,
                dateAssigned: new Date(),
            });

            socketIO.emit(`question_assigned`, {
                id: employee._id, // Unique employee ID
                ename: employee.ename, // Employee name
                data: {
                    questionId: questionToAssign,
                    question: questionDetails.question, // Question text
                    options: questionDetails.options, // Question options
                    correctOption: questionDetails.correctOption, // Correct answer
                    responses: questionDetails.responses, // Any additional responses
                },
            });

            updates.push(employeeData.save()); // Add save operation to updates
        }

        await Promise.all(updates); // Save all updates concurrently

        res.status(200).json({ message: "Questions successfully assigned to employees." });
    } catch (error) {
        console.error("Error assigning questions:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
});

router.post("/submit-answer", async (req, res) => {
    try {
        const { empId, questionId, selectedAnswer } = req.body;
        console.log(req.body)

        if (!empId || !questionId || !selectedAnswer) {
            return res.status(400).json({ message: "Invalid data provided." });
        }

        // Find the employee document
        const employee = await EmployeeQuestionModel.findOne({ empId });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found." });
        }

        // Locate the specific question within the assignedQuestions array
        const assignedQuestion = employee.assignedQuestions.find(
            (q) => q.questionId.toString() === questionId
        );

        if (!assignedQuestion) {
            return res.status(404).json({ message: "Question not found for this employee." });
        }

        // Trim both correctOption and selectedAnswer to handle spaces
        const trimmedCorrectOption = assignedQuestion.correctOption.trim();
        const trimmedSelectedAnswer = selectedAnswer.trim();

        // Update the answer and check correctness
        assignedQuestion.answerGiven = trimmedSelectedAnswer;
        assignedQuestion.isCorrect = trimmedCorrectOption === trimmedSelectedAnswer;

        // Save the updated employee document
        await employee.save();

        // Return feedback response
        return res.status(200).json({
            isCorrect: assignedQuestion.isCorrect,
            response: assignedQuestion.isCorrect
                ? assignedQuestion.responses.right || "Correct Answer!"
                : assignedQuestion.responses.wrong || "Wrong Answer. Try Again!",
        });
    } catch (error) {
        console.error("Error submitting answer:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// GET: Fetch responses for a specific question
router.get("/question-responses/:questionId", async (req, res) => {
    const { questionId } = req.params;

    try {
        // Fetch employees who answered the specific question
        const employeesWithAnswers = await EmployeeQuestionModel.find({
            "assignedQuestions.questionId": questionId,
        }).select("name assignedQuestions");

        // Process data to filter relevant question responses
        const responseList = [];
        employeesWithAnswers.forEach((employee) => {
            const question = employee.assignedQuestions.find(
                (q) => q.questionId.toString() === questionId
            );
            if (question) {
                responseList.push({
                    employeeName: employee.name,
                    answerGiven: question.answerGiven || "No Answer",
                    dateAnswered: question.dateAssigned,
                    isCorrect: question.isCorrect
                });
            }
        });

        // Send response
        if (responseList.length > 0) {
            res.status(200).json(responseList);
        } else {
            res.status(200).json([]); // No responses found
        }
    } catch (error) {
        console.error("Error fetching question responses:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


module.exports = router;