"use client"

import { AppShell } from "@mantine/core";
import React from "react";
import Header from "./header";
import { useDisclosure } from "@mantine/hooks";
import NavBar from "./navbar";
import { UserWithToken } from "@/actions/user";
import { Notifications } from "@mantine/notifications";

export default function Shell({ children, user }: { children: Readonly<React.ReactNode>, user?: UserWithToken }) {
  const [opened, { toggle }] = useDisclosure();
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: "15vw",
        breakpoint: "sm",
        collapsed: { desktop: !opened }
      }}
    >
      <Header opened={opened} user={user} onClick={toggle} />
      <NavBar user={user} />
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  )
}
