import { AppShell } from "../components/AppShell";
import { DocIcon, GridIcon, ReportsIcon, ReviewsIcon, SettingsIcon, UsersIcon, ChildIcon } from "../components/Icons";

type Submission = {
  date: string;
  parent: string;
  child: string;
  week: string;
  status: "Saved" | "Pending Review" | "Needs Correction" | "Approved";
};

const SUBMISSIONS: Submission[] = [
  { date: "Oct 8, 2024", parent: "Jessica Smith", child: "Emma R.", week: "Oct 7–13", status: "Saved" },
  { date: "Oct 8, 2024", parent: "Michael Brown", child: "Liam T.", week: "Oct 7–13", status: "Pending Review" },
  { date: "Oct 7, 2024", parent: "Sarah Davis", child: "Sophie M.", week: "Sep 30–Oct 6", status: "Needs Correction" },
  { date: "Oct 7, 2024", parent: "Jennifer Wilson", child: "Noah K.", week: "Sep 30–Oct 6", status: "Approved" },
  { date: "Oct 6, 2024", parent: "Robert Garcia", child: "Ava L.", week: "Sep 30–Oct 6", status: "Pending Review" },
];

const STATUS_CLASS: Record<Submission["status"], string> = {
  Saved: "saved",
  "Pending Review": "pending",
  "Needs Correction": "correction",
  Approved: "approved",
};

export function StaffDashboard() {
  return (
    <AppShell
      userName="Maria Thompson"
      userRole="Program Director"
      userInitials="MT"
      userPhoto="https://i.pravatar.cc/80?img=5"
      navItems={[
        { label: "Dashboard", icon: <GridIcon />, to: "/staff" },
        { label: "Parents", icon: <UsersIcon />, to: "/staff" },
        { label: "Children", icon: <ChildIcon />, to: "/staff" },
        { label: "Forms", icon: <DocIcon size={16} />, to: "/staff" },
        { label: "Reviews", icon: <ReviewsIcon />, to: "/staff", badge: 12 },
        { label: "Reports", icon: <ReportsIcon />, to: "/staff" },
        { label: "Settings", icon: <SettingsIcon />, to: "/staff" },
      ]}
    >
      <div className="page-head">
        <h1>Staff Dashboard</h1>
        <p>Overview of foster care program activity and documentation status.</p>
      </div>

      <div className="stat-row">
        <div className="stat-tile">
          <div className="num">124</div>
          <div className="lbl">Active Foster Homes</div>
        </div>
        <div className="stat-tile accent">
          <div className="num">187</div>
          <div className="lbl">Active Children</div>
        </div>
        <div className="stat-tile warn">
          <div className="num">23</div>
          <div className="lbl">Pending Weekly Logs</div>
        </div>
        <div className="stat-tile warn">
          <div className="num">12</div>
          <div className="lbl">Awaiting Therapist Signature</div>
        </div>
        <div className="stat-tile danger">
          <div className="num">5</div>
          <div className="lbl">Open Correction Requests</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-head">
          <h3>Recent Submissions</h3>
          <span className="link">View all →</span>
        </div>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Submitted</th>
                <th>Parent</th>
                <th>Child</th>
                <th>Week Of</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {SUBMISSIONS.map((s, i) => (
                <tr key={i}>
                  <td className="mono">{s.date}</td>
                  <td>{s.parent}</td>
                  <td>{s.child}</td>
                  <td className="mono">{s.week}</td>
                  <td>
                    <span className={`pill ${STATUS_CLASS[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="link">View</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
