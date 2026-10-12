import { useEffect, useRef, useState } from "react";
import {
  DAY_NAMES,
  PERFORMANCE_LEVELS,
  SKILL_AREAS,
  TEACHING_METHODS,
  parseTime,
  type Child,
  type DailyLogEntry,
} from "../data/model";
import { CheckIcon, FlagCheckIcon, SignIcon, WarningIcon } from "./Icons";
import { useToast } from "./Toast";

type SaveState = "saved" | "saving";

type DailyLogFormProps = {
  child: Child;
  dayIndex: number;
  entry: DailyLogEntry;
  onChange: (next: DailyLogEntry) => void;
  onComplete: () => void;
};

export function DailyLogForm({ child, dayIndex, entry, onChange, onComplete }: DailyLogFormProps) {
  const { showToast } = useToast();
  const [draft, setDraft] = useState<DailyLogEntry>(entry);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const saveTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setDraft(entry);
    setSaveState("saved");
  }, [entry, dayIndex, child.id]);

  function scheduleSave(next: DailyLogEntry) {
    setDraft(next);
    setSaveState("saving");
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      const status: DailyLogEntry["status"] =
        next.status === "complete" ? "complete" : next.start && next.stop && next.performance && next.notes ? "progress" : next.status;
      const saved: DailyLogEntry = { ...next, status };
      onChange(saved);
      setSaveState("saved");
    }, 600);
  }

  function updateField<K extends keyof DailyLogEntry>(key: K, value: DailyLogEntry[K]) {
    let next = { ...draft, [key]: value };
    if (key === "start" || key === "stop") {
      const a = parseTime(next.start);
      const b = parseTime(next.stop);
      if (a !== null && b !== null && b > a) {
        next = { ...next, minutes: b - a };
      }
    }
    scheduleSave(next);
  }

  function handleFinish() {
    if (!draft.start || !draft.stop || !draft.performance || !draft.notes) {
      showToast("Please complete all required fields before finishing this day");
      return;
    }
    const finished = { ...draft, status: "complete" as const };
    onChange(finished);
    onComplete();
    showToast(`${DAY_NAMES[dayIndex]} marked complete for ${child.name.split(" ")[0]}`);
  }

  function handleDraft() {
    onChange(draft);
    showToast("Draft saved — resume anytime");
  }

  const duration = typeof draft.minutes === "number" ? draft.minutes : 0;
  const compliant = duration >= 30;

  return (
    <div className="card">
      <div className="form-head">
        <div className="ttl">
          <div className="ic">
            <img src="/icon-daily-log.png" alt="" />
          </div>
          <div>
            <h3>Daily Log — {DAY_NAMES[dayIndex]}</h3>
            <div className="desc">Record {child.name.split(" ")[0]}'s activities, skills, and progress for this day.</div>
          </div>
        </div>
        <div className={`save-chip ${saveState}`}>
          {saveState === "saved" ? (
            <>
              <CheckIcon size={12} /> Saved
            </>
          ) : (
            <>Saving...</>
          )}
        </div>
      </div>

      <div className="meta-strip">
        <div className="meta-cell">
          <img className="meta-icon" src="/icon-parent.png" alt="" />
          <div>
            <div className="k">Parent Name</div>
            <div className="v">Jessica Smith</div>
          </div>
        </div>
        <div className="meta-cell">
          <img className="meta-icon" src="/icon-child.png" alt="" />
          <div>
            <div className="k">Assigned Child</div>
            <div className="v">{child.name}</div>
            <div className="v-sub">Age {child.age}</div>
          </div>
        </div>
        <div className="meta-cell">
          <img className="meta-icon" src="/icon-calendar.png" alt="" />
          <div>
            <div className="k">Week Of</div>
            <div className="v mono">Oct 7 – Oct 13, 2024</div>
          </div>
        </div>
        <div className="meta-cell">
          <img className="meta-icon" src="/icon-therapist.png" alt="" />
          <div>
            <div className="k">Assigned Therapist</div>
            <div className="v">{child.therapist}</div>
          </div>
        </div>
      </div>

      <div className="form-body">
        {child.respite ? (
          <div className="conditional-box">
            <span className="flag">
              <WarningIcon size={11} /> Respite Condition Active
            </span>
            <div style={{ fontSize: "12.5px", color: "var(--ink-soft)" }}>
              {child.name} is currently in respite care this period. Standard daily-skills sections are hidden; the{" "}
              <b>Respite Caregiver Log</b> applies instead for {DAY_NAMES[dayIndex]}.
            </div>
          </div>
        ) : null}

        {child.itfc ? (
          <div className="conditional-box">
            <span className="flag">
              <FlagCheckIcon size={11} /> ITFC Classification
            </span>
            <div className="frow" style={{ marginBottom: 0, gridTemplateColumns: "1fr 1fr" }}>
              <div className="ffield">
                <label>
                  Crisis/Safety Plan Reviewed <span className="star">*</span>
                </label>
                <select defaultValue="Yes — no concerns">
                  <option>Yes — no concerns</option>
                  <option>Yes — concerns noted below</option>
                  <option>No</option>
                </select>
              </div>
              <div className="ffield">
                <label>
                  Level of Supervision <span className="star">*</span>
                </label>
                <select defaultValue="Line of sight">
                  <option>Line of sight</option>
                  <option>Within hearing</option>
                  <option>Independent</option>
                </select>
              </div>
            </div>
          </div>
        ) : null}

        {!child.respite ? (
          <>
            <div className="section-label">
              Basic Living Skills <span className="req">30 min/day required</span>
            </div>
            <div className="frow">
              <div className="ffield">
                <label>
                  Start Time <span className="star">*</span>
                </label>
                <input
                  type="text"
                  placeholder="08:00 AM"
                  value={draft.start}
                  onChange={(e) => updateField("start", e.target.value)}
                />
              </div>
              <div className="ffield">
                <label>
                  Stop Time <span className="star">*</span>
                </label>
                <input
                  type="text"
                  placeholder="08:30 AM"
                  value={draft.stop}
                  onChange={(e) => updateField("stop", e.target.value)}
                />
              </div>
              <div className="ffield">
                <label>Total Minutes</label>
                <input
                  type="text"
                  className="mono"
                  value={draft.minutes}
                  readOnly
                  style={{ background: "var(--surface-sunken)" }}
                />
              </div>
              <div className="ffield">
                <label>
                  Skill Area <span className="star">*</span>
                </label>
                <select value={draft.skill} onChange={(e) => updateField("skill", e.target.value)}>
                  {SKILL_AREAS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {duration > 0 ? (
              <div className={`compliance ${compliant ? "ok" : "low"}`}>
                {compliant ? <CheckIcon size={15} /> : <WarningIcon size={15} />}
                <span className="big">{duration} min</span> logged —{" "}
                {compliant
                  ? "meets the 30-minute daily minimum."
                  : `below the 30-minute minimum required for compliance (need ${30 - duration} more minutes).`}
              </div>
            ) : null}

            <div className="frow" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="ffield">
                <label>
                  Method of Teaching <span className="star">*</span>
                </label>
                <select value={draft.method} onChange={(e) => updateField("method", e.target.value)}>
                  {TEACHING_METHODS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="ffield">
                <label>
                  Child Performance <span className="star">*</span>
                </label>
                <select value={draft.performance} onChange={(e) => updateField("performance", e.target.value)}>
                  <option value="" disabled>
                    Select...
                  </option>
                  {PERFORMANCE_LEVELS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="ffield" style={{ marginBottom: 0 }}>
              <label>
                Daily Notes <span className="star">*</span>
              </label>
              <textarea
                maxLength={500}
                placeholder="Describe the activity, behavior, and outcome..."
                value={draft.notes}
                onChange={(e) => updateField("notes", e.target.value)}
              />
              <div className="char-count">{draft.notes.length}/500</div>
            </div>
          </>
        ) : (
          <>
            <div className="section-label">Respite Caregiver Summary</div>
            <div className="ffield">
              <label>Caregiver Notes</label>
              <textarea
                placeholder="Respite caregiver completes this section separately..."
                value={draft.notes}
                onChange={(e) => updateField("notes", e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      <div className="form-foot">
        <div className="hint">Last saved just now</div>
        <div className="foot-actions">
          <button className="btn btn-ghost" onClick={handleDraft} type="button">
            Save as Draft
          </button>
          <button className="btn btn-primary" onClick={handleFinish} type="button">
            <CheckIcon /> Save {DAY_NAMES[dayIndex]} Log
          </button>
        </div>
      </div>
    </div>
  );
}

export function WeekEndSection({ child, onSubmit }: { child: Child; onSubmit?: () => void }) {
  const { showToast } = useToast();
  const [parentSigned, setParentSigned] = useState<string | null>(null);

  function sign() {
    const now = new Date();
    const ts = now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    setParentSigned(ts);
    showToast("Signature captured and locked to this document version");
  }

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="form-head">
        <div className="ttl">
          <div className="ic">
            <SignIcon />
          </div>
          <div>
            <h3>End of Week Summary &amp; Signature</h3>
            <div className="desc">Complete after all 7 days are logged for {child.name.split(" ")[0]}.</div>
          </div>
        </div>
      </div>
      <div className="form-body">
        <div className="ffield" style={{ marginBottom: 20 }}>
          <label>Weekly Summary Notes</label>
          <textarea placeholder="Overall progress, concerns, or highlights for the week..." />
        </div>
        <div className="divider" />
        <div className="frow" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="ffield">
            <label>
              Foster Parent Signature <span className="star">*</span>
            </label>
            {parentSigned ? (
              <div className="sig-pad signed">
                ✓ Jessica Smith <span className="ts">Signed {parentSigned}</span>
              </div>
            ) : (
              <div className="sig-pad" onClick={sign}>
                Click to sign — Jessica Smith
              </div>
            )}
          </div>
          <div className="ffield">
            <label>Therapist Signature</label>
            <div className="sig-pad" style={{ cursor: "not-allowed", opacity: 0.6 }}>
              Awaiting parent signature
            </div>
          </div>
        </div>
      </div>
      <div className="form-foot">
        <div className="hint">
          Status will change to <b>Awaiting Therapist Review</b> once signed.
        </div>
        <div className="foot-actions">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              if (onSubmit) {
                onSubmit();
              } else {
                showToast("Weekly report submitted — status: Awaiting Therapist Review");
              }
            }}
          >
            Submit Weekly Report
          </button>
        </div>
      </div>
    </div>
  );
}
