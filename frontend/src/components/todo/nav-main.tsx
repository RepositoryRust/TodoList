import * as React from "react";
import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
  activeTitle,
  onSelectItem,
}: {
  items: {
    title: string;
    url: string;
    icon: Icon;
    accentColor?: string;
  }[];
  activeTitle?: string;
  onSelectItem?: (item: { title: string; icon?: Icon }) => void;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col">
        <SidebarMenu>
          {items.map((item) => (
            <React.Fragment key={item.title}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={item.title === activeTitle}
                  className="h-10 py-2.5 my-1"
                  onClick={() =>
                    onSelectItem?.({ title: item.title, icon: item.icon })
                  }
                >
                  <item.icon
                    className="size-5.5! -ml-px"
                    style={{ color: item.accentColor }}
                  />
                  <span className="text-[15px] ml-1 font-medium">
                    {item.title}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </React.Fragment>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
