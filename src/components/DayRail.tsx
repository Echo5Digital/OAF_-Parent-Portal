import { DAY_NAMES, DAY_DATES, type DailyLogEntry } from "../data/model";

type DayRailProps = {
  days: DailyLogEntry[];
  activeDay: number;
  onSelect: (index: number) => void;
};

const STATUS_LABEL: Record<DailyLogEntry["status"], string> = {
  complete: "Complete",
  progress: "In Progress",
  empty: "Not Started",
};

export function DayRail({ days, activeDay, onSelect }: DayRailProps) {
  const complete = days.filter((d) => d.status === "complete").length;
  const pct = (complete / days.length) * 100;

  return (
    <>
      <div className="week-bar">
        <div className="label">
          Reporting week: <span className="mono">Oct 7 – Oct 13, 2024</span>
        </div>
        <div className="progress-wrap">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="progress-txt">
            {complete}/{days.length} days
          </div>
        </div>
      </div>

      <div className="day-rail">
        {days.map((d, i) => (
          <div key={i} className={`day-tab${i === activeDay ? " active" : ""}`} onClick={() => onSelect(i)}>
            <span className="dname">{DAY_NAMES[i]}</span>
            <span className="ddate">{DAY_DATES[i]}</span>
            <span className={`dstat ${d.status}`}>{STATUS_LABEL[d.status]}</span>
          </div>
        ))}
      </div>
    </>
  );
}
