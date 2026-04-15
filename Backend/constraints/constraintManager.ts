import type { CSPConstraint, SoftConstraint } from "../types/csp.types";
import { FacultyConstraint } from "./hard/facultyConstraint";
import { RoomConstraint } from "./hard/roomConstraint";
import { BatchConstraint } from "./hard/batchConstraint";
import { LabConstraint } from "./hard/labConstraint";
import { SubjectQuotaConstraint } from "./hard/subjectQuotaConstraint";
import { PracticalConstraint } from "./hard/practicalConstraint";
import { OnePerDayConstraint } from "./hard/onePerDayConstraint";
import { AvoidBackToBack } from "./soft/avoidBackToBack";
import { MorningPreference } from "./soft/morningPreference";
import { WorkloadBalance } from "./soft/workloadBalance";
import { AvoidLastSlot } from "./soft/avoidLastSlot";
import { FacultyPreference } from "./soft/facultyPreference";
import { GapMinimization } from "./soft/gapMinimization";
import { PracticalDistribution } from "./soft/practicalDistribution";

export class ConstraintManager {
  private hardConstraints: CSPConstraint[] = [];
  private softConstraints: SoftConstraint[] = [];

  constructor() {
    this.initializeHardConstraints();
    this.initializeSoftConstraints();
  }

  private initializeHardConstraints(): void {
    this.hardConstraints = [
      new FacultyConstraint(),
      new RoomConstraint(),
      new BatchConstraint(),
      new LabConstraint(),
      new SubjectQuotaConstraint(),
      new PracticalConstraint(),
      new OnePerDayConstraint(),
    ];
  }

  private initializeSoftConstraints(): void {
    this.softConstraints = [
      new AvoidBackToBack(),
      new MorningPreference(),
      new WorkloadBalance(),
      new AvoidLastSlot(),
      new FacultyPreference(),
      new GapMinimization(),
      new PracticalDistribution(),
    ];
  }

  public getHardConstraints(): CSPConstraint[] {
    return this.hardConstraints;
  }

  public getSoftConstraints(): SoftConstraint[] {
    return this.softConstraints;
  }

  public addHardConstraint(constraint: CSPConstraint): void {
    this.hardConstraints.push(constraint);
  }

  public addSoftConstraint(constraint: SoftConstraint): void {
    this.softConstraints.push(constraint);
  }
}
