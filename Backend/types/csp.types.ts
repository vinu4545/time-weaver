import type { Assignment, Subject, Faculty, Room, Slot, Batch, Division, TimetableEntry, Conflict } from "./timetable.types";

export interface CSPVariable {
  day: string;
  slotId: string;
  divisionId: string;
  subjectId: string;
}

export interface Domain {
  values: any[];
  domainId: string;
}

export interface CSPConstraint {
  isSatisfied(variable: CSPVariable, value: any): boolean;
  affects(v1: CSPVariable, v2: CSPVariable): boolean;
  isCompatible(v1: CSPVariable, val1: any, v2: CSPVariable, val2: any): boolean;
  reset?(): void;
}

export interface SoftConstraintResult {
  readonly name: string;
  readonly weight: number;
  evaluate(assignments: Assignment[]): number;
}

export interface SoftConstraint {
  type:
    | "avoidBackToBack"
    | "preferMorningHeavy"
    | "evenWorkload"
    | "avoidLastSlot"
    | "facultyPreference"
    | "minimizeGaps"
    | "balancePracticals"
    | "oneLecturePerSubjectPerDay";
  enabled: boolean;
  weight: number;
}

export interface Assignment {
  day: string;
  slotId: string;
  divisionId: string;
  subjectId: string;
  facultyId: string;
  roomId: string;
  batchId?: string;
  type: "lecture" | "practical";
}

export interface CSPInput {
  subjects: Subject[];
  faculty: Faculty[];
  rooms: Room[];
  labs: any[];
  batches: Batch[];
  divisions: Division[];
  rules: any;
  softConstraints: SoftConstraint[];
}

export interface CSPOutput {
  entries: TimetableEntry[];
  score: number;
  conflicts: Conflict[];
  generatedAt: string;
}
