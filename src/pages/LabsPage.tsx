import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useTimetableStore } from "@/stores/timetableStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

export default function LabsPage() {
  const { labs, subjects, addLab, removeLab } = useTimetableStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(30);
  const [maxBatches, setMaxBatches] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const handleAdd = () => {
    if (!name.trim()) return;
    addLab({ id: crypto.randomUUID(), name: name.trim(), capacity, supportedSubjectIds: selectedSubjects, availableSlots: [], maxBatchesAtOnce: maxBatches });
    setName(""); setCapacity(30); setSelectedSubjects([]); setOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold">Labs</h1><p className="text-muted-foreground text-sm">Manage laboratory rooms</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Add Lab</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Lab</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Lab Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="CS Lab 1" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Capacity</Label><Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(+e.target.value)} /></div>
                  <div><Label>Max Batches</Label><Input type="number" min={1} max={5} value={maxBatches} onChange={(e) => setMaxBatches(+e.target.value)} /></div>
                </div>
                <div>
                  <Label className="mb-2 block">Supported Subjects</Label>
                  <div className="flex flex-wrap gap-2">
                    {subjects.filter((s) => s.requiresLab || s.type === 'practical' || s.type === 'both').map((s) => (
                      <label key={s.id} className="flex items-center gap-1.5 text-sm border border-border rounded-md px-2 py-1 cursor-pointer hover:bg-muted/50">
                        <Checkbox checked={selectedSubjects.includes(s.id)} onCheckedChange={(c) => setSelectedSubjects(c ? [...selectedSubjects, s.id] : selectedSubjects.filter((x) => x !== s.id))} />
                        {s.name}
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={handleAdd} className="w-full bg-gradient-primary text-primary-foreground">Add Lab</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {labs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">No labs yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {labs.map((l) => (
              <div key={l.id} className="rounded-xl border border-border bg-card p-4 flex items-start justify-between">
                <div>
                  <p className="font-semibold">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.capacity} seats • Max {l.maxBatchesAtOnce} batches</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Subjects: {l.supportedSubjectIds.map((id) => subjects.find((s) => s.id === id)?.name || id).join(", ") || "None"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeLab(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
