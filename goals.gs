function submitGoals() {
  const source = "submitGoals";
  try {
    const goalsSheet = getSheet(sheetNames.goals);
    const goalType = fetchSheetData(goalsSheet, goalsRanges.type)[0][0];
    const monthlyGoal = fetchSheetData(goalsSheet, goalsRanges.monthly)[0][0];
    const yearlyGoal = fetchSheetData(goalsSheet, goalsRanges.yearly)[0][0];

    if(!validateForm(goalType, monthlyGoal, yearlyGoal)) {
      return;
    }

    // Update dashboard according to goal type
    let formulas;
    let texts;

    if(goalType == "Writing") {
      // save globally for safety checks
      userGoal = "Writing";
      formulas = goalsFormulas.word;
      texts = goalTexts.text.word;
    }

    if(goalType == "Editing") {
      // save globally for safety checks
      userGoal = "Editing";
      formulas = goalsFormulas.edit;
      texts = goalTexts.text.edit;
    }

    // customise sheet according to application
    const dashboardSheet = getSheet(sheetNames.dashboard);

    dashboardSheet.getRange(progressRanges.monthly.goal).setFormula(formulas.monthly.goal(monthlyGoal));
    dashboardSheet.getRange(progressRanges.monthly.completion).setFormula(formulas.monthly.completion(monthlyGoal));
    dashboardSheet.getRange(progressRanges.monthly.daily).setFormula(formulas.monthly.daily(monthlyGoal));
    dashboardSheet.getRange(progressRanges.monthly.weekly).setFormula(formulas.monthly.weekly(monthlyGoal));

    dashboardSheet.getRange(progressRanges.yearly.goal).setFormula(formulas.yearly.goal(yearlyGoal));
    dashboardSheet.getRange(progressRanges.yearly.completion).setFormula(formulas.yearly.completion(yearlyGoal));
    dashboardSheet.getRange(progressRanges.yearly.daily).setFormula(formulas.yearly.daily(yearlyGoal));
    dashboardSheet.getRange(progressRanges.yearly.weekly).setFormula(formulas.yearly.weekly(yearlyGoal));

    dashboardSheet.getRange(goalTexts.ranges.yearly.daily).setValue(texts.daily);
    dashboardSheet.getRange(goalTexts.ranges.yearly.weekly).setValue(texts.weekly);
    dashboardSheet.getRange(goalTexts.ranges.monthly.daily).setValue(texts.daily);
    dashboardSheet.getRange(goalTexts.ranges.monthly.weekly).setValue(texts.weekly);

    logMessage(logTypes.info, `Finished updating dashboard according to the form.`, source);
    SpreadsheetApp.getUi().alert(`Finished updating dashboard according to the form.`);
  } catch (err) {
    logMessage(logTypes.error, `An error has occured: ${err.stack}`, source);
    SpreadsheetApp.getUi().alert(`An error has occured, please contact the script creator for help: ${err.stack}`);
  }
}

function updateLocaleNumberFormat() {
  const locale = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale();

  // Map of locale -> number pattern
  const localePatterns = {
    "en": "#,##0",   // English locales (US, UK, etc.)
    "de": "#.##0",   // German-style (Germany, Austria, etc.)
    "fr": "# ##0",   // French-style (space separator)
    "es": "#.##0",   // Spanish-style (dot separator)
    "it": "#.##0",   // Italian-style
    "pt": "#.##0",   // Portuguese
    "ru": "# ##0",   // Russian-style (space separator)
    "zh": "#,##0",   // Chinese (comma separator)
    "ja": "#,##0",   // Japanese
    "ko": "#,##0",   // Korean
  };

  // Default to English-style if unknown
  for (const key in localePatterns) {
    if (locale.startsWith(key)) {
      numberFormat = localePatterns[key];
    }
  }

  numberFormat = "#,##0";
}


function validateForm(goalType, monthlyGoal, yearlyGoal) {
  const source = 'validateForm';

  if(!goalType || !monthlyGoal || !yearlyGoal) {
    logMessage(logTypes.warning, `Please fill in all application fields.`, source);
    logMessage(logTypes.debug, `goalType: ${goalType}. monthlyGoal: ${monthlyGoal}. yearlyGoal: ${yearlyGoal}.`, source);
    SpreadsheetApp.getUi().alert(`Please fill in all application fields.`);
    return false;
  }

  if((goalType !== "Writing" && goalType !== "Editing") || typeof monthlyGoal !== "number" || typeof yearlyGoal !== "number") {
    logMessage(logTypes.warning, `Please make sure the goal amount is a number and the goal type is according to the dropdown.`, source);
    logMessage(logTypes.debug, `goalType: ${goalType}. monthlyGoal: ${monthlyGoal}. yearlyGoal: ${yearlyGoal}.`, source);
    SpreadsheetApp.getUi().alert(`Please make sure the goal amount is a number and the goal type is according to the dropdown.`);
    return false;
  }

  if(monthlyGoal > yearlyGoal) {
    logMessage(logTypes.warning, `Your monthly goal is bigger than your yearly goal.`, source);
    logMessage(logTypes.debug, `monthlyGoal: ${monthlyGoal}. yearlyGoal: ${yearlyGoal}.`, source);
    SpreadsheetApp.getUi().alert(`Your monthly goal is bigger than your yearly goal.`);
    return false;
  }

  return true;
}