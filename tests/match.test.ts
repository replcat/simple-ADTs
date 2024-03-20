import { describe, expect, expectTypeOf, test } from "vitest"

import { ADT } from "../lib.js"
const { Atom, Maybe, Result, Just, Nothing, Failure } = ADT

test("piping directly to type constructors", () => {
  let atoms: Atom<number>[] = [Just(1), Nothing(), Failure()]
  let result = atoms.map(atom =>
    atom.match({
      Just,
      Nothing,
      Failure: Nothing,
    })
  )

  expect(result).toEqual([Just(1), Nothing(), Nothing()])
  expectTypeOf(result).toEqualTypeOf<Maybe<number>[]>()
})

test("matching unknown atoms", () => {
  let atoms: Atom<number>[] = [Just(1), Nothing(), Failure()]

  let result = atoms.map(atom =>
    atom.match({
      Just: value => {
        expect(value).toBe(1)
        expectTypeOf(value).toEqualTypeOf<number>()
        return Just(value)
      },

      Nothing: function() {
        expect(arguments.length).toBe(0)
        return Just(0)
      },

      Failure: error => {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe("(unspecified)")
        expectTypeOf(error).toEqualTypeOf<Error>()
        return Just(0)
      },
    })
  )

  expectTypeOf(result).toEqualTypeOf<Just<number>[]>()
  expect(result).toEqual([Just(1), Just(0), Just(0)])
  expect.assertions(5)
})

test("matching maybes", () => {
  // unfortunately requires an explicit type annotation
  let numbers: Maybe<number>[] = [Just(1), Nothing(), Just(2)]

  let result = numbers.map(maybe =>
    maybe.match({
      Just: _ => Nothing(),
      Nothing: () => Just(0),
    })
  )

  expect(result).toEqual([Nothing(), Just(0), Nothing()])
  expectTypeOf(result).toEqualTypeOf<Maybe<0>[]>()
})

test("matching results", () => {
  let numbers: Result<number>[] = [Just(1), Failure(), Just(2)]

  let result = numbers.map(maybe =>
    maybe.match({
      Just: _ => Nothing(),
      Failure: () => Just(0),
    })
  )

  expect(result).toEqual([Nothing(), Just(0), Nothing()])
  expectTypeOf(result).toEqualTypeOf<Maybe<0>[]>()
})

test("matching maybes", () => {
  // unfortunately requires an explicit type annotation here
  let maybe_numbers: Maybe<number>[] = [Just(1), Nothing(), Just(2)]

  let switcheroo = maybe_numbers.map(maybe =>
    maybe.match({
      Just: value => Nothing(),
      Nothing: () => Just(0),
    })
  )

  expect(switcheroo).toEqual([Nothing(), Just(0), Nothing()])

  for (let atom of switcheroo) {
    if (atom.isa(Just)) {
      expectTypeOf(atom).toMatchTypeOf<Just<0>>()
    }
  }
})

describe("errors", () => {
  test("missing match case (type error and throws)", () => {
    let just = Just(1)

    // @ts-expect-error
    expect(() => just.match({})).toThrow(TypeError)
  })

  test("unexpected match case (type error only)", () => {
    let just: Maybe<number>[] = []

    // @ts-expect-error
    just.map(atom => atom.match({ Failure: () => {} }))
  })
})
