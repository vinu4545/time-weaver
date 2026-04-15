import type { Assignment, Subject, Slot, Faculty, Room } from "../types/timetable.types";

export class AssignmentManager {
  private assignments: Map<string, Assignment> = new Map();
  private facultySchedule: Map<string, Set<string>> = new Map();
  private roomSchedule: Map<string, Set<string>> = new Map();
  private batchSchedule: Map<string, Set<string>> = new Map();

  public assign(variable: AssignmentVariable, value: AssignmentValue): boolean {
    const key = this.variableToKey(variable);

    if (this.isConflict(variable, value)) {
      return false;
    }

    this.assignments.set(key, {
      day: variable.day,
      slotId: variable.slotId,
      divisionId: variable.divisionId,
      subjectId: variable.subjectId,
      facultyId: value.facultyId,
      roomId: value.roomId,
      batchId: value.batchId,
      type: value.type,
    });

    this.updateSchedules(variable, value);
    return true;
  }

  public unassign(variable: AssignmentVariable): void {
    const key = this.variableToKey(variable);
    const assignment = this.assignments.get(key);

    if (assignment) {
      this.removeFromSchedules(variable, assignment);
      this.assignments.delete(key);
    }
  }

  public isAssigned(variable: AssignmentVariable): boolean {
    return this.assignments.has(this.variableToKey(variable));
  }

  public getAssignment(variable: AssignmentVariable): Assignment | undefined {
    return this.assignments.get(this.variableToKey(variable));
  }

  public getFacultyLoad(facultyId: string): number {
    return this.facultySchedule.get(facultyId)?.size || 0;
  }

  public getRoomUsage(roomId: string): number {
    return this.roomSchedule.get(roomId)?.size || 0;
  }

  public getBatchSchedule(batchId: string): Assignment[] {
    const slots = this.batchSchedule.get(batchId);
    if (!slots) return [];

    return Array.from(slots)
      .map(slotKey => {
        const [day, slotId, , subjectId] = slotKey.split("|");
        return this.assignments.get(slotKey);
      })
      .filter(Boolean) as Assignment[];
  }

  public getAllAssignments(): Assignment[] {
    return Array.from(this.assignments.values());
  }

  public clear(): void {
    this.assignments.clear();
    this.facultySchedule.clear();
    this.roomSchedule.clear();
    this.batchSchedule.clear();
  }

  private isConflict(variable: AssignmentVariable, value: AssignmentValue): boolean {
    if (this.facultySchedule.has(value.facultyId)) {
      const facultySlots = this.facultySchedule.get(value.facultyId)!;
      const slotKey = `${variable.day}|${variable.slotId}`;
      if (facultySlots.has(slotKey)) {
        return true;
      }
    }

    if (this.roomSchedule.has(value.roomId)) {
      const roomSlots = this.roomSchedule.get(value.roomId)!;
      const slotKey = `${variable.day}|${variable.slotId}`;
      if (roomSlots.has(slotKey)) {
        return true;
      }
    }

    return false;
  }

  private updateSchedules(variable: AssignmentVariable, value: AssignmentValue): void {
    const slotKey = `${variable.day}|${variable.slotId}`;

    if (!this.facultySchedule.has(value.facultyId)) {
      this.facultySchedule.set(value.facultyId, new Set());
    }
    this.facultySchedule.get(value.facultyId)!.add(slotKey);

    if (!this.roomSchedule.has(value.roomId)) {
      this.roomSchedule.set(value.roomId, new Set());
    }
    this.roomSchedule.get(value.roomId)!.add(slotKey);

    if (value.batchId) {
      if (!this.batchSchedule.has(value.batchId)) {
        this.batchSchedule.set(value.batchId, new Set());
      }
      this.batchSchedule.get(value.batchId)!.add(`${slotKey}|${variable.divisionId}|${variable.subjectId}`);
    }
  }

  private removeFromSchedules(variable: AssignmentVariable, assignment: Assignment): void {
    const slotKey = `${variable.day}|${variable.slotId}`;

    const facultySlots = this.facultySchedule.get(assignment.facultyId);
    if (facultySlots) {
      facultySlots.delete(slotKey);
    }

    const roomSlots = this.roomSchedule.get(assignment.roomId);
    if (roomSlots) {
      roomSlots.delete(slotKey);
    }

    if (assignment.batchId) {
      const batchSlots = this.batchSchedule.get(assignment.batchId);
      if (batchSlots) {
        batchSlots.delete(`${slotKey}|${variable.divisionId}|${variable.subjectId}`);
      }
    }
  }

  private variableToKey(variable: AssignmentVariable): string {
    return `${variable.day}|${variable.slotId}|${variable.divisionId}|${variable.subjectId}`;
  }
}

interface AssignmentVariable {
  day: string;
  slotId: string;
  divisionId: string;
  subjectId: string;
}

interface AssignmentValue {
  facultyId: string;
  roomId: string;
  batchId?: string;
  type: "lecture" | "practical";
}
