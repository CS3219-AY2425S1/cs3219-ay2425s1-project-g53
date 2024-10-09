"use client"

import { AppShell, NavLink } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconList, IconSearch, IconSettings } from "@tabler/icons-react";

export default function NavBar() {
  const currentPath = usePathname();
  const links = [
    { name: "Home", link: "/", icon: (<IconHome />) },
    { name: "Match Now", link: "/match", icon: (<IconSearch />) },
    { name: "Questions", link: "/questions", icon: (<IconList />) },
    { name: "Settings", link: "/user/settings", icon: (<IconSettings />) },
  ].map(e => (
    <NavLink key={e.link} component={Link} href={e.link} label={e.name} active={currentPath === e.link} leftSection={e.icon} />
  ));

  return (
    <AppShell.Navbar>
      {links}
    </AppShell.Navbar>
  )
}
