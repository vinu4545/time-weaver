import type { CSPInput, CSPOutput, Assignment } from "../types/csp.types";
import { InputNormalizer } from "../models/inputNormalizer";
import { SlotBuilder } from "../models/slotBuilder";
import { SubjectExpander } from "../models/subjectExpander";
import { MappingBuilder } from "../models/mappingBuilder";
import { ConstraintManager } from "../constraints/constraintManager";
import { Backtracking, AssignmentManager } from "./backtracking";
import { ForwardChecking } from "./forwardChecking";
import { DomainGenerator } from "./domainGenerator";
import { Logger } from "../utils/logger";
import { ScoreCalculator } from "../utils/scoreCalculator";
import type { TimetableEntry, Subject, Slot, Day, SlotId, Conflict } from "../types/timetable.types";

export interface GenerateTimetableOptions {
  subjects: Subject[];
  faculty: any[];
  rooms: any[];
  labs: any[];
  batches: any[];
  divisions: any[];
  mappings?: any[];
  rules: any;
  softConstraints: any;
}

export async function generateTimetable(options: GenerateTimetableOptions): Promise<CSPOutput> {
  const logger = new Logger("CSPEngine");
  const nextSlotMap: Record<string, string | undefined> = {
    P1: "P2",
    P3: "P4",
    P5: "P6",
    P6: "P7",
    P7: "P8",
  };
  
  try {
    const { subjects, faculty, rooms, labs, batches, divisions, mappings = [], rules, softConstraints } = options;

    logger.info("Starting CSP Timetable Generation");

    if (!subjects || subjects.length === 0) {
      logger.warn("No subjects provided");
      return {
        entries: [],
        score: 0,
        conflicts: [{ type: "faculty_overlap", description: "No subjects configured", day: "Monday", slotId: "P1", involvedEntities: [] }],
        generatedAt: new Date().toISOString(),
      };
    }

    const input: CSPInput = {
      subjects: subjects || [],
      faculty: faculty || [],
      rooms: rooms || [],
      labs: labs || [],
      batches: batches || [],
      divisions: divisions || [],
      rules: rules || {},
      softConstraints: softConstraints || [],
    };

    const normalizer = new InputNormalizer();
    const normalizedInput = normalizer.normalize(input);

    const slotBuilder = new SlotBuilder();
    const slots = slotBuilder.buildSlots(normalizedInput);

    const subjectExpander = new SubjectExpander();
    const expandedSubjects = subjectExpander.expand(normalizedInput);

    const mappingBuilder = new MappingBuilder();
    const generatedMappings = mappingBuilder.build(normalizedInput);
    const allMappings = mappings.length > 0 ? mappings : generatedMappings;

    const constraintManager = new ConstraintManager();
    const hardConstraints = constraintManager.getHardConstraints();
    const softConstraintsList = constraintManager.getSoftConstraints();

    const domainGenerator = new DomainGenerator();
    const domains = domainGenerator.generateDomains(expandedSubjects, slots, allMappings);

    const backtracking = new Backtracking(
      hardConstraints,
      softConstraintsList,
      new ForwardChecking()
    );

    const assignmentManager = new AssignmentManager();

    // Reset hard constraints before search
    hardConstraints.forEach(c => c.reset?.());

    let bestSolution: any[] = [];
    let bestScore = -1;
    const startTime = Date.now();
    const maxIterations = 5;
    let iterations = 0;

    while (iterations < maxIterations && Date.now() - startTime < 3000) {
      iterations++;

      const assignment = backtracking.search(
        expandedSubjects as any,
        slots,
        domains as any,
        assignmentManager
      );

      if (assignment && assignment.length > 0) {
        const scoreCalculator = new ScoreCalculator(softConstraintsList);
        const score = scoreCalculator.calculateScore(assignment as any);

        if (score > bestScore) {
          bestScore = score;
          bestSolution = assignment;
        }
        
        // If we found a perfect or very good solution, stop early
        if (score >= 95) break;
      }

      domainGenerator.regenerateDomains(domains, expandedSubjects, slots);
    }

    if (bestSolution && bestSolution.length > 0) {
      const scoreCalculator = new ScoreCalculator(softConstraintsList);
      const score = scoreCalculator.calculateScore(bestSolution as any);

      const entries: TimetableEntry[] = bestSolution.map(a => ({
        day: a.day as Day,
        slotId: a.slotId as SlotId,
        divisionId: a.divisionId,
        subjectId: a.subjectId,
        facultyId: a.facultyId,
        roomId: a.roomId,
        batchId: a.batchId,
        type: a.type as "lecture" | "practical",
      }));

      const expandedEntries = expandPracticalEntries(entries, nextSlotMap);

      logger.info(`Successfully generated dynamic timetable with ${expandedEntries.length} entries. Score: ${score}`);

      return {
        entries: expandedEntries,
        score,
        conflicts: [],
        generatedAt: new Date().toISOString(),
      };
    }

    logger.warn("CSP Backtracking could not find a valid solution. Falling back to simple assignment.");
    
    // Simple Fallback Logic (if CSP fails to find a solution in limited time/depth)
    const fallbackEntries: TimetableEntry[] = [];
    const usedFacultySlots = new Set<string>();
    const usedRoomSlots = new Set<string>();
    const usedBatchSlots = new Set<string>();

    for (const subject of expandedSubjects) {
      const requiredType: "lecture" | "practical" = subject.batchId ? "practical" : "lecture";
      const eligibleFacIds = allMappings
        .filter(m => m.subjectId === subject.id)
        .filter(m => !m.divisionId || m.divisionId === subject.divisionId)
        .filter(m => !m.allocationType || m.allocationType === "both" || m.allocationType === requiredType)
        .map(m => m.facultyId);
      
      let assigned = false;
      // Try multiple slots for each subject to find an open one
      const shuffledSlots = [...slots].sort(() => Math.random() - 0.5);
      
      for (const slot of shuffledSlots) {
        if (assigned) break;

        if (requiredType === "practical" && !nextSlotMap[slot.id]) {
          continue;
        }

        for (const facId of eligibleFacIds) {
          if (assigned) break;

          const facultyKey = `${slot.day}|${slot.id}|${facId}`;
          if (usedFacultySlots.has(facultyKey)) continue;

          // Check batch conflict for practicals
          if (subject.batchId) {
            const batchKey = `${slot.day}|${slot.id}|${subject.batchId}`;
            if (usedBatchSlots.has(batchKey)) continue;
          } else {
            // Check division conflict for lectures
            const divKey = `${slot.day}|${slot.id}|${subject.divisionId}`;
            if (usedBatchSlots.has(divKey)) continue;
          }

          for (const roomId of slot.rooms) {
            const roomKey = `${slot.day}|${slot.id}|${roomId}`;
            if (usedRoomSlots.has(roomKey)) continue;

            fallbackEntries.push({
              day: slot.day,
              slotId: slot.id,
              divisionId: subject.divisionId,
              subjectId: subject.id,
              facultyId: facId,
              roomId: roomId,
              batchId: subject.batchId,
              type: requiredType,
            });

            usedFacultySlots.add(facultyKey);
            usedRoomSlots.add(roomKey);
            if (subject.batchId) {
              usedBatchSlots.add(`${slot.day}|${slot.id}|${subject.batchId}`);
            } else {
              usedBatchSlots.add(`${slot.day}|${slot.id}|${subject.divisionId}`);
            }
            assigned = true;
            break;
          }
        }
      }
    }

    const expandedFallbackEntries = expandPracticalEntries(fallbackEntries, nextSlotMap);
    const fallbackResult = buildDynamicFallbackResult(
      expandedSubjects,
      fallbackEntries,
      expandedFallbackEntries,
      softConstraintsList
    );

    return {
      entries: fallbackResult.entries,
      score: fallbackResult.score,
      conflicts: fallbackResult.conflicts,
      generatedAt: new Date().toISOString(),
    };

  } catch (error: any) {
    logger.error("Error generating timetable: " + error.message);
    return {
      entries: [],
      score: 0,
      conflicts: [{ type: "faculty_overlap", description: "Error: " + error.message, day: "Monday", slotId: "P1", involvedEntities: [] }],
      generatedAt: new Date().toISOString(),
    };
  }
}

function expandPracticalEntries(
  entries: TimetableEntry[],
  nextSlotMap: Record<string, string | undefined>
): TimetableEntry[] {
  const byKey = new Map<string, TimetableEntry>();

  const keyOf = (entry: TimetableEntry) =>
    `${entry.day}|${entry.slotId}|${entry.divisionId}|${entry.subjectId}|${entry.batchId || ""}`;

  for (const entry of entries) {
    byKey.set(keyOf(entry), entry);

    if (entry.type !== "practical") continue;

    const nextSlot = nextSlotMap[entry.slotId];
    if (!nextSlot) continue;

    const secondHalf: TimetableEntry = {
      ...entry,
      slotId: nextSlot as SlotId,
    };

    byKey.set(keyOf(secondHalf), secondHalf);
  }

  return Array.from(byKey.values());
}

function buildDynamicFallbackResult(
  expandedSubjects: any[],
  fallbackBaseEntries: TimetableEntry[],
  expandedFallbackEntries: TimetableEntry[],
  softConstraintsList: any[]
): { entries: TimetableEntry[]; score: number; conflicts: Conflict[] } {
  const scheduledKeys = new Set(
    fallbackBaseEntries.map((entry) => `${entry.divisionId}|${entry.subjectId}|${entry.batchId || ""}`)
  );

  const unscheduled = expandedSubjects.filter(
    (subject) => !scheduledKeys.has(`${subject.divisionId}|${subject.id}|${subject.batchId || ""}`)
  );

  const scoreCalculator = new ScoreCalculator(softConstraintsList);
  const baseScore = fallbackBaseEntries.length > 0
    ? scoreCalculator.calculateScore(fallbackBaseEntries as any)
    : 0;

  const coverageRatio = expandedSubjects.length > 0
    ? fallbackBaseEntries.length / expandedSubjects.length
    : 0;

  const dynamicScore = Math.round(
    Math.max(0, Math.min(100, baseScore * 0.7 + coverageRatio * 100 * 0.3)) * 10
  ) / 10;

  const conflicts: Conflict[] = [];
  if (unscheduled.length > 0) {
    conflicts.push({
      type: "unscheduled_subject",
      description: `${unscheduled.length} subject allocations could not be scheduled in fallback mode`,
      day: "Monday",
      slotId: "P1",
      involvedEntities: unscheduled
        .slice(0, 10)
        .map((s) => `${s.divisionId}:${s.id}${s.batchId ? `:${s.batchId}` : ""}`),
    });
  }

  return {
    entries: expandedFallbackEntries,
    score: dynamicScore,
    conflicts,
  };
}
