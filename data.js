// ------------------------------------------------------------
// Schedule data. Edit this file to change the timetable.
// Slots use the same notation as the original PDF:
//   "1,2"      periods 1 and 2
//   "7*,1,2"   a star means the period is held in the Comp Lab
// ------------------------------------------------------------

const PERIODS = [
  { n: 1, start: "2:10", end: "3:00" },
  { n: 2, start: "3:10", end: "4:00" },
  { n: 3, start: "4:10", end: "5:00" },
  { n: 4, start: "5:10", end: "6:00" },
  { n: 5, start: "7:10", end: "8:00" },
  { n: 6, start: "8:10", end: "9:00" },
  { n: 7, start: "9:10", end: "10:00" },
  { n: 8, start: "10:10", end: "11:00" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const LAB_ROOM = "Comp Lab";

const GROUPS = [
  {
    id: "stat2", program: "Statistics", year: 2, short: "Stat Y2",
    label: "Statistics, 2nd Year", room: "B190-R09", rep: "",
    courses: [
      { title: "Basic Statistics", code: "Stat2011", cr: "3+2+1", teacher: "Frezer", slots: { Wed: "7*,1,2", Thu: "3,4" } },
      { title: "Linear Algebra I", code: "Maths2031", cr: "3+1+1", teacher: "Dr. Assaye W.", slots: { Mon: "1,2", Tue: "1,2" } },
      { title: "Calculus I", code: "Maths2021", cr: "4+2+0", teacher: "Dr. Gurju A.", slots: { Tue: "3,4", Thu: "5,6", Fri: "1,2" } },
      { title: "Introduction to Computer Science and Application", code: "Comp2011", cr: "3+0+2", teacher: "Mikru L.", slots: { Mon: "5,6,7", Wed: "3,4*" } },
      { title: "Microeconomics", code: "Econ2012", cr: "3+0+0", teacher: "Juharia A.", slots: { Mon: "3,4", Wed: "5" } },
      { title: "Inclusiveness", code: "Incl2011", cr: "2+0+0", teacher: "TBA", slots: { Thu: "1,2" } },
    ],
  },
  {
    id: "stat3", program: "Statistics", year: 3, short: "Stat Y3",
    label: "Statistics, 3rd Year", room: "166", rep: "Betelhem",
    courses: [
      { title: "Sampling Theory", code: "Stat3031", cr: "4+2+0", teacher: "Kassahun A.", slots: { Mon: "1,2", Thu: "6,7,8" } },
      { title: "Regression Analysis", code: "Stat3041", cr: "3+1+1", teacher: "Demeke L.", slots: { Tue: "1,2", Wed: "7,8", Fri: "4*" } },
      { title: "Fundamentals of Database Systems", code: "Comp3021", cr: "3+0+2", teacher: "Derejaw L.", slots: { Tue: "3,4*", Wed: "3,4" } },
      { title: "Statistical Computing I", code: "Stat3021", cr: "2+0+3", teacher: "Dereje T.", slots: { Tue: "5,6", Fri: "1,2,3*" } },
      { title: "Numerical Methods for Statistics", code: "Math3061", cr: "3+1+1", teacher: "Dr. Abdu M.", slots: { Mon: "3,4", Wed: "5,6", Thu: "5*" } },
      { title: "Macroeconomics", code: "Econ3033", cr: "3+0+0", teacher: "Getachew A.", slots: { Tue: "3,4", Fri: "5" } },
    ],
  },
  {
    id: "stat4", program: "Statistics", year: 4, short: "Stat Y4",
    label: "Statistics, 4th Year", room: "R17", rep: "Dawit, Demeku",
    courses: [
      { title: "Statistical Theory of Distributions", code: "Stat4051", cr: "3+2+0", teacher: "Mr. Habtamu", slots: { Mon: "1,2", Wed: "3,4" } },
      { title: "Demography", code: "Stat4071", cr: "3+1+0", teacher: "Gashu W.", slots: { Tue: "5,6", Thu: "3,4" } },
      { title: "Econometrics", code: "Stat4061", cr: "3+1+1", teacher: "TBA", slots: { Mon: "3,4,7*", Wed: "1,2" } },
      { title: "Statistical Quality Control", code: "Stat4081", cr: "3+1+1", teacher: "TBA", slots: { Mon: "8*", Tue: "1,2", Fri: "1,2" } },
      { title: "Project I: Proposal Writing", code: "Stat4091", cr: "0+0+1", teacher: "Melkamu A.", slots: {} },
      { title: "Practical Attachments", code: "Stat4093", cr: "0+0+2", teacher: "Melkamu A.", slots: {} },
      { title: "Applied Spatial Statistics", code: "Stat41xxa", cr: "3+2+0", teacher: "Kassahun A.", slots: { Tue: "3,4", Thu: "1,2" } },
    ],
  },
  {
    id: "ds2a", program: "Data Science", year: 2, short: "DS Y2 A",
    label: "Data Science, 2nd Year, Section A", room: "B190-R08", rep: "",
    courses: [
      { title: "Probability and Statistics", code: "Stat2011", cr: "3+2+0", teacher: "Frezer", slots: { Tue: "3,4", Thu: "1,2" } },
      { title: "Introduction to Data Science", code: "DaSc2011", cr: "2+2+1", teacher: "Dr. Worku M.", slots: { Mon: "3,4", Wed: "1*,2" } },
      { title: "Fundamentals of Programming with C++", code: "Comp2023", cr: "2+0+3", teacher: "Adane K.", slots: { Tue: "1,2,3*", Fri: "1,2" } },
      { title: "Calculus for Data Science", code: "Maths2021", cr: "3+2+0", teacher: "Dr. Hunegn", slots: { Tue: "7,8", Fri: "5,6" } },
      { title: "Programming Language for Data Science", code: "DaSc2013", cr: "3+0+2", teacher: "Anteneh Y.", slots: { Mon: "1,2*", Tue: "5,6" } },
      { title: "Linear Algebra for Data Science", code: "Maths2023", cr: "3+2+0", teacher: "Dr. Assaye W.", slots: { Mon: "7,8", Wed: "3,4,5" } },
      { title: "Sampling Theory and Research Methods", code: "Stat2013", cr: "2+0+2", teacher: "Kassahun A.", slots: { Mon: "5,6,7*,8*" } },
    ],
  },
  {
    id: "ds2b", program: "Data Science", year: 2, short: "DS Y2 B",
    label: "Data Science, 2nd Year, Section B", room: "B190-R08", rep: "",
    courses: [
      { title: "Probability and Statistics", code: "Stat2011", cr: "2+1+1", teacher: "Frezer", slots: { Mon: "1,2", Tue: "3*,4" } },
      { title: "Introduction to Data Science", code: "DaSc2011", cr: "2+2+1", teacher: "Dr. Worku M.", slots: { Mon: "5,6", Thu: "5*,6" } },
      { title: "Fundamentals of Programming with C++", code: "Comp2023", cr: "2+0+3", teacher: "Anteneh Y.", slots: { Wed: "1,2,3*", Fri: "1,2" } },
      { title: "Calculus for Data Science", code: "Maths2021", cr: "3+2+0", teacher: "Dr. Hunegn", slots: { Tue: "5,6", Fri: "3,4" } },
      { title: "Programming Language for Data Science", code: "DaSc2013", cr: "3+0+2", teacher: "Anteneh Y.", slots: { Wed: "5,6*", Thu: "8", Fri: "5,6" } },
      { title: "Linear Algebra for Data Science", code: "Maths2023", cr: "3+2+0", teacher: "Dr. Assaye W.", slots: { Thu: "1,2", Fri: "7,8" } },
      { title: "Sampling Theory and Research Methods", code: "Stat2013", cr: "2+0+2", teacher: "Kassahun A.", slots: { Wed: "3,4", Thu: "3,4*" } },
    ],
  },
  {
    id: "ds3", program: "Data Science", year: 3, short: "DS Y3",
    label: "Data Science, 3rd Year", room: "R17", rep: "Mieraf",
    courses: [
      { title: "Database Management System", code: "Comp3021", cr: "3+0+2", teacher: "Asnakew", slots: { Mon: "5,6*", Fri: "3,4" } },
      { title: "Operational Research and Optimization Techniques", code: "Stat3071", cr: "3+2+0", teacher: "Birtukan F.", slots: { Mon: "7,8", Fri: "5,6,7" } },
      { title: "Advanced Programming", code: "Comp3022", cr: "3+0+3", teacher: "Adane K.", slots: { Tue: "5,6,7*", Wed: "5,6,7" } },
      { title: "Discrete Mathematics", code: "Maths3051", cr: "3+2+0", teacher: "Mr. Daniel", slots: { Tue: "1,2", Thu: "7,8" } },
      { title: "Statistical Theory and Inference", code: "Stat3072", cr: "4+2+2", teacher: "Mr. Habtamu", slots: { Mon: "3,4*", Tue: "3,4", Thu: "5,6" } },
    ],
  },
  {
    id: "ds4", program: "Data Science", year: 4, short: "DS Y4",
    label: "Data Science, 4th Year", room: "R16", rep: "Yeshibir, Shambel",
    courses: [
      { title: "Multivariate Analysis", code: "Stat4082", cr: "3+1+2", teacher: "Berhanie", slots: { Tue: "5,6,7", Thu: "1,2*" } },
      { title: "Data Mining", code: "Dsci4032", cr: "2+0+3", teacher: "Dr. Worku M.", slots: { Thu: "3,4", Fri: "5,6,7*" } },
      { title: "Introduction to Artificial Intelligence", code: "Dsci4031", cr: "3+0+3", teacher: "Anteneh Y.", slots: { Mon: "3,4", Tue: "1,2", Thu: "5,6,7*" } },
      { title: "Preliminary Project", code: "Dsci4041", cr: "2+0+1", teacher: "Dr. Worku M.", slots: { Fri: "1,2" } },
      { title: "Digital Marketing, Social Media and Web Development", code: "Dsci3023", cr: "2+3+0", teacher: "Adane K.", slots: { Wed: "3,4", Fri: "3,4" } },
      { title: "Practical Attachment", code: "DSci3023", cr: "0+0+3", teacher: "Melkamu A.", slots: {} },
    ],
  },
];

// Highlight dates on the calendar (red). Format: "YYYY-MM-DD": "Label"
const EVENTS = {
  // "2026-10-20": "Mid-semester exam",
};
