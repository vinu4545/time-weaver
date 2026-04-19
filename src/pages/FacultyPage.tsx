import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useTimetableStore } from "@/stores/timetableStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import type { Faculty, FacultyType, Day, SlotId } from "@/types/timetable";
import { ALL_DAYS, ALL_SLOTS, DEFAULT_TIME_SLOTS, TEACHING_SLOTS } from "@/types/timetable";

type SubjectForFaculty = {
  id: string;
  name: string;
  type: "lecture" | "practical" | "both";
};

type SubjectCapabilityDraft = {
  subjectId: string;
  lecture: boolean;
  practical: boolean;
};

function FacultyForm({ onSubmit, subjects }: { onSubmit: (f: Faculty) => void; subjects: SubjectForFaculty[] }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<FacultyType>("assistant");
  const [maxLoad, setMaxLoad] = useState(18);
  const [subjectCapabilities, setSubjectCapabilities] = useState<SubjectCapabilityDraft[]>([]);
  const [availability, setAvailability] = useState<Record<Day, SlotId[]>>({
    Monday: [...TEACHING_SLOTS],
    Tuesday: [...TEACHING_SLOTS],
    Wednesday: [...TEACHING_SLOTS],
    Thursday: [...TEACHING_SLOTS],
    Friday: [...TEACHING_SLOTS],
  });

  const toggleSlot = (day: Day, slot: SlotId) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].includes(slot)
        ? prev[day].filter((s) => s !== slot)
        : [...prev[day], slot],
    }));
  };

  const getCapability = (subject: SubjectForFaculty): SubjectCapabilityDraft | undefined => {
    return subjectCapabilities.find((c) => c.subjectId === subject.id);
  };

  const toggleSubject = (subject: SubjectForFaculty, checked: boolean) => {
    setSubjectCapabilities((prev) => {
      if (checked) {
        if (prev.some((c) => c.subjectId === subject.id)) return prev;
        const lecture = subject.type !== "practical";
        const practical = subject.type !== "lecture";
        return [...prev, { subjectId: subject.id, lecture, practical }];
      }
      return prev.filter((c) => c.subjectId !== subject.id);
    });
  };

  const toggleCapabilityRole = (subjectId: string, role: "lecture" | "practical", checked: boolean) => {
    setSubjectCapabilities((prev) =>
      prev.map((c) => {
        if (c.subjectId !== subjectId) return c;
        const next = { ...c, [role]: checked };
        return next;
      }).filter((c) => c.lecture || c.practical)
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    const resolvedCapabilities = subjectCapabilities
      .map((c) => {
        const allocationType = c.lecture && c.practical ? "both" : c.lecture ? "lecture" : c.practical ? "practical" : null;
        if (!allocationType) return null;
        return { subjectId: c.subjectId, allocationType };
      })
      .filter((c): c is { subjectId: string; allocationType: "lecture" | "practical" | "both" } => !!c);

    onSubmit({
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      subjectIds: resolvedCapabilities.map((c) => c.subjectId),
      subjectCapabilities: resolvedCapabilities,
      maxWeeklyLoad: maxLoad,
      availability: ALL_DAYS.map((d) => ({ day: d, slots: availability[d] })),
    });
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Smith" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as FacultyType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="assistant">Assistant</SelectItem>
              <SelectItem value="associate">Associate</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Max Weekly Load</Label>
          <Input type="number" min={1} max={30} value={maxLoad} onChange={(e) => setMaxLoad(+e.target.value)} />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Can Teach</Label>
        <div className="space-y-2">
          {subjects.map((s) => (
            <div key={s.id} className="border border-border rounded-md px-2 py-2">
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <Checkbox
                  checked={!!getCapability(s)}
                  onCheckedChange={(c) => toggleSubject(s, !!c)}
                />
                {s.name}
              </label>
              {getCapability(s) && s.type === "both" && (
                <div className="mt-2 ml-6 flex items-center gap-4 text-xs text-muted-foreground">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <Checkbox
                      checked={!!getCapability(s)?.lecture}
                      onCheckedChange={(c) => toggleCapabilityRole(s.id, "lecture", !!c)}
                    />
                    Lecture
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <Checkbox
                      checked={!!getCapability(s)?.practical}
                      onCheckedChange={(c) => toggleCapabilityRole(s.id, "practical", !!c)}
                    />
                    Practical
                  </label>
                </div>
              )}
            </div>
          ))}
          {subjects.length === 0 && <span className="text-xs text-muted-foreground">Add subjects first</span>}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Availability Matrix</Label>
        <div className="overflow-x-auto">
          <table className="text-xs w-full">
            <thead>
              <tr>
                <th className="text-left py-1 pr-2">Day</th>
                {ALL_SLOTS.map((s) => <th key={s} className="px-1 py-1 text-center">{s}</th>)}
              </tr>
            </thead>
            <tbody>
              {ALL_DAYS.map((day) => (
                <tr key={day}>
                  <td className="py-1 pr-2 font-medium">{day.slice(0, 3)}</td>
                  {ALL_SLOTS.map((slot) => {
                    const isBreak = DEFAULT_TIME_SLOTS.find(ts => ts.id === slot)?.isBreak;
                    return (
                      <td key={slot} className="text-center px-1 py-1">
                        <button
                          type="button"
                          onClick={() => !isBreak && toggleSlot(day, slot)}
                          disabled={isBreak}
                          className={`w-6 h-6 rounded text-xs transition ${
                            isBreak 
                              ? 'bg-muted/30 text-muted-foreground/50 cursor-not-allowed'
                              : availability[day].includes(slot) 
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {isBreak ? '—' : availability[day].includes(slot) ? '✓' : '×'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Button onClick={handleSubmit} className="w-full bg-gradient-primary text-primary-foreground">Add Faculty</Button>
    </div>
  );
}

export default function FacultyPage() {
  const { faculty, subjects, addFaculty, removeFaculty } = useTimetableStore();
  const [open, setOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Faculty</h1>
            <p className="text-muted-foreground text-sm">Manage faculty members and availability</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Add Faculty</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Add Faculty</DialogTitle></DialogHeader>
              <FacultyForm
                subjects={subjects.map((s) => ({ id: s.id, name: s.name, type: s.type }))}
                onSubmit={(f) => { addFaculty(f); setOpen(false); }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {faculty.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No faculty members yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {faculty.map((f) => (
              <div key={f.id} className="rounded-xl border border-border bg-card p-4 flex items-start justify-between">
                <div>
                  <p className="font-semibold">{f.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{f.type} • Max {f.maxWeeklyLoad} hrs/wk</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Teaches: {(f.subjectCapabilities || []).length > 0
                      ? (f.subjectCapabilities || [])
                          .map((cap) => {
                            const subjectName = subjects.find((s) => s.id === cap.subjectId)?.name || cap.subjectId;
                            return `${subjectName} (${cap.allocationType})`;
                          })
                          .join(", ")
                      : f.subjectIds.map((id) => subjects.find((s) => s.id === id)?.name || id).join(", ") || "None assigned"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFaculty(f.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
