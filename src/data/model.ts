export type Classification = "TFC" | "ITFC" | "CFC";

export type Child = {
  id: string;
  name: string;
  age: number;
  initials: string;
  color: string;
  photo: string;
  therapist: string;
  classification: Classification;
  respite: boolean;
  itfc: boolean;
};

export type DayStatus = "empty" | "progress" | "complete";

/**
 * Mirrors the real Open Arms "Daily Logs for Foster Parents" Jotform (v15.5),
 * reconstructed from screenshots of the live form builder on 2026-10-12 — not
 * invented. Known gaps, pending the user confirming the rest of the form:
 *   - Only Day 1's page has been captured; Days 2-7 are assumed identical in
 *     structure (same fields, different date) until confirmed.
 *   - Only two timed sections (Basic Living Skills, Social Skills) are modeled;
 *     the real form may have more below what was captured.
 *   - The Daily Behavioral Checklist is modeled as always shown (not gated by
 *     ITFC) — unconfirmed; may need to move inside the ITFC-only branch.
 *   - End-of-week pages (8-11 of the 11-page stepper) have not been captured
 *     at all and are not modeled yet.
 */

export const SKILL_AREAS = [
  "1: Age appropriate hygiene/self-care",
  "2: Nutrition/health",
  "3: Meal preparation",
  "4: Prepare for the day",
  "5: Care for personal space/Belongings",
  "6: Improve study skills/academic effort",
  "Other",
] as const;

export const SOCIAL_SKILL_AREAS = [
  "1: Communication skills",
  "2: Care for personal space/belongings",
  "3: Maintain appropriate physical boundaries",
  "4: Social skills, sharing, taking turns",
  "5: Using words to express feelings",
  "Other",
] as const;

export const TEACHING_METHODS = ["Model", "Guided", "Taught", "Other"] as const;

export const COMPLETION_LEVELS = ["w/Assistance", "w/Minimal Assistance", "Refused", "Other"] as const;

export const CHILD_RESPONSE_OPTIONS = [
  "Barriers (unable to comprehend)",
  "Listened/Modeled",
  "Challenged skills/refused learning",
  "Other",
] as const;

export const BEHAVIOR_MANAGED_USING = [
  "Guided redirection",
  "Verbal Redirection",
  "Prompt to use coping skills",
  "Observed trigger & require. action by parent to prevent escalation",
  "Other",
] as const;

export const WORKBOOKS = [
  "Mindfulness for Anxious Kids",
  "The Relaxation and Stress Reduction Workbook for Kids",
  "Cool, Calm and Confident",
  "Don't Let Your Emotions Run Your Lfe for Kids", // real form has this typo — kept verbatim to match the live Jotform
  "Learning to Listen, Learning to Care",
  "Think Happy",
  "My Feeling Better Workbook",
  "Let's Be Friends",
  "Making Sense of your Senses",
  "Just As You Are",
  "Mindfulness For Kids With ADHD",
  "The Worry Workbook For Kids",
  "The Anger Workbook ForTeens",
  "I'm Not Bad, I'm Just Mad",
  "The Connected Child",
  "Growth Mindset",
  "The Resilience Workbook for Kids",
  "Other",
] as const;

export const BEHAVIOR_CHECKLIST_OPTIONS = [
  "Depression",
  "Anger",
  "Yelling/Screaming",
  "School Issues",
  "Nightmares",
  "Bedwetting",
  "Health Complaint",
  "Harming Others",
  "Lying/Hiding Truth",
  "Refused Meds",
  "Anxiety",
  "Phy. Aggression",
  "Crying Spells",
  "Fatigue",
  "Social Isolation",
  "Holding Bowels",
  "Feeling Hopeless",
  "Threatened Harm",
  "Irritable",
  "Poor Judgement",
  "Excessive Worry",
  "Verbal Aggression",
  "Hoarding",
  "Poor Concentration",
  "Excessive Sleeping",
  "Throwing Objects",
  "Pacing/Nervous",
  "Hygiene Issues",
  "Unable to Calm Self",
  "Impulsive",
  "Withdrawl",
  "Defiance",
  "Mood Swings",
  "Hallucinations",
  "Sleeplessness",
  "Appetite Change",
  "Harming Self",
  "Stealing",
  "Destructive",
  "Fearful",
  "Other",
] as const;

export type SkillActivity = {
  start: string;
  stop: string;
  minutes: number | "";
  skills: string[];
  otherSkill: string;
  method: string;
  otherMethod: string;
  completion: string;
  otherCompletion: string;
  response: string;
  otherResponse: string;
};

function emptySkillActivity(): SkillActivity {
  return {
    start: "",
    stop: "",
    minutes: "",
    skills: [],
    otherSkill: "",
    method: "",
    otherMethod: "",
    completion: "",
    otherCompletion: "",
    response: "",
    otherResponse: "",
  };
}

export type DailyLogEntry = {
  status: DayStatus;
  /**
   * "Is Day N Required?" — confirmed on Day 2's page (2026-10-12 screenshots),
   * not present/not visible on Day 1. If "No", nothing else on the day's page
   * applies — not even the respite question. Unconfirmed whether Day 1 also
   * has this field or starts implicitly required.
   */
  dayRequired: "" | "Yes" | "No";
  respite: "" | "Yes" | "No";
  respiteWithOafcParent: "" | "Yes" | "No";
  basicLivingSkills: SkillActivity;
  itfc: "" | "Yes" | "No";
  workbook: string;
  otherWorkbook: string;
  describeWhatHappened: string;
  importantEvents: string;
  behaviorManagedUsing: string[];
  otherBehaviorManaged: string;
  positiveReinforcementCount: number | "";
  positiveReinforcementOtherCount: number | "";
  timeOutMinutes: number | "";
  restrictionMinutes: number | "";
  socialSkills: SkillActivity;
  /** Social Skills section has its own separate "Describe what happened below" field (confirmed Day 2) — distinct from the one after Basic Living Skills/ITFC. */
  socialSkillsDescribeWhatHappened: string;
  behaviorChecklist: string[];
  parentSignature: string;
  signatureDate: string;
};

export const RECREATIONAL_ACTIVITIES = [
  "Sports",
  "Video Game",
  "Free Play Inside",
  "Free Play Outside",
  "Arts/Crafts",
  "Park",
  "Dance",
  "Music Activities",
  "Other",
] as const;

export const VISITOR_TYPES = [
  "Biological Parent(s)",
  "Sibling",
  "Extended Family",
  "Caseworker",
  "Adopted Parent(s)",
  "Agency Staff",
] as const;

export const VISITATION_METHODS = ["In Person", "Phone", "Mail/Email", "Phone/Telehealth", "N/A"] as const;

export type VisitorRow = {
  visitorName: string;
  method: "" | (typeof VISITATION_METHODS)[number];
};

export function emptyVisitorRow(): VisitorRow {
  return { visitorName: "", method: "" };
}

/** Confirmed full list from the real form's Medication dropdown, in order (2026-10-12). */
export const MEDICATIONS = [
  "Aripiprazole (Abilify)",
  "Guanfacine",
  "Prazosin",
  "Methylphenidate",
  "Focalin",
  "Dexmethylphenidate",
  "Clonidine",
  "Olanzapine",
  "Atomoxetine",
  "Divalproex",
  "Cetirizine",
  "Fluoxetine",
  "Hydroxyzine",
  "Quetiapine",
  "Risperidone (Risperdal)",
  "Sertraline",
  "Desmopressin Acetate",
  "Trazodone Hydrochloride",
  "Trazodone",
  "Vyvanse",
  "Escitalopram",
  "Mirtazapine",
  "Amantadine",
  "Loratadine",
  "Oxcarbazepine",
  "Buspirone",
  "Topiramate",
] as const;

export const MEDICATION_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thr", "Fri", "Sat"] as const;
export const MEDICATION_FREQUENCIES = ["Select", "Daily", "Weekly"] as const;

export type MedicationRow = {
  medication: string;
  dosage: string;
  frequency: "" | (typeof MEDICATION_FREQUENCIES)[number];
  days: string[];
  otherMedication1: string;
  otherDosage1: string;
  otherFrequency1: string;
  otherComments1: string;
  otherMedication2: string;
  otherDosage2: string;
  otherFrequency2: string;
  otherComments2: string;
  time1: string;
  time2: string;
  time3: string;
  time4: string;
};

export function emptyMedicationRow(): MedicationRow {
  return {
    medication: MEDICATIONS[0],
    dosage: "",
    frequency: "",
    days: [],
    otherMedication1: "",
    otherDosage1: "",
    otherFrequency1: "",
    otherComments1: "",
    otherMedication2: "",
    otherDosage2: "",
    otherFrequency2: "",
    otherComments2: "",
    time1: "",
    time2: "",
    time3: "",
    time4: "",
  };
}

export const MEDICAL_APPOINTMENT_TYPES = ["Eye", "Dental", "General", "Psychiatric", "ER (incident report required)"] as const;

export type MedicalAppointmentRow = {
  type: "" | (typeof MEDICAL_APPOINTMENT_TYPES)[number];
  date: string;
  medsChanged: "" | "Yes-Notify Agency Immediately" | "No";
};

export function emptyMedicalAppointmentRow(): MedicalAppointmentRow {
  return { type: "", date: "", medsChanged: "" };
}

/**
 * Pages 8-9 of the real 11-page form — week-level sections shown once per
 * weekly log (not repeated per day, unlike Days 1-7). Confirmed from
 * screenshots 2026-10-12; pages 10-11 not yet captured.
 */
export type WeekSummary = {
  recreationalActivities: string[];
  otherRecreationalActivity: string;
  visitors: Record<string, VisitorRow>;
  medicalAppointments: "" | "N/A" | "Required";
  /** Shown only when medicalAppointments === "Required"; "+ Click here to add another appointment" repeats this block (confirmed 2026-10-12). */
  medicalAppointmentRows: MedicalAppointmentRow[];
  medications: MedicationRow[];
};

export function emptyWeekSummary(): WeekSummary {
  const visitors: Record<string, VisitorRow> = {};
  for (const v of VISITOR_TYPES) visitors[v] = emptyVisitorRow();
  return {
    recreationalActivities: [],
    otherRecreationalActivity: "",
    visitors,
    medicalAppointments: "",
    medicalAppointmentRows: [emptyMedicalAppointmentRow()],
    medications: [emptyMedicationRow()],
  };
}

export const DAY_NAMES = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
export const DAY_DATES = [
  "Mon, Oct 7",
  "Tue, Oct 8",
  "Wed, Oct 9",
  "Thu, Oct 10",
  "Fri, Oct 11",
  "Sat, Oct 12",
  "Sun, Oct 13",
];

/**
 * Pages 8-11 of the real 11-page Jotform, shown as additional boxes after Day 7
 * in the same tab row/design (user explicitly wants the 1-11 boxes in one
 * continuous row, not a separate button or stepper widget). 8-9 are confirmed
 * from screenshots (2026-10-12); 10-11 are not yet captured.
 */
export const EXTRA_PAGE_NAMES = ["Page 8", "Page 9", "Page 10", "Page 11"];
export const EXTRA_PAGE_LABELS = ["Recreation & Visitation", "Medical & Medications", "Not yet confirmed", "Not yet confirmed"];

export const CHILDREN: Child[] = [
  {
    id: "emma",
    name: "Emma R.",
    age: 8,
    initials: "ER",
    color: "#2F7D5A",
    photo: "https://i.pravatar.cc/80?img=47",
    therapist: "Dr. Maria Lopez, BCBA",
    classification: "TFC",
    respite: false,
    itfc: false,
  },
  {
    id: "liam",
    name: "Liam T.",
    age: 11,
    initials: "LT",
    color: "#C9893F",
    photo: "https://i.pravatar.cc/80?img=56",
    therapist: "Dr. James Carter, LPC",
    classification: "ITFC",
    respite: false,
    itfc: true,
  },
  {
    id: "sophie",
    name: "Sophie M.",
    age: 6,
    initials: "SM",
    color: "#2E6BA6",
    photo: "https://i.pravatar.cc/80?img=49",
    therapist: "Dr. Maria Lopez, BCBA",
    classification: "CFC",
    respite: true,
    itfc: false,
  },
];

export function emptyDay(): DailyLogEntry {
  return {
    status: "empty",
    dayRequired: "",
    respite: "",
    respiteWithOafcParent: "",
    basicLivingSkills: emptySkillActivity(),
    itfc: "",
    workbook: "",
    otherWorkbook: "",
    describeWhatHappened: "",
    importantEvents: "",
    behaviorManagedUsing: [],
    otherBehaviorManaged: "",
    positiveReinforcementCount: "",
    positiveReinforcementOtherCount: "",
    timeOutMinutes: "",
    restrictionMinutes: "",
    socialSkills: emptySkillActivity(),
    socialSkillsDescribeWhatHappened: "",
    behaviorChecklist: [],
    parentSignature: "",
    signatureDate: "",
  };
}

export type ChildWeek = {
  /** 0-10: 0-6 select Days 1-7 (indexes into `days`), 7-10 select pages 8-11 (week-level content). */
  activeStep: number;
  days: DailyLogEntry[];
  weekSummary: WeekSummary;
};

export function buildInitialStore(): Record<string, ChildWeek> {
  const store: Record<string, ChildWeek> = {};
  for (const c of CHILDREN) {
    store[c.id] = { activeStep: 0, days: DAY_NAMES.map(() => emptyDay()), weekSummary: emptyWeekSummary() };
  }

  store.emma.days[0] = {
    ...emptyDay(),
    status: "complete",
    dayRequired: "Yes",
    respite: "No",
    basicLivingSkills: {
      ...emptySkillActivity(),
      start: "08:00 AM",
      stop: "08:30 AM",
      minutes: 30,
      skills: ["1: Age appropriate hygiene/self-care"],
      method: "Model",
      completion: "w/Minimal Assistance",
      response: "Listened/Modeled",
    },
    itfc: "No",
    describeWhatHappened: "Calm morning, cooperative throughout.",
    importantEvents: "None",
    socialSkills: {
      ...emptySkillActivity(),
      start: "04:00 PM",
      stop: "05:00 PM",
      minutes: 60,
      skills: ["4: Social skills, sharing, taking turns"],
      method: "Guided",
      completion: "w/Minimal Assistance",
    },
    parentSignature: "Jessica Smith",
    signatureDate: "10-07-2026",
  };
  store.emma.activeStep = 1;

  store.liam.days[0] = {
    ...emptyDay(),
    status: "progress",
    dayRequired: "Yes",
    respite: "No",
    basicLivingSkills: {
      ...emptySkillActivity(),
      start: "06:30 PM",
      skills: ["5: Care for personal space/Belongings"],
      method: "Model",
    },
  };
  store.liam.activeStep = 0;
  store.sophie.activeStep = 0;

  return store;
}

export function parseTime(t: string): number | null {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + parseInt(m[2], 10);
}
