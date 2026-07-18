import { useState } from "react";
import { IconListCheck, type Icon } from "@tabler/icons-react";

import { AppSidebar } from "@/components/todo/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TodoList } from "@/components/todo/todo-list";
import { TODO_VIEWS } from "@/lib/todo-constants";
import { useAuth } from "@/context/auth-context";
import SkeletonTodo from "@/components/todo/skeleton";
import { useTitle } from "@/lib/utils";

export default function TodolistPage() {
  useTitle("TodoList");
  
  const { user, loading } = useAuth();
  const [selectedItem, setSelectedItem] = useState<{
    title: string;
    icon?: Icon;
  } | null>({
    title: "Task",
    icon: IconListCheck,
  });

  const currentView = selectedItem ? TODO_VIEWS[selectedItem.title] : undefined;

  if (loading) {
    return <SkeletonTodo />;
  }

  return (
    <SidebarProvider
      className="h-svh overflow-hidden overscroll-none bg-[#1b1b1b]"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 60)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="sidebar"
        onSelectItem={setSelectedItem}
        user={user}
      />
      <SidebarInset className="h-svh min-w-0 overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {currentView && (
            <TodoList
              key={currentView.title}
              title={currentView.title}
              icon={currentView.icon}
              accentColor={currentView.accentColor}
              emptyMessage={currentView.emptyMessage}
              user={user}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
