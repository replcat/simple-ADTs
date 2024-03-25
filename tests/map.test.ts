import { fc, test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf } from "vitest"
import { nonnullable_functions, nonnullable_values } from "./helpers/arbitraries.js"

import { constructors } from "../lib.js"
const { Base, Maybe, Result, Some, None, Fail } = constructors

function nonnullable<T>(t: fc.Arbitrary<T>): fc.Arbitrary<NonNullable<T>> {
  return t.filter(value => value != null) as fc.Arbitrary<NonNullable<T>>
}

describe("on Base", () => {
  test.prop([
    nonnullable_values,
    nonnullable_functions,
  ])("transforms the value", (value: any, fn: any) => {
    let instance = Base(value)
    let mapped = instance.map(fn)

    expect(mapped).toBeInstanceOf(Base)
    expect(mapped.unwrap()).toBe(fn(value))
  })
})

describe("on Maybe", () => {
  test.prop([
    nonnullable_values,
    nonnullable_functions,
  ])("transforms the value in Some", (value: any, fn: any) => {
    let instance = Maybe(value)
    let mapped = instance.map(fn)

    if (mapped.isa(Some)) {
      expect(mapped.value).toBe(fn(value))
    } else {
      expect.unreachable()
    }
  })

  test("returns None when mapping over None", () => {
    let instance = Maybe()
    let mapped = instance.map(() => "test")
    expect(mapped.isa(None)).toBe(true)
  })
})

describe("on Result", () => {
  test.prop([
    nonnullable_values,
    nonnullable_functions,
  ])("transforms the value in Some", (value: any, fn: any) => {
    let instance = Result(value)
    let mapped = instance.map(fn)
    if (mapped.isa(Some)) {
      expect(mapped.unwrap()).toBe(fn(value))
    } else {
      expect.unreachable()
    }
  })

  test("returns Fail when mapping over Fail", () => {
    let instance = Result(null, "test")
    let mapped = instance.map(() => "test")

    expect(mapped).toBeInstanceOf(Fail)
    expect(mapped.isa(Fail)).toBe(true)
  })
})

describe("on Some", () => {
  test.prop([
    nonnullable_values,
    nonnullable_functions,
  ])("transforms the value", (value: any, fn: any) => {
    let instance = Some(value)
    let mapped = instance.map(fn)

    expect(mapped).toBeInstanceOf(Some)
    expect(mapped.unwrap()).toBe(fn(value))
  })
})

describe("on None", () => {
  test("returns None", () => {
    let instance = None()
    let mapped = instance.map(() => "test")

    expect(mapped).toBeInstanceOf(None)
  })
})

describe("on Fail", () => {
  test("returns Fail", () => {
    let instance = Fail(new Error("test"))
    let mapped = instance.map(() => "test")

    expect(mapped).toBeInstanceOf(Fail)
  })
})

describe("type-level tests", () => {
  test("mapping over Base", () => {
    const base = Base("test")
    const mapped = base.map(value => value.length)

    if (mapped.isa(Base)) expectTypeOf(mapped).toMatchTypeOf<Base<number>>()
  })

  test("mapping over Maybe", () => {
    const maybe = Maybe("test")
    const mapped = maybe.map(value => value.length)

    if (mapped.isa(Maybe)) expectTypeOf(mapped).toMatchTypeOf<Maybe<number>>()
    if (mapped.isa(Some)) expectTypeOf(mapped).toMatchTypeOf<Some<number>>()
    if (mapped.isa(None)) expectTypeOf(mapped).toMatchTypeOf<None>()
  })

  test("mapping over Result", () => {
    const result = Result("test")
    const mapped = result.map(value => value.length)

    if (mapped.isa(Result)) expectTypeOf(mapped).toMatchTypeOf<Result<number>>()
    if (mapped.isa(Some)) expectTypeOf(mapped).toMatchTypeOf<Some<number>>()
    if (mapped.isa(Fail)) expectTypeOf(mapped).toMatchTypeOf<Fail>()
  })

  test("mapping over Some", () => {
    const some = Some("test")
    const mapped = some.map(value => value.length)
    expectTypeOf(mapped).toMatchTypeOf<Some<number>>()
  })

  test("mapping over None", () => {
    const none = None()
    const mapped = none.map(value => {
      expectTypeOf(value).toMatchTypeOf<never>()
      return "test"
    })
    expectTypeOf(mapped).toMatchTypeOf<None>()
  })

  test("mapping over Fail", () => {
    const fail = Fail(new Error("test"))
    const mapped = fail.map(value => {
      expectTypeOf(value).toMatchTypeOf<never>()
      return "test"
    })
    expectTypeOf(mapped).toMatchTypeOf<Fail>()
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

      if (mapped.isa(Some)) {
        const actual = mapped.value
        const expected = fn(input)

        expectTypeOf(actual).toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        assert(mapped.isa(None))
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

      if (mapped.isa(Some)) {
        const actual = mapped.value
        const expected = fn(input)

        expectTypeOf(actual).not.toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        assert(mapped.isa(None))
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

      if (mapped.isa(Some)) {
        const actual = mapped.value
        const expected = fn(input)

        expectTypeOf(actual).toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        assert(mapped.isa(Fail))
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

      if (mapped.isa(Some)) {
        const actual = mapped.value
        const expected = fn(input)

        expectTypeOf(actual).not.toEqualTypeOf(input)
        expectTypeOf(actual).toEqualTypeOf(expected)
        expect(actual).toEqual(expected)
      } else {
        assert(mapped.isa(Fail))
      }
    })
  })
})

describe("mapping over a Some", () => {
  describe("with a type-preserving function", () => {
    const it = test.prop({
      input: nonnullable(fc.string()),
      fn: fc.constantFrom((value: string) => value),
    })

    it("returns the expected value and type", ({ input, fn }) => {
      const instance = Some(input)
      const mapped = instance.map(fn)

      if (mapped.isa(Some)) {
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
      const instance = Some(input)
      const mapped = instance.map(fn)

      if (mapped.isa(Some)) {
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

describe("mapping over a None", () => {
  describe("with a type-preserving function", () => {
    const it = test.prop({
      input: nonnullable(fc.string()),
      fn: fc.constantFrom((_: string) => None()),
    })

    it("returns a None", ({ fn }) => {
      const instance = None()
      const mapped = instance.map(fn)

      expectTypeOf(mapped).toEqualTypeOf(instance)
      assert(mapped.isa(None))
    })
  })

  describe("with a type-modifying function", () => {
    const it = test.prop({
      input: nonnullable(fc.float()),
      fn: fc.constantFrom((_: number) => None()),
    })

    it("returns a None", ({ fn }) => {
      const instance = None()
      const mapped = instance.map(fn)

      expectTypeOf(mapped).toEqualTypeOf(instance)
      assert(mapped.isa(None))
    })
  })
})
