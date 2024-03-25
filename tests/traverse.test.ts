import { fc, test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf } from "vitest"

import { constructors } from "../lib.js"
const { Base, Maybe, Result, Some, None, Fail } = constructors

test("traversing a Some", () => {
  const stringify = (n: number) => Some(String(n))

  const traversable: Some<number> = Some(1)
  const result = traversable.traverse(stringify)

  expectTypeOf(result).toMatchTypeOf<Some<Some<string>>>()
  expect(result).toEqual(Some(Some("1")))
})

describe("traversing a Maybe", () => {
  const stringify = (n: number) => Maybe(String(n))

  test("of Some", () => {
    const traversable: Maybe<number> = Maybe(1)
    const result = traversable.traverse(stringify)

    expectTypeOf(result).toMatchTypeOf<Maybe<Maybe<string>>>()
    expect(result).toEqual(Some(Some("1")))
  })

  test("of None", () => {
    const traversable: Maybe<number> = Maybe()
    const result = traversable.traverse(stringify)

    expectTypeOf(result).toMatchTypeOf<Maybe<Maybe<string>>>()
    expect(result).toEqual(None())
  })
})

describe("traversing a Result", () => {
  const stringify = (n: number) => Result(String(n))

  test("of Some", () => {
    const traversable: Result<number> = Result(1)
    const result = traversable.traverse(stringify)

    expectTypeOf(result).toMatchTypeOf<Result<Result<string>>>()
    expect(result).toEqual(Result(Some("1")))
  })

  test("of Fail", () => {
    const traversable: Result<number> = Result()
    const result = traversable.traverse(stringify)

    expectTypeOf(result).toMatchTypeOf<Result<Result<string>>>()
    expect(result).toEqual(Result(Fail()))
    expect(result).toEqual(Fail())
  })
})

test("transforming with a function that returns None)", () => {
  const noneify = (n: number) => Maybe() as Maybe<number>
  const traversable: Maybe<number> = Maybe(1)
  const result = traversable.traverse(noneify)

  expectTypeOf(result).toMatchTypeOf<Maybe<Maybe<number>>>()
  expect(result).toEqual(None())
  expect(result).toEqual(None())
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
  expect(result).toEqual([Some(Some("1")), None(), Some(Some("2")), None(), Some(Some("3"))])

  const flat_result = result.map(m => m.flatten())
  expect(flat_result).toEqual([Some("1"), None(), Some("2"), None(), Some("3")])
})

test("using Maybe.traverse", () => {
  const stringify = (n: number) => Maybe(String(n))
  const traverse_stringify = Maybe.traverse(stringify)

  const traversable = [Maybe(1), Maybe(), Maybe(2), Maybe(), Maybe(3)] as Maybe<number>[]
  const result = traversable.map(Maybe.traverse(stringify))

  expectTypeOf(result).toMatchTypeOf<Maybe<Maybe<string>>[]>()
  expect(result).toEqual([Some(Some("1")), None(), Some(Some("2")), None(), Some(Some("3"))])

  const flat_result = result.map(m => m.flatten())
  expect(flat_result).toEqual([Some("1"), None(), Some("2"), None(), Some("3")])
})
