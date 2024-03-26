import { describe, expect, expectTypeOf, it } from "vitest"

import { constructors, curry, pipe } from "../lib.js"

const { Maybe, Just, Nothing } = constructors

describe("curry", () => {
  describe("on a function of two arguments", () => {
    const add = curry((a: number, b: number) => a + b)
    const add_one = add(1)

    it("curries function", () => {
      expectTypeOf(add_one).toEqualTypeOf<(b: number) => number>()
      expect(add_one(2)).toBe(3)
    })

    it("doesn't affect uncurried usage", () => {
      expect(add(1, 2)).toBe(3)
    })
  })

  it("curries functions of six arguments", () => {
    const add: any = curry((a, b, c, d, e, f) => a + b + c + d + e + f)
    expect(add(1, 2, 3, 4, 5, 6)).toBe(21)
    expect(add(1)(2, 3, 4, 5, 6)).toBe(21)
    expect(add(1, 2)(3, 4, 5, 6)).toBe(21)
    expect(add(1, 2, 3)(4, 5, 6)).toBe(21)
    expect(add(1, 2, 3, 4)(5, 6)).toBe(21)
    expect(add(1, 2, 3, 4, 5)(6)).toBe(21)
    expect(add(1)(2)(3)(4)(5)(6)).toBe(21)
  })
})

describe("pipe", () => {
  it("composes functions of primitive types", () => {
    const increment = (a: number) => a + 1
    const double = (a: number) => a * 2
    const stringify = (a: number) => String(a)

    const thinger = pipe(
      increment,
      double,
      stringify,
    )

    expectTypeOf(thinger).toEqualTypeOf<(a: number) => string>()
    expect(thinger(1)).toBe("4")
  })

  it("composes operations on Maybes", () => {
    const M = Maybe

    const increment = (a: number) => a + 1
    const double = (a: number) => a * 2
    const stringify = (a: number) => String(a)

    const thinger = pipe(
      (value: number) => Maybe(value),
      M.map(increment),
      M.map(double),
      M.map(stringify),
      M.match({
        Just: value => `${value}!`,
        Nothing: () => "nothing",
      }),
    )

    const inputs = [1, undefined, 2, undefined] as number[]
    const results = inputs.map(thinger)

    expectTypeOf(thinger).toEqualTypeOf<(a: number) => string>()
    expect(results).toEqual(["4!", "nothing", "6!", "nothing"])
  })
})
