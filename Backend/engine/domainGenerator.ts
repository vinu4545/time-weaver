import type { Domain, CSPVariable } from "../types/csp.types";
import type { Subject, Slot, SubjectFacultyMapping } from "../types/timetable.types";

export class DomainGenerator {
  private practicalContinuousPairs: [string, string][] = [
    ["P1", "P2"],
    ["P3", "P4"],
    ["P5", "P6"],
    ["P6", "P7"],
    ["P7", "P8"],
  ];

  public generateDomains(
    subjects: Subject[],
    slots: Slot[],
    mappings: SubjectFacultyMapping[]
  ): Map<CSPVariable, Domain> {
    const domains = new Map<CSPVariable, Domain>();

    for (const subject of subjects) {
      for (const slot of slots) {
        const requiredType = this.getAssignmentType(subject);

        // Practical sessions are forced to start only at valid 2-hour continuous starts.
        if (requiredType === "practical" && !this.isValidPracticalStart(slot.id)) {
          continue;
        }

        const variable: CSPVariable = {
          day: slot.day,
          slotId: slot.id,
          divisionId: subject.divisionId,
          subjectId: subject.id,
        };

        const facultyIds = mappings
          .filter(m => m.subjectId === subject.id)
          .filter(m => !m.divisionId || m.divisionId === subject.divisionId)
          .filter(m => !m.allocationType || m.allocationType === "both" || m.allocationType === requiredType)
          .map(m => m.facultyId);

        const effectiveDuration = requiredType === "practical" ? 2 : 1;

        const domainValues = facultyIds.flatMap(facultyId => {
          return slot.rooms.map(roomId => ({
            facultyId,
            roomId,
            batchId: subject.batchId,
            type: requiredType,
            duration: effectiveDuration,
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

  private getAssignmentType(subject: any): "lecture" | "practical" {
    if (subject.batchId) return "practical";
    return subject.type === "practical" ? "practical" : "lecture";
  }

  private isValidPracticalStart(slotId: string): boolean {
    return this.practicalContinuousPairs.some(([start]) => start === slotId);
  }
}
