import { AppShell } from "../components/AppShell";
import { DocIcon, HeartIcon, ResourcesIcon } from "../components/Icons";
import { parentNavItems } from "../components/parentNav";

const PARENT_PHOTO = "https://i.pravatar.cc/80?img=32";

const RESOURCE_GROUPS = [
  {
    title: "Documentation Guides",
    items: [
      "How to complete the Basic Living Skills section",
      "Understanding the 30-minute daily requirement",
      "ITFC additional documentation requirements",
      "Respite caregiver documentation guide",
    ],
  },
  {
    title: "Policies",
    items: ["Open Arms foster parent handbook", "Confidentiality and privacy policy", "Incident reporting policy"],
  },
  {
    title: "Forms & Templates",
    items: ["Weekly log quick-reference card", "Respite care request form"],
  },
];

export function Resources() {
  return (
    <AppShell
      userName="Jessica Smith"
      userRole="Foster Parent"
      userInitials="JS"
      userPhoto={PARENT_PHOTO}
      hasNotification
      pageTitle="Resources"
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
        <h1>Resources</h1>
        <p>Guides and reference materials for completing your documentation.</p>
      </div>

      {RESOURCE_GROUPS.map((group) => (
        <div className="table-card" key={group.title} style={{ marginBottom: 18 }}>
          <div className="table-card-head">
            <h3>{group.title}</h3>
          </div>
          <div style={{ padding: "4px 20px" }}>
            {group.items.map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <ResourcesIcon />
                <span style={{ flex: 1 }}>{item}</span>
                <DocIcon size={16} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <p style={{ fontSize: 13, color: "var(--ink-faint)" }}>
        These guides are placeholders in this prototype — real documents will be uploaded by Open Arms staff through
        the admin dashboard in a later phase.
      </p>
    </AppShell>
  );
}
