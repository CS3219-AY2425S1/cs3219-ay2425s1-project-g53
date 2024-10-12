"use client"

import { AppShell } from "@mantine/core";
import React from "react";
import Header from "./header";
import { useDisclosure } from "@mantine/hooks";
import NavBar from "./navbar";
import { UserWithToken } from "@/actions/user";
import { Notifications } from "@mantine/notifications";
import { UserContext } from "@/lib/contexts";

export default function Shell({ children, user }: { children: Readonly<React.ReactNode>, user: UserWithToken | null }) {
  const [opened, { toggle }] = useDisclosure();
  return (
    <UserContext.Provider value={user ?? null}>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: "15vw",
          breakpoint: "sm",
          collapsed: { desktop: !opened }
        }}
      >
        <Header opened={opened} onClick={toggle} />
        <NavBar />
        <AppShell.Main>
          {children}
        </AppShell.Main>
      </AppShell>
    </UserContext.Provider>
  )
}
