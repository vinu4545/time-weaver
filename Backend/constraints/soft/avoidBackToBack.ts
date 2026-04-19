import type { Assignment } from "../../types/csp.types";
import type { SoftConstraintResult } from "../../types/csp.types";

export class AvoidBackToBack implements SoftConstraintResult {
  public readonly name = "Avoid Back-to-Back Same Subject";
  public readonly weight: number;

  constructor(weight: number = 3) {
    this.weight = weight;
  }

  public evaluate(assignments: Assignment[]): number {
    let penalty = 0;
    const subjectDayAssignments: Map<string, Assignment[]> = new Map();

    for (const assignment of assignments) {
      const key = `${assignment.day}|${assignment.subjectId}`;
      if (!subjectDayAssignments.has(key)) {
        subjectDayAssignments.set(key, []);
      }
      subjectDayAssignments.get(key)!.push(assignment);
    }

    for (const [, dayAssignments] of subjectDayAssignments) {
      const sorted = dayAssignments
        .slice()
        .sort((a, b) => this.slotOrder(a.slotId) - this.slotOrder(b.slotId));

      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];

        if (!this.areConsecutive(current.slotId, next.slotId)) continue;

        // Treat contiguous same practical block as intentional and do not penalize it.
        if (this.isSamePracticalBlock(current, next)) continue;

        penalty += 10;
      }
    }

    return penalty * this.weight;
  }

  private slotOrder(slotId: string): number {
    const order = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"];
    return order.indexOf(slotId);
  }

  private isSamePracticalBlock(a: Assignment, b: Assignment): boolean {
    if (a.type !== "practical" || b.type !== "practical") return false;
    return (
      a.day === b.day &&
      a.subjectId === b.subjectId &&
      a.divisionId === b.divisionId &&
      a.facultyId === b.facultyId &&
      a.roomId === b.roomId &&
      (a.batchId || "") === (b.batchId || "")
    );
  }

  private areConsecutive(slot1: string, slot2: string): boolean {
    const consecutivePairs = ["P1-P2", "P2-P3", "P3-P4", "P4-P5", "P5-P6", "P6-P7", "P7-P8"];
    return consecutivePairs.includes(`${slot1}-${slot2}`);
  }
}
