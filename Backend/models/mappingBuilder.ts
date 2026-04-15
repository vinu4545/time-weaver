import type { NormalizedInput } from "../types/input.types";
import type { SubjectFacultyMapping } from "../types/timetable.types";

export class MappingBuilder {
  public build(input: NormalizedInput): SubjectFacultyMapping[] {
    const mappings: SubjectFacultyMapping[] = [];

    for (const subject of input.subjects) {
      const eligibleFaculty = input.faculty.filter(f =>
        f.subjectIds?.includes(subject.id)
      );

      for (const faculty of eligibleFaculty) {
        mappings.push({
          subjectId: subject.id,
          facultyId: faculty.id,
          isFixed: false,
        });
      }

      if (eligibleFaculty.length === 0) {
        for (const faculty of input.faculty) {
          mappings.push({
            subjectId: subject.id,
            facultyId: faculty.id,
            isFixed: false,
          });
        }
      }
    }

    return mappings;
  }

  public getFacultyForSubject(
    mappings: SubjectFacultyMapping[],
    subjectId: string
  ): string[] {
    return mappings
      .filter(m => m.subjectId === subjectId)
      .map(m => m.facultyId);
  }

  public getSubjectsForFaculty(
    mappings: SubjectFacultyMapping[],
    facultyId: string
  ): string[] {
    return mappings
      .filter(m => m.facultyId === facultyId)
      .map(m => m.subjectId);
  }
}
