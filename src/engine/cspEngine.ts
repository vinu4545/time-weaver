/**
 * TimeForge CSP Engine
 * Updated for 8-slot college structure with breaks, labs, and special slots
 */

import type {
  Subject, Faculty, Room, Lab, Batch, Division,
  Day, SlotId, TimetableEntry, GeneratedTimetable,
  SoftConstraintConfig, InstitutionalRules,
  SubjectFacultyMapping,
} from '@/types/timetable';
import { ALL_DAYS, TEACHING_SLOTS, CONTINUOUS_SLOT_PAIRS } from '@/types/timetable';

interface CSPVariable {
  day: Day;
  slotId: SlotId;
  divisionId: string;
}

interface CSPValue {
  subjectId: string;
  facultyId: string;
  roomId: string;
  batchId?: string;
  type: 'lecture' | 'practical';
}

type Domain = Map<string, CSPValue[]>;

interface CSPState {
  subjects: Subject[];
  faculty: Faculty[];
  rooms: Room[];
  labs: Lab[];
  batches: Batch[];
  divisions: Division[];
  mappings: SubjectFacultyMapping[];
  rules: InstitutionalRules;
  softConstraints: SoftConstraintConfig;
}

function varKey(v: CSPVariable): string {
  return `${v.day}|${v.slotId}|${v.divisionId}`;
}

function isFacultyAvailable(f: Faculty, day: Day, slot: SlotId): boolean {
  const dayAvail = f.availability.find((a) => a.day === day);
  if (!dayAvail) return true;
  return dayAvail.slots.includes(slot);
}

function isRoomAvailable(r: Room | { availableSlots: { day: Day; slots: SlotId[] }[] }, day: Day, slot: SlotId): boolean {
  const avail = r.availableSlots;
  if (!avail || avail.length === 0) return true;
  const dayAvail = avail.find((a) => a.day === day);
  if (!dayAvail) return true;
  return dayAvail.slots.includes(slot);
}

function buildRequirements(state: CSPState): Map<string, { subjectId: string; count: number; type: 'lecture' | 'practical' }[]> {
  const reqs = new Map<string, { subjectId: string; count: number; type: 'lecture' | 'practical' }[]>();
  for (const div of state.divisions) {
    const divReqs: { subjectId: string; count: number; type: 'lecture' | 'practical' }[] = [];
    for (const subj of state.subjects) {
      if (subj.lecturesPerWeek > 0) {
        divReqs.push({ subjectId: subj.id, count: subj.lecturesPerWeek, type: 'lecture' });
      }
      if (subj.practicalHoursPerWeek > 0) {
        divReqs.push({ subjectId: subj.id, count: subj.practicalHoursPerWeek, type: 'practical' });
      }
    }
    reqs.set(div.id, divReqs);
  }
  return reqs;
}

function getFacultyForSubject(subjectId: string, state: CSPState): Faculty[] {
  const fixedMappings = state.mappings.filter((m) => m.subjectId === subjectId && m.isFixed);
  if (fixedMappings.length > 0) {
    return state.faculty.filter((f) => fixedMappings.some((m) => m.facultyId === f.id));
  }
  const flexMappings = state.mappings.filter((m) => m.subjectId === subjectId);
  if (flexMappings.length > 0) {
    return state.faculty.filter((f) => flexMappings.some((m) => m.facultyId === f.id));
  }
  return state.faculty.filter((f) => f.subjectIds.includes(subjectId));
}

function generateDomains(variables: CSPVariable[], state: CSPState, requirements: Map<string, { subjectId: string; count: number; type: 'lecture' | 'practical' }[]>): Domain {
  const domains: Domain = new Map();
  for (const v of variables) {
    const values: CSPValue[] = [];
    const divReqs = requirements.get(v.divisionId) || [];
    for (const req of divReqs) {
      const subject = state.subjects.find((s) => s.id === req.subjectId);
      if (!subject) continue;
      const eligibleFaculty = getFacultyForSubject(req.subjectId, state);
      const eligibleRooms = req.type === 'practical'
        ? state.labs.filter((l) => l.supportedSubjectIds.includes(req.subjectId))
            .map((l) => ({ id: l.id, name: l.name, capacity: l.capacity, type: 'lab' as const, availableSlots: l.availableSlots }))
        : state.rooms;
      for (const fac of eligibleFaculty) {
        if (!isFacultyAvailable(fac, v.day, v.slotId)) continue;
        for (const room of eligibleRooms) {
          if (!isRoomAvailable(room, v.day, v.slotId)) continue;
          values.push({ subjectId: req.subjectId, facultyId: fac.id, roomId: room.id, type: req.type });
        }
      }
    }
    domains.set(varKey(v), values);
  }
  return domains;
}

function isConsistent(
  variable: CSPVariable,
  value: CSPValue,
  assignment: Map<string, CSPValue>,
  state: CSPState,
  requirements: Map<string, { subjectId: string; count: number; type: 'lecture' | 'practical' }[]>
): boolean {
  // Faculty & room clash at same time
  for (const [key, assigned] of assignment) {
    const [day, slot] = key.split('|');
    if (day === variable.day && slot === variable.slotId) {
      if (assigned.facultyId === value.facultyId) return false;
      if (assigned.roomId === value.roomId) return false;
    }
  }

  // Faculty max weekly load
  let fLoad = 1;
  for (const [, assigned] of assignment) {
    if (assigned.facultyId === value.facultyId) fLoad++;
  }
  const fac = state.faculty.find((f) => f.id === value.facultyId);
  if (fac && fLoad > fac.maxWeeklyLoad) return false;

  // Subject weekly quota not exceeded
  let subjectCount = 0;
  for (const [key, assigned] of assignment) {
    const [, , divId] = key.split('|');
    if (divId === variable.divisionId && assigned.subjectId === value.subjectId && assigned.type === value.type) {
      subjectCount++;
    }
  }
  const divReqs = requirements.get(variable.divisionId) || [];
  const req = divReqs.find((r) => r.subjectId === value.subjectId && r.type === value.type);
  if (req && subjectCount >= req.count) return false;

  // One lecture per subject per day (hard constraint if enabled)
  if (state.rules.oneLecturePerSubjectPerDay && value.type === 'lecture') {
    for (const [key, assigned] of assignment) {
      const [day, , divId] = key.split('|');
      if (day === variable.day && divId === variable.divisionId && assigned.subjectId === value.subjectId && assigned.type === 'lecture') {
        return false;
      }
    }
  }

  return true;
}

function selectVariable(unassigned: CSPVariable[], domains: Domain): CSPVariable | null {
  if (unassigned.length === 0) return null;
  let best: CSPVariable | null = null;
  let bestSize = Infinity;
  for (const v of unassigned) {
    const size = domains.get(varKey(v))?.length ?? 0;
    if (size < bestSize) { bestSize = size; best = v; }
  }
  return best;
}

function orderValues(
  variable: CSPVariable, domains: Domain, assignment: Map<string, CSPValue>,
  state: CSPState, requirements: Map<string, { subjectId: string; count: number; type: 'lecture' | 'practical' }[]>
): CSPValue[] {
  const values = domains.get(varKey(variable)) || [];
  return values.filter((v) => isConsistent(variable, v, assignment, state, requirements));
}

function forwardCheck(
  variable: CSPVariable, value: CSPValue, domains: Domain, unassigned: CSPVariable[],
  assignment: Map<string, CSPValue>, state: CSPState,
  requirements: Map<string, { subjectId: string; count: number; type: 'lecture' | 'practical' }[]>
): Domain | null {
  const newDomains: Domain = new Map();
  for (const [k, v] of domains) newDomains.set(k, [...v]);
  for (const uv of unassigned) {
    const key = varKey(uv);
    const filtered = (newDomains.get(key) || []).filter((v) => isConsistent(uv, v, assignment, state, requirements));
    if (filtered.length === 0) return null;
    newDomains.set(key, filtered);
  }
  return newDomains;
}

function calculateScore(assignment: Map<string, CSPValue>, state: CSPState): number {
  let score = 100;
  const sc = state.softConstraints;

  if (sc.avoidBackToBack.enabled) {
    const slots = TEACHING_SLOTS;
    for (const div of state.divisions) {
      for (const day of state.rules.workingDays) {
        for (let i = 0; i < slots.length - 1; i++) {
          const v1 = assignment.get(`${day}|${slots[i]}|${div.id}`);
          const v2 = assignment.get(`${day}|${slots[i + 1]}|${div.id}`);
          if (v1 && v2 && v1.subjectId === v2.subjectId) score -= sc.avoidBackToBack.weight;
        }
      }
    }
  }

  if (sc.evenWorkload.enabled) {
    for (const div of state.divisions) {
      const dailyCounts = state.rules.workingDays.map((day) => {
        let count = 0;
        for (const slot of TEACHING_SLOTS) {
          if (assignment.has(`${day}|${slot}|${div.id}`)) count++;
        }
        return count;
      });
      const avg = dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length;
      const variance = dailyCounts.reduce((a, c) => a + Math.pow(c - avg, 2), 0) / dailyCounts.length;
      score -= variance * sc.evenWorkload.weight;
    }
  }

  if (sc.avoidLastSlot.enabled) {
    for (const [key] of assignment) {
      const [, slot] = key.split('|');
      if (slot === 'P8') score -= sc.avoidLastSlot.weight * 0.5;
    }
  }

  if (sc.minimizeGaps.enabled) {
    for (const div of state.divisions) {
      for (const day of state.rules.workingDays) {
        const occupied = TEACHING_SLOTS.map((s, i) => ({ slot: s, idx: i, has: assignment.has(`${day}|${s}|${div.id}`) }));
        const first = occupied.findIndex((o) => o.has);
        const last = occupied.length - 1 - [...occupied].reverse().findIndex((o) => o.has);
        if (first >= 0 && last >= 0) {
          const gaps = occupied.slice(first, last + 1).filter((o) => !o.has).length;
          score -= gaps * sc.minimizeGaps.weight;
        }
      }
    }
  }

  return Math.max(0, score);
}

function backtrack(
  variables: CSPVariable[], domains: Domain, assignment: Map<string, CSPValue>,
  unassigned: CSPVariable[], state: CSPState,
  requirements: Map<string, { subjectId: string; count: number; type: 'lecture' | 'practical' }[]>,
  startTime: number, timeLimit: number = 15000
): Map<string, CSPValue> | null {
  if (Date.now() - startTime > timeLimit) return null;
  if (unassigned.length === 0) return assignment;

  const variable = selectVariable(unassigned, domains);
  if (!variable) return null;

  const values = orderValues(variable, domains, assignment, state, requirements);
  const remaining = unassigned.filter((v) => varKey(v) !== varKey(variable));

  for (const value of values) {
    const newAssignment = new Map(assignment);
    newAssignment.set(varKey(variable), value);
    const newDomains = forwardCheck(variable, value, domains, remaining, newAssignment, state, requirements);
    if (!newDomains) continue;
    const result = backtrack(variables, newDomains, newAssignment, remaining, state, requirements, startTime, timeLimit);
    if (result) return result;
  }
  return null;
}

function assignmentToEntries(assignment: Map<string, CSPValue>): TimetableEntry[] {
  const entries: TimetableEntry[] = [];
  for (const [key, value] of assignment) {
    const [day, slotId, divisionId] = key.split('|');
    entries.push({
      day: day as Day, slotId: slotId as SlotId, divisionId,
      subjectId: value.subjectId, facultyId: value.facultyId,
      roomId: value.roomId, batchId: value.batchId, type: value.type,
    });
  }
  return entries;
}

export function generateTimetable(state: CSPState): GeneratedTimetable {
  const requirements = buildRequirements(state);
  const variables: CSPVariable[] = [];
  for (const div of state.divisions) {
    for (const day of state.rules.workingDays) {
      for (const slot of TEACHING_SLOTS) {
        variables.push({ day, slotId: slot, divisionId: div.id });
      }
    }
  }

  const domains = generateDomains(variables, state, requirements);
  const startTime = Date.now();
  const assignment = backtrack(variables, domains, new Map(), [...variables], state, requirements, startTime);

  if (!assignment) {
    return {
      id: crypto.randomUUID(),
      name: `Timetable ${new Date().toLocaleDateString()}`,
      entries: [],
      score: 0,
      conflicts: [{
        type: 'faculty_overlap',
        description: 'Could not find a valid timetable. Try relaxing constraints or adding more resources.',
        day: 'Monday', slotId: 'P1', involvedEntities: [],
      }],
      generatedAt: new Date().toISOString(),
    };
  }

  return {
    id: crypto.randomUUID(),
    name: `Timetable ${new Date().toLocaleDateString()}`,
    entries: assignmentToEntries(assignment),
    score: calculateScore(assignment, state),
    conflicts: [],
    generatedAt: new Date().toISOString(),
  };
}
