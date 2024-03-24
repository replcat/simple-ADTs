import { fc, test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf, it } from "vitest"

import { constructors } from "../lib.js"
const { Base, Maybe, Result, Some, None, Fail } = constructors

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

      if (chained.isa(Some)) {
        const actual = chained.value
        const expected = fn(input).unwrap()

        expectTypeOf(actual).toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        assert(chained.isa(None) || chained.isa(Fail))
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

      if (chained.isa(Some)) {
        const actual = chained.value
        const expected = fn(input).unwrap()

        expectTypeOf(actual).not.toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        assert(chained.isa(None) || chained.isa(Fail))
      }
    })
  })

  describe("with a type-broadening function", () => {
    const it = test.prop({
      input: nonnullable(fc.float()),
      fn: fc.constantFrom((value: number) => Base(value)),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Maybe(input)
      const chained = instance.chain(fn)

      if (chained.isa(Some)) {
        const actual = chained.value
        const expected = fn(input).unwrap()

        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        assert(chained.isa(None) || chained.isa(Fail))
      }
    })
  })

  describe("with a type-narrowing function", () => {
    const it = test.prop({
      input: nonnullable(fc.float()),
      fn: fc.constantFrom((value: number) => Some(value)),
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

      if (chained.isa(Some)) {
        const actual = chained.value
        const expected = fn(input).unwrap()

        expectTypeOf(actual).toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        assert(chained.isa(Fail))
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

      if (chained.isa(Some)) {
        const actual = chained.value
        const expected = fn(input).unwrap()

        expectTypeOf(actual).not.toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        assert(chained.isa(Fail))
      }
    })
  })
})

describe("chaining over a Some", () => {
  describe("with a type-preserving function", () => {
    const it = test.prop({
      input: nonnullable(fc.string()),
      fn: fc.constantFrom((value: string) => Some(value)),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Some(input)
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
      fn: fc.constantFrom((value: number) => Some(String(value))),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Some(input)
      const chained = instance.chain(fn)

      const actual = chained.value
      const expected = fn(input).value

      expectTypeOf(actual).not.toEqualTypeOf(input)
      expectTypeOf(actual).toEqualTypeOf(expected)
      expect(actual).toEqual(expected)
    })
  })
})

describe("chaining over a None", () => {
  describe("with a type-preserving function", () => {
    const it = test.prop({
      input: nonnullable(fc.string()),
      fn: fc.constantFrom((_: string) => None()),
    })

    it("returns a None", ({ fn }) => {
      const instance = None()
      const chained = instance.chain(fn)

      expectTypeOf(chained).toEqualTypeOf(instance)
      assert(chained.isa(None))
    })
  })

  describe("with a type-modifying function", () => {
    const it = test.prop({
      input: nonnullable(fc.float()),
      fn: fc.constantFrom((_: number) => None()),
    })

    it("returns a None", ({ fn }) => {
      const instance = None()
      const chained = instance.chain(fn)

      expectTypeOf(chained).toEqualTypeOf(instance)
      assert(chained.isa(None))
    })
  })
})

describe("chaining over a Fail", () => {
  describe("with a type-preserving function", () => {
    const it = test.prop({
      input: nonnullable(fc.string()),
      fn: fc.constantFrom((value: string) => Fail(value)),
    })

    it("returns a Fail", ({ input, fn }) => {
      const instance = Fail(input)
      const chained = instance.chain(fn)

      expectTypeOf(chained).toEqualTypeOf(instance)
      assert(chained.isa(Fail))
    })
  })

  describe("with a type-modifying function", () => {
    const it = test.prop({
      input: nonnullable(fc.float()),
      fn: fc.constantFrom((value: number) => Fail(new Error(`Error: ${value}`))),
    })

    it("returns a Fail", ({ input, fn }) => {
      const instance = Fail(new Error(`Error: ${input}`))
      const chained = instance.chain(fn)

      expectTypeOf(chained).toEqualTypeOf(instance)
      assert(chained.isa(Fail))
    })
  })
})

describe("chaining over non-valued types", () => {
  test("chaining over a Maybe of None", () => {
    const stringify_or_none = (n: number) => Maybe(String(n) || null)

    const instance = Maybe() as Maybe<number>
    const chained = instance.chain(stringify_or_none)

    expectTypeOf(chained).toMatchTypeOf<Maybe<string>>()
    assert(chained.isa(None))
  })

  test("chaining over a Result of Fail", () => {
    const stringify_or_fail = (n: number) => Result(String(n) || null, new Error("wuh uh"))

    const instance = Result() as Result<number>
    const chained = instance.chain(stringify_or_fail)

    expectTypeOf(chained).toMatchTypeOf<Result<string>>()
    assert(chained.isa(Fail))
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

    expect(chained).toEqual(Some("1111"))
    expectTypeOf(chained).toMatchTypeOf<Maybe<string>>()
  })

  test("chaining over nested contexts", () => {
    const maybe_maybe_maybe = Maybe(Maybe(Maybe(1)))
    const chained = maybe_maybe_maybe
      .chain(stringify)
      .chain(double)
      .chain(double)

    expect(chained).toEqual(Some(Some(Some("1111"))))
    expectTypeOf(chained).toMatchTypeOf<Maybe<string>>()
  })
})
