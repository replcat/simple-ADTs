import { fc, test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf, it } from "vitest"

import { constructors } from "../lib.js"
const { Base, Maybe, Result, Some, None, Fail } = constructors

function nonnullable<T>(t: fc.Arbitrary<T>): fc.Arbitrary<NonNullable<T>> {
  return t.filter(value => value != null) as fc.Arbitrary<NonNullable<T>>
}

describe("simple cases", () => {
  test("applying a Some of a function to a Some", () => {
    const fn = Some((n: number) => String(n))
    const applicative = Some(1 as number)
    const result = applicative.ap(fn)

    expect(result).toEqual(Some("1"))
    expectTypeOf(result).toMatchTypeOf<Maybe<string>>()
  })

  test("applying a Maybe (Some) of a function to a Maybe (Some)", () => {
    const fn = Maybe((n: number) => String(n))
    const applicative = Maybe(1 as number)
    const result = applicative.ap(fn)

    expect(result).toEqual(Some("1"))
    expectTypeOf(result).toMatchTypeOf<Maybe<string>>()
  })

  test("applying a Maybe (None) of a function to a Maybe (Some)", () => {
    const fn = Maybe((n: number) => String(n))
    const applicative = Maybe<number>()
    const result = applicative.ap(fn)

    expect(result).toBeInstanceOf(None)
    expectTypeOf(result).toMatchTypeOf<Maybe<string>>()
  })

  test("applying a Maybe (Some) of a function to a Maybe (None)", () => {
    const fn = None() as Maybe<(n: number) => string>
    const applicative = Maybe(1 as number)
    const result = applicative.ap(fn)

    expect(result).toBeInstanceOf(None)
    expectTypeOf(result).toMatchTypeOf<Maybe<string>>()
  })
})

describe("applying a function", () => {
  const it = test.prop({
    wrapped_fn: fc.oneof(fc.constant(None()), fc.constant(Some((s: string) => s.length))) as fc.Arbitrary<Maybe<(s: string) => number>>,
    applicative: fc.oneof(fc.constant(None()), nonnullable(fc.string()).map(Maybe)) as fc.Arbitrary<Maybe<string>>,
  })

  it("to a Maybe", ({ wrapped_fn, applicative }) => {
    const result = applicative.ap(wrapped_fn)

    expectTypeOf(result).toMatchTypeOf<Maybe<number>>()

    if (wrapped_fn.isa(Some) && applicative.isa(Some)) {
      assert(result.isa(Some))
      expect(result.value).toEqual(wrapped_fn.value(applicative.value))
    } else {
      expect(result).toBeInstanceOf(None)
    }
  })
})

describe("applying a function to a Maybe", () => {
  const stringify = Maybe((n: number) => String(n))

  test("(Some)", () => {
    const applicative: Maybe<number> = Maybe(1)
    const result = applicative.ap(stringify)

    expect(result).toEqual(Some("1"))
    expectTypeOf(result).toMatchTypeOf<Maybe<string>>()
  })

  test("(None)", () => {
    const applicative: Maybe<number> = Maybe()
    const result = applicative.ap(stringify)

    expect(result).toBeInstanceOf(None)
    expectTypeOf(result).toMatchTypeOf<Maybe<string>>()
  })
})

describe("applying a function to a Result", () => {
  const stringify = Result((n: number) => String(n))

  test("(Some)", () => {
    const applicative: Result<number> = Result(1)
    const result = applicative.ap(stringify)

    expect(result).toEqual(Some("1"))
    expectTypeOf(result).toMatchTypeOf<Result<string>>()
  })

  test("(None)", () => {
    const applicative: Result<number> = Result()
    const result = applicative.ap(stringify)

    expect(result).toBeInstanceOf(Fail)
    expectTypeOf(result).toMatchTypeOf<Result<string>>()
  })
})

describe("error cases", () => {
  test("applying a non-function", () => {
    const not_a_fn = Some("blep")

    // @ts-expect-error
    expect(() => Some("boop").ap(Some("doop"))).toThrowError(TypeError)
  })

  test("applying an unwrapped function", () => {
    const unwrapped_fn = (n: number) => String(n)

    // @ts-expect-error
    expect(() => Some(1).ap(unwrapped_fn)).toThrowError(TypeError)
  })
})
