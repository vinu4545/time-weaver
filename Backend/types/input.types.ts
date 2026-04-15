import type { Subject, Faculty, Room, Batch, Division, InstitutionalRules, SoftConstraintConfig } from "./timetable.types";

export interface TimetableInput {
  subjects: Subject[];
  faculty: Faculty[];
  rooms: Room[];
  labs: any[];
  batches: Batch[];
  divisions: Division[];
  rules: InstitutionalRules;
  softConstraints: SoftConstraintConfig;
}

export interface NormalizedInput {
  subjects: Subject[];
  faculty: Faculty[];
  rooms: Room[];
  labs: any[];
  batches: Batch[];
  divisions: Division[];
  rules: InstitutionalRules;
  softConstraints: SoftConstraintConfig;
}

export interface SubjectInput {
  name: string;
  type: "lecture" | "practical" | "both";
  lecturesPerWeek: number;
  practicalHoursPerWeek: number;
  lectureDuration: number;
  practicalDuration: number;
  requiresLab: boolean;
  isSpecial?: boolean;
  specialType?: "tg" | "library" | "language_lab";
}

export interface FacultyInput {
  name: string;
  type: "assistant" | "associate";
  maxWeeklyLoad: number;
  subjectIds: string[];
  availability: AvailabilityInput[];
}

export interface AvailabilityInput {
  day: string;
  slots: string[];
}

export interface RoomInput {
  name: string;
  capacity: number;
  type: "lecture_hall" | "smart_room" | "lab";
}

export interface BatchInput {
  name: string;
  strength: number;
  labGroupId: string;
}

export interface DivisionInput {
  name: string;
  totalStudents: number;
  batchIds: string[];
}
