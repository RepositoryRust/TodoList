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
    <SidebarGroup className="transition-[padding] duration-200 ease-linear group-data-[collapsible=icon]:p-1">
      <SidebarGroupContent className="flex flex-col">
        <SidebarMenu>
          {items.map((item) => (
            <React.Fragment key={item.title}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={item.title === activeTitle}
                  className="h-10 py-2.5 my-1 duration-200 ease-linear group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-2!"
                  onClick={() =>
                    onSelectItem?.({ title: item.title, icon: item.icon })
                  }
                >
                  <item.icon
                    className="size-5.5! -ml-px shrink-0 transition-[margin] duration-200 ease-linear group-data-[collapsible=icon]:ml-px"
                    style={{ color: item.accentColor }}
                  />
                  <span className="ml-1 max-w-40 overflow-hidden whitespace-nowrap text-[15px] font-medium transition-[max-width,opacity,margin] duration-200 ease-linear group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
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
