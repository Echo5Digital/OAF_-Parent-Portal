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

export type DailyLogEntry = {
  status: DayStatus;
  start: string;
  stop: string;
  minutes: number | "";
  skill: string;
  method: string;
  performance: string;
  notes: string;
};

export const SKILL_AREAS = [
  "Personal Hygiene",
  "Nutrition",
  "Meal Preparation",
  "Personal Space",
  "Academic Skills",
  "Other",
] as const;

export const TEACHING_METHODS = ["Model", "Guide", "Teach"] as const;

export const PERFORMANCE_LEVELS = [
  "Independently",
  "With Minimal Assistance",
  "With Moderate Assistance",
  "Refused",
] as const;

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

function emptyDay(): DailyLogEntry {
  return {
    status: "empty",
    start: "",
    stop: "",
    minutes: "",
    skill: "Personal Hygiene",
    method: "Model",
    performance: "",
    notes: "",
  };
}

export type ChildWeek = {
  activeDay: number;
  days: DailyLogEntry[];
};

export function buildInitialStore(): Record<string, ChildWeek> {
  const store: Record<string, ChildWeek> = {};
  for (const c of CHILDREN) {
    store[c.id] = { activeDay: 0, days: DAY_NAMES.map(() => emptyDay()) };
  }

  store.emma.days[0] = {
    status: "complete",
    start: "08:00 AM",
    stop: "08:30 AM",
    minutes: 30,
    skill: "Personal Hygiene",
    method: "Model",
    performance: "With Minimal Assistance",
    notes:
      "Emma completed morning routine with minimal prompts. Brushed teeth and washed face independently. Very cooperative today!",
  };
  store.emma.days[1] = {
    status: "complete",
    start: "07:45 AM",
    stop: "08:20 AM",
    minutes: 35,
    skill: "Meal Preparation",
    method: "Guide",
    performance: "Independently",
    notes: "Helped prepare breakfast, measured cereal and poured milk without assistance.",
  };
  store.emma.days[2] = {
    status: "complete",
    start: "08:10 AM",
    stop: "08:35 AM",
    minutes: 25,
    skill: "Academic Skills",
    method: "Teach",
    performance: "With Minimal Assistance",
    notes: "Practiced reading for 25 minutes, needed help sounding out two words.",
  };
  store.emma.activeDay = 3;

  store.liam.days[0] = {
    status: "progress",
    start: "06:30 PM",
    stop: "",
    minutes: "",
    skill: "Personal Space",
    method: "Model",
    performance: "",
    notes: "",
  };
  store.liam.activeDay = 0;
  store.sophie.activeDay = 0;

  return store;
}

export function parseTime(t: string): number | null {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + parseInt(m[2], 10);
}
