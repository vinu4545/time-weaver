import type { Assignment } from "../../types/csp.types";
import type { Faculty } from "../../types/timetable.types";
import type { SoftConstraintResult } from "../../types/csp.types";

export class FacultyPreference implements SoftConstraintResult {
  public readonly name = "Faculty Preference Satisfaction";
  public readonly weight: number;
  private faculty: Faculty[];

  constructor(faculty: Faculty[], weight: number = 5) {
    this.weight = weight;
    this.faculty = faculty;
  }

  public evaluate(assignments: Assignment[]): number {
    let penalty = 0;

    for (const assignment of assignments) {
      const facultyMember = this.faculty.find(f => f.id === assignment.facultyId);
      if (!facultyMember) continue;

      const dayAvail = facultyMember.availability?.find(a => a.day === assignment.day);
      if (!dayAvail) continue;

      if (!dayAvail.slots.includes(assignment.slotId as any)) {
        penalty += 10;
      }
    }

    return penalty * this.weight;
  }
}
