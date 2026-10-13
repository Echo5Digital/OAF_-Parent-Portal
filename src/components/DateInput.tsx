import { useRef, useState } from "react";
import { CalendarIcon } from "./Icons";

type DateInputProps = {
  /** Stored as native <input type="date"> format (YYYY-MM-DD) for easy parsing/validation; displayed as MM-DD-YYYY to match the real form regardless of browser locale. */
  value: string;
  onChange: (next: string) => void;
};

function isoToDisplay(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  return `${m[2]}-${m[3]}-${m[1]}`;
}

function maskDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const mm = digits.slice(0, 2);
  const dd = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  return [mm, dd, yyyy].filter(Boolean).join("-");
}

function displayToIso(display: string): string {
  const m = display.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return "";
  return `${m[3]}-${m[1]}-${m[2]}`;
}

/**
 * Always shows MM-DD-YYYY, matching the real form's "Calendar" field, instead
 * of the browser-locale-dependent placeholder a bare <input type="date">
 * renders (e.g. dd/mm/yyyy — confirmed as a mismatch 2026-10-13). A hidden
 * native date input behind the calendar icon still provides a real picker;
 * the visible text field is masked digit input, not free text.
 */
export function DateInput({ value, onChange }: DateInputProps) {
  const nativeRef = useRef<HTMLInputElement>(null);
  const [partial, setPartial] = useState("");
  const complete = isoToDisplay(value);

  function handleTextChange(raw: string) {
    const masked = maskDisplay(raw);
    const iso = displayToIso(masked);
    if (iso) {
      setPartial("");
      onChange(iso);
    } else {
      setPartial(masked);
      if (value) onChange("");
    }
  }

  function openPicker() {
    nativeRef.current?.showPicker?.();
  }

  return (
    <div className="date-input">
      <input
        type="text"
        placeholder="MM-DD-YYYY"
        value={complete || partial}
        onChange={(e) => handleTextChange(e.target.value)}
        maxLength={10}
      />
      <button type="button" className="date-input-icon" onClick={openPicker} aria-label="Open calendar">
        <CalendarIcon size={15} />
      </button>
      <input
        ref={nativeRef}
        type="date"
        className="date-input-native"
        value={value}
        onChange={(e) => {
          setPartial("");
          onChange(e.target.value);
        }}
        tabIndex={-1}
      />
    </div>
  );
}
