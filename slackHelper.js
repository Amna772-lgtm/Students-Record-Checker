const { App } = require("@slack/bolt");
const dotenv = require("dotenv");

dotenv.config();

// Function to Initialize slack client
const getSlackClient = async () => {
  try {
    const slackApp = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
    });
    return slackApp;
  } catch (error) {
    console.error("Error while initializing slack client", error);
    return null;
  }
};

const sendSlackMsg = async (message) => {
  try {
    const slackApp = await getSlackClient();

    if (slackApp) {
      await slackApp.client.chat.postMessage({
        channel: process.env.SLACK_CHANNEL,
        text: message,
      });
    } else {
      console.error("Slack client is not initialized");
    }
  } catch (error) {
    console.error("Error while sending slack message", error);
  }
};

// Check duplicate emails and send message
const checkDuplicateEmail = async (data) => {
  const uniqueEmail = {}; // Object to store unique records
  const duplicates = {}; // Object to store duplicate records

  for (let i = 0; i < data.length; i++) {
    const [studentId, name, email] = data[i];

    if (email) {
      if (uniqueEmail[email]) {
        if (!duplicates[email]) {
          duplicates[email] = [uniqueEmail[email]]; // Add the first occurrence
        }
        duplicates[email].push({ studentId, name }); // Add subsequent occurrences
      } else {
        uniqueEmail[email] = { studentId, name };
      }
    }
  }

  // method that returns array of objects
  if (Object.keys(duplicates).length > 0) {
    for (const email in duplicates) {
      const message =
        `Duplicate email detected: ${email}. Affected records: ` +
        duplicates[email]
          .map(
            (record) =>
              `[Student ID: ${record.studentId}, Name: ${record.name}]`
          )
          .join(", ");

      // Send Slack message for each duplicate email
      await sendSlackMsg(message);
    }
  }
};

module.exports = { sendSlackMsg, checkDuplicateEmail };

