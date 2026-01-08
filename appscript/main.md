```js (copy the entire codeblock below)

const SHEET_ID = "1h7wU2IlqCFkz5oz-8pVfFQ8LaUtoujO53ZmDZYqxMPY"; //replace this with your current google sheet ID
const SHEET_NAME = "offline_response";  // name of the sheet

/**
 * This function runs when the script's web app URL is visited.
 * It reads the specified spreadsheet and sheet name and returns the responses as JSON.
 */
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet with name "${SHEET_NAME}" was not found.`);
    }

    const data = sheet.getDataRange().getValues();
    const responses = {};
    
      for (let i = 1; i < data.length; i++) {
      const keyword = data[i][0]; // Column A
      const responseText = data[i][1]; // Column B
      
      if (keyword && typeof keyword === 'string' && keyword.trim() !== "") {
        responses[keyword] = responseText;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify(responses))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Could not read spreadsheet data. Error: " + error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
function doPost(e) {
  try {
    // The data is now a JSON string sent from the client. We must parse it.
    var data = JSON.parse(e.postData.contents);
    var eventType = data.event;
    
    // Use the timestamp from the client for accuracy.
    var eventDate = new Date(data.timestamp);

    // --- START: ROUTING LOGIC ---

    // **Case 1: The data is from the Contact Form.**
    if (eventType === 'Contact Form Submission') {
      
      // Get the sheet specifically for form records.
      var formSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("FORM RECORDS");
      
      // If the "FORM RECORDS" sheet doesn't exist, create it and add headers.
      if (!formSheet) {
        formSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("FORM RECORDS");
        formSheet.appendRow(["NAME", "EMAIL", "MESSAGE", "TIMESTAMP"]);
      }
      
      // Extract data from the payload (these match the 'name' attributes in your HTML form).
      var name = data.name; 
      var email = data.email;
      var message = data.message;
      
      // 1. Send the email notification to your personal Gmail.
      MailApp.sendEmail({
        to: "narvasajoshua61@gmail.com",
        subject: "AILA Contact Form: " + name,
        replyTo: email, // This lets you reply directly to the user from Gmail.
        htmlBody: "You have a new message from your AILA contact form:<br><br>" +
                  "<b>Name:</b> " + name + "<br>" +
                  "<b>Email:</b> " + email + "<br><br>" +
                  "<b>Message:</b><br>" + 
                  message.replace(/\n/g, '<br>') // Replaces newlines with <br> for email formatting.
      });

      // 2. Log the message to the "FORM RECORDS" sheet.
      formSheet.appendRow([name, email, message, eventDate]);

    } 
    // **Case 2: It's a regular Login/Registration event.**
    else {
      var userSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("users");
      
      // If the 'users' sheet is empty, create its headers.
      if (userSheet.getLastRow() == 0) {
        userSheet.appendRow(["EMAIL", "NAME", "TYPE", "CREATED AT", "LAST LOGIN", "IP ADDRESS"]);
      }
      
      var email = data.email;
      var username = data.username;
      var ipAddress = data.ipAddress;
      
      var emailRange = userSheet.getRange("A:A").getValues();
      var userRow = -1;
      for (var i = 0; i < emailRange.length; i++) {
        if (emailRange[i][0] == email) { userRow = i + 1; break; }
      }

      if (userRow > -1 && eventType.includes('Login')) {
        userSheet.getRange(userRow, 3).setValue(eventType);
        userSheet.getRange(userRow, 5).setValue(eventDate);
        userSheet.getRange(userRow, 6).setValue(ipAddress);
      } else if (userRow == -1) {
        userSheet.appendRow([email, username, eventType, eventDate, eventDate, ipAddress]);
      } else {
         userSheet.getRange(userRow, 2).setValue(username);
         userSheet.getRange(userRow, 3).setValue(eventType);
         userSheet.getRange(userRow, 5).setValue(eventDate);
         userSheet.getRange(userRow, 6).setValue(ipAddress);
      }
    }
    
    // --- END: ROUTING LOGIC ---

    // IMPORTANT: Return a success confirmation to the client-side script.
    return ContentService.createTextOutput(JSON.stringify({ 'status': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Log any errors for your own debugging in the Apps Script console.
    Logger.log(error.toString()); 
    // IMPORTANT: Return a detailed error message to the client-side script for its .catch() block.
    return ContentService.createTextOutput(JSON.stringify({ 'status': 'error', 'message': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
