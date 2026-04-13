import { DashboardLayout } from "@/components/DashboardLayout";
import { useTimetableStore } from "@/stores/timetableStore";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Table, FileImage } from "lucide-react";
import { useState } from "react";
import { ALL_DAYS, ALL_SLOTS, DEFAULT_TIME_SLOTS, TEACHING_SLOTS } from "@/types/timetable";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
        getName(divisions, e.divisionId), e.day, e.slotId,
        `${ts?.startTime}-${ts?.endTime}`,
        getName(subjects, e.subjectId), getName(faculty, e.facultyId),
        getName(allRooms, e.roomId), e.type,
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

  const exportPDF = () => {
    if (!timetable) return;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('TimeForge AI — Timetable', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${timetable.name} | Score: ${timetable.score.toFixed(1)} | Generated: ${new Date(timetable.generatedAt).toLocaleString()}`, pageWidth / 2, 22, { align: 'center' });

    const slotsForTable = ALL_SLOTS;
    const slotHeaders = slotsForTable.map((s) => {
      const ts = DEFAULT_TIME_SLOTS.find((t) => t.id === s);
      return `${ts?.label}\n${ts?.startTime}-${ts?.endTime}`;
    });

    // Division-wise pages
    divisions.forEach((div, idx) => {
      if (idx > 0) doc.addPage();
      let yPos = idx === 0 ? 28 : 15;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Division: ${div.name}`, 14, yPos);
      yPos += 6;

      const divEntries = timetable.entries.filter((e) => e.divisionId === div.id);
      const body = ALL_DAYS.map((day) => {
        const row: string[] = [day.slice(0, 3)];
        slotsForTable.forEach((slot) => {
          const ts = DEFAULT_TIME_SLOTS.find((t) => t.id === slot);
          if (ts?.isBreak) {
            row.push(ts.label);
            return;
          }
          const entry = divEntries.find((e) => e.day === day && e.slotId === slot);
          if (entry) {
            row.push(`${getName(subjects, entry.subjectId)}\n${getName(faculty, entry.facultyId)}\n${getName(allRooms, entry.roomId)}`);
          } else {
            row.push('—');
          }
        });
        return row;
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Day', ...slotHeaders]],
        body,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 2, lineWidth: 0.2, overflow: 'linebreak' },
        headStyles: { fillColor: [43, 159, 147], textColor: 255, fontStyle: 'bold', fontSize: 7, halign: 'center' },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 18 },
          // Break columns get narrower
          ...Object.fromEntries(
            slotsForTable.map((s, i) => {
              const ts = DEFAULT_TIME_SLOTS.find((t) => t.id === s);
              return ts?.isBreak ? [i + 1, { cellWidth: 14, fillColor: [240, 240, 240], halign: 'center' as const }] : [i + 1, {}];
            }).filter(([, v]) => Object.keys(v as object).length > 0)
          ),
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });
    });

    doc.save(`${timetable.name}.pdf`);
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
              <Button onClick={exportPDF} variant="outline" className="h-16 justify-start gap-4">
                <FileImage className="h-5 w-5 text-destructive" />
                <div className="text-left">
                  <p className="font-medium">Export as PDF</p>
                  <p className="text-xs text-muted-foreground">Formatted timetable grid with division views</p>
                </div>
                <Download className="h-4 w-4 ml-auto text-muted-foreground" />
              </Button>

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
