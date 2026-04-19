export type SubjectType = "lecture" | "practical" | "both";
export type RoomType = "lecture_hall" | "smart_room" | "lab";
export type FacultyType = "assistant" | "associate";
export type FacultyAllocationType = "lecture" | "practical" | "both";
export type Day = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
export type SlotId = "P1" | "P2" | "BREAK1" | "P3" | "P4" | "LUNCH" | "P5" | "P6" | "P7" | "P8";

export interface Subject {
  id: string;
  name: string;
  type: SubjectType;
  lecturesPerWeek: number;
  practicalHoursPerWeek: number;
  lectureDuration: 1 | 2 | 3;
  practicalDuration: 1 | 2 | 3;
  requiresLab: boolean;
  isSpecial?: boolean;
  specialType?: "tg" | "library" | "language_lab";
}

export interface SubjectExpanded extends Subject {
  divisionId: string;
  batchId?: string;
  requiredSlots: number;
}

export interface AvailabilitySlot {
  day: Day;
  slots: SlotId[];
}

export interface Faculty {
  id: string;
  name: string;
  type: FacultyType;
  subjectIds: string[];
  subjectCapabilities?: FacultySubjectCapability[];
  maxWeeklyLoad: number;
  availability: AvailabilitySlot[];
}

export interface FacultySubjectCapability {
  subjectId: string;
  allocationType: FacultyAllocationType;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: RoomType;
  availableSlots: AvailabilitySlot[];
}

export interface Lab {
  id: string;
  name: string;
  capacity: number;
  supportedSubjectIds: string[];
  availableSlots: AvailabilitySlot[];
  maxBatchesAtOnce: number;
}

export interface Batch {
  id: string;
  name: string;
  strength: number;
  labGroupId: string;
}

export interface Division {
  id: string;
  name: string;
  totalStudents: number;
  batchIds: string[];
  facultyAllocations?: DivisionFacultyAllocation[];
}

export interface DivisionFacultyAllocation {
  facultyId: string;
  allocationType: FacultyAllocationType;
}

export interface Slot {
  id: SlotId;
  day: Day;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  rooms: string[];
}

export interface TimeSlot {
  id: SlotId;
  label: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
}

export interface InstitutionalRules {
  startTime: string;
  endTime: string;
  breakSlots: SlotId[];
  lunchSlot: SlotId;
  workingDays: Day[];
  oneLecturePerSubjectPerDay: boolean;
}

export interface SubjectFacultyMapping {
  subjectId: string;
  facultyId: string;
  divisionId?: string;
  allocationType?: FacultyAllocationType;
  isFixed: boolean;
}

export interface TimetableEntry {
  day: Day;
  slotId: SlotId;
  divisionId: string;
  subjectId: string;
  facultyId: string;
  roomId: string;
  batchId?: string;
  type: "lecture" | "practical";
}

export interface GeneratedTimetable {
  id: string;
  name: string;
  entries: TimetableEntry[];
  score: number;
  conflicts: Conflict[];
  generatedAt: string;
}

export interface Conflict {
  type: "faculty_overlap" | "room_clash" | "batch_conflict" | "capacity_exceeded" | "load_exceeded" | "unscheduled_subject";
  description: string;
  day: Day;
  slotId: SlotId;
  involvedEntities: string[];
}

export interface SoftConstraintConfig {
  avoidBackToBack: { enabled: boolean; weight: number };
  preferMorningHeavy: { enabled: boolean; weight: number };
  evenWorkload: { enabled: boolean; weight: number };
  avoidLastSlot: { enabled: boolean; weight: number };
  facultyPreference: { enabled: boolean; weight: number };
  minimizeGaps: { enabled: boolean; weight: number };
  balancePracticals: { enabled: boolean; weight: number };
  oneLecturePerSubjectPerDay: { enabled: boolean; weight: number };
}
