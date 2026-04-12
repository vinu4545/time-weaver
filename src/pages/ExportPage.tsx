import { DashboardLayout } from "@/components/DashboardLayout";
import { useTimetableStore } from "@/stores/timetableStore";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Table } from "lucide-react";
import { useState } from "react";
import { ALL_DAYS, ALL_SLOTS, DEFAULT_TIME_SLOTS } from "@/types/timetable";

export default function ExportPage() {
  const { generatedTimetables, subjects, faculty, rooms, labs, divisions } = useTimetableStore();
  const [selectedId, setSelectedId] = useState<string>(generatedTimetables[0]?.id || "");
  const timetable = generatedTimetables.find((t) => t.id === selectedId);
  const allRooms = [...rooms.map((r) => ({ id: r.id, name: r.name })), ...labs.map((l) => ({ id: l.id, name: l.name }))];
  const getName = (arr: { id: string; name: string }[], id: string) => arr.find((x) => x.id === id)?.name || id;

  const exportCSV = () => {
    if (!timetable) return;
    const header = "Division,Day,Slot,Time,Subject,Faculty,Room,Type\n";
    const rows = timetable.entries.map((e) => {
      const ts = DEFAULT_TIME_SLOTS.find((t) => t.id === e.slotId);
      return [
        getName(divisions, e.divisionId),
        e.day,
        e.slotId,
        `${ts?.startTime}-${ts?.endTime}`,
        getName(subjects, e.subjectId),
        getName(faculty, e.facultyId),
        getName(allRooms, e.roomId),
        e.type,
      ].join(",");
    }).join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${timetable.name}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    if (!timetable) return;
    const blob = new Blob([JSON.stringify(timetable, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${timetable.name}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-1 text-center">Export</h1>
        <p className="text-muted-foreground text-sm text-center mb-8">Download your generated timetable</p>

        {generatedTimetables.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No timetables to export. Generate one first.
          </div>
        ) : (
          <>
            <div className="mb-6">
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger><SelectValue placeholder="Select timetable" /></SelectTrigger>
                <SelectContent>
                  {generatedTimetables.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              <Button onClick={exportCSV} variant="outline" className="h-16 justify-start gap-4">
                <Table className="h-5 w-5 text-success" />
                <div className="text-left">
                  <p className="font-medium">Export as CSV</p>
                  <p className="text-xs text-muted-foreground">Spreadsheet-compatible format</p>
                </div>
                <Download className="h-4 w-4 ml-auto text-muted-foreground" />
              </Button>

              <Button onClick={exportJSON} variant="outline" className="h-16 justify-start gap-4">
                <FileText className="h-5 w-5 text-info" />
                <div className="text-left">
                  <p className="font-medium">Export as JSON</p>
                  <p className="text-xs text-muted-foreground">Full structured data</p>
                </div>
                <Download className="h-4 w-4 ml-auto text-muted-foreground" />
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
