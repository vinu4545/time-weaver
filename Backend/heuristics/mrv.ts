import type { CSPVariable, Domain } from "../types/csp.types";

export class MRV {
  public selectVariable(
    variables: CSPVariable[],
    domains: Map<string, Domain>,
    assignedVariables: Set<string>
  ): CSPVariable | null {
    let minDomain = Infinity;
    let selectedVariable: CSPVariable | null = null;

    for (const variable of variables) {
      const key = this.variableToKey(variable);

      if (assignedVariables.has(key)) {
        continue;
      }

      const domain = domains.get(key);
      if (!domain) continue;

      if (domain.values.length < minDomain) {
        minDomain = domain.values.length;
        selectedVariable = variable;
      }
    }

    return selectedVariable;
  }

  private variableToKey(variable: CSPVariable): string {
    return `${variable.day}|${variable.slotId}|${variable.divisionId}|${variable.subjectId}`;
  }
}
