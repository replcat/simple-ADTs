import { fc, test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf } from "vitest"

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
