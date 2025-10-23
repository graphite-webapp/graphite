function onOpen() {
  const ui = SpreadsheetApp.getUi();

  const chapterMenu = ui.createMenu('Update chapter progression')
    .addItem('Chapter complete', 'chapterComplete')
    .addItem('Chapter unfinished', 'chapterIncomplete')

  const statsMenu = ui.createMenu('Toggle stats calculations')
    .addItem('Stats per session', 'statsPerSession')
    .addItem('Stats per day', 'statsPerDay')

  ui.createMenu('Run scripts')
    .addItem('Submit session', 'addSessionToLogs')
    .addSubMenu(chapterMenu)
    .addSubMenu(statsMenu)
    .addToUi();

  ui.createMenu('Dev tools')
    .addItem('Clear logs', 'initCleanLogs')
    .addToUi();
}

function getSheet(sheetName) {
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    SpreadsheetApp.getUi().alert(`Sheet '${sheetName}' not found`)
  }

  return sheet;
}

function fetchSheetData(sheet, range = null) {
  const source = 'fetchSheetData';
  let data = [];

  if(range !== null) {
    data = sheet.getRange(range).getValues();
  } else {
    data = sheet.getDataRange().getValues();
  }

  if (data.length === 0) {
    logMessage(logTypes.error, `Sheet '${sheet.getName()}' does not contain data.`, source);
  }

  return data;
}

