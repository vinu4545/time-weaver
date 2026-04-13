export type SubjectType = 'lecture' | 'practical' | 'both';
export type RoomType = 'lecture_hall' | 'smart_room' | 'lab';
export type FacultyType = 'assistant' | 'associate';
export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
export type SlotId = 'P1' | 'P2' | 'BREAK1' | 'P3' | 'P4' | 'LUNCH' | 'P5' | 'P6' | 'P7' | 'P8';

export interface Subject {
  id: string;
  name: string;
  type: SubjectType;
  lecturesPerWeek: number;
  practicalHoursPerWeek: number;
  duration: 1 | 2 | 3;
  requiresLab: boolean;
  isSpecial?: boolean; // TG, Library, Language Lab
  specialType?: 'tg' | 'library' | 'language_lab';
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
  maxWeeklyLoad: number;
  availability: AvailabilitySlot[];
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
  type: 'lecture' | 'practical';
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
  type: 'faculty_overlap' | 'room_clash' | 'batch_conflict' | 'capacity_exceeded' | 'load_exceeded';
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

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: 'P1', label: 'Period 1', startTime: '09:00', endTime: '10:00', isBreak: false },
  { id: 'P2', label: 'Period 2', startTime: '10:00', endTime: '11:00', isBreak: false },
  { id: 'BREAK1', label: 'Break', startTime: '11:00', endTime: '11:15', isBreak: true },
  { id: 'P3', label: 'Period 3', startTime: '11:15', endTime: '12:15', isBreak: false },
  { id: 'P4', label: 'Period 4', startTime: '12:15', endTime: '13:15', isBreak: false },
  { id: 'LUNCH', label: 'Lunch', startTime: '13:15', endTime: '14:15', isBreak: true },
  { id: 'P5', label: 'Period 5', startTime: '14:15', endTime: '15:15', isBreak: false },
  { id: 'P6', label: 'Period 6', startTime: '15:15', endTime: '16:15', isBreak: false },
  { id: 'P7', label: 'Period 7', startTime: '16:15', endTime: '17:15', isBreak: false },
  { id: 'P8', label: 'Period 8', startTime: '17:15', endTime: '18:15', isBreak: false },
];

export const ALL_DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const ALL_SLOTS: SlotId[] = ['P1', 'P2', 'BREAK1', 'P3', 'P4', 'LUNCH', 'P5', 'P6', 'P7', 'P8'];
export const TEACHING_SLOTS: SlotId[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];

// Continuous slot pairs for 2-hour labs
export const CONTINUOUS_SLOT_PAIRS: [SlotId, SlotId][] = [
  ['P1', 'P2'],
  ['P3', 'P4'],
  ['P5', 'P6'],
  ['P6', 'P7'],
  ['P7', 'P8'],
];

export const DEFAULT_SOFT_CONSTRAINTS: SoftConstraintConfig = {
  avoidBackToBack: { enabled: true, weight: 3 },
  preferMorningHeavy: { enabled: true, weight: 2 },
  evenWorkload: { enabled: true, weight: 4 },
  avoidLastSlot: { enabled: true, weight: 1 },
  facultyPreference: { enabled: true, weight: 5 },
  minimizeGaps: { enabled: true, weight: 3 },
  balancePracticals: { enabled: true, weight: 2 },
  oneLecturePerSubjectPerDay: { enabled: true, weight: 4 },
};
