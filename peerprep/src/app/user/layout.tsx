"use client"

import { verifyCurrentUser } from "@/actions/user";
import { UserContext } from "@/lib/contexts";
import { usePathname, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";


export default function Layout({ children }: { children: Readonly<React.ReactNode> }) {
  const currentPath = usePathname();
  const router = useRouter();
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      setVerified(await verifyCurrentUser());
    })()
  }, [])

  if (verified === null) {
    return <></>
  } else if (verified) {
    return children;
  } else {
    const searchParams = new URLSearchParams({ redirect: currentPath });
    router.push(`/auth/login?${searchParams}`)
  }
}
