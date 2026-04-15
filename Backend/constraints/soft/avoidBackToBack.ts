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
    const subjectDaySlots: Map<string, Map<string, string[]>> = new Map();

    for (const assignment of assignments) {
      const key = `${assignment.day}|${assignment.subjectId}`;
      if (!subjectDaySlots.has(key)) {
        subjectDaySlots.set(key, new Map());
      }
      const daySlots = subjectDaySlots.get(key)!;
      if (!daySlots.has(assignment.day)) {
        daySlots.set(assignment.day, []);
      }
      daySlots.get(assignment.day)!.push(assignment.slotId);
    }

    for (const [, daySlots] of subjectDaySlots) {
      for (const [day, slots] of daySlots) {
        const sortedSlots = slots.sort();
        for (let i = 0; i < sortedSlots.length - 1; i++) {
          if (this.areConsecutive(sortedSlots[i], sortedSlots[i + 1])) {
            penalty += 10;
          }
        }
      }
    }

    return penalty * this.weight;
  }

  private areConsecutive(slot1: string, slot2: string): boolean {
    const consecutivePairs = ["P1-P2", "P2-P3", "P3-P4", "P4-P5", "P5-P6", "P6-P7", "P7-P8"];
    return consecutivePairs.includes(`${slot1}-${slot2}`);
  }
}
