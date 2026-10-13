import { useEffect, useRef, useState } from "react";
import {
  BEHAVIOR_CHECKLIST_OPTIONS,
  BEHAVIOR_MANAGED_USING,
  CHILD_RESPONSE_OPTIONS,
  COMPLETION_LEVELS,
  DAY_NAMES,
  SKILL_AREAS,
  SOCIAL_SKILL_AREAS,
  TEACHING_METHODS,
  WORKBOOKS,
  parseTime,
  type Child,
  type DailyLogEntry,
  type SkillActivity,
} from "../data/model";
import { CheckIcon, SignIcon, WarningIcon } from "./Icons";
import { useToast } from "./Toast";
import { TimeInput } from "./TimeInput";
import { SignatureField } from "./SignatureField";

type SaveState = "saved" | "saving";

type DailyLogFormProps = {
  child: Child;
  dayIndex: number;
  entry: DailyLogEntry;
  onChange: (next: DailyLogEntry) => void;
  onComplete: () => void;
};

function recalcMinutes(activity: SkillActivity): SkillActivity {
  const a = parseTime(activity.start);
  const b = parseTime(activity.stop);
  if (a !== null && b !== null && b > a) {
    return { ...activity, minutes: b - a };
  }
  return activity;
}

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/**
 * One timed skill block, used for both "Basic Living Skills (30 min required)"
 * and "Social Skills (60 min required)" — same question set, different skill
 * options and minimum, per the real Jotform structure.
 */
function SkillActivitySection({
  title,
  requiredMinutes,
  skillOptions,
  activity,
  onChange,
}: {
  title: string;
  requiredMinutes: number;
  skillOptions: readonly string[];
  activity: SkillActivity;
  onChange: (next: SkillActivity) => void;
}) {
  function update<K extends keyof SkillActivity>(key: K, value: SkillActivity[K]) {
    let next = { ...activity, [key]: value };
    if (key === "start" || key === "stop") next = recalcMinutes(next);
    onChange(next);
  }

  const duration = typeof activity.minutes === "number" ? activity.minutes : 0;
  const compliant = duration >= requiredMinutes;

  return (
    <>
      <div className="section-label">
        {title} <span className="req">{requiredMinutes} min/day required</span>
      </div>
      <div className="frow">
        <div className="ffield">
          <label>
            Start Time <span className="star">*</span>
          </label>
          <TimeInput value={activity.start} onChange={(v) => update("start", v)} />
        </div>
        <div className="ffield">
          <label>
            Stop Time <span className="star">*</span>
          </label>
          <TimeInput value={activity.stop} onChange={(v) => update("stop", v)} />
        </div>
        <div className="ffield">
          <label>Tot Min</label>
          <input type="text" className="mono" value={activity.minutes} readOnly style={{ background: "var(--surface-sunken)" }} />
        </div>
        <div className="ffield">
          <label>Message</label>
          <input
            type="text"
            className="mono"
            readOnly
            style={{ background: "var(--surface-sunken)" }}
            value={duration === 0 ? "" : compliant ? "In Compliance" : "Not In Compliance"}
          />
        </div>
      </div>

      {duration > 0 ? (
        <div className={`compliance ${compliant ? "ok" : "low"}`}>
          {compliant ? <CheckIcon size={15} /> : <WarningIcon size={15} />}
          <span className="big">{duration} min</span> logged —{" "}
          {compliant
            ? `meets the ${requiredMinutes}-minute daily minimum.`
            : `below the ${requiredMinutes}-minute minimum required for compliance (need ${requiredMinutes - duration} more minutes).`}
        </div>
      ) : null}

      <div className="ffield">
        <label>
          What skill did you work on? <span className="star">*</span>
        </label>
        <div className="checkbox-grid">
          {skillOptions.map((s) => (
            <label key={s} className="checkbox-opt">
              <input type="checkbox" checked={activity.skills.includes(s)} onChange={() => update("skills", toggleInList(activity.skills, s))} />
              {s}
            </label>
          ))}
        </div>
        {activity.skills.includes("Other") ? (
          <input
            type="text"
            placeholder="Please type another option here"
            value={activity.otherSkill}
            onChange={(e) => update("otherSkill", e.target.value)}
          />
        ) : null}
      </div>

      <div className="ffield">
        <label>
          How did you work on skill today? <span className="star">*</span>
        </label>
        <div className="radio-row">
          {TEACHING_METHODS.map((m) => (
            <label key={m} className="radio-opt">
              <input type="radio" name={`${title}-method`} checked={activity.method === m} onChange={() => update("method", m)} />
              {m}
            </label>
          ))}
        </div>
        {activity.method === "Other" ? (
          <input
            type="text"
            placeholder="Please type another option here"
            value={activity.otherMethod}
            onChange={(e) => update("otherMethod", e.target.value)}
          />
        ) : null}
      </div>

      <div className="ffield">
        <label>
          How did the child complete the skill? <span className="star">*</span>
        </label>
        <div className="radio-row">
          {COMPLETION_LEVELS.map((c) => (
            <label key={c} className="radio-opt">
              <input type="radio" name={`${title}-completion`} checked={activity.completion === c} onChange={() => update("completion", c)} />
              {c}
            </label>
          ))}
        </div>
        {activity.completion === "Other" ? (
          <input
            type="text"
            placeholder="Please type another option here"
            value={activity.otherCompletion}
            onChange={(e) => update("otherCompletion", e.target.value)}
          />
        ) : null}
      </div>

      <div className="ffield" style={{ marginBottom: 0 }}>
        <label>
          How did child respond? <span className="star">*</span>
        </label>
        <div className="radio-row">
          {CHILD_RESPONSE_OPTIONS.map((r) => (
            <label key={r} className="radio-opt">
              <input type="radio" name={`${title}-response`} checked={activity.response === r} onChange={() => update("response", r)} />
              {r}
            </label>
          ))}
        </div>
        {activity.response === "Other" ? (
          <input
            type="text"
            placeholder="Please type another option here"
            value={activity.otherResponse}
            onChange={(e) => update("otherResponse", e.target.value)}
          />
        ) : null}
      </div>
    </>
  );
}

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
      onChange(next.status === "complete" ? next : { ...next, status: isStarted(next) ? "progress" : "empty" });
      setSaveState("saved");
    }, 600);
  }

  function isStarted(e: DailyLogEntry): boolean {
    return Boolean(e.dayRequired || e.respite || e.basicLivingSkills.start || e.describeWhatHappened);
  }

  function update<K extends keyof DailyLogEntry>(key: K, value: DailyLogEntry[K]) {
    scheduleSave({ ...draft, [key]: value });
  }

  function requiredFieldsComplete(e: DailyLogEntry): boolean {
    if (!e.dayRequired) return false;
    if (e.dayRequired === "No") return true;
    if (!e.respite) return false;
    if (e.respite === "Yes") {
      return Boolean(e.respiteWithOafcParent && e.parentSignature && e.signatureDate);
    }
    const bls = e.basicLivingSkills;
    const social = e.socialSkills;
    return Boolean(
      bls.start &&
        bls.stop &&
        bls.skills.length > 0 &&
        bls.method &&
        bls.completion &&
        bls.response &&
        e.itfc &&
        e.describeWhatHappened &&
        e.importantEvents &&
        e.behaviorManagedUsing.length > 0 &&
        social.start &&
        social.stop &&
        social.skills.length > 0 &&
        social.method &&
        social.completion &&
        e.socialSkillsDescribeWhatHappened &&
        e.behaviorChecklist.length > 0 &&
        e.parentSignature &&
        e.signatureDate,
    );
  }

  function handleFinish() {
    if (!requiredFieldsComplete(draft)) {
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

  const isRespiteDay = draft.respite === "Yes";

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
            <div className="k">Client/Child Name</div>
            <div className="v">{child.name}</div>
            <div className="v-sub">Age {child.age}</div>
          </div>
        </div>
        <div className="meta-cell">
          <img className="meta-icon" src="/icon-calendar.png" alt="" />
          <div>
            <div className="k">Entry Date</div>
            <div className="v mono">Oct 7 – Oct 13, 2024</div>
          </div>
        </div>
        <div className="meta-cell">
          <img className="meta-icon" src="/icon-therapist.png" alt="" />
          <div>
            <div className="k">OAFC Staff</div>
            <div className="v">{child.therapist}</div>
          </div>
        </div>
      </div>

      <div className="form-body">
        <div className="ffield">
          <label>
            Is {DAY_NAMES[dayIndex]} Required? <span className="star">*</span>
          </label>
          <div className="radio-row">
            <label className="radio-opt">
              <input type="radio" name="dayRequired" checked={draft.dayRequired === "Yes"} onChange={() => update("dayRequired", "Yes")} />
              Yes
            </label>
            <label className="radio-opt">
              <input type="radio" name="dayRequired" checked={draft.dayRequired === "No"} onChange={() => update("dayRequired", "No")} />
              No
            </label>
          </div>
        </div>

        {draft.dayRequired === "Yes" ? (
          <div className="ffield">
            <label>
              Did this child have respite this day ({DAY_NAMES[dayIndex]})? <span className="star">*</span>
            </label>
            <div className="radio-row">
              <label className="radio-opt">
                <input type="radio" name="respite" checked={draft.respite === "Yes"} onChange={() => update("respite", "Yes")} />
                Yes
              </label>
              <label className="radio-opt">
                <input type="radio" name="respite" checked={draft.respite === "No"} onChange={() => update("respite", "No")} />
                No
              </label>
            </div>
          </div>
        ) : null}

        {draft.dayRequired === "Yes" && isRespiteDay ? (
          <>
            <div className="ffield">
              <label>
                Was Respite with an OAFC Parent? <span className="star">*</span>
              </label>
              <div className="radio-row">
                <label className="radio-opt">
                  <input
                    type="radio"
                    name="respiteOafc"
                    checked={draft.respiteWithOafcParent === "Yes"}
                    onChange={() => update("respiteWithOafcParent", "Yes")}
                  />
                  Yes
                </label>
                <label className="radio-opt">
                  <input
                    type="radio"
                    name="respiteOafc"
                    checked={draft.respiteWithOafcParent === "No"}
                    onChange={() => update("respiteWithOafcParent", "No")}
                  />
                  No
                </label>
              </div>
            </div>
            <SignatureField
              label="Foster Parent Signature"
              signerName="Jessica Smith"
              signature={draft.parentSignature}
              date={draft.signatureDate}
              onSign={(sig, date) => scheduleSave({ ...draft, parentSignature: sig, signatureDate: date })}
            />
          </>
        ) : draft.dayRequired === "Yes" && draft.respite === "No" ? (
          <>
            <SkillActivitySection
              title="Basic Living Skills"
              requiredMinutes={30}
              skillOptions={SKILL_AREAS}
              activity={draft.basicLivingSkills}
              onChange={(next) => update("basicLivingSkills", next)}
            />

            <div className="ffield">
              <label>
                ITFC Child? <span className="star">*</span>
              </label>
              <div className="radio-row">
                <label className="radio-opt">
                  <input type="radio" name="itfc" checked={draft.itfc === "Yes"} onChange={() => update("itfc", "Yes")} />
                  Yes
                </label>
                <label className="radio-opt">
                  <input type="radio" name="itfc" checked={draft.itfc === "No"} onChange={() => update("itfc", "No")} />
                  No
                </label>
              </div>
            </div>

            {draft.itfc === "Yes" ? (
              <div className="ffield">
                <label>What workbook did the child work on today?</label>
                <div className="radio-row" style={{ flexWrap: "wrap" }}>
                  {WORKBOOKS.map((w) => (
                    <label key={w} className="radio-opt">
                      <input type="radio" name="workbook" checked={draft.workbook === w} onChange={() => update("workbook", w)} />
                      {w}
                    </label>
                  ))}
                </div>
                {draft.workbook === "Other" ? (
                  <input
                    type="text"
                    placeholder="Please type another option here"
                    value={draft.otherWorkbook}
                    onChange={(e) => update("otherWorkbook", e.target.value)}
                  />
                ) : null}
              </div>
            ) : null}

            <div className="ffield">
              <label>
                Describe what happened below: <span className="star">*</span>
              </label>
              <input type="text" value={draft.describeWhatHappened} onChange={(e) => update("describeWhatHappened", e.target.value)} />
            </div>

            <div className="ffield">
              <label>
                Important events that occurred at home/school: <span className="star">*</span>
              </label>
              <input type="text" value={draft.importantEvents} onChange={(e) => update("importantEvents", e.target.value)} />
            </div>

            <div className="ffield">
              <label>
                TFP managed behavior using: <span className="star">*</span>
              </label>
              <div className="checkbox-grid">
                {BEHAVIOR_MANAGED_USING.map((b) => (
                  <label key={b} className="checkbox-opt">
                    <input
                      type="checkbox"
                      checked={draft.behaviorManagedUsing.includes(b)}
                      onChange={() => update("behaviorManagedUsing", toggleInList(draft.behaviorManagedUsing, b))}
                    />
                    {b}
                  </label>
                ))}
              </div>
              {draft.behaviorManagedUsing.includes("Other") ? (
                <input
                  type="text"
                  placeholder="Please type another option here"
                  value={draft.otherBehaviorManaged}
                  onChange={(e) => update("otherBehaviorManaged", e.target.value)}
                />
              ) : null}
            </div>

            <div className="frow" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="ffield">
                <label>Positive Reinforcement — # of Times</label>
                <input
                  type="number"
                  min={0}
                  value={draft.positiveReinforcementCount}
                  onChange={(e) => update("positiveReinforcementCount", e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
              <div className="ffield">
                <label>Time Out/Restrictions — Minutes</label>
                <input
                  type="number"
                  min={0}
                  value={draft.timeOutMinutes}
                  onChange={(e) => update("timeOutMinutes", e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
            </div>

            <SignatureField
              label="Foster Parent Signature"
              signerName="Jessica Smith"
              signature={draft.parentSignature}
              date={draft.signatureDate}
              onSign={(sig, date) => scheduleSave({ ...draft, parentSignature: sig, signatureDate: date })}
            />

            <SkillActivitySection
              title="Social Skills"
              requiredMinutes={60}
              skillOptions={SOCIAL_SKILL_AREAS}
              activity={draft.socialSkills}
              onChange={(next) => update("socialSkills", next)}
            />

            <div className="ffield">
              <label>
                Describe what happened below: <span className="star">*</span>
              </label>
              <input
                type="text"
                value={draft.socialSkillsDescribeWhatHappened}
                onChange={(e) => update("socialSkillsDescribeWhatHappened", e.target.value)}
              />
            </div>

            <div className="ffield" style={{ marginBottom: 0 }}>
              <label>
                Daily Behavioral Checklist — Please check the box of ALL behaviors exhibited today{" "}
                <span className="star">*</span>
              </label>
              <div className="checkbox-grid checkbox-grid-wide">
                {BEHAVIOR_CHECKLIST_OPTIONS.map((b) => (
                  <label key={b} className="checkbox-opt">
                    <input
                      type="checkbox"
                      checked={draft.behaviorChecklist.includes(b)}
                      onChange={() => update("behaviorChecklist", toggleInList(draft.behaviorChecklist, b))}
                    />
                    {b}
                  </label>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="form-foot">
        <div className="hint">Last saved just now</div>
        <div className="foot-actions">
          <button className="btn btn-ghost" onClick={handleDraft} type="button">
            Save and Continue Later
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
    <div className="card">
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
      <div className="isolation-note" style={{ margin: "16px 24px 0" }}>
        <WarningIcon size={16} />
        <div>
          <b>Not yet confirmed against the real form.</b> This page's exact fields haven't been verified from the
          live Jotform — shown here as a placeholder signature flow until Pages 10-11 are confirmed.
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
