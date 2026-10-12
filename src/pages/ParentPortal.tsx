import { AppShell } from "../components/AppShell";
import { ChildRail } from "../components/ChildRail";
import { DayRail } from "../components/DayRail";
import { DailyLogForm, WeekEndSection } from "../components/DailyLogForm";
import { AlertCircleIcon, HeartIcon } from "../components/Icons";
import { parentNavItems } from "../components/parentNav";
import { useToast } from "../components/Toast";
import { CHILDREN, useParentData } from "../lib/ParentDataContext";

const PARENT_PHOTO = "https://i.pravatar.cc/80?img=32";
const HERO_PHOTO = "/hero-mother-daughter.png";

export function ParentPortal() {
  const { store, currentChildId, setCurrentChildId, loadError, setActiveDay, updateEntry, submitWeek } =
    useParentData();
  const { showToast } = useToast();

  const child = CHILDREN.find((c) => c.id === currentChildId)!;
  const week = store[currentChildId];
  const activeEntry = week.days[week.activeDay];

  return (
    <AppShell
      userName="Jessica Smith"
      userRole="Foster Parent"
      userInitials="JS"
      userPhoto={PARENT_PHOTO}
      hasNotification
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
      <div className="portal-hero" style={{ backgroundImage: `url('${HERO_PHOTO}')` }}>
        <div className="htext">
          <h1>Open Arms Foster Care</h1>
          <div className="hsub">Parent Portal</div>
          <div className="hdesc">Complete your child's daily logs and track progress throughout the week.</div>
        </div>
      </div>

      <div className="isolation-note">
        <AlertCircleIcon />
        <div>
          <b>Each child has their own independent weekly log.</b> Entering Day 2 for Emma will never touch Liam's or
          Sophie's saved data — work on all three at once.
        </div>
      </div>

      {loadError ? (
        <div className="isolation-note" style={{ borderColor: "var(--danger, #c0392b)" }}>
          <AlertCircleIcon />
          <div>Couldn't load this child's log from the server: {loadError}. Showing local draft instead.</div>
        </div>
      ) : null}

      <ChildRail
        store={store}
        currentChild={currentChildId}
        onSelect={setCurrentChildId}
        onAddChild={() => showToast("Staff-managed: contact Open Arms to add a child to your household")}
      />

      <DayRail days={week.days} activeDay={week.activeDay} onSelect={setActiveDay} />

      <DailyLogForm
        key={`${currentChildId}-${week.activeDay}`}
        child={child}
        dayIndex={week.activeDay}
        entry={activeEntry}
        onChange={updateEntry}
        onComplete={() => {}}
      />

      {week.activeDay === 6 ? <WeekEndSection child={child} onSubmit={submitWeek} /> : null}
    </AppShell>
  );
}
