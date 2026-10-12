import {
  DocIcon,
  HelpIcon,
  HomeIcon,
  MessageIcon,
  ResourcesIcon,
  UsersIcon,
} from "./Icons";

export function parentNavItems(unreadMessages: number) {
  return [
    { label: "Home", icon: <HomeIcon />, to: "/parent" },
    { label: "Parent Portal", icon: <UsersIcon />, to: "/parent/weekly-log" },
    { label: "My Children", icon: <UsersIcon />, to: "/parent/children" },
    { label: "Weekly Logs", icon: <DocIcon size={16} />, to: "/parent/logs" },
    { label: "Resources", icon: <ResourcesIcon />, to: "/parent/resources" },
    { label: "Messages", icon: <MessageIcon />, to: "/parent/messages", badge: unreadMessages || undefined },
    { label: "Help & Support", icon: <HelpIcon />, to: "/parent/help" },
  ];
}
