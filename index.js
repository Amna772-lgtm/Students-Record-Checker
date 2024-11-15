const express = require("express");
const {
  writeStudentsData,
  readStudentsData,
  updateTempEmail,
} = require("./googleSheetHelper");

const dotenv = require("dotenv");
const app = express();

dotenv.config();

app.use(express.json());
const Port = process.env.PORT;

// API endpoint to accept data and append to Google Sheets
app.post("/", async (req, res) => {
  try {
    const { studentId, name, email } = req.body;

    if (!studentId || !name) {
      return res.status(400).send("Missing required fields: studentId, name");
    }

    // Call the function to write data to Google Sheets
    await writeStudentsData([studentId, name, email]);

    res.status(200).send("Data added successfully");
  } catch (error) {
    console.error("Error adding data:", error);
    res.status(500).send("An error occurred while adding data");
  }
});

// API Endpoint to read data from googlesheet
app.get("/get-students", async (req, res) => {
  try {
    const data = await readStudentsData();

    if (!data || data.length === 0) {
      return res.status(404).send("No record found");
    }

    // Use the helper function to update missing emails
    await updateTempEmail(data);

    res.status(200).json({ students: data });
  } catch (error) {
    console.error("Error", error);
    res.status(500).send("An error occurred while reading data");
  }
});

// Port on which server is listening
app.listen(Port, () => {
  console.log(`Server is listening on ${Port}`);
});
