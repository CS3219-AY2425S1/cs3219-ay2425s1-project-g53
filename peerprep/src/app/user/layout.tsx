"use client"

import { UserContext } from "@/lib/contexts";
import { usePathname, useRouter } from "next/navigation";
import { use } from "react";


export default function Layout({ children }: { children: Readonly<React.ReactNode> }) {
  const currentPath = usePathname();
  const router = useRouter();
  const user = use(UserContext);

  if (user) {
    return children;
  } else {
    const searchParams = new URLSearchParams({ redirect: currentPath });
    router.push(`/auth/login?${searchParams}`)
  }
}
