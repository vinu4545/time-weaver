import type { Domain, CSPVariable } from "../types/csp.types";
import type { Subject, Slot, SubjectFacultyMapping } from "../types/timetable.types";

export class DomainGenerator {
  public generateDomains(
    subjects: Subject[],
    slots: Slot[],
    mappings: SubjectFacultyMapping[]
  ): Map<CSPVariable, Domain> {
    const domains = new Map<CSPVariable, Domain>();

    for (const subject of subjects) {
      for (const slot of slots) {
        const variable: CSPVariable = {
          day: slot.day,
          slotId: slot.id,
          divisionId: subject.divisionId,
          subjectId: subject.id,
        };

        const facultyIds = mappings
          .filter(m => m.subjectId === subject.id)
          .map(m => m.facultyId);

        const domainValues = facultyIds.flatMap(facultyId => {
          return slot.rooms.map(roomId => ({
            facultyId,
            roomId,
            batchId: subject.batchId,
            type: subject.type,
          }));
        });

        domains.set(this.variableToKey(variable), {
          values: domainValues,
          domainId: `${subject.id}-${slot.id}`,
        });
      }
    }

    return domains;
  }

  public regenerateDomains(
    domains: Map<CSPVariable, Domain>,
    subjects: Subject[],
    slots: Slot[]
  ): void {
    domains.forEach((domain, key) => {
      const shuffled = [...domain.values].sort(() => Math.random() - 0.5);
      domain.values = shuffled;
    });
  }

  public filterDomains(
    domains: Map<CSPVariable, Domain>,
    variable: CSPVariable,
    validValues: any[]
  ): Map<CSPVariable, Domain> {
    const key = this.variableToKey(variable);
    const domain = domains.get(key);

    if (!domain) return domains;

    const filtered = domain.values.filter(v => validValues.includes(v));
    domains.set(key, { values: filtered, domainId: domain.domainId });

    return domains;
  }

  private variableToKey(variable: CSPVariable): string {
    return `${variable.day}|${variable.slotId}|${variable.divisionId}|${variable.subjectId}`;
  }
}
