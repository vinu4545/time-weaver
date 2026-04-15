import type { CSPVariable } from "../../types/csp.types";

export class RoomConstraint implements CSPConstraint {
  private roomSchedule: Map<string, Map<string, boolean>> = new Map();

  public isSatisfied(variable: CSPVariable, value: any): boolean {
    const roomId = value.roomId;
    const slotKey = `${variable.day}|${variable.slotId}`;

    if (!this.roomSchedule.has(roomId)) {
      this.roomSchedule.set(roomId, new Map());
    }

    const schedule = this.roomSchedule.get(roomId)!;

    if (schedule.get(slotKey)) {
      return false;
    }

    schedule.set(slotKey, true);
    return true;
  }

  public affects(v1: CSPVariable, v2: CSPVariable): boolean {
    return v1.day === v2.day && v1.slotId === v2.slotId;
  }

  public isCompatible(v1: CSPVariable, val1: any, v2: CSPVariable, val2: any): boolean {
    if (v1.day !== v2.day || v1.slotId !== v2.slotId) {
      return true;
    }

    return val1.roomId !== val2.roomId;
  }

  public reset(): void {
    this.roomSchedule.clear();
  }
}
