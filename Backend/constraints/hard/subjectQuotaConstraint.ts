import type { CSPVariable } from "../../types/csp.types";

export class SubjectQuotaConstraint implements CSPConstraint {
  private subjectSchedule: Map<string, Map<string, number>> = new Map();
  private maxLecturesPerDay: number = 1;

  public isSatisfied(variable: CSPVariable, value: any): boolean {
    const subjectId = variable.subjectId;
    const day = variable.day;

    if (!this.subjectSchedule.has(subjectId)) {
      this.subjectSchedule.set(subjectId, new Map());
    }

    const subjectDays = this.subjectSchedule.get(subjectId)!;
    const currentCount = subjectDays.get(day) || 0;

    if (currentCount >= this.maxLecturesPerDay) {
      return false;
    }

    subjectDays.set(day, currentCount + 1);
    return true;
  }

  public affects(v1: CSPVariable, v2: CSPVariable): boolean {
    return v1.day === v2.day && v1.subjectId === v2.subjectId;
  }

  public isCompatible(v1: CSPVariable, val1: any, v2: CSPVariable, val2: any): boolean {
    if (v1.day !== v2.day || v1.subjectId !== v2.subjectId) {
      return true;
    }

    return false;
  }

  public setMaxLecturesPerDay(max: number): void {
    this.maxLecturesPerDay = max;
  }

  public reset(): void {
    this.subjectSchedule.clear();
  }
}
