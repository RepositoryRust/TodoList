import { Link } from "react-router";
import { SidebarMenu, SidebarMenuButton } from "../ui/sidebar";
import { IconLogin } from "@tabler/icons-react";

export function NavLogin() {
  return (
    <SidebarMenu>
      <SidebarMenuButton className="h-10 bg-[#27272A] duration-200 ease-linear hover:bg-[#3F3F46] group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-2!">
        <Link
          to="/login"
          className="flex items-center justify-center text-[15px] font-medium w-full cursor-default"
        >
          <IconLogin className="size-5.5!" style={{ color: "#B79AA4" }} />
          <span className="ml-2 max-w-20 overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-200 ease-linear group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
            Login
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenu>
  );
}
