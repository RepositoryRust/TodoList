import {
  IconCalendar,
  IconListCheck,
  IconStar,
  IconSun,
  type Icon,
} from "@tabler/icons-react";

export type TodoView = {
  title: string;
  icon: Icon;
  accentColor: string;
  emptyMessage: string;
};

export type TodoNavItem = {
  title: string;
  url: string;
  icon: Icon;
  accentColor: string;
};

export const TODO_VIEWS: Record<string, TodoView> = {
  Task: {
    title: "Tasks",
    icon: IconListCheck,
    accentColor: "#93a3b5",
    emptyMessage: "Anda tidak memiliki task saat ini",
  },
  "My Day": {
    title: "My Day",
    icon: IconSun,
    accentColor: "#d4b896",
    emptyMessage: "Tidak ada task untuk hari ini",
  },
  Planned: {
    title: "Planned",
    icon: IconCalendar,
    accentColor: "#9caf9c",
    emptyMessage: "Tidak ada task yang direncanakan",
  },
  Important: {
    title: "Important",
    icon: IconStar,
    accentColor: "#c99a9a",
    emptyMessage: "Tidak ada task penting",
  },
};

export const TODO_NAV_ITEMS: TodoNavItem[] = [
  {
    title: "My Day",
    url: "#",
    icon: IconSun,
    accentColor: "#d4b896",
  },
  {
    title: "Planned",
    url: "#",
    icon: IconCalendar,
    accentColor: "#9caf9c",
  },
  {
    title: "Important",
    url: "#",
    icon: IconStar,
    accentColor: "#c99a9a",
  },
  {
    title: "Task",
    url: "#",
    icon: IconListCheck,
    accentColor: "#93a3b5",
  },
];
