import { useNavigate } from "react-router-dom";

export function Login() {
  const navigate = useNavigate();

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
          <input id="loginEmail" type="email" defaultValue="jessica.smith@email.com" />
        </div>
        <div className="field">
          <label htmlFor="loginPass">Password</label>
          <input id="loginPass" type="password" defaultValue="••••••••••" />
        </div>
        <button className="btn btn-primary btn-block" onClick={() => navigate("/parent")}>
          Sign In
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
