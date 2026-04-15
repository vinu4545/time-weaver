import type { TimetableInput, NormalizedInput } from "../types/input.types";

export class InputNormalizer {
  public normalize(input: TimetableInput): NormalizedInput {
    return {
      subjects: this.normalizeSubjects(input.subjects),
      faculty: this.normalizeFaculty(input.faculty),
      rooms: this.normalizeRooms(input.rooms),
      labs: this.normalizeLabs(input.labs),
      batches: this.normalizeBatches(input.batches),
      divisions: this.normalizeDivisions(input.divisions),
      rules: input.rules,
      softConstraints: input.softConstraints,
    };
  }

  private normalizeSubjects(subjects: any[]): any[] {
    return subjects.map(s => ({
      ...s,
      lectureDuration: s.lectureDuration || 1,
      practicalDuration: s.practicalDuration || 1,
      lecturesPerWeek: s.lecturesPerWeek || 0,
      practicalHoursPerWeek: s.practicalHoursPerWeek || 0,
    }));
  }

  private normalizeFaculty(faculty: any[]): any[] {
    return faculty.map(f => ({
      ...f,
      maxWeeklyLoad: f.maxWeeklyLoad || 18,
      availability: f.availability || [],
    }));
  }

  private normalizeRooms(rooms: any[]): any[] {
    return rooms.map(r => ({
      ...r,
      capacity: r.capacity || 60,
      type: r.type || "lecture_hall",
    }));
  }

  private normalizeLabs(labs: any[]): any[] {
    return labs.map(l => ({
      ...l,
      capacity: l.capacity || 30,
      maxBatchesAtOnce: l.maxBatchesAtOnce || 1,
    }));
  }

  private normalizeBatches(batches: any[]): any[] {
    return batches.map(b => ({
      ...b,
      strength: b.strength || 30,
      labGroupId: b.labGroupId || "",
    }));
  }

  private normalizeDivisions(divisions: any[]): any[] {
    return divisions.map(d => ({
      ...d,
      totalStudents: d.totalStudents || 120,
      batchIds: d.batchIds || [],
    }));
  }
}
