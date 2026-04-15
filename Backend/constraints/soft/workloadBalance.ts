import type { Assignment } from "../../types/csp.types";
import type { SoftConstraintResult } from "../../types/csp.types";

export class WorkloadBalance implements SoftConstraintResult {
  public readonly name = "Even Workload Distribution";
  public readonly weight: number;

  constructor(weight: number = 4) {
    this.weight = weight;
  }

  public evaluate(assignments: Assignment[]): number {
    const dailyLoad: Map<string, Map<string, number>> = new Map();
    let penalty = 0;

    for (const assignment of assignments) {
      if (!dailyLoad.has(assignment.day)) {
        dailyLoad.set(assignment.day, new Map());
      }
      const dayMap = dailyLoad.get(assignment.day)!;
      const count = dayMap.get(assignment.subjectId) || 0;
      dayMap.set(assignment.subjectId, count + 1);
    }

    for (const [, dayMap] of dailyLoad) {
      const loads = Array.from(dayMap.values());
      const avg = loads.reduce((a, b) => a + b, 0) / loads.length;

      for (const load of loads) {
        const deviation = Math.abs(load - avg);
        penalty += deviation * 2;
      }
    }

    return penalty * this.weight;
  }
}
