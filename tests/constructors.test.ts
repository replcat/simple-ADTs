import { fc, test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf } from "vitest"

import { constructors } from "../lib.js"
const { Mystery, Maybe, Result, Some, None, Fail } = constructors

describe("the Some constructor", () => {
  test.prop([
    fc.anything().filter(value => value != null),
  ])("constructs Some instances from non-null values", value => {
    // @ts-ignore
    let instance = Some(value)
    expect(instance).toBeInstanceOf(Mystery)
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

    expect(instance).toBeInstanceOf(Mystery)
    expect(instance).toBeInstanceOf(None)
  })

  test("passing an argument isa a type error", () => {
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

    expect(instance).toBeInstanceOf(Mystery)
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
    assert(maybe_some.isa(Some))

    let maybe_none = Maybe()
    expectTypeOf(maybe_none).toMatchTypeOf<Maybe<unknown>>()
    assert(maybe_none.isa(None))
  })
})

describe("the Result constructor", () => {
  test("creates Result-typed Some or Fail instances", () => {
    let result_some = Result("blep")
    expectTypeOf(result_some).toMatchTypeOf<Result<string>>()
    assert(result_some.isa(Some))

    let result_none = Result()
    expectTypeOf(result_none).toMatchTypeOf<Result<unknown>>()
    assert(result_none.isa(Fail))
    expect(result_none.error).toMatchInlineSnapshot(`[Error: (unspecified)]`)

    let result_none_with_error = Result(null, "test")
    expectTypeOf(result_none_with_error).toMatchTypeOf<Result<unknown>>()
    assert(result_none_with_error.isa(Fail))
    expect(result_none_with_error.error).toMatchInlineSnapshot(`[Error: test]`)
  })
})

describe("type guards", () => {
  test.each([
    { Type: Mystery, of: Some, narrows_to: [Mystery, Maybe, Result, Some] },
    { Type: Maybe, of: Some, narrows_to: [Maybe, Some] },
    { Type: Maybe, of: None, narrows_to: [Maybe, None] },
    { Type: Result, of: Some, narrows_to: [Result, Some] },
    { Type: Result, of: None, narrows_to: [Result, Fail] },
  ])("narrowing $Type of $of to $narrows_to", ({ Type, of, narrows_to }) => {
    // @ts-ignore
    let instance = of === None ? Type() : Type("test")

    for (let target of narrows_to) {
      assert(
        instance.isa(target),
        `expected ${instance.name} (runtime ${of.name}) to narrow to ${target.name}`,
      )
    }
  })
})

describe("type-level tests", () => {
  test("narrowing Mystery", () => {
    const mystery = Mystery("test")

    if (mystery.isa(Mystery)) expectTypeOf(mystery).toMatchTypeOf<Mystery<string>>()
    if (mystery.isa(Maybe)) expectTypeOf(mystery).toMatchTypeOf<Maybe<string>>()
    if (mystery.isa(Result)) expectTypeOf(mystery).toMatchTypeOf<Result<string>>()
    if (mystery.isa(Some)) expectTypeOf(mystery).toMatchTypeOf<Some<string>>()
  })

  test("narrowing Maybe", () => {
    const maybe = Maybe("test")

    if (maybe.isa(Maybe)) expectTypeOf(maybe).toMatchTypeOf<Maybe<string>>()
    if (maybe.isa(Some)) expectTypeOf(maybe).toMatchTypeOf<Some<string>>()
    if (maybe.isa(None)) expectTypeOf(maybe).toMatchTypeOf<None>()
  })

  test("narrowing Result", () => {
    const result = Result("test")

    if (result.isa(Result)) expectTypeOf(result).toMatchTypeOf<Result<string>>()
    if (result.isa(Some)) expectTypeOf(result).toMatchTypeOf<Some<string>>()
    if (result.isa(Fail)) expectTypeOf(result).toMatchTypeOf<Fail>()
  })
})
