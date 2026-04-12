import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useTimetableStore } from "@/stores/timetableStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import type { Room, RoomType } from "@/types/timetable";

export default function RoomsPage() {
  const { rooms, addRoom, removeRoom } = useTimetableStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(60);
  const [type, setType] = useState<RoomType>("lecture_hall");

  const handleAdd = () => {
    if (!name.trim()) return;
    addRoom({ id: crypto.randomUUID(), name: name.trim(), capacity, type, availableSlots: [] });
    setName(""); setCapacity(60); setOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Rooms</h1>
            <p className="text-muted-foreground text-sm">Manage lecture halls and smart rooms</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Add Room</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Room</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Room Name/ID</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Room 101" /></div>
                <div><Label>Capacity</Label><Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(+e.target.value)} /></div>
                <div>
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as RoomType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture_hall">Lecture Hall</SelectItem>
                      <SelectItem value="smart_room">Smart Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAdd} className="w-full bg-gradient-primary text-primary-foreground">Add Room</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {rooms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">No rooms yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-4 flex items-start justify-between">
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{r.type.replace('_', ' ')} • {r.capacity} seats</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeRoom(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
