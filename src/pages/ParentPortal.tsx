import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { ChildRail } from "../components/ChildRail";
import { DayRail } from "../components/DayRail";
import { DailyLogForm, WeekEndSection } from "../components/DailyLogForm";
import {
  AlertCircleIcon,
  DocIcon,
  HeartIcon,
  HelpIcon,
  HomeIcon,
  MessageIcon,
  ResourcesIcon,
  UsersIcon,
} from "../components/Icons";
import { buildInitialStore, CHILDREN, type DailyLogEntry } from "../data/model";
import { useToast } from "../components/Toast";

const PARENT_PHOTO = "https://i.pravatar.cc/80?img=32";
const HERO_PHOTO = "/hero-mother-daughter.png";

export function ParentPortal() {
  const [store, setStore] = useState(buildInitialStore);
  const [currentChildId, setCurrentChildId] = useState("emma");
  const { showToast } = useToast();

  const child = CHILDREN.find((c) => c.id === currentChildId)!;
  const week = store[currentChildId];
  const activeEntry = week.days[week.activeDay];

  function setActiveDay(index: number) {
    setStore((prev) => ({
      ...prev,
      [currentChildId]: { ...prev[currentChildId], activeDay: index },
    }));
  }

  function updateEntry(next: DailyLogEntry) {
    setStore((prev) => {
      const days = [...prev[currentChildId].days];
      days[prev[currentChildId].activeDay] = next;
      return { ...prev, [currentChildId]: { ...prev[currentChildId], days } };
    });
  }

  return (
    <AppShell
      userName="Jessica Smith"
      userRole="Foster Parent"
      userInitials="JS"
      userPhoto={PARENT_PHOTO}
      hasNotification
      navItems={[
        { label: "Home", icon: <HomeIcon /> },
        { label: "Parent Portal", icon: <UsersIcon />, active: true },
        { label: "My Children", icon: <UsersIcon /> },
        { label: "Weekly Logs", icon: <DocIcon size={16} />, badge: 2 },
        { label: "Resources", icon: <ResourcesIcon /> },
        { label: "Messages", icon: <MessageIcon />, badge: 2 },
        { label: "Help & Support", icon: <HelpIcon /> },
      ]}
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

      {week.activeDay === 6 ? <WeekEndSection child={child} /> : null}
    </AppShell>
  );
}
