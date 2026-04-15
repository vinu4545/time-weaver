import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useTimetableStore } from "@/stores/timetableStore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { generateTimetable } from "../../Backend";
import { Zap, AlertCircle, CheckCircle, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GeneratePage() {
  const store = useTimetableStore();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const canGenerate = store.subjects.length > 0 && store.faculty.length > 0 && store.rooms.length > 0 && store.divisions.length > 0;

  const handleGenerate = async () => {
    setStatus('generating');
    setProgress(10);

    // Simulate progress while engine runs
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 15, 85));
    }, 200);

    // Run CSP engine (synchronous but wrapped in timeout for UI update)
    setTimeout(async () => {
      try {
        const result = await generateTimetable({
          subjects: store.subjects,
          faculty: store.faculty,
          rooms: store.rooms,
          labs: store.labs,
          batches: store.batches,
          divisions: store.divisions,
          mappings: store.mappings,
          rules: store.rules,
          softConstraints: store.softConstraints,
        });

        clearInterval(interval);
        setProgress(100);

        if (result.entries.length === 0 && result.conflicts.length > 0) {
          setStatus('error');
          setErrorMsg(result.conflicts[0].description);
        } else {
          store.addGeneratedTimetable(result);
          setStatus('success');
        }
      } catch (e: any) {
        clearInterval(interval);
        setStatus('error');
        setErrorMsg(e.message || "Unknown error");
      }
    }, 100);
  };

  const checks = [
    { label: "Subjects", ok: store.subjects.length > 0, count: store.subjects.length },
    { label: "Faculty", ok: store.faculty.length > 0, count: store.faculty.length },
    { label: "Rooms", ok: store.rooms.length > 0, count: store.rooms.length },
    { label: "Divisions", ok: store.divisions.length > 0, count: store.divisions.length },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-1 text-center">Generate Timetable</h1>
        <p className="text-muted-foreground text-sm text-center mb-8">
          Run the CSP engine to produce an optimal, conflict-free schedule
        </p>

        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <h3 className="text-sm font-medium mb-3">Readiness Check</h3>
          <div className="space-y-2">
            {checks.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-sm">
                {c.ok ? <CheckCircle className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                <span>{c.label}: {c.count} configured</span>
              </div>
            ))}
          </div>
        </div>

        {status === 'generating' && (
          <div className="rounded-xl border border-border bg-card p-6 mb-6">
            <p className="text-sm font-medium mb-3">Solving CSP...</p>
            <Progress value={progress} className="mb-2" />
            <p className="text-xs text-muted-foreground">Backtracking + MRV + Forward Checking + AC-3</p>
          </div>
        )}

        {status === 'success' && (
          <div className="rounded-xl border border-success/30 bg-success/5 p-6 mb-6 text-center">
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="font-semibold">Timetable Generated!</p>
            <p className="text-sm text-muted-foreground mb-4">Score: {store.generatedTimetables[0]?.score.toFixed(1)}</p>
            <Button
              className="w-full gap-2 bg-success hover:bg-success/90 text-white"
              onClick={() => navigate('/results')}
            >
              <Eye className="h-4 w-4" />
              View Results
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 mb-6">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="font-semibold text-center">Generation Failed</p>
            <p className="text-sm text-muted-foreground text-center mb-4">{errorMsg}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 border-destructive/20 hover:bg-destructive/10"
              onClick={() => navigate('/results')}
            >
              <Eye className="h-4 w-4" />
              View Sample Timetable
            </Button>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={!canGenerate || status === 'generating'}
          className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
          size="lg"
        >
          <Zap className="h-5 w-5 mr-2" />
          {status === 'generating' ? 'Generating...' : 'Generate Timetable'}
        </Button>

        {!canGenerate && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Add at least 1 subject, 1 faculty, 1 room, and 1 division to generate.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
