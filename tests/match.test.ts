import { assert, expect, expectTypeOf, test } from "vitest"

import { ADT } from "../lib.js"
const { Just, Nothing, Failure } = ADT

test("single values", () => {
  const value: Maybe<number> = Just(3)

  const result = value
    .match({
      Just: value => Just(1),
      Nothing: () => Just(2),
    })

  console.log(result)
})
