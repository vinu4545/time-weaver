import type { Assignment } from "../../types/csp.types";
import type { SoftConstraintResult } from "../../types/csp.types";

export class AvoidLastSlot implements SoftConstraintResult {
  public readonly name = "Avoid Last Slot Overload";
  public readonly weight: number;
  private lastSlots = ["P7", "P8"];

  constructor(weight: number = 1) {
    this.weight = weight;
  }

  public evaluate(assignments: Assignment[]): number {
    let penalty = 0;

    for (const assignment of assignments) {
      if (this.lastSlots.includes(assignment.slotId)) {
        penalty += 3;
      }
    }

    return penalty * this.weight;
  }
}
