import type { Assignment } from "../types/csp.types";
import type { SoftConstraint, SoftConstraintResult } from "../types/csp.types";

export class ScoreCalculator {
  private softConstraints: SoftConstraint[];

  constructor(softConstraints: SoftConstraint[]) {
    this.softConstraints = softConstraints;
  }

  public calculateScore(assignments: Assignment[]): number {
    let totalScore = 100;
    let totalPenalty = 0;

    for (const constraint of this.softConstraints) {
      const penalty = this.evaluateConstraint(constraint, assignments);
      totalPenalty += penalty;
    }

    totalScore -= totalPenalty;

    return Math.max(0, totalScore);
  }

  private evaluateConstraint(constraint: SoftConstraint, assignments: Assignment[]): number {
    let penalty = 0;

    switch (constraint.type) {
      case "avoidBackToBack":
        penalty = this.evaluateAvoidBackToBack(assignments, constraint.weight);
        break;
      case "preferMorningHeavy":
        penalty = this.evaluateMorningPreference(assignments, constraint.weight);
        break;
      case "evenWorkload":
        penalty = this.evaluateEvenWorkload(assignments, constraint.weight);
        break;
      case "avoidLastSlot":
        penalty = this.evaluateAvoidLastSlot(assignments, constraint.weight);
        break;
      case "facultyPreference":
        penalty = this.evaluateFacultyPreference(assignments, constraint.weight);
        break;
      case "minimizeGaps":
        penalty = this.evaluateGapMinimization(assignments, constraint.weight);
        break;
      case "balancePracticals":
        penalty = this.evaluatePracticalDistribution(assignments, constraint.weight);
        break;
    }

    return penalty;
  }

  private evaluateAvoidBackToBack(assignments: Assignment[], weight: number): number {
    let penalty = 0;
    const consecutivePairs = ["P1-P2", "P2-P3", "P3-P4", "P4-P5", "P5-P6", "P6-P7", "P7-P8"];

    for (const assignment of assignments) {
      const nextSlot = this.getNextSlot(assignment.slotId);
      const nextAssignment = assignments.find(
        a => a.day === assignment.day && a.subjectId === assignment.subjectId && a.slotId === nextSlot
      );
      if (nextAssignment) {
        penalty += 10;
      }
    }

    return penalty * weight;
  }

  private evaluateMorningPreference(assignments: Assignment[], weight: number): number {
    const morningSlots = ["P1", "P2", "P3", "P4"];
    let penalty = 0;

    for (const assignment of assignments) {
      if (!morningSlots.includes(assignment.slotId)) {
        penalty += 5;
      }
    }

    return penalty * weight;
  }

  private evaluateEvenWorkload(assignments: Assignment[], weight: number): number {
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

    return penalty * weight;
  }

  private evaluateAvoidLastSlot(assignments: Assignment[], weight: number): number {
    const lastSlots = ["P7", "P8"];
    let penalty = 0;

    for (const assignment of assignments) {
      if (lastSlots.includes(assignment.slotId)) {
        penalty += 3;
      }
    }

    return penalty * weight;
  }

  private evaluateFacultyPreference(assignments: Assignment[], weight: number): number {
    return 0;
  }

  private evaluateGapMinimization(assignments: Assignment[], weight: number): number {
    return 0;
  }

  private evaluatePracticalDistribution(assignments: Assignment[], weight: number): number {
    return 0;
  }

  private getNextSlot(slotId: string): string | null {
    const order = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"];
    const index = order.indexOf(slotId);
    return index >= 0 && index < order.length - 1 ? order[index + 1] : null;
  }
}
