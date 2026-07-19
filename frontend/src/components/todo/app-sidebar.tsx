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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/assets/main.svg",
  },
};

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

  return (
    <Sidebar
      collapsible="icon"
      className={cn("overflow-hidden overscroll-none", className)}
      {...props}
    >
      <SidebarHeader className="shrink-0 overflow-hidden overscroll-none">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center p-1.5">
              <img
                src="assets/todolist.svg"
                className="h-8 w-8 group-data-[collapsible=icon]:hidden"
                alt="TodoList"
              />
              <span className="ml-2 font-semibold group-data-[collapsible=icon]:hidden">
                TodoList
              </span>
              <SidebarTrigger
                className="
                  size-8
                  ml-auto
                  group-data-[collapsible=icon]:-ml-1.5
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
      <SidebarFooter className="overflow-hidden overscroll-none">
        {user ? <NavUser user={data.user} /> : <NavLogin />}
      </SidebarFooter>
    </Sidebar>
  );
}
