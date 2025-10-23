function initStatsUpdate() {
  const source = "initStatsUpdate";
  try {
    const dashboardSheet = getSheet(sheetNames.dashboard);
    const setting = dashboardSheet.getRange(statsSettingCell).getValue();

    if(setting == "per day") {
      logMessage(logTypes.debug, `Calculating stats ${setting}. Triggering per day.`);
      statsPerDay();
      return;
    }

    logMessage(logTypes.debug, `Calculating stats ${setting}. Triggering per session.`);
    statsPerSession();
  } catch(err) {
    SpreadsheetApp.getUi().alert(`An error has occured, please contact the script creator for help: ${err.stack}`);
    logMessage(logTypes.error, `An error has occured: ${err.stack}`, source);
  }
}

function statsPerSession() {
  replaceFormulas('perSession');
}

function statsPerDay() {
  replaceFormulas('perDay');
}

function replaceFormulas(formulaType) {
  sheet = getSheet(sheetNames.dashboard);

  if(formulas[formulaType]) {
    const functions = formulas[formulaType];
    const keys = Object.keys(functions);

    // convert to 2D array to be able to paste into sheet
    const thisMonthFormulas = keys.map(k => [functions[k](-1, 0)]);
    const lastMonthFormulas = keys.map(k => [functions[k](-2, -1)]);

    sheet.getRange(statsThisMonthRange).setFormulas(thisMonthFormulas);
    sheet.getRange(statsLastMonthRange).setFormulas(lastMonthFormulas); 
  } else {
    SpreadsheetApp.getUi().alert(`An error has occured, please contact the script creator for help: formula type not found in object.`);
    return;
  }
}