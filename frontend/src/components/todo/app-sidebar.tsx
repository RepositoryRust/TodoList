import { useState } from "react";
import type { Icon } from "@tabler/icons-react";

import { NavMain } from "@/components/todo/nav-main";
import { NavUser } from "@/components/todo/nav-user";
import { cn } from "@/lib/utils";
import { TODO_NAV_ITEMS } from "@/lib/todo-constants";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import type { User } from "@/types/types-user";
import { NavLogin } from "./nav-login";

export function AppSidebar({
  onSelectItem,
  className,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  onSelectItem?: (item: { title: string; icon?: Icon }) => void;
  user: User | null;
}) {
  const [activeItem, setActiveItem] = useState("Task");
  const { isMobile, setOpenMobile } = useSidebar();
  const userName = user?.email.split("@")[0] ?? "User";

  return (
    <Sidebar
      collapsible="icon"
      className={cn("overflow-hidden overscroll-none", className)}
      {...props}
    >
      <SidebarHeader className="shrink-0 overflow-hidden overscroll-none transition-[padding] duration-200 ease-linear group-data-[collapsible=icon]:p-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center p-1.5 transition-[padding] duration-200 ease-linear group-data-[collapsible=icon]:p-0">
              <img
                src="/assets/todolist-large.svg"
                className="h-8 w-8 shrink-0 transition-[width,opacity] duration-200 ease-linear group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0"
                alt="TodoList"
              />
              <span className="ml-2 max-w-32 overflow-hidden whitespace-nowrap font-semibold transition-[max-width,opacity,margin] duration-200 ease-linear group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
                TodoList
              </span>
              <SidebarTrigger
                className="
                  -mt-1.5
                  size-10
                  ml-auto
                  group-data-[collapsible=icon]:mt-1.5
                "
              />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-hidden overscroll-none">
        <NavMain
          items={TODO_NAV_ITEMS}
          activeTitle={activeItem}
          onSelectItem={(item) => {
            setActiveItem(item.title);
            onSelectItem?.(item);

            if (isMobile) {
              setOpenMobile(false);
            }
          }}
        />
      </SidebarContent>
      <SidebarFooter className="overflow-hidden overscroll-none transition-[padding] duration-200 ease-linear group-data-[collapsible=icon]:p-1">
        {user ? (
          <NavUser
            user={{
              name: userName,
              email: user.email,
              avatar: "/assets/main.svg",
            }}
          />
        ) : (
          <NavLogin />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
