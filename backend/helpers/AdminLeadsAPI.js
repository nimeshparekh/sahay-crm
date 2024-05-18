var express = require('express');
var router = express.Router()
const dotenv = require('dotenv')
dotenv.config();
const CompanyModel = require("../models/Leads.js");
const RecentUpdatesModel = require('../models/RecentUpdates.js')
const { exec } = require("child_process");



router.get('/', async function(req,res){
    try{
        res.status(200).json({message:"running"})
    }catch(err){
        console.log('Error logging in with OAuth2 user', err);
    }

})

router.post("/manual", async (req, res) => {
    const receivedData = req.body;
    //console.log("receiveddata" , receivedData)
  
    // console.log(receivedData);
  
    try {
      const employee = new CompanyModel(receivedData);
      const savedEmployee = await employee.save();
      // console.log("Data sent");
      res
        .status(200)
        .json(savedEmployee || { message: "Data sent successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
      console.error("Error saving employee:", error.message);
    }
  })

  router.get('/getIds', async (req, res) => {
    try {
      const { dataStatus } = req.query;
  
      let query = {};
      if (dataStatus === 'Unassigned') {
        query = { ename: 'Not Alloted' };
      } else if (dataStatus === 'Assigned') {
        query = { ename: { $ne: 'Not Alloted' } };
      }
  
      // Query the collection to get only the _id fields
      const getId = await CompanyModel.find(query, '_id');
  
      // Extract the _id values into an array
      const allIds = getId.map(doc => doc._id);
  
      // Send the array of IDs as a response
      res.status(200).json(allIds);
    } catch (error) {
      console.error('Error fetching IDs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post("/postAssignData", async (req, res) => {
    const { employeeSelection, selectedObjects, title, date, time } = req.body;
    // If not assigned, post data to MongoDB or perform any desired action
    const updatePromises = selectedObjects.map((obj) => {
      // Add AssignData property with the current date
      const updatedObj = {
        ...obj,
        ename: employeeSelection,
        AssignDate: new Date(),
      };
      return CompanyModel.updateOne({ _id: obj._id }, updatedObj);
    });
  
    // Add the recent update to the RecentUpdatesModel
    const newUpdate = new RecentUpdatesModel({
      title: title,
      date: date,
      time: time,
    });
    await newUpdate.save();
  
    // Execute all update promises
    await Promise.all(updatePromises);
  
    res.json({ message: "Data posted successfully" });
  });

  router.delete("/deleteAdminSelectedLeads", async (req, res) => {
    const { selectedRows } = req.body;
  
    try {
      // Use Mongoose to delete rows by their IDs
      await CompanyModel.deleteMany({ _id: { $in: selectedRows } });
  
      // Trigger backup on the server
      exec(
        `mongodump --db AdminTable --collection newcdatas --out ${process.env.BACKUP_PATH}`,
        (error, stdout, stderr) => {
          if (error) {
            console.error("Error creating backup:", error);
            // Respond with an error if backup fails
            res.status(500).json({ error: "Error creating backup." });
          } else {
            // console.log("Backup created successfully:", stdout);
            // Respond with success message if backup is successful
            res.status(200).json({
              message:
                "Rows deleted successfully and backup created successfully.",
            });
          }
        }
      );
    } catch (error) {
      console.error("Error deleting rows:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  

  module.exports = router;