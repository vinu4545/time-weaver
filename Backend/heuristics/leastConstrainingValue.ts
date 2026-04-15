import type { CSPVariable, Domain } from "../types/csp.types";
import type { CSPConstraint } from "../types/csp.types";

export class LeastConstrainingValue {
  public sortValues(
    variable: CSPVariable,
    domain: Domain,
    constraints: CSPConstraint[],
    allDomains: Map<string, Domain>
  ): any[] {
    const values = [...domain.values];

    values.sort((a, b) => {
      const constraintsA = this.countConstraints(a, constraints, allDomains);
      const constraintsB = this.countConstraints(b, constraints, allDomains);
      return constraintsA - constraintsB;
    });

    return values;
  }

  private countConstraints(
    value: any,
    constraints: CSPConstraint[],
    domains: Map<string, Domain>
  ): number {
    let count = 0;

    domains.forEach((domain, key) => {
      for (const otherValue of domain.values) {
        for (const constraint of constraints) {
          if (!constraint.isCompatible(value, otherValue)) {
            count++;
          }
        }
      }
    });

    return count;
  }
}
