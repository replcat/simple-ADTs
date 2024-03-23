import { test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf } from "vitest"

import { constructors } from "../lib.js"
const { Some, None, Fail, Base } = constructors

describe("applying a function", () => {
  const stringify = Some((n: number) => String(n))

  test("to a Some", () => {
    const some = Some(1)
    const result = stringify.ap(some)

    expect(result).toEqual(Some("1"))
    expectTypeOf(result).toMatchTypeOf(Some("1"))
  })

  test("to a None", () => {
    const none = constructors.None()
    const result = stringify.ap(none)

    expect(result).toBeInstanceOf(None)
    expectTypeOf(result).toMatchTypeOf(None())
  })
})

describe("error handling", () => {
  test("applying a non-function", () => {
    const some = Some("blep")

    // @ts-expect-error
    expect(() => some.ap(Some(2))).toThrowError(TypeError)
  })
})
