import { assert, describe, expect, expectTypeOf, test } from "vitest"

import { constructors } from "../lib.js"
const { Box, Maybe, Result, Some, None, Fail } = constructors

test("Box", () => {
  const box = Box(1)
  const result = box.fold(value => String(value))

  expectTypeOf(result).toEqualTypeOf<string>()
  expect(result).toBe("1")
})

test("Maybe of Some", () => {
  const maybe = Maybe(1)
  const result = maybe.fold(value => String(value), () => "none")

  expectTypeOf(result).toEqualTypeOf<string>()
  expect(result).toBe("1")
})

test("Maybe of None", () => {
  const maybe = Maybe()
  const result = maybe.fold(value => String(value), () => "none")

  expectTypeOf(result).toEqualTypeOf<string>()
  expect(result).toBe("none")
})

test("Result of Some", () => {
  const result = Result(1)
  const mapped = result.fold(value => String(value), error => error.message)

  expectTypeOf(mapped).toEqualTypeOf<string>()
  expect(mapped).toBe("1")
})

test("Result of Fail", () => {
  const result = Result(null, "boo")
  const mapped = result.fold(value => String(value), error => error.message)

  expectTypeOf(mapped).toEqualTypeOf<string>()
  expect(mapped).toBe("boo")
})

test("Some", () => {
  const some = Some(1)
  const result = some.fold(value => String(value))

  expectTypeOf(result).toEqualTypeOf<string>()
  expect(result).toBe("1")
})

test("None", () => {
  const none = None()
  const result = none.fold(null, () => "boop")

  expectTypeOf(result).toEqualTypeOf<string>()
  expect(result).toBe("boop")
})

test("Fail", () => {
  const fail = Fail("boo")
  const result = fail.fold(null, error => error.message)

  expectTypeOf(result).toEqualTypeOf<string>()
  expect(result).toBe("boo")
})
