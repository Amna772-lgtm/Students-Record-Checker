# Student Record Checker and Slack Notifier
## Motivation
The purpose of this Node.js script is to automate the process of checking student records in a Google Sheet for missing or duplicate email entries. Ensuring the completeness and uniqueness of student email data is crucial for efficient communication and record-keeping. This script addresses these needs by detecting issues in the data, notifying relevant parties through Slack, and updating the Google Sheet automatically.
## Tech/Frame Used
- **Node.js:** JavaScript runtime environment.
- **Google Sheets API:** To read and write data in the Google Sheet.
- **Slack API:** To send notifications to a Slack channel.
- **dotenv:** For managing environment variables securely.
## Features
### Google Sheets Integration:
- Reads student records from a Google Sheet tab named "Students".
- Updates missing email fields with a generated temporary email in the format name_studentID@our-school.com.
### Data Processing:
- Checks each student record for missing emails.
- Identifies duplicate email addresses.
### Slack Notifications:
- Sends a Slack message when a record with a missing email is found, specifying the generated temporary email.
- Sends a Slack message listing all affected records when duplicate emails are detected.
### Error Handling:
- Incorporates try-catch blocks for handling connectivity issues and API rate limits.
- Logs errors to the console for debugging purposes.
### Retry Mechanism:
- Implements exponential backoff for API retries with a maximum of 5 attempts.
### Environment Variables:
- Loads sensitive data such as API keys and tokens from a .env file to enhance security.

