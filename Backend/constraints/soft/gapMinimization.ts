import type { Assignment } from "../../types/csp.types";
import type { SoftConstraintResult } from "../../types/csp.types";

export class GapMinimization implements SoftConstraintResult {
  public readonly name = "Minimize Timetable Gaps";
  public readonly weight: number;

  constructor(weight: number = 3) {
    this.weight = weight;
  }

  public evaluate(assignments: Assignment[]): number {
    let penalty = 0;
    const daySlots: Map<string, string[]> = new Map();

    for (const assignment of assignments) {
      if (!daySlots.has(assignment.day)) {
        daySlots.set(assignment.day, []);
      }
      daySlots.get(assignment.day)!.push(assignment.slotId);
    }

    for (const [, slots] of daySlots) {
      const sortedSlots = slots.sort();
      for (let i = 0; i < sortedSlots.length - 1; i++) {
        const current = this.slotIndex(sortedSlots[i]);
        const next = this.slotIndex(sortedSlots[i + 1]);
        if (next - current > 1) {
          penalty += (next - current - 1) * 2;
        }
      }
    }

    return penalty * this.weight;
  }

  private slotIndex(slotId: string): number {
    const order = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"];
    return order.indexOf(slotId);
  }
}
