import { serializeResult } from "@/actions/utils";
import { err, fromPromise, ok, Result, ResultAsync } from "neverthrow"
import { z } from "zod"

export const fetchResult = (url: RequestInfo | URL, init?: RequestInit) => {
  return ResultAsync.fromThrowable(fetch, (e) =>
    `Failed to fetch from ${url}:
  ${e}`
  )(url, init);
}

export const zodParseResult = <T extends any, S extends z.ZodTypeAny>(data: T, schema: S): Result<z.infer<typeof schema>, string> => {
  return Result.fromThrowable(schema.parse, (e) =>
    `Failed to validate type 
  RECEIVED: ${JSON.stringify(data)}
  ${e}`)
    (data);
}

export const parseJsonResult = (str: string) => {
  return Result.fromThrowable(JSON.parse, () => "Failed to parse " + str + " to JSON")(str);
}

export const validateResponse = <S extends z.ZodTypeAny>(response: Response, schema: S): ResultAsync<z.infer<typeof schema>, string> => {
  return ResultAsync.fromPromise(response.json(), (e) =>
    `Response is not json
  ${e}`).andThen(o => zodParseResult(o, schema))
}

export type SerializedResult<R, E> = { data: R | null, message: E | null }

export const deserializeResult = <R, E>(x: SerializedResult<R, E>): Result<R, E> => {
  if (x.data) {
    return ok(x.data);
  } else if (x.message) {
    return err(x.message);
  } else {
    throw new Error(`Error occured while deserializing object to Result: ${x}`)
  }
}

export const pipeResult = async <R, E>(action: ((...args: any[]) => Promise<Result<R, E>>), ...args: any[]) => {
  return deserializeResult(await serializeResult(action, ...args));
}

