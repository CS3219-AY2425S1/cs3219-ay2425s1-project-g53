"use client"

import { UserContext } from "@/lib/contexts";
import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react";


export default function Layout({ children }: { children: Readonly<React.ReactNode> }) {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";
  const router = useRouter();
  const user = use(UserContext);

  if (user) {
    router.replace(redirect);
  } else {
    return children;
  }
}
