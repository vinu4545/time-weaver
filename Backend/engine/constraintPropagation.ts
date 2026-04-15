import type { Domain, CSPConstraint } from "../types/csp.types";
import type { Subject, Slot, SubjectFacultyMapping } from "../types/timetable.types";

export class ConstraintPropagation {
  private constraints: CSPConstraint[];
  private domains: Map<string, Domain>;

  constructor(constraints: CSPConstraint[]) {
    this.constraints = constraints;
    this.domains = new Map();
  }

  public initializeDomains(domains: Map<string, Domain>): void {
    this.domains = new Map(domains);
  }

  public ac3(): boolean {
    const queue: [string, string][] = [];

    this.domains.forEach((_, key1) => {
      this.domains.forEach((_, key2) => {
        if (key1 !== key2 && this.hasConstraint(key1, key2)) {
          queue.push([key1, key2]);
        }
      });
    });

    while (queue.length > 0) {
      const [xi, xj] = queue.shift()!;

      if (this.revise(xi, xj)) {
        const domain = this.domains.get(xi);
        if (!domain || domain.values.length === 0) {
          return false;
        }

        this.domains.forEach((_, xk) => {
          if (xk !== xi && xk !== xj && this.hasConstraint(xi, xk)) {
            queue.push([xk, xi]);
          }
        });
      }
    }

    return true;
  }

  private revise(xi: string, xj: string): boolean {
    const domainI = this.domains.get(xi);
    const domainJ = this.domains.get(xj);

    if (!domainI || !domainJ) return false;

    let revised = false;
    const remainingValues: any[] = [];

    for (const value of domainI.values) {
      if (this.hasSupport(xi, value, xj, domainJ.values)) {
        remainingValues.push(value);
      } else {
        revised = true;
      }
    }

    if (revised) {
      this.domains.set(xi, { values: remainingValues, domainId: domainI.domainId });
    }

    return revised;
  }

  private hasSupport(xi: string, value: any, xj: string, jValues: any[]): boolean {
    for (const jValue of jValues) {
      if (this.isConsistent(xi, value, xj, jValue)) {
        return true;
      }
    }
    return false;
  }

  private isConsistent(xi: string, vi: any, xj: string, vj: any): boolean {
    for (const constraint of this.constraints) {
      if (!constraint.isCompatible(xi, vi, xj, vj)) {
        return false;
      }
    }
    return true;
  }

  private hasConstraint(key1: string, key2: string): boolean {
    for (const constraint of this.constraints) {
      if (constraint.affects(key1 as any, key2 as any)) {
        return true;
      }
    }
    return false;
  }

  public getDomains(): Map<string, Domain> {
    return new Map(this.domains);
  }
}
