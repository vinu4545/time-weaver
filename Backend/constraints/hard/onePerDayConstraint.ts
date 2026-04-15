import type { CSPVariable } from "../../types/csp.types";

export class OnePerDayConstraint implements CSPConstraint {
  private daySubjects: Map<string, Set<string>> = new Map();

  public isSatisfied(variable: CSPVariable, value: any): boolean {
    const day = variable.day;
    const subjectId = variable.subjectId;

    if (!this.daySubjects.has(day)) {
      this.daySubjects.set(day, new Set());
    }

    const subjects = this.daySubjects.get(day)!;

    if (subjects.has(subjectId)) {
      return false;
    }

    subjects.add(subjectId);
    return true;
  }

  public affects(v1: CSPVariable, v2: CSPVariable): boolean {
    return v1.day === v2.day && v1.subjectId === v2.subjectId && v1.divisionId === v2.divisionId;
  }

  public isCompatible(v1: CSPVariable, val1: any, v2: CSPVariable, val2: any): boolean {
    if (v1.day !== v2.day || v1.subjectId !== v2.subjectId || v1.divisionId !== v2.divisionId) {
      return true;
    }

    return false;
  }

  public reset(): void {
    this.daySubjects.clear();
  }
}
