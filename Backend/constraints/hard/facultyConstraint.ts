import type { CSPVariable, Domain, Assignment } from "../../types/csp.types";

export class FacultyConstraint implements CSPConstraint {
  private facultySchedule: Map<string, Map<string, boolean>> = new Map();

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
