import { DashboardLayout } from "@/components/DashboardLayout";
import { useTimetableStore } from "@/stores/timetableStore";
import { BookOpen, Users, DoorOpen, FlaskConical, Building, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const { subjects, faculty, rooms, labs, divisions, generatedTimetables } = useTimetableStore();

  const stats = [
    { label: "Subjects", value: subjects.length, icon: BookOpen, color: "text-info" },
    { label: "Faculty", value: faculty.length, icon: Users, color: "text-success" },
    { label: "Rooms", value: rooms.length, icon: DoorOpen, color: "text-warning" },
    { label: "Labs", value: labs.length, icon: FlaskConical, color: "text-destructive" },
    { label: "Divisions", value: divisions.length, icon: Building, color: "text-primary" },
    { label: "Timetables", value: generatedTimetables.length, icon: BarChart3, color: "text-muted-foreground" },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground mb-6">Overview of your timetable configuration</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {subjects.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-muted/50 p-12 text-center">
            <BookOpen className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Get Started</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Start by adding subjects, faculty, rooms, and divisions using the sidebar navigation.
              Then configure constraints and generate your timetable.
            </p>
          </div>
        )}

        {generatedTimetables.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Recent Timetables</h2>
            <div className="space-y-2">
              {generatedTimetables.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.generatedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono">Score: {t.score.toFixed(1)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.conflicts.length === 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {t.conflicts.length === 0 ? 'Valid' : `${t.conflicts.length} conflicts`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
