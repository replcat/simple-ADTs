import { fc, test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf } from "vitest"

import { constructors } from "../lib.js"
const { Outcome, Maybe, Result, Just, Nothing, Failure } = constructors

describe("the Just constructor", () => {
  test.prop([
    fc.anything().filter(value => value != null),
  ])("constructs Just instances from non-null values", value => {
    // @ts-ignore
    let instance = Just(value)
    expect(instance).toBeInstanceOf(Outcome)
    expect(instance).toBeInstanceOf(Just)
    expect(instance).toMatchObject({ value })
  })

  test("throws on null or undefined values", () => {
    // @ts-expect-error
    expect(() => Just(undefined)).toThrow(TypeError)
    // @ts-expect-error
    expect(() => Just(null)).toThrow(TypeError)
  })
})

describe("the Nothing constructor", () => {
  test("creates Nothing instances", () => {
    let instance = Nothing()

    expect(instance).toBeInstanceOf(Outcome)
    expect(instance).toBeInstanceOf(Nothing)
  })

  test("passing an argument is a type error", () => {
    // @ts-expect-error
    Nothing("blep")
  })
})

describe("the Failure constructor", () => {
  test.prop([
    fc.string().map(message => new Error(message)),
    fc.string(),
  ])("creates Failure instances from errors and strings", error => {
    let instance = Failure(error)

    expect(instance).toBeInstanceOf(Outcome)
    expect(instance).toBeInstanceOf(Failure)

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
  test("creates Maybe-typed Just or Nothing instances", () => {
    let maybe_just = Maybe("blep")
    expectTypeOf(maybe_just).toMatchTypeOf<Maybe<string>>()
    assert(maybe_just.isa(Just))

    let maybe_nothing = Maybe()
    expectTypeOf(maybe_nothing).toMatchTypeOf<Maybe<unknown>>()
    assert(maybe_nothing.isa(Nothing))
  })
})

describe("the Result constructor", () => {
  test("creates Result-typed Just or Failure instances", () => {
    let result_just = Result("blep")
    expectTypeOf(result_just).toMatchTypeOf<Result<string>>()
    assert(result_just.isa(Just))

    let result_nothing = Result()
    expectTypeOf(result_nothing).toMatchTypeOf<Result<unknown>>()
    assert(result_nothing.isa(Failure))
    expect(result_nothing.error).toMatchInlineSnapshot(`[Error: (unspecified)]`)

    let result_nothing_with_error = Result(null, "test")
    expectTypeOf(result_nothing_with_error).toMatchTypeOf<Result<unknown>>()
    assert(result_nothing_with_error.isa(Failure))
    expect(result_nothing_with_error.error).toMatchInlineSnapshot(`[Error: test]`)
  })
})

describe("type guards", () => {
  test.each([
    { Type: Outcome, of: Just, narrows_to: [Outcome, Maybe, Result, Just] },
    { Type: Maybe, of: Just, narrows_to: [Maybe, Just] },
    { Type: Maybe, of: Nothing, narrows_to: [Maybe, Nothing] },
    { Type: Result, of: Just, narrows_to: [Result, Just] },
    { Type: Result, of: Nothing, narrows_to: [Result, Failure] },
  ])("narrowing $Type of $of to $narrows_to", ({ Type, of, narrows_to }) => {
    // @ts-ignore
    let instance = of === Nothing ? Type() : Type("test")

    for (let target of narrows_to) {
      assert(
        instance.isa(target),
        `expected ${instance.name} (runtime ${of.name}) to narrow to ${target.name}`,
      )
    }
  })
})

describe("type-level tests", () => {
  test("narrowing Outcome", () => {
    const outcome = Outcome("test")

    if (outcome.isa(Outcome)) expectTypeOf(outcome).toMatchTypeOf<Outcome<string>>()
    if (outcome.isa(Maybe)) expectTypeOf(outcome).toMatchTypeOf<Maybe<string>>()
    if (outcome.isa(Result)) expectTypeOf(outcome).toMatchTypeOf<Result<string>>()
    if (outcome.isa(Just)) expectTypeOf(outcome).toMatchTypeOf<Just<string>>()
  })

  test("narrowing Maybe", () => {
    const maybe = Maybe("test")

    if (maybe.isa(Maybe)) expectTypeOf(maybe).toMatchTypeOf<Maybe<string>>()
    if (maybe.isa(Just)) expectTypeOf(maybe).toMatchTypeOf<Just<string>>()
    if (maybe.isa(Nothing)) expectTypeOf(maybe).toMatchTypeOf<Nothing>()
  })

  test("narrowing Result", () => {
    const result = Result("test")

    if (result.isa(Result)) expectTypeOf(result).toMatchTypeOf<Result<string>>()
    if (result.isa(Just)) expectTypeOf(result).toMatchTypeOf<Just<string>>()
    if (result.isa(Failure)) expectTypeOf(result).toMatchTypeOf<Failure>()
  })
})
