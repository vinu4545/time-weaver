import type { CSPVariable, Domain, CSPConstraint } from "../types/csp.types";

export class ForwardChecking {
  public inference(
    variable: CSPVariable,
    value: any,
    domains: Map<CSPVariable, Domain>,
    constraints: CSPConstraint[]
  ): Map<CSPVariable, Domain> | null {
    const reducedDomains = new Map<CSPVariable, Domain>();

    domains.forEach((domain, key) => {
      if (this.isAffected(variable, key, constraints)) {
        const filteredValues = domain.values.filter(v => this.isCompatible(variable, value, key, v, constraints));
        if (filteredValues.length === 0) {
          return null;
        }
        reducedDomains.set(key, { values: filteredValues, domainId: domain.domainId });
      } else {
        reducedDomains.set(key, domain);
      }
    });

    return reducedDomains;
  }

  private isAffected(v1: CSPVariable, v2: CSPVariable, constraints: CSPConstraint[]): boolean {
    for (const constraint of constraints) {
      if (constraint.affects(v1, v2)) {
        return true;
      }
    }
    return false;
  }

  private isCompatible(
    v1: CSPVariable,
    val1: any,
    v2: CSPVariable,
    val2: any,
    constraints: CSPConstraint[]
  ): boolean {
    for (const constraint of constraints) {
      if (!constraint.isCompatible(v1, val1, v2, val2)) {
        return false;
      }
    }
    return true;
  }

  public propagate(
    variable: CSPVariable,
    domains: Map<CSPVariable, Domain>,
    constraints: CSPConstraint[]
  ): Map<CSPVariable, Domain> | null {
    const queue: CSPVariable[] = [variable];
    const result = new Map(domains);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentDomain = result.get(this.variableToKey(current));

      if (!currentDomain || currentDomain.values.length === 0) {
        return null;
      }

      result.forEach((domain, key) => {
        if (this.isAffected(current, key, constraints)) {
          const filteredValues = domain.values.filter(v =>
            this.isCompatible(current, currentDomain.values[0], key, v, constraints)
          );

          if (filteredValues.length === 0) {
            return null;
          }

          if (filteredValues.length !== domain.values.length) {
            result.set(key, { values: filteredValues, domainId: domain.domainId });
            queue.push(key as unknown as CSPVariable);
          }
        }
      });
    }

    return result;
  }

  private variableToKey(variable: CSPVariable): string {
    return `${variable.day}|${variable.slotId}|${variable.divisionId}|${variable.subjectId}`;
  }
}
