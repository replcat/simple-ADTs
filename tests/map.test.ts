import { fc, test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf } from "vitest"
import { nonnullable_functions, nonnullable_values } from "./helpers/arbitraries.js"

import { constructors } from "../lib.js"
const { Outcome, Maybe, Result, Just, Nothing, Failure } = constructors

function nonnullable<T>(t: fc.Arbitrary<T>): fc.Arbitrary<NonNullable<T>> {
  return t.filter(value => value != null) as fc.Arbitrary<NonNullable<T>>
}

describe("on Outcome", () => {
  test.prop([
    nonnullable_values,
    nonnullable_functions,
  ])("transforms the value", (value: any, fn: any) => {
    let instance = Outcome(value)
    let mapped = instance.map(fn)

    expect(mapped).toBeInstanceOf(Outcome)
    expect(mapped.unwrap()).toBe(fn(value))
  })
})

describe("on Maybe", () => {
  test.prop([
    nonnullable_values,
    nonnullable_functions,
  ])("transforms the value in Just", (value: any, fn: any) => {
    let instance = Maybe(value)
    let mapped = instance.map(fn)

    if (mapped.isa(Just)) {
      expect(mapped.value).toBe(fn(value))
    } else {
      expect.unreachable()
    }
  })

  test("returns Nothing when mapping over Nothing", () => {
    let instance = Maybe()
    let mapped = instance.map(() => "test")
    expect(mapped.isa(Nothing)).toBe(true)
  })
})

describe("on Result", () => {
  test.prop([
    nonnullable_values,
    nonnullable_functions,
  ])("transforms the value in Just", (value: any, fn: any) => {
    let instance = Result(value)
    let mapped = instance.map(fn)
    if (mapped.isa(Just)) {
      expect(mapped.unwrap()).toBe(fn(value))
    } else {
      expect.unreachable()
    }
  })

  test("returns Failure when mapping over Failure", () => {
    let instance = Result()
    let mapped = instance.map(() => "test")

    expect(mapped).toBeInstanceOf(Failure)
    expect(mapped.isa(Failure)).toBe(true)
  })
})

describe("on Just", () => {
  test.prop([
    nonnullable_values,
    nonnullable_functions,
  ])("transforms the value", (value: any, fn: any) => {
    let instance = Just(value)
    let mapped = instance.map(fn)

    expect(mapped).toBeInstanceOf(Just)
    expect(mapped.unwrap()).toBe(fn(value))
  })
})

describe("on Nothing", () => {
  test("returns Nothing", () => {
    let instance = Nothing()
    let mapped = instance.map(() => "test")

    expect(mapped).toBeInstanceOf(Nothing)
  })
})

describe("on Failure", () => {
  test("returns Failure", () => {
    let instance = Failure(new Error("test"))
    let mapped = instance.map(() => "test")

    expect(mapped).toBeInstanceOf(Failure)
  })
})

describe("type-level tests", () => {
  test("mapping over Outcome", () => {
    const outcome = Outcome("test")
    const mapped = outcome.map(value => value.length)

    if (mapped.isa(Outcome)) expectTypeOf(mapped).toMatchTypeOf<Outcome<number>>()
  })

  test("mapping over Maybe", () => {
    const maybe = Maybe("test")
    const mapped = maybe.map(value => value.length)

    if (mapped.isa(Maybe)) expectTypeOf(mapped).toMatchTypeOf<Maybe<number>>()
    if (mapped.isa(Just)) expectTypeOf(mapped).toMatchTypeOf<Just<number>>()
    if (mapped.isa(Nothing)) expectTypeOf(mapped).toMatchTypeOf<Nothing>()
  })

  test("mapping over Result", () => {
    const result = Result("test")
    const mapped = result.map(value => value.length)

    if (mapped.isa(Result)) expectTypeOf(mapped).toMatchTypeOf<Result<number>>()
    if (mapped.isa(Just)) expectTypeOf(mapped).toMatchTypeOf<Just<number>>()
    if (mapped.isa(Failure)) expectTypeOf(mapped).toMatchTypeOf<Failure>()
  })

  test("mapping over Just", () => {
    const just = Just("test")
    const mapped = just.map(value => value.length)
    expectTypeOf(mapped).toMatchTypeOf<Just<number>>()
  })

  test("mapping over Nothing", () => {
    const nothing = Nothing()
    const mapped = nothing.map(value => {
      expectTypeOf(value).toMatchTypeOf<never>()
      return "test"
    })
    expectTypeOf(mapped).toMatchTypeOf<Nothing>()
  })

  test("mapping over Failure", () => {
    const failure = Failure(new Error("test"))
    const mapped = failure.map(value => {
      expectTypeOf(value).toMatchTypeOf<never>()
      return "test"
    })
    expectTypeOf(mapped).toMatchTypeOf<Failure>()
  })
})

describe("mapping over a Maybe", () => {
  describe("with a type-preserving function", () => {
    const it = test.prop({
      input: nonnullable(fc.string()),
      fn: fc.constantFrom((value: string) => value),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Maybe(input)
      const mapped = instance.map(fn)

      if (mapped.isa(Just)) {
        const actual = mapped.value
        const expected = fn(input)

        expectTypeOf(actual).toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        expect.unreachable()
      }
    })
  })

  describe("with a type-modifying function", () => {
    const it = test.prop({
      input: nonnullable(fc.float()),
      fn: fc.constantFrom((value: number) => String(value)),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Maybe(input)
      const mapped = instance.map(fn)

      if (mapped.isa(Just)) {
        const actual = mapped.value
        const expected = fn(input)

        expectTypeOf(actual).not.toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        expect.unreachable()
      }
    })
  })
})

describe("mapping over a Result", () => {
  describe("with a type-preserving function", () => {
    const it = test.prop({
      input: nonnullable(fc.string()),
      fn: fc.constantFrom((value: string) => value),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Result(input)
      const mapped = instance.map(fn)

      if (mapped.isa(Just)) {
        const actual = mapped.value
        const expected = fn(input)

        expectTypeOf(actual).toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        expect.unreachable()
      }
    })
  })

  describe("with a type-modifying function", () => {
    const it = test.prop({
      input: nonnullable(fc.float()),
      fn: fc.constantFrom((value: number) => String(value)),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Result(input)
      const mapped = instance.map(fn)

      if (mapped.isa(Just)) {
        const actual = mapped.value
        const expected = fn(input)

        expectTypeOf(actual).not.toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        expect.unreachable()
      }
    })
  })
})

describe("mapping over a Just", () => {
  describe("with a type-preserving function", () => {
    const it = test.prop({
      input: nonnullable(fc.string()),
      fn: fc.constantFrom((value: string) => value),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Just(input)
      const mapped = instance.map(fn)

      if (mapped.isa(Just)) {
        const actual = mapped.value
        const expected = fn(input)

        expectTypeOf(actual).toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        expect.unreachable()
      }
    })
  })

  describe("with a type-modifying function", () => {
    const it = test.prop({
      input: nonnullable(fc.float()),
      fn: fc.constantFrom((value: number) => String(value)),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Just(input)
      const mapped = instance.map(fn)

      if (mapped.isa(Just)) {
        const actual = mapped.value
        const expected = fn(input)

        expectTypeOf(actual).not.toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        expect.unreachable()
      }
    })
  })
})

describe("mapping over a Nothing", () => {
  describe("with a type-preserving function", () => {
    const it = test.prop({
      input: nonnullable(fc.string()),
      fn: fc.constantFrom((_: string) => Nothing()),
    })

    it("returns a Nothing", ({ fn }) => {
      const instance = Nothing()
      const mapped = instance.map(fn)

      expectTypeOf(mapped).toEqualTypeOf(instance)
      assert(mapped.isa(Nothing))
    })
  })

  describe("with a type-modifying function", () => {
    const it = test.prop({
      input: nonnullable(fc.float()),
      fn: fc.constantFrom((_: number) => Nothing()),
    })

    it("returns a Nothing", ({ fn }) => {
      const instance = Nothing()
      const mapped = instance.map(fn)

      expectTypeOf(mapped).toEqualTypeOf(instance)
      assert(mapped.isa(Nothing))
    })
  })
})
