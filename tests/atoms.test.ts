import { describe, expect, expectTypeOf, test } from "vitest"

import { ADT } from "../lib.js"
const { Just, Nothing, Failure } = ADT

describe("constructors", () => {
  test("Just", () => {
    let just = Just(1)

    expect(just).toBeInstanceOf(Just)
    expect(just).not.toBeInstanceOf(Nothing)
    expect(just).not.toBeInstanceOf(Failure)

    expectTypeOf(just).toMatchTypeOf<Just<number>>()
    expect(just).toMatchObject({ value: 1 })
  })

  test("Nothing", () => {
    let nothing = Nothing()

    expect(nothing).toBeInstanceOf(Nothing)
    expect(nothing).not.toBeInstanceOf(Just)
    expect(nothing).not.toBeInstanceOf(Failure)

    expectTypeOf(nothing).toMatchTypeOf<Nothing>()
  })

  test("Failure", () => {
    let failure = Failure("boo")

    expect(failure).toBeInstanceOf(Error)
    expect(failure).toBeInstanceOf(Failure)
    expectTypeOf(failure).toMatchTypeOf<Failure>()

    expect(() => {
      throw failure
    }).toThrowError("boo")
  })

  test("Failure (existing error)", () => {
    let error = new Error("boo")
    let failure = Failure(error)

    expect(failure).toBeInstanceOf(Error)
    expect(failure).toBeInstanceOf(Failure)
    expectTypeOf(failure).toMatchTypeOf<Failure>()

    expect(() => {
      throw failure
    }).toThrowError("boo")
  })

  test("of", () => {
    let first = Just(1)
    let second = first.of("two")
    expectTypeOf(second).toMatchTypeOf<Just<string>>()
    expect(second).toBeInstanceOf(first.of)
    expect(second).not.toBe(first)
  })
})

describe("map", () => {
  describe("with a type-preserving function", () => {
    test("Just", () => {
      let just = Just(1)
      let result = just.map(value => value + 1)
      expect(result).toBeInstanceOf(Just)
      expectTypeOf(result).toMatchTypeOf<Just<number>>()
      expect(result.value).toBe(2)
    })

    test("Nothing", () => {
      let nothing = Nothing()
      let result = nothing.map(value => value + 1)
      expect(result).toBeInstanceOf(Nothing)
      expectTypeOf(result).toMatchTypeOf<Nothing>()
    })

    test("Failure", () => {
      let failure = Failure("error")
      let result = failure.map(value => value + 1)
      expect(result).toBeInstanceOf(Failure)
      expectTypeOf(result).toMatchTypeOf<Failure>()
    })
  })

  describe("with a type-modifying function", () => {
    test("Just", () => {
      let just = Just(1)
      let result = just.map(value => String(value))
      expect(result).toBeInstanceOf(Just)
      expectTypeOf(result).toMatchTypeOf<Just<string>>()
      expect(result.value).toBe("1")
    })

    test("Nothing", () => {
      let nothing = Nothing()
      let result = nothing.map(value => String(value))
      expect(result).toBeInstanceOf(Nothing)
      expectTypeOf(result).toMatchTypeOf<Nothing>()
    })

    test("Failure", () => {
      let failure = Failure("error")
      let result = failure.map(value => String(value))
      expect(result).toBeInstanceOf(Failure)
      expectTypeOf(result).toMatchTypeOf<Failure>()
    })
  })
})

describe("narrowing", () => {
  describe("with instanceof", () => {
    test("Maybe to Just", () => {
      let maybe: Maybe<number> = Just(1)
      if (maybe instanceof Just) {
        expectTypeOf(maybe).toMatchTypeOf<Just<number>>()
      } else {
        expect.unreachable()
      }
    })

    test("Maybe to Nothing", () => {
      let maybe: Maybe<number> = Nothing()
      if (maybe instanceof Nothing) {
        expectTypeOf(maybe).toMatchTypeOf<Nothing>()
      } else {
        expect.unreachable()
      }
    })

    test("Result to Just", () => {
      let result: Result<number> = Just(1)
      if (result instanceof Just) {
        expectTypeOf(result).toMatchTypeOf<Just<number>>()
      } else {
        expect.unreachable()
      }
    })

    test("Result to Failure", () => {
      let result: Result<number> = Failure()
      if (result instanceof Failure) {
        expectTypeOf(result).toMatchTypeOf<Failure>()
      } else {
        expect.unreachable()
      }
    })
  })

  describe("with isa", () => {
    test("Maybe to Just", () => {
      let maybe: Maybe<number> = Just(1)
      if (maybe.isa(Just)) {
        expectTypeOf(maybe).toMatchTypeOf<Just<number>>()
      } else {
        expect.unreachable()
      }
    })

    test("Maybe to Nothing", () => {
      let maybe: Maybe<number> = Nothing()
      if (maybe.isa(Nothing)) {
        expectTypeOf(maybe).toMatchTypeOf<Nothing>()
      } else {
        expect.unreachable()
      }
    })

    test("Result to Just", () => {
      let result: Result<number> = Just(1)
      if (result.isa(Just)) {
        expectTypeOf(result).toMatchTypeOf<Just<number>>()
      } else {
        expect.unreachable()
      }
    })

    test("Result to Failure", () => {
      let result: Result<number> = Failure()
      if (result.isa(Failure)) {
        expectTypeOf(result).toMatchTypeOf<Failure>()
      } else {
        expect.unreachable()
      }
    })
  })
})

describe("Maybe", () => {
  let array: Maybe<number>[] = [Just(1), Nothing(), Just(2)]

  test("has the expected type", () => {
    expectTypeOf(array).toMatchTypeOf<Array<Maybe<number>>>()
  })

  test("can be mapped (type-preserving)", () => {
    let add_one = (value: number) => value + 1
    let result = array.map(value => value.map(add_one))
    expect(result).toMatchObject([Just(2), Nothing(), Just(3)])
    expectTypeOf(result).toMatchTypeOf<Array<Maybe<number>>>()
  })

  test("can be mapped (type-modifying)", () => {
    let stringify = (value: number) => String(value)
    let result = array.map(value => value.map(stringify))
    expect(result).toMatchObject([Just("1"), Nothing(), Just("2")])
    expectTypeOf(result).toMatchTypeOf<Array<Maybe<string>>>()
  })
})

describe("Result", () => {
  let array: Result<number>[] = [Just(1), Failure(), Just(2)]

  test("has the expected type", () => {
    expectTypeOf(array).toMatchTypeOf<Array<Result<number>>>()
  })

  test("can be mapped (type-preserving)", () => {
    let add_one = (value: number) => value + 1
    let result = array.map(value => value.map(add_one))
    expect(result).toMatchObject([Just(2), Failure(), Just(3)])
    expectTypeOf(result).toMatchTypeOf<Array<Result<number>>>()
  })

  test("can be mapped (type-modifying)", () => {
    let stringify = (value: number) => String(value)
    let result = array.map(value => value.map(stringify))
    expect(result).toMatchObject([Just("1"), Failure(), Just("2")])
    expectTypeOf(result).toMatchTypeOf<Array<Result<string>>>()
  })
})
