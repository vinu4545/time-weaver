import type { CSPVariable } from "../../types/csp.types";

export class LabConstraint implements CSPConstraint {
  private labSchedule: Map<string, Map<string, string[]>> = new Map();

  public isSatisfied(variable: CSPVariable, value: any): boolean {
    return true;
  }

  public affects(v1: CSPVariable, v2: CSPVariable): boolean {
    return v1.day === v2.day && v1.slotId === v2.slotId;
  }

  public isCompatible(v1: CSPVariable, val1: any, v2: CSPVariable, val2: any): boolean {
    return true;
  }

  public validateLabCapacity(roomId: string, batchStrength: number, labCapacity: number): boolean {
    return batchStrength <= labCapacity;
  }

  public reset(): void {
    this.labSchedule.clear();
  }
}
