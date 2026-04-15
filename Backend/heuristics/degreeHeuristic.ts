import type { CSPVariable, CSPConstraint } from "../types/csp.types";

export class DegreeHeuristic {
  public selectVariable(
    variables: CSPVariable[],
    constraints: CSPConstraint[],
    assignedVariables: Set<string>
  ): CSPVariable | null {
    let maxDegree = -1;
    let selectedVariable: CSPVariable | null = null;

    for (const variable of variables) {
      const key = this.variableToKey(variable);

      if (assignedVariables.has(key)) {
        continue;
      }

      const degree = this.calculateDegree(variable, variables, constraints);

      if (degree > maxDegree) {
        maxDegree = degree;
        selectedVariable = variable;
      }
    }

    return selectedVariable;
  }

  private calculateDegree(
    variable: CSPVariable,
    allVariables: CSPVariable[],
    constraints: CSPConstraint[]
  ): number {
    let degree = 0;

    for (const other of allVariables) {
      if (this.variableToKey(variable) === this.variableToKey(other)) {
        continue;
      }

      for (const constraint of constraints) {
        if (constraint.affects(variable, other)) {
          degree++;
          break;
        }
      }
    }

    return degree;
  }

  private variableToKey(variable: CSPVariable): string {
    return `${variable.day}|${variable.slotId}|${variable.divisionId}|${variable.subjectId}`;
  }
}
