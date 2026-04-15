import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { StaticTimetable } from "@/components/StaticTimetable";
import type { TimetableEntry, Subject, Faculty, Room } from "@/types/timetable";
import React from "react";

describe("StaticTimetable", () => {
  const mockSubjects: Subject[] = [
    { id: "sub1", name: "Mathematics", type: "lecture", lecturesPerWeek: 3, practicalHoursPerWeek: 0, lectureDuration: 1, practicalDuration: 1, requiresLab: false },
    { id: "sub2", name: "Physics", type: "practical", lecturesPerWeek: 0, practicalHoursPerWeek: 2, lectureDuration: 1, practicalDuration: 2, requiresLab: true },
  ];

  const mockFaculty: Faculty[] = [
    { id: "fac1", name: "Dr. Smith", type: "assistant", subjectIds: ["sub1"], maxWeeklyLoad: 18, availability: [] },
    { id: "fac2", name: "Prof. Jones", type: "associate", subjectIds: ["sub2"], maxWeeklyLoad: 18, availability: [] },
  ];

  const mockRooms: Room[] = [
    { id: "room1", name: "Room 101", capacity: 60, type: "lecture_hall", availableSlots: [] },
    { id: "lab1", name: "Physics Lab", capacity: 30, type: "lab", availableSlots: [] },
  ];

  const mockEntries: TimetableEntry[] = [
    { day: "Monday", slotId: "9-10", divisionId: "div1", subjectId: "sub1", facultyId: "fac1", roomId: "room1", type: "lecture" },
    { day: "Monday", slotId: "1115-1215", divisionId: "div1", subjectId: "sub2", facultyId: "fac2", roomId: "lab1", type: "practical" },
  ];

  describe("Empty State Handling", () => {
    it("should render empty cells (—) when no entries are provided", () => {
      render(
        <StaticTimetable
          entries={[]}
          subjects={[]}
          faculty={[]}
          rooms={[]}
        />
      );

      const dashElements = screen.getAllByText("—");
      expect(dashElements.length).toBeGreaterThan(0);
    });

    it("should render empty cells when faculty data is missing for an entry", () => {
      const entriesWithoutFaculty: TimetableEntry[] = [
        { day: "Monday", slotId: "9-10", divisionId: "div1", subjectId: "sub1", facultyId: "", roomId: "room1", type: "lecture" },
      ];

      render(
        <StaticTimetable
          entries={entriesWithoutFaculty}
          subjects={mockSubjects}
          faculty={[]}
          rooms={mockRooms}
        />
      );

      const dashElements = screen.getAllByText("—");
      expect(dashElements.length).toBeGreaterThan(0);
    });

    it("should render empty cells when room data is missing for an entry", () => {
      const entriesWithoutRoom: TimetableEntry[] = [
        { day: "Monday", slotId: "9-10", divisionId: "div1", subjectId: "sub1", facultyId: "fac1", roomId: "", type: "lecture" },
      ];

      render(
        <StaticTimetable
          entries={entriesWithoutRoom}
          subjects={mockSubjects}
          faculty={mockFaculty}
          rooms={[]}
        />
      );

      const dashElements = screen.getAllByText("—");
      expect(dashElements.length).toBeGreaterThan(0);
    });

    it("should render empty cell when subject is not found in subjects list", () => {
      const entriesWithUnknownSubject: TimetableEntry[] = [
        { day: "Monday", slotId: "9-10", divisionId: "div1", subjectId: "unknown-subject", facultyId: "fac1", roomId: "room1", type: "lecture" },
      ];

      render(
        <StaticTimetable
          entries={entriesWithUnknownSubject}
          subjects={mockSubjects}
          faculty={mockFaculty}
          rooms={mockRooms}
        />
      );

      const dashElements = screen.getAllByText("—");
      expect(dashElements.length).toBeGreaterThan(0);
    });
  });

  describe("Dynamic Data Rendering", () => {
    it("should render subject name from user input when entry exists", () => {
      render(
        <StaticTimetable
          entries={mockEntries}
          subjects={mockSubjects}
          faculty={mockFaculty}
          rooms={mockRooms}
        />
      );

      expect(screen.getByText("Mathematics")).toBeInTheDocument();
    });

    it("should render faculty initials when faculty data is available", () => {
      render(
        <StaticTimetable
          entries={mockEntries}
          subjects={mockSubjects}
          faculty={mockFaculty}
          rooms={mockRooms}
        />
      );

      expect(screen.getByText("(DS)")).toBeInTheDocument();
    });

    it("should render room name when room data is available", () => {
      render(
        <StaticTimetable
          entries={mockEntries}
          subjects={mockSubjects}
          faculty={mockFaculty}
          rooms={mockRooms}
        />
      );

      expect(screen.getByText("Room 101")).toBeInTheDocument();
    });

    it("should not contain any hardcoded static faculty names", () => {
      render(
        <StaticTimetable
          entries={[]}
          subjects={[]}
          faculty={[]}
          rooms={[]}
        />
      );

      const staticFacultyNames = [
        "Mrs. Megha Mane",
        "Dr. Latika Desai",
        "Mrs. Nehal Ganpule",
        "Mrs. Vidya Bhosale",
        "Mrs. Shruti Sekra",
        "Dr. Manish Sharma",
        "Nishu Sharma",
      ];

      staticFacultyNames.forEach((name) => {
        expect(screen.queryByText(name)).not.toBeInTheDocument();
      });
    });

    it("should not contain any hardcoded course names", () => {
      render(
        <StaticTimetable
          entries={[]}
          subjects={[]}
          faculty={[]}
          rooms={[]}
        />
      );

      const staticCourseNames = [
        "Data Structure & Algorithm",
        "Computer Organization & Operating System",
        "Artificial Intelligence",
      ];

      staticCourseNames.forEach((name) => {
        expect(screen.queryByText(name)).not.toBeInTheDocument();
      });
    });
  });

  describe("Validation", () => {
    it("should not render placeholder or default text for missing values", () => {
      const entriesWithPartialData: TimetableEntry[] = [
        { day: "Monday", slotId: "9-10", divisionId: "div1", subjectId: "sub1", facultyId: "", roomId: "", type: "lecture" },
      ];

      render(
        <StaticTimetable
          entries={entriesWithPartialData}
          subjects={mockSubjects}
          faculty={mockFaculty}
          rooms={mockRooms}
        />
      );

      const dashElements = screen.getAllByText("—");
      expect(dashElements.length).toBeGreaterThan(0);

      expect(screen.queryByText("Room 101")).not.toBeInTheDocument();
      expect(screen.queryByText("Dr. Smith")).not.toBeInTheDocument();
    });

    it("should only render values that originate from input props", () => {
      render(
        <StaticTimetable
          entries={mockEntries}
          subjects={mockSubjects}
          faculty={mockFaculty}
          rooms={mockRooms}
        />
      );

      expect(screen.getByText("Mathematics")).toBeInTheDocument();
      expect(screen.getByText("Physics")).toBeInTheDocument();
      expect(screen.getByText("Room 101")).toBeInTheDocument();
      expect(screen.getByText("Physics Lab")).toBeInTheDocument();
    });
  });
});
