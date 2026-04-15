import { Card } from "@/components/ui/card";
import type { TimetableEntry, Subject, Faculty, Room } from "@/types/timetable";
import { useMemo } from "react";

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

export interface TimetableData {
  entries: TimetableEntry[];
  subjects: Subject[];
  faculty: Faculty[];
  rooms: Room[];
  className?: string;
  divisionName?: string;
  classTeacher?: string;
  classRoom?: string;
  effectiveDate?: string;
}

interface FacultyWithInitials {
  id: string;
  name: string;
  initials: string;
}

function formatCellContent(entry: TimetableEntry, subjects: Subject[], faculty: Faculty[], rooms: Room[]): string | null {
  const subject = subjects.find(s => s.id === entry.subjectId);
  const fac = faculty.find(f => f.id === entry.facultyId);
  const room = rooms.find(r => r.id === entry.roomId);

  if (!subject) return null;

  const lines: string[] = [subject.name];

  if (fac && fac.name) {
    const initials = fac.name
      .split(/\s+/)
      .filter(w => !['Dr.', 'Mr.', 'Mrs.', 'Prof.'].includes(w))
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
    lines.push(`(${initials})`);
  }

  if (room && room.name) {
    lines.push(room.name);
  }

  return lines.join('\n');
}

function getAbbr(name: string): string {
  return name
    .split(/\s+/)
    .map(w => {
      if (w === '&') return '&';
      return w[0];
    })
    .join('')
    .toUpperCase();
}

function AbbreviationTable({ 
  data, 
  headers 
}: { 
  data: { abbr: string; name: string }[]; 
  headers: [string, string];
}) {
  const mid = Math.ceil(data.length / 2);
  const left = data.slice(0, mid);
  const right = data.slice(mid);

  const renderTable = (items: { abbr: string; name: string }[]) => (
    <table className="w-full text-[9px] border-collapse border border-slate-300 dark:border-slate-700">
      <thead>
        <tr className="bg-slate-50 dark:bg-slate-900/50">
          <th className="border border-slate-300 dark:border-slate-700 p-1 text-left w-12 font-semibold">{headers[0]}</th>
          <th className="border border-slate-300 dark:border-slate-700 p-1 text-left font-semibold">{headers[1]}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className="h-5">
            <td className="border border-slate-300 dark:border-slate-700 p-1 font-bold">{item.abbr}</td>
            <td className="border border-slate-300 dark:border-slate-700 p-1">{item.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="flex-1 grid grid-cols-2 gap-0 border border-slate-300 dark:border-slate-700">
      <div className="border-r border-slate-300 dark:border-slate-700">{renderTable(left)}</div>
      <div>{renderTable(right)}</div>
    </div>
  );
}

function TimetableFooter({ faculty, subjects }: { faculty: Faculty[]; subjects: Subject[] }) {
  const facultyData = faculty.map(f => ({
    abbr: f.name
      .split(/\s+/)
      .filter(w => !['Dr.', 'Mr.', 'Mrs.', 'Prof.'].includes(w))
      .map(n => n[0])
      .join('')
      .toUpperCase(),
    name: f.name
  }));

  const subjectData = subjects
    .filter(s => !s.isSpecial) // Exclude special slots like TG/Library from abbr table
    .map(s => ({
      abbr: getAbbr(s.name),
      name: s.name
    }));

  if (facultyData.length === 0 && subjectData.length === 0) return null;

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <AbbreviationTable 
          data={facultyData} 
          headers={["Abbr.", "Name of Faculty"]} 
        />
      </div>
      <div>
        <AbbreviationTable 
          data={subjectData} 
          headers={["Abbr.", "Name of Course"]} 
        />
      </div>
    </div>
  );
}

export function StaticTimetable({
  entries = [],
  subjects = [],
  faculty = [],
  rooms = [],
  className,
  divisionName = "A",
  classTeacher,
  classRoom = "32",
  effectiveDate = "05/01/2026"
}: TimetableData) {
  const entriesByDayAndSlot = useMemo(() => {
    const map: Record<string, TimetableEntry> = {};
    for (const entry of entries) {
      const key = `${entry.day}|${entry.slotId}`;
      map[key] = entry;
    }
    return map;
  }, [entries]);

  return (
    <Card className={`p-6 overflow-x-auto bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-xl ${className || ''}`}>
      <div className="min-w-[1000px]">
        <div className="text-center mb-6 space-y-1">
          <h2 className="text-xl font-bold uppercase tracking-tight">D.Y. Patil College of Engineering, Akurdi, Pune-44</h2>
          <p className="text-sm italic text-muted-foreground">An Autonomous Institute with effect from the academic year 2024-25</p>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
            <p className="text-sm font-semibold">Academic Year 2025-26 Semester: II</p>
            <p className="text-sm font-semibold">Department of Artificial Intelligence and Data Science</p>
            <h3 className="text-lg font-bold mt-1">Classroom Time Table</h3>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4 text-sm font-medium">
          <div>Class: SY</div>
          <div className="text-center">Div: {divisionName}</div>
          <div className="text-center">w.e.f. - {effectiveDate}</div>
          <div className="text-right">Class Room No: {classRoom}</div>
          <div>Date: </div>
          {classTeacher && <div className="col-span-3 text-right">Name of the Class Teacher : {classTeacher}</div>}
        </div>

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

                    const key = `${day}|${slot.id}`;
                    const entry = entriesByDayAndSlot[key];

                    let isSpanned = false;
                    for (let i = 0; i < idx; i++) {
                      const prevSlot = TIME_SLOTS[i];
                      const prevKey = `${day}|${prevSlot.id}`;
                      const prevEntry = entriesByDayAndSlot[prevKey];
                      if (prevEntry && prevEntry.slotId === slot.id) {
                        isSpanned = true;
                        break;
                      }
                    }
                    if (isSpanned) return null;

                    if (!entry) {
                      return (
                        <td
                          key={slot.id}
                          className="border border-slate-300 dark:border-slate-700 p-1 text-center align-middle"
                        >
                          <div className="flex flex-col justify-center items-center min-h-[60px] text-muted-foreground">
                            —
                          </div>
                        </td>
                      );
                    }

                    const content = formatCellContent(entry, subjects, faculty, rooms);

                    if (!content) {
                      return (
                        <td
                          key={slot.id}
                          className="border border-slate-300 dark:border-slate-700 p-1 text-center align-middle"
                        >
                          <div className="flex flex-col justify-center items-center min-h-[60px] text-muted-foreground">
                            —
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={slot.id}
                        className="border border-slate-300 dark:border-slate-700 p-1 text-center align-middle"
                      >
                        <div className="flex flex-col justify-center items-center min-h-[60px] whitespace-pre-line leading-tight">
                          {content}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <TimetableFooter faculty={faculty} subjects={subjects} />
    </Card>
  );
}
