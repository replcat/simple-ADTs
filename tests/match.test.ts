import { fc, test } from "@fast-check/vitest"
import { describe, expect, expectTypeOf } from "vitest"
import { nonnullable_functions, nonnullable_values } from "./helpers/arbitraries.js"

import { constructors } from "../lib.js"
const { Outcome, Maybe, Result, Just, Nothing, Failure } = constructors

describe("type transformations", () => {
  test("Just<number> to number", () => {
    const just = Just(1) as Just<number>
    const number = just.match({
      Just: value => value,
    })
    expectTypeOf(number).toEqualTypeOf<number>()
    expect(number).toBe(1)
  })

  test("Just<number> to Maybe<string>", () => {
    const just = Just(1) as Just<number>
    const maybe = just.match({
      Just: value => Maybe(String(value)),
    })
    expectTypeOf(maybe).toMatchTypeOf<Maybe<string>>()
    expect(maybe).toEqual(Maybe("1"))
  })

  test("Maybe<string> to Just<number>", () => {
    const maybe = Maybe("test")
    const just = maybe.match({
      Just: value => Just(value.length),
      Nothing: () => Just(0 as number),
    })
    expectTypeOf(just).toMatchTypeOf<Just<number>>()
    expect(just).toEqual(Just(4))
  })

  test("Maybe<string> to Result<number>", () => {
    const maybe = Maybe("test")
    const result = maybe.match({
      Just: value => Just(value.length),
      Nothing: Failure,
    })
    expectTypeOf(result).toMatchTypeOf<Result<number>>()
    expect(result).toEqual(Just(4))
  })

  test("Result<string> to Maybe<number>", () => {
    const result = Result("test")
    const maybe = result.match({
      Just: value => Just(value.length),
      Failure: Nothing,
    })
    expectTypeOf(maybe).toMatchTypeOf<Maybe<number>>()
    expect(maybe).toEqual(Just(4))
  })

  test("Maybe<string> to Outcome<number>", () => {
    const maybe = Maybe("test")
    const result = maybe.match({
      Just: value => Result(value.length),
      Nothing,
    })
    expectTypeOf(result).toMatchTypeOf<Outcome<number>>()
    expect(result).toEqual(Just(4))
  })

  test("reducing Maybes to a number", () => {
    let maybes = [Just("one"), Nothing(), Just("two")] as Maybe<string>[]
    let result = maybes.reduce(
      (acc, maybe) =>
        acc + maybe.match({
          Just: value => value.length,
          Nothing: () => 10,
        }),
      0,
    )
    expectTypeOf(result).toEqualTypeOf<number>()
    expect(result).toBe(16)
  })
})

describe.each([Outcome, Maybe, Result, Just, Nothing, Failure])("%s", constructor => {
  test.prop([
    constructor === Failure
      ? fc.oneof(fc.string(), fc.string().map(message => new Error(message)))
      : nonnullable_values,
    fc.func(nonnullable_values),
    fc.func(nonnullable_values),
    fc.func(nonnullable_values),
  ])("handles the match", (value: any, handle_just, handle_nothing, handle_failure) => {
    // @ts-ignore
    let instance = constructor === Nothing ? constructor() : constructor(value)

    // @ts-ignore
    let result = instance.match({
      Just: handle_just,
      Nothing: handle_nothing,
      Failure: handle_failure,
    })

    if (instance.isa(Just)) expect(result).toBe(handle_just(value))
    else if (instance.isa(Nothing)) expect(result).toBe(handle_nothing())
    else if (instance.isa(Failure)) expect(result).toBe(handle_failure(instance.error))
    else expect.unreachable()
  })
})

describe("errors", () => {
  test("missing match case (type error and throws)", () => {
    let just = Just(1)

    // @ts-expect-error
    expect(() => just.match({})).toThrow(TypeError)
  })

  test("unexpected match case (type error only)", () => {
    let maybe: Maybe<number>[] = []

    // @ts-expect-error
    maybe.map(m => m.match({ Failure: () => {} }))
  })
})
