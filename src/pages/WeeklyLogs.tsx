import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { HeartIcon } from "../components/Icons";
import { parentNavItems } from "../components/parentNav";
import { CHILDREN, useParentData } from "../lib/ParentDataContext";

const PARENT_PHOTO = "https://i.pravatar.cc/80?img=32";

function statusFor(complete: number, inProgress: number): { label: string; cls: string } {
  if (complete === 7) return { label: "Awaiting Signature", cls: "pending" };
  if (complete > 0 || inProgress > 0) return { label: "In Progress", cls: "pending" };
  return { label: "Not Started", cls: "correction" };
}

export function WeeklyLogs() {
  const { store, setCurrentChildId } = useParentData();
  const navigate = useNavigate();

  function resume(childId: string) {
    setCurrentChildId(childId);
    navigate("/parent/weekly-log");
  }

  return (
    <AppShell
      userName="Jessica Smith"
      userRole="Foster Parent"
      userInitials="JS"
      userPhoto={PARENT_PHOTO}
      hasNotification
      pageTitle="Weekly Logs"
      navItems={parentNavItems(2)}
      footer={
        <>
          <HeartIcon />
          <div className="footer-tagline">
            Stronger Children
            <br />
            Brighter Tomorrows
          </div>
        </>
      }
    >
      <div className="page-head">
        <h1>Weekly Logs</h1>
        <p>Reporting week: Oct 7 – Oct 13, 2024. Each child's log is independent — resume any of them anytime.</p>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Child</th>
                <th>Days Complete</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {CHILDREN.map((c) => {
                const days = store[c.id].days;
                const complete = days.filter((d) => d.status === "complete").length;
                const inProgress = days.filter((d) => d.status === "progress").length;
                const { label, cls } = statusFor(complete, inProgress);
                return (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{complete}/7</td>
                    <td>
                      <span className={`pill ${cls}`}>{label}</span>
                    </td>
                    <td>
                      <span className="link" onClick={() => resume(c.id)}>
                        {complete === 0 ? "Start" : complete === 7 ? "Review" : "Resume"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
