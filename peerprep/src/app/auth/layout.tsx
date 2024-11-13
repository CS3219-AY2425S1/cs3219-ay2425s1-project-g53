"use client"

import Loading from "@/components/loading";
import { useCurrentUser } from "@/lib/hooks/user";
import Error from "next/error";
import { useRouter, useSearchParams } from "next/navigation";


export default function Layout({ children }: { children: Readonly<React.ReactNode> }) {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";
  const router = useRouter();
  const {data: user, error, isLoading} = useCurrentUser();

  if (error) {
    return Error
  }
  if (isLoading) {
    return <Loading h="calc(100vh - 60px)" size={70}/>
  }
  
  if (user) {
    router.replace(redirect);
  } else {
    return children;
  }
}
