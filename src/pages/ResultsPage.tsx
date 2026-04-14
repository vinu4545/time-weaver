import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useTimetableStore } from "@/stores/timetableStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_DAYS, ALL_SLOTS, DEFAULT_TIME_SLOTS, TEACHING_SLOTS } from "@/types/timetable";
import type { Day, SlotId, TimetableEntry } from "@/types/timetable";
import { StaticTimetable } from "@/components/StaticTimetable";
import { LayoutGrid, Table as TableIcon } from "lucide-react";

const SUBJECT_COLORS = [
  "bg-info/15 text-info border-info/30",
  "bg-success/15 text-success border-success/30",
  "bg-warning/15 text-warning border-warning/30",
  "bg-destructive/15 text-destructive border-destructive/30",
  "bg-primary/15 text-primary border-primary/30",
  "bg-accent-foreground/15 text-accent-foreground border-accent-foreground/30",
];

function getSubjectColor(subjectId: string, allSubjectIds: string[]): string {
  const idx = allSubjectIds.indexOf(subjectId);
  return SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
}

function TimetableGrid({
  entries, subjects, faculty, rooms, title,
}: {
  entries: TimetableEntry[];
  subjects: { id: string; name: string }[];
  faculty: { id: string; name: string }[];
  rooms: { id: string; name: string }[];
  title: string;
}) {
  const allSubjectIds = subjects.map((s) => s.id);
  const getName = (arr: { id: string; name: string }[], id: string) => arr.find((x) => x.id === id)?.name || id;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground w-20">Day</th>
              {ALL_SLOTS.map((s) => {
                const ts = DEFAULT_TIME_SLOTS.find((t) => t.id === s);
                const isBreak = ts?.isBreak;
                return (
                  <th key={s} className={`px-1 py-2 text-center font-medium text-muted-foreground ${isBreak ? 'w-12 bg-muted' : 'min-w-[100px]'}`}>
                    <div className="text-[11px]">{ts?.label}</div>
                    <div className="text-[9px] font-normal">{ts?.startTime}–{ts?.endTime}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ALL_DAYS.map((day) => (
              <tr key={day} className="bg-card">
                <td className="px-3 py-2 font-medium text-xs">{day.slice(0, 3)}</td>
                {ALL_SLOTS.map((slot) => {
                  const ts = DEFAULT_TIME_SLOTS.find((t) => t.id === slot);
                  if (ts?.isBreak) {
                    return (
                      <td key={slot} className="px-1 py-1 bg-muted/30 text-center">
                        <span className="text-[9px] text-muted-foreground">{ts.label}</span>
                      </td>
                    );
                  }
                  const entry = entries.find((e) => e.day === day && e.slotId === slot);
                  if (!entry) return <td key={slot} className="px-1 py-1 text-center text-muted-foreground text-xs">—</td>;
                  const color = getSubjectColor(entry.subjectId, allSubjectIds);
                  return (
                    <td key={slot} className="px-0.5 py-0.5">
                      <div className={`rounded-lg border p-1.5 text-[10px] leading-tight ${color}`}>
                        <div className="font-semibold truncate">{getName(subjects, entry.subjectId)}</div>
                        <div className="truncate opacity-80">{getName(faculty, entry.facultyId)}</div>
                        <div className="truncate opacity-60">{getName(rooms, entry.roomId)}</div>
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
  );
}

export default function ResultsPage() {
  const { generatedTimetables, subjects, faculty, rooms, divisions, labs } = useTimetableStore();
  const [selectedId, setSelectedId] = useState<string>(generatedTimetables[0]?.id || "sample");
  const [viewMode, setViewMode] = useState<'division' | 'faculty' | 'room' | 'sample'>('sample');

  const timetable = generatedTimetables.find((t) => t.id === selectedId);
  const allRooms = [...rooms.map((r) => ({ id: r.id, name: r.name })), ...labs.map((l) => ({ id: l.id, name: l.name }))];

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Results</h1>
            <p className="text-muted-foreground text-sm">View generated timetables</p>
          </div>
          <div className="flex items-center gap-3">
            {generatedTimetables.length > 0 && (
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Select timetable" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sample">Sample Template</SelectItem>
                  {generatedTimetables.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} (Score: {t.score.toFixed(1)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {timetable && (
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-mono">Score: {timetable.score.toFixed(1)}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${timetable.conflicts.length === 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              {timetable.conflicts.length === 0 ? 'No Conflicts' : `${timetable.conflicts.length} Conflicts`}
            </span>
            <span className="text-xs text-muted-foreground">{timetable.entries.length} entries</span>
          </div>
        )}

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="mb-6">
          <TabsList>
            <TabsTrigger value="sample" className="gap-2"><LayoutGrid className="h-4 w-4" /> Sample Template</TabsTrigger>
            {generatedTimetables.length > 0 && (
              <>
                <TabsTrigger value="division" className="gap-2"><TableIcon className="h-4 w-4" /> Division View</TabsTrigger>
                <TabsTrigger value="faculty" className="gap-2"><TableIcon className="h-4 w-4" /> Faculty View</TabsTrigger>
                <TabsTrigger value="room" className="gap-2"><TableIcon className="h-4 w-4" /> Room Utilization</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="sample" className="mt-6">
            <div className="mb-4 p-4 rounded-lg bg-info/10 border border-info/20 text-info text-sm">
              This is a <strong>static sample</strong> of how the final timetable will look, based on the provided reference.
            </div>
            <StaticTimetable />
          </TabsContent>

          {timetable && (
            <>
              <TabsContent value="division" className="space-y-8 mt-6">
                {divisions.map((div) => (
                  <TimetableGrid key={div.id} entries={timetable.entries.filter((e) => e.divisionId === div.id)}
                    subjects={subjects} faculty={faculty} rooms={allRooms} title={div.name} />
                ))}
              </TabsContent>

              <TabsContent value="faculty" className="space-y-8 mt-6">
                {faculty.map((fac) => {
                  const facEntries = timetable.entries.filter((e) => e.facultyId === fac.id);
                  if (facEntries.length === 0) return null;
                  return <TimetableGrid key={fac.id} entries={facEntries} subjects={subjects} faculty={faculty} rooms={allRooms} title={fac.name} />;
                })}
              </TabsContent>

              <TabsContent value="room" className="space-y-8 mt-6">
                {allRooms.map((room) => {
                  const roomEntries = timetable.entries.filter((e) => e.roomId === room.id);
                  if (roomEntries.length === 0) return null;
                  return <TimetableGrid key={room.id} entries={roomEntries} subjects={subjects} faculty={faculty} rooms={allRooms} title={room.name} />;
                })}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
