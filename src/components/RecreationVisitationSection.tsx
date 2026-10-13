import { RECREATIONAL_ACTIVITIES, VISITATION_METHODS, VISITOR_TYPES, type WeekSummary } from "../data/model";
import { ResourcesIcon } from "./Icons";
import { useToast } from "./Toast";

type RecreationVisitationSectionProps = {
  childName: string;
  summary: WeekSummary;
  onChange: (next: WeekSummary) => void;
  onBack: () => void;
  onNext: () => void;
};

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Page 8 of the real 11-page Jotform: Recreational Activities + Visitor/Visitation Method, nothing else. */
export function RecreationVisitationSection({ childName, summary, onChange, onBack, onNext }: RecreationVisitationSectionProps) {
  const { showToast } = useToast();

  function update<K extends keyof WeekSummary>(key: K, value: WeekSummary[K]) {
    onChange({ ...summary, [key]: value });
  }

  function updateVisitor(visitorType: string, patch: Partial<WeekSummary["visitors"][string]>) {
    update("visitors", { ...summary.visitors, [visitorType]: { ...summary.visitors[visitorType], ...patch } });
  }

  return (
    <div className="card">
      <div className="form-head">
        <div className="ttl">
          <div className="ic">
            <ResourcesIcon />
          </div>
          <div>
            <h3>Recreation & Visitation</h3>
            <div className="desc">Recreational activities and visitation for {childName.split(" ")[0]} this week.</div>
          </div>
        </div>
      </div>

      <div className="form-body">
        <div className="ffield">
          <label>Recreational Activities (Based on Child's Talent, Hobbies and Chosen Interests)</label>
          <div className="checkbox-grid">
            {RECREATIONAL_ACTIVITIES.map((a) => (
              <label key={a} className="checkbox-opt">
                <input
                  type="checkbox"
                  checked={summary.recreationalActivities.includes(a)}
                  onChange={() => update("recreationalActivities", toggleInList(summary.recreationalActivities, a))}
                />
                {a}
              </label>
            ))}
          </div>
          {summary.recreationalActivities.includes("Other") ? (
            <input
              type="text"
              placeholder="Please type another option here"
              value={summary.otherRecreationalActivity}
              onChange={(e) => update("otherRecreationalActivity", e.target.value)}
            />
          ) : null}
        </div>

        <div className="section-label">Visitor and Visitation Method</div>
        <div className="table-scroll">
          <table className="data visitation-table">
            <thead>
              <tr>
                <th>Visitor Name</th>
                {VISITATION_METHODS.map((m) => (
                  <th key={m}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VISITOR_TYPES.map((v) => (
                <tr key={v}>
                  <td>
                    <div className="visitor-label">{v}</div>
                    <input
                      type="text"
                      value={summary.visitors[v]?.visitorName ?? ""}
                      onChange={(e) => updateVisitor(v, { visitorName: e.target.value })}
                    />
                  </td>
                  {VISITATION_METHODS.map((m) => (
                    <td key={m} style={{ textAlign: "center" }}>
                      <input
                        type="radio"
                        name={`visitor-${v}`}
                        checked={summary.visitors[v]?.method === m}
                        onChange={() => updateVisitor(v, { method: m })}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
