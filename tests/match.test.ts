import { describe, expect, expectTypeOf, test } from "vitest"

import { constructors } from "../lib.js"
const { Nebulous, Maybe, Result, Some, None, Fail } = constructors

test("piping directly to type constructors", () => {
  let nebulous: Nebulous<number>[] = [Some(1), None(), Fail()]
  let result = nebulous.map(item =>
    item.match({
      Some,
      None,
      Fail: None,
    })
  )

  expect(result).toEqual([Some(1), None(), None()])
  expectTypeOf(result).toEqualTypeOf<Maybe<number>[]>()
})

test("matching unknown nebulouss", () => {
  let nebulous: Nebulous<number>[] = [Some(1), None(), Fail()]

  let result = nebulous.map(item =>
    item.match({
      Some: value => {
        expect(value).toBe(1)
        expectTypeOf(value).toEqualTypeOf<number>()
        return Some(value)
      },

      None: function() {
        expect(arguments.length).toBe(0)
        return Some(0)
      },

      Fail: error => {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe("(unspecified)")
        expectTypeOf(error).toEqualTypeOf<Error>()
        return Some(0)
      },
    })
  )

  expectTypeOf(result).toEqualTypeOf<Some<number>[]>()
  expect(result).toEqual([Some(1), Some(0), Some(0)])
  expect.assertions(5)
})

test("matching maybes", () => {
  // unfortunately requires an explicit type annotation
  let numbers: Maybe<number>[] = [Some(1), None(), Some(2)]

  let result = numbers.map(maybe =>
    maybe.match({
      Some: _ => None(),
      None: () => Some(0),
    })
  )

  expect(result).toEqual([None(), Some(0), None()])
  expectTypeOf(result).toEqualTypeOf<Maybe<0>[]>()
})

test("matching results", () => {
  let numbers: Result<number>[] = [Some(1), Fail(), Some(2)]

  let result = numbers.map(maybe =>
    maybe.match({
      Some: value => None(),
      Fail: error => Some(0),
    })
  )

  expect(result).toEqual([None(), Some(0), None()])
  expectTypeOf(result).toEqualTypeOf<Maybe<0>[]>()
})

test("matching maybes", () => {
  // unfortunately requires an explicit type annotation here
  let maybe_numbers: Maybe<number>[] = [Some(1), None(), Some(2)]

  let switcheroo = maybe_numbers.map(maybe =>
    maybe.match({
      Some: value => None(),
      None: () => Some(0),
    })
  )

  expect(switcheroo).toEqual([None(), Some(0), None()])

  for (let nebulous of switcheroo) {
    if (nebulous.is(Some)) {
      expectTypeOf(nebulous).toMatchTypeOf<Some<0>>()
    }
  }
})

describe("errors", () => {
  test("missing match case (type error and throws)", () => {
    let some = Some(1)

    // @ts-expect-error
    expect(() => some.match({})).toThrow(TypeError)
  })

  test("unexpected match case (type error only)", () => {
    let maybe: Maybe<number>[] = []

    // @ts-expect-error
    maybe.map(m => m.match({ Fail: () => {} }))
  })
})
