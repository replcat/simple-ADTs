import { fc, test } from "@fast-check/vitest"
import { describe, expect, expectTypeOf } from "vitest"
import { nonnullable_functions, nonnullable_values } from "./helpers/arbitraries.js"

import { constructors } from "../lib.js"
const { Nebulous, Maybe, Result, Some, None, Fail } = constructors

describe("on Nebulous", () => {
  test.prop([
    nonnullable_values,
    nonnullable_functions,
  ])("transforms the value", (value: any, fn: any) => {
    let instance = Nebulous(value)
    let mapped = instance.map(fn)

    expect(mapped).toBeInstanceOf(Nebulous)
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

    if (mapped.is(Some)) {
      expect(mapped.value).toBe(fn(value))
    } else {
      expect.unreachable()
    }
  })

  test("returns None when mapping over None", () => {
    let instance = Maybe()
    let mapped = instance.map(() => "test")

    expect(mapped).toBeInstanceOf(Maybe)
    expect(mapped.is(None)).toBe(true)
  })
})

describe("on Result", () => {
  test.prop([
    nonnullable_values,
    nonnullable_functions,
  ])("transforms the value in Some", (value: any, fn: any) => {
    let instance = Result(value)
    let mapped = instance.map(fn)

    expect(mapped).toBeInstanceOf(Result)
    if (mapped.is(Some)) {
      expect(mapped.unwrap()).toBe(fn(value))
    } else {
      expect.unreachable()
    }
  })

  test("returns Fail when mapping over Fail", () => {
    let instance = Result(null, "test")
    let mapped = instance.map(() => "test")

    expect(mapped).toBeInstanceOf(Result)
    expect(mapped.is(Fail)).toBe(true)
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
  test("mapping over Nebulous", () => {
    const nebulous = Nebulous("test")
    const mapped = nebulous.map(value => value.length)

    if (mapped.is(Nebulous)) expectTypeOf(mapped).toMatchTypeOf<Nebulous<number>>()
  })

  test("mapping over Maybe", () => {
    const maybe = Maybe("test")
    const mapped = maybe.map(value => value.length)

    if (mapped.is(Maybe)) expectTypeOf(mapped).toMatchTypeOf<Maybe<number>>()
    if (mapped.is(Some)) expectTypeOf(mapped).toMatchTypeOf<Some<number>>()
    if (mapped.is(None)) expectTypeOf(mapped).toMatchTypeOf<None>()
  })

  test("mapping over Result", () => {
    const result = Result("test")
    const mapped = result.map(value => value.length)

    if (mapped.is(Result)) expectTypeOf(mapped).toMatchTypeOf<Result<number>>()
    if (mapped.is(Some)) expectTypeOf(mapped).toMatchTypeOf<Some<number>>()
    if (mapped.is(Fail)) expectTypeOf(mapped).toMatchTypeOf<Fail>()
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
