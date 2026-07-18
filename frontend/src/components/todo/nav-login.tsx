import { Link } from "react-router";
import { SidebarMenu, SidebarMenuButton } from "../ui/sidebar";
import { IconLogin } from "@tabler/icons-react";

export function NavLogin() {
  return (
    <SidebarMenu>
      <SidebarMenuButton className="h-10 bg-[#27272A] hover:bg-[#3F3F46] group-data-[collapsible=icon]:justify-center">
        <Link
          to="/login"
          className="flex items-center justify-center text-[15px] font-medium w-full cursor-default"
        >
          <IconLogin className="size-5.5!" style={{ color: "#B79AA4" }} />
          <span className="group-data-[collapsible=icon]:hidden ml-2">
            Login
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenu>
  );
}
