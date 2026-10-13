import { useState } from "react";

type TimeInputProps = {
  value: string;
  onChange: (next: string) => void;
};

function splitValue(value: string): { hhmm: string; period: "AM" | "PM" } {
  const m = value.trim().match(/^(\d{1,2}:\d{2})\s*(AM|PM)$/i);
  if (!m) return { hhmm: "", period: "AM" };
  return { hhmm: m[1], period: m[2].toUpperCase() as "AM" | "PM" };
}

/**
 * Masks free-typed digits into "H:MM" as the user types, treating hour and
 * minute as separate fixed-width segments (not a single re-sliced digit
 * string) so e.g. typing "0", "7", "9" in sequence produces "07:9..." as
 * expected instead of corrupting into "0:79" — a real bug found 2026-10-13
 * where typing HH=07 MM=9 produced "0:78".
 */
function maskHhmm(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/**
 * Matches the real Jotform's time fields: an HH:MM text box plus a separate
 * AM/PM dropdown, rather than one free-text field — confirmed across Basic
 * Living Skills, Social Skills, and the Medications Time 1-4 fields
 * (screenshots 2026-10-13). Keeps the in-progress HH:MM text as local state
 * while typing, and only reports a combined "HH:MM AM/PM" value up once the
 * pattern is actually complete — an earlier version combined on every
 * keystroke, which caused "AM" to appear inside the HH:MM box itself after
 * typing a single digit.
 */
export function TimeInput({ value, onChange }: TimeInputProps) {
  const parsed = splitValue(value);
  const [draftHhmm, setDraftHhmm] = useState(parsed.hhmm);
  const [period, setPeriod] = useState<"AM" | "PM">(parsed.period);

  const displayHhmm = value ? parsed.hhmm || draftHhmm : draftHhmm;

  function updateHhmm(raw: string) {
    const masked = maskHhmm(raw);
    setDraftHhmm(masked);
    const complete = /^\d{1,2}:\d{2}$/.test(masked);
    onChange(complete ? `${masked} ${period}` : "");
  }

  function updatePeriod(next: "AM" | "PM") {
    setPeriod(next);
    if (displayHhmm) onChange(`${displayHhmm} ${next}`);
  }

  return (
    <div className="time-input">
      <input
        type="text"
        inputMode="numeric"
        placeholder="HH:MM"
        value={displayHhmm}
        onChange={(e) => updateHhmm(e.target.value)}
        maxLength={5}
      />
      <select value={period} onChange={(e) => updatePeriod(e.target.value as "AM" | "PM")}>
        <option>AM</option>
        <option>PM</option>
      </select>
    </div>
  );
}
