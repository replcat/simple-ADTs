import { fc, test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf, it } from "vitest"

import { constructors } from "../lib.js"
const { Outcome, Maybe, Result, Just, Nothing, Failure } = constructors

describe("join", () => {
  test("joining a Just", () => {
    const just = Just(1)
    const result = just.join()

    expectTypeOf(result).toMatchTypeOf<Just<number>>()
    expect(result).toEqual(Just(1))
  })

  test("joining a 2x Just", () => {
    const just_just = Just(Just(1))
    const result = just_just.join()

    expectTypeOf(result).toMatchTypeOf<Just<number>>()
    expect(result).toEqual(Just(1))
  })

  test("joining a 3x Just", () => {
    const just_just_just = Just(Just(Just(1)))
    const result = just_just_just.join()

    expectTypeOf(result).toMatchTypeOf<Just<Just<number>>>()
    expect(result).toEqual(Just(Just(1)))
  })

  test("joining a 3x Maybe", () => {
    const maybe_maybe_maybe = Maybe(Maybe(Maybe(1)))
    const maybe = maybe_maybe_maybe.join()

    expectTypeOf(maybe).toMatchTypeOf<Maybe<Maybe<number>>>()
    expect(maybe).toEqual(Maybe(Maybe(1)))
  })

  test("joining a 3x Result", () => {
    const result_result_result = Result(Result(Result(1)))
    const result = result_result_result.join()

    expectTypeOf(result).toMatchTypeOf<Result<Result<number>>>()
    expect(result).toEqual(Result(Result(1)))
  })

  test("joining a 3x Outcome", () => {
    const outcome_outcome_outcome = Outcome(Outcome(Outcome(1)))
    const result = outcome_outcome_outcome.join()

    expectTypeOf(result).toMatchTypeOf<Outcome<Outcome<number>>>()
    expect(result).toEqual(Outcome(Outcome(1)))
  })

  test("joining a Nothing", () => {
    const nothing = Nothing()
    const result = nothing.join()

    expectTypeOf(result).toMatchTypeOf<Nothing>()
    expect(result).toEqual(Nothing())
  })

  test("joining a Failure", () => {
    const failure = Failure()
    const result = failure.join()

    expectTypeOf(result).toMatchTypeOf<Failure>()
    expect(result).toEqual(Failure())
  })
})

describe("flatten", () => {
  test("flattening a Just", () => {
    const just = Just(1)
    const result = just.flatten()

    expectTypeOf(result).toMatchTypeOf<Just<number>>()
    expect(result).toEqual(Just(1))
  })

  test("flattening a 2x Just", () => {
    const just_just = Just(Just(1))
    const result = just_just.flatten()

    expectTypeOf(result).toMatchTypeOf<Just<number>>()
    expect(result).toEqual(Just(1))
  })

  test("flattening a 3x Just", () => {
    const just_just_just = Just(Just(Just(1)))
    const result = just_just_just.flatten()

    expectTypeOf(result).toMatchTypeOf<Just<number>>()
    expect(result).toEqual(Just(1))
  })

  test("flattening a Nothing", () => {
    const nothing = Nothing()
    const result = nothing.flatten()

    expectTypeOf(result).toMatchTypeOf<Nothing>()
    expect(result).toEqual(Nothing())
  })

  test("flattening a Failure", () => {
    const failure = Failure()
    const result = failure.flatten()

    expectTypeOf(result).toMatchTypeOf<Failure>()
    expect(result).toEqual(Failure())
  })
})

describe("joining more complex nestings", () => {
  const value = 1 as number

  it("joins a Just of Nothing -> Nothing", () => {
    const original = Just(Nothing())
    const joined = original.join()

    expectTypeOf(joined).toMatchTypeOf<Nothing>()
    expect(joined).toEqual(Nothing())
  })

  it("joins a Just of Failure -> Failure", () => {
    const original = Just(Failure())
    const joined = original.join()

    expectTypeOf(joined).toMatchTypeOf<Failure>()
    expect(joined).toEqual(Failure())
  })

  it("joins a Just of Maybe -> Maybe", () => {
    const original = Just(Maybe(value))
    const joined = original.join()

    expectTypeOf(joined).toMatchTypeOf<Maybe<number>>()
    expect(joined).toEqual(Maybe(value))
  })

  it("joins a Just of Result -> Result", () => {
    const original = Just(Result(value))
    const joined = original.join()

    expectTypeOf(joined).toMatchTypeOf<Result<number>>()
    expect(joined).toEqual(Maybe(value))
  })

  it("joins a Just of Outcome -> Outcome", () => {
    const original = Just(Outcome(value))
    const joined = original.join()

    expectTypeOf(joined).toMatchTypeOf<Outcome<number>>()
    expect(joined).toEqual(Maybe(value))
  })

  it("joins a Maybe of Maybe -> Maybe", () => {
    const original = Maybe(Maybe(value))
    const joined = original.join()

    expectTypeOf(joined).toMatchTypeOf<Maybe<number>>()
    expect(joined).toEqual(Maybe(value))
  })

  it("joins a Maybe of Result -> Outcome", () => {
    const original = Maybe(Result(value))
    const joined = original.join()

    expectTypeOf(joined).toMatchTypeOf<Outcome<number>>()
    expect(joined).toEqual(Result(value))
  })

  it("joins a Result of Maybe -> Outcome", () => {
    const original = Result(Maybe(value))
    const joined = original.join()

    expectTypeOf(joined).toMatchTypeOf<Outcome<number>>()
    expect(joined).toEqual(Result(value))
  })

  it("joins a Maybe of Failure -> Outcome", () => {
    const original = Maybe(Failure())
    const joined = original.join()

    expectTypeOf(joined).toMatchTypeOf<Outcome>()
    expect(joined).toEqual(Failure())
  })

  it("joins a Result of Nothing -> Outcome", () => {
    const original = Result(Nothing())
    const joined = original.join()

    expectTypeOf(joined).toMatchTypeOf<Outcome>()
    expect(joined).toEqual(Nothing())
  })

  it("joins an Outcome of Outcome -> Outcome", () => {
    const original = Result(Result(value))
    const joined = original.join()

    expectTypeOf(joined).toMatchTypeOf<Outcome>()
    expect(joined).toEqual(Result(value))
  })
})

describe("flattening more complex nestings", () => {
  const value = 1 as number

  it("flattens a Maybe of Maybe", () => {
    const original = Maybe(Maybe(value))
    const flattened = original.flatten()

    expectTypeOf(flattened).toMatchTypeOf<Maybe<number>>()
    expect(flattened).toEqual(Maybe(value))
  })

  it("flattens a Just of Maybe", () => {
    const original = Just(Maybe(value))
    const flattened = original.flatten()

    expectTypeOf(flattened).toMatchTypeOf<Maybe<number>>()
    expect(flattened).toEqual(Maybe(value))
  })

  it("flattens a Maybe of Result", () => {
    const original = Maybe(Result(value))
    const flattened = original.flatten()

    expectTypeOf(flattened).toMatchTypeOf<Outcome<number>>()
    expect(flattened).toEqual(Result(value))
  })

  it("flattens a Result of Maybe", () => {
    const original = Result(Maybe(value))
    const flattened = original.flatten()

    expectTypeOf(flattened).toMatchTypeOf<Outcome<number>>()
    expect(flattened).toEqual(Result(value))
  })
})
