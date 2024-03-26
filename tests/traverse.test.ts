import { fc, test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf } from "vitest"

import { constructors } from "../lib.js"
const { Outcome, Maybe, Result, Just, Nothing, Failure } = constructors

test("traversing a Just", () => {
  const stringify = (n: number) => Just(String(n))

  const traversable: Just<number> = Just(1)
  const result = traversable.traverse(stringify)

  expectTypeOf(result).toMatchTypeOf<Just<Just<string>>>()
  expect(result).toEqual(Just(Just("1")))
})

describe("traversing a Maybe", () => {
  const stringify = (n: number) => Maybe(String(n))

  test("of Just", () => {
    const traversable: Maybe<number> = Maybe(1)
    const result = traversable.traverse(stringify)

    expectTypeOf(result).toMatchTypeOf<Maybe<Maybe<string>>>()
    expect(result).toEqual(Just(Just("1")))
  })

  test("of Nothing", () => {
    const traversable: Maybe<number> = Maybe()
    const result = traversable.traverse(stringify)

    expectTypeOf(result).toMatchTypeOf<Maybe<Maybe<string>>>()
    expect(result).toEqual(Nothing())
  })
})

describe("traversing a Result", () => {
  const stringify = (n: number) => Result(String(n))

  test("of Just", () => {
    const traversable: Result<number> = Result(1)
    const result = traversable.traverse(stringify)

    expectTypeOf(result).toMatchTypeOf<Result<Result<string>>>()
    expect(result).toEqual(Result(Just("1")))
  })

  test("of Failure", () => {
    const traversable: Result<number> = Result()
    const result = traversable.traverse(stringify)

    expectTypeOf(result).toMatchTypeOf<Result<Result<string>>>()
    expect(result).toEqual(Result(Failure()))
    expect(result).toEqual(Failure())
  })
})

test("transforming with a function that returns Nothing)", () => {
  const nothingify = (n: number) => Maybe() as Maybe<number>
  const traversable: Maybe<number> = Maybe(1)
  const result = traversable.traverse(nothingify)

  expectTypeOf(result).toMatchTypeOf<Maybe<Maybe<number>>>()
  expect(result).toEqual(Nothing())
  expect(result).toEqual(Nothing())
})

test("chaining multiple traverse calls", () => {
  const stringify = (n: number) => Maybe(String(n))
  const double = (s: string) => Maybe(s + s)

  const traversable = Maybe(1)
  const result = traversable
    .traverse(stringify)
    .traverse(double)

  expect(result).toEqual(Maybe(Maybe(Maybe("11"))))
})

test("traversing an Array", () => {
  const stringify = (n: number) => Maybe(String(n))
  const traversable = [Maybe(1), Maybe(), Maybe(2), Maybe(), Maybe(3)] as Maybe<number>[]
  const result = traversable.map(m => m.traverse(stringify))

  expectTypeOf(result).toMatchTypeOf<Maybe<Maybe<string>>[]>()
  expect(result).toEqual([Just(Just("1")), Nothing(), Just(Just("2")), Nothing(), Just(Just("3"))])

  const flat_result = result.map(m => m.flatten())
  expect(flat_result).toEqual([Just("1"), Nothing(), Just("2"), Nothing(), Just("3")])
})

test("using Maybe.traverse", () => {
  const stringify = (n: number) => Maybe(String(n))
  const traverse_stringify = Maybe.traverse(stringify)

  const traversable = [Maybe(1), Maybe(), Maybe(2), Maybe(), Maybe(3)] as Maybe<number>[]
  const result = traversable.map(Maybe.traverse(stringify))

  expectTypeOf(result).toMatchTypeOf<Maybe<Maybe<string>>[]>()
  expect(result).toEqual([Just(Just("1")), Nothing(), Just(Just("2")), Nothing(), Just(Just("3"))])

  const flat_result = result.map(m => m.flatten())
  expect(flat_result).toEqual([Just("1"), Nothing(), Just("2"), Nothing(), Just("3")])
})
