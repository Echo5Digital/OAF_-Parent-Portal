import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BellIcon } from "./Icons";

type NavItem = {
  label: string;
  icon: ReactNode;
  badge?: number;
  to: string;
};

type AppShellProps = {
  navItems: NavItem[];
  footer?: ReactNode;
  pageTitle?: ReactNode;
  userName: string;
  userRole: string;
  userInitials: string;
  userPhoto?: string;
  hasNotification?: boolean;
  children: ReactNode;
};

export function AppShell({
  navItems,
  footer,
  pageTitle,
  userName,
  userRole,
  userInitials,
  userPhoto,
  hasNotification,
  children,
}: AppShellProps) {
  const location = useLocation();

  return (
    <div className="app-shell">
      <div className="sidebar">
        <div className="sidebar-brand">
          <img className="brand-logo" src="/open-arms-logo.png" alt="Open Arms" />
        </div>
        {navItems.map((item) => (
          <Link
            key={item.label}
            className={`nav-item${location.pathname === item.to ? " active" : ""}`}
            to={item.to}
          >
            {item.icon}
            {item.label}
            {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
          </Link>
        ))}
        {footer ? <div className="sidebar-footer">{footer}</div> : null}
      </div>

      <div className="main">
        <div className="topbar">
          {pageTitle ? <h2>{pageTitle}</h2> : null}
          <div className="spacer" />
          <button className="icon-btn" type="button" aria-label="Notifications">
            <BellIcon />
            {hasNotification ? <span className="dot" /> : null}
          </button>
          <div className="who">
            <span className="name">{userName}</span>
            <span className="role">{userRole}</span>
          </div>
          {userPhoto ? (
            <img className="avatar avatar-photo" src={userPhoto} alt={userName} />
          ) : (
            <div className="avatar">{userInitials}</div>
          )}
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
