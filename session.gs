function addSessionToLogs() {
  const source = "addSessionToLogs";

  try {
    const dashboardSheet = getSheet(sheetNames.dashboard);
    const logSheet = getSheet(sheetNames.logs);
    
    // Get form data from the Dashboard sheet
    const date = dashboardSheet.getRange(logSessionRange.date).getValue();
    const timeStart = dashboardSheet.getRange(logSessionRange.timeStart).getValue();
    const timeEnd = dashboardSheet.getRange(logSessionRange.timeEnd).getValue();
    const countStart = dashboardSheet.getRange(logSessionRange.countStart).getValue();
    const countEnd = dashboardSheet.getRange(logSessionRange.countEnd).getValue();
    const chapter = dashboardSheet.getRange(logSessionRange.chapter).getValue();

    // Validate the inputs
    if (!date || !timeStart || !timeEnd || (!countStart && countStart !== 0) || !countEnd || !chapter) {
      SpreadsheetApp.getUi().alert("Please fill in all the required fields: Date, Start and End times, Start and End word count, Chapter.");
      logMessage(logTypes.debug, `date: ${date}. timeStart: ${timeStart}. timeEnd: ${timeEnd}. countStart: ${countStart}. countEnd: ${countEnd}. chapter: ${chapter}.`, source);
      return;
    }

    if(!(date instanceof Date) || !(timeStart instanceof Date) || !(timeEnd instanceof Date)) {
      SpreadsheetApp.getUi().alert("Fill in proper date formats.");
      logMessage(logTypes.debug, `date: ${date}. timeStart: ${timeStart}. timeEnd: ${timeEnd}.`, source);
      return;
    }

    if(isNaN(countStart) || isNaN(countEnd)) {
      SpreadsheetApp.getUi().alert("Fill in proper number formats for word counts.");
      logMessage(logTypes.debug, `countStart: ${countStart}. countEnd: ${countEnd}.`, source);
      return;
    }

    // Append the new prompt to the Logs sheet
    const newRow = [date, timeStart, timeEnd, countStart, countEnd, '', '', '', chapter];
    logSheet.appendRow(newRow);

    const lastRow = logSheet.getLastRow();
    logSheet.getRange(lastRow, 6).setFormula(`=E${lastRow}-D${lastRow}`);  // Words written
    logSheet.getRange(lastRow, 7).setFormula(`=C${lastRow}-B${lastRow}`);  // Session duration
    logSheet.getRange(lastRow, 8).setFormula(`=ROUND(F${lastRow}/(G${lastRow}*1440),0)`); // WPM

    // Clear the input fields in the Dashboard and confirm success
    dashboardSheet.getRange(logSessionRange.countStart).setValue(countEnd);
    dashboardSheet.getRange(logSessionRange.countEnd).clearContent();
    dashboardSheet.getRange(logSessionRange.timeStart).clearContent();
    dashboardSheet.getRange(logSessionRange.timeEnd).clearContent();
    SpreadsheetApp.getUi().alert("Session has been saved.");
    logMessage(logTypes.info, "Session has been saved.", source);
  } catch (error) {
    SpreadsheetApp.getUi().alert(`An error has occured, please contact the script creator for help: ${error.stack}`);
    logMessage(logTypes.error, `An error has occured: ${error.stack}`, source);
  }
}

function chapterComplete() {
  addChapterToLogs(true);
}

function chapterIncomplete() {
  addChapterToLogs(false);
}

function addChapterToLogs(chapterComplete = true) {
  const source = "addChapterToLogs";

  try {
    const logSheet = getSheet(sheetNames.chapterLogs);
    const value = chapterComplete ? 1 : -1;

    const newRow = [new Date(), value];
    logSheet.appendRow(newRow);
    SpreadsheetApp.getUi().alert(`Chapter has been marked as ${chapterComplete ? 'completed' : 'not finished'}.`);
    logMessage(logTypes.info, `Chapter has been marked as ${chapterComplete ? 'completed' : 'not finished'}.`, source);
  } catch (error) {
    SpreadsheetApp.getUi().alert(`An error has occured, please contact the script creator for help: ${error.stack}`);
    logMessage(logTypes.error, `An error has occured: ${error.stack}`, source);
  }
}