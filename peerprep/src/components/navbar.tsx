"use client"

import { AppShell, NavLink } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconClock, IconHome, IconList, IconSearch, IconSettings } from "@tabler/icons-react";
import { UserWithToken } from "@/actions/user";
import { use } from "react";
import { UserContext } from "@/lib/contexts";

export default function NavBar() {
  const user = use(UserContext);

  const currentPath = usePathname();
  const links = [
    { name: "Home", link: "/", icon: (<IconHome />) },
    { name: "Match Now", link: "/user/match", icon: (<IconSearch />) },
    { name: "Questions", link: "/questions", icon: (<IconList />) },
    { name: "Attempt History", link: "/user/history", icon: (<IconClock />) },
    { name: "Settings", link: "/user/settings", icon: (<IconSettings />) },
  ].map(e => (
    <NavLink key={e.link} component={Link} href={e.link} label={e.name} active={currentPath === e.link} leftSection={e.icon} />
  ));

  return (
    <AppShell.Navbar>
      {user ? links : links.filter(x => x.key !== "/user/settings").filter(x => x.key !== "/user/history")}
    </AppShell.Navbar>
  )
}
