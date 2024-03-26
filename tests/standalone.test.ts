import { fc, test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf } from "vitest"

import { constructors } from "../lib.js"
const { Maybe, Result, Some, None, Fail } = constructors

const S = Some
const M = Maybe
const R = Result

describe("join and flatten", () => {
  describe("Some", () => {
    const some_some_somes = [
      Some(1),
      Some(Some(2)),
      Some(Some(Some(3))),
    ] as Some<Some<Some<number>>>[]

    test("join", () => {
      const result = some_some_somes.map(S.join())
      expectTypeOf(result).toMatchTypeOf<Some<Some<number>>[]>()
      expect(result).toEqual([Some(1), Some(2), Some(Some(3))])
    })

    test("flatten", () => {
      const result = some_some_somes.map(S.flatten())
      expectTypeOf(result).toMatchTypeOf<Some<number>[]>()
      expect(result).toEqual([Some(1), Some(2), Some(3)])
    })
  })

  describe("Maybe", () => {
    const maybe_maybe_maybes = [
      Maybe(),
      Maybe(1),
      Maybe(Maybe(2)),
      Maybe(Maybe(Maybe(3))),
    ] as Maybe<Maybe<Maybe<number>>>[] // not strictly true...

    test("join", () => {
      const result = maybe_maybe_maybes.map(M.join())
      expectTypeOf(result).toMatchTypeOf<Maybe<Maybe<number>>[]>()
      expect(result).toEqual([None(), Some(1), Some(2), Some(Some(3))])
    })

    test("flatten", () => {
      const result = maybe_maybe_maybes.map(M.flatten())
      expectTypeOf(result).toMatchTypeOf<Maybe<number>[]>()
      expect(result).toEqual([None(), Some(1), Some(2), Some(3)])
    })
  })

  describe("Result", () => {
    const result_result_results = [
      Result(),
      Result(1),
      Result(Result(2)),
      Result(Result(Result(3))),
    ] as Result<Result<Result<number>>>[] // not strictly true...

    test("join", () => {
      const result = result_result_results.map(R.join())
      expectTypeOf(result).toMatchTypeOf<Result<Result<number>>[]>()
      expect(result).toEqual([Fail(), Some(1), Some(2), Some(Some(3))])
    })

    test("flatten", () => {
      const result = result_result_results.map(R.flatten())
      expectTypeOf(result).toMatchTypeOf<Result<number>[]>()
      expect(result).toEqual([Fail(), Some(1), Some(2), Some(3)])
    })
  })
})

describe("map", () => {
  test("Some", () => {
    const somes = [Some(1), Some(2)] as Some<number>[]

    const stringify = S.map((n: number) => String(n))
    const result = somes.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Some<string>[]>()
    expect(result).toEqual([Some("1"), Some("2")])
  })

  test("Maybe", () => {
    const maybes = [Maybe(), Maybe(1), Maybe(2)] as Maybe<number>[]

    const stringify = M.map((n: number) => String(n))
    const result = maybes.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Maybe<string>[]>()
    expect(result).toEqual([None(), Some("1"), Some("2")])
  })

  test("Result", () => {
    const results = [Result(), Result(1), Result(2)] as Result<number>[]

    const stringify = R.map((n: number) => String(n))
    const result = results.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Result<string>[]>()
    expect(result).toEqual([Fail(), Some("1"), Some("2")])
  })
})

describe("chain", () => {
  test("Some", () => {
    const somes = [Some(1), Some(2)] as Some<number>[]

    const stringify = S.chain((n: number) => S(String(n)))
    const result = somes.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Some<string>[]>()
    expect(result).toEqual([Some("1"), Some("2")])
  })

  test("Maybe", () => {
    const maybes = [Maybe(), Maybe(1), Maybe(2)] as Maybe<number>[]

    const stringify = M.chain((n: number) => Maybe(String(n)))
    const result = maybes.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Maybe<string>[]>()
    expect(result).toEqual([None(), Some("1"), Some("2")])
  })

  test("Result", () => {
    const results = [Result(), Result(1), Result(2)] as Result<number>[]

    const stringify = R.chain((n: number) => Result(String(n)))
    const result = results.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Result<string>[]>()
    expect(result).toEqual([Fail(), Some("1"), Some("2")])
  })
})

describe("ap", () => {
  test("Some", () => {
    const somes = [Some(1), Some(2)] as Some<number>[]

    const stringify = S.ap(S((n: number) => String(n)))
    const result = somes.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Some<string>[]>()
    expect(result).toEqual([Some("1"), Some("2")])
  })

  test("Maybe", () => {
    const maybes = [Maybe(), Maybe(1), Maybe(2)] as Maybe<number>[]

    const stringify = M.ap(Maybe((n: number) => String(n)))
    const result = maybes.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Maybe<string>[]>()
    expect(result).toEqual([None(), Some("1"), Some("2")])
  })

  test("Result", () => {
    const results = [Result(), Result(1), Result(2)] as Result<number>[]

    const stringify = R.ap(Result((n: number) => String(n)))
    const result = results.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Result<string>[]>()
    expect(result).toEqual([Fail(), Some("1"), Some("2")])
  })
})

describe("traverse", () => {
  test("Some", () => {
    const somes = [Some(1), Some(2)] as Some<number>[]

    const result = somes
      .map(S.traverse((n: number) => Some(String(n))))
      .map(S.flatten())

    expectTypeOf(result).toMatchTypeOf<Some<string>[]>()
    expect(result).toEqual([Some("1"), Some("2")])
  })

  test("Maybe", () => {
    const maybes = [Maybe(), Maybe(1), Maybe(2)] as Maybe<number>[]

    const result = maybes
      .map(M.traverse((n: number) => Maybe(String(n))))
      .map(M.flatten())

    expectTypeOf(result).toMatchTypeOf<Maybe<string>[]>()
    expect(result).toEqual([None(), Some("1"), Some("2")])
  })

  test("Result", () => {
    const results = [Result(), Result(1), Result(2)] as Result<number>[]

    const result = results
      .map(R.traverse((n: number) => Result(String(n))))
      .map(R.flatten())

    expectTypeOf(result).toMatchTypeOf<Result<string>[]>()
    expect(result).toEqual([Fail(), Some("1"), Some("2")])
  })
})

describe("fold", () => {
  test("Some", () => {
    const somes = [Some(1), Some(2)] as Some<number>[]

    const fold = S.fold(
      value => String(value),
    )

    const result = somes
      .map(fold)
      .reduce((a, b) => a + b, "")

    expectTypeOf(result).toMatchTypeOf<string>()
    expect(result).toBe("12")
  })

  test("Maybe", () => {
    const maybes = [Maybe(), Maybe(1), Maybe(2)] as Maybe<number>[]

    const fold = M.fold(
      value => String(value),
      () => "boop",
    )

    const result = maybes
      .map(fold)
      .reduce((a, b) => a + b, "")

    expectTypeOf(result).toMatchTypeOf<string>()
    expect(result).toBe("boop12")
  })

  test("Result", () => {
    const results = [Result("boo"), Result(1), Result(2)] as Result<number>[]

    const fold = R.fold(
      value => String(value),
      error => error.message,
    )

    const result = results
      .map(fold)
      .reduce((a, b) => a + b, "")

    expectTypeOf(result).toMatchTypeOf<string>()
    expect(result).toBe("boo12")
  })
})

describe("match", () => {
  test("Maybe", () => {
    const maybes = [Maybe(), Maybe(1), Maybe(2)] as Maybe<number>[]

    const result = maybes.map(M.match({
      Some: n => String(n),
      None: () => "boop",
    }))

    expectTypeOf(result).toMatchTypeOf<string[]>()
    expect(result).toEqual(["boop", "1", "2"])
  })

  test("Result", () => {
    const results = [Result(null, new Error("oh nooo")), Result(1), Result(2)] as Result<number>[]

    const result = results.map(R.match({
      Some: n => String(n),
      Fail: e => e.message,
    }))

    expectTypeOf(result).toMatchTypeOf<string[]>()
    expect(result).toEqual(["oh nooo", "1", "2"])
  })
})

describe("calling the standalone functions directly", () => {
  test("Some", () => {
    const maybe = Maybe(1)
    expectTypeOf(maybe).toMatchTypeOf<Maybe<number>>()

    const mapped = M.map((n: number) => String(n))(maybe)
    expectTypeOf(mapped).toMatchTypeOf<Maybe<string>>()

    assert(Some.isa()(maybe))
    expectTypeOf(maybe).toMatchTypeOf<Some<number>>()
  })
})
