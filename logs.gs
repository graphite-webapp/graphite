let immediateClean = false;

function initCleanLogs() {
  immediateClean = true;
  logCleanUp();
}

function logCleanUp() {
  const source = 'logCleanUp';

  try {
    const sheet = getSheet(sheetNames.devLogs);
    const rows = fetchSheetData(sheet).slice(2);
    const now = new Date();

    if (rows.length === 0) return;

    let timeLimit = immediateClean ? 0 : 7;

    let rowsToDelete = [];
    const lastRowIndex = sheet.getLastRow();

    rows.forEach((row, index) => {
      const logDate = new Date(row[4]); // Date in 6th column
      const timeDiff = (now - logDate) / (1000 * 60);
      const rowIndex = index + 3;

      if (timeDiff >= timeLimit) {
        if (rowIndex === lastRowIndex) {
          // This is the last row, so clear the content instead of deleting
          resetLastLogRow(sheet, rowIndex);
        } else {
          rowsToDelete.push(rowIndex);
        }
      }
    });

    if (rowsToDelete.length > 0) {
      sheet.deleteRows(3, rowsToDelete.length);
      Logger.log(`${immediateClean ? "Immediate" : "Automatic"} log cleaning: Old log entries cleared due to ${timeLimit} minute(s) of inactivity.`);
    } else {
      logMessage(logTypes.debug, `Logs are still active. Most recent log does not exceed ${timeLimit} minute(s).`, source);
    }
  } catch (err) {
    logMessage(logTypes.error, `Error in log cleanup: ${err.stack}`, source);
  }
}

//
// FUNCTIONS YOU CAN'T RUN
//

function logMessage(type, message, source) {
  try {
    Logger.log(message);
    
    const logDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm:ss dd/MM/yyyy");
    const rawDate = new Date(); // Store the raw date for log clean up checks

    const log = [logDate, type, message, source, rawDate];

    const sheet = getSheet(sheetNames.devLogs);
    sheet.appendRow(log);

    const row = sheet.getLastRow();
    formatLogRow(sheet, row, type);

    // Hide the last column where the raw date is stored
    const lastColumn = sheet.getLastColumn();
    sheet.hideColumn(sheet.getRange(1, lastColumn));
  } catch (err) {
    Logger.log(`Failed to log message: ${err.stack}.`);
  }
}

function formatLogRow(sheet, row, type) {
  const rowRange = sheet.getRange(row, 1, 1, sheet.getLastColumn());

  rowRange.setBackground(colors[type] || colors.DEFAULT);
}

// Log clean up

function resetLastLogRow(sheet, rowIndex) {
  const lastRowRange = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn());
  lastRowRange.clearContent();
  lastRowRange.setBackground(colors.DEFAULT);
}