import { fc, test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf, it } from "vitest"

import { constructors } from "../lib.js"
const { Mystery, Maybe, Result, Some, None, Fail } = constructors

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
      fn: fc.constantFrom((value: number) => Mystery(value)),
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

      if (chained.isa(Some)) {
        const actual = chained.value
        const expected = fn(input).value

        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        assert(chained.isa(None) || chained.isa(Fail))
      }
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

      if (chained.isa(Some)) {
        const actual = chained.value
        const expected = fn(input).value

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
      fn: fc.constantFrom((value: number) => Some(String(value))),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Some(input)
      const chained = instance.chain(fn)

      if (chained.isa(Some)) {
        const actual = chained.value
        const expected = fn(input).value

        expectTypeOf(actual).not.toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        assert(chained.isa(None) || chained.isa(Fail))
      }
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
