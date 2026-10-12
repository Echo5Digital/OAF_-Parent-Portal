import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../lib/auth";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("jessica.smith@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn() {
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate("/parent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="view-login">
      <div className="login-card">
        <div className="login-brand">
          <img className="brand-logo" src="/open-arms-logo.png" alt="Open Arms" />
        </div>
        <h1>Welcome back</h1>
        <p className="lede">Sign in to complete daily logs and manage your household.</p>
        <div className="field">
          <label htmlFor="loginEmail">Email address</label>
          <input id="loginEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="loginPass">Password</label>
          <input id="loginPass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error ? (
          <div className="field" style={{ color: "var(--danger, #c0392b)", fontSize: 13 }}>
            {error}
          </div>
        ) : null}
        <button className="btn btn-primary btn-block" onClick={handleSignIn} disabled={submitting}>
          {submitting ? "Signing in..." : "Sign In"}
        </button>
        <div className="login-demo-row">
          <button className="btn btn-ghost" onClick={() => navigate("/parent")}>
            Demo: Parent
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("/staff")}>
            Demo: Staff
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("/ai")}>
            Demo: Mgmt/AI
          </button>
        </div>
        <div className="login-foot">Secured with MFA &middot; Role-based access &middot; Encrypted end-to-end</div>
      </div>
    </div>
  );
}
