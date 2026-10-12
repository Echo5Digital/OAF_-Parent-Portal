import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { HeartIcon } from "../components/Icons";
import { parentNavItems } from "../components/parentNav";
import { useToast } from "../components/Toast";

const PARENT_PHOTO = "https://i.pravatar.cc/80?img=32";

type Thread = {
  id: string;
  with: string;
  role: string;
  preview: string;
  unread: boolean;
  messages: { from: "me" | "them"; text: string; time: string }[];
};

const INITIAL_THREADS: Thread[] = [
  {
    id: "therapist-emma",
    with: "Dr. Maria Lopez, BCBA",
    role: "Emma & Sophie's Therapist",
    preview: "Thanks for the detailed notes on Emma's reading practice this week.",
    unread: true,
    messages: [
      { from: "them", text: "Thanks for the detailed notes on Emma's reading practice this week.", time: "Yesterday" },
    ],
  },
  {
    id: "caseworker",
    with: "Open Arms Staff",
    role: "Caseworker",
    preview: "Reminder: Liam's ITFC safety plan review is due this month.",
    unread: true,
    messages: [
      { from: "them", text: "Reminder: Liam's ITFC safety plan review is due this month.", time: "2 days ago" },
    ],
  },
];

export function Messages() {
  const [threads, setThreads] = useState(INITIAL_THREADS);
  const [activeId, setActiveId] = useState(threads[0].id);
  const [draft, setDraft] = useState("");
  const { showToast } = useToast();

  const active = threads.find((t) => t.id === activeId)!;
  const unreadCount = threads.filter((t) => t.unread).length;

  function openThread(id: string) {
    setActiveId(id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: false } : t)));
  }

  function send() {
    if (!draft.trim()) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeId
          ? { ...t, messages: [...t.messages, { from: "me", text: draft, time: "Just now" }], preview: draft }
          : t,
      ),
    );
    setDraft("");
    showToast("Message sent");
  }

  return (
    <AppShell
      userName="Jessica Smith"
      userRole="Foster Parent"
      userInitials="JS"
      userPhoto={PARENT_PHOTO}
      hasNotification
      pageTitle="Messages"
      navItems={parentNavItems(unreadCount)}
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
        <h1>Messages</h1>
        <p>Secure messages with your assigned therapist and caseworker.</p>
      </div>

      <div className="messages-layout">
        <div className="thread-list">
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`thread-item${t.id === activeId ? " active" : ""}`}
              onClick={() => openThread(t.id)}
            >
              <div className="thread-top">
                <span className="thread-with">{t.with}</span>
                {t.unread ? <span className="thread-dot" /> : null}
              </div>
              <div className="thread-role">{t.role}</div>
              <div className="thread-preview">{t.preview}</div>
            </button>
          ))}
        </div>

        <div className="thread-detail">
          <div className="thread-detail-head">
            <div className="thread-with">{active.with}</div>
            <div className="thread-role">{active.role}</div>
          </div>
          <div className="thread-messages">
            {active.messages.map((m, i) => (
              <div key={i} className={`bubble ${m.from}`}>
                <div className="bubble-text">{m.text}</div>
                <div className="bubble-time">{m.time}</div>
              </div>
            ))}
          </div>
          <div className="thread-compose">
            <input
              placeholder={`Message ${active.with.split(",")[0]}...`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="btn btn-primary" type="button" onClick={send}>
              Send
            </button>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "var(--ink-faint)", marginTop: 14 }}>
        Messaging is local to this prototype session and does not yet notify staff — a real notification/delivery
        backend is a later phase.
      </p>
    </AppShell>
  );
}
