"use client"

import { AppShell } from "@mantine/core";
import React from "react";
import Header from "./header";
import { useDisclosure } from "@mantine/hooks";
import NavBar from "./navbar";

export default function Shell({ children }: { children: Readonly<React.ReactNode> }) {
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
      <Header opened={opened} onClick={toggle} />
      <NavBar />
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}
