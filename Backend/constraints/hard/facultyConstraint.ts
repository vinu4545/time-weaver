import type { CSPVariable, Domain, Assignment } from "../../types/csp.types";

export class FacultyConstraint implements CSPConstraint {
  private facultySchedule: Map<string, Map<string, boolean>> = new Map();
  private nextSlotMap: Record<string, string | undefined> = {
    P1: "P2",
    P3: "P4",
    P5: "P6",
    P6: "P7",
    P7: "P8",
  };

  public isSatisfied(variable: CSPVariable, value: any): boolean {
    const facultyId = value.facultyId;
    const slotKey = `${variable.day}|${variable.slotId}`;

    if (!this.facultySchedule.has(facultyId)) {
      this.facultySchedule.set(facultyId, new Map());
    }

    const schedule = this.facultySchedule.get(facultyId)!;

    if (schedule.get(slotKey)) {
      return false;
    }

    const isTwoHourPractical = value.type === "practical" && (value.duration || 1) >= 2;
    if (isTwoHourPractical) {
      const nextSlotId = this.nextSlotMap[variable.slotId];
      if (!nextSlotId) return false;
      const nextSlotKey = `${variable.day}|${nextSlotId}`;
      if (schedule.get(nextSlotKey)) {
        return false;
      }
      schedule.set(nextSlotKey, true);
    }

    schedule.set(slotKey, true);
    return true;
  }

  public affects(v1: CSPVariable, v2: CSPVariable): boolean {
    return v1.day === v2.day && v1.slotId === v2.slotId;
  }

  public isCompatible(v1: CSPVariable, val1: any, v2: CSPVariable, val2: any): boolean {
    if (v1.day !== v2.day || v1.slotId !== v2.slotId) {
      return true;
    }

    return val1.facultyId !== val2.facultyId;
  }

  public reset(): void {
    this.facultySchedule.clear();
  }
}
