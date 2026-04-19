import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useTimetableStore } from "@/stores/timetableStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import type { FacultyAllocationType } from "@/types/timetable";

type DivisionFacultySelection = {
  facultyId: string;
  allocationType: FacultyAllocationType;
};

export default function DivisionsPage() {
  const { divisions, batches, faculty, addDivision, removeDivision } = useTimetableStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [total, setTotal] = useState(120);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<DivisionFacultySelection[]>([]);

  const updateFacultyAllocation = (facultyId: string, checked: boolean) => {
    setSelectedFaculty((prev) => {
      if (checked) {
        if (prev.some((f) => f.facultyId === facultyId)) return prev;
        return [...prev, { facultyId, allocationType: "both" }];
      }
      return prev.filter((f) => f.facultyId !== facultyId);
    });
  };

  const setFacultyAllocationType = (facultyId: string, allocationType: FacultyAllocationType) => {
    setSelectedFaculty((prev) =>
      prev.map((f) => (f.facultyId === facultyId ? { ...f, allocationType } : f))
    );
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    addDivision({
      id: crypto.randomUUID(),
      name: name.trim(),
      totalStudents: total,
      batchIds: selectedBatches,
      facultyAllocations: selectedFaculty,
    });
    setName("");
    setTotal(120);
    setSelectedBatches([]);
    setSelectedFaculty([]);
    setOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold">Divisions</h1><p className="text-muted-foreground text-sm">Manage divisions and batch assignments</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Add Division</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Division</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Division Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Division A" /></div>
                <div><Label>Total Students</Label><Input type="number" min={1} value={total} onChange={(e) => setTotal(+e.target.value)} /></div>
                <div>
                  <Label className="mb-2 block">Batches</Label>
                  <div className="flex flex-wrap gap-2">
                    {batches.map((b) => (
                      <label key={b.id} className="flex items-center gap-1.5 text-sm border border-border rounded-md px-2 py-1 cursor-pointer hover:bg-muted/50">
                        <Checkbox checked={selectedBatches.includes(b.id)} onCheckedChange={(c) => setSelectedBatches(c ? [...selectedBatches, b.id] : selectedBatches.filter((x) => x !== b.id))} />
                        {b.name}
                      </label>
                    ))}
                    {batches.length === 0 && <span className="text-xs text-muted-foreground">Add batches first</span>}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Faculty Allocated To Division</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {faculty.map((f) => {
                      const allocation = selectedFaculty.find((x) => x.facultyId === f.id);
                      return (
                        <div key={f.id} className="border border-border rounded-md p-2">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <Checkbox
                              checked={!!allocation}
                              onCheckedChange={(c) => updateFacultyAllocation(f.id, !!c)}
                            />
                            <span>{f.name}</span>
                          </label>
                          {allocation && (
                            <div className="mt-2">
                              <Label className="text-xs text-muted-foreground">Allocation Type</Label>
                              <Select
                                value={allocation.allocationType}
                                onValueChange={(v) => setFacultyAllocationType(f.id, v as FacultyAllocationType)}
                              >
                                <SelectTrigger className="h-8 text-xs mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="lecture">Lecture</SelectItem>
                                  <SelectItem value="practical">Practical</SelectItem>
                                  <SelectItem value="both">Both</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {faculty.length === 0 && <span className="text-xs text-muted-foreground">Add faculty first</span>}
                  </div>
                </div>
                <Button onClick={handleAdd} className="w-full bg-gradient-primary text-primary-foreground">Add Division</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {divisions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">No divisions yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {divisions.map((d) => (
              <div key={d.id} className="rounded-xl border border-border bg-card p-4 flex items-start justify-between">
                <div>
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.totalStudents} students • {d.batchIds.length} batches</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Batches: {d.batchIds.map((id) => batches.find((b) => b.id === id)?.name || id).join(", ") || "None"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Faculty: {(d.facultyAllocations || [])
                      .map((x) => {
                        const facultyName = faculty.find((f) => f.id === x.facultyId)?.name || x.facultyId;
                        return `${facultyName} (${x.allocationType})`;
                      })
                      .join(", ") || "All faculty allowed"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeDivision(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
