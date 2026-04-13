import { DashboardLayout } from "@/components/DashboardLayout";
import { useTimetableStore } from "@/stores/timetableStore";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import type { SoftConstraintConfig } from "@/types/timetable";

const constraintLabels: Record<keyof SoftConstraintConfig, { label: string; desc: string }> = {
  avoidBackToBack: { label: "Avoid Back-to-Back Same Subject", desc: "Prevent consecutive periods of the same subject" },
  preferMorningHeavy: { label: "Prefer Morning for Heavy Subjects", desc: "Schedule demanding subjects in morning slots" },
  evenWorkload: { label: "Even Workload Distribution", desc: "Balance classes evenly across the week" },
  avoidLastSlot: { label: "Avoid Last Slot Overload", desc: "Minimize scheduling in P7/P8 periods" },
  facultyPreference: { label: "Faculty Preference Satisfaction", desc: "Respect faculty time preferences" },
  minimizeGaps: { label: "Minimize Timetable Gaps", desc: "Reduce free periods between classes" },
  balancePracticals: { label: "Balance Practicals Across Week", desc: "Spread practical sessions evenly" },
  oneLecturePerSubjectPerDay: { label: "One Lecture Per Subject Per Day", desc: "Avoid repeating the same subject twice in one day" },
};

export default function ConstraintsPage() {
  const { softConstraints, updateSoftConstraints, rules, updateRules } = useTimetableStore();

  const toggle = (key: keyof SoftConstraintConfig) => {
    updateSoftConstraints({
      [key]: { ...softConstraints[key], enabled: !softConstraints[key].enabled },
    });
  };

  const setWeight = (key: keyof SoftConstraintConfig, weight: number) => {
    updateSoftConstraints({
      [key]: { ...softConstraints[key], weight },
    });
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl">
        <h1 className="text-2xl font-bold mb-1">Constraint Settings</h1>
        <p className="text-muted-foreground text-sm mb-6">Configure soft constraints and their optimization weights</p>

        {/* Hard constraint toggle */}
        <div className="rounded-xl border border-border bg-card p-4 mb-4">
          <div className="flex items-center gap-4">
            <Switch checked={rules.oneLecturePerSubjectPerDay} onCheckedChange={(v) => updateRules({ oneLecturePerSubjectPerDay: v })} />
            <div>
              <p className="font-medium text-sm">One Lecture Per Subject Per Day (Hard Constraint)</p>
              <p className="text-xs text-muted-foreground">Strictly enforce only one lecture of each subject per day</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-1">
          <div className="px-4 py-3 bg-muted/50 rounded-t-lg">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Soft Constraints (optimization scoring) — Hard constraints always enforced
            </p>
          </div>

          <div className="divide-y divide-border">
            {(Object.keys(constraintLabels) as (keyof SoftConstraintConfig)[]).map((key) => (
              <div key={key} className="px-4 py-4 flex items-center gap-4">
                <Switch checked={softConstraints[key].enabled} onCheckedChange={() => toggle(key)} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{constraintLabels[key].label}</p>
                  <p className="text-xs text-muted-foreground">{constraintLabels[key].desc}</p>
                </div>
                <div className="w-32 flex items-center gap-2">
                  <Slider
                    value={[softConstraints[key].weight]}
                    onValueChange={([v]) => setWeight(key, v)}
                    min={1} max={10} step={1}
                    disabled={!softConstraints[key].enabled}
                  />
                  <span className="text-xs font-mono w-4 text-right">{softConstraints[key].weight}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
