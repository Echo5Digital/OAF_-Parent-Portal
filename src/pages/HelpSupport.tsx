import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { HeartIcon } from "../components/Icons";
import { parentNavItems } from "../components/parentNav";

const PARENT_PHOTO = "https://i.pravatar.cc/80?img=32";

const FAQS = [
  {
    q: "What if I forget to log a day?",
    a: "You can return to any day in the 7-day week and fill it in later — days are not locked to the current date in this phase. Just open the Weekly Logs page and click Resume.",
  },
  {
    q: "Why can't I submit the week yet?",
    a: "All 7 days must be marked Complete before the weekly report can be signed and submitted. Check the Weekly Logs page to see which days are still open.",
  },
  {
    q: "What does the 30-minute warning mean?",
    a: "Basic Living Skills activities require a minimum of 30 minutes per day. If your logged start and stop time total less than 30 minutes, the form will flag it so you can add more detail or extend the activity.",
  },
  {
    q: "My child is marked ITFC — what's different?",
    a: "ITFC-classified children have two additional required questions each day (Crisis/Safety Plan Reviewed and Level of Supervision) in addition to the standard Basic Living Skills section.",
  },
  {
    q: "My child is in respite care — why does the form look different?",
    a: "While a child is in respite care, the standard daily-skills section is replaced with a Respite Caregiver Summary, since the respite caregiver — not you — completes the detailed daily log for that period.",
  },
];

export function HelpSupport() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <AppShell
      userName="Jessica Smith"
      userRole="Foster Parent"
      userInitials="JS"
      userPhoto={PARENT_PHOTO}
      hasNotification
      pageTitle="Help & Support"
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
        <h1>Help & Support</h1>
        <p>Common questions about completing your documentation.</p>
      </div>

      <div className="table-card" style={{ marginBottom: 20 }}>
        {FAQS.map((item, i) => (
          <div key={item.q} className="faq-item">
            <button type="button" className="faq-question" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
              <span>{item.q}</span>
              <span>{openIndex === i ? "−" : "+"}</span>
            </button>
            {openIndex === i ? <div className="faq-answer">{item.a}</div> : null}
          </div>
        ))}
      </div>

      <div className="table-card">
        <div className="table-card-head">
          <h3>Still need help?</h3>
        </div>
        <div style={{ padding: "16px 20px", fontSize: 14.5 }}>
          <p style={{ margin: "0 0 8px" }}>Open Arms Support Team</p>
          <p style={{ margin: "0 0 8px", color: "var(--ink-faint)" }}>support@openarms.example &middot; (555) 010-0100</p>
          <p style={{ margin: 0, color: "var(--ink-faint)" }}>Monday – Friday, 8am – 5pm</p>
        </div>
      </div>
    </AppShell>
  );
}
