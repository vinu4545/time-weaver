import { Card } from "@/components/ui/card";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = [
  { label: "9 AM to 10 AM", id: "9-10" },
  { label: "10 AM to 11 AM", id: "10-11" },
  { label: "11 AM to 11:15 AM", id: "break-1", isBreak: true, labelShort: "SHORT BREAK" },
  { label: "11:15 AM to 12:15 PM", id: "1115-1215" },
  { label: "12:15 PM to 1:15 PM", id: "1215-115" },
  { label: "1:15 PM to 2:15 PM", id: "break-2", isBreak: true, labelShort: "LUNCH BREAK" },
  { label: "2:15 PM to 3:15 PM", id: "215-315" },
  { label: "3:15 PM to 4:15 PM", id: "315-415" },
  { label: "4:15 PM to 5:15 PM", id: "415-515" },
  { label: "5:15 PM to 6:15 PM", id: "515-615" },
];

const DATA: Record<string, Record<string, any>> = {
  Monday: {
    "9-10": { content: "A1-AIL-MS-SL2 LAB", span: 2, isLab: true },
    "1115-1215": { content: "CO&OS\n(MS)\n32" },
    "1215-115": { content: "DSA\n(MM)\n32" },
    "215-315": { content: "AI\n(MS)\n32" },
    "315-415": { content: "AE\n(SS)\n32" },
    "415-515": { content: "A2-AEL-ALL-PL1 LAB\nA3-DSAL-RTI-SL1 LAB\nA4-MOOCS-DS-DS LAB", span: 2, isLab: true },
  },
  Tuesday: {
    "1115-1215": { content: "SDG\n(AK)\n32" },
    "1215-115": { content: "CO&OS\n(MS)\n32" },
    "215-315": { content: "LIBRARY\nSLOT" },
    "315-415": { content: "PMF\n(AK)\n32" },
    "415-515": { content: "AI\n(MS)\n32" },
  },
  Wednesday: {
    "10-11": { content: "TG SLOT" },
    "1115-1215": { content: "A1-MOOCS-NG-DS LAB\nA2-DSAL-MM-SL1 LAB\nA3-AIL-VB-SL2 LAB\nA4-AEL-SS-PL1 LAB", span: 2, isLab: true },
    "215-315": { content: "DSA\n(MM)\n32" },
    "315-415": { content: "PSD\n(NS)\n32" },
    "415-515": { content: "SDG\n(AK)\n32" },
    "515-615": { content: "PMF\n(AK)\n32" },
  },
  Thursday: {
    "1115-1215": { content: "DSA\n(MM)\n32" },
    "1215-115": { content: "AI\n(MS)\n32" },
    "315-415": { content: "DS\n(SG)\n32" },
    "415-515": { content: "A1-AEL-ALL-PL1 LAB\nA3-MOOCS-DS-DS LAB\nA4-DSAL-RTI-SL1 LAB", span: 2, isLab: true },
  },
  Friday: {
    "10-11": { content: "TG SLOT" },
    "1115-1215": { content: "DSA\n(MM)\n25" },
    "1215-115": { content: "AE\n(SS)\n25" },
    "215-315": { content: "PWP\n(ANH)\n32" },
    "415-515": { content: "A1-PSD-RRW,\nA2-PSD-RRW,\nA3-PSD-RRW,\nA4-PSD-RRW (LANGUAGE LAB)", span: 2, isLab: true },
  },
  Saturday: {
    "9-10": { content: "A2-AIL-NR-BR", span: 2, color: "text-red-500" },
    "1115-1215": { content: "A2-AIL-NR-BR", span: 2, color: "text-red-500" },
  },
};

const FACULTY = [
  { abbr: "MM", name: "Mrs. Megha Mane", abbr2: "ALL", name2: "Mrs. Aparna Lavangade" },
  { abbr: "LD", name: "Dr. Latika Desai", abbr2: "ANH", name2: "Mrs. Ashika Hirulkar" },
  { abbr: "NG", name: "Mrs. Nehal Ganpule", abbr2: "SG", name2: "Dr. Suwarna Gothane" },
  { abbr: "VB", name: "Mrs. Vidya Bhosale", abbr2: "RTI", name2: "Ms. Rajshri Ingle" },
  { abbr: "SS", name: "Mrs. Shruti Sekra", abbr2: "DS", name2: "Dr. Deepali Sale" },
  { abbr: "MS", name: "Dr. Manish Sharma", abbr2: "AK", name2: "Mr. Ajit Kadam" },
  { abbr: "NS", name: "Nishu Sharma", abbr2: "RRW", name2: "Rohit R.Warvadkar" },
];

const COURSES = [
  { abbr: "DSA", name: "Data Structure & Algorithm" },
  { abbr: "CO&OS", name: "Computer Organization & Operating System" },
  { abbr: "AI", name: "Artificial Intelligence" },
  { abbr: "AE", name: "Advanced Excel" },
  { abbr: "DS", name: "Data Science" },
  { abbr: "SDG", name: "Sustainable Development Goals" },
  { abbr: "PTC", name: "Professional & Technical Communication" },
  { abbr: "PSD", name: "Professional Skill Development" },
  { abbr: "PWP", name: "Personal & Workspace Productivity" },
  { abbr: "PMF", name: "Project Management & Finance" },
];

export function StaticTimetable() {
  return (
    <Card className="p-6 overflow-x-auto bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-xl">
      <div className="min-w-[1000px]">
        {/* Header Section */}
        <div className="text-center mb-6 space-y-1">
          <h2 className="text-xl font-bold uppercase tracking-tight">D.Y. Patil College of Engineering, Akurdi, Pune-44</h2>
          <p className="text-sm italic text-muted-foreground">An Autonomous Institute with effect from the academic year 2024-25</p>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
            <p className="text-sm font-semibold">Academic Year 2025-26 Semester: II</p>
            <p className="text-sm font-semibold">Department of Artificial Intelligence and Data Science</p>
            <h3 className="text-lg font-bold mt-1">Classroom Time Table</h3>
          </div>
        </div>

        {/* Info Row */}
        <div className="grid grid-cols-4 gap-4 mb-4 text-sm font-medium">
          <div>Class: SY</div>
          <div className="text-center">Div: A</div>
          <div className="text-center">w.e.f. - 05/01/2026</div>
          <div className="text-right">Class Room No: 32</div>
          <div>Date: </div>
          <div className="col-span-3 text-right">Name of the Class Teacher : Mrs. Shurti Sekra</div>
        </div>

        {/* Timetable Grid */}
        <div className="border border-slate-300 dark:border-slate-700">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900">
                <th className="border border-slate-300 dark:border-slate-700 p-2 w-20">Day \ Time</th>
                {TIME_SLOTS.map((slot) => (
                  <th key={slot.id} className="border border-slate-300 dark:border-slate-700 p-2 text-center min-w-[100px]">
                    {slot.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => (
                <tr key={day} className="h-20">
                  <td className="border border-slate-300 dark:border-slate-700 p-2 font-bold bg-slate-50 dark:bg-slate-900/50">
                    {day}
                    {day === "Friday" && <div className="font-normal text-[9px] mt-1">(10/4/2026)</div>}
                    {day === "Saturday" && <div className="font-normal text-[9px] mt-1">(11/4/2026)</div>}
                  </td>
                  {TIME_SLOTS.map((slot, idx) => {
                    const cellData = DATA[day]?.[slot.id];
                    if (slot.isBreak) {
                      if (day === "Monday") {
                        return (
                          <td
                            key={slot.id}
                            rowSpan={6}
                            className="border border-slate-300 dark:border-slate-700 p-2 text-center bg-slate-100 dark:bg-slate-900 font-bold [writing-mode:vertical-rl] rotate-180"
                          >
                            {slot.labelShort}
                          </td>
                        );
                      }
                      return null;
                    }

                    // Check if previous cell spanned into this one
                    let isSpanned = false;
                    for (let i = 0; i < idx; i++) {
                      const prevSlot = TIME_SLOTS[i];
                      const prevData = DATA[day]?.[prevSlot.id];
                      if (prevData?.span > 1 && idx <= i + prevData.span - 1) {
                        isSpanned = true;
                        break;
                      }
                    }
                    if (isSpanned) return null;

                    return (
                      <td
                        key={slot.id}
                        colSpan={cellData?.span || 1}
                        className={`border border-slate-300 dark:border-slate-700 p-1 text-center align-middle ${
                          cellData?.isLab ? "font-medium" : ""
                        } ${cellData?.color || ""}`}
                      >
                        <div className="flex flex-col justify-center items-center min-h-[60px] whitespace-pre-line leading-tight">
                          {cellData?.content || ""}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Tables */}
        <div className="mt-6 grid grid-cols-2 gap-8 text-[10px]">
          {/* Faculty Abbreviations */}
          <div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900">
                  <th className="border border-slate-300 dark:border-slate-700 p-1 text-left">Abbrv.</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-1 text-left">Name of Faculty</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-1 text-left">Abbrv.</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-1 text-left">Name of Faculty</th>
                </tr>
              </thead>
              <tbody>
                {FACULTY.map((f, i) => (
                  <tr key={i}>
                    <td className="border border-slate-300 dark:border-slate-700 p-1 font-semibold">{f.abbr}</td>
                    <td className="border border-slate-300 dark:border-slate-700 p-1">{f.name}</td>
                    <td className="border border-slate-300 dark:border-slate-700 p-1 font-semibold">{f.abbr2}</td>
                    <td className="border border-slate-300 dark:border-slate-700 p-1">{f.name2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Course Abbreviations */}
          <div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900">
                  <th className="border border-slate-300 dark:border-slate-700 p-1 text-left">Abbrv.</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-1 text-left">Name of Course</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-1 text-left">Abbrv.</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-1 text-left">Name of Course</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="border border-slate-300 dark:border-slate-700 p-1 font-semibold">{COURSES[i].abbr}</td>
                    <td className="border border-slate-300 dark:border-slate-700 p-1">{COURSES[i].name}</td>
                    <td className="border border-slate-300 dark:border-slate-700 p-1 font-semibold">{COURSES[i+5]?.abbr}</td>
                    <td className="border border-slate-300 dark:border-slate-700 p-1">{COURSES[i+5]?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
}
