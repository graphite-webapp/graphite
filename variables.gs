// Colour theme https://www.realtimecolors.com/?colors=212116-f3f0e8-495425-76322e-564b2f&fonts=Inter-Inter

const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

const sheetNames = {
  goals: 'Set up',
  dashboard: "Dashboard",
  logs: "Logs",
  chapterLogs: "Chapter Logs",
  devLogs: "Dev Logs",
}

let numberFormat = "#,##0";

const goalsRanges = {
  type: 'D8',
  monthly: 'D9',
  yearly: 'D10',
}

let userGoal = 'Writing';

const logTypes = {
  debug: 'DEBUG',
  info: 'INFO',
  warning: 'WARNING',
  error: 'ERROR',
}

const colors = {
  INFO: "#d0f0c0",
  DEBUG: "#b1d8fb",
  WARNING: "#fff3cd",
  ERROR: "#f89694",
  DEFAULT: "#fcfefc"
};

const logSessionRange = {
  date: 'E4',
  timeStart: 'E5',
  timeEnd: 'E6',
  countStart: 'E7',
  countEnd: 'E8',
  chapter: 'E9',
}

const statsThisMonthRange = "E20:E23";
const statsLastMonthRange = "K20:K23";

const logColumns = {
  date: 'Logs!A:A',
  wordsWritten: 'Logs!F:F',
  duration: 'Logs!G:G',
  wpm: 'Logs!H:H'
}

const statsSettingCell = "K9";

const formulas = {
  perSession: {
    avgWords: (startDate, endDate) => `=ROUND(AVERAGEIFS(${logColumns.wordsWritten}, ${logColumns.date}, ">=" & EOMONTH(TODAY(), ${startDate}) + 1, ${logColumns.date}, "<=" & EOMONTH(TODAY(), ${endDate})), 0)`,
    maxWords: (startDate, endDate) => `=MAXIFS(${logColumns.wordsWritten}, ${logColumns.date}, ">=" & EOMONTH(TODAY(), ${startDate}) + 1, ${logColumns.date}, "<=" & EOMONTH(TODAY(), ${endDate}))`,
    avgWPM: (startDate, endDate) => `=ROUND(AVERAGEIFS(${logColumns.wpm}, ${logColumns.date}, ">=" & EOMONTH(TODAY(), ${startDate}) + 1, ${logColumns.date}, "<=" & EOMONTH(TODAY(), ${endDate})), 0)`,
    maxWPM: (startDate, endDate) => `=MAXIFS(${logColumns.wpm}, ${logColumns.date}, ">=" & EOMONTH(TODAY(), ${startDate}) + 1, ${logColumns.date}, "<=" & EOMONTH(TODAY(), ${endDate}))`
  },
  perDay: {
    avgWords: (startDate, endDate) => 
      `=ROUND(
        AVERAGE(
          QUERY(
            {${logColumns.date}, ${logColumns.wordsWritten}},
            "select sum(Col2) 
            where Col1 >= date '" & TEXT(EOMONTH(TODAY(), ${startDate}) + 1, "yyyy-mm-dd") & 
            "' and Col1 <= date '" & TEXT(EOMONTH(TODAY(), ${endDate}), "yyyy-mm-dd") & 
            "' group by Col1 
            label sum(Col2) ''",
            0
          )
        ),
        0
      )`,
    maxWords: (startDate, endDate) => 
      `=MAX(
        QUERY(
          {${logColumns.date}, ${logColumns.wordsWritten}},
          "select sum(Col2) where Col1 >= date '" & TEXT(EOMONTH(TODAY(), ${startDate}) + 1, "yyyy-mm-dd") &
          "' and Col1 <= date '" & TEXT(EOMONTH(TODAY(), ${endDate}), "yyyy-mm-dd") &
          "' group by Col1 label sum(Col2) ''",
          0
        )
      )`,
    avgWPM: (startDate, endDate) => 
      `=ROUND(
        AVERAGE(
          ARRAYFORMULA(
            IF(
              LEN(UNIQUE(FILTER(${logColumns.date}, ${logColumns.date} >= EOMONTH(TODAY(), ${startDate}) + 1, ${logColumns.date} <= EOMONTH(TODAY(), ${endDate})))),
              SUMIF(${logColumns.date}, UNIQUE(FILTER(${logColumns.date}, ${logColumns.date} >= EOMONTH(TODAY(), ${startDate}) + 1, ${logColumns.date} <= EOMONTH(TODAY(), ${endDate}))), ${logColumns.wordsWritten})
              / (SUMIF(${logColumns.date}, UNIQUE(FILTER(${logColumns.date}, ${logColumns.date} >= EOMONTH(TODAY(), ${startDate}) + 1, ${logColumns.date} <= EOMONTH(TODAY(), ${endDate}))), ${logColumns.duration}) * 24 * 60),
              ""
            )
          )
        ),
        0
      )`,
    maxWPM: (startDate, endDate) => 
      `=ROUND(
        MAX(
          ARRAYFORMULA(
            IF(
              LEN(UNIQUE(FILTER(${logColumns.date}, ${logColumns.date} >= EOMONTH(TODAY(), ${startDate}) + 1, ${logColumns.date} <= EOMONTH(TODAY(), ${endDate})))), 
              SUMIF(${logColumns.date}, UNIQUE(FILTER(${logColumns.date}, ${logColumns.date} >= EOMONTH(TODAY(), ${startDate}) + 1, ${logColumns.date} <= EOMONTH(TODAY(), ${endDate}))), ${logColumns.wordsWritten}) 
              / (SUMIF(${logColumns.date}, UNIQUE(FILTER(${logColumns.date}, ${logColumns.date} >= EOMONTH(TODAY(), ${startDate}) + 1, ${logColumns.date} <= EOMONTH(TODAY(), ${endDate}))), ${logColumns.duration}) * 24 * 60), 
              ""
            )
          )
        ),
        0
      )`
  }
};

const progressRanges = {
  yearly: {
    goal: "E28",
    completion: "E29",
    daily: "E30",
    weekly: "E31",
  },
  monthly: {
    goal: "K28",
    completion: "K29",
    daily: "K30",
    weekly: "K31",
  }
}

const goalTexts = {
  ranges : {
    yearly: {
      daily: "C30",
      weekly: "C31",
    },
    monthly: {
      daily: "I30",
      weekly: "I31",
    }
  },
  text: {
    word: {
      daily: 'Daily words needed	',
      weekly: 'Weekly words needed	',
    },
    edit: {
      daily: 'Daily chapters needed	',
      weekly: 'Weekly chapters needed	',
    }
  }
}

const goalsFormulas = {
  word: {
    yearly: {
      goal: (goalAmount) => `=CONCAT(TEXT(SUM(Logs!F:F), "${numberFormat}"), " / " & TEXT(${goalAmount}, "${numberFormat}"))`,
      completion: (goalAmount) => `=CONCAT(ROUND(((SUBSTITUTE(${progressRanges.yearly.goal}, " / " & TEXT(${goalAmount}, "${numberFormat}"), "")) / ${goalAmount}) * 100, 0), "%")`,
      daily: (goalAmount) => `=MAX(0, ROUND((${goalAmount} - SUBSTITUTE(${progressRanges.yearly.goal}, " / " & TEXT(${goalAmount}, "${numberFormat}"), "")) / (DATE(YEAR(TODAY()),12,31) - TODAY() + 1), 0))`,
      weekly: (goalAmount) => `=MAX(0, ROUND((${goalAmount} - SUBSTITUTE(${progressRanges.yearly.goal}, " / " & TEXT(${goalAmount}, "${numberFormat}"), "")) / MAX(1, ROUNDUP(((DATE(YEAR(TODAY()),12,31) - TODAY() + 1) / 7), 0)), 0))`,
    },
    monthly: {
      goal: (goalAmount) => `=CONCAT(TEXT(SUMIFS(Logs!F:F, Logs!A:A, ">=" & EOMONTH(TODAY(), -1) + 1, Logs!A:A, "<=" & EOMONTH(TODAY(), 0)), "${numberFormat}"), " / " & TEXT(${goalAmount}, "${numberFormat}"))`,
      completion: (goalAmount) => `=CONCAT(ROUND(((SUBSTITUTE(${progressRanges.monthly.goal}, " / " & TEXT(${goalAmount}, "${numberFormat}"), "")) / ${goalAmount}) * 100, 0), "%")`,
      daily: (goalAmount) => `=MAX(0, ROUND((${goalAmount} - SUBSTITUTE(${progressRanges.monthly.goal}, " / " & TEXT(${goalAmount}, "${numberFormat}"), "")) / (EOMONTH(TODAY(),0) - TODAY() + 1), 0))`,
      weekly: (goalAmount) => `=MAX(0, ROUND((${goalAmount} - SUBSTITUTE(${progressRanges.monthly.goal}, " / " & TEXT(${goalAmount}, "${numberFormat}"), "")) / MAX(1, ROUNDUP(((EOMONTH(TODAY(),0) - TODAY() + 1) / 7), 0)), 0))`,
    }
  },
  edit: {
    yearly: {
      goal: (goalAmount) => `=CONCAT(TEXT(SUM('Chapter Logs'!B:B), "${numberFormat}"), " / " & TEXT(${goalAmount}, "${numberFormat}"))`,
      completion: (goalAmount) => `=CONCAT(ROUND(((SUBSTITUTE(${progressRanges.yearly.goal}, " / " & TEXT(${goalAmount}, "${numberFormat}"), "")) / ${goalAmount}) * 100, 0), "%")`,
      daily: (goalAmount) => `=MAX(0, ROUND((${goalAmount} - SUBSTITUTE(${progressRanges.yearly.goal}, " / " & TEXT(${goalAmount}, "${numberFormat}"), "")) / (DATE(YEAR(TODAY()),12,31) - TODAY() + 1), 0))`,
      weekly: (goalAmount) => `=MAX(0, ROUND((${goalAmount} - SUBSTITUTE(${progressRanges.yearly.goal}, " / " & TEXT(${goalAmount}, "${numberFormat}"), "")) / MAX(1, ROUNDUP(((DATE(YEAR(TODAY()),12,31) - TODAY() + 1) / 7), 0)), 0))`,
    },
    monthly: {
      goal: (goalAmount) => `=CONCAT(TEXT(SUMIFS('Chapter Logs'!B:B, 'Chapter Logs'!A:A, ">=" & EOMONTH(TODAY(), -1) + 1, 'Chapter Logs'!A:A, "<=" & EOMONTH(TODAY(), 0)), "${numberFormat}"), " / " & TEXT(${goalAmount}, "${numberFormat}"))`,
      completion: (goalAmount) => `=CONCAT(ROUND(((SUBSTITUTE(${progressRanges.monthly.goal}, " / " & TEXT(${goalAmount}, "${numberFormat}"), "")) / ${goalAmount}) * 100, 0), "%")`,
      daily: (goalAmount) => `=MAX(0, ROUND((${goalAmount} - SUBSTITUTE(${progressRanges.monthly.goal}, " / " & TEXT(${goalAmount}, "${numberFormat}"), "")) / (EOMONTH(TODAY(),0) - TODAY() + 1), 0))`,
      weekly: (goalAmount) => `=MAX(0, ROUND((${goalAmount} - SUBSTITUTE(${progressRanges.monthly.goal}, " / " & TEXT(${goalAmount}, "${numberFormat}"), "")) / MAX(1, ROUNDUP(((EOMONTH(TODAY(),0) - TODAY() + 1) / 7), 0)), 0))`,
    }
  }
}