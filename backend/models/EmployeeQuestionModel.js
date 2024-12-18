const mongoose = require("mongoose");

const employeeQuestionSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Employee Name
    email: { type: String, unique: true}, // Employee Email (unique identifier)
    number : { type: String, },
    empId:{type: mongoose.Schema.Types.ObjectId, ref: "newemployeeinfos"},
    assignedQuestions: [
        {
            slotIndex: { type: String, required: true }, // The slot from which the question was assigned
            slotId: { type: mongoose.Schema.Types.ObjectId, ref: "AdminExcerciseQuestion" }, // Reference to the question
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: "AdminExcerciseQuestion.questions" }, // Reference to the question
            question: { type: String, required: true, unique:true }, // Question
            options: { type: [String], required: true }, // Options
            correctOption: { type: String, required: true }, // Index of the correct option
            responses: {
                right: { type: String },
                wrong: { type: String },
            },
            dateAssigned: { type: Date  }, // Date the question was assigned
            dateAnswered: { type: Date  }, // Date the question was assigned
            answerGiven: { type: String }, // Employee's answer
            questionAnswered: { type: Boolean, default: false }, // Whether the employee has answered the question
            isCorrect: { type: Boolean }, // Whether the answer was correct
            isDeletedQuestion: { type: Boolean, default: false }, // New field to indicate deleted questions
        },
    ],
    createdAt: { type: Date, default: Date.now }, // Record creation timestamp
});

const EmployeeQuestionModel = mongoose.model("employeeQuestionModel", employeeQuestionSchema);
module.exports = EmployeeQuestionModel;
