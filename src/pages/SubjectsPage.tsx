import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useTimetableStore } from "@/stores/timetableStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import type { Subject, SubjectType } from "@/types/timetable";

function SubjectForm({ onSubmit, initial }: { onSubmit: (s: Subject) => void; initial?: Subject }) {
  const [name, setName] = useState(initial?.name || "");
  const [type, setType] = useState<SubjectType>(initial?.type || "lecture");
  const [lecturesPerWeek, setLectures] = useState(initial?.lecturesPerWeek || 3);
  const [practicalHoursPerWeek, setPracticals] = useState(initial?.practicalHoursPerWeek || (initial?.type === 'practical' || initial?.type === 'both' ? 1 : 0));
  const [lectureDuration, setLectureDuration] = useState<1 | 2 | 3>(initial?.lectureDuration || 1);
  const [practicalDuration, setPracticalDuration] = useState<1 | 2 | 3>(initial?.practicalDuration || 2);
  const [requiresLab, setRequiresLab] = useState(initial?.requiresLab || false);
  const [isSpecial, setIsSpecial] = useState(initial?.isSpecial || false);
  const [specialType, setSpecialType] = useState<'tg' | 'library' | 'language_lab'>(initial?.specialType || 'tg');

  const specialTypeNameMap: Record<'tg' | 'library' | 'language_lab', string> = {
    tg: 'TG Slot',
    library: 'Library Slot',
    language_lab: 'Language Lab Slot',
  };

  useEffect(() => {
    if (isSpecial) {
      setLectureDuration(1);
      setPracticalDuration(1);
    }
  }, [isSpecial]);

  const handleSubmit = () => {
    const resolvedName = isSpecial ? specialTypeNameMap[specialType] : name.trim();
    if (!resolvedName) return;

    onSubmit({
      id: initial?.id || crypto.randomUUID(),
      name: resolvedName,
      type,
      lecturesPerWeek,
      practicalHoursPerWeek,
      lectureDuration, practicalDuration, requiresLab,
      ...(isSpecial ? { isSpecial: true, specialType } : {}),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Switch checked={isSpecial} onCheckedChange={setIsSpecial} />
        <Label>Special Slot (TG / Library / Language Lab)</Label>
      </div>
      {isSpecial && (
        <div>
          <Label>Special Type</Label>
          <Select value={specialType} onValueChange={(v) => setSpecialType(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tg">TG Slot</SelectItem>
              <SelectItem value="library">Library</SelectItem>
              <SelectItem value="language_lab">Language Lab</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label>Subject Name</Label>
        <Input
          value={isSpecial ? specialTypeNameMap[specialType] : name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Mathematics"
          disabled={isSpecial}
        />
      </div>
      <div>
        <Label>Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as SubjectType)} disabled={isSpecial}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="lecture">Lecture</SelectItem>
            <SelectItem value="practical">Practical</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Lectures/Week</Label>
          <Input type="number" min={0} max={10} value={lecturesPerWeek} onChange={(e) => setLectures(+e.target.value)} disabled={isSpecial || type === 'practical'} />
        </div>
        <div>
          <Label>Practical Hrs/Week</Label>
          <Input type="number" min={0} max={10} value={practicalHoursPerWeek} onChange={(e) => setPracticals(+e.target.value)} disabled={isSpecial || type === 'lecture'} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {isSpecial ? (
          <div className="col-span-2">
            <Label>Slot Duration (hours)</Label>
            <Select 
              value={String(lectureDuration)} 
              onValueChange={(v) => {
                const val = +v as 1 | 2 | 3;
                setLectureDuration(val);
                setPracticalDuration(val);
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Hour</SelectItem>
                <SelectItem value="2">2 Hours</SelectItem>
                <SelectItem value="3">3 Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <>
            {type !== 'practical' && (
              <div>
                <Label>Lecture Duration (hours)</Label>
                <Select value={String(lectureDuration)} onValueChange={(v) => setLectureDuration(+v as 1 | 2 | 3)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Hour</SelectItem>
                    <SelectItem value="2">2 Hours</SelectItem>
                    <SelectItem value="3">3 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {type !== 'lecture' && (
              <div>
                <Label>Practical Duration (hours)</Label>
                <Select value={String(practicalDuration)} onValueChange={(v) => setPracticalDuration(+v as 1 | 2 | 3)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Hour</SelectItem>
                    <SelectItem value="2">2 Hours</SelectItem>
                    <SelectItem value="3">3 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={requiresLab} onCheckedChange={setRequiresLab} />
        <Label>Requires Lab</Label>
      </div>
      <Button onClick={handleSubmit} className="w-full bg-gradient-primary text-primary-foreground">
        {initial ? "Update" : "Add"} {isSpecial && specialType === 'tg' ? "Slot" : "Subject"}
      </Button>
    </div>
  );
}

export default function SubjectsPage() {
  const { subjects, addSubject, removeSubject } = useTimetableStore();
  const [open, setOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Subjects</h1>
            <p className="text-muted-foreground text-sm">Manage academic subjects and special slots</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Add Subject</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Subject</DialogTitle></DialogHeader>
              <SubjectForm onSubmit={(s) => { addSubject(s); setOpen(false); }} />
            </DialogContent>
          </Dialog>
        </div>

        {subjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No subjects yet. Add your first subject to get started.
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Lec/wk</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Prac/wk</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Lec Dur</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Prac Dur</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Special</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subjects.map((s) => (
                  <tr key={s.id} className="bg-card hover:bg-muted/30 transition">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 capitalize">{s.type}</td>
                    <td className="px-4 py-3 text-center">{s.lecturesPerWeek}</td>
                    <td className="px-4 py-3 text-center">{s.practicalHoursPerWeek}</td>
                    <td className="px-4 py-3 text-center">{s.lectureDuration}hr</td>
                    <td className="px-4 py-3 text-center">{s.practicalDuration}hr</td>
                    <td className="px-4 py-3 text-center">
                      {s.isSpecial ? <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">{s.specialType?.replace('_', ' ')}</span> : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon" onClick={() => removeSubject(s.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
