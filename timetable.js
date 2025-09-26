// timetable.js

const timetable = {
  // 1: Monday, 2: Tuesday, ..., 6: Saturday, 0: Sunday
  1: [ // Monday
    { start: "09:20", end: "10:10", subject: "HCI", hour: "I" },
    { start: "10:10", end: "11:00", subject: "FDT", hour: "II" },
    { start: "11:10", end: "12:00", subject: "DWDM", hour: "III" },
    { start: "12:00", end: "12:50", subject: "WT", hour: "IV" },
    { start: "13:30", end: "14:20", subject: "PPL", hour: "V" },
    { start: "14:20", end: "15:05", subject: "CN", hour: "VI" },
    { start: "15:05", end: "15:50", subject: "Library", hour: "VII" }
  ],
  2: [ // Tuesday
    { start: "09:20", end: "10:10", subject: "PPL", hour: "I" },
    { start: "10:10", end: "11:00", subject: "DWDM", hour: "II" },
    { start: "11:10", end: "12:00", subject: "WT", hour: "III" },
    { start: "12:00", end: "12:50", subject: "CN", hour: "IV" },
    { start: "13:30", end: "14:20", subject: "FDT", hour: "V" },
    { start: "14:20", end: "15:50", subject: "T&P", hours: ["VI", "VII"] }
  ],
  3: [ // Wednesday
    { start: "09:20", end: "10:10", subject: "WT", hour: "I" },
    { start: "10:10", end: "11:00", subject: "CN", hour: "II" },
    { start: "11:10", end: "12:00", subject: "FDT", hour: "III" },
    { start: "12:00", end: "12:50", subject: "HCI", hour: "IV" },
    { start: "13:30", end: "15:50", subject: "CNOS Lab", hours: ["V", "VI", "VII"] }
  ],
  4: [ // Thursday
    { start: "09:20", end: "10:10", subject: "CN", hour: "I" },
    { start: "10:10", end: "11:00", subject: "PPL", hour: "II" },
    { start: "11:10", end: "12:00", subject: "DWDM", hour: "III" },
    { start: "12:00", end: "12:50", subject: "FDT", hour: "IV" },
    { start: "13:30", end: "15:50", subject: "DMWT Lab", hours: ["V", "VI", "VII"] }
  ],
  5: [ // Friday
    { start: "09:20", end: "10:10", subject: "DWDM", hour: "I" },
    { start: "10:10", end: "11:00", subject: "HCI", hour: "II" },
    { start: "11:10", end: "12:00", subject: "WT", hour: "III" },
    { start: "12:00", end: "12:50", subject: "PPL", hour: "IV" },
    { start: "13:30", end: "14:20", subject: "FDT", hour: "V" },
    { start: "14:20", end: "15:05", subject: "CDI", hour: "VI" }
  ],
  6: [ // Saturday
    { start: "09:20", end: "10:10", subject: "DWDM", hour: "I" },
    { start: "10:10", end: "11:00", subject: "HCI", hour: "II" },
    { start: "11:10", end: "12:00", subject: "WT", hour: "III" },
    { start: "12:00", end: "12:50", subject: "CN", hour: "IV" },
    { start: "13:30", end: "15:05", subject: "T&P", hours: ["V", "VI"] },
    { start: "15:05", end: "15:50", subject: "SPORTS", hour: "VII" }
  ]
};