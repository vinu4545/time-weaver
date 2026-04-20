import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Subject, Faculty, Room, Lab, Batch, Division,
  InstitutionalRules, SubjectFacultyMapping, GeneratedTimetable,
  SoftConstraintConfig,
} from '@/types/timetable';

interface TimetableStore {
  subjects: Subject[];
  faculty: Faculty[];
  rooms: Room[];
  labs: Lab[];
  batches: Batch[];
  divisions: Division[];
  mappings: SubjectFacultyMapping[];
  rules: InstitutionalRules;
  softConstraints: SoftConstraintConfig;
  generatedTimetables: GeneratedTimetable[];
  isGenerating: boolean;

  addSubject: (s: Subject) => void;
  updateSubject: (id: string, s: Partial<Subject>) => void;
  removeSubject: (id: string) => void;

  addFaculty: (f: Faculty) => void;
  updateFaculty: (id: string, f: Partial<Faculty>) => void;
  removeFaculty: (id: string) => void;

  addRoom: (r: Room) => void;
  updateRoom: (id: string, r: Partial<Room>) => void;
  removeRoom: (id: string) => void;

  addLab: (l: Lab) => void;
  updateLab: (id: string, l: Partial<Lab>) => void;
  removeLab: (id: string) => void;

  addBatch: (b: Batch) => void;
  updateBatch: (id: string, b: Partial<Batch>) => void;
  removeBatch: (id: string) => void;

  addDivision: (d: Division) => void;
  updateDivision: (id: string, d: Partial<Division>) => void;
  removeDivision: (id: string) => void;

  addMapping: (m: SubjectFacultyMapping) => void;
  removeMapping: (subjectId: string, facultyId: string) => void;

  updateRules: (r: Partial<InstitutionalRules>) => void;
  updateSoftConstraints: (c: Partial<SoftConstraintConfig>) => void;

  addGeneratedTimetable: (t: GeneratedTimetable) => void;
  updateGeneratedTimetable: (id: string, t: Partial<GeneratedTimetable>) => void;
  duplicateGeneratedTimetable: (id: string, name?: string) => void;
  removeGeneratedTimetable: (id: string) => void;
  setIsGenerating: (v: boolean) => void;
}

export const useTimetableStore = create<TimetableStore>()(
  persist(
    (set) => ({
      subjects: [],
      faculty: [],
      rooms: [],
      labs: [],
      batches: [],
      divisions: [],
      mappings: [],
      rules: {
        startTime: '09:00',
        endTime: '18:15',
        breakSlots: ['BREAK1'],
        lunchSlot: 'LUNCH',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        oneLecturePerSubjectPerDay: true,
      },
      softConstraints: {
        avoidBackToBack: { enabled: true, weight: 3 },
        preferMorningHeavy: { enabled: true, weight: 2 },
        evenWorkload: { enabled: true, weight: 4 },
        avoidLastSlot: { enabled: true, weight: 1 },
        facultyPreference: { enabled: true, weight: 5 },
        minimizeGaps: { enabled: true, weight: 3 },
        balancePracticals: { enabled: true, weight: 2 },
        oneLecturePerSubjectPerDay: { enabled: true, weight: 4 },
      },
      generatedTimetables: [],
      isGenerating: false,

      addSubject: (s) => set((st) => ({ subjects: [...st.subjects, s] })),
      updateSubject: (id, s) => set((st) => ({ subjects: st.subjects.map((x) => x.id === id ? { ...x, ...s } : x) })),
      removeSubject: (id) => set((st) => ({ subjects: st.subjects.filter((x) => x.id !== id) })),

      addFaculty: (f) => set((st) => ({ faculty: [...st.faculty, f] })),
      updateFaculty: (id, f) => set((st) => ({ faculty: st.faculty.map((x) => x.id === id ? { ...x, ...f } : x) })),
      removeFaculty: (id) => set((st) => ({ faculty: st.faculty.filter((x) => x.id !== id) })),

      addRoom: (r) => set((st) => ({ rooms: [...st.rooms, r] })),
      updateRoom: (id, r) => set((st) => ({ rooms: st.rooms.map((x) => x.id === id ? { ...x, ...r } : x) })),
      removeRoom: (id) => set((st) => ({ rooms: st.rooms.filter((x) => x.id !== id) })),

      addLab: (l) => set((st) => ({ labs: [...st.labs, l] })),
      updateLab: (id, l) => set((st) => ({ labs: st.labs.map((x) => x.id === id ? { ...x, ...l } : x) })),
      removeLab: (id) => set((st) => ({ labs: st.labs.filter((x) => x.id !== id) })),

      addBatch: (b) => set((st) => ({ batches: [...st.batches, b] })),
      updateBatch: (id, b) => set((st) => ({ batches: st.batches.map((x) => x.id === id ? { ...x, ...b } : x) })),
      removeBatch: (id) => set((st) => ({ batches: st.batches.filter((x) => x.id !== id) })),

      addDivision: (d) => set((st) => ({ divisions: [...st.divisions, d] })),
      updateDivision: (id, d) => set((st) => ({ divisions: st.divisions.map((x) => x.id === id ? { ...x, ...d } : x) })),
      removeDivision: (id) => set((st) => ({ divisions: st.divisions.filter((x) => x.id !== id) })),

      addMapping: (m) => set((st) => ({ mappings: [...st.mappings, m] })),
      removeMapping: (sId, fId) => set((st) => ({ mappings: st.mappings.filter((x) => !(x.subjectId === sId && x.facultyId === fId)) })),

      updateRules: (r) => set((st) => ({ rules: { ...st.rules, ...r } })),
      updateSoftConstraints: (c) => set((st) => ({ softConstraints: { ...st.softConstraints, ...c } })),

      addGeneratedTimetable: (t) => set((st) => ({ generatedTimetables: [
        {
          ...t,
          generatedAt: t.generatedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: t.version || 1,
        },
        ...st.generatedTimetables,
      ] })),
      updateGeneratedTimetable: (id, t) => set((st) => ({
        generatedTimetables: st.generatedTimetables.map((item) => (
          item.id === id
            ? { ...item, ...t, updatedAt: new Date().toISOString() }
            : item
        )),
      })),
      duplicateGeneratedTimetable: (id, name) => set((st) => {
        const source = st.generatedTimetables.find((item) => item.id === id);
        if (!source) return st;
        const version = source.version ? source.version + 1 : 2;
        const copy: GeneratedTimetable = {
          ...source,
          id: crypto.randomUUID(),
          name: name || `${source.name} v${version}`,
          generatedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version,
          parentId: source.parentId || source.id,
        };
        return { generatedTimetables: [copy, ...st.generatedTimetables] };
      }),
      removeGeneratedTimetable: (id) => set((st) => ({ generatedTimetables: st.generatedTimetables.filter((x) => x.id !== id) })),
      setIsGenerating: (v) => set({ isGenerating: v }),
    }),
    { name: 'timeforge-store' }
  )
);
