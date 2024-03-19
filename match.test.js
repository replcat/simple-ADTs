import { assert, expect, expectTypeOf, test } from "vitest"

import { ADT } from "./lib.js"
const { Just, Nothing, Failure } = ADT

test("single values", () => {
  /** @type {Maybe<number>} */
  const value = Just(3)

  const result = value
    .match({
      Just: value => Just(value),
      Nothing: () => Just(0),
    })
    .match({
      // TODO it should be the case that you can do this
      // ... therefore you need `Failure` type to have an `error` property
      // ... (by "this" I mean just leave the constructor as the handler)
      Failure,
    })

  console.log(result)
})
