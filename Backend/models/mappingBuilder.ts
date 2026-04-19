import type { NormalizedInput } from "../types/input.types";
import type { SubjectFacultyMapping } from "../types/timetable.types";

export class MappingBuilder {
  public build(input: NormalizedInput): SubjectFacultyMapping[] {
    const mappings: SubjectFacultyMapping[] = [];

    for (const division of input.divisions) {
      const divisionAllocations = division.facultyAllocations || [];

      for (const subject of input.subjects) {
        const eligibleFaculty = input.faculty.filter((faculty) => {
          const capability = faculty.subjectCapabilities?.find((c: any) => c.subjectId === subject.id);
          const hasSubject = !!capability || faculty.subjectIds?.includes(subject.id);
          if (!hasSubject) return false;

          // Division can explicitly scope which faculty can teach this division.
          if (divisionAllocations.length === 0) return true;

          return divisionAllocations.some((alloc: any) => alloc.facultyId === faculty.id);
        });

        for (const faculty of eligibleFaculty) {
          const capability = faculty.subjectCapabilities?.find((c: any) => c.subjectId === subject.id);
          const subjectAllocationType = capability?.allocationType || "both";

          const divisionAllocation = divisionAllocations.find((alloc: any) => alloc.facultyId === faculty.id);
          const divisionAllocationType = divisionAllocation?.allocationType || "both";

          const allocationType = this.mergeAllocationTypes(subjectAllocationType, divisionAllocationType);
          if (!allocationType) continue;

          mappings.push({
            subjectId: subject.id,
            facultyId: faculty.id,
            divisionId: division.id,
            allocationType,
            isFixed: false,
          });
        }

        if (eligibleFaculty.length === 0) {
          for (const faculty of input.faculty) {
            mappings.push({
              subjectId: subject.id,
              facultyId: faculty.id,
              divisionId: division.id,
              allocationType: "both",
              isFixed: false,
            });
          }
        }
      }
    }

    return mappings;
  }

  private mergeAllocationTypes(
    subjectAllocationType: "lecture" | "practical" | "both",
    divisionAllocationType: "lecture" | "practical" | "both"
  ): "lecture" | "practical" | "both" | null {
    if (subjectAllocationType === "both") return divisionAllocationType;
    if (divisionAllocationType === "both") return subjectAllocationType;
    if (subjectAllocationType === divisionAllocationType) return subjectAllocationType;
    return null;
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
