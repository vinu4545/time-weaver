import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useTimetableStore } from "@/stores/timetableStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

export default function BatchesPage() {
  const { batches, addBatch, removeBatch } = useTimetableStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [strength, setStrength] = useState(30);
  const [labGroup, setLabGroup] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    addBatch({ id: crypto.randomUUID(), name: name.trim(), strength, labGroupId: labGroup });
    setName(""); setStrength(30); setLabGroup(""); setOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold">Batches</h1><p className="text-muted-foreground text-sm">Manage student batches</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Add Batch</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Batch</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Batch Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="A1" /></div>
                <div><Label>Strength</Label><Input type="number" min={1} value={strength} onChange={(e) => setStrength(+e.target.value)} /></div>
                <div><Label>Lab Group ID</Label><Input value={labGroup} onChange={(e) => setLabGroup(e.target.value)} placeholder="Optional" /></div>
                <Button onClick={handleAdd} className="w-full bg-gradient-primary text-primary-foreground">Add Batch</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {batches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">No batches yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((b) => (
              <div key={b.id} className="rounded-xl border border-border bg-card p-4 flex items-start justify-between">
                <div>
                  <p className="font-semibold">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.strength} students{b.labGroupId ? ` • Group: ${b.labGroupId}` : ''}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeBatch(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
