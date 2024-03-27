import { fc, test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf, it } from "vitest"

import { constructors } from "../lib.js"
const { Outcome, Maybe, Result, Just, Nothing, Failure } = constructors

function nonnullable<T>(t: fc.Arbitrary<T>): fc.Arbitrary<NonNullable<T>> {
  return t.filter(value => value != null) as fc.Arbitrary<NonNullable<T>>
}

describe("chaining over a Maybe", () => {
  describe("with a type-preserving function", () => {
    const it = test.prop({
      input: nonnullable(fc.string()),
      fn: fc.constantFrom((value: string) => Maybe(value)),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Maybe(input)
      const chained = instance.chain(fn)

      if (chained.isa(Just)) {
        const actual = chained.value
        const expected = fn(input).unwrap()

        expectTypeOf(actual).toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        assert(chained.isa(Nothing) || chained.isa(Failure))
      }
    })
  })

  describe("with a type-modifying function", () => {
    const it = test.prop({
      input: nonnullable(fc.float()),
      fn: fc.constantFrom((value: number) => Maybe(String(value))),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Maybe(input)
      const chained = instance.chain(fn)

      if (chained.isa(Just)) {
        const actual = chained.value
        const expected = fn(input).unwrap()

        expectTypeOf(actual).not.toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        assert(chained.isa(Nothing) || chained.isa(Failure))
      }
    })
  })

  describe("with a type-broadening function", () => {
    const it = test.prop({
      input: nonnullable(fc.float()),
      fn: fc.constantFrom((value: number) => Outcome(value)),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Maybe(input)
      const chained = instance.chain(fn)

      if (chained.isa(Just)) {
        const actual = chained.value
        const expected = fn(input).unwrap()

        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        assert(chained.isa(Nothing) || chained.isa(Failure))
      }
    })
  })

  describe("with a type-narrowing function", () => {
    const it = test.prop({
      input: nonnullable(fc.float()),
      fn: fc.constantFrom((value: number) => Just(value)),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Maybe(input)
      const chained = instance.chain(fn)

      const actual = chained.value
      const expected = fn(input).value

      expectTypeOf(actual).toEqualTypeOf(expected)
      expect(actual).toEqual(expected)
    })
  })
})

describe("chaining over a Result", () => {
  describe("with a type-preserving function", () => {
    const it = test.prop({
      input: nonnullable(fc.string()),
      fn: fc.constantFrom((value: string) => Result(value)),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Result(input)
      const chained = instance.chain(fn)

      if (chained.isa(Just)) {
        const actual = chained.value
        const expected = fn(input).unwrap()

        expectTypeOf(actual).toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        assert(chained.isa(Failure))
      }
    })
  })

  describe("with a type-modifying function", () => {
    const it = test.prop({
      input: nonnullable(fc.float()),
      fn: fc.constantFrom((value: number) => Result(String(value))),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Result(input)
      const chained = instance.chain(fn)

      if (chained.isa(Just)) {
        const actual = chained.value
        const expected = fn(input).unwrap()

        expectTypeOf(actual).not.toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        assert(chained.isa(Failure))
      }
    })
  })
})

describe("chaining over a Just", () => {
  describe("with a type-preserving function", () => {
    const it = test.prop({
      input: nonnullable(fc.string()),
      fn: fc.constantFrom((value: string) => Just(value)),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Just(input)
      const chained = instance.chain(fn)

      const actual = chained.value
      const expected = fn(input).value

      expectTypeOf(actual).toEqualTypeOf(input)
      expectTypeOf(actual).toEqualTypeOf(expected)
      expect(actual).toEqual(expected)
    })
  })

  describe("with a type-modifying function", () => {
    const it = test.prop({
      input: nonnullable(fc.float()),
      fn: fc.constantFrom((value: number) => Just(String(value))),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Just(input)
      const chained = instance.chain(fn)

      const actual = chained.value
      const expected = fn(input).value

      expectTypeOf(actual).not.toEqualTypeOf(input)
      expectTypeOf(actual).toEqualTypeOf(expected)
      expect(actual).toEqual(expected)
    })
  })
})

describe("chaining over a Nothing", () => {
  describe("with a type-preserving function", () => {
    const it = test.prop({
      input: nonnullable(fc.string()),
      fn: fc.constantFrom((_: string) => Nothing()),
    })

    it("returns a Nothing", ({ fn }) => {
      const instance = Nothing()
      const chained = instance.chain(fn)

      expectTypeOf(chained).toEqualTypeOf(instance)
      assert(chained.isa(Nothing))
    })
  })

  describe("with a type-modifying function", () => {
    const it = test.prop({
      input: nonnullable(fc.float()),
      fn: fc.constantFrom((_: number) => Nothing()),
    })

    it("returns a Nothing", ({ fn }) => {
      const instance = Nothing()
      const chained = instance.chain(fn)

      expectTypeOf(chained).toEqualTypeOf(instance)
      assert(chained.isa(Nothing))
    })
  })
})

describe("chaining over a Failure", () => {
  describe("with a type-preserving function", () => {
    const it = test.prop({
      input: nonnullable(fc.string()),
      fn: fc.constantFrom((value: string) => Failure(value)),
    })

    it("returns a Failure", ({ input, fn }) => {
      const instance = Failure(input)
      const chained = instance.chain(fn)

      expectTypeOf(chained).toEqualTypeOf(instance)
      assert(chained.isa(Failure))
    })
  })

  describe("with a type-modifying function", () => {
    const it = test.prop({
      input: nonnullable(fc.float()),
      fn: fc.constantFrom((value: number) => Failure(new Error(`Error: ${value}`))),
    })

    it("returns a Failure", ({ input, fn }) => {
      const instance = Failure(new Error(`Error: ${input}`))
      const chained = instance.chain(fn)

      expectTypeOf(chained).toEqualTypeOf(instance)
      assert(chained.isa(Failure))
    })
  })
})

describe("chaining over non-valued types", () => {
  test("chaining over a Maybe of Nothing", () => {
    const stringify_or_nothing = (n: number) => Maybe(String(n) || null)

    const instance = Maybe() as Maybe<number>
    const chained = instance.chain(stringify_or_nothing)

    expectTypeOf(chained).toMatchTypeOf<Maybe<string>>()
    assert(chained.isa(Nothing))
  })

  test("chaining over a Result of Failure", () => {
    const stringify_or_failure = (n: number) => Result(n != null ? String(n) : new Error())

    const instance = Result() as Result<number>
    const chained = instance.chain(stringify_or_failure)

    expectTypeOf(chained).toMatchTypeOf<Result<string>>()
    assert(chained.isa(Failure))
  })
})

describe("nesting and chaining", () => {
  const stringify = (n: number) => Maybe(String(n))
  const double = (s: string) => Maybe(s + s)

  test("chaining multiple chain calls", () => {
    const maybe = Maybe(1)
    const chained = maybe
      .chain(stringify)
      .chain(double)
      .chain(double)

    expect(chained).toEqual(Just("1111"))
    expectTypeOf(chained).toMatchTypeOf<Maybe<string>>()
  })

  test("chaining over nested contexts", () => {
    const maybe_maybe_maybe = Maybe(Maybe(Maybe(1)))
    const chained = maybe_maybe_maybe
      .chain(stringify)
      .chain(double)
      .chain(double)

    expect(chained).toEqual(Just(Just(Just("1111"))))
    expectTypeOf(chained).toMatchTypeOf<Maybe<string>>()
  })
})
