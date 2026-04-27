// Google Apps Script for Meta Ads Admin Dashboard & Join Form
// ----------------------------------------------------
function setupHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 
      'Name', 
      'WhatsApp Number', 
      'Location', 
      'Current Status', 
      'Study Field / Job Title', 
      'Expertise (Working Pros)', 
      'Primary Field / Interest'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 8).setFontWeight("bold");
  }
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Admin Action: Clear the sheet
    if (e.parameter.action === 'clear') {
      if (e.parameter.password === '#meta') { // Basic execution verification
        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          // Delete all rows except the header
          sheet.deleteRows(2, lastRow - 1);
        }
        return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'message': 'Data cleared successfully' }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': 'Unauthorized command' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Admin Action: Delete a single targeted row
    if (e.parameter.action === 'delete_row') {
      if (e.parameter.password === '#meta') {
        const rowToDel = parseInt(e.parameter.row_index);
        if (rowToDel > 1) { // Prevents arbitrary header deletion
          sheet.deleteRow(rowToDel);
          return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'message': 'Row manually deleted' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    
    // Default Flow: Process Submissions from the Join Form
    setupHeaders(sheet);
    const timestamp = new Date();
    
    const name = e.parameter.name || '';
    const whatsapp = "'+91 " + (e.parameter.whatsapp || '');
    const place = e.parameter.place || '';
    const status = e.parameter.status || '';
    const study_type = e.parameter.study_type || '';
    const job_title = e.parameter.job_title || '';
    const knowledge = e.parameter.knowledge || '';
    const interest = e.parameter.primary_interest || '';
    
    const contextField = (status === 'Student') ? study_type : job_title;
    
    sheet.appendRow([
      timestamp, name, whatsapp, place, status, contextField, knowledge, interest
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    // Return early if no active rows
    if (data.length <= 1) {
       return ContentService.createTextOutput(JSON.stringify({ result: 'success', data: [] }))
           .setMimeType(ContentService.MimeType.JSON);
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    // Translate sheet matrix to clean array of Javascript Objects
    const formattedData = rows.map((row, index) => {
      let obj = {};
      obj['id'] = index + 1; // Internal tracking sequence
      obj['row_index'] = index + 2; // Absolute Google Sheet map position referencing header skip
      obj['timestamp'] = row[0] ? new Date(row[0]).toISOString() : '';
      obj['name'] = row[1] || '';
      
      // Sanitizing the number if we previously appended standard excel forcing quotes '+'
      let whatsappStr = String(row[2] || '');
      if(whatsappStr.startsWith("'")) {
          whatsappStr = whatsappStr.substring(1);
      }
      obj['whatsapp'] = whatsappStr;
      
      obj['place'] = row[3] || '';
      obj['status'] = row[4] || '';
      obj['context_field'] = row[5] || '';
      obj['knowledge'] = row[6] || '';
      obj['interest'] = row[7] || '';
      
      return obj;
    });
    
    // Push the JSON response. Browser GET natively handles Google Apps CORS successfully!
    return ContentService.createTextOutput(JSON.stringify({ result: 'success', data: formattedData, total: formattedData.length }))
           .setMimeType(ContentService.MimeType.JSON);
           
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
           .setMimeType(ContentService.MimeType.JSON);
  }
}
