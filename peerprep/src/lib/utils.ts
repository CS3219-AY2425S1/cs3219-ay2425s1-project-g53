import { Result, ResultAsync } from "neverthrow"
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
  EXPECTED: ${typeof schema}
  RECEIVED: ${typeof data}
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
