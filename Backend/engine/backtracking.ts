import type { CSPVariable, Domain, CSPConstraint, SoftConstraint } from "../types/csp.types";
import type { Subject, Slot, Assignment } from "../types/timetable.types";
import { ForwardChecking } from "./forwardChecking";

export interface BacktrackingOptions {
  inference?: boolean;
  inferenceDepth?: number;
}

export class Backtracking {
  private hardConstraints: CSPConstraint[];
  private softConstraints: SoftConstraint[];
  private forwardChecking: ForwardChecking;
  private options: BacktrackingOptions;

  constructor(
    hardConstraints: CSPConstraint[],
    softConstraints: SoftConstraint[],
    forwardChecking: ForwardChecking,
    options: BacktrackingOptions = {}
  ) {
    this.hardConstraints = hardConstraints;
    this.softConstraints = softConstraints;
    this.forwardChecking = forwardChecking;
    this.options = { inference: true, inferenceDepth: 1, ...options };
  }

  public search(
    subjects: Subject[],
    slots: Slot[],
    domains: Map<CSPVariable, Domain>,
    assignmentManager: AssignmentManager
  ): Assignment[] | null {
    if (assignmentManager.isComplete(subjects, slots)) {
      return assignmentManager.getAssignments();
    }

    const variable = this.selectUnassignedVariable(subjects, slots, assignmentManager, domains);
    if (!variable) return null;

    const domain = domains.get(this.variableToKey(variable));
    if (!domain) return null;

    for (const value of domain.values) {
      assignmentManager.assign(variable, value);

      if (this.isConsistent(variable, value)) {
        if (this.options.inference) {
          const domainsCopy = this.copyDomains(domains);
          const inferenceResult = this.forwardChecking.inference(
            variable,
            value,
            domainsCopy,
            this.hardConstraints
          );

          if (inferenceResult) {
            const result = this.search(subjects, slots, inferenceResult, assignmentManager);
            if (result) return result;
          }
        } else {
          const result = this.search(subjects, slots, domains, assignmentManager);
          if (result) return result;
        }
      }

      assignmentManager.unassign(variable);
    }

    return null;
  }

  private selectUnassignedVariable(
    subjects: Subject[],
    slots: Slot[],
    assignmentManager: AssignmentManager,
    domains: Map<CSPVariable, Domain>
  ): CSPVariable | null {
    let minDomain = Infinity;
    let selectedVariable: CSPVariable | null = null;

    for (const subject of subjects) {
      for (const slot of slots) {
        const variable: CSPVariable = { day: slot.day, slotId: slot.id, divisionId: subject.divisionId, subjectId: subject.id };

        if (assignmentManager.isAssigned(variable)) continue;

        const domain = domains.get(this.variableToKey(variable));
        if (!domain) continue;

        if (domain.values.length < minDomain) {
          minDomain = domain.values.length;
          selectedVariable = variable;
        }
      }
    }

    return selectedVariable;
  }

  private isConsistent(variable: CSPVariable, value: any): boolean {
    for (const constraint of this.hardConstraints) {
      if (!constraint.isSatisfied(variable, value)) {
        return false;
      }
    }
    return true;
  }

  private variableToKey(variable: CSPVariable): string {
    return `${variable.day}|${variable.slotId}|${variable.divisionId}|${variable.subjectId}`;
  }

  private copyDomains(domains: Map<CSPVariable, Domain>): Map<CSPVariable, Domain> {
    const copy = new Map<CSPVariable, Domain>();
    domains.forEach((domain, key) => {
      copy.set(key, { values: [...domain.values], domainId: domain.domainId });
    });
    return copy;
  }
}

export class AssignmentManager {
  private assignments: Map<string, any> = new Map();

  public assign(variable: CSPVariable, value: any): void {
    const key = this.variableToKey(variable);
    this.assignments.set(key, value);
  }

  public unassign(variable: CSPVariable): void {
    const key = this.variableToKey(variable);
    this.assignments.delete(key);
  }

  public isAssigned(variable: CSPVariable): boolean {
    return this.assignments.has(this.variableToKey(variable));
  }

  public getValue(variable: CSPVariable): any {
    return this.assignments.get(this.variableToKey(variable));
  }

  public isComplete(subjects: Subject[], slots: Slot[]): boolean {
    let totalVariables = 0;
    for (const _ of subjects) {
      for (const _ of slots) {
        totalVariables++;
      }
    }
    return this.assignments.size >= totalVariables;
  }

  public getAssignments(): Assignment[] {
    const result: Assignment[] = [];
    this.assignments.forEach((value, key) => {
      const [day, slotId, divisionId, subjectId] = key.split("|");
      result.push({
        day: day as any,
        slotId: slotId as any,
        divisionId,
        subjectId,
        facultyId: value.facultyId,
        roomId: value.roomId,
        batchId: value.batchId,
        type: value.type,
      });
    });
    return result;
  }

  private variableToKey(variable: CSPVariable): string {
    return `${variable.day}|${variable.slotId}|${variable.divisionId}|${variable.subjectId}`;
  }
}
