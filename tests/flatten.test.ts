import { fc, test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf } from "vitest"

import { constructors } from "../lib.js"
const { Base, Maybe, Result, Some, None, Fail } = constructors

describe("join", () => {
  test("joining a Some", () => {
    const some = Some(1)
    const result = some.join()

    expectTypeOf(result).toMatchTypeOf<Some<number>>()
    expect(result).toEqual(Some(1))
  })

  test("joining a 2x Some", () => {
    const some_some = Some(Some(1))
    const result = some_some.join()

    expectTypeOf(result).toMatchTypeOf<Some<number>>()
    expect(result).toEqual(Some(1))
  })

  test("joining a 3x Some", () => {
    const some_some_some = Some(Some(Some(1)))
    const result = some_some_some.join()

    expectTypeOf(result).toMatchTypeOf<Some<Some<number>>>()
    expect(result).toEqual(Some(Some(1)))
  })

  test("joining a None", () => {
    const none = None()
    const result = none.join()

    expectTypeOf(result).toMatchTypeOf<None>()
    expect(result).toEqual(None())
  })

  test("joining a Fail", () => {
    const fail = Fail()
    const result = fail.join()

    expectTypeOf(result).toMatchTypeOf<Fail>()
    expect(result).toEqual(Fail())
  })
})

describe("flatten", () => {
  test("flattening a Some", () => {
    const some = Some(1)
    const result = some.flatten()

    expectTypeOf(result).toMatchTypeOf<Some<number>>()
    expect(result).toEqual(Some(1))
  })

  test("flattening a 2x Some", () => {
    const some_some = Some(Some(1))
    const result = some_some.flatten()

    expectTypeOf(result).toMatchTypeOf<Some<number>>()
    expect(result).toEqual(Some(1))
  })

  test("flattening a 3x Some", () => {
    const some_some_some = Some(Some(Some(1)))
    const result = some_some_some.flatten()

    expectTypeOf(result).toMatchTypeOf<Some<number>>()
    expect(result).toEqual(Some(1))
  })

  test("flattening a None", () => {
    const none = None()
    const result = none.flatten()

    expectTypeOf(result).toMatchTypeOf<None>()
    expect(result).toEqual(None())
  })

  test("flattening a Fail", () => {
    const fail = Fail()
    const result = fail.flatten()

    expectTypeOf(result).toMatchTypeOf<Fail>()
    expect(result).toEqual(Fail())
  })
})
