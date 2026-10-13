import { ChildIcon, DocIcon, GridIcon, ReportsIcon, ReviewsIcon, SettingsIcon, UsersIcon } from "./Icons";

export function staffNavItems(openReviews: number) {
  return [
    { label: "Dashboard", icon: <GridIcon />, to: "/staff" },
    { label: "Parents", icon: <UsersIcon />, to: "/staff/parents" },
    { label: "Children", icon: <ChildIcon />, to: "/staff/children" },
    { label: "Forms", icon: <DocIcon size={16} />, to: "/staff/forms" },
    { label: "Reviews", icon: <ReviewsIcon />, to: "/staff/reviews", badge: openReviews || undefined },
    { label: "Reports", icon: <ReportsIcon />, to: "/staff/reports" },
    { label: "Settings", icon: <SettingsIcon />, to: "/staff/settings" },
  ];
}
