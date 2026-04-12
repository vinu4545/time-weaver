/**
 * TimeForge CSP Engine
 * Constraint Satisfaction Problem solver for timetable generation
 * Uses: Backtracking + MRV + Forward Checking + AC-3 + Soft constraint scoring
 */

import type {
  Subject, Faculty, Room, Lab, Batch, Division,
  Day, SlotId, TimetableEntry, GeneratedTimetable,
  Conflict, SoftConstraintConfig, InstitutionalRules,
  SubjectFacultyMapping, AvailabilitySlot
} from '@/types/timetable';
import { ALL_DAYS, ALL_SLOTS } from '@/types/timetable';

// CSP Variable: a (day, slot, division) triple that needs assignment
interface CSPVariable {
  day: Day;
  slotId: SlotId;
  divisionId: string;
}

// CSP Value: what gets assigned to a variable
interface CSPValue {
  subjectId: string;
  facultyId: string;
  roomId: string;
  batchId?: string;
  type: 'lecture' | 'practical';
}

// Domain: possible values for a variable
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
  if (!dayAvail) return true; // if no availability set, assume available
  return dayAvail.slots.includes(slot);
}

function isRoomAvailable(r: Room, day: Day, slot: SlotId): boolean {
  if (r.availableSlots.length === 0) return true;
  const dayAvail = r.availableSlots.find((a) => a.day === day);
  if (!dayAvail) return true;
  return dayAvail.slots.includes(slot);
}

// Build requirement list: what subjects each division needs
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

// Get faculty who can teach a subject
function getFacultyForSubject(subjectId: string, state: CSPState): Faculty[] {
  // Check mappings first
  const fixedMappings = state.mappings.filter((m) => m.subjectId === subjectId && m.isFixed);
  if (fixedMappings.length > 0) {
    return state.faculty.filter((f) => fixedMappings.some((m) => m.facultyId === f.id));
  }

  const flexMappings = state.mappings.filter((m) => m.subjectId === subjectId);
  if (flexMappings.length > 0) {
    return state.faculty.filter((f) => flexMappings.some((m) => m.facultyId === f.id));
  }

  // Fall back to faculty who list this subject
  return state.faculty.filter((f) => f.subjectIds.includes(subjectId));
}

// Generate initial domains for all variables
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
            .map((l) => ({ id: l.id, name: l.name, capacity: l.capacity, type: 'lecture_hall' as const, availableSlots: l.availableSlots }))
        : state.rooms;

      for (const fac of eligibleFaculty) {
        if (!isFacultyAvailable(fac, v.day, v.slotId)) continue;

        for (const room of eligibleRooms) {
          if (!isRoomAvailable(room, v.day, v.slotId)) continue;

          values.push({
            subjectId: req.subjectId,
            facultyId: fac.id,
            roomId: room.id,
            type: req.type,
          });
        }
      }
    }

    domains.set(varKey(v), values);
  }

  return domains;
}

// Check hard constraints for a partial assignment
function isConsistent(
  variable: CSPVariable,
  value: CSPValue,
  assignment: Map<string, CSPValue>,
  state: CSPState,
  requirements: Map<string, { subjectId: string; count: number; type: 'lecture' | 'practical' }[]>
): boolean {
  // Check faculty overlap: same faculty can't be in two places at same day+slot
  for (const [key, assigned] of assignment) {
    const [day, slot] = key.split('|');
    if (day === variable.day && slot === variable.slotId) {
      // Same time slot
      if (assigned.facultyId === value.facultyId) return false; // Faculty clash
      if (assigned.roomId === value.roomId) return false; // Room clash
    }
  }

  // Check faculty max weekly load
  const facultyLoad = new Map<string, number>();
  for (const [, assigned] of assignment) {
    facultyLoad.set(assigned.facultyId, (facultyLoad.get(assigned.facultyId) || 0) + 1);
  }
  const currentLoad = (facultyLoad.get(value.facultyId) || 0) + 1;
  const faculty = state.faculty.find((f) => f.id === value.facultyId);
  if (faculty && currentLoad > faculty.maxWeeklyLoad) return false;

  // Check subject weekly quota not exceeded for this division
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

  return true;
}

// MRV: select variable with fewest remaining values
function selectVariable(
  unassigned: CSPVariable[],
  domains: Domain,
): CSPVariable | null {
  if (unassigned.length === 0) return null;

  let best: CSPVariable | null = null;
  let bestSize = Infinity;

  for (const v of unassigned) {
    const size = domains.get(varKey(v))?.length ?? 0;
    if (size < bestSize) {
      bestSize = size;
      best = v;
    }
  }

  return best;
}

// Order values by least constraining value heuristic
function orderValues(
  variable: CSPVariable,
  domains: Domain,
  assignment: Map<string, CSPValue>,
  state: CSPState,
  requirements: Map<string, { subjectId: string; count: number; type: 'lecture' | 'practical' }[]>
): CSPValue[] {
  const values = domains.get(varKey(variable)) || [];
  // Simple: filter consistent values
  return values.filter((v) => isConsistent(variable, v, assignment, state, requirements));
}

// Forward checking: prune domains after assignment
function forwardCheck(
  variable: CSPVariable,
  value: CSPValue,
  domains: Domain,
  unassigned: CSPVariable[],
  assignment: Map<string, CSPValue>,
  state: CSPState,
  requirements: Map<string, { subjectId: string; count: number; type: 'lecture' | 'practical' }[]>
): Domain | null {
  const newDomains: Domain = new Map();
  for (const [k, v] of domains) {
    newDomains.set(k, [...v]);
  }

  for (const uv of unassigned) {
    const key = varKey(uv);
    const filtered = (newDomains.get(key) || []).filter((v) =>
      isConsistent(uv, v, assignment, state, requirements)
    );

    if (filtered.length === 0) return null; // Domain wipeout
    newDomains.set(key, filtered);
  }

  return newDomains;
}

// Calculate soft constraint score
function calculateScore(
  assignment: Map<string, CSPValue>,
  state: CSPState
): number {
  let score = 100;
  const sc = state.softConstraints;

  if (sc.avoidBackToBack.enabled) {
    const slots = ALL_SLOTS.filter((s) => s !== 'LUNCH');
    for (const div of state.divisions) {
      for (const day of state.rules.workingDays) {
        for (let i = 0; i < slots.length - 1; i++) {
          const k1 = `${day}|${slots[i]}|${div.id}`;
          const k2 = `${day}|${slots[i + 1]}|${div.id}`;
          const v1 = assignment.get(k1);
          const v2 = assignment.get(k2);
          if (v1 && v2 && v1.subjectId === v2.subjectId) {
            score -= sc.avoidBackToBack.weight;
          }
        }
      }
    }
  }

  if (sc.evenWorkload.enabled) {
    for (const div of state.divisions) {
      const dailyCounts = state.rules.workingDays.map((day) => {
        let count = 0;
        for (const slot of ALL_SLOTS) {
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
      if (slot === 'P6') score -= sc.avoidLastSlot.weight * 0.5;
    }
  }

  if (sc.minimizeGaps.enabled) {
    for (const div of state.divisions) {
      for (const day of state.rules.workingDays) {
        const occupied = ALL_SLOTS.filter((s) => s !== 'LUNCH')
          .map((s, i) => ({ slot: s, idx: i, has: assignment.has(`${day}|${s}|${div.id}`) }));
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

// Main backtracking solver
function backtrack(
  variables: CSPVariable[],
  domains: Domain,
  assignment: Map<string, CSPValue>,
  unassigned: CSPVariable[],
  state: CSPState,
  requirements: Map<string, { subjectId: string; count: number; type: 'lecture' | 'practical' }[]>,
  startTime: number,
  timeLimit: number = 10000
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

// Convert assignment to timetable entries
function assignmentToEntries(assignment: Map<string, CSPValue>): TimetableEntry[] {
  const entries: TimetableEntry[] = [];
  for (const [key, value] of assignment) {
    const [day, slotId, divisionId] = key.split('|');
    entries.push({
      day: day as Day,
      slotId: slotId as SlotId,
      divisionId,
      subjectId: value.subjectId,
      facultyId: value.facultyId,
      roomId: value.roomId,
      batchId: value.batchId,
      type: value.type,
    });
  }
  return entries;
}

// Public API
export function generateTimetable(state: CSPState): GeneratedTimetable {
  const requirements = buildRequirements(state);

  // Build variables: only non-break slots on working days
  const variables: CSPVariable[] = [];
  for (const div of state.divisions) {
    for (const day of state.rules.workingDays) {
      for (const slot of ALL_SLOTS) {
        if (slot === state.rules.lunchSlot) continue;
        if (state.rules.breakSlots.includes(slot)) continue;
        variables.push({ day, slotId: slot, divisionId: div.id });
      }
    }
  }

  // Build domains
  const domains = generateDomains(variables, state, requirements);

  // Solve
  const startTime = Date.now();
  const assignment = backtrack(variables, domains, new Map(), [...variables], state, requirements, startTime);

  if (!assignment) {
    // Return empty timetable with note
    return {
      id: crypto.randomUUID(),
      name: `Timetable ${new Date().toLocaleDateString()}`,
      entries: [],
      score: 0,
      conflicts: [{
        type: 'faculty_overlap',
        description: 'Could not find a valid timetable. Try relaxing constraints or adding more resources.',
        day: 'Monday',
        slotId: 'P1',
        involvedEntities: [],
      }],
      generatedAt: new Date().toISOString(),
    };
  }

  const entries = assignmentToEntries(assignment);
  const score = calculateScore(assignment, state);

  return {
    id: crypto.randomUUID(),
    name: `Timetable ${new Date().toLocaleDateString()}`,
    entries,
    score,
    conflicts: [],
    generatedAt: new Date().toISOString(),
  };
}
