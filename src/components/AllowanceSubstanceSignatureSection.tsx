import {
  ALLOWANCE_ROWS,
  IN_HOME_ACTIVITY_OPTIONS,
  SUBSTANCE_ABUSE_TYPES,
  THERAPISTS,
  emptySubstanceAbuseRow,
  type SubstanceAbuseRow,
  type WeekSummary,
} from "../data/model";
import { SignIcon, TrashIcon } from "./Icons";
import { useToast } from "./Toast";
import { TimeInput } from "./TimeInput";
import { DateInput } from "./DateInput";
import { SignatureField } from "./SignatureField";

type AllowanceSubstanceSignatureSectionProps = {
  childName: string;
  summary: WeekSummary;
  onChange: (next: WeekSummary) => void;
  onBack: () => void;
  onSubmit: () => void;
};

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

const BEHAVIOR_SCALE = Array.from({ length: 10 }, (_, i) => i + 1);

/** Page 11 (final page) of the real 11-page Jotform: Allowance, Substance Abuse Education & Prevention, weekly behavior assessment, and both signatures. */
export function AllowanceSubstanceSignatureSection({
  childName,
  summary,
  onChange,
  onBack,
  onSubmit,
}: AllowanceSubstanceSignatureSectionProps) {
  const { showToast } = useToast();

  function update<K extends keyof WeekSummary>(key: K, value: WeekSummary[K]) {
    onChange({ ...summary, [key]: value });
  }

  function updateAllowanceGiven(row: string, amount: number | "") {
    update("allowanceGiven", { ...summary.allowanceGiven, [row]: amount });
  }

  function updateSubstanceAbuseRow(index: number, patch: Partial<SubstanceAbuseRow>) {
    const next = [...summary.substanceAbuseRows];
    next[index] = { ...next[index], ...patch };
    update("substanceAbuseRows", next);
  }

  function addSubstanceAbuseRow() {
    update("substanceAbuseRows", [...summary.substanceAbuseRows, emptySubstanceAbuseRow()]);
  }

  function removeSubstanceAbuseRow(index: number) {
    update(
      "substanceAbuseRows",
      summary.substanceAbuseRows.filter((_, i) => i !== index),
    );
  }

  function selectTherapist(name: string) {
    const therapist = THERAPISTS.find((t) => t.name === name);
    onChange({ ...summary, therapistName: name, therapistEmail: therapist?.email ?? "" });
  }

  return (
    <div className="card">
      <div className="form-head">
        <div className="ttl">
          <div className="ic">
            <SignIcon />
          </div>
          <div>
            <h3>Allowance & Signatures</h3>
            <div className="desc">Allowance, substance abuse education, weekly assessment, and signatures for {childName.split(" ")[0]}.</div>
          </div>
        </div>
      </div>

      <div className="form-body">
        <div className="ffield">
          <label>
            Allowance (Mandatory) <span className="star">*</span>
          </label>
          <div className="radio-row">
            <label className="radio-opt">
              <input type="radio" name="allowance" checked={summary.allowance === "N/A"} onChange={() => update("allowance", "N/A")} />
              N/A
            </label>
            <label className="radio-opt">
              <input
                type="radio"
                name="allowance"
                checked={summary.allowance === "Required"}
                onChange={() => update("allowance", "Required")}
              />
              Required
            </label>
          </div>
        </div>

        {summary.allowance === "Required" ? (
          <>
            <div className="ffield">
              <label>
                Allowance Deduction (if a portion of allowance was deducted for punishment, this must be discussed with and approved by
                the Therapist prior to deduction)
              </label>
              <input type="text" value={summary.allowanceDeduction} onChange={(e) => update("allowanceDeduction", e.target.value)} />
            </div>

            <div className="ffield">
              <label>
                Allowance Given On: <span className="star">*</span>
              </label>
              <div className="table-scroll">
                <table className="data">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Amount Given</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ALLOWANCE_ROWS.map((row) => (
                      <tr key={row}>
                        <td>{row}</td>
                        <td style={{ maxWidth: 120 }}>
                          <input
                            type="number"
                            min={0}
                            value={summary.allowanceGiven[row] ?? ""}
                            onChange={(e) => updateAllowanceGiven(row, e.target.value === "" ? "" : Number(e.target.value))}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}

        <div className="ffield">
          <label>
            Substance Abuse Education & Prevention (Must be 2 hours every 60 days) <span className="star">*</span>
          </label>
          <div className="radio-row">
            <label className="radio-opt">
              <input
                type="radio"
                name="substanceAbuseEducation"
                checked={summary.substanceAbuseEducation === "N/A"}
                onChange={() => update("substanceAbuseEducation", "N/A")}
              />
              N/A
            </label>
            <label className="radio-opt">
              <input
                type="radio"
                name="substanceAbuseEducation"
                checked={summary.substanceAbuseEducation === "Required"}
                onChange={() => update("substanceAbuseEducation", "Required")}
              />
              Required
            </label>
          </div>
        </div>

        {summary.substanceAbuseEducation === "Required" ? (
          <div className="ffield">
            <label>Substance Abuse Education & Prevention (Must be 2 hours every 60 days)</label>
            {summary.substanceAbuseRows.map((row, i) => (
              <div key={i} className="frow" style={{ gridTemplateColumns: "1.2fr 1fr 1fr auto", alignItems: "end" }}>
                <div className="ffield" style={{ marginBottom: 0 }}>
                  <label>Date</label>
                  <DateInput value={row.date} onChange={(v) => updateSubstanceAbuseRow(i, { date: v })} />
                </div>
                <div className="ffield" style={{ marginBottom: 0 }}>
                  <label>Start Time</label>
                  <TimeInput value={row.startTime} onChange={(v) => updateSubstanceAbuseRow(i, { startTime: v })} />
                </div>
                <div className="ffield" style={{ marginBottom: 0 }}>
                  <label>End Time</label>
                  <TimeInput value={row.endTime} onChange={(v) => updateSubstanceAbuseRow(i, { endTime: v })} />
                </div>
                {summary.substanceAbuseRows.length > 1 ? (
                  <button
                    className="btn btn-ghost btn-icon-only"
                    type="button"
                    style={{ position: "static" }}
                    onClick={() => removeSubstanceAbuseRow(i)}
                    aria-label="Remove row"
                  >
                    <TrashIcon />
                  </button>
                ) : null}
              </div>
            ))}
            <button className="btn btn-ghost" type="button" onClick={addSubstanceAbuseRow}>
              + Add Row
            </button>
          </div>
        ) : null}

        <div className="ffield">
          <label>
            Please indicate the type of substance abuse education/prevention you provided: <span className="star">*</span>
          </label>
          <div className="checkbox-grid">
            {SUBSTANCE_ABUSE_TYPES.map((t) => (
              <label key={t} className="checkbox-opt">
                <input
                  type="checkbox"
                  checked={summary.substanceAbuseTypes.includes(t)}
                  onChange={() => update("substanceAbuseTypes", toggleInList(summary.substanceAbuseTypes, t))}
                />
                {t}
              </label>
            ))}
          </div>
        </div>

        <div className="ffield">
          <label>
            In home activities for substance abuse education/prevention from the treatment plan: <span className="star">*</span>
          </label>
          <div className="checkbox-grid">
            {IN_HOME_ACTIVITY_OPTIONS.map((o) => (
              <label key={o} className="checkbox-opt">
                <input
                  type="checkbox"
                  checked={summary.inHomeActivities.includes(o)}
                  onChange={() => update("inHomeActivities", toggleInList(summary.inHomeActivities, o))}
                />
                {o}
              </label>
            ))}
          </div>
          {summary.inHomeActivities.includes("Other") ? (
            <input
              type="text"
              placeholder="Please type another option here"
              value={summary.otherInHomeActivity}
              onChange={(e) => update("otherInHomeActivity", e.target.value)}
            />
          ) : null}
        </div>

        <div className="ffield">
          <label>
            Assesment of child's behavior for the entire week From 1 Negative through 10 positive - check one box{" "}
            <span className="star">*</span>
          </label>
          <div className="checkbox-grid">
            {BEHAVIOR_SCALE.map((n) => (
              <label key={n} className="checkbox-opt">
                <input
                  type="checkbox"
                  checked={summary.weeklyBehaviorAssessment === n}
                  onChange={() => update("weeklyBehaviorAssessment", summary.weeklyBehaviorAssessment === n ? "" : n)}
                />
                {n}
              </label>
            ))}
          </div>
        </div>

        <SignatureField
          label="Foster Parent Signature"
          signerName="Jessica Smith"
          signature={summary.parentSignature}
          date={summary.parentSignatureDate}
          onSign={(sig, date) => onChange({ ...summary, parentSignature: sig, parentSignatureDate: date })}
        />

        <div className="section-label">Other Healthcare Providers</div>

        <div className="frow" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="ffield">
            <label>
              Therapist Name <span className="star">*</span>
            </label>
            <select value={summary.therapistName} onChange={(e) => selectTherapist(e.target.value)}>
              <option value="">Please Select</option>
              {THERAPISTS.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="ffield">
            <label>Therapist Email</label>
            <input type="email" readOnly value={summary.therapistEmail} style={{ background: "var(--surface-sunken)" }} />
          </div>
        </div>

        <SignatureField
          label="Therapist Signature"
          signerName={summary.therapistName || "Therapist"}
          signature={summary.therapistSignature}
          date={summary.therapistSignatureDate}
          onSign={(sig, date) => onChange({ ...summary, therapistSignature: sig, therapistSignatureDate: date })}
          required={false}
        />

        <div className="ffield" style={{ marginBottom: 0, maxWidth: 260 }}>
          <label>Therapist Review Time</label>
          <TimeInput value={summary.therapistReviewTime} onChange={(v) => update("therapistReviewTime", v)} />
        </div>
      </div>

      <div className="conditional-box" style={{ margin: "0 24px 20px" }}>
        <b>Form Submittal</b>
        <div style={{ fontSize: "12.5px", color: "var(--ink-soft)", marginTop: 4 }}>
          Click on "Print" for a hard copy; click on "Save and Continue Later" to "pause" the form completion; you will be sent an email
          with a link to continue filling out the form when ready; click on "Submit" when all required information has been entered
          including all required signatures.
        </div>
      </div>

      <div className="form-foot">
        <button className="btn btn-ghost" type="button" onClick={onBack}>
          Back 1 Page
        </button>
        <div className="foot-actions">
          <button className="btn btn-ghost" type="button" onClick={() => window.print()}>
            Print
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              onChange(summary);
              showToast("Draft saved — resume anytime");
            }}
          >
            Save and Continue Later
          </button>
          <button className="btn btn-primary" type="button" onClick={onSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
