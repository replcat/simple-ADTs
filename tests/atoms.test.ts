import { describe, expect, expectTypeOf, test } from "vitest"

import { constructors } from "../lib.js"
const { Nebulous, Maybe, Result, Some, None, Fail } = constructors

describe("constructors", () => {
  test("Some", () => {
    let some = Some(1)

    expect(some).toBeInstanceOf(Nebulous)
    expect(some).toBeInstanceOf(Some)
    expectTypeOf(some).toMatchTypeOf<Some<number>>()
    expect(some).toMatchObject({ value: 1 })
  })

  test("None", () => {
    let none = None()

    expect(none).toBeInstanceOf(Nebulous)
    expect(none).toBeInstanceOf(None)
    expectTypeOf(none).toMatchTypeOf<None>()
  })

  test("Fail (with string message)", () => {
    let fail = Fail("boo")

    expect(fail).toBeInstanceOf(Nebulous)
    expect(fail).toBeInstanceOf(Fail)
    expectTypeOf(fail).toMatchTypeOf<Fail>()
    expect(fail.message).toBe("boo")
  })

  test("Fail (existing error)", () => {
    let error = new Error("boo")
    let fail = Fail(error)

    expect(fail).toBeInstanceOf(Fail)
    expectTypeOf(fail).toMatchTypeOf<Fail>()

    expect(() => {
      throw fail
    }).toThrowErrorMatchingInlineSnapshot(`
      Fail {
        "error": [Error: boo],
        "message": "boo",
      }
    `)
  })

  test("Fail (with notes)", () => {
    let fail = Fail("boo", { mood: "pretty scary" })

    expect(fail).toBeInstanceOf(Fail)
    expectTypeOf(fail).toMatchTypeOf<Fail>()

    expect(() => {
      throw fail
    }).toThrowErrorMatchingInlineSnapshot(`
      Fail {
        "error": [Error: boo],
        "message": "boo",
      }
    `)
  })

  test("Fail (no arguments)", () => {
    let fail = Fail()

    expect(fail).toBeInstanceOf(Fail)
    expectTypeOf(fail).toMatchTypeOf<Fail>()

    expect(() => {
      throw fail
    }).toThrowErrorMatchingInlineSnapshot(`
      Fail {
        "error": [Error: (unspecified)],
        "message": "(unspecified)",
      }
    `)
  })
})

describe("map", () => {
  describe("with a type-preserving function", () => {
    test("Some", () => {
      let some = Some(1)
      let result = some.map(value => value + 1)
      expect(result).toBeInstanceOf(Some)
      expectTypeOf(result).toMatchTypeOf<Some<number>>()
      expect(result.value).toBe(2)
    })

    test("None", () => {
      let none = None()
      let result = none.map(value => value + 1)
      expect(result).toBeInstanceOf(None)
      expectTypeOf(result).toMatchTypeOf<None>()
    })

    test("Fail", () => {
      let fail = Fail("error")
      let result = fail.map(value => value + 1)
      expect(result).toBeInstanceOf(Fail)
      expectTypeOf(result).toMatchTypeOf<Fail>()
    })
  })

  describe("with a type-modifying function", () => {
    test("Some", () => {
      let some = Some(1)
      let result = some.map(value => String(value))
      expect(result).toBeInstanceOf(Some)
      expectTypeOf(result).toMatchTypeOf<Some<string>>()
      expect(result.value).toBe("1")
    })

    test("None", () => {
      let none = None()
      let result = none.map(value => String(value))
      expect(result).toBeInstanceOf(None)
      expectTypeOf(result).toMatchTypeOf<None>()
    })

    test("Fail", () => {
      let fail = Fail("some error")
      let result = fail.map(value => String(value))
      expect(result).toBeInstanceOf(Fail)
      expect(result.message).toBe("some error")
      expectTypeOf(result).toMatchTypeOf<Fail>()
    })
  })
})

describe("narrowing", () => {
  describe("EDGE CASES WHICH DO NOT WORK", () => {
    test("arrays of true unions", () => {
      let as_union = [Some(1 + 0), None(), Some(2 + 0)]
      let first_of_union = as_union[0]
      if (first_of_union.is(Some)) {
        expectTypeOf(first_of_union).toMatchTypeOf<Some<number>>()
      }

      let as_maybe: Maybe<number>[] = as_union
      let first_of_maybe = as_maybe[0]
      if (first_of_maybe.is(Some)) {
        expectTypeOf(first_of_maybe).toMatchTypeOf<Some<number>>()
      }
    })
  })

  test("Nebulous to Nebulous", () => {
    let nebulous = Nebulous(1)
    if (nebulous.is(Nebulous)) {
      expectTypeOf(nebulous).toMatchTypeOf<Nebulous<number>>()
      expect(nebulous).toBeInstanceOf(Some)
    } else {
      expect.unreachable()
    }
  })

  test("Nebulous to Maybe", () => {
    let nebulous = Nebulous(1)
    if (nebulous.is(Maybe)) {
      expectTypeOf(nebulous).toMatchTypeOf<Maybe<number>>()
      expect(nebulous).toBeInstanceOf(Some)
    } else {
      expect.unreachable()
    }
  })

  test("Nebulous to Result", () => {
    let nebulous = Nebulous(1)
    if (nebulous.is(Result)) {
      expectTypeOf(nebulous).toMatchTypeOf<Result<number>>()
      expect(nebulous).toBeInstanceOf(Some)
    } else {
      expect.unreachable()
    }
  })

  test("Nebulous to Some", () => {
    let nebulous = Nebulous(1)
    if (nebulous.is(Some)) {
      expectTypeOf(nebulous).toMatchTypeOf<Some<number>>()
      expect(nebulous).toBeInstanceOf(Some)
    } else {
      expect.unreachable()
    }
  })

  test("Nebulous to None", () => {
    let nebulous = Nebulous(undefined)
    if (nebulous.is(None)) {
      expectTypeOf(nebulous).toMatchTypeOf<None>()
      expect(nebulous).toBeInstanceOf(None)
    } else {
      expect.unreachable()
    }
  })

  test("Maybe to Some", () => {
    let maybe = Maybe(1)
    if (maybe.is(Some)) {
      expectTypeOf(maybe).toMatchTypeOf<Some<number>>()
    } else {
      expect.unreachable()
    }
  })

  test("Maybe to None", () => {
    let maybe: Maybe<number> = None()
    if (maybe.is(None)) {
      expectTypeOf(maybe).toMatchTypeOf<None>()
    } else {
      expect.unreachable()
    }
  })

  test("Result to Some", () => {
    let result: Result<number> = Some(1)
    if (result.is(Some)) {
      expectTypeOf(result).toMatchTypeOf<Some<number>>()
    } else {
      expect.unreachable()
    }
  })

  test("Result to Fail", () => {
    let result: Result<number> = Fail()
    if (result.is(Fail)) {
      expectTypeOf(result).toMatchTypeOf<Fail>()
    } else {
      expect.unreachable()
    }
  })

  test("Maybe to Some", () => {
    let maybe: Maybe<number> = Some(1)
    if (maybe.is(Some)) {
      expectTypeOf(maybe).toMatchTypeOf<Some<number>>()
    } else {
      expect.unreachable()
    }
  })

  test("Maybe to None", () => {
    let maybe: Maybe<number> = None()
    if (maybe.is(None)) {
      expectTypeOf(maybe).toMatchTypeOf<None>()
    } else {
      expect.unreachable()
    }
  })

  test("Result to Some", () => {
    let result: Result<number> = Some(1)
    if (result.is(Some)) {
      expectTypeOf(result).toMatchTypeOf<Some<number>>()
    } else {
      expect.unreachable()
    }
  })

  test("Result to Fail", () => {
    let result: Result<number> = Fail()
    if (result.is(Fail)) {
      expectTypeOf(result).toMatchTypeOf<Fail>()
    } else {
      expect.unreachable()
    }
  })
})

describe("Maybe", () => {
  let array: Maybe<number>[] = [Some(1), None(), Some(2)]

  test("has the expected type", () => {
    expectTypeOf(array).toMatchTypeOf<Array<Maybe<number>>>()
  })

  test("can be mapped (type-preserving)", () => {
    let add_one = (value: number) => value + 1
    let result = array.map(value => value.map(add_one))
    expect(result).toMatchObject([Some(2), None(), Some(3)])
    expectTypeOf(result).toMatchTypeOf<Array<Maybe<number>>>()
  })

  test("can be mapped (type-modifying)", () => {
    let stringify = (value: number) => String(value)
    let result = array.map(value => value.map(stringify))
    expect(result).toMatchObject([Some("1"), None(), Some("2")])
    expectTypeOf(result).toMatchTypeOf<Array<Maybe<string>>>()
  })
})

describe("Result", () => {
  let array: Result<number>[] = [Some(1), Fail(), Some(2)]

  test("has the expected type", () => {
    expectTypeOf(array).toMatchTypeOf<Array<Result<number>>>()
  })

  test("can be mapped (type-preserving)", () => {
    let add_one = (value: number) => value + 1
    let result = array.map(value => value.map(add_one))
    expect(result).toMatchObject([Some(2), Fail(), Some(3)])
    expectTypeOf(result).toMatchTypeOf<Array<Result<number>>>()
  })

  test("can be mapped (type-modifying)", () => {
    let stringify = (value: number) => String(value)
    let result = array.map(value => value.map(stringify))
    expect(result).toMatchObject([Some("1"), Fail(), Some("2")])
    expectTypeOf(result).toMatchTypeOf<Array<Result<string>>>()
  })
})

describe("error behaviour", () => {
  test("constructing a Some of null or undefined", () => {
    // @ts-expect-error
    expect(() => Some(undefined)).toThrow(TypeError)
    // @ts-expect-error
    expect(() => Some(null)).toThrow(TypeError)
  })
})
