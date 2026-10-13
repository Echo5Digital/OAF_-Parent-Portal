import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { staffNavItems } from "../components/staffNav";
import { useToast } from "../components/Toast";

export function StaffSettings() {
  const { showToast } = useToast();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <AppShell userName="Maria Thompson" userRole="Program Director" userInitials="MT" userPhoto="https://i.pravatar.cc/80?img=5" navItems={staffNavItems(0)}>
      <div className="page-head">
        <h1>Settings</h1>
        <p>Your account and notification preferences.</p>
      </div>

      <div className="table-card" style={{ marginBottom: 20 }}>
        <div className="table-card-head">
          <h3>Profile</h3>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <div className="frow" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="ffield">
              <label>Full Name</label>
              <input type="text" defaultValue="Maria Thompson" />
            </div>
            <div className="ffield">
              <label>Role</label>
              <input type="text" readOnly value="Program Director" style={{ background: "var(--surface-sunken)" }} />
            </div>
          </div>
          <div className="ffield" style={{ marginBottom: 0 }}>
            <label>Email</label>
            <input type="email" defaultValue="maria.thompson@openarmsfostercare.com" />
          </div>
        </div>
      </div>

      <div className="table-card" style={{ marginBottom: 20 }}>
        <div className="table-card-head">
          <h3>Security</h3>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <label className="checkbox-opt" style={{ marginBottom: 10 }}>
            <input type="checkbox" checked={mfaEnabled} onChange={(e) => setMfaEnabled(e.target.checked)} />
            Require multi-factor authentication for my account
          </label>
          <div className="link" onClick={() => showToast("Password reset email would be sent here")}>
            Change password
          </div>
        </div>
      </div>

      <div className="table-card" style={{ marginBottom: 20 }}>
        <div className="table-card-head">
          <h3>Notifications</h3>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <label className="checkbox-opt">
            <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
            Email me when a weekly log is awaiting therapist review
          </label>
        </div>
      </div>

      <div className="form-foot" style={{ border: "none", padding: 0 }}>
        <div />
        <button className="btn btn-primary" type="button" onClick={() => showToast("Settings saved")}>
          Save Changes
        </button>
      </div>

      <p style={{ fontSize: 13, color: "var(--ink-faint)", marginTop: 14 }}>
        This page is local-only in the prototype — saving doesn't persist to a real account yet, and MFA enrollment would need to go
        through Cognito.
      </p>
    </AppShell>
  );
}
