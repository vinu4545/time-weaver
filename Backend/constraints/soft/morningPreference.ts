import type { Assignment } from "../../types/csp.types";
import type { SoftConstraintResult } from "../../types/csp.types";

export class MorningPreference implements SoftConstraintResult {
  public readonly name = "Prefer Morning for Heavy Subjects";
  public readonly weight: number;
  private morningSlots = ["P1", "P2", "P3", "P4"];

  constructor(weight: number = 2) {
    this.weight = weight;
  }

  public evaluate(assignments: Assignment[]): number {
    let penalty = 0;
    const heavySubjects = this.identifyHeavySubjects(assignments);

    for (const assignment of assignments) {
      if (heavySubjects.has(assignment.subjectId)) {
        if (!this.morningSlots.includes(assignment.slotId)) {
          penalty += 5;
        }
      }
    }

    return penalty * this.weight;
  }

  private identifyHeavySubjects(assignments: Assignment[]): Set<string> {
    const subjectCount: Map<string, number> = new Map();

    for (const assignment of assignments) {
      const count = subjectCount.get(assignment.subjectId) || 0;
      subjectCount.set(assignment.subjectId, count + 1);
    }

    const heavySubjects = new Set<string>();
    const avgCount = Array.from(subjectCount.values()).reduce((a, b) => a + b, 0) / subjectCount.size;

    for (const [subjectId, count] of subjectCount) {
      if (count > avgCount) {
        heavySubjects.add(subjectId);
      }
    }

    return heavySubjects;
  }
}
