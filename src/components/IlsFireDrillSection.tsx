import {
  ILS_ACTIVITIES,
  LIFE_BOOK_OPTIONS,
  TEACHING_METHODS,
  COMPLETION_LEVELS,
  emptyFireDrillRow,
  type FireDrillRow,
  type WeekSummary,
} from "../data/model";
import { ResourcesIcon, TrashIcon } from "./Icons";
import { useToast } from "./Toast";
import { DateInput } from "./DateInput";

type IlsFireDrillSectionProps = {
  childName: string;
  summary: WeekSummary;
  onChange: (next: WeekSummary) => void;
  onBack: () => void;
  onNext: () => void;
};

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Page 10 of the real 11-page Jotform: Independent Living Skills + Fire Drill + Life Book. */
export function IlsFireDrillSection({ childName, summary, onChange, onBack, onNext }: IlsFireDrillSectionProps) {
  const { showToast } = useToast();

  function update<K extends keyof WeekSummary>(key: K, value: WeekSummary[K]) {
    onChange({ ...summary, [key]: value });
  }

  function updateIlsDuration(activity: string, minutes: number | "") {
    update("ilsDurations", { ...summary.ilsDurations, [activity]: minutes });
  }

  function updateFireDrillRow(index: number, patch: Partial<FireDrillRow>) {
    const next = [...summary.fireDrillRows];
    next[index] = { ...next[index], ...patch };
    update("fireDrillRows", next);
  }

  function addFireDrillRow() {
    update("fireDrillRows", [...summary.fireDrillRows, emptyFireDrillRow()]);
  }

  function removeFireDrillRow(index: number) {
    update(
      "fireDrillRows",
      summary.fireDrillRows.filter((_, i) => i !== index),
    );
  }

  return (
    <div className="card">
      <div className="form-head">
        <div className="ttl">
          <div className="ic">
            <ResourcesIcon />
          </div>
          <div>
            <h3>ILS & Fire Drill</h3>
            <div className="desc">Independent living skills, fire drill, and life book for {childName.split(" ")[0]} this week.</div>
          </div>
        </div>
      </div>

      <div className="form-body">
        <div className="ffield">
          <label>Independent Living Skills</label>
          <div className="radio-row">
            <label className="radio-opt">
              <input
                type="radio"
                name="ils"
                checked={summary.independentLivingSkills === "N/A"}
                onChange={() => update("independentLivingSkills", "N/A")}
              />
              N/A
            </label>
            <label className="radio-opt">
              <input
                type="radio"
                name="ils"
                checked={summary.independentLivingSkills === "Required"}
                onChange={() => update("independentLivingSkills", "Required")}
              />
              Required
            </label>
          </div>
        </div>

        {summary.independentLivingSkills === "Required" ? (
          <>
            <div className="ffield">
              <label>
                Independent Living Skills (ILS) Activities (14 years and older) <span className="star">*</span>
              </label>
              <div className="table-scroll">
                <table className="data">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Duration in Minutes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ILS_ACTIVITIES.map((activity) => (
                      <tr key={activity}>
                        <td>{activity}</td>
                        <td style={{ maxWidth: 120 }}>
                          <input
                            type="number"
                            min={0}
                            value={summary.ilsDurations[activity] ?? ""}
                            onChange={(e) => updateIlsDuration(activity, e.target.value === "" ? "" : Number(e.target.value))}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="ffield">
              <label>
                How did you work on skill today? <span className="star">*</span>
              </label>
              <div className="radio-row">
                {TEACHING_METHODS.map((m) => (
                  <label key={m} className="radio-opt">
                    <input type="radio" name="ilsMethod" checked={summary.ilsMethod === m} onChange={() => update("ilsMethod", m)} />
                    {m}
                  </label>
                ))}
              </div>
              {summary.ilsMethod === "Other" ? (
                <input
                  type="text"
                  placeholder="Please type another option here"
                  value={summary.ilsOtherMethod}
                  onChange={(e) => update("ilsOtherMethod", e.target.value)}
                />
              ) : null}
            </div>

            <div className="ffield">
              <label>
                Skill Completed: <span className="star">*</span>
              </label>
              <div className="radio-row">
                {COMPLETION_LEVELS.map((c) => (
                  <label key={c} className="radio-opt">
                    <input
                      type="radio"
                      name="ilsCompletion"
                      checked={summary.ilsCompletion === c}
                      onChange={() => update("ilsCompletion", c)}
                    />
                    {c}
                  </label>
                ))}
              </div>
              {summary.ilsCompletion === "Other" ? (
                <input
                  type="text"
                  placeholder="Please type another option here"
                  value={summary.ilsOtherCompletion}
                  onChange={(e) => update("ilsOtherCompletion", e.target.value)}
                />
              ) : null}
            </div>

            <div className="ffield">
              <label>Unsupervised Time (Check with therapist to see if your child has been approved for unsupervised time)</label>
              <div className="table-scroll">
                <table className="data">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Number of Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Amount of Unsupervised Time</td>
                      <td style={{ maxWidth: 120 }}>
                        <input
                          type="number"
                          min={0}
                          value={summary.ilsUnsupervisedHours}
                          onChange={(e) => update("ilsUnsupervisedHours", e.target.value === "" ? "" : Number(e.target.value))}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="ffield">
              <label>Activities/Reason</label>
              <input type="text" value={summary.ilsActivitiesReason} onChange={(e) => update("ilsActivitiesReason", e.target.value)} />
            </div>
          </>
        ) : null}

        <div className="ffield">
          <label>Fire Drill</label>
          <div className="radio-row">
            <label className="radio-opt">
              <input type="radio" name="fireDrill" checked={summary.fireDrill === "N/A"} onChange={() => update("fireDrill", "N/A")} />
              N/A
            </label>
            <label className="radio-opt">
              <input
                type="radio"
                name="fireDrill"
                checked={summary.fireDrill === "Required"}
                onChange={() => update("fireDrill", "Required")}
              />
              Required
            </label>
          </div>
        </div>

        {summary.fireDrill === "Required" ? (
          <div className="ffield">
            <label>Fire Drill Completed - (Must be done every 90 days)</label>
            {summary.fireDrillRows.map((row, i) => (
              <div key={i} className="frow" style={{ gridTemplateColumns: "1fr 1fr 1.6fr auto", alignItems: "end" }}>
                <div className="ffield" style={{ marginBottom: 0 }}>
                  <label>Date</label>
                  <DateInput value={row.date} onChange={(v) => updateFireDrillRow(i, { date: v })} />
                </div>
                <div className="ffield" style={{ marginBottom: 0 }}>
                  <label>Minutes to Evacuate</label>
                  <input
                    type="number"
                    min={0}
                    value={row.minutesToEvacuate}
                    onChange={(e) => updateFireDrillRow(i, { minutesToEvacuate: e.target.value === "" ? "" : Number(e.target.value) })}
                  />
                </div>
                <div className="ffield" style={{ marginBottom: 0 }}>
                  <label>Comments</label>
                  <textarea
                    style={{ minHeight: 40 }}
                    value={row.comments}
                    onChange={(e) => updateFireDrillRow(i, { comments: e.target.value })}
                  />
                </div>
                {summary.fireDrillRows.length > 1 ? (
                  <button
                    className="btn btn-ghost btn-icon-only"
                    type="button"
                    style={{ position: "static" }}
                    onClick={() => removeFireDrillRow(i)}
                    aria-label="Remove fire drill row"
                  >
                    <TrashIcon />
                  </button>
                ) : null}
              </div>
            ))}
            <button className="btn btn-ghost" type="button" onClick={addFireDrillRow}>
              + Add Row
            </button>
          </div>
        ) : null}

        <div className="ffield" style={{ marginBottom: 0 }}>
          <label>Life Book</label>
          <div className="checkbox-grid">
            {LIFE_BOOK_OPTIONS.map((o) => (
              <label key={o} className="checkbox-opt">
                <input type="checkbox" checked={summary.lifeBook.includes(o)} onChange={() => update("lifeBook", toggleInList(summary.lifeBook, o))} />
                {o}
              </label>
            ))}
          </div>
          {summary.lifeBook.includes("Other") ? (
            <input
              type="text"
              placeholder="Please type another option here"
              value={summary.otherLifeBook}
              onChange={(e) => update("otherLifeBook", e.target.value)}
            />
          ) : null}
        </div>
      </div>

      <div className="form-foot">
        <button className="btn btn-ghost" type="button" onClick={onBack}>
          Back 1 Page
        </button>
        <div className="foot-actions">
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
          <button className="btn btn-primary" type="button" onClick={onNext}>
            Next Page
          </button>
        </div>
      </div>
    </div>
  );
}
