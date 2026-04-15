import type { CSPVariable } from "../../types/csp.types";

export class PracticalConstraint implements CSPConstraint {
  private practicalSchedule: Map<string, Map<string, string[]>> = new Map();
  private continuousSlotPairs: [string, string][] = [
    ["P1", "P2"],
    ["P3", "P4"],
    ["P5", "P6"],
    ["P6", "P7"],
    ["P7", "P8"],
  ];

  public isSatisfied(variable: CSPVariable, value: any): boolean {
    if (value.type !== "practical") {
      return true;
    }

    const duration = this.getDurationFromSubjectId(variable.subjectId);
    return this.validateContinuousSlots(variable.slotId, duration);
  }

  public affects(v1: CSPVariable, v2: CSPVariable): boolean {
    return v1.day === v2.day && v1.subjectId === v2.subjectId;
  }

  public isCompatible(v1: CSPVariable, val1: any, v2: CSPVariable, val2: any): boolean {
    return true;
  }

  private validateContinuousSlots(slotId: string, duration: number): boolean {
    if (duration <= 1) {
      return true;
    }

    const currentIndex = this.continuousSlotPairs.findIndex(([a, b]) => a === slotId || b === slotId);
    if (currentIndex === -1) {
      return false;
    }

    const [firstSlot, secondSlot] = this.continuousSlotPairs[currentIndex];
    return slotId === firstSlot;
  }

  private getDurationFromSubjectId(subjectId: string): number {
    return 2;
  }

  public reset(): void {
    this.practicalSchedule.clear();
  }
}
