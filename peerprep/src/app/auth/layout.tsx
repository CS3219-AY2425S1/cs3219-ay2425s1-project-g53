"use client"

import { verifyCurrentUser } from "@/actions/user";
import Loading from "@/components/loading";
import { UserContext } from "@/lib/contexts";
import Error from "next/error";
import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react";
import useSWR from "swr";


export default function Layout({ children }: { children: Readonly<React.ReactNode> }) {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";
  const router = useRouter();
  const {data: verified, error, isLoading} = useSWR("verifyCurrentUser", (key) => verifyCurrentUser());

  if (error) {
    return Error
  }
  if (isLoading) {
    return <Loading h="calc(100vh - 60px)" size={70}/>
  }
  
  if (verified) {
    router.replace(redirect);
  } else {
    return children;
  }
}
