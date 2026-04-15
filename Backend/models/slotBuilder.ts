import type { NormalizedInput } from "../types/input.types";
import type { Slot } from "../types/timetable.types";

export class SlotBuilder {
  public buildSlots(input: NormalizedInput): Slot[] {
    const slots: Slot[] = [];
    const { rules } = input;

    const workingDays = rules.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const teachingSlots = [
      { id: "P1", start: "09:00", end: "10:00" },
      { id: "P2", start: "10:00", end: "11:00" },
      { id: "P3", start: "11:15", end: "12:15" },
      { id: "P4", start: "12:15", end: "13:15" },
      { id: "P5", start: "14:15", end: "15:15" },
      { id: "P6", start: "15:15", end: "16:15" },
      { id: "P7", start: "16:15", end: "17:15" },
      { id: "P8", start: "17:15", end: "18:15" },
    ];

    for (const day of workingDays) {
      for (const slot of teachingSlots) {
        slots.push({
          id: slot.id as any,
          day,
          startTime: slot.start,
          endTime: slot.end,
          isBreak: false,
          rooms: this.getAvailableRooms(input, day, slot.id),
        });
      }
    }

    return slots;
  }

  private getAvailableRooms(input: NormalizedInput, day: string, slotId: string): string[] {
    const rooms = input.rooms.map(r => r.id);
    return rooms;
  }

  public getContinuousSlotPairs(): [string, string][] {
    return [
      ["P1", "P2"],
      ["P3", "P4"],
      ["P5", "P6"],
      ["P6", "P7"],
      ["P7", "P8"],
    ];
  }

  public isContinuousPair(slot1: string, slot2: string): boolean {
    const pairs = this.getContinuousSlotPairs();
    return pairs.some(([a, b]) => (a === slot1 && b === slot2) || (a === slot2 && b === slot1));
  }
}
