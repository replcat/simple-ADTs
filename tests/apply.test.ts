import { fc, test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf, it } from "vitest"

import { constructors } from "../lib.js"
const { Outcome, Maybe, Result, Just, Nothing, Failure } = constructors

function nonnullable<T>(t: fc.Arbitrary<T>): fc.Arbitrary<NonNullable<T>> {
  return t.filter(value => value != null) as fc.Arbitrary<NonNullable<T>>
}

describe("simple cases", () => {
  test("applying a Just of a function to a Just", () => {
    const fn = Just((n: number) => String(n))
    const applicative = Just(1 as number)
    const result = applicative.ap(fn)

    expect(result).toEqual(Just("1"))
    expectTypeOf(result).toMatchTypeOf<Maybe<string>>()
  })

  test("applying a Maybe (Just) of a function to a Maybe (Just)", () => {
    const fn = Maybe((n: number) => String(n))
    const applicative = Maybe(1 as number)
    const result = applicative.ap(fn)

    expect(result).toEqual(Just("1"))
    expectTypeOf(result).toMatchTypeOf<Maybe<string>>()
  })

  test("applying a Maybe (Nothing) of a function to a Maybe (Just)", () => {
    const fn = Maybe((n: number) => String(n))
    const applicative = Maybe<number>()
    const result = applicative.ap(fn)

    expect(result).toBeInstanceOf(Nothing)
    expectTypeOf(result).toMatchTypeOf<Maybe<string>>()
  })

  test("applying a Maybe (Just) of a function to a Maybe (Nothing)", () => {
    const fn = Nothing() as Maybe<(n: number) => string>
    const applicative = Maybe(1 as number)
    const result = applicative.ap(fn)

    expect(result).toBeInstanceOf(Nothing)
    expectTypeOf(result).toMatchTypeOf<Maybe<string>>()
  })
})

describe("applying a function", () => {
  const it = test.prop({
    wrapped_fn: fc.oneof(fc.constant(Nothing()), fc.constant(Just((s: string) => s.length))) as fc.Arbitrary<Maybe<(s: string) => number>>,
    applicative: fc.oneof(fc.constant(Nothing()), nonnullable(fc.string()).map(Maybe)) as fc.Arbitrary<Maybe<string>>,
  })

  it("to a Maybe", ({ wrapped_fn, applicative }) => {
    const result = applicative.ap(wrapped_fn)

    expectTypeOf(result).toMatchTypeOf<Maybe<number>>()

    if (wrapped_fn.isa(Just) && applicative.isa(Just)) {
      assert(result.isa(Just))
      expect(result.value).toEqual(wrapped_fn.value(applicative.value))
    } else {
      expect(result).toBeInstanceOf(Nothing)
    }
  })
})

describe("applying a function to a Maybe", () => {
  const stringify = Maybe((n: number) => String(n))

  test("(Just)", () => {
    const applicative: Maybe<number> = Maybe(1)
    const result = applicative.ap(stringify)

    expect(result).toEqual(Just("1"))
    expectTypeOf(result).toMatchTypeOf<Maybe<string>>()
  })

  test("(Nothing)", () => {
    const applicative: Maybe<number> = Maybe()
    const result = applicative.ap(stringify)

    expect(result).toBeInstanceOf(Nothing)
    expectTypeOf(result).toMatchTypeOf<Maybe<string>>()
  })
})

describe("applying a function to a Result", () => {
  const stringify = Result((n: number) => String(n))

  test("(Just)", () => {
    const applicative: Result<number> = Result(1)
    const result = applicative.ap(stringify)

    expect(result).toEqual(Just("1"))
    expectTypeOf(result).toMatchTypeOf<Result<string>>()
  })

  test("(Nothing)", () => {
    const applicative: Result<number> = Result()
    const result = applicative.ap(stringify)

    expect(result).toBeInstanceOf(Failure)
    expectTypeOf(result).toMatchTypeOf<Result<string>>()
  })
})

describe("error cases", () => {
  test("applying a non-function", () => {
    const not_a_fn = Just("blep")

    // @ts-expect-error
    expect(() => Just("boop").ap(Just("doop"))).toThrowError(TypeError)
  })

  test("applying an unwrapped function", () => {
    const unwrapped_fn = (n: number) => String(n)

    // @ts-expect-error
    expect(() => Just(1).ap(unwrapped_fn)).toThrowError(TypeError)
  })
})
