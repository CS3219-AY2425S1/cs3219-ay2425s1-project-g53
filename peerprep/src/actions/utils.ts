"use server"

import { Result } from "neverthrow"

export const serializeResult = async <R, E>(action: ((...args: any[]) => Promise<Result<R, E>>), ...args: any[]) => {
  const res = await action(...args);
  return res.match(
    r => ({ data: r, message: null }),
    e => ({ data: null, message: e })
  )
}
