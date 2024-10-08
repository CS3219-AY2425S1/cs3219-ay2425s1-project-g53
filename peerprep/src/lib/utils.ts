import { Result, ResultAsync } from "neverthrow"
import { z } from "zod"

export const fetchResult = (url: RequestInfo | URL, init?: RequestInit) => {
  return ResultAsync.fromThrowable(fetch, () => "Failed to fetch from " + url.toString())(url, init);
}

export const zodParseResult = <T extends any, S extends z.ZodTypeAny>(data: T, schema: S): Result<z.infer<typeof schema>, string> => {
  return Result.fromThrowable(schema.parse, () => "Failed to validate type\n" + `EXPECTED: ${typeof schema}\n` + `RECEIVED: ${typeof data}`)(data);
}

export const parseJsonResult = (str: string) => {
  return Result.fromThrowable(JSON.parse, () => "Failed to parse " + str + " to JSON")(str);
}

export const validateResponse = <S extends z.ZodTypeAny>(response: Response, schema: S): ResultAsync<z.infer<typeof schema>, string> => {
  return ResultAsync.fromPromise(response.json(), () => "Response is not json").andThen(o => zodParseResult(o, schema))
}
