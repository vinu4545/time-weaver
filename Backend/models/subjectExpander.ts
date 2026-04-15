import type { NormalizedInput } from "../types/input.types";
import type { Subject, SubjectExpanded } from "../types/timetable.types";

export class SubjectExpander {
  public expand(input: NormalizedInput): SubjectExpanded[] {
    const expandedSubjects: SubjectExpanded[] = [];

    for (const division of input.divisions) {
      for (const subject of input.subjects) {
        if (subject.isSpecial) {
          expandedSubjects.push({
            ...subject,
            divisionId: division.id,
            batchId: undefined,
            requiredSlots: this.calculateRequiredSlots(subject, "lecture"),
          });
        } else {
          if (subject.lecturesPerWeek > 0) {
            expandedSubjects.push({
              ...subject,
              divisionId: division.id,
              batchId: undefined,
              requiredSlots: this.calculateRequiredSlots(subject, "lecture"),
            });
          }

          if (subject.practicalHoursPerWeek > 0) {
            const batchIds = division.batchIds || [];
            for (const batchId of batchIds) {
              expandedSubjects.push({
                ...subject,
                divisionId: division.id,
                batchId,
                requiredSlots: this.calculateRequiredSlots(subject, "practical"),
              });
            }
          }
        }
      }
    }

    return expandedSubjects;
  }

  private calculateRequiredSlots(subject: any, type: "lecture" | "practical"): number {
    if (type === "lecture") {
      const hoursPerWeek = subject.lecturesPerWeek * subject.lectureDuration;
      return Math.ceil(hoursPerWeek / subject.lectureDuration);
    } else {
      const hoursPerWeek = subject.practicalHoursPerWeek * subject.practicalDuration;
      return Math.ceil(hoursPerWeek / subject.practicalDuration);
    }
  }
}
