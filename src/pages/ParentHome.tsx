import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { HeartIcon, AlertCircleIcon, CheckIcon } from "../components/Icons";
import { parentNavItems } from "../components/parentNav";
import { CHILDREN, useParentData } from "../lib/ParentDataContext";

const PARENT_PHOTO = "https://i.pravatar.cc/80?img=32";

export function ParentHome() {
  const { store, setCurrentChildId } = useParentData();
  const navigate = useNavigate();

  function goToChild(childId: string) {
    setCurrentChildId(childId);
    navigate("/parent/weekly-log");
  }

  const totalComplete = CHILDREN.reduce(
    (sum, c) => sum + store[c.id].days.filter((d) => d.status === "complete").length,
    0,
  );
  const totalDays = CHILDREN.length * 7;
  const needsAttention = CHILDREN.filter((c) => store[c.id].days.every((d) => d.status === "empty"));

  return (
    <AppShell
      userName="Jessica Smith"
      userRole="Foster Parent"
      userInitials="JS"
      userPhoto={PARENT_PHOTO}
      hasNotification
      pageTitle="Home"
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
        <h1>Welcome back, Jessica</h1>
        <p>
          {totalComplete} of {totalDays} days logged this week across {CHILDREN.length} children.
        </p>
      </div>

      {needsAttention.length > 0 ? (
        <div className="isolation-note">
          <AlertCircleIcon />
          <div>
            <b>
              {needsAttention.map((c) => c.name.split(" ")[0]).join(" and ")} {needsAttention.length === 1 ? "has" : "have"}{" "}
              no days logged yet this week.
            </b>{" "}
            Click a card below to get started.
          </div>
        </div>
      ) : null}

      <div className="child-overview-grid">
        {CHILDREN.map((c) => {
          const week = store[c.id];
          const complete = week.days.filter((d) => d.status === "complete").length;
          const inProgress = week.days.filter((d) => d.status === "progress").length;
          return (
            <button key={c.id} className="child-overview-card" onClick={() => goToChild(c.id)} type="button">
              <img className="pic" src={c.photo} alt={c.name} />
              <div className="meta">
                <div className="name-row">
                  <span className="cname">{c.name}</span>
                  {c.itfc ? <span className="tag-chip">ITFC</span> : null}
                  {c.respite ? <span className="tag-chip respite">Respite</span> : null}
                </div>
                <div className="sub">
                  Age {c.age} &middot; {c.therapist}
                </div>
                <div className="progress-wrap" style={{ marginTop: 10 }}>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${(complete / 7) * 100}%` }} />
                  </div>
                  <div className="progress-txt">{complete}/7 days</div>
                </div>
                {complete === 7 ? (
                  <div className="pill saved" style={{ marginTop: 8 }}>
                    <CheckIcon size={12} /> Week complete
                  </div>
                ) : inProgress > 0 ? (
                  <div className="pill pending" style={{ marginTop: 8 }}>
                    In progress
                  </div>
                ) : (
                  <div className="pill correction" style={{ marginTop: 8 }}>
                    Not started
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </AppShell>
  );
}
