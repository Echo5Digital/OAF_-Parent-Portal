import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { HeartIcon } from "../components/Icons";
import { parentNavItems } from "../components/parentNav";
import { CHILDREN, useParentData } from "../lib/ParentDataContext";

const PARENT_PHOTO = "https://i.pravatar.cc/80?img=32";

export function MyChildren() {
  const { store, setCurrentChildId } = useParentData();
  const navigate = useNavigate();

  function openLog(childId: string) {
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
      pageTitle="My Children"
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
        <h1>My Children</h1>
        <p>Children currently assigned to your household. Contact Open Arms staff to request a change.</p>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Child</th>
                <th>Age</th>
                <th>Classification</th>
                <th>Placement</th>
                <th>Assigned Therapist</th>
                <th>This Week</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {CHILDREN.map((c) => {
                const complete = store[c.id].days.filter((d) => d.status === "complete").length;
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <img
                          src={c.photo}
                          alt={c.name}
                          style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                        />
                        {c.name}
                      </div>
                    </td>
                    <td>{c.age}</td>
                    <td>{c.classification}</td>
                    <td>{c.respite ? "Respite" : "Foster (household)"}</td>
                    <td>{c.therapist}</td>
                    <td>{complete}/7 days logged</td>
                    <td>
                      <span className="link" onClick={() => openLog(c.id)}>
                        Open weekly log
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
