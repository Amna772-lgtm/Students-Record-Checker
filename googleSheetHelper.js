const { google } = require("googleapis");
const dotenv = require("dotenv");

dotenv.config();

const spreadsheetId = process.env.GOOGLE_SHEET_ID;

// Google sheet API authorization
const getAuthClient = async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
      },
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
    console.error("Error while writing the data in googlesheet", error);
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

// function to update missing email as temporary email
const updateTempEmail = async (data) => {
  try {
    const authClientObject = await getAuthClient();
    const googleSheetsInstance = google.sheets({
      version: "v4",
      auth: authClientObject,
    });

    const updatedData = [];

    for (let i = 0; i < data.length; i++) {
      const [studentId, name, email] = data[i];

      if (!email) {
        const tempEmail = `${name}_${studentId}@our-school.com`;
        updatedData.push([studentId, name, tempEmail]);

        // Correctly update email in googlesheet by sending values in the request body
        await googleSheetsInstance.spreadsheets.values.update({
          spreadsheetId,
          range: `Students!C${i + 2}`,
          valueInputOption: "USER_ENTERED",
          resource: {
            values: [[tempEmail]],
          },
        });
      }
    }
    
  } catch (error) {
    console.error("An error occurred while updating email", error);
  }
};

module.exports = { writeStudentsData, readStudentsData, updateTempEmail };
