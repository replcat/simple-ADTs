import { assert, describe, expect, expectTypeOf, test } from "vitest"

import { constructors } from "../lib.js"
const { Maybe, Result, Just, Nothing, Failure } = constructors

test("Maybe of Just", () => {
  const maybe = Maybe(1)
  const result = maybe.fold(value => String(value), () => "nothing")

  expectTypeOf(result).toEqualTypeOf<string>()
  expect(result).toBe("1")
})

test("Maybe of Nothing", () => {
  const maybe = Maybe()
  const result = maybe.fold(value => String(value), () => "nothing")

  expectTypeOf(result).toEqualTypeOf<string>()
  expect(result).toBe("nothing")
})

test("Result of Just", () => {
  const result = Result(1)
  const mapped = result.fold(value => String(value), error => error.message)

  expectTypeOf(mapped).toEqualTypeOf<string>()
  expect(mapped).toBe("1")
})

test("Result of Failure", () => {
  const result = Result(null, "boo")
  const mapped = result.fold(value => String(value), error => error.message)

  expectTypeOf(mapped).toEqualTypeOf<string>()
  expect(mapped).toBe("boo")
})

test("Just", () => {
  const just = Just(1)
  const result = just.fold(value => String(value))

  expectTypeOf(result).toEqualTypeOf<string>()
  expect(result).toBe("1")
})

test("Nothing", () => {
  const nothing = Nothing()
  const result = nothing.fold(null, () => "boop")

  expectTypeOf(result).toEqualTypeOf<string>()
  expect(result).toBe("boop")
})

test("Failure", () => {
  const failure = Failure("boo")
  const result = failure.fold(null, error => error.message)

  expectTypeOf(result).toEqualTypeOf<string>()
  expect(result).toBe("boo")
})
