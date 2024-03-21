import { fc, test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf } from "vitest"

import { constructors } from "../lib.js"
const { Nebulous, Maybe, Result, Some, None, Fail } = constructors

describe("the Some constructor", () => {
  test.prop([
    fc.anything().filter(value => value != null),
  ])("constructs Some instances from non-null values", value => {
    // @ts-ignore
    let instance = Some(value)
    expect(instance).toBeInstanceOf(Nebulous)
    expect(instance).toBeInstanceOf(Some)
    expect(instance).toMatchObject({ value })
  })

  test("throws on null or undefined values", () => {
    // @ts-expect-error
    expect(() => Some(undefined)).toThrow(TypeError)
    // @ts-expect-error
    expect(() => Some(null)).toThrow(TypeError)
  })
})

describe("the None constructor", () => {
  test("creates None instances", () => {
    let instance = None()

    expect(instance).toBeInstanceOf(Nebulous)
    expect(instance).toBeInstanceOf(None)
  })

  test("passing an argument is a type error", () => {
    // @ts-expect-error
    None("blep")
  })
})

describe("the Fail constructor", () => {
  test.prop([
    fc.string().map(message => new Error(message)),
    fc.string(),
  ])("creates Fail instances from errors and strings", error => {
    let instance = Fail(error)

    expect(instance).toBeInstanceOf(Nebulous)
    expect(instance).toBeInstanceOf(Fail)

    expect(instance.error).toBeInstanceOf(Error)
    expect(instance.message).toBe(error.message)

    if (error instanceof Error) {
      expect(instance.error).toBe(error)
    } else {
      expect(instance.error.message).toBe(error)
    }
  })
})

describe("the Maybe constructor", () => {
  test("creates Maybe-typed Some or None instances", () => {
    let maybe_some = Maybe("blep")
    expectTypeOf(maybe_some).toMatchTypeOf<Maybe<string>>()
    assert(maybe_some.is(Some))

    let maybe_none = Maybe()
    expectTypeOf(maybe_none).toMatchTypeOf<Maybe<unknown>>()
    assert(maybe_none.is(None))
  })
})

describe("the Result constructor", () => {
  test("creates Result-typed Some or Fail instances", () => {
    let result_some = Result("blep")
    expectTypeOf(result_some).toMatchTypeOf<Result<string>>()
    assert(result_some.is(Some))

    let result_none = Result()
    expectTypeOf(result_none).toMatchTypeOf<Result<unknown>>()
    assert(result_none.is(Fail))
    expect(result_none.error).toMatchInlineSnapshot(`[Error: (unspecified)]`)

    let result_none_with_error = Result(null, "test")
    expectTypeOf(result_none_with_error).toMatchTypeOf<Result<unknown>>()
    assert(result_none_with_error.is(Fail))
    expect(result_none_with_error.error).toMatchInlineSnapshot(`[Error: test]`)
  })
})

describe("type guards", () => {
  test.each([
    { Type: Nebulous, of: Some, narrows_to: [Nebulous, Maybe, Result, Some] },
    { Type: Maybe, of: Some, narrows_to: [Maybe, Some] },
    { Type: Maybe, of: None, narrows_to: [Maybe, None] },
    { Type: Result, of: Some, narrows_to: [Result, Some] },
    { Type: Result, of: None, narrows_to: [Result, Fail] },
  ])("narrowing $Type of $of to $narrows_to", ({ Type, of, narrows_to }) => {
    // @ts-ignore
    let instance = of === None ? Type() : Type("test")

    for (let target of narrows_to) {
      assert(
        instance.is(target),
        `expected ${instance.name} (runtime ${of.name}) to narrow to ${target.name}`,
      )
    }
  })
})

describe("type-level tests", () => {
  test("narrowing Nebulous", () => {
    const nebulous = Nebulous("test")

    if (nebulous.is(Nebulous)) expectTypeOf(nebulous).toMatchTypeOf<Nebulous<string>>()
    if (nebulous.is(Maybe)) expectTypeOf(nebulous).toMatchTypeOf<Maybe<string>>()
    if (nebulous.is(Result)) expectTypeOf(nebulous).toMatchTypeOf<Result<string>>()
    if (nebulous.is(Some)) expectTypeOf(nebulous).toMatchTypeOf<Some<string>>()
  })

  test("narrowing Maybe", () => {
    const maybe = Maybe("test")

    if (maybe.is(Maybe)) expectTypeOf(maybe).toMatchTypeOf<Maybe<string>>()
    if (maybe.is(Some)) expectTypeOf(maybe).toMatchTypeOf<Some<string>>()
    if (maybe.is(None)) expectTypeOf(maybe).toMatchTypeOf<None>()
  })

  test("narrowing Result", () => {
    const result = Result("test")

    if (result.is(Result)) expectTypeOf(result).toMatchTypeOf<Result<string>>()
    if (result.is(Some)) expectTypeOf(result).toMatchTypeOf<Some<string>>()
    if (result.is(Fail)) expectTypeOf(result).toMatchTypeOf<Fail>()
  })
})
