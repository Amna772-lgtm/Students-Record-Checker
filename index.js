const { google } = require("googleapis");
const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());

const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const Port = process.env.PORT;

// Google sheet API authorization
const getAuthClient = async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    return await auth.getClient();
  } catch (error) {
    console.error("Error during authentication", error);
  }
};

// Write data in google sheets
const writeStudentsData = async (values) => {
  try {
    const authClientObject = await getAuthClient();

    const googleSheetsInstance = google.sheets({
      version: "v4",
      auth: authClientObject,
    });

    const existingData = await googleSheetsInstance.spreadsheets.values.get({
      spreadsheetId,
      range: "Students!A1:C1",
    });

    if (
      !existingData.data ||
      !existingData.data.values ||
      existingData.data.values.length === 0
    ) {
      // Add the header if it does not exist
      await googleSheetsInstance.spreadsheets.values.update({
        spreadsheetId,
        range: "Students!A1:C1",
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [["StudentID", "Name", "Email"]],
        },
      });
    }

    await googleSheetsInstance.spreadsheets.values.append({
      auth: authClientObject,
      spreadsheetId,
      range: "Students!A:C",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [values],
      },
    });
  } catch (error) {
    console.error("Error while reading the data from googlesheet", error);
  }
};

// Read data from google sheet
const readStudentsData = async () => {
  try {
    const authClientObject = await getAuthClient();

    const googleSheetsInstance = google.sheets({
      version: "v4",
      auth: authClientObject,
    });

    const response = await googleSheetsInstance.spreadsheets.values.get({
      auth: authClientObject,
      spreadsheetId,
      range: "Students!A:C",
    });

    // Skip the first row (header)
    const data = response.data.values;
    if (data && data.length > 1) {
      return data.slice(1);
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error while reading data from googlesheet", error);
  }
};

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
