"use client"

import { verifyCurrentUser } from "@/actions/user";
import Loading from "@/components/loading";
import { UserContext } from "@/lib/contexts";
import { useCurrentUser } from "@/lib/hooks/user";
import { usePathname, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";


export default function Layout({ children }: { children: Readonly<React.ReactNode> }) {
  const currentPath = usePathname();
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <Loading h="calc(100vh - 60px)" size={70} />
  }

  if (user) {
    return children;
  } else {
    const searchParams = new URLSearchParams({ redirect: currentPath });
    router.push(`/auth/login?${searchParams}`)
  }
}
