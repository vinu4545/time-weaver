import type { CSPVariable } from "../../types/csp.types";

export class BatchConstraint implements CSPConstraint {
  private batchSchedule: Map<string, Map<string, boolean>> = new Map();
  private nextSlotMap: Record<string, string | undefined> = {
    P1: "P2",
    P3: "P4",
    P5: "P6",
    P6: "P7",
    P7: "P8",
  };

  public isSatisfied(variable: CSPVariable, value: any): boolean {
    const batchId = value.batchId;

    if (!batchId) {
      return true;
    }

    const slotKey = `${variable.day}|${variable.slotId}`;

    if (!this.batchSchedule.has(batchId)) {
      this.batchSchedule.set(batchId, new Map());
    }

    const schedule = this.batchSchedule.get(batchId)!;

    if (schedule.get(slotKey)) {
      return false;
    }

    const isTwoHourPractical = value.type === "practical" && (value.duration || 1) >= 2;
    if (isTwoHourPractical) {
      const nextSlotId = this.nextSlotMap[variable.slotId];
      if (!nextSlotId) return false;
      const nextSlotKey = `${variable.day}|${nextSlotId}`;
      if (schedule.get(nextSlotKey)) {
        return false;
      }
      schedule.set(nextSlotKey, true);
    }

    schedule.set(slotKey, true);
    return true;
  }

  public affects(v1: CSPVariable, v2: CSPVariable): boolean {
    return v1.day === v2.day && v1.slotId === v2.slotId && v1.divisionId === v2.divisionId;
  }

  public isCompatible(v1: CSPVariable, val1: any, v2: CSPVariable, val2: any): boolean {
    if (v1.day !== v2.day || v1.slotId !== v2.slotId) {
      return true;
    }

    if (val1.batchId && val2.batchId && val1.batchId === val2.batchId) {
      return false;
    }

    return true;
  }

  public reset(): void {
    this.batchSchedule.clear();
  }
}
