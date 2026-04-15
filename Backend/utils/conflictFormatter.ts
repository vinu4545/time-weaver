import type { Conflict } from "../types/timetable.types";

export class ConflictFormatter {
  public format(conflict: Conflict): string {
    const entityNames = conflict.involvedEntities.join(", ");
    return `${conflict.description} [${conflict.type}] on ${conflict.day} at ${conflict.slotId} involving: ${entityNames}`;
  }

  public formatList(conflicts: Conflict[]): string {
    if (conflicts.length === 0) {
      return "No conflicts found.";
    }

    return conflicts.map((c, i) => `${i + 1}. ${this.format(c)}`).join("\n");
  }

  public groupByType(conflicts: Conflict[]): Map<string, Conflict[]> {
    const grouped = new Map<string, Conflict[]>();

    for (const conflict of conflicts) {
      if (!grouped.has(conflict.type)) {
        grouped.set(conflict.type, []);
      }
      grouped.get(conflict.type)!.push(conflict);
    }

    return grouped;
  }

  public groupByDay(conflicts: Conflict[]): Map<string, Conflict[]> {
    const grouped = new Map<string, Conflict[]>();

    for (const conflict of conflicts) {
      if (!grouped.has(conflict.day)) {
        grouped.set(conflict.day, []);
      }
      grouped.get(conflict.day)!.push(conflict);
    }

    return grouped;
  }

  public getSummary(conflicts: Conflict[]): string {
    const byType = this.groupByType(conflicts);
    const lines: string[] = [];

    lines.push(`Total Conflicts: ${conflicts.length}`);
    lines.push("");

    for (const [type, typeConflicts] of byType) {
      lines.push(`  ${type}: ${typeConflicts.length}`);
    }

    return lines.join("\n");
  }
}
