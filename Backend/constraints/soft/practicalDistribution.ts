import type { Assignment } from "../../types/csp.types";
import type { SoftConstraintResult } from "../../types/csp.types";

export class PracticalDistribution implements SoftConstraintResult {
  public readonly name = "Balance Practicals Across Week";
  public readonly weight: number;

  constructor(weight: number = 2) {
    this.weight = weight;
  }

  public evaluate(assignments: Assignment[]): number {
    let penalty = 0;
    const practicalsByDay: Map<string, number> = new Map();
    const practicalsBySubject: Map<string, Map<string, number>> = new Map();

    for (const assignment of assignments) {
      if (assignment.type !== "practical") continue;

      const dayCount = practicalsByDay.get(assignment.day) || 0;
      practicalsByDay.set(assignment.day, dayCount + 1);

      if (!practicalsBySubject.has(assignment.subjectId)) {
        practicalsBySubject.set(assignment.subjectId, new Map());
      }
      const subjectDays = practicalsBySubject.get(assignment.subjectId)!;
      const count = subjectDays.get(assignment.day) || 0;
      subjectDays.set(assignment.day, count + 1);
    }

    const avgPracticalsPerDay = Array.from(practicalsByDay.values()).reduce((a, b) => a + b, 0) / 5;

    for (const [, count] of practicalsByDay) {
      const deviation = Math.abs(count - avgPracticalsPerDay);
      penalty += deviation * 3;
    }

    for (const [, subjectDays] of practicalsBySubject) {
      if (subjectDays.size < 2) {
        penalty += 5;
      }
    }

    return penalty * this.weight;
  }
}
